---
sidebar_position: 1
---

# REST API

Everything the web app does goes through an HTTP API that you can call yourself. This section lists every endpoint, grouped
by area, with its method, path, authentication, parameters, request and response fields and status codes. It is generated
from the server's `openapi.json` (425 operations in 33 groups).

## Conventions

### Base URL and format

The API is served by the same process and origin as the web app. Paths under `/api` are the application API; the table of
other roots is below. Requests and responses are JSON (`Content-Type: application/json`).

| Root | What it is |
|---|---|
| `/api/...` | The application API: sessions, workspaces, BI, workflows, control plane, governance |
| `/data-api/v1/{ws}/...` | Serving published [Data API](../data-api/overview) endpoints |
| `/oauth/token`, `/.well-known/jwks.json`, `/.well-known/openid-configuration` | Egret's machine identity provider |
| `/catalog/...` | The embedded Iceberg REST catalog (the Iceberg REST specification, not listed here) |
| `/service/...` | The Ranger-compatible policy service polled by engine plugins |
| `/workflows/v1/{ws}/executions/webhook/...` | Anonymous workflow webhooks, mounted only when `workflow.webhooks_enabled` is on |

### Authentication

| Method | Used for | How |
|---|---|---|
| **Session cookie** | The application API | `POST /api/auth/login` with `{"email", "password"}` sets the `egret_session` and `egret_csrf` cookies. Single sign-on sets the same cookies after the browser flow. |
| **CSRF header** | Every `POST`, `PUT`, `PATCH` and `DELETE` with a session | Send the value of the `egret_csrf` cookie in `X-Egret-CSRF`. Without it the answer is `403 csrf check failed`. |
| **Bearer token** | The Data API | `POST /oauth/token` with the OAuth2 `client_credentials` grant returns a JWT with audience `data-api` (600 seconds). Send it as `Authorization: Bearer <token>`. |
| **Bearer token** | `/service/...` | `Bearer <ranger.auth_token>`; open when the token is empty. |
| None | Health and discovery | `/healthz`, `/readyz`, `/api/auth/config`, `/.well-known/*` |

Each endpoint page states its auth in the line under the heading. Permission requirements appear as the *Forbidden (403)*
text, for example *Missing dataset:manage permission*; see [Permissions](./permissions).

### Calling the API with curl

Signing in and making a call (the local sign-in is rate limited to 5 attempts per 5 minutes, so reuse the cookie jar):

```bash
BASE=http://localhost:8080

curl -s -c jar.txt -X POST $BASE/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@egret.local","password":"..."}'

CSRF=$(awk '$6=="egret_csrf"{print $7}' jar.txt)

# a read needs only the cookie
curl -s -b jar.txt $BASE/api/ws/default/datasets

# a write also needs the CSRF header
curl -s -b jar.txt -H "X-Egret-CSRF: $CSRF" -H 'Content-Type: application/json' \
  -X POST $BASE/api/ws/default/databases/test \
  -d '{"engine":"trino","host":"localhost","port":8091,"options":{"user":"egret","http_scheme":"http","catalog":"tpch"}}'
# {"ok":true,"latency_ms":42,"detail":"SELECT 1 ok"}
```

### Workspace-scoped paths

Most of the application API lives under `/api/ws/{workspace}/...`, where `{workspace}` is the workspace **slug** (`default`),
not its id. Control-plane routes live under `/api/control-plane/...` and need platform permissions.

### Errors

An error answers with the matching HTTP status and a JSON body with one field:

```json
{"error": "unauthorized"}
```

