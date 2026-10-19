---
sidebar_position: 8
---

# Error reference

Every refused call to the Data API answers with the same JSON body and a stable `error.code`. Branch on the code, not on the message: the message is for people and may be reworded.

```json
{
  "status": "error",
  "message": "a parameter value is not valid for this endpoint",
  "error": {
    "code": "param_invalid",
    "message": "a parameter value is not valid for this endpoint",
    "request_id": "6a534646-c135-4720-a469-319ab4d65dad"
  }
}
```

| Field | Meaning |
|---|---|
| `status` | Always `"error"`. It mirrors the HTTP status and never replaces it. |
| `message` | The same sentence as `error.message`, repeated at the top level so `status` and `message` can be read on every response without knowing which body arrived. |
| `error.code` | The stable value to branch on. |
| `error.request_id` | Identifies this call. Search for it on the [Activity](./activity) page (the **Request ID** filter) or quote it to support. |

The OpenAPI document lists every code a client may see; treat an unlisted value as a protocol error. An error never contains the engine's host, a table name or the engine's own message.

## Codes by status

### 400 Bad request

| Code | Meaning | What to do |
|---|---|---|
| `param_missing` | A required parameter was not supplied. | Send it. |
| `param_invalid` | A parameter failed its type, its `allowed` list or its constraints, or a single-value parameter was repeated. | Check the value with **Try it**. The message never names the parameter. |
| `row_limit_exceeded` | The result was larger than the endpoint's **Max rows**. | Narrow the query with a parameter, or ask the author to raise **Max rows**. |
| `version_pin_invalid` | `X-Egret-Version` was not a single positive whole number. | Send an integer such as `2`. |

### 401 Unauthorized

| Code | Meaning | What to do |
|---|---|---|
| `key_invalid` | The bearer token is missing, expired, malformed, or not for this audience. | Request a new token. Tokens last 600 seconds. |

At the token endpoint, failures answer `401 {"error":"invalid_client"}` instead, for an unknown client, a revoked or expired client, or a wrong secret alike.

### 403 Forbidden

| Code | Meaning | What to do |
|---|---|---|
| `not_granted` | Egret refused the call: the service account has no invoke grant on this endpoint. | An endpoint author grants it on the [Access](./endpoints/access) tab. |
| `data_access_denied` | The engine refused the account the underlying data, or its engine credential is bad or expired. | An administrator grants the account on the tables in the engine, for example in Ranger. |

The two are different systems' problems on purpose, so a rise in 403s tells you where to look.

### 404 Not found

| Code | Meaning |
|---|---|
| `not_found` | No live endpoint at this workspace, method and path, or the workspace is not the one the token was issued for. One code for all of them, so a caller cannot learn that a workspace or an endpoint exists. A disabled, trashed or never-published endpoint also answers it. |

### 409 Conflict

| Code | Meaning | What to do |
|---|---|---|
| `version_unavailable` | The version named by `X-Egret-Version` was never published, or is above the live version because a rollback moved consumers off it. | Drop the header or choose a version the endpoint can serve. There is no `Retry-After`: it clears only when a human republishes or you change what you send. |

### 413 Payload too large

| Code | Meaning |
|---|---|
| `payload_too_large` | The request declared a body larger than the serving surface accepts (64 KiB). |

### 429 Too many requests

| Code | Meaning | What to do |
|---|---|---|
| `rate_limited` | A published rate limit was exceeded. | Wait the number of seconds in the `Retry-After` header. |

### 5xx server-side

| Status | Code | Meaning | `Retry-After` |
|---|---|---|---|
| 500 | `endpoint_query_failed` | The engine ran the endpoint's published statement and rejected it. The request was fine; the endpoint is broken. | No |
| 500 | `internal` | An Egret-side fault, for example the metadata store or the secret store. | No |
| 502 | `engine_unavailable` | The query engine behind the endpoint could not be reached. The engine, host and port are not named. | No |
| 503 | `schema_drift` | The published columns no longer describe what the engine returns. Republish to refreeze them. | 300 s (a floor) |
| 503 | `output_naming_collision` | Two columns map onto one key after **Naming** is applied. Republish after fixing the SQL or naming. | 300 s |
| 503 | `cache_scope_stale` | A **Shared** cache scope now sits on a connection that runs queries as the caller. Republish with **Per caller**. | 300 s |
| 503 | `governance_stale` | The database is governed but its connection no longer runs queries as the caller. Restore the connection's per-user setting or the database's governed flag. | 300 s |
| 503 | `param_gate_stale` | The version was frozen before the current parameter-safety rules existed. Republish it. | 300 s |
| 503 | `overloaded` | Egret shed the request because the serving surface was at its concurrency limit (64 in flight). Clears by itself. | 1 s |
| 503 | `rate_limiter_unavailable` | The shared rate-limit store could not be consulted, so the call was refused rather than admitted without a limit. Clears by itself. | 1 s |
| 504 | `timeout` | The endpoint's statement exceeded the **Timeout (seconds)** its author published. The fix is the endpoint's. | No |
| 504 | `deadline_exceeded` | The request outran Egret's own 50-second serving deadline. | No |

`Retry-After` is a floor on the five configuration codes, not a forecast of when the author will fix it. On `rate_limited` it is computed from the bucket and rounded up, so a client that comes back at that second is admitted.

Two 504 codes are deliberate: `timeout` names the endpoint's budget and `deadline_exceeded` names Egret's, so `code` tells you whose limit was hit.

## Errors from the management API

The endpoint, client and alert management APIs (the calls the UI makes) use a different, simpler body: `{"error": "…"}`. Examples seen while writing these docs:

| Situation | Response |
|---|---|
| A duplicate method and path | `409 conflict: an endpoint already exists at GET /orders/by-status in this workspace` |
| A path with a space | `400 invalid input: path must not contain whitespace or control characters` |
| A statement that is not a `SELECT` | `400 invalid input: only SELECT (or a leading WITH … SELECT) may be published; found DROP` |
| Publishing a breaking change without acknowledgement | `409 conflict: publishing this version would break consumers …` |
| A body parameter | `400 invalid input: parameter … is declared with location: body, which cannot be published` |
| A parameter in `LIMIT` | `400 invalid input: a parameter appears in LIMIT/OFFSET …` |

## Handle errors in a client

A robust consumer:

1. Retries `401 key_invalid` once after fetching a new token.
2. Honours `Retry-After` on `429` and `503`.
3. Does not retry `400`, `403`, `404` or `409`: they will not change on their own.
4. Treats `500`, `502` and `504` as retryable with backoff, and records `error.request_id` for every failure.

## Further reading

- [Call an endpoint with curl](./calling-endpoints)
- [Activity](./activity)
- [Alerts on endpoints](../explore/alerts-and-reports/data-api-alerts)
