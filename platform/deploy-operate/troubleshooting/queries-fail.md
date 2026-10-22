---
sidebar_position: 2
---

# Queries fail

A query in SQL Lab, a dataset preview, a chart or a dashboard card fails, times out or returns less than you expected.

## How a query runs

Submitting a query (`POST /api/ws/{workspace}/queries`) answers `202` with the query's id and status `queued`. The result is
read from `GET /api/ws/{workspace}/queries/{id}`, whose `status` ends as `succeeded` or `failed`, and a failed query carries
an `error` string. The prefix of that string tells you which side failed:

| Error starts with | Where it failed |
|---|---|
| `engine:` | The query engine (Trino or StarRocks) rejected or failed the query. The text after it is the engine's own message. |
| `connect:` | Egret could not reach the engine at all. |
| Anything else | Egret: validation, permission or storage. |

Reproduced on the demo instance:

```text
engine: line 1:15: Table 'tpch.tiny.nope' does not exist
engine: line 1:1: mismatched input 'SELEC'. Expecting: 'ALTER', 'ANALYZE', ...
```

Both are errors in the SQL or in the object names. Fix the query; there is nothing to do on the server.

## `connect: error sending request`

```text
connect: error sending request for url (http://localhost:18099/v1/statement)
```

Egret cannot open a connection to the host and port of the database connection (reproduced against a closed port).

**Check** from the machine that runs Egret, not from your laptop: `curl -s http://<host>:<port>/v1/info` for Trino. In
Kubernetes, use the address as seen from the Egret pod.

**Causes** A wrong host or port; a firewall or network policy; the engine is down or still starting (StarRocks takes 30 to 60
seconds to become healthy); the connection says `https` but the engine speaks `http`, or the reverse; a self-signed engine
certificate (Egret verifies certificates; the `EGRET_ENGINE_TLS_INSECURE` override is for development only).

Use **Test** on the connection in **Manage → Workspace settings → Engines** to repeat the check; it reports the error and the
latency.

## `engine: http 406 Not Acceptable`, or *502 Bad Gateway*

See [Engine 406 and 502 errors](./engine-406-502).

## The query times out

The per-query timeout is `engine.query_timeout_secs` (default 60 seconds). In SQL Lab a query that runs longer fails with
*timeout: the query ran longer than the 60 s limit for SQL Lab queries and was stopped. The limit is the server setting
`engine.query_timeout_secs`.* (or with Trino's *exceeded maximum time limit* and the same hint). Data Apps have their own limit
(`apps.timeout_secs`, 60). Raise the key if long queries are legitimate, or make the query cheaper. The key must stay at
least 1.

## Fewer rows than expected

| Limit | Where | Default |
|---|---|---|
| The **Limit** control in SQL Lab (for example *1,000 rows*) | The toolbar | 1,000 |
| `engine.max_rows` | Server | 100,000 |
| `engine.preview_rows` | Server, for previews | 100 |
| Row limit on a chart | The chart's Data tab | 1,000 (up to 10,000) |
| `apps.max_rows` | Data Apps gateway | 10,000 |

A result that hit a cap is marked as truncated in the query's status (`"truncated": true`), and SQL Lab shows the chip
*Results were limited to n rows.*

## *Missing query:run permission* (403)

Running SQL needs `query:run` in the workspace. The built-in `ws_admin` and `ws_editor` roles hold it; `ws_viewer` does not.
See [Permissions](../../reference/permissions) and **Manage → Workspace settings → Roles & permissions**.

## Results differ per person, or a column is masked

If the connection has **Governed data** on, row filters and column masks apply per user at the engine. A different person
seeing different rows is the policy working. Use **Explain access** under **Governance → People & groups** to see what applies to a person. If a
filter or mask you expect is **missing** on StarRocks, check `access_control = ranger` in the front end's `fe.conf` (it is
lost when the container is recreated) and remember that StarRocks' plugin does not enforce tag-based masks. See [Engines and
Ranger setup](../engines-and-ranger).

## Per-user delegation fails

A connection with **Per-user delegation** runs queries as the signed-in user with a token the engine verifies. It needs
single sign-on, a token audience the engine accepts (`trino` or `starrocks` in the development realm), and an engine
configured for JWT. A user signed in with the local break-glass account has no identity-provider token to delegate. See
[Authentication setup](../authentication) and [Engines and Ranger setup](../engines-and-ranger).

## Further reading

- [SQL Lab](../../explore/sql-lab)
- [Databases](../../workspace-settings/databases)
