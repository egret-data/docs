---
sidebar_position: 3
---

# Configuration

Configuration comes from `egret.toml` and from environment variables named `EGRET_<SECTION>__<KEY>` (two underscores between section and key). These are the ones you meet first:

| Setting | Meaning |
|---|---|
| `EGRET_DATABASE__URL` | PostgreSQL connection string. |
| `EGRET_SERVER__PORT` | HTTP port (default 8080). |
| `[secrets] master_key` | Base64 key (at least 32 bytes) that encrypts stored credentials. Without it, registering a database *with a secret* fails. |
| `[storage]` | Object-store `bucket`, `access_key`, `secret_key`. |
| `[catalog]` `enabled`, `auth_token` | Enables the embedded Iceberg catalog. |
| `EGRET_OIDC__ENABLED`, `ISSUER_URL`, `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URL`, `GROUPS_CLAIM` | Single sign-on. The local administrator stays as a *break-glass* login. |
| `EGRET_SECURITY__SECRET_KEY` | Base64 key (at least 64 bytes) that encrypts the OIDC state cookie. **The value in `.env.example` is public; generate your own** (`head -c 64 /dev/urandom \| base64`). |
| `EGRET_RANGER__ENABLED`, `AUTH_TOKEN` | Turns on Ranger policy administration. |
| `EGRET_WORKFLOW__WORKER_ENABLED`, `SCHEDULER_ENABLED` | Workflow worker and trigger scheduler. **Both default to off.** |

The full list is in the [configuration keys reference](../reference/configuration-keys).
