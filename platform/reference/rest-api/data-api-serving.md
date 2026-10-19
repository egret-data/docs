---
sidebar_position: 21
sidebar_label: Data API serving
description: REST endpoints in the data-api-serving group.
---

# Data API serving API

Published Data API endpoints, called by service accounts with a bearer token.

This page lists 3 endpoints (OpenAPI tag `data-api-serving`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/data-api/v1/{ws}` | `serve_contract` | Fetch this service account's own API contract |
| GET | `/data-api/v1/{ws}/{path}` | `serve_get` |  |
| POST | `/data-api/v1/{ws}/{path}` | `serve_post` |  |

## GET `/data-api/v1/{ws}`

Operation id: `serve_contract`. Auth: Bearer token (a `data-api` JWT from `POST /oauth/token`).

Fetch this service account's own API contract

Returns an OpenAPI 3.0.3 document describing every published endpoint THIS service account may invoke in this workspace, taken from each endpoint's frozen published version. The account is read from the bearer token, so the document is always the caller's own and never another account's. Endpoints the account holds no invoke grant on are absent entirely — paths, parameters and column names alike — so an empty `paths` object means this account has been granted nothing rather than that the workspace is empty. The document is generated per request and reflects grants, publishes and endpoint state as they are at that instant; it is not cacheable.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `ws` | path | string | yes | Workspace slug; must match the token's `ws` claim |

**Response 200 (application/json)**: `object`

| Status | Meaning |
|---|---|
| 200 | An OpenAPI 3.0.3 document describing exactly the endpoints THIS service account may invoke, and nothing else in the workspace. `servers[0].url` is this same URL, so joining it with a `paths` key gives a URL that can be called with the same... |
| 401 | `key_invalid` — bearer token missing, expired, or not for this audience |
| 404 | `not_found` — no such workspace, or it is not the one the token was issued for, or it is archived. One code for all three, so a caller cannot learn that a workspace exists |
| 413 | `payload_too_large` — the request declared a body larger than this surface accepts |
| 429 | `rate_limited` — this service account's contract allowance is spent; `Retry-After` states when it refills. The allowance is egret's, not an endpoint's: building this document is the most expensive request on the surface, so it has a bucket... |
| 500 | `internal` — an egret-side fault, including a workspace with more live endpoints than one document may describe; quote `request_id` to support |
| 503 | `output_naming_collision` — an endpoint this account may invoke has a published output that maps two columns onto one key, so there is no document to describe it; its author must re-publish. `overloaded` — egret shed the request because the... |
| 504 | `deadline_exceeded` — the request outran egret's own serving deadline |

## GET `/data-api/v1/{ws}/{path}`

Operation id: `serve_get`. Auth: Bearer token (a `data-api` JWT from `POST /oauth/token`). Forbidden (403): `data_access_denied` — the engine refused this service account the underlying data, either because it lacks a data permission (a Ranger grant, say) or because its engine credential is bad or expired; one code, because the two recognitions available (Trino's typed 401/403 from the coordinator, and every other engine failure matched on its own message) cannot tell those causes apart. `not_granted` — egret refused the call because the service account holds no invoke grant on this endpoint.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `ws` | path | string | yes | Workspace slug; must match the token's `ws` claim |
| `path` | path | string | yes | The endpoint's published path, e.g. `reports/daily` |
| `X-Egret-Version` | header | integer (int32) | no | Pin the request to a published version of this endpoint, so a publish does not move this caller until they choose to move. Omit it to call whatever is live — the behaviour every caller had before this header existed. The number is the... |

**Response 200 (application/json)**: `ServingResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | ServingStatus | yes | Always [`ServingStatus::Ok`] here — this type is only built on the success path — but read off `StatusCode::OK` rather than written as a constant, so the two cannot drift apart. See [`ServingStatus`]. |
| `message` | string, nullable | no | `null` on success. It is the human-readable half of a REFUSAL ([`ServingErrorBody`](super::error::ServingErrorBody)), not a success banner, and a client that finds a string here is reading an error. |
| `data` | object | yes | The rows for a ONE-statement endpoint — an array of objects (default) or of arrays, per `output.shape` — and an object keyed by statement NAME for several. |
| `meta` | ServingMeta | yes | The endpoint-wide half of `meta`, plus whichever contract shape the endpoint's statement count calls for. |

| Status | Meaning |
|---|---|
| 200 | Rows from the published snapshot |
| 400 | `row_limit_exceeded` — the result exceeded the endpoint's row cap; `param_missing` — a required parameter was not supplied; `param_invalid` — a supplied parameter failed its declared type, its `allowed` list, or was repeated where one value... |
| 401 | `key_invalid` — bearer token missing, expired, or not for this audience |
| 403 | `data_access_denied` — the engine refused this service account the underlying data, either because it lacks a data permission (a Ranger grant, say) or because its engine credential is bad or expired; one code, because the two recognitions... |
| 404 | `not_found` — no such live endpoint in this workspace |
| 409 | `version_unavailable` — the version named by `X-Egret-Version` is not one this endpoint can serve: it was never published, or a rollback has moved consumers off it. One code for both, because a consumer's action is the same either way and... |
| 413 | `payload_too_large` — the request declared a body larger than this surface accepts |
| 429 | `rate_limited` — a published rate limit was exceeded; `Retry-After` states when the bucket refills |
| 500 | `internal` — an egret-side fault (the metastore, the secret store, a corrupt snapshot); quote `request_id` to support. `endpoint_query_failed` — the engine ran the endpoint's published statement and refused it: the request was fine and the... |
| 502 | `engine_unavailable` — the query engine behind this endpoint could not be reached. An operator's problem, not the endpoint author's; the engine, its host and its port are deliberately not named |
| 503 | `schema_drift` / `output_naming_collision` / `cache_scope_stale` / `governance_stale` / `param_gate_stale` — the published configuration no longer describes the data, was frozen before the current parameter-safety rules existed, or points... |
| 504 | `timeout` — the endpoint's statement exceeded the time budget its author published (`limits.timeout`); the fix is the endpoint's, not the caller's. `deadline_exceeded` — the request outran egret's own serving deadline. Two codes for one... |

## POST `/data-api/v1/{ws}/{path}`

Operation id: `serve_post`. Auth: Bearer token (a `data-api` JWT from `POST /oauth/token`). Forbidden (403): `data_access_denied` — the engine refused this service account the underlying data, either because it lacks a data permission (a Ranger grant, say) or because its engine credential is bad or expired; one code, because the two recognitions available (Trino's typed 401/403 from the coordinator, and every other engine failure matched on its own message) cannot tell those causes apart. `not_granted` — egret refused the call because the service account holds no invoke grant on this endpoint.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `ws` | path | string | yes | Workspace slug; must match the token's `ws` claim |
| `path` | path | string | yes | The endpoint's published path, e.g. `reports/daily` |
| `X-Egret-Version` | header | integer (int32) | no | Pin the request to a published version of this endpoint, so a publish does not move this caller until they choose to move. Omit it to call whatever is live — the behaviour every caller had before this header existed. The number is the... |

**Response 200 (application/json)**: `ServingResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | ServingStatus | yes | Always [`ServingStatus::Ok`] here — this type is only built on the success path — but read off `StatusCode::OK` rather than written as a constant, so the two cannot drift apart. See [`ServingStatus`]. |
| `message` | string, nullable | no | `null` on success. It is the human-readable half of a REFUSAL ([`ServingErrorBody`](super::error::ServingErrorBody)), not a success banner, and a client that finds a string here is reading an error. |
| `data` | object | yes | The rows for a ONE-statement endpoint — an array of objects (default) or of arrays, per `output.shape` — and an object keyed by statement NAME for several. |
| `meta` | ServingMeta | yes | The endpoint-wide half of `meta`, plus whichever contract shape the endpoint's statement count calls for. |

| Status | Meaning |
|---|---|
| 200 | Rows from the published snapshot |
| 400 | `row_limit_exceeded` — the result exceeded the endpoint's row cap; `param_missing` — a required parameter was not supplied; `param_invalid` — a supplied parameter failed its declared type, its `allowed` list, or was repeated where one value... |
| 401 | `key_invalid` — bearer token missing, expired, or not for this audience |
| 403 | `data_access_denied` — the engine refused this service account the underlying data, either because it lacks a data permission (a Ranger grant, say) or because its engine credential is bad or expired; one code, because the two recognitions... |
| 404 | `not_found` — no such live endpoint in this workspace |
| 409 | `version_unavailable` — the version named by `X-Egret-Version` is not one this endpoint can serve: it was never published, or a rollback has moved consumers off it. One code for both, because a consumer's action is the same either way and... |
| 413 | `payload_too_large` — the request declared a body larger than this surface accepts |
| 429 | `rate_limited` — a published rate limit was exceeded; `Retry-After` states when the bucket refills |
| 500 | `internal` — an egret-side fault (the metastore, the secret store, a corrupt snapshot); quote `request_id` to support. `endpoint_query_failed` — the engine ran the endpoint's published statement and refused it: the request was fine and the... |
| 502 | `engine_unavailable` — the query engine behind this endpoint could not be reached. An operator's problem, not the endpoint author's; the engine, its host and its port are deliberately not named |
| 503 | `schema_drift` / `output_naming_collision` / `cache_scope_stale` / `governance_stale` / `param_gate_stale` — the published configuration no longer describes the data, was frozen before the current parameter-safety rules existed, or points... |
| 504 | `timeout` — the endpoint's statement exceeded the time budget its author published (`limits.timeout`); the fix is the endpoint's, not the caller's. `deadline_exceeded` — the request outran egret's own serving deadline. Two codes for one... |

