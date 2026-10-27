---
sidebar_position: 10
---

# FAQ

Short answers to questions people ask when they first run or operate Egret, with a link to the page that has the detail.

## About the platform

### What is Egret?

An enterprise data platform in one Rust server: SQL exploration and BI, an embedded Apache Iceberg catalog, access policy
enforced in the query engines, a data API builder and workflow automation. Each team works in an isolated workspace, and all
access is audited. See the [Overview](./get-started/overview) and [Concepts](./get-started/concepts).

### Which query engines does it support?

Trino and StarRocks. You can connect to engines you already run, or have Egret provision them on Kubernetes (Trino also as
Docker containers, which the demo stack uses). See [Engines and
Ranger setup](./deploy-operate/engines-and-ranger). The [Egret Engine](/engine/introduction), a Rust engine, is a separate
project in an early design phase and cannot be used yet.

### Is it ready for production?

The platform's development tooling is not: the Docker Compose file, `.env.example` and the Helm chart ship public default
credentials, and the chart's README says it is not a production chart. You can run the server in production, but you must
harden it first; see the [security checklist](./deploy-operate/security-hardening). Check [Known issues](./known-issues) too.

### What does it need to run?

PostgreSQL (the compose file uses 16), an S3-compatible object store that supports STS `AssumeRole` (RustFS in the dev
stack), and the server binary. Everything else is optional: an identity provider for single sign-on, Trino or StarRocks for
queries, Valkey or Redis for multi-replica Data API limits, Kubernetes for engine provisioning, script tasks and Data Apps
pods.

### Do I need Kubernetes?

No, to run the platform and query an engine you already have. **Register external engine** works without a cluster. In
production you need a cluster to provision engines from the UI (**Add engine**), to run workflow script and container tasks in
pods, and to run Data Apps in pods. Without one the server logs `kubernetes unavailable; engine provisioning disabled`.

The [demo stack](./get-started/run-the-demo-stack) shows the whole product without a cluster: it provisions Trino engines as
Docker containers and runs Data Apps as processes inside the Egret container. Those substitutes have no isolation and are for
demos only; workflow script and container tasks do not run there.

### Where is my data stored?

Egret's own state (users, workspaces, datasets, dashboards, flows, policies, the audit log, the catalog's table metadata) is in
PostgreSQL. Table data, stored query results and workflow files are in the object store. Your queries run in Trino or
StarRocks. See [Backup and restore](./deploy-operate/backup-restore).

## Getting started

### What is the fastest way to try Egret?

The demo stack: clone the repository and run `just demo-up`. It needs Docker and `just` (no Rust toolchain), and comes seeded
with a dataset, charts and a dashboard on Trino's `tpch` sample data. Sign in at `http://egret.localtest.me:8080` as
`admin@egret.local` / `Admin12345!`. See [Run the demo stack](./get-started/run-the-demo-stack).

### Why does the server not start after I copied `.env.example`?

A copy of `.env.example` passes the server's startup checks (a test in the repository keeps it so). If the server still
refuses with `the apps API requires [storage] bucket, access_key, secret_key`, a variable was removed or misspelled: the log
shows a `WARN` with *ignored environment variable …* for a name it does not know. Also check that the dependencies run
(`just up`) and that the `warehouse` bucket exists. See the [Quick start](./get-started/quick-start).

### What is the administrator password?

The one `egret init` generated and printed, or the one you set with `EGRET_ADMIN_PASSWORD` (`init` does not print that one). The Helm chart's default is `Admin12345!` and
you should change it. On the demo stack it is `Admin12345!` for `admin@egret.local`. See [First login tour](./get-started/first-login-tour).

### Where do I register a database?

Under **Manage → Workspace settings → Connections**, not under Explore. See [Your first dashboard](./get-started/first-dashboard) and
[Connections](./workspace-settings/databases).

### Why can I not save a connection with a password?

`EGRET_SECRETS__MASTER_KEY` is not set, and the API answers `secrets master_key is not configured`. Generate a key with `head -c
32 /dev/urandom | base64` and keep it. See [Catalog and storage errors](./deploy-operate/troubleshooting/catalog-storage-errors).

## Signing in and access

### Why do I get *429 Too Many Requests* at sign-in?

Five failed local sign-ins within 5 minutes lock that address and email out for 5 minutes. The sign-in page says how long
to wait, and the response carries `Retry-After`. Successful sign-ins do not count. See [Cannot sign
in](./deploy-operate/troubleshooting/cannot-sign-in).

### I signed in with SSO and can see nothing. Why?

