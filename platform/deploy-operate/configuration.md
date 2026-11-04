---
sidebar_position: 2
---

# Configuration

How the Egret server reads its configuration, which keys you set first, and worked examples. The complete list of keys is
in the [configuration keys reference](../reference/configuration-keys).

## How configuration is loaded

The server builds its configuration from three layers. A later layer overrides an earlier one:

1. **Built-in defaults.** Every key has one, except the secrets, which are empty.
2. **`egret.toml`** in the working directory the server starts from. The file is optional. It is listed in `.gitignore`, so
   it is yours to create.
3. **Environment variables** named `EGRET_<SECTION>__<KEY>`, with two underscores between the section and the key.

```toml
# egret.toml
[server]
port = 8080

[database]
url = "postgres://egret:egret@localhost:5432/egret"
```

is equivalent to `EGRET_SERVER__PORT=8080` and `EGRET_DATABASE__URL=postgres://...`. Sub-tables add another `__`:
`[workflow.storage] max_file_bytes` is `EGRET_WORKFLOW__STORAGE__MAX_FILE_BYTES`.

:::tip Local development: `.env`
`just` loads `.env` into the environment of every recipe it runs, so `just serve` sees it. A binary you start yourself
does not: run `set -a; source .env; set +a` first. The server does not read `.env` on its own.
:::

