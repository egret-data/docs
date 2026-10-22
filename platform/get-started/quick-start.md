---
sidebar_position: 4
---

# Quick start

This page runs Egret on your machine: PostgreSQL, an S3-compatible object store, Trino and Keycloak in Docker, and the
server and web app from source. It takes about 20 minutes, most of it the first Rust build.

**Only want to try Egret?** [Run the demo stack](./run-the-demo-stack) instead: `just demo-up` starts the whole platform,
seeded with sample data, on Docker alone, with no Rust toolchain or Node.js needed. This page is for working on Egret itself.

:::note How this page was verified
The server steps (migrate, init, serve, sign-in) were run against a clean database with the binary built from the
repository. The first Rust build, `just up` and the web dev server were not repeated from an empty machine; the commands
for them come from the repository's `justfile`, `.env.example` and compose file.
:::

## Prerequisites

| Tool | Why |
|---|---|
| Rust (the stable toolchain, see `rust-toolchain.toml`) | Builds the server. |
| Node.js | Runs the web app's dev server. |
| Docker with Compose | Runs the dependencies. |
| [`just`](https://github.com/casey/just) | Runs the repository's recipes (`just --list` shows them all). |

## Start the dependencies

```bash
git clone https://github.com/egret-data/platform.git
cd platform
cp .env.example .env
just up
```

`just up` runs `docker compose -f deploy/docker-compose.dev.yml up -d`. It starts PostgreSQL (5432), RustFS (S3 on 9000,
console on 9001), Valkey (6399), Trino (8090), StarRocks (9030) and Keycloak (8081). The [Local
Docker Compose](../deploy-operate/local) page describes each service.

:::warning The key in `.env.example` is public
`EGRET_SECURITY__SECRET_KEY` in `.env.example` is a development value that anyone can read. It is fine on your laptop.
Never reuse it anywhere else; see the [security checklist](../deploy-operate/security-hardening).
:::

## Create the bucket

The server refuses to start unless the object-store credentials are set, even if you never use object storage.
`.env.example` sets them (`EGRET_STORAGE__BUCKET=warehouse` and the credentials the compose file gives RustFS), and a test
in the repository keeps the file passing the server's startup checks. It also sets `EGRET_SECRETS__MASTER_KEY`, which
encrypts the credentials you store (for example a database password). Like the secret key above, that value is public:
replace it with `head -c 32 /dev/urandom | base64` for anything but your laptop.

The bucket does not exist yet: nothing creates it. Create it in the RustFS console at
[http://localhost:9001](http://localhost:9001) (user `egret`, password `egretsecret`), or with any S3 client pointed at `http://localhost:9000`:

```bash
AWS_ACCESS_KEY_ID=egret AWS_SECRET_ACCESS_KEY=egretsecret AWS_DEFAULT_REGION=us-east-1 \
  aws --endpoint-url http://localhost:9000 s3 mb s3://warehouse
```

## Create the administrator and start the server

`just` loads `.env` for its own recipes, but running the binary directly does not, so export the file into your shell
first:

```bash
set -a; source .env; set +a   # export the variables from .env into this shell
just migrate                  # applies the database migrations (about 15 seconds the first time)
cargo run -p egret-bin -- init
```

`init` creates the first administrator and a workspace called `default`, and prints the result once:

```text
Bootstrap admin: admin@egret.local
Password: <a generated password>
(generated; shown only this once)
Default workspace: default
```

Copy the password. To choose it yourself, set `EGRET_ADMIN_PASSWORD` (and `EGRET_ADMIN_EMAIL`) before running `init`; `init`
then prints `Password: taken from EGRET_ADMIN_PASSWORD (not shown)` instead of the value.
`init` does nothing if a platform administrator already exists; add `--force` to create another one.

```bash
just serve                    # the server, on http://localhost:8080
```

In a second terminal, start the web app:

```bash
cd frontend
npm ci
npm run dev                   # http://localhost:5173, proxies /api to the server
```

Check that the server is healthy:

```bash
curl http://localhost:8080/readyz
# {"status":"ok","db":"up"}
```

## Sign in

Open [http://localhost:5173](http://localhost:5173). `.env.example` turns single sign-on on, so the page offers **Sign in with SSO** (the Keycloak
users from `deploy/keycloak/egret-realm.json`: `admin-sso` / `Admin12345!`, `member-sso` / `Member12345!` and `tester` /
`pw`) and an **Admin sign-in (break-glass)** link for the local administrator you created above.

![The sign-in page with single sign-on enabled](/img/platform/ops/get-started/sign-in.png)

Use **Admin sign-in (break-glass)** with `admin@egret.local` and the generated password for your first sign-in. An SSO
user starts with no access: the group-to-role grants are made by an administrator. The [First login
tour](./first-login-tour) explains both.

:::caution Sign-in rate limit
Local sign-in allows 5 attempts per 5 minutes, successful ones included. Further attempts answer *429 Too Many Requests*
until the window passes.
:::

## Connect Trino

The Trino in the compose file listens on port 8090 with JWT authentication, which is meant for per-user delegation. For a
first look, use any Trino you can reach without authentication, or follow [Your first dashboard](./first-dashboard), which
assumes a Trino with the `tpch` catalog.

:::warning Trino and forwarded headers
Egret sends `X-Forwarded-Proto` to Trino. A stock Trino rejects that header with HTTP 406 unless
`http-server.process-forwarded=true` is set, and Egret then reports a generic *502 Bad Gateway*. See [Engine 406 and 502
errors](../deploy-operate/troubleshooting/engine-406-502).
:::

## Optional: demo data

Not to be confused with the [demo stack](./run-the-demo-stack)'s seed (`just demo-seed`): with the server running, `just seed-demo` provisions a demo Iceberg catalog with namespaces, five tables, roles and
clients. It needs the catalog enabled (`EGRET_CATALOG__ENABLED=true` with `EGRET_CATALOG__AUTH_TOKEN`); see [Storage and
catalog setup](../deploy-operate/storage-and-catalog).

## Stop everything

```bash
just down        # stops and removes the containers; the PostgreSQL and RustFS volumes are kept
```

## Next

- [Run the demo stack](./run-the-demo-stack), for a seeded instance with Data Apps, reports and engine provisioning
- [Take a tour of the app](./first-login-tour)
- [Build your first dashboard](./first-dashboard)
