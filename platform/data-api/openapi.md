---
sidebar_position: 5
---

# OpenAPI export

Every consumer of an endpoint needs to know its URL, its parameters and the shape of its answer. Egret generates an **OpenAPI 3.0.3** document from the **published** versions of your endpoints, so a client generator, an API explorer or a coworker reading the contract all see the same thing the endpoint serves.

The document is generated **per service account**. It lists exactly the endpoints that account may invoke. An endpoint the account has no grant on is absent entirely, including its path, parameters and column names. An empty `paths` object therefore means the account has been granted nothing, not that the workspace is empty.

## Download from the UI

Two places offer **Download OpenAPI**:

- **Endpoints** list, top right: the document for every live endpoint the chosen account may invoke.
- An endpoint's **Response** tab: the contract of that one endpoint.

![The Download OpenAPI dialog with a service account chosen](/img/platform/data-api/openapi-dialog.png)

1. Press **Download OpenAPI**.
2. Under **Service account**, choose the account the document is for. The dialog says *Choose a service account. The document lists every live endpoint that account may invoke.* (From an endpoint: *Choose the service account this document describes invoke rights for.*)
3. Press **Download**. The browser saves `openapi.json`, or `openapi-<endpoint id>.json` for a single endpoint.

If the workspace has no service accounts the dialog says *No service accounts yet — create one under Clients.* Downloading needs the `data_api_endpoint:manage` permission; without it the dialog reports *You need the data_api_endpoint:manage permission to download this document.*

## Fetch it as a consumer

A consumer can read its own contract with its token. The path is the workspace base URL with nothing after it:

```bash
curl -s "$BASE/data-api/v1/default" -H "Authorization: Bearer $TOKEN"
```

The account is read from the token, so the document is always the caller's own, never another account's. It is generated for each request, reflects grants, publishes and endpoint states at that instant, and is not cacheable (`Cache-Control: no-store`). Building it is the most expensive request on the surface, so it has its own rate limit per service account, shared by all its clients: `429 rate_limited` with `Retry-After`.

The management API offers the same for administrators: `GET /api/ws/{workspace}/data-api/openapi?service_account_id=…`, with an optional `endpoint_id`.

## What the document contains

From the walk-through workspace, for the service account `orders-reporting-bot`:

```json
{
  "openapi": "3.0.3",
  "info": { "title": "Data API", "version": "1.0.0" },
  "servers": [{ "url": "http://localhost:8080/data-api/v1/default" }],
  "security": [{ "egret_oauth2": [] }],
  "components": {
    "securitySchemes": {
      "egret_oauth2": {
        "type": "oauth2",
        "flows": { "clientCredentials": { "tokenUrl": "http://localhost:8080/oauth/token", "scopes": {} } }
      }
    }
  },
  "paths": { "/customers/top": {}, "/orders/by-status": {}, "/orders/page": {}, "/reports/yearly": {} }
}
```

| Part | Content |
|---|---|
| `servers[0].url` | The workspace's base URL. Join it with a key from `paths` to get a callable URL. |
| `components.securitySchemes` | OAuth2 `client_credentials`, with the token URL. The client ID and secret are the ones issued with the service account. |
| `components.schemas` | The shared error body: `ServingErrorBody`, `ServingErrorDetail` (with every `error.code`), `ServingColumn`, `StatementMeta`. |
| `paths` | One path per granted, live endpoint. |

### An operation

Each operation carries the endpoint's published definition:

| Field | Comes from |
|---|---|
| `operationId` | `dataApi_` plus the endpoint id. |
| `summary`, `description` | The endpoint's **Name** and **Description**. |
| `parameters` | The declared parameters: name, `in: query`, whether required, the description, and a schema built from the type and constraints (`enum` list, `minimum` and `maximum`, string length and pattern, `date` or `date-time` format). Each description ends with a note that repeating a key supplies a list and that `+` decodes to a space. |
| An `X-Egret-Version` header parameter | Lets a caller [pin a version](./endpoints/publishing#pin-a-consumer-to-a-version). |
| `x-egret-version` | The version the document describes, which is the live version. |
| `responses` | `200` with the schema of the success envelope, built from the frozen columns, plus every error status. |

For a column, the schema is a JSON type and `nullable: true`, and `x-egret-engine-type` records the engine's own type, for example `"x-egret-engine-type": "varchar(1)"`. A column that may be absent (from a branch that only some parameters reach) is left out of `required`. For an endpoint with several statements, `data` is an object whose properties are the statement names.

For example, the `year` parameter of the **Yearly revenue summary** endpoint:

```json
{
  "name": "year", "in": "query", "required": true,
  "description": "Calendar year (1992-1998)",
  "schema": { "type": "number", "minimum": 1992, "maximum": 1998 }
}
```

(The real description also carries the note about repeated keys.)

The error statuses documented on every operation are `400`, `401`, `403`, `404`, `409`, `413`, `429`, `500`, `502`, `503` and `504`, each with the codes that produce it, as in the [error reference](./errors).

## Use it

- Import it into an API explorer or a client generator. Authentication is the OAuth2 client-credentials flow described in the document itself.
- Commit it next to a consumer as a contract. Because it comes from the published version, it changes only when you publish, and a version number in `x-egret-version` shows which.
- Check a grant: fetching the document with a token shows exactly what that account can call.

## Limits and known issues

- The document is generated from the **published** version. Draft changes do not appear.
- It is generated on demand, so a very large workspace can hit the generation limit; Egret answers `500 internal` rather than an incomplete document.
- Two columns that collapse onto one key under **Naming** make an endpoint refuse to document (`503 output_naming_collision`); republish after fixing it.

## Further reading

- [Response shape](./endpoints/response)
- [Call an endpoint with curl](./calling-endpoints)
- [Clients](./clients)
