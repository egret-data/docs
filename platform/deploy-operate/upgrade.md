---
sidebar_position: 7
---

# Upgrades and migrations

How to move an Egret deployment to a newer version, how database migrations behave, and what to check afterwards. Back up
the metadata database first; see [Backup and restore](./backup-restore).

## How migrations work

Egret keeps its schema as numbered SQL files in the repository's `migrations/` directory (199 of them at the time of
writing, `0001_init.sql` to `0199_audit_mutation_index.sql`). They are compiled into the `egret` binary and applied with
`sqlx`. The applied versions and a checksum of each are recorded in the table `_sqlx_migrations` in the metadata database.

| Property | What it means for you |
|---|---|
| **Forward only** | There are no down migrations. The way back is a restore from backup. |
| **Applied automatically** | `egret serve` runs pending migrations at boot. `egret migrate`, `egret init` and `egret workspace` run them too. |
| **Compiled in** | A binary carries exactly the migrations that existed when it was built. |
| **Verified** | Each applied migration is checked against its recorded checksum on every run. |

Because `serve` migrates at boot, **starting the new version is the upgrade**. To migrate before any traffic, run `egret
migrate` once with the new binary and then roll out the servers.

### What the server does when the database does not match

These refusals were reproduced against a copy of a database:

| Situation | Message | What to do |
|---|---|---|
| The database is **newer** than the binary (you started an older version) | `migration 9999 was previously applied but is missing in the resolved migrations` | Run the newer binary, or restore a backup taken before the upgrade. Do not delete rows from `_sqlx_migrations`. |
| A migration file changed after it was applied | `migration 1 was previously applied but has been modified` | Use the release's own migration files. A modified migration is a build or packaging error. |
| The database is unreachable or the password is wrong | `error returned from database: password authentication failed for user "egret"` | Fix `EGRET_DATABASE__URL`. |

A first migration of a fresh database applies all 199 files and takes about 15 seconds.

:::note Branch builds and migration numbers
Migration numbers are a shared namespace. If you build from a long-lived branch that added a migration with a number
`main` later used for something else, `migrate` fails. Deploy released builds, not branches, to shared environments.
:::

## Upgrade procedure

1. **Read the release notes** of every version between yours and the target for configuration changes. New keys have
   defaults, but a key whose default changed, or a new required key, stops the server at boot with a message naming it (see
   [Startup checks](../reference/configuration-keys#startup-checks)).
2. **Back up the metadata database.** Take the dump before you stop anything.
3. **Stop or drain the old servers.** The server drains in-flight requests for up to 55 seconds on shutdown; allow at least
   65 seconds before the process is killed (the Helm chart sets `terminationGracePeriodSeconds: 65`).
4. **Start the new version.** With one replica, start it and watch the log for `migrations applied`. With several replicas,
   run `egret migrate` once first.
5. **Check health.** `GET /readyz` answers `{"status":"ok","db":"up"}` once the database answers. Sign in, open a dashboard,
   run a query.
6. **Check the workflow worker and scheduler** are still enabled (`EGRET_WORKFLOW__WORKER_ENABLED`,
   `EGRET_WORKFLOW__SCHEDULER_ENABLED`); they are off by default and a rebuilt environment loses them silently.

### With the Helm chart

```bash
helm upgrade egret deploy/helm/egret -n egret-system -f my-values.yaml
```

The chart looks up the existing `egret-secrets` Secret, so the master key, the cookie key and the catalog token are kept
across upgrades. The `egret-init` hook runs again after every upgrade; it does nothing when an administrator already exists.
Pods are not restarted when only an image's contents change under an unchanged tag: roll them explicitly
(`kubectl rollout restart deploy/egret -n egret-system`) or use a new tag. Not run locally; see [Kubernetes](./kubernetes).

## Moving engines to a new version

Upgrading Egret does not change the engines it provisioned: each keeps the image it was created with. Change an engine's
image with `PUT /api/control-plane/engines/{id}`; this **restarts the engine's pods**, so the engine is unavailable while they
roll. Egret models policy evaluation only for measured (engine, plugin) pairs, so pin images to the versions listed in
[Engines and Ranger setup](./engines-and-ranger) and never move a StarRocks front end back to an older version: its metadata
may not start on it.

## Version-specific notes

These come from the repository's Helm chart README and apply to the releases that introduced them.

### The bundled object store is RustFS, not MinIO

MinIO withdrew its public images, so the bundled S3 server is now RustFS, and the Service, Deployment, claim and values were
renamed (`deps.minio.*` became `deps.rustfs.*`, `mcImage` became `clientImage`). RustFS cannot read MinIO's data format, so
**upgrading an existing dev release starts with an empty bucket**: Iceberg data files, query results, workflow files and Data
Apps sources are not carried over, and catalog rows in PostgreSQL that point at them are left dangling. Reinstall or reseed
instead of upgrading in place. Engines provisioned earlier keep `http://minio...:9000` in their catalog properties and
storage connections; re-create the storage connection with the new endpoint and re-apply the catalogs, or re-provision.

### StarRocks front-end metadata is persistent only for new engines

Engines created from the release that added it get a persistent volume for the front end's metadata. Existing engines keep
the operator's `emptyDir` and are left exactly as they are: the volume claim template of a StatefulSet is immutable, so
changing it would park the cluster in a failed state. To get persistence, create a **new** engine and point at it. Migrating
an existing engine by hand destroys its front end's metadata (catalogs, StarRocks-side users and grants); the chart README
lists what is lost and what recovers it.

### StarRocks 4.1.6 enforces view privileges

See [Engines and Ranger setup](./engines-and-ranger#supported-versions).

## Rolling back

There is no supported in-place rollback. Restore the database from the backup taken in step 2, then start the previous
binary. Object storage is not changed by migrations, but files written by the newer version stay in the bucket.

## Further reading

- [Backup and restore](./backup-restore)
- [Configuration keys](../reference/configuration-keys)
