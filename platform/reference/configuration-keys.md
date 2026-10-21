---
sidebar_position: 2
---

# Configuration keys

Every key the Egret server reads, grouped by section, with its environment variable, default and meaning. The source of
truth is the `Config` struct in `crates/egret-config/src/lib.rs`; the tables below follow its order. For how the layers
combine and for worked examples, see [Configuration](../deploy-operate/configuration).

## How a key becomes an environment variable

Configuration is layered: built-in defaults, then `egret.toml` in the working directory, then environment variables.
The environment wins.

- The environment variable for `[section] key` is `EGRET_<SECTION>__<KEY>` in upper case, with **two** underscores between
  the section and the key. A key inside a sub-table adds another pair: `[workflow.storage] max_file_bytes` is
  `EGRET_WORKFLOW__STORAGE__MAX_FILE_BYTES`. A section whose name contains an underscore keeps it: `[data_api]
  public_url` is `EGRET_DATA_API__PUBLIC_URL`, and `[rate_limit] login_max_attempts` is
  `EGRET_RATE_LIMIT__LOGIN_MAX_ATTEMPTS`.
- Lists and tables take TOML syntax in the variable: `EGRET_OIDC__SCOPES='["openid","email","profile"]'`.
- Keys marked **required** in the Default column have an empty default and a boot-time check; the server refuses to start
  without them (see [Startup checks](#startup-checks)).
- A key the server does not know is ignored at the top level and in most sections, so a typo leaves the default in
  place, but every subcommand logs a `WARN` for it right after the configuration has passed the
  [startup checks](#startup-checks), with the closest real key when one is within two edits:

  ```text
  ignored environment variable EGRET_SERVER__PORTT: no configuration key has this name (did you mean EGRET_SERVER__PORT?)
  ignored key server.portt in <path>/egret.toml: no configuration key has this name (did you mean server.port?)
  ```

  The warning never stops the start. It covers every `EGRET_*` variable and every key of the configuration file, except
  the [variables read outside the configuration](#variables-outside-the-configuration-file) and the test-harness prefixes
  `EGRET_TEST_`, `EGRET_E2E_` and `EGRET_ALLOW_`. The sub-tables `workflow.storage`, `workflow.kubernetes`,
  `workflow.plugin_host`, `apps.storage` and the entries of `workflow.plugin_configurations` go further and reject
  unknown keys.

## server

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `host` | `EGRET_SERVER__HOST` | `0.0.0.0` | Address the HTTP server binds. |
| `port` | `EGRET_SERVER__PORT` | `8080` | HTTP port. |

## database

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `url` | `EGRET_DATABASE__URL` | `postgres://egret:egret@localhost:5432/egret` | PostgreSQL connection URL of the metadata database. Migrations run against it on start. |
| `max_connections` | `EGRET_DATABASE__MAX_CONNECTIONS` | `10` | Size of the connection pool. |

## log

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `filter` | `EGRET_LOG__FILTER` | `info` | A `tracing` env-filter directive, for example `info,egret=debug`. An invalid directive falls back to `info`. |
| `json` | `EGRET_LOG__JSON` | `false` | Emit JSON log lines when true, human-readable lines when false. |

## session and csrf

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `session.cookie_name` | `EGRET_SESSION__COOKIE_NAME` | `egret_session` | Name of the session cookie. |
| `session.absolute_ttl_hours` | `EGRET_SESSION__ABSOLUTE_TTL_HOURS` | `24` | A session ends this long after sign-in, however active. Also the cookie's `Max-Age`. |
| `session.idle_ttl_minutes` | `EGRET_SESSION__IDLE_TTL_MINUTES` | `60` | A session ends after this long without a request. |
| `session.secure` | `EGRET_SESSION__SECURE` | `false` | Mark the session and OIDC cookies `Secure`. **Set to `true` whenever the site is served over HTTPS.** |
| `csrf.cookie_name` | `EGRET_CSRF__COOKIE_NAME` | `egret_csrf` | Name of the CSRF cookie. |
| `csrf.header_name` | `EGRET_CSRF__HEADER_NAME` | `X-Egret-CSRF` | Header a client sends the CSRF cookie's value in on every state-changing request. |

## rate_limit

Two limiters, both in memory per replica. The window and the lockout are in seconds.

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `login_max_attempts` | `EGRET_RATE_LIMIT__LOGIN_MAX_ATTEMPTS` | `5` | Local sign-in attempts allowed per window, per address and per email. Successful and failed attempts both count. |
| `login_window_secs` | `EGRET_RATE_LIMIT__LOGIN_WINDOW_SECS` | `300` | Length of the sign-in window. |
| `login_lockout_secs` | `EGRET_RATE_LIMIT__LOGIN_LOCKOUT_SECS` | `300` | How long a key stays blocked (HTTP 429) once it exceeds the limit. |
| `token_max_attempts` | `EGRET_RATE_LIMIT__TOKEN_MAX_ATTEMPTS` | `60` | Requests to the machine identity provider's `POST /oauth/token` (client credentials) and to the token exchange per window, keyed on address and client id. Requests that repeat an already verified secret are not counted. |
| `token_window_secs` | `EGRET_RATE_LIMIT__TOKEN_WINDOW_SECS` | `60` | Length of the token window. |
| `token_lockout_secs` | `EGRET_RATE_LIMIT__TOKEN_LOCKOUT_SECS` | `60` | How long a key stays blocked after exceeding the token limit. |

## oidc

External single sign-on. See [Authentication setup](../deploy-operate/authentication).

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `enabled` | `EGRET_OIDC__ENABLED` | `false` | Turn on single sign-on. When true, `security.secret_key`, `issuer_url` and `client_id` are required. |
| `issuer_url` | `EGRET_OIDC__ISSUER_URL` | empty (required with `enabled`) | The identity provider's issuer, for example `http://localhost:8081/realms/egret`. Discovery is read from it. |
| `client_id` | `EGRET_OIDC__CLIENT_ID` | empty (required with `enabled`) | The OIDC client id registered for Egret. |
| `client_secret` | `EGRET_OIDC__CLIENT_SECRET` | empty | The OIDC client secret. |
| `redirect_url` | `EGRET_OIDC__REDIRECT_URL` | `http://localhost:8080/api/auth/oidc/callback` | The callback URL registered at the provider. It must be on the origin the browser uses, so the session cookie lands on the app. |
| `scopes` | `EGRET_OIDC__SCOPES` | `["openid","email","profile"]` | Scopes requested at sign-in. |
| `groups_claim` | `EGRET_OIDC__GROUPS_CLAIM` | `groups` | Name of the token claim that lists the user's groups. |
| `post_login_redirect` | `EGRET_OIDC__POST_LOGIN_REDIRECT` | `/` | Where the browser goes after a successful sign-in. |
| `catalog_audience` | `EGRET_OIDC__CATALOG_AUDIENCE` | `egret-catalog` | The `aud` value the embedded catalog requires in an engine JWT. |

## idp

Egret's own machine identity provider: the issuer of the tokens it mints for engines, the catalog and Data API clients.
This is a different issuer from `oidc`, which describes the external provider people sign in with.

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `issuer` | `EGRET_IDP__ISSUER` | unset (falls back to `catalog.public_url`) | The `iss` of every token Egret mints and the `issuer` of `/.well-known/openid-configuration`. It must be a name clients outside the cluster can resolve. A trailing slash is trimmed. Changing it strands StarRocks engines already provisioned, because their security integration compares the old issuer byte for byte. |

## security

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `secret_key` | `EGRET_SECURITY__SECRET_KEY` | empty (required with `oidc.enabled`) | Base64 key of at least 64 bytes that encrypts the OIDC state cookie. The value in `.env.example` is public. Generate your own with `head -c 64 /dev/urandom \| base64`. |

## secrets

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `master_key` | `EGRET_SECRETS__MASTER_KEY` | empty | Base64 key of at least 32 bytes used for AES-256-GCM encryption of stored credentials. Empty disables sealing: registering a database or storage connection **with a secret** then fails, and so does starting a workflow that declares a `SECRET` input (400). If set, it must decode to 32 bytes or more. |

## catalog

The embedded Iceberg REST catalog. See [Storage and catalog setup](../deploy-operate/storage-and-catalog).

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `enabled` | `EGRET_CATALOG__ENABLED` | `false` | Run the catalog in the server process. Requires `warehouse`, `auth_token` and the `storage` credentials. |
| `warehouse` | `EGRET_CATALOG__WAREHOUSE` | `s3://warehouse` | Warehouse location of the default catalog. |
| `auth_token` | `EGRET_CATALOG__AUTH_TOKEN` | empty (required with `enabled`) | Static token for catalog administration. |
| `public_url` | `EGRET_CATALOG__PUBLIC_URL` | `http://localhost:<server.port>` (an unset or blank value follows `server.port`) | Base origin of this server, without `/catalog`, advertised to catalog clients. Engines in a cluster resolve it, so in Kubernetes it is a Service DNS name. It is also the fallback for `idp.issuer`. |
| `system_user` | `EGRET_CATALOG__SYSTEM_USER` | `egret-system` | Stable name of the in-process principal that bootstraps the catalog's default project. Keep it stable across deploys; changing it creates a different system administrator. |

## storage

The S3-compatible object store used for the catalog warehouse, query results, workflow files and Data Apps sources.

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `endpoint` | `EGRET_STORAGE__ENDPOINT` | `http://localhost:9000` | S3 endpoint URL. Leave it out of `egret.toml` for AWS S3. |
| `region` | `EGRET_STORAGE__REGION` | `us-east-1` | S3 region. |
| `bucket` | `EGRET_STORAGE__BUCKET` | `warehouse` | Bucket name. The bucket must already exist. |
| `access_key` | `EGRET_STORAGE__ACCESS_KEY` | empty (**required**) | Access key. The server will not start without it, see [Startup checks](#startup-checks). |
| `secret_key` | `EGRET_STORAGE__SECRET_KEY` | empty (**required**) | Secret key. |
| `path_style` | `EGRET_STORAGE__PATH_STYLE` | `true` | Use path-style addressing (`endpoint/bucket/key`). Needed for RustFS and most self-hosted S3 servers. |

## ranger

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `enabled` | `EGRET_RANGER__ENABLED` | `false` | Serve the Ranger-compatible policy service that engine plugins poll, and turn on policy administration. See [Engines and Ranger setup](../deploy-operate/engines-and-ranger). |
| `auth_token` | `EGRET_RANGER__AUTH_TOKEN` | empty | Token the Ranger plugins present to the policy service. |

## engine

Limits for queries run from the application.

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `max_rows` | `EGRET_ENGINE__MAX_ROWS` | `100000` | Most rows a query returns. At least 1. |
| `query_timeout_secs` | `EGRET_ENGINE__QUERY_TIMEOUT_SECS` | `60` | Per-query timeout. At least 1. |
| `preview_rows` | `EGRET_ENGINE__PREVIEW_ROWS` | `100` | Rows returned for a preview. Must not exceed `max_rows`. |
| `results_prefix` | `EGRET_ENGINE__RESULTS_PREFIX` | `query-results` | Object-store key prefix for stored query results, inside the storage bucket. |

## engines

How **Add engine** provisions a query engine. Everything under `docker` applies only when `provisioner` is `docker`. See [Engines and Ranger setup](../deploy-operate/engines-and-ranger#the-docker-provisioner).

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `provisioner` | `EGRET_ENGINES__PROVISIONER` | `auto` | `auto` uses Kubernetes when Egret runs in a cluster or finds a kubeconfig, and never picks `docker`. `kubernetes`, `docker` or `none` choose a backend explicitly. With `none`, or `auto` and no cluster, **Add engine** is disabled. |
| `docker.host` | `EGRET_ENGINES__DOCKER__HOST` | `unix:///var/run/docker.sock` | The Docker API: `unix://`, `tcp://` or `http://`. |
| `docker.network` | `EGRET_ENGINES__DOCKER__NETWORK` | empty | The network engine containers join. Required with `docker`. |
| `docker.project` | `EGRET_ENGINES__DOCKER__PROJECT` | empty | Value of the `egret.project` label on every engine container. Egret never touches a container carrying another project. Required with `docker`. |
| `docker.callback_url` | `EGRET_ENGINES__DOCKER__CALLBACK_URL` | unset | How engine containers reach Egret, when that differs from the default derived from `catalog.public_url`. An empty value is refused. |
| `docker.allowed_images` | `EGRET_ENGINES__DOCKER__ALLOWED_IMAGES` | `["trinodb/trino"]` | Image repositories (tag excluded) an engine may use, as a JSON array. Must not be empty. |

## audit

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `enabled` | `EGRET_AUDIT__ENABLED` | `true` | Record authorization decisions. Governance changes are recorded in their own transaction either way. |
| `retention_days` | `EGRET_AUDIT__RETENTION_DAYS` | `90` | Rows older than this are pruned hourly. `0` or a negative value means **do not prune**, and the server logs that it declined to schedule the prune. |
| `channel_capacity` | `EGRET_AUDIT__CHANNEL_CAPACITY` | `8192` | Size of the in-memory queue. When it is full, events are dropped (the sink is best effort). |
| `batch_size` | `EGRET_AUDIT__BATCH_SIZE` | `256` | Most events written per INSERT. |
| `flush_interval_ms` | `EGRET_AUDIT__FLUSH_INTERVAL_MS` | `1000` | A batch is written at least this often. |

## automation

Alerts and reports: the scheduler and the screenshot renderer.

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `enabled` | `EGRET_AUTOMATION__ENABLED` | `true` | Run the schedule ticker. Turn it off on a replica dedicated to serving. |
| `tick_interval_secs` | `EGRET_AUTOMATION__TICK_INTERVAL_SECS` | `30` | Seconds between ticks. |
| `webhook_allow_hosts` | `EGRET_AUTOMATION__WEBHOOK_ALLOW_HOSTS` | `[]` | Hosts a webhook may reach even though they resolve into private address space. |
| `renderer_url` | `EGRET_AUTOMATION__RENDERER_URL` | `http://egret-renderer:8080` | Base URL of the `egret-renderer` service, reachable from this server. |
| `public_url` | `EGRET_AUTOMATION__PUBLIC_URL` | `http://egret:8080` | Base URL the renderer uses to reach this server (in a cluster, its own Service name). |
| `browser_url` | `EGRET_AUTOMATION__BROWSER_URL` | unset (falls back to `public_url`) | Base URL a person opens, used for the links in notifications. |

## data_api

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `access_log_retention_days` | `EGRET_DATA_API__ACCESS_LOG_RETENTION_DAYS` | `90` | Data API access-log rows older than this are pruned hourly. `0` means do not prune. |
| `public_url` | `EGRET_DATA_API__PUBLIC_URL` | unset (falls back to the `idp` issuer, then `catalog.public_url`) | Base URL a consumer outside the cluster uses. It is stamped into the generated OpenAPI document and the token endpoint handed to a new client. |
| `replicas` | `EGRET_DATA_API__REPLICAS` | `1` | How many replicas of the backend run. The Helm chart sets it. Above `1` with no `shared_store_url`, the server **refuses to start**. |
| `shared_store_url` | `EGRET_DATA_API__SHARED_STORE_URL` | unset | Redis or Valkey URL that holds the Data API rate-limit buckets and response cache across replicas, for example `redis://valkey:6379/1`. Unset means process-local state. |

## workflow

Switches and limits for the workflow engine. Both loops default to **off**.

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `webhooks_enabled` | `EGRET_WORKFLOW__WEBHOOKS_ENABLED` | `false` | Mount the anonymous webhook routes (`POST /workflows/v1/{ws}/executions/webhook/...`). The key in the URL is the only credential. When false the routes are not mounted at all. |
| `worker_enabled` | `EGRET_WORKFLOW__WORKER_ENABLED` | `false` | Start the claim loop and the lease reaper. With it off, an execution is created and nothing advances it. |
| `scheduler_enabled` | `EGRET_WORKFLOW__SCHEDULER_ENABLED` | `false` | Start the trigger loop, so `cron:` schedule and flow triggers fire. It needs the worker on to be useful. |
| `tick_interval_secs` | `EGRET_WORKFLOW__TICK_INTERVAL_SECS` | `1` | Seconds between claim ticks. |
| `batch` | `EGRET_WORKFLOW__BATCH` | `8` | Most task runs one claim tick takes. |
| `max_concurrent_runs` | `EGRET_WORKFLOW__MAX_CONCURRENT_RUNS` | `8` | Most claimed task runs one replica runs at the same time. A tick claims at most the free slots, so a slow task holds one slot and not the whole replica. `0` is refused at start. |
| `reaper_interval_secs` | `EGRET_WORKFLOW__REAPER_INTERVAL_SECS` | `60` | Seconds between reaper passes. |
| `working_timeout_s` | `EGRET_WORKFLOW__WORKING_TIMEOUT_S` | `3600` | How long a lease may go unreleased before the reaper hands the run back. Too short and a slow live task is run twice; too long and a task of a dead replica stays stuck. |
| `container_default_timeout_s` | `EGRET_WORKFLOW__CONTAINER_DEFAULT_TIMEOUT_S` | `3600` | Timeout of a script or container task that declares none. Other task types run unbounded. |
| `kill_poll_ms` | `EGRET_WORKFLOW__KILL_POLL_MS` | `5000` | Milliseconds between a running task's checks for a kill request. Minimum `100`. |
| `trigger_interval_secs` | `EGRET_WORKFLOW__TRIGGER_INTERVAL_SECS` | `1` | Seconds between scheduler passes. |
| `log_retention_days` | `EGRET_WORKFLOW__LOG_RETENTION_DAYS` | `30` | Stored task log lines older than this are deleted hourly. `0` keeps them for ever. |
| `storage_retention_days` | `EGRET_WORKFLOW__STORAGE_RETENTION_DAYS` | `30` | Execution files are kept this long after the execution ends. `0` keeps them for ever. |
| `kept_container_retention_days` | `EGRET_WORKFLOW__KEPT_CONTAINER_RETENTION_DAYS` | `7` | How long a container or pod kept with `taskRunner.delete: false` outlives its run. `0` keeps it for ever. |
| `log_run_max_lines` | `EGRET_WORKFLOW__LOG_RUN_MAX_LINES` | `10000` | Most log lines stored per task-run attempt. Past it the task keeps running and one warning line says how many were withheld. |
| `log_run_max_bytes` | `EGRET_WORKFLOW__LOG_RUN_MAX_BYTES` | `10485760` | Most bytes of log text stored per task-run attempt (10 MiB). |
| `container_runner` | `EGRET_WORKFLOW__CONTAINER_RUNNER` | `none` | Where script tasks run: `none` (no script handler), `docker` (local development only) or `kubernetes` (one pod per task-run attempt). Any value other than `none` requires the `storage` credentials and `plugin_host.image`. |
| `plugin_configurations` | `EGRET_WORKFLOW__PLUGIN_CONFIGURATIONS` | empty list | Per-plugin settings in Kestra's `kestra.plugins.configurations` shape: a list of `{type, values}`. The only values read are `allowed-images` (glob patterns for script task images; empty allows no image) and, on the `kestra` entry, `allowed-types` (glob patterns for plugin task types). |

### workflow.storage

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `prefix` | `EGRET_WORKFLOW__STORAGE__PREFIX` | `workflow/` | Object-key prefix for execution files. Must end with `/`, not start with `/`, and be at most 200 bytes. |
| `max_file_bytes` | `EGRET_WORKFLOW__STORAGE__MAX_FILE_BYTES` | `1073741824` | Largest single file (1 GiB). |
| `max_task_bytes` | `EGRET_WORKFLOW__STORAGE__MAX_TASK_BYTES` | `5368709120` | Most bytes one task run may write in all (5 GiB). |
| `max_read_bytes` | `EGRET_WORKFLOW__STORAGE__MAX_READ_BYTES` | `10485760` | Most bytes a `read()` returns into a template render (10 MiB). Minimum `4096`. |
| `max_namespace_files` | `EGRET_WORKFLOW__STORAGE__MAX_NAMESPACE_FILES` | `10000` | Most namespace files one listing, search or namespace-file operation may see. |

### workflow.kubernetes

Read only when `container_runner` is `kubernetes`. None of it is settable by a flow author.

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `namespace` | `EGRET_WORKFLOW__KUBERNETES__NAMESPACE` | `egret-tasks` | Namespace task pods are created in. |
| `default_resources` | `EGRET_WORKFLOW__KUBERNETES__DEFAULT_RESOURCES__<REQUEST\|LIMIT>__<CPU\|MEMORY\|EPHEMERAL_STORAGE>` | request `100m` / `128Mi` / `256Mi`; limit `1` / `512Mi` / `10Gi` | Requests and limits a task gets when its `taskRunner.resources` says nothing. |
| `max_resources` | `EGRET_WORKFLOW__KUBERNETES__MAX_RESOURCES__<REQUEST\|LIMIT>__<CPU\|MEMORY\|EPHEMERAL_STORAGE>` | limit `2` / `2Gi` / `10Gi`; no request cap | The most a task may ask for; larger values are capped. |
| `image_pull_secrets` | `EGRET_WORKFLOW__KUBERNETES__IMAGE_PULL_SECRETS` | `[]` | Existing `dockerconfigjson` Secrets in the task namespace, attached to every task pod. |
| `run_as_user` | `EGRET_WORKFLOW__KUBERNETES__RUN_AS_USER` | `1000` | Uid of every container in a task pod. Must be positive. |
| `helper_image` | `EGRET_WORKFLOW__KUBERNETES__HELPER_IMAGE` | `egret-task-helper:dev` | Image that moves input and output files in and out of a task pod. |

### workflow.plugin_host

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `image` | `EGRET_WORKFLOW__PLUGIN_HOST__IMAGE` | unset (**required** when `container_runner` is not `none`) | Image that runs Kestra plugin tasks (`type: kestra.<class>`), built from `deploy/docker/plugin-host.Dockerfile`. |
| `jvm_max_heap` | `EGRET_WORKFLOW__PLUGIN_HOST__JVM_MAX_HEAP` | `384m` | The JVM `-Xmx`: digits and one optional unit letter (`k`, `m`, `g`). |
| `kill_grace_s` | `EGRET_WORKFLOW__PLUGIN_HOST__KILL_GRACE_S` | `15` | Seconds between SIGTERM and SIGKILL for a timed-out plugin task. Minimum `3`. |

## starrocks

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `jdbc_drivers.<dialect>.driver_url` | `EGRET_STARROCKS__JDBC_DRIVERS__<DIALECT>__DRIVER_URL` | unset | Repoint the JDBC driver jar a StarRocks `jdbc` catalog downloads, at an internal mirror or a `file:///` path in the FE image. `<dialect>` is `postgresql`, `mysql`, `mariadb`, `oracle`, `sqlserver` or `clickhouse`. |
| `jdbc_drivers.<dialect>.driver_class` | `EGRET_STARROCKS__JDBC_DRIVERS__<DIALECT>__DRIVER_CLASS` | unset | The driver class for that dialect. Egret compiles in a pinned driver for each dialect, and this section only repoints it. |

## apps

The Data Apps query gateway and the pods that run marimo. See [Data Apps](../explore/apps).

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `max_rows` | `EGRET_APPS__MAX_ROWS` | `10000` | Row cap per gateway query. |
| `timeout_secs` | `EGRET_APPS__TIMEOUT_SECS` | `60` | Per-query engine timeout. |
| `session_idle_secs` | `EGRET_APPS__SESSION_IDLE_SECS` | `1800` | An app token dies after this long unused. Must not exceed `session_absolute_secs`. |
| `session_absolute_secs` | `EGRET_APPS__SESSION_ABSOLUTE_SECS` | `28800` | An app token dies this long after minting. |
| `rate_max` | `EGRET_APPS__RATE_MAX` | `20` | Gateway calls allowed per token per window. |
| `rate_window_secs` | `EGRET_APPS__RATE_WINDOW_SECS` | `2` | Window length; a 429 holds that token for one full window. |
| `origin` | `EGRET_APPS__ORIGIN` | empty | Origin where marimo is served, for example `https://apps.egret.example`. A sibling subdomain, never another port. Empty disables the iframe (the ticket endpoint answers 503). |
| `egret_origin` | `EGRET_APPS__EGRET_ORIGIN` | empty | Egret's own browser-facing origin, the only one allowed to frame the apps origin. Required when `origin` is set, and must differ from it. |
| `ticket_ttl_secs` | `EGRET_APPS__TICKET_TTL_SECS` | `30` | How long a one-time ticket may wait to be redeemed. |
| `cookie_ttl_secs` | `EGRET_APPS__COOKIE_TTL_SECS` | `28800` | Lifetime of the apps-origin cookie. |
| `listen` | `EGRET_APPS__LISTEN` | `0.0.0.0:8081` | Where the apps host listens. A separate listener from the API. |

### apps.pod

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `launcher` | `EGRET_APPS__POD__LAUNCHER` | `none` | `none` (no pods), `subprocess` (local development, one marimo process per author) or `kubernetes` (one hardened pod per author per workspace). Anything but `none` needs `apps.origin` and `callback_url`. |
| `ready_timeout_secs` | `EGRET_APPS__POD__READY_TIMEOUT_SECS` | `60` | How long a request waits for a cold pod. |
| `idle_secs` | `EGRET_APPS__POD__IDLE_SECS` | `1800` | An edit pod unused this long is stopped. At least `60`. |
| `callback_url` | `EGRET_APPS__POD__CALLBACK_URL` | empty | Base URL pods call back to, Egret's in-cluster Service, for example `http://egret:8080`. |
| `namespace` | `EGRET_APPS__POD__NAMESPACE` | `egret-apps` | Kubernetes namespace of the pods. |
| `image` | `EGRET_APPS__POD__IMAGE` | `egret-apps:dev` | Pod image. |
| `image_pull_policy` | `EGRET_APPS__POD__IMAGE_PULL_POLICY` | `IfNotPresent` | Kubernetes image pull policy. |
| `cpu_request`, `mem_request` | `EGRET_APPS__POD__CPU_REQUEST`, `..._MEM_REQUEST` | `250m`, `512Mi` | Pod resource requests. |
| `cpu_limit`, `mem_limit` | `EGRET_APPS__POD__CPU_LIMIT`, `..._MEM_LIMIT` | `1000m`, `2Gi` | Pod resource limits. |
| `pull_secret` | `EGRET_APPS__POD__PULL_SECRET` | unset | Existing `dockerconfigjson` Secret for pulling the image. |
| `command` | `EGRET_APPS__POD__COMMAND` | `[]` | `subprocess` launcher: the command that starts the launcher entrypoint. |
| `work_dir` | `EGRET_APPS__POD__WORK_DIR` | `/tmp/egret-apps` | `subprocess` launcher: parent directory of each pod's working directory. |
| `config_dir` | `EGRET_APPS__POD__CONFIG_DIR` | empty | `subprocess` launcher: the locked marimo configuration directory. |
| `venv_shim_dir` | `EGRET_APPS__POD__VENV_SHIM_DIR` | empty | `subprocess` launcher: the venv shim directory run pods need. |
| `run_idle_secs` | `EGRET_APPS__POD__RUN_IDLE_SECS` | `300` | A run pod (a viewer of a published version) unused this long is stopped. |
| `run_session_cap` | `EGRET_APPS__POD__RUN_SESSION_CAP` | `8` | Open sessions (tabs) of the one viewer a run pod serves before a new one gets 503. At least 1. |
| `run_kernel_mode` | `EGRET_APPS__POD__RUN_KERNEL_MODE` | `thread` | `thread` or `forced_ipc`. `forced_ipc` is not a supported production path. |

### apps.storage

| Key | Environment variable | Default | Meaning |
|---|---|---|---|
| `prefix` | `EGRET_APPS__STORAGE__PREFIX` | `apps/` | Object-key prefix for app drafts and versions. Must end with `/` and not start with `/`. |

## Variables outside the configuration file

These are read directly from the environment.

| Variable | Used by | Meaning |
|---|---|---|
| `EGRET_ADMIN_EMAIL` | `egret init`, `egret workspace add-group` | Email of the bootstrap administrator. Default `admin@egret.local`. |
| `EGRET_ADMIN_PASSWORD` | `egret init` | Password of the bootstrap administrator. It is not printed (`init` says *taken from EGRET_ADMIN_PASSWORD (not shown)*). If unset or empty, a random one is generated and printed once. |
| `EGRET_ENGINE_TLS_INSECURE` | Query connectors and the engine monitor | `1`, `true` or `yes` skip TLS certificate verification when connecting to engines. Development only. |
| `EGRET_WRITE_PROPERTY_TREATMENT` | The workflow test-corpus generator | A development switch, not used by a running server. |
| `DATABASE_URL` | `sqlx` tooling and the test suite | Used by compile-time query checking and tests, not by the server (which reads `EGRET_DATABASE__URL`). `.env.example` sets both. |

## Startup checks

`egret serve` validates the configuration before it listens, and every other subcommand that touches the database runs the
same check. A failure prints one line and exits. These are the rules:

| Rule | Message |
|---|---|
| `oidc.enabled` needs `security.secret_key` (base64, at least 64 bytes) | `oidc.enabled requires security.secret_key (base64, >=64 bytes)` |
| `oidc.enabled` needs an issuer and a client id | `oidc.enabled requires issuer_url and client_id` |
| `catalog.enabled` needs a warehouse and a token | `catalog.enabled requires warehouse and auth_token` |
| `catalog.enabled` needs the storage credentials | `catalog.enabled requires storage access_key/secret_key/bucket` |
| `secrets.master_key`, when set, must decode to 32 bytes or more | `secrets.master_key must be base64 of >=32 bytes` |
| Always: `storage.bucket`, `access_key` and `secret_key` | `the apps API requires [storage] bucket, access_key, secret_key ...` |
| `engine.max_rows` and `query_timeout_secs` are at least 1; `preview_rows` is at most `max_rows` | `engine.max_rows and engine.query_timeout_secs must be >= 1` |
| `workflow.kill_poll_ms` is at least 100 | `workflow.kill_poll_ms: ... is below the minimum 100` |
| `workflow.max_concurrent_runs` is at least 1 | `workflow.max_concurrent_runs must be >= 1 (EGRET_WORKFLOW__MAX_CONCURRENT_RUNS)` |
| `workflow.container_runner` other than `none` needs the storage credentials and `plugin_host.image` | `workflow.container_runner other than none requires [storage] ...` |
| `apps.origin` set: both origins are `scheme://host[:port]`, differ from each other, and the TTLs are at least 1 | `apps.origin must differ from apps.egret_origin ...` |
| `apps.pod.launcher` is `none`, `subprocess` or `kubernetes`, with the keys each needs | `apps.pod.launcher must be none, subprocess or kubernetes ...` |
| More than one `data_api.replicas` needs `data_api.shared_store_url` | The server refuses to start. |

:::warning The storage credentials are required even if you never use object storage
The apps API stores draft and version content in the storage bucket regardless of the pod launcher, so the check applies
on every start, including `egret migrate` and `egret init`. The repository's `.env.example` sets them to the dev compose's
RustFS credentials, and a test keeps it passing these checks. See the [Quick start](../get-started/quick-start).
:::

## Further reading

- [Configuration](../deploy-operate/configuration)
- [Security hardening checklist](../deploy-operate/security-hardening)
