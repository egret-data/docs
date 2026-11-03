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
(`kubectl rollout restart deploy/egret -n egret-system`) or use a new tag. Not run for these docs, which had no Kubernetes
cluster; see [Kubernetes](./kubernetes).

### The demo stack

The [demo stack](../get-started/run-the-demo-stack) is upgraded by rebuilding it from the new source: `git pull`, then
`just demo-up` (it runs `docker compose up -d --build`). Migrations run when the Egret container starts, and the data volumes are
kept. Engines started with **Add engine** keep their containers only while the stack is up: after `just demo-down` and
`just demo-up` they stay listed as `provisioning` with no containers, so delete and add them again. Not run for these docs.

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

### Usernames are never reused (migration 0209)

From platform #741 a deleted user's engine username is retired for good (see
[Users](../control-plane/access-control/users.md#what-a-retired-username-means)). Migration `0209_username_ledger.sql`
records every username in use and every name that a policy, grant, rule or retained governance event names, in the
append-only table `username_ledger`.

Upgrading retires every username that a policy, grant, rule or retained governance event names but no user holds. A
hand-written policy that named someone who had not signed in yet will not apply to them: they are given another name (for
example `alice-2`). **Governance → People & groups → Reused names** lists such names as dead. Rewrite those policies to the
name the person was given.

After the upgrade, a platform admin should open **Reused names** and the Governance overview once: they report places
where a deleted user's name was already given to someone else before the upgrade. At its first start the new version also
rewrites the engines' `egret-admin` policies to the active platform admins, so disabled admins lose engine all access. The
ledger is data; see [Backup and restore](./backup-restore#the-username-ledger) before restoring data only.

### StarRocks enforces whole-table classifications (platform #755)

From platform #755 a classification on a whole table is enforced on StarRocks: a clearance compiles a select deny on the
table and a NULL mask per column, and a row filter by classification filters the table (see
[Clearance](../data-governance/classifications/clearance#on-columns-or-on-a-whole-table)). There is no migration. At its
first start the new version recompiles each StarRocks profile that reaches such a classification, and the plugins download
the new policies once.

After the upgrade, open the Governance overview once. A profile whose recompile was refused, for example because a newly
reached table makes two row filters by classification decide it differently, keeps its previous compile and shows as
**Profile compile failed**, naming the rules. Edit or delete one of them. `GET /api/control-plane/perm/overlaps` lists only
pairs that were already stored. A table change that would push a clearance over its ceiling is now refused at the Iceberg
commit.

### Classifications follow a renamed table (platform #757)

From platform #757 a rename of a classified table or column through egret's Iceberg catalog moves its classifications to the
new name, and is held until the engines serve them: up to 90 seconds, about two policy polls with StarRocks bound. An Iceberg
client that renames tables must wait that long; Trino does. A bound engine whose plugins do not poll makes these renames fail
with a 409, and SQL Lab stops waiting at its 60-second query limit (`engine.query_timeout_secs`) first (KI-310). Unclassified
renames and every other request are unchanged. There is no migration.

Classifications that earlier renames left on old names are not moved. After the upgrade, open the Governance overview and
check *classifications on tables that do not exist* and *classifications on columns that do not exist*. Attach each
classification to the new name and remove it from the old one. See
[Renames and drops](../data-governance/classifications/tagging#renames-and-drops).

### Catalog renames and commits are authorized by their tables (platform #758)

From platform #758 egret's Iceberg catalog decides a rename, a commit and a recursive namespace drop on the tables they
change. There is no migration and no API change. Engines provisioned by egret hold `catalog · manage` and are not affected;
Trino's creates, writes, renames and drops were checked. A Catalog Client with narrower grants may now be refused calls it
could make before:

- a rename needs `write` on the source table and a `catalog` or `namespace` grant on the destination namespace (a grant on
  the destination table name no longer suffices);
- a multi-table commit needs `write` on every table in it;
- a recursive namespace drop needs a `catalog`-level `write` or `manage` grant;
- remote S3 signing is refused with 403.

Grants now match names case-insensitively, as the catalog does, so two grants that differ only in case are the same grant.
A role reaches no table it could not already reach by spelling the name as its grant does. Refusals are Iceberg JSON errors, and rename and commit bodies are
limited to 1 MiB and 16 MiB (413). See
[What each operation needs](../control-plane/catalogs/catalog-detail#what-each-operation-needs).

### Vended credentials follow catalog grants (platform #760)

From platform #760 the S3 credentials egret's Iceberg catalog vends on a table load follow the client's grant. There is no
migration and no API change.

- A role with only a `read` grant covering the table (on the table, its namespace or the catalog) gets read-only credentials
  (`s3:GetObject`, `s3:GetObjectVersion`). Before, every client that could load a table got read-write-delete credentials on
  its files, even without the `X-Iceberg-Access-Delegation` header (KI-311).
- `write` and `manage` still get read-write-delete. The same rule applies on `…/tables/{t}/credentials`. View loads stay
  read-only.
- **Behaviour change:** an engine or client that uses a Catalog Client with only `read` grants can still read, but it can no
  longer write or delete table files. Its writes now fail at the object store with *access denied* (PyIceberg:
  `ACCESS_DENIED during CreateMultipartUpload`) instead of reaching the catalog. If such an engine is meant to write, give its
  role `write` or `manage`.
- Engines provisioned by egret hold `catalog · manage` and are not affected; Trino's creates, inserts, updates, deletes,
  renames and drops were checked.
- Credentials vended before the upgrade, read-write-delete ones handed to readers included, stay valid until they expire,
  about an hour after they were issued (KI-315).

See [Storage credentials follow the grant](../control-plane/catalogs/catalog-detail#storage-credentials-follow-the-grant).

### Grants, rules and catalog grants follow a renamed table (platform #764)

From platform #764 a rename of a table or column through egret's Iceberg catalog carries its permissions. There is no
migration and no API change.

- Deny grants, path masks and path row filters are copied to the new name before the commit, and the originals stay on the
  old name on purpose. Such renames are held like classified ones, now waiting for Trino's policy version too: 54 to 57
  seconds were measured with both engines bound, at most 90 seconds (KI-310). An Iceberg client that renames these tables
  must wait that long; from SQL Lab a hold over 60 seconds shows a timeout although the rename goes through (since platform
  #805 the timeout message says so).
- Allow grants move to the new name after the commit. A holder can be refused on the new name until the engines' next policy
  polls (KI-317).
- Catalog grants on the table move to the new name after the commit, for every rename.
- **Behaviour change:** a rename is refused with a 409 that names the rows when a deny, mask or row filter written with a
  pattern covers the old name and not the new one, or when an enabled hand-written policy names the table with a deny, mask,
  row filter or exclusion list. Change the pattern or add the restriction on the new name, or edit the policy, then rename.
- A grant or rule write on a table name that a rename is holding is refused with 409 `table_change_held`; retry it.
- A recursive namespace drop now also deletes the allow grants on its tables and the catalog grants on tables under it.

Grants, rules and catalog grants that earlier renames left on old names are not moved. After the upgrade, open the
Governance overview and check *permissions on tables that do not exist*, *permissions on columns that do not exist* and
*catalog grants on tables that do not exist*. Write each row on the new name and delete the old one. The overview also lists
the restrictions renames now keep on old names on purpose; remove those you no longer need. See
[Renames and drops](../data-governance/data/grants#renames-and-drops).

### StarRocks 4.1.6 enforces view privileges

See [Engines and Ranger setup](./engines-and-ranger#supported-versions).

### StarRocks refuses SELECT * on masked tables (platform #766)

From platform #766 a StarRocks table with a mask refuses `SELECT *` to a reader who does not see the real value in every
masked column, because the table's hidden `_file` column would show the object-store path of each data file (KI-304).

- **Behaviour change:** that reader gets error 5204 on `_file` instead of the rows. Name the columns, or read through a view,
  which shows no path.
- There is no migration and no API change. An existing masked table gets its deny on the next compile of its profile. To
  apply it at once, run `POST /api/control-plane/perm/compile/{profile_id}`.
- A mask on a table selected by a wildcard or an excluded name gets no deny. That gap stays open (KI-304).

### Profiles get a tag service from the console (platform #805)

From platform #805 a Trino policy profile can be given a tag service in the console, at creation or later on its
**Advanced** tab, through `PUT /api/control-plane/policies/services/{service}/tag-service`. There is no migration.

- **API change:** `GET /api/control-plane/policies/services/{service}/trino-config` answers `{"files": [...], "warnings":
  [...]}` instead of a bare array of files. A script that read the array must read `files`.
- The engine pickers no longer offer a Trino profile with no tag service. Give such a profile one before you bind it.
- A SQL Lab timeout on a schema change says that the change may still complete (KI-318).

### Namespace creates, listings and body deadline in the Iceberg catalog (platform #806)

From platform #806 egret's Iceberg catalog decides a namespace create on its parent, cuts listings to what the role can
see, and limits the time a request body may take. There is no migration and no API change. Engines provisioned by egret
hold `catalog · manage` and are not affected. A Catalog Client with narrower grants may now see:

- a 403 creating a namespace: it needs `write` or `manage` on the parent namespace, or a `catalog`-level grant for a
  top-level namespace (before, any `write` grant created any namespace);
- shorter answers from `GET …/namespaces`, `…/namespaces/{ns}/tables` and `…/views`: only what the role can see. A page
  can be short or empty while `next-page-token` still points on; Iceberg clients follow the token;
- a 408 when a request body has not fully arrived 30 seconds after the request;
- a 409 creating a warehouse whose S3 storage overlaps an existing one, even when the endpoint is written differently
  (KI-316).

### Platform admins held through groups (platform #807)

From platform #807 the last active platform admin is guarded on every path, and the console shows roles held through a
group. There is no migration.

- **Behaviour change:** removing a member from a group, deleting a group and `PUT /api/admin/users/{id}/platform-roles` now
  answer 409 *Cannot remove the last active platform admin* when they would leave no active platform admin.
- The OIDC group sync keeps a membership that is the last active platform admin's only hold on `platform_admin`, and logs a
  warning (*kept the OIDC group membership that is the last active platform admin's only hold on platform_admin; make
  another user a platform admin, then the next sync drops it*). Make someone else a platform admin, and the next sync drops
  it.
- **API addition:** the Control Plane user list carries `effectiveRoles` (`[{"name", "group"}]`, `group` null for a direct
  grant); `roles` stays the directly granted set.

### Manual tag policies the engines apply (platform #809)

From platform #809 a classification's **Manual policies** tab lists every hand-written tag policy the engines apply to
the classification's name, including one whose pattern does not match it: Ranger picks tag policies by the text before
the first `*`, `?` or `{`, so `*i` applies to every tag. Such a row carries **Wider than its pattern** (see
[Manual policies](../data-governance/classifications/index.md#manual-policies)). There is no migration and nothing changes
on the engines: they applied these policies before too.

- **API addition:** each row of `GET /api/control-plane/classifications/{id}/handwritten` carries
  `widenedByEngine` and `engineTagPrefix` (`""` means every tag).

### Permission follow-ups (platform #810)

From platform #810 there is no migration, and no request or response shape changes.

- The start-up recompile of profiles that name a role is retried after 5 s, 30 s and 2 min, and logs an error when every
  attempt fails (see [Platform admins on the engines](./engines-and-ranger.md#platform-admins-on-the-engines)).
- Renaming or deleting a local group checks **policy:read** only when the change is refused because something names the
  group. A change that nothing refuses no longer depends on that check.
- Editing a grant or a rule while someone else edits the same one answers 409 less often: egret re-reads the row once it
  holds the locks, and refuses only when the change no longer fits.
- `PATCH` and `DELETE` on `/api/control-plane/perm/grants/{id}` and `/perm/rules/{id}`, and
  `GET /api/control-plane/perm/rules/{id}/effect`, answer 404 for a grant or rule outside the caller's workspace, the
  same answer as for an id that does not exist.
- A platform-scope `platform_admin` grant that has expired, or whose effect is `deny`, no longer counts for the engines'
  `egret-admin` policies or the last-admin guard (KI-322), and a `deny` grant no longer gives the session its role
  (KI-323). No API writes such grants, so existing installs see no change.

### Deny and expired grants give no role (platform #811)

From platform #811 every check that asks whether a grant gives its role counts only a live `allow` grant: one with no
expiry, or an expiry in the future. There is no migration and no API shape change.

- A principal whose only grant in a workspace is a `deny` is refused there (403) and the workspace switcher does not list
  it. Before, it was admitted.
- **Behaviour change:** removing or demoting a workspace's last admin answers 409 *the workspace must keep at least one
  admin* when the only other `ws_admin` rows have lapsed or are `deny`. Before, those rows counted as admins.
- The member list's platform-admin badge, the console's effective platform roles and `egret init`'s check that an admin
  exists count only live `allow` grants (KI-329 to KI-331).

### Vended credentials last 15 minutes (platform #812)

From platform #812 the S3 credentials egret's Iceberg catalog vends are valid for 15 minutes instead of an hour. There is
no migration.

- **New key:** `catalog.sts_token_validity_seconds` (`EGRET_CATALOG__STS_TOKEN_VALIDITY_SECONDS`), default 900, from 900
  to 43200. A value outside that range stops the server at start. See
  [Configuration keys](../reference/configuration-keys#catalog).
- At start, egret writes the lifetime into every S3 warehouse the catalog already holds, and logs it:

```text
vended credential lifetime seconds=900 warehouses_changed=1
```

- Credentials handed out before the upgrade stay valid until their own expiry, up to an hour (KI-315).
- An engine that loads a table again gets fresh credentials. Trino was checked reading and writing past the 15 minutes;
  StarRocks was not checked.

### Writes refused when the profile set grows (platform #813)

From platform #813 a write that recompiles policy profiles is refused, and writes nothing, when an engine is bound to
another profile while it runs. There is no migration.

- **API change:** a clearance change, a classification added to or removed from a catalog object, a classification
  delete, and grant and rule writes under `/api/control-plane/perm` can answer 409 with `"code": "profile_set_changed"` and
  `"retryable": true`. Before, the same race could end in a database deadlock. Retry the write. See
  [Errors](../reference/rest-api/index.md#errors).
- A table rename that meets the same race is refused with the rename hold's existing busy message, to retry.
- A write whose profiles include no Trino or StarRocks profile, and no `egret-admin` set, no longer gives out engine
  usernames before it compiles, nor takes the lock that step needs.

### Views follow renames (platform #814)

From platform #814 a view rename through egret's Iceberg catalog carries the view's grants, rules and catalog grants, as a
table rename does, and a hand-written policy that reaches a table or view through a pattern is checked at a rename. There
is no migration and no API change.

- A view rename that copies a restriction is held until the engines serve it, at most 90 seconds.
- **Behaviour change:** a rename is refused with a 409 naming the policy when an enabled hand-written policy with a deny, a
  mask, a row filter or an exclusion list reaches the old name through a pattern and not the new one (KI-320). Edit or
  [migrate](../data-governance/engines-and-policy/migrate) the policy, or choose a name it covers.
- Grants that earlier view renames left on old names are not moved. Write them on the new name, then delete the old ones.

### Group delete removes its grants (migration 0212, platform #815)

From platform #815 deleting a local group deletes the grants that name it. Migration 0212 deletes the group grants that
earlier deletes left behind (KI-324). They gave nobody access, so nobody's access changes.

### Row filters by a column classification on Trino, and the attach notice (platform #818)

From platform #818 there is no migration.

- **Behaviour change:** on Trino a row filter by classification now filters every table where the classification is only
  on columns, as StarRocks already did, through one row-filter policy per such table. At start, egret recompiles the
  Trino profiles this reaches, so a rule written before the upgrade starts filtering those tables without another write
  (KI-287). People who read every row of such a table on Trino before
  the upgrade see only the filtered rows after it; **Who can read?** shows the rule.
- **API change:** `PUT /api/control-plane/warehouses/{warehouse_id}/resource-tags` answers `{"ok": true, "notices": [...]}`.
  Each notice has a `code` and a `message`; the one code today is `clearance_masks_pending_table` (KI-307). See
  [Control plane: catalog](../reference/rest-api/control-plane-catalog.md).
- **API change:** the rule effect no longer carries `trinoColumnOnly`, and explain no longer carries
  `row_filter_not_applied`.

### The attach notice for a view (platform #820)

From platform #820 there is no migration.

- **API change:** `PUT /api/control-plane/warehouses/{warehouse_id}/resource-tags` can answer a second notice code,
  `clearance_on_view`, when a whole-table classification with a clearance is attached to a name that is a view in the
  catalog on a warehouse a StarRocks engine serves. Before, such an attach answered `clearance_masks_pending_table`,
  whose message promised masks once the table exists; a view never becomes a table. A name the catalog does not have
  still answers `clearance_masks_pending_table`. A client that matches on `code` should handle both. See
  [Tagging](../data-governance/classifications/tagging.md#tag-a-table-or-a-column).
- **Behaviour change:** the `skipped` reason of `POST /api/control-plane/perm/compile/{service_id}` for a whole-table clearance on a view says
  that it is a view and gets no masks, instead of *not protected until the table exists*.

### Trino metadata tables follow masks, row filters and denies (platform #821)

From platform #821 there is no migration.

- **Behaviour change:** on Trino, a person a mask, row filter or select deny restricts on a table is now refused
  (*Access Denied*) on every metadata table of that table (`orders$files`, `orders$partitions`, `orders$history`, …).
  Before, they could read column bounds, partition values and counts there (KI-341). People the policy exempts or does
  not restrict read them as before. egret recompiles the affected Trino profiles; the new policies are named
  `perm-hidden-meta-…`. Profiles that egret's permission model does not compile get nothing.

### Warning on StarRocks engines (platform #822)

From platform #822 there is no migration and no API change. Every StarRocks engine bound to a policy profile shows a
warning that StarRocks serves Iceberg metadata tables without asking Ranger (KI-340): on the Governance engine page, the
Control plane engine page and **Register external engine**.

### StarRocks engines default to Egret's patched image (platform #826)

From platform #826 there is no migration and no API change.

- **Behaviour change:** a new provisioned StarRocks engine runs `ghcr.io/egret-data/egret-starrocks-fe:4.1.7-egret.1` for
  its front end and `starrocks/cn-ubuntu:4.1.7` for its compute nodes (both pinned by digest), instead of the official
  4.1.6 images. The patched front end fixes KI-340 (Iceberg metadata tables read without a privilege check) and KI-345
  (masks and row filters skipped for prepared statements, which Data API endpoints with parameters use). The local
  development stack's `starrocks` service runs the patched `egret-starrocks-allin1` image.
- **Existing engines keep their image.** Move each StarRocks engine onto the patched image with
  `PUT /api/control-plane/engines/{id}` as described under *Egret's patched StarRocks image* on **Engines and Ranger**;
  its pods restart. From 4.1.4 or 4.1.6 this is an upgrade to 4.1.7. Run an external StarRocks engine on the same image.
- **The warning about both holes** is no longer shown for a provisioned engine on the patched image; it still shows for
  every other StarRocks engine bound to a profile, and always for an external one.
- The cluster must be able to pull from `ghcr.io/egret-data`.

### New users get an engine username at creation (platform #823)

From platform #823 there is no migration and no API shape change.

- **Behaviour change:** `POST /api/control-plane/users`, `egret create-admin` and a first SSO sign-in give the new user
  an engine username at once; the answer's `username` is no longer `null` (KI-342). Service accounts are unchanged.
- **At start:** egret gives a username to every existing person who has none. A person whose would-be name a stored
  grant principal or rule exemption already uses is left without one, and the server logs a warning; allocate theirs by
  hand from a grant dialog, which answers 409 naming those rows until they are resolved.

### StarRocks engines default to `egret-starrocks-fe` `4.1.7-egret.3` (platform #827)

From platform #827 there is no migration and no API change.

- **Behaviour change:** a new provisioned StarRocks engine runs `ghcr.io/egret-data/egret-starrocks-fe:4.1.7-egret.3`
  (pinned by digest) instead of `4.1.7-egret.1`; the compute nodes stay on the official `starrocks/cn-ubuntu:4.1.7`. It
  also fixes KI-337 (`_file` and `_pos` in `SELECT *` under a row filter), KI-346 (no masks or row filters through the
  HTTP SQL API and Arrow Flight SQL), KI-347 (`FILES()` with no privilege), KI-348 (materialized views stored past their
  creator's masks and row filters) and KI-349 (`SHOW CREATE CATALOG` with no privilege). The local development stack's
  `starrocks` service runs `egret-starrocks-allin1:4.1.7-egret.3`.
- **New refusals on the patched image:** `FILES()` needs the OPERATE privilege on SYSTEM (error 5211), and creating a
  materialized view over a table where a mask or row filter applies to the creator is refused (error 5212), whichever
  columns the view reads; an existing materialized view of such a creator stops refreshing. `SHOW CREATE CATALOG` needs
  a privilege on the catalog.
- **Existing engines keep their image**, including those on `4.1.7-egret.1`. Move each one with
  `PUT /api/control-plane/engines/{id}` as described under *Egret's patched StarRocks image* on **Engines and Ranger**;
  its pods restart.
- **The warning** now names every hole, and is shown for every StarRocks engine bound to a profile unless it runs
  `egret-starrocks-fe` `4.1.7-egret.3` or later, so it comes back for an engine on `4.1.7-egret.1`.

### Engines accept connections only from Egret (platform #828)

From platform #828 there is no migration and no API change.

- **Behaviour change (Helm chart):** the chart renders `NetworkPolicy/egret-engine-isolation` in `engineNamespace`, on by
  default. Only the engine namespace's own pods, Egret's pods and the StarRocks operator (8030 and 9030) can connect to the
  engines; workflow task pods, app pods and anything else in the cluster are refused. See
  [Engine network policy](./kubernetes#engine-network-policy).
- **An engine Ingress needs a value:** if an engine is reached through an Ingress, add the ingress controller to
  `engineNetworkPolicy.ingressFrom` (for example
  `- namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: ingress-nginx } }`) before upgrading, or that Ingress
  stops getting traffic.
- **The operator elsewhere:** if the StarRocks operator does not run in `starrocks`, set
  `engineNetworkPolicy.operatorNamespaces`.
- To keep the old behaviour, set `engineNetworkPolicy.enabled=false`.

### StarRocks engines default to `egret-starrocks-fe` `4.1.7-egret.4` (platform #832)

From platform #832 there is no migration and no API change.

- **Behaviour change:** a new provisioned StarRocks engine runs `ghcr.io/egret-data/egret-starrocks-fe:4.1.7-egret.4`
  (pinned by digest) instead of `4.1.7-egret.3`; the compute nodes stay on the official `starrocks/cn-ubuntu:4.1.7`. It
  also fixes KI-350 (`EXPLAIN COSTS` shows the statistics of hidden rows) and KI-351 (loads, exports and
  `SELECT INTO OUTFILE` with the nodes' own cloud identity). The local development stack's `starrocks` service runs
  `egret-starrocks-allin1:4.1.7-egret.4`.
- **New refusals on the patched image:** `EXPLAIN COSTS` over a table where a mask or row filter applies to the person
  is refused (error 5213). `BROKER LOAD`, `EXPORT`, `SELECT ... INTO OUTFILE` and `ENGINE = file` tables need the
  OPERATE privilege on SYSTEM (error 5214) unless every location is on an object store and the statement carries that
  store's own keys; HDFS and local paths always need it. Egret itself runs none of these statements.
- **The image ships StarRocks' AuditLoader plugin** at `/opt/egret/auditloader.zip`. Nothing installs it yet.
- **Existing engines keep their image**, including those on `4.1.7-egret.3`. Move each one with
  `PUT /api/control-plane/engines/{id}` as described under *Egret's patched StarRocks image* on **Engines and Ranger**;
  its pods restart.
- **The warning** now also names KI-350 and KI-351, and is shown for every StarRocks engine bound to a profile unless it
  runs `egret-starrocks-fe` `4.1.7-egret.4` or later, so it comes back for an engine on `4.1.7-egret.3`.

## Rolling back

There is no supported in-place rollback. Restore the database from the backup taken in step 2, then start the previous
binary. Object storage is not changed by migrations, but files written by the newer version stay in the bucket.

## Further reading

- [Backup and restore](./backup-restore)
- [Configuration keys](../reference/configuration-keys)