The server validates the result before it listens. A missing or malformed required value stops the process with one line
naming the key; see [Startup checks](../reference/configuration-keys#startup-checks). Unknown keys are ignored, so a
misspelled variable leaves the default in place, but the server logs a `WARN` for each one at start, with the closest real
key (`ignored environment variable EGRET_SERVER__PORTT: … (did you mean EGRET_SERVER__PORT?)`). The warning never stops the
start.

## The keys you set first

| Setting | Environment variable | Why |
|---|---|---|
| Metadata database | `EGRET_DATABASE__URL` | The only hard dependency. Migrations run against it at start. |
| Object storage | `EGRET_STORAGE__ENDPOINT`, `__REGION`, `__BUCKET`, `__ACCESS_KEY`, `__SECRET_KEY`, `__PATH_STYLE` | **Required**: the server will not start without a bucket and credentials. See [Storage and catalog setup](./storage-and-catalog). |
| Credential encryption key | `EGRET_SECRETS__MASTER_KEY` | Base64, at least 32 bytes. Without it you cannot save a connection with a secret. |
| Session and OIDC state key | `EGRET_SECURITY__SECRET_KEY` | Base64, at least 64 bytes. Required when SSO is on. |
| Single sign-on | `EGRET_OIDC__*` | See [Authentication setup](./authentication). |
| Catalog | `EGRET_CATALOG__ENABLED`, `__AUTH_TOKEN`, `__WAREHOUSE`, `__PUBLIC_URL` | The embedded Iceberg catalog. |
| Policy service | `EGRET_RANGER__ENABLED`, `__AUTH_TOKEN` | Serves policies to engine plugins. See [Engines and Ranger setup](./engines-and-ranger). |
| Workflow engine | `EGRET_WORKFLOW__WORKER_ENABLED`, `__SCHEDULER_ENABLED` | **Both default to off.** With them off, executions are created and never advance. |
| Cookie security | `EGRET_SESSION__SECURE` | Set to `true` behind HTTPS. |
| Logging | `EGRET_LOG__FILTER`, `EGRET_LOG__JSON` | Log level and JSON output. |

## Generating keys

```bash
# EGRET_SECRETS__MASTER_KEY: 32 random bytes, base64
head -c 32 /dev/urandom | base64

# EGRET_SECURITY__SECRET_KEY: 64 random bytes, base64
head -c 64 /dev/urandom | base64
```

The value of `EGRET_SECURITY__SECRET_KEY` in `.env.example` is public. Generate your own for every deployment, and keep the
master key stable: **a changed `EGRET_SECRETS__MASTER_KEY` makes every stored credential unreadable.** See [Backup and
restore](./backup-restore).

## Example: a single node with SSO

```toml
# egret.toml
[server]
host = "0.0.0.0"
port = 8080

[database]
url = "postgres://egret:CHANGE-ME@db.internal:5432/egret"
max_connections = 20

[storage]
endpoint = "https://s3.internal.example"
region = "us-east-1"
bucket = "egret"
path_style = true
# access_key and secret_key: set EGRET_STORAGE__ACCESS_KEY / __SECRET_KEY in the environment

[session]
secure = true

[oidc]
enabled = true
issuer_url = "https://sso.example.com/realms/egret"
client_id = "egret"
redirect_url = "https://egret.example.com/api/auth/oidc/callback"
groups_claim = "groups"
# client_secret, [security] secret_key and [secrets] master_key: set in the environment

[catalog]
enabled = true
warehouse = "s3://egret"
public_url = "https://egret.example.com"

[ranger]
enabled = true

[workflow]
worker_enabled = true
scheduler_enabled = true

[audit]
retention_days = 365
```

```bash
export EGRET_STORAGE__ACCESS_KEY=...        # from your secret store
export EGRET_STORAGE__SECRET_KEY=...
export EGRET_OIDC__CLIENT_SECRET=...
export EGRET_SECURITY__SECRET_KEY=$(head -c 64 /dev/urandom | base64)
export EGRET_SECRETS__MASTER_KEY=$(head -c 32 /dev/urandom | base64)
export EGRET_CATALOG__AUTH_TOKEN=$(head -c 30 /dev/urandom | base64)
export EGRET_RANGER__AUTH_TOKEN=$(head -c 30 /dev/urandom | base64)
egret serve
```

Keep secrets out of `egret.toml`; put them in the environment from your secret store. The example generates new random
keys on every run, which is wrong for a real deployment: generate them once and store them (see the master key note above).

## Example: environment only (containers)

```bash
EGRET_DATABASE__URL=postgres://egret:...@postgres:5432/egret
EGRET_STORAGE__ENDPOINT=http://rustfs:9000
EGRET_STORAGE__BUCKET=warehouse
EGRET_STORAGE__PATH_STYLE=true
EGRET_CATALOG__ENABLED=true
EGRET_CATALOG__WAREHOUSE=s3://warehouse
EGRET_CATALOG__PUBLIC_URL=http://egret.egret-system.svc.cluster.local:8080
EGRET_WORKFLOW__WORKER_ENABLED=true
```

This is the shape the Helm chart renders into the `egret-env` ConfigMap, with credentials in the `egret-secrets` Secret.
See [Kubernetes](./kubernetes).

## Address settings that people confuse

Several keys hold a URL, and each names a different audience. Setting the wrong one is the most common configuration mistake
after the missing storage credentials.

| Key | Who resolves it | Typical value in a cluster |
|---|---|---|
| `oidc.redirect_url` | The **browser**, after the identity provider | `https://egret.example.com/api/auth/oidc/callback` |
| `catalog.public_url` | **Engines** inside the cluster, to fetch the catalog and signing keys. Also the fallback for the issuer. | `http://egret.<namespace>.svc.cluster.local:8080` |
| `idp.issuer` | **Clients outside the cluster**, to fetch `/.well-known/openid-configuration`; it is the `iss` of every machine token | `https://egret.example.com` |
| `data_api.public_url` | **Data API consumers** outside the cluster | `https://egret.example.com` |
| `automation.public_url` and `renderer_url` | The **renderer service**, to fetch print pages and for the server to reach it | In-cluster Service names |
| `automation.browser_url` | **People**, in the links of notification emails | `https://egret.example.com` |

When `idp.issuer` and `data_api.public_url` are unset they fall back to `catalog.public_url`. That is correct on one
machine, where all of them are the same address, and wrong in a cluster where `catalog.public_url` is a Service name.

## Viewing the effective configuration

There is no endpoint that prints the loaded configuration. To check what the server picked up, read the startup log
(`EGRET_LOG__FILTER=info,egret=debug`) and the validation messages. The route `/control-plane/config` exists in the web
app but renders a blank page and is not linked from the UI.

## Further reading

- [Configuration keys reference](../reference/configuration-keys)
- [Security hardening checklist](./security-hardening)
