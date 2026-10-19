---
sidebar_position: 5
---

# Command line

The `egret` binary is the server and a few administrative commands. Every command except `openapi` reads the
[configuration](./configuration-keys), validates it, and exits with one line naming the problem if it is invalid.

```text
egret [COMMAND]

Commands:
  serve      Run the HTTP server
  openapi    Print the aggregated OpenAPI 3.1 document as JSON to stdout and exit
  migrate    Apply database migrations and exit
  init       Bootstrap the initial admin user and default workspace
  workspace  Workspace administration (membership)

Options:
  -h, --help     Print help
  -V, --version  Print version
```

From a source checkout, run it as `cargo run -p egret-bin -- <command>`; the `just` recipes `serve` and `migrate` do that.

## serve

```bash
egret serve
```

Applies pending migrations, then starts the HTTP server on `server.host:server.port` (default `0.0.0.0:8080`). It also starts
the background loops that are enabled: the workflow worker and scheduler, the alert scheduler, retention pruning, and the
Data Apps listener when `apps.origin` is set. The server drains in-flight requests for up to 55 seconds on shutdown.

Health endpoints: `GET /healthz` (the process is up) and `GET /readyz` (the database answers:
`{"status":"ok","db":"up"}`). Prometheus metrics are at `GET /metrics`, unauthenticated.

## migrate

```bash
egret migrate
```

Applies pending database migrations and exits. Use it to migrate before rolling out servers. See [Upgrades and
migrations](../deploy-operate/upgrade).

## init

```bash
egret init [--force]
```

Creates the first local administrator, grants it the `platform_admin` role, creates a workspace called `default` (if absent)
and makes the administrator its `ws_admin`. It runs migrations first.

| Input | Meaning |
|---|---|
| `EGRET_ADMIN_EMAIL` | The administrator's email. Default `admin@egret.local`. |
| `EGRET_ADMIN_PASSWORD` | The password. If unset, a random one is generated. |
| `--force` | Create **another** administrator even if one exists. Without it, `init` logs `a platform_admin already exists` and does nothing. |

The email and password are printed once:

```text
Bootstrap admin: admin@egret.local
Password: <password>
Default workspace: default
```

An email that already exists fails with `conflict: user already exists: <email>`, so a second administrator needs a different
email. See [Cannot sign in](../deploy-operate/troubleshooting/cannot-sign-in).

## workspace add-group

```bash
egret workspace add-group --workspace <slug> --group <idp-group> [--role <role>]
```

Grants an identity-provider group a role in a workspace. It is idempotent.

| Option | Meaning |
|---|---|
| `--workspace` | The workspace slug, for example `engineering`. |
| `--group` | The group's name as it appears in the `groups` claim, for example `data-team`. |
| `--role` | `ws_admin`, `ws_editor` or `ws_viewer`. Default `ws_editor`. |

The grant is recorded as made by the administrator named in `EGRET_ADMIN_EMAIL` (default `admin@egret.local`), who must exist.

## openapi

```bash
egret openapi > openapi.json
```

Prints the OpenAPI 3.1 document and exits. It reads no configuration, and needs no database or network. See the [REST
API](./rest-api).

## Further reading

- [Configuration keys](./configuration-keys)
- [Quick start](../get-started/quick-start)
