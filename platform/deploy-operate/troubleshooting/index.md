---
sidebar_position: 0
---

# Troubleshooting

Find the symptom, read the cause, apply the fix. Each page below is organized by what you see, quotes the exact message the
product shows, and says how to confirm the cause. The ones marked *reproduced* were reproduced on a running instance for these
docs.

| You see | Go to |
|---|---|
| The sign-in page rejects you, answers *429*, loops back, or you are signed in and see nothing | [Cannot sign in](troubleshooting/cannot-sign-in) |
| A query fails, times out or returns fewer rows than expected | [Queries fail](troubleshooting/queries-fail) |
| *502 Bad Gateway*, or `http 406 Not Acceptable`, when you save a database, test a connection or create a dataset | [Engine 406 and 502 errors](troubleshooting/engine-406-502) |
| A workflow execution stays in *Running*, or a schedule never fires | [Workflows stuck](troubleshooting/workflows-stuck) |
| The server will not start because of storage, or a catalog or a stored secret is rejected | [Catalog and storage errors](troubleshooting/catalog-storage-errors) |
| The identity provider redirects back with an error, or a plain-text error appears at `/api/auth/oidc/callback` | [SSO errors](troubleshooting/sso-errors) |

## First checks for anything

1. **Is the server healthy?** `curl http://<host>/readyz` answers `{"status":"ok","db":"up"}` when the database is
   reachable. `/healthz` answers as long as the process is up.
2. **What does the log say?** The server logs to standard output. Raise detail with `EGRET_LOG__FILTER=info,egret=debug`.
   At start it prints one line for every disabled subsystem: `workflow worker disabled by config`,
   `workflow scheduler disabled by config`, `kubernetes unavailable; engine provisioning disabled`.
3. **Did startup validation stop it?** A one-line `Error:` naming a key; see [Startup
   checks](../reference/configuration-keys#startup-checks).
4. **Is it a known issue?** See [Known issues](../known-issues).

## Quick reference

| Symptom | Cause and fix | Page |
|---|---|---|
| *502 Bad Gateway* creating a dataset or testing a database on Trino | Trino answered HTTP 406. Set `http-server.process-forwarded=true` on Trino. | [406 and 502](troubleshooting/engine-406-502) |
| *429 Too Many Requests* at sign-in | Five attempts per five minutes, successful ones included. Wait. | [Cannot sign in](troubleshooting/cannot-sign-in) |
| A workflow execution stays in *Running* | The worker is off by default: `EGRET_WORKFLOW__WORKER_ENABLED=true`. | [Workflows stuck](troubleshooting/workflows-stuck) |
| `Error: the apps API requires [storage] bucket, access_key, secret_key` at start | The object-store credentials are always required. | [Catalog and storage errors](troubleshooting/catalog-storage-errors) |
| *secrets master_key is not configured* when saving a connection | Set `EGRET_SECRETS__MASTER_KEY`. | [Catalog and storage errors](troubleshooting/catalog-storage-errors) |
| *kubernetes unavailable; engine provisioning disabled* in the log | No cluster. **Register external engine** still works; **Add engine** does not. | [Engines and Ranger setup](./engines-and-ranger) |
| *csrf check failed* (403) from a script | Send the `egret_csrf` cookie's value in the `X-Egret-CSRF` header. | [Cannot sign in](troubleshooting/cannot-sign-in) |
| `/control-plane/config` renders a blank page | Known issue; the page is not linked from the UI. | [Known issues](../known-issues) |
