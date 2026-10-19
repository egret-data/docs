---
sidebar_position: 8
---

# Backup and restore

What to back up for an Egret deployment, how to back up and restore the metadata database, and how to check a restore.

## What holds state

| State | Where | Back it up? |
|---|---|---|
| Everything Egret owns: users, groups, roles, grants, workspaces, connections, datasets, charts, dashboards, flows, executions, policies, the audit log, and the embedded catalog's table metadata | The PostgreSQL metadata database (`EGRET_DATABASE__URL`) | **Yes. This is the backup.** |
| Stored credentials | Encrypted inside the database with `EGRET_SECRETS__MASTER_KEY` | The database **and the master key**, kept separately |
| Iceberg data files, stored query results, workflow files, Data Apps sources | The object-store bucket (`EGRET_STORAGE__BUCKET`) | Yes, with your object store's own tooling (replication, versioning or snapshots) |
| Cookie and session key | `EGRET_SECURITY__SECRET_KEY` | Keep it with your secrets, but losing it only signs everyone out |
| Configuration | `egret.toml` and environment | Keep in version control, without secrets |
| Data in Trino or StarRocks | The engines and the object store | Egret does not back it up |
| Valkey (shared store) | Rate-limit buckets and a response cache | No: it can be rebuilt |

The database and the bucket belong together: the catalog's rows in PostgreSQL point at files in the bucket. Restore them
from the same moment, or accept dangling references.

:::danger Back up the master key, or the encrypted credentials are lost
Connection passwords and storage secrets are encrypted with `EGRET_SECRETS__MASTER_KEY`. A restored database with a
different key keeps the rows but cannot read the secrets. Store the key in your secret manager, apart from the dump.
:::

## Back up the database

Use PostgreSQL's own tools. A custom-format dump is compact and restores selectively:

```bash
pg_dump --format=custom --file=egret-$(date +%F).dump "postgres://egret:...@db.internal:5432/egret"
```

For the development compose stack, run `pg_dump` inside the container:

```bash
docker exec egret-dev-postgres-1 pg_dump -U egret -Fc egret > egret.dump
```

Run the dump while Egret is running: it is a consistent snapshot. For point-in-time recovery, use continuous archiving
(WAL) as for any PostgreSQL production database; Egret has no special requirements.

In Kubernetes with the bundled PostgreSQL the data lives on a 1 GiB `postgres-data` claim that the chart does not back up.
Use an external managed PostgreSQL in production.

## Restore

1. Stop the Egret servers so nothing writes during the restore.
2. Create an empty database and restore into it:

   ```bash
   createdb -h db.internal -U egret egret_restored
   pg_restore --no-owner --dbname="postgres://egret:...@db.internal:5432/egret_restored" egret.dump
   ```

   For the compose stack:

   ```bash
   docker exec egret-dev-postgres-1 psql -U egret -d postgres -c 'CREATE DATABASE egret_restored'
   cat egret.dump | docker exec -i egret-dev-postgres-1 pg_restore -U egret -d egret_restored --no-owner
   ```

3. Point `EGRET_DATABASE__URL` at the restored database and set the **original** `EGRET_SECRETS__MASTER_KEY`.
4. Start the server **of the same version** the dump came from, or a newer one. Newer versions apply any missing migrations at
   boot. An older binary refuses a newer database; see [Upgrades and migrations](./upgrade).
5. Check the restore (below).

## Checking a restore

This was done for these docs on a database created with `egret migrate` and `egret init`: dump, restore into a new database,
and compare.

```bash
psql "$RESTORED_URL" -Atc "select count(*) from users"                       # 1
psql "$RESTORED_URL" -Atc "select count(*) from _sqlx_migrations"            # 199, same as the source
egret migrate                                                                # applies nothing and exits with "migrations applied"
```

Then sign in and check that:

- a dashboard opens and its charts run (the engine connections work);
- a connection that uses a secret still tests successfully (the master key is right);
- `GET /readyz` answers `{"status":"ok","db":"up"}`.

## Disaster recovery checklist

1. Recreate the PostgreSQL instance and restore the latest dump.
2. Recreate the bucket and restore its contents, or accept that the data-file references are dangling.
3. Restore the configuration and secrets, **including `EGRET_SECRETS__MASTER_KEY`**.
4. Start Egret, check `/readyz`, and sign in with the break-glass administrator if SSO is not reachable yet.
5. Re-enable the workflow worker and scheduler if your configuration did not carry them.
6. Re-attach engines whose pods were lost; see [Query engines](../control-plane/query-engines).

## Further reading

- [Upgrades and migrations](./upgrade)
- [Security hardening checklist](./security-hardening)
