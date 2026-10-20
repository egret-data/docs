---
sidebar_position: 1
---

# Local Docker Compose

The repository ships a Docker Compose file, `deploy/docker-compose.dev.yml`, that starts the dependencies of a development
instance. The Egret server itself is **not** in the compose file: you run it from source with `just serve`. This page
describes each service, how Egret uses it, and the `just` recipes around it. For a step-by-step first run, see the
[Quick start](../get-started/quick-start).

The repository has a second Compose file, `deploy/docker-compose.demo.yml`, that runs **everything** in containers, Egret
included, with sample content and no Rust toolchain: `just demo-up`. It is for trying the product, not for developing it; see
[Run the demo stack](../get-started/run-the-demo-stack). The two stacks are separate Compose projects (`egret-dev` and
`egret-demo`) with separate volumes, but both want host port 8080 (the demo stack's edge and the dev server), so move one of
them (`DEMO_PORT`, or `EGRET_SERVER__PORT`) to run both.

```bash
cp .env.example .env
just up       # docker compose -f deploy/docker-compose.dev.yml up -d
just serve    # cargo run -p egret-bin -- serve
```

`just down` stops and removes the containers and keeps the named volumes (`pgdata`, `rustfsdata`). The compose project is
named `egret-dev`.

## The services

| Service | Image | Host ports | What it is for |
|---|---|---|---|
| `postgres` | `postgres:16` | 5432 | The metadata database. User, password and database are all `egret`. Egret keeps all its tables here, in several schemas (for example `workflow`, `audit`, `policy` and `query`), and applies about 200 migrations to it. |
| `valkey` | `valkey/valkey:8` | 6399 (to 6379 in the container) | The shared limiter and response cache for the Data API (`data_api.shared_store_url`). The dev server does not need it; `just check` does, for the store tests. No volume: its contents can be rebuilt. |
| `rustfs` | `rustfs/rustfs:1.0.1` | 9000 (S3 API), 9001 (console) | S3-compatible object storage. Access key `egret`, secret `egretsecret`. It replaced MinIO, whose public images were withdrawn. It must support STS `AssumeRole`, because the embedded catalog vends credentials through it. |
| `trino` | `trinodb/trino:483` (pinned by digest) | 8090 (HTTP), 8453 (HTTPS) | A development Trino with JWT authentication against Keycloak and a file-based group access control. JWT is only enforced over TLS, so the HTTPS listener uses a self-signed keystore (`deploy/trino/etc/gen-certs.sh` makes it). It ships no catalogs: mount property files into `deploy/trino/catalog`. |
| `starrocks` | `starrocks/allin1-ubuntu:4.1.6` (pinned by digest) | 9030 (MySQL protocol), 8030 (FE HTTP) | A single-container StarRocks. The Ranger plugin configuration (`ranger-starrocks-security.xml`, `ranger-starrocks-audit.xml`) is mounted into the front end. |
| `keycloak` | `quay.io/keycloak/keycloak:26.0` | 8081 | The development identity provider, started with `start-dev --import-realm`. The `egret` realm is imported from `deploy/keycloak/egret-realm.json`. The Keycloak administrator is `admin` / `admin`. |
| `frontend` | built from `frontend/` (nginx) | 5173 | The production build of the web app, for static smoke tests only. The backend is not containerized in this file, so `/api` does not resolve from it. Use `npm run dev` in `frontend/` for development. |

:::warning Everything here is a development default
The credentials above are public. The compose file is not a deployment template; see [Kubernetes](./kubernetes) and the
[security hardening checklist](./security-hardening).
:::

## How the server finds them

`.env.example` points the server at these services. The variables the server reads are in the [configuration
keys](../reference/configuration-keys); the ones that matter for the compose stack are:

| Need | Variable | Value for the compose stack |
|---|---|---|
| Metadata database | `EGRET_DATABASE__URL` | `postgres://egret:egret@localhost:5432/egret` |
| Object storage | `EGRET_STORAGE__ENDPOINT`, `__BUCKET`, `__ACCESS_KEY`, `__SECRET_KEY` | `http://localhost:9000`, a bucket you create, `egret`, `egretsecret` |
| Single sign-on | `EGRET_OIDC__ISSUER_URL`, `__CLIENT_ID`, `__CLIENT_SECRET`, `__REDIRECT_URL` | `http://localhost:8081/realms/egret`, `egret`, `egret-secret`, `http://localhost:5173/api/auth/oidc/callback` |

`.env.example` does not include the `EGRET_STORAGE__*` variables, and the server will not start without them; the Quick
start shows the lines to add.

The OIDC redirect URL must be on the origin the browser uses. With the Vite dev server that is port 5173, so the session
cookie is set for the app and not for port 8080.

## Isolated instances

To try something without touching an existing dev database, give the instance its own PostgreSQL database and storage
bucket and port:

```bash
docker exec egret-dev-postgres-1 psql -U egret -d postgres -c 'CREATE DATABASE egret_scratch'

EGRET_DATABASE__URL=postgres://egret:egret@localhost:5432/egret_scratch \
EGRET_STORAGE__BUCKET=scratch EGRET_SERVER__PORT=18080 \
EGRET_STORAGE__ACCESS_KEY=egret EGRET_STORAGE__SECRET_KEY=egretsecret \
  cargo run -p egret-bin -- serve
```

If you also enable Data Apps (`apps.origin`), give each instance its own `apps.listen`: that listener binds
`0.0.0.0:8081` by default. Changing the port does not change the catalog's advertised address: with the catalog on, also
set `EGRET_CATALOG__PUBLIC_URL` to the new origin, or the token issuer in `/.well-known/openid-configuration` keeps
saying `http://localhost:8080` (observed on an instance started on port 18080).

## StarRocks and Ranger in the compose stack

The StarRocks front end only enforces Ranger policies when `access_control = ranger` is in `fe.conf` before the process
starts. Mounting the two XML files is not enough, and `ADMIN SET FRONTEND CONFIG` does nothing on a running front end:

```bash
docker compose -f deploy/docker-compose.dev.yml exec starrocks sh -c \
  "echo 'access_control = ranger' >> /data/deploy/starrocks/fe/conf/fe.conf"
docker compose -f deploy/docker-compose.dev.yml restart starrocks
```

A recreated container regenerates `fe.conf`, so the setting is lost without any warning after `down` and `up`, or after
`just reset-testdata`. If a query that should be denied or masked suddenly returns clear data, check this first. See
[Engines and Ranger setup](./engines-and-ranger).

## Recipes

`just --list` shows every recipe. The ones for running a development stack:

| Recipe | What it does |
|---|---|
| `just up`, `just down` | Start and stop the compose stack. |
| `just migrate` | Apply database migrations (`egret migrate`). |
| `just serve` | Run the server (`egret serve`). `serve` also runs migrations at start. |
| `just seed-demo` | With a running server, provision a demo catalog in the `demo` workspace: a RustFS storage connection, a warehouse, an engine role and client, five Iceberg tables, and a reader role that sees only two of them. |
| `just seed-alerts` | Seed ten alert and report schedules that cover every state of the UI. |
| `just reset-testdata` | Wipe the catalog, test workspaces and RustFS; keep users and the `demo` and `eng` workspaces. |
| `just check` | Format, lint and run the whole test suite. It needs Postgres and Valkey from `just up`, and a JVM with Maven for the Ranger gates. |
| `just demo-up`, `just demo-down`, `just demo-reset` | Start, stop, and stop and delete the volumes of the [demo stack](../get-started/run-the-demo-stack). |
| `just demo-seed`, `just demo-logs` | Re-run the demo stack's idempotent seed; follow its logs (`just demo-logs egret` for one service). |
| `just demo-verify-apps`, `just demo-verify-engine` | Browser checks of Data Apps and of **Add engine** on a running demo stack (they need Node.js and Playwright). |
| `just k8s-up`, `just deploy-kind` | A local Kubernetes cluster and the Helm chart; see [Kubernetes](./kubernetes). |

## Further reading

- [Configuration](./configuration)
- [Authentication setup](./authentication)
- [Troubleshooting](./troubleshooting)