| Status | Meaning |
|---|---|
| `400` | Invalid input. Some browser-redirect routes (`/api/auth/oidc/callback`) answer plain text instead of JSON. |
| `401` | No valid session or token. `{"error":"unauthorized"}` |
| `403` | Authenticated, but the permission is missing, or the CSRF header is absent (`csrf check failed`, plain text). |
| `404` | The object does not exist. |
| `409` | A conflict, for example a name that is already taken: `conflict: a chart with that name already exists`. |
| `422` | The JSON body does not match the schema; the text names the field, for example ``source.kind: unknown variant `table`, expected `physical` or `virtual` ``. |
| `429` | Rate limited: `{"error":"too many requests"}`. |
| `500` | An internal error. The body is generic; the server log has the detail. |
| `502` | An engine call failed in a way the API cannot represent, for example `engine: engine: http 406 Not Acceptable`. See [Engine 406 and 502 errors](../deploy-operate/troubleshooting/engine-406-502). |

Long-running work is asynchronous: for example `POST /api/ws/{workspace}/queries` answers `202` with an id, and you poll
`GET /api/ws/{workspace}/queries/{id}`.

### Getting the document itself

`egret openapi` prints the OpenAPI 3.1 document to standard output. It needs no database or network, so it runs in CI:

```bash
egret openapi > openapi.json
```

The pages below are generated from that file with `scripts/gen-api-reference.mjs` in the docs repository
(`node scripts/gen-api-reference.mjs path/to/openapi.json`). Descriptions are the first paragraph of each doc comment in the
source, so some are terse. The document's only declared security scheme is the Data API bearer token; session endpoints are
described by their auth line here.

## Endpoints by area

<!-- api-index:start -->
| Area | Page | Endpoints |
|---|---|---|
| Authentication and identity | [Authentication](rest-api/auth) | 6 |
| Authentication and identity | [OIDC single sign-on](rest-api/oidc) | 3 |
| Authentication and identity | [Machine identity provider](rest-api/idp) | 3 |
| Authentication and identity | [Current user](rest-api/me) | 1 |
| Workspaces and members | [Workspace administration](rest-api/admin-workspaces) | 10 |
| Workspaces and members | [User administration](rest-api/admin-users) | 3 |
| Workspaces and members | [Workspace members](rest-api/workspace-members) | 11 |
| Workspaces and members | [Access requests](rest-api/access-requests) | 4 |
| Workspaces and members | [Sharing](rest-api/shares) | 6 |
| Explore (BI) | [Databases](rest-api/databases) | 9 |
| Explore (BI) | [Queries](rest-api/queries) | 7 |
| Explore (BI) | [SQL Lab](rest-api/sqllab) | 15 |
| Explore (BI) | [Datasets](rest-api/datasets) | 22 |
| Explore (BI) | [Charts](rest-api/charts) | 14 |
| Explore (BI) | [Dashboards](rest-api/dashboards) | 15 |
| Explore (BI) | [Folders](rest-api/folders) | 4 |
| Explore (BI) | [Alerts and reports](rest-api/alerts) | 21 |
| Explore (BI) | [Data Apps](rest-api/apps) | 19 |
| Data API | [Data API management](rest-api/data-api) | 29 |
| Data API | [Data API serving](rest-api/data-api-serving) | 3 |
| Workflows | [Workflows](rest-api/workflow) | 53 |
| Data governance | [Permission model](rest-api/perm) | 34 |
| Data governance | [Policy administration](rest-api/policy-admin) | 14 |
| Data governance | [Ranger-compatible policy service](rest-api/ranger) | 6 |
| Data governance | [Governance data browser](rest-api/control-plane-governance) | 11 |
| Data governance | [Classification tags](rest-api/control-plane-tags) | 8 |
| Control plane | [Access control](rest-api/control-plane-access) | 26 |
| Control plane | [Engines](rest-api/control-plane-engines) | 26 |
| Control plane | [Catalog registry](rest-api/control-plane-catalog-registry) | 14 |
| Control plane | [Egret warehouses](rest-api/control-plane-catalog) | 30 |
| Control plane | [Storage connections](rest-api/control-plane-storage) | 7 |
| Control plane | [Secrets](rest-api/control-plane-secrets) | 4 |
| Control plane | [Audit log](rest-api/control-plane-audit) | 1 |
<!-- api-index:end -->