A new SSO user is created as a plain member. Access comes from roles granted to their groups. Grant the group a platform role
under **Control Plane → Groups**, or add it to a workspace under **Members**, or run `egret workspace add-group`. See
[Authentication setup](./deploy-operate/authentication#groups-and-access).

### Can I turn off the local administrator login?

No. With SSO on, the local form is hidden behind **Admin sign-in (break-glass)** but the route still answers. Protect it with a
long password, the sign-in rate limit and network controls. See the [security checklist](./deploy-operate/security-hardening).

### How do I give an API client access?

For the application API, sign in to get a session cookie and send the `egret_csrf` cookie's value in `X-Egret-CSRF` on writes
(see the [REST API](./reference/rest-api)). For published Data API endpoints, create a client under **Data API → Clients** and use the
OAuth2 client-credentials flow to get a bearer token. See [Data API clients](./data-api/clients).

## Running queries

### Creating a dataset fails with *Trino refused the X-Forwarded-Proto header*. Why?

The engine is a Trino you run yourself, and it answered HTTP 406 because Egret sends `X-Forwarded-Proto` over plain HTTP. Set
`http-server.process-forwarded=true` in the coordinator's `config.properties`, or connect over https. See [Engine 406 and 502 errors](./deploy-operate/troubleshooting/engine-406-502).

### Why are there only 1,000 rows?

SQL Lab's **Limit** control defaults to 1,000 rows, a chart's row limit defaults to 1,000, and the server caps results at
`engine.max_rows` (100,000). See [Queries fail](./deploy-operate/troubleshooting/queries-fail#fewer-rows-than-expected).

### Why does my chart's y-axis say *Nothing available*?

A dataset built from a SQL query has no metrics until you add one. Open the dataset, **Metrics → + Metric**, and define one such
as `SUM(revenue)`. See [Your first dashboard](./get-started/first-dashboard#4-add-a-metric).

## Workflows

### My workflow execution stays in *Running* forever. Why?

The workflow worker is off by default; the flow page, the Run dialog and the execution then say *The workflow worker is off on
this server*. Set `EGRET_WORKFLOW__WORKER_ENABLED=true`, and `EGRET_WORKFLOW__SCHEDULER_ENABLED=true` for schedules and triggers. See [Workflows stuck](./deploy-operate/troubleshooting/workflows-stuck).

## Operating

### Can I run more than one replica?

Yes. Workflow workers need no leader election. The Data API's rate limits and response cache are per process unless you set a
shared store, so the server **refuses to start** with `data_api.replicas` above 1 and no `data_api.shared_store_url`. The Helm
chart fails to render in the same case. The sign-in limiter is per replica. See [Kubernetes](./deploy-operate/kubernetes).

### How do I upgrade?

Back up PostgreSQL, then start the new version: migrations run at boot. There are no down migrations; rolling back means
restoring the backup. See [Upgrades and migrations](./deploy-operate/upgrade).

### How do I back up Egret?

Dump the PostgreSQL database with `pg_dump`, back up the object-store bucket, and keep `EGRET_SECRETS__MASTER_KEY` safe: without
it, restored credentials cannot be decrypted. See [Backup and restore](./deploy-operate/backup-restore).

### How do I see who did what?

**Control Plane → Audit log** records authorization decisions and governance changes. Retention is `audit.retention_days` (90
by default). See [Audit log](./control-plane/audit-log).

## Governance

### Does StarRocks enforce tag-based masking?

Its Ranger plugin supports resource-based policies only, so egret compiles each rule and clearance by classification into
resource policies for the columns and tables that carry the classification. Masks, row filters and clearances by
classification are enforced on StarRocks this way, on a column or on a whole table; hand-written tag policies are not. See
[Engines and Ranger setup](./deploy-operate/engines-and-ranger#starrocks) and [Clearance](./data-governance/classifications/clearance#on-columns-or-on-a-whole-table).

### What happens to classifications when I rename or drop a table?

A rename through egret's Iceberg catalog takes the classifications with it, on the table and on its columns. egret holds the
rename until the engines serve them under the new name, which takes up to 90 seconds, and refuses it with a 409 if it cannot.
A drop keeps them for an undrop, and a recursive namespace drop removes them. Grants, rules and hand-written policies written
on the table's path do not follow (KI-308). See [Renames and drops](./data-governance/classifications/tagging#renames-and-drops).

### Why is a catalog client refused a rename or a commit that its grant seems to allow?

egret authorizes a rename and a commit by the tables they change. A rename needs `write` on the source table, as a drop
would, and a `catalog` or `namespace` grant on the destination namespace, as a create would; a grant on the destination
table name is not enough. A commit needs `write` on the table its body names, and a multi-table commit on every table in it.
A recursive namespace drop needs a `catalog`-level grant. Grants match names case-insensitively, as the catalog does. See
[What each operation needs](./control-plane/catalogs/catalog-detail#what-each-operation-needs).

### Why did my StarRocks policies stop applying after a restart?

The activation `access_control = ranger` lives in the front end's `fe.conf`, which a recreated container regenerates, and
nothing warns you. Add it again and restart the front end. See [Local Docker Compose](./deploy-operate/local#starrocks-and-ranger-in-the-compose-stack).
