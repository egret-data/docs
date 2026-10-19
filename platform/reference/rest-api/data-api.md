---
sidebar_position: 20
sidebar_label: Data API management
description: REST endpoints in the data-api group.
---

# Data API management API

Data API service accounts and OAuth2 clients.

This page lists 29 endpoints (OpenAPI tag `data-api`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/data-api/activity/calls` | `activity_calls` |  |
| GET | `/api/ws/{workspace}/data-api/activity/summary` | `activity_summary` |  |
| DELETE | `/api/ws/{workspace}/data-api/clients/{id}` | `revoke_client` |  |
| GET | `/api/ws/{workspace}/data-api/endpoints` | `list_endpoints` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints` | `create_endpoint` |  |
| GET | `/api/ws/{workspace}/data-api/endpoints/{id}` | `get_endpoint` |  |
| PATCH | `/api/ws/{workspace}/data-api/endpoints/{id}` | `update_endpoint` |  |
| DELETE | `/api/ws/{workspace}/data-api/endpoints/{id}` | `delete_endpoint` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/bookmark` | `bookmark_endpoint` |  |
| DELETE | `/api/ws/{workspace}/data-api/endpoints/{id}/bookmark` | `unbookmark_endpoint` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/disable` | `disable_endpoint` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/enable` | `enable_endpoint` | The other half of `disable`, and the reason `disable` keeps `live_version_id`: without this route that promise is unfalsifiable, and an endpoint taken out of... |
| GET | `/api/ws/{workspace}/data-api/endpoints/{id}/grants` | `list_endpoint_grants` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/grants` | `grant_endpoint_invoke` |  |
| DELETE | `/api/ws/{workspace}/data-api/endpoints/{id}/grants/{service_account_id}` | `revoke_endpoint_invoke` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/preview` | `preview_endpoint` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/publish` | `publish_endpoint` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/restore` | `restore_endpoint` | The other half of `trash`, and the reason trash keeps the invoke grants and the live version pointer: without this route that promise is unfalsifiable. |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/rollback` | `rollback_endpoint` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/trash` | `trash_endpoint` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/try` | `try_endpoint` |  |
| POST | `/api/ws/{workspace}/data-api/endpoints/{id}/validate` | `validate_endpoint` |  |
| GET | `/api/ws/{workspace}/data-api/endpoints/{id}/versions` | `list_endpoint_versions` |  |
| GET | `/api/ws/{workspace}/data-api/openapi` | `get_openapi` |  |
| GET | `/api/ws/{workspace}/data-api/service-accounts` | `list_service_accounts` |  |
| POST | `/api/ws/{workspace}/data-api/service-accounts` | `create_service_account` |  |
| DELETE | `/api/ws/{workspace}/data-api/service-accounts/{id}` | `delete_service_account` |  |
| GET | `/api/ws/{workspace}/data-api/service-accounts/{id}/clients` | `list_clients` |  |
| POST | `/api/ws/{workspace}/data-api/service-accounts/{id}/clients` | `issue_client` |  |

## GET `/api/ws/{workspace}/data-api/activity/calls`

Operation id: `activity_calls`. Auth: Session cookie. Forbidden (403): Missing data_api_endpoint:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `range` | query | ActivityRange | yes |  |
| `endpoint_id` | query | string (uuid) | no |  |
| `status_code` | query | integer (int32) | no |  |
| `error_code` | query | string | no |  |
| `request_id` | query | string | no |  |
| `include_trials` | query | boolean | no | Off by default. A trial is not consumer traffic, so it must be asked for. |
| `before` | query | string (date-time) | no | Keyset cursor: return rows strictly older than this. |
| `limit` | query | integer (int64) | no | How many rows to return. Default 50, maximum 200; a larger value is clamped to 200 rather than refused. |

**Response 200 (application/json)**: array of `ActivityCallDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `ts` | string (date-time) | yes |  |
| `endpoint_id` | string (uuid), nullable | no |  |
| `endpoint_name` | string, nullable | no |  |
| `request_method` | string, nullable | no | What the caller asked for. The ONLY identification a row carries when `endpoint_id` is null — see migration 0125. |
| `request_path` | string, nullable | no |  |
| `status_code` | integer (int32) | yes |  |
| `error_code` | string, nullable | no |  |
| `duration_ms` | integer (int32) | yes |  |
| `cache_hit` | boolean | yes |  |
| `client_id` | string, nullable | no |  |
| `request_id` | string | yes |  |
| `actor_user_id` | string (uuid), nullable | no | Non-null ⇒ a Try-it run by this person, not consumer traffic. |

| Status | Meaning |
|---|---|
| 200 | Individual calls in the range, most recent first |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:read permission |
| 500 | Internal error |

## GET `/api/ws/{workspace}/data-api/activity/summary`

Operation id: `activity_summary`. Auth: Session cookie. Forbidden (403): Missing data_api_endpoint:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `range` | query | ActivityRange | yes |  |

**Response 200 (application/json)**: `ActivitySummaryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `total` | ActivityRow | yes | One line of the statistics table, or — with `endpoint_id: None` — either the grand total or the unmatched-request bucket, depending on which grouping set produced it. |
| `endpoints` | ActivityRow[] | yes |  |
| `retention_days` | integer (int64), nullable | no | `DataApiConfig::access_log_retention_days`, passed through so the UI can disable ranges that reach past it (spec §4.7). |

| Status | Meaning |
|---|---|
| 200 | Call statistics for the range |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:read permission |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/data-api/clients/{id}`

Operation id: `revoke_client`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing service_account:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Client id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Client revoked. Tokens already minted stay valid for up to DATA_API_TTL_SECS. |
| 401 | Not authenticated |
| 403 | Missing service_account:manage permission |
| 404 | No such client in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/data-api/endpoints`

Operation id: `list_endpoints`. Auth: Session cookie. Forbidden (403): Missing data_api_endpoint:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `trashed` | query | boolean | no | List only trashed endpoints when true; only untrashed ones when absent or false |

**Response 200 (application/json)**: array of `DataApiEndpointListItemDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `path` | string | yes |  |
| `method` | string | yes |  |
| `database_id` | string (uuid) | yes |  |
| `statements` | StatementSpec[] | yes | The endpoint's statements, in execution order. |
| `params` | ParamSpec[] | yes |  |
| `output` | OutputSpec | yes |  |
| `cache` | CacheSpec | yes |  |
| `limits` | LimitsSpec | yes |  |
| `rate_limit` | RateLimitSpec | yes |  |
| `source_kind` | string | yes |  |
| `source_ref` | string (uuid), nullable | no |  |
| `live_version_id` | string (uuid), nullable | no | The version currently served. Never written by this module — publishing is a separate lifecycle. |
| `state` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no | When this endpoint was moved to the trash, or `null` if it is live in the authoring sense — present, listed, editable. |
| `bookmarked` | boolean | yes | Whether the CALLER has starred this endpoint. Per user, never global. |

| Status | Meaning |
|---|---|
| 200 | Endpoint drafts in the workspace, each with the caller's own `bookmarked` flag |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:read permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints`

Operation id: `create_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission — :read does not imply authoring.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `CreateEndpointInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `path` | string | yes | Free-form and user-typed. **Total-reject, not normalised**: a leading slash is optional and one trailing slash is absorbed, but anything else out of shape — an empty segment, a `.`/`..` segment, percent-encoding, a query string, a fragment,... |
| `database_id` | string (uuid) | yes | The connection this endpoint queries. Validated against the CALLER's workspace by the route before it is stored — it arrives from the request body, so nothing else would stop it naming another workspace's database. |
| `statements` | StatementSpec[] | yes | The statements this endpoint runs, in order. Required and non-empty: [`egret_dataapi_api::validate_statements`] refuses an empty list, a name that is not an identifier, and a repeated name, all as a 400 naming the reason — the schema's own... |
| `method` | string, nullable | no |  |
| `description` | string | no |  |
| `folder_id` | string (uuid), nullable | no |  |
| `params` | ParamSpec[], nullable | no |  |
| `output` | OutputSpec | no |  |
| `cache` | CacheSpec | no |  |
| `limits` | LimitsSpec | no |  |
| `rate_limit` | RateLimitSpec | no |  |
| `source_kind` | string, nullable | no |  |
| `source_ref` | string (uuid), nullable | no |  |

**Response 201 (application/json)**: `DataApiEndpointDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `path` | string | yes |  |
| `method` | string | yes |  |
| `database_id` | string (uuid) | yes |  |
| `statements` | StatementSpec[] | yes | The endpoint's statements, in execution order. |
| `params` | ParamSpec[] | yes |  |
| `output` | OutputSpec | yes |  |
| `cache` | CacheSpec | yes |  |
| `limits` | LimitsSpec | yes |  |
| `rate_limit` | RateLimitSpec | yes |  |
| `source_kind` | string | yes |  |
| `source_ref` | string (uuid), nullable | no |  |
| `live_version_id` | string (uuid), nullable | no | The version currently served. Never written by this module — publishing is a separate lifecycle. |
| `state` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no | When this endpoint was moved to the trash, or `null` if it is live in the authoring sense — present, listed, editable. |

| Status | Meaning |
|---|---|
| 201 | Draft created |
| 400 | Empty name or path, or an unsupported method |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission — :read does not imply authoring |
| 404 | No such database in this workspace |
| 409 | Another endpoint already serves that method and path |
| 500 | Internal error |

## GET `/api/ws/{workspace}/data-api/endpoints/{id}`

Operation id: `get_endpoint`. Auth: Session cookie. Forbidden (403): Missing data_api_endpoint:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DataApiEndpointDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `path` | string | yes |  |
| `method` | string | yes |  |
| `database_id` | string (uuid) | yes |  |
| `statements` | StatementSpec[] | yes | The endpoint's statements, in execution order. |
| `params` | ParamSpec[] | yes |  |
| `output` | OutputSpec | yes |  |
| `cache` | CacheSpec | yes |  |
| `limits` | LimitsSpec | yes |  |
| `rate_limit` | RateLimitSpec | yes |  |
| `source_kind` | string | yes |  |
| `source_ref` | string (uuid), nullable | no |  |
| `live_version_id` | string (uuid), nullable | no | The version currently served. Never written by this module — publishing is a separate lifecycle. |
| `state` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no | When this endpoint was moved to the trash, or `null` if it is live in the authoring sense — present, listed, editable. |

| Status | Meaning |
|---|---|
| 200 | The endpoint draft |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:read permission |
| 404 | No such endpoint in this workspace |
| 500 | Internal error |

## PATCH `/api/ws/{workspace}/data-api/endpoints/{id}`

Operation id: `update_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `UpdateEndpointInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string, nullable | no |  |
| `path` | string, nullable | no |  |
| `method` | string, nullable | no |  |
| `description` | string, nullable | no |  |
| `database_id` | string (uuid), nullable | no |  |
| `statements` | StatementSpec[], nullable | no | Replaces the whole list when present. There is no per-statement patch: the order is part of the definition, so "edit statement 2" and "insert a statement" would need an addressing scheme the list itself already is. |
| `params` | ParamSpec[], nullable | no |  |
| `output` | OutputSpec | no |  |
| `cache` | CacheSpec | no |  |
| `limits` | LimitsSpec | no |  |
| `rate_limit` | RateLimitSpec | no |  |
| `source_kind` | string, nullable | no |  |
| `folder_id` | string (uuid), nullable | no |  |
| `source_ref` | string (uuid), nullable | no |  |

**Response 200 (application/json)**: `DataApiEndpointDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `path` | string | yes |  |
| `method` | string | yes |  |
| `database_id` | string (uuid) | yes |  |
| `statements` | StatementSpec[] | yes | The endpoint's statements, in execution order. |
| `params` | ParamSpec[] | yes |  |
| `output` | OutputSpec | yes |  |
| `cache` | CacheSpec | yes |  |
| `limits` | LimitsSpec | yes |  |
| `rate_limit` | RateLimitSpec | yes |  |
| `source_kind` | string | yes |  |
| `source_ref` | string (uuid), nullable | no |  |
| `live_version_id` | string (uuid), nullable | no | The version currently served. Never written by this module — publishing is a separate lifecycle. |
| `state` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no | When this endpoint was moved to the trash, or `null` if it is live in the authoring sense — present, listed, editable. |

| Status | Meaning |
|---|---|
| 200 | Draft updated |
| 400 | Empty name or path, or an unsupported method |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission |
| 404 | No such endpoint, or no such database, in this workspace |
| 409 | Another endpoint already serves that method and path, or the endpoint is in the trash — restore it before editing it |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/data-api/endpoints/{id}`

Operation id: `delete_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Endpoint and its published versions deleted |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission |
| 404 | No such endpoint in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/bookmark`

Operation id: `bookmark_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Endpoint bookmarked for the caller |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:read permission |
| 404 | No such endpoint in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/data-api/endpoints/{id}/bookmark`

Operation id: `unbookmark_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Endpoint bookmark removed for the caller |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:read permission |
| 404 | No such endpoint in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/disable`

Operation id: `disable_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DataApiEndpointDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `path` | string | yes |  |
| `method` | string | yes |  |
| `database_id` | string (uuid) | yes |  |
| `statements` | StatementSpec[] | yes | The endpoint's statements, in execution order. |
| `params` | ParamSpec[] | yes |  |
| `output` | OutputSpec | yes |  |
| `cache` | CacheSpec | yes |  |
| `limits` | LimitsSpec | yes |  |
| `rate_limit` | RateLimitSpec | yes |  |
| `source_kind` | string | yes |  |
| `source_ref` | string (uuid), nullable | no |  |
| `live_version_id` | string (uuid), nullable | no | The version currently served. Never written by this module — publishing is a separate lifecycle. |
| `state` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no | When this endpoint was moved to the trash, or `null` if it is live in the authoring sense — present, listed, editable. |

| Status | Meaning |
|---|---|
| 200 | Stopped serving. The live version pointer is kept, so re-enabling needs no re-publish. |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission |
| 404 | No such endpoint in this workspace |
| 409 | The endpoint is in the trash — restore it first |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/enable`

Operation id: `enable_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission.

The other half of `disable`, and the reason `disable` keeps `live_version_id`: without this route that promise is unfalsifiable, and an endpoint taken out of service could only come back by publishing a NEW version — a fresh describe, a new version number, and a fresh chance for the definition to have drifted in the meantime.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DataApiEndpointDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `path` | string | yes |  |
| `method` | string | yes |  |
| `database_id` | string (uuid) | yes |  |
| `statements` | StatementSpec[] | yes | The endpoint's statements, in execution order. |
| `params` | ParamSpec[] | yes |  |
| `output` | OutputSpec | yes |  |
| `cache` | CacheSpec | yes |  |
| `limits` | LimitsSpec | yes |  |
| `rate_limit` | RateLimitSpec | yes |  |
| `source_kind` | string | yes |  |
| `source_ref` | string (uuid), nullable | no |  |
| `live_version_id` | string (uuid), nullable | no | The version currently served. Never written by this module — publishing is a separate lifecycle. |
| `state` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no | When this endpoint was moved to the trash, or `null` if it is live in the authoring sense — present, listed, editable. |

| Status | Meaning |
|---|---|
| 200 | Serving again, from the same version that was live before |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission |
| 404 | No such endpoint in this workspace |
| 409 | The endpoint has never been published, so there is nothing to serve, or it is in the trash — restore it first |
| 500 | Internal error |

## GET `/api/ws/{workspace}/data-api/endpoints/{id}/grants`

Operation id: `list_endpoint_grants`. Auth: Session cookie. Forbidden (403): Missing data_api_endpoint:manage — listing the grantees is a manage operation, not a read.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `DataApiEndpointGrantDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes | The `access_grants` row id. |
| `service_account_id` | string (uuid) | yes | The granted service account (its `users.id`). |
| `service_account_name` | string, nullable | no | The account's display name, so the list is readable without a second call. `None` if the account row has since been deleted. |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Service accounts granted invoke on this endpoint |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage — listing the grantees is a manage operation, not a read |
| 404 | No such endpoint in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/grants`

Operation id: `grant_endpoint_invoke`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage — granting invoke rights mutates the authorization graph, so :read does not reach it.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `GrantInvokeInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `service_account_id` | string (uuid) | yes | The service account to grant. Must live in this workspace. |

**Response 200 (application/json)**: `DataApiEndpointGrantDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes | The `access_grants` row id. |
| `service_account_id` | string (uuid) | yes | The granted service account (its `users.id`). |
| `service_account_name` | string, nullable | no | The account's display name, so the list is readable without a second call. `None` if the account row has since been deleted. |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Granted (idempotent) |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage — granting invoke rights mutates the authorization graph, so :read does not reach it |
| 404 | No such endpoint, or no such service account, in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/data-api/endpoints/{id}/grants/{service_account_id}`

Operation id: `revoke_endpoint_invoke`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `service_account_id` | path | string (uuid) | yes | Service account to revoke |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Revoked (idempotent). Takes effect on the caller's NEXT request — unlike revoking a client, which cannot recall an already-issued token before its 600s TTL expires |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage |
| 404 | No such endpoint, or no such service account, in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/preview`

Operation id: `preview_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission, or the engine's policy denies a table the query names.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `PreviewEndpointInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `siblings` | string[] | no | The SQL text of the endpoint's OTHER statements, as they are on screen. |
| `params` | ParamSpec[] | no | The parameter declarations as they are on screen right now. |
| `values` | object | no | The author's test values, one list per parameter name. A list, not a scalar, because a repeated parameter is a list on the serving path too and preview must resolve it the same way. |
| `output` | OutputSpec | yes | The response contract as it is on screen — carried for ONE part of it, `transform`, and applied to nothing. |
| `database_id` | string (uuid) | yes | The database picker's current value. Workspace-scoped by `connection_safety`, which answers `NotFound` for a database belonging to another workspace — this id comes from a request body, so it is exactly the shape that could name someone... |

**Response 200 (application/json)**: `DataApiPreviewDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `columns` | ColumnMeta[] | yes |  |
| `rows` | object[][] | yes |  |
| `row_count` | integer (int64) | yes |  |
| `truncated` | boolean | yes | True when the result was longer than [`PREVIEW_MAX_ROWS`] and this is a prefix of it. The connector fetches `cap + 1` and sets this rather than truncating silently, so `row_count == 100` alone cannot tell "exactly at" from "over". |
| `transform_declared` | boolean | yes | True when the draft declares an `output.transform` — so `columns` and `rows` above are the STATEMENT's, and a consumer receives something else entirely (the script's output, described by `returns`). |
| `generated_sql` | string, nullable | no | The template the statement's `build_sql` script returned — `\{\{ \}\}` intact, before any render — or `None` when the author wrote the SQL themselves (package S Task 7). |

| Status | Meaning |
|---|---|
| 200 | The draft ran; up to 100 rows, with the engine's own column names |
| 400 | Not a single SELECT, a parameter mismatch, a test value that does not satisfy its declared type, SQL the engine rejects — with the engine's own message — or a `governed` database reached through a connection that does not run queries as the... |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission, or the engine's policy denies a table the query names |
| 404 | No such endpoint in this workspace, or a database_id belonging to another workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/publish`

Operation id: `publish_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission, or the engine's policy denies a table.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `PublishEndpointInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `note` | string | no | Free-form "what changed", stored on the version. |
| `acknowledge_breaking` | string, nullable | no | The acknowledgement issued by `POST …/validate` for the breaking changes this publish would make, required only when there are some. |

**Response 200 (application/json)**: `DataApiPublishedDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `version_id` | string (uuid) | yes |  |
| `version` | integer (int32) | yes |  |
| `state` | string | yes |  |
| `breaking_changes` | ContractChange[], nullable | no | The breaking changes this publish made, which the caller acknowledged to get here (package 6). |
| `compared_against` | string (uuid), nullable | no | The version [`Self::breaking_changes`] is a statement ABOUT: whatever was live at the instant of the publish. |
| `rollback_breaks` | ContractChange[], nullable | no | What a `rollback` did to the consumers of the version it moved OFF, classified by the same [`crate::contract::compare_contracts`] `publish` uses — and refusing nothing. |

| Status | Meaning |
|---|---|
| 200 | A new immutable version was frozen and is now live |
| 400 | The definition does not validate |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission, or the engine's policy denies a table |
| 404 | No such endpoint in this workspace |
| 409 | The draft was edited while it was being published; the endpoint is in the trash — restore it first; or this version would break consumers of the live one and `acknowledge_breaking` was absent, stale, or sent when nothing breaks. The message... |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/restore`

Operation id: `restore_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission.

The other half of `trash`, and the reason trash keeps the invoke grants and the live version pointer: without this route that promise is unfalsifiable.

Comes back `disabled`, never `live`. See [`EndpointStore::restore`].

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DataApiEndpointDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `path` | string | yes |  |
| `method` | string | yes |  |
| `database_id` | string (uuid) | yes |  |
| `statements` | StatementSpec[] | yes | The endpoint's statements, in execution order. |
| `params` | ParamSpec[] | yes |  |
| `output` | OutputSpec | yes |  |
| `cache` | CacheSpec | yes |  |
| `limits` | LimitsSpec | yes |  |
| `rate_limit` | RateLimitSpec | yes |  |
| `source_kind` | string | yes |  |
| `source_ref` | string (uuid), nullable | no |  |
| `live_version_id` | string (uuid), nullable | no | The version currently served. Never written by this module — publishing is a separate lifecycle. |
| `state` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no | When this endpoint was moved to the trash, or `null` if it is live in the authoring sense — present, listed, editable. |

| Status | Meaning |
|---|---|
| 200 | Endpoint restored from the trash, `disabled` — never straight back to serving |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission |
| 404 | No such endpoint in this workspace |
| 409 | The endpoint is not in the trash |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/rollback`

Operation id: `rollback_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `RollbackEndpointInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `version` | integer (int32), nullable | no |  |
| `version_id` | string (uuid), nullable | no |  |

**Response 200 (application/json)**: `DataApiPublishedDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `version_id` | string (uuid) | yes |  |
| `version` | integer (int32) | yes |  |
| `state` | string | yes |  |
| `breaking_changes` | ContractChange[], nullable | no | The breaking changes this publish made, which the caller acknowledged to get here (package 6). |
| `compared_against` | string (uuid), nullable | no | The version [`Self::breaking_changes`] is a statement ABOUT: whatever was live at the instant of the publish. |
| `rollback_breaks` | ContractChange[], nullable | no | What a `rollback` did to the consumers of the version it moved OFF, classified by the same [`crate::contract::compare_contracts`] `publish` uses — and refusing nothing. |

| Status | Meaning |
|---|---|
| 200 | The named version is live again |
| 400 | Name exactly one of `version` or `version_id` |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission |
| 404 | No such endpoint here, or no such version OF THIS ENDPOINT |
| 409 | The endpoint is in the trash — restore it before changing which version it serves; or the named version can no longer be published onto its database (it became `governed` without a per-principal connection, or a `shared` cache became... |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/trash`

Operation id: `trash_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DataApiEndpointDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `path` | string | yes |  |
| `method` | string | yes |  |
| `database_id` | string (uuid) | yes |  |
| `statements` | StatementSpec[] | yes | The endpoint's statements, in execution order. |
| `params` | ParamSpec[] | yes |  |
| `output` | OutputSpec | yes |  |
| `cache` | CacheSpec | yes |  |
| `limits` | LimitsSpec | yes |  |
| `rate_limit` | RateLimitSpec | yes |  |
| `source_kind` | string | yes |  |
| `source_ref` | string (uuid), nullable | no |  |
| `live_version_id` | string (uuid), nullable | no | The version currently served. Never written by this module — publishing is a separate lifecycle. |
| `state` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no | When this endpoint was moved to the trash, or `null` if it is live in the authoring sense — present, listed, editable. |

| Status | Meaning |
|---|---|
| 200 | Endpoint moved to the trash. Reversible: the row, its published versions and its invoke grants are all kept. |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission |
| 404 | No such endpoint in this workspace |
| 409 | The endpoint is live — disable it first, so trashing can never take a served URL off the internet by surprise |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/try`

Operation id: `try_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage — a trial runs a query as somebody else, so :read does not reach it.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `TryRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `service_account_id` | string (uuid) | yes |  |
| `params` | object | no | Values exactly as they would arrive on the query string. A `Vec` per key because a repeated parameter is a LIST (P4.5), and a trial that could only send one value could not exercise the case most likely to be wrong. |

**Response 200 (application/json)**: `TryResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `status` | integer (int32) | yes | The status the SERVING path returned. The trial itself is a 200 whenever it ran — a 403 from the endpoint is a result, not a failure of the trial. |
| `body` | object | yes | The serving path's own body, verbatim: on success the spec §4.4 envelope `\{status, message, data, meta\}` — `data` an array for a one-statement endpoint and an object keyed by statement name for several — or, for an endpoint published with... |
| `request` | TryRequestEcho | yes |  |

| Status | Meaning |
|---|---|
| 200 | The trial RAN. `status` and `body` are the serving path's own answer — a 403 or a 429 in there is a result, not a failure of this route |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage — a trial runs a query as somebody else, so :read does not reach it |
| 404 | No such endpoint, or no such service account, in this workspace |
| 413 | The trial RAN, but its result is larger than a console trial will read back; lower the endpoint's row limit or call it with a client |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/endpoints/{id}/validate`

Operation id: `validate_endpoint`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing data_api_endpoint:manage permission, or the engine's policy denies a table the query names.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DataApiValidationDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `statements` | StatementSnapshot[] | yes | Exactly what `publish` would freeze: one entry per statement, in the author's order, each carrying the output schema `describe` resolved for it — so an author sees the contract before committing to it. |
| `against_live` | ContractDiff | no |  |
| `acknowledge_breaking` | string, nullable | no | The value to send back as `acknowledge_breaking` on `POST …/publish`, present exactly when `against_live.breaking` is non-empty. |

| Status | Meaning |
|---|---|
| 200 | The definition is publishable; the resolved output schema is returned, together with what publishing it would do to consumers of the live version and the acknowledgement to send if that includes a breaking change |
| 400 | Not a single SELECT, a parameter mismatch, an enum without an allowed list, a shared cache on a delegated connection, or SQL the engine rejects |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission, or the engine's policy denies a table the query names |
| 404 | No such endpoint in this workspace, or the query names a relation that does not exist |
| 500 | Internal error |

## GET `/api/ws/{workspace}/data-api/endpoints/{id}/versions`

Operation id: `list_endpoint_versions`. Auth: Session cookie. Forbidden (403): Missing data_api_endpoint:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Endpoint id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `DataApiEndpointVersionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `version` | integer (int32) | yes |  |
| `note` | string | yes |  |
| `is_live` | boolean | yes | True for the version `endpoints.live_version_id` points at. |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `snapshot` | EndpointSnapshot | yes | The frozen definition. **This is the only thing P4 may read to decide what a request returns** — see the module comment. |
| `breaking_changes` | ContractChange[], nullable | no | What publishing this version did to the consumers of the one it replaced (package 6), and therefore what its `created_by` accepted when they acknowledged it. |
| `compared_against_version` | integer (int32), nullable | no | The version NUMBER [`Self::breaking_changes`] was compared against — whatever was live when this one was published. |

| Status | Meaning |
|---|---|
| 200 | Published versions, newest first, each with its frozen snapshot |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:read permission |
| 404 | No such endpoint in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/data-api/openapi`

Operation id: `get_openapi`. Auth: Session cookie. Forbidden (403): Missing data_api_endpoint:manage permission. The gate matches `/grants` LIST, not the other read routes: this document is the grant roster, resolved per service account.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `service_account_id` | query | string (uuid) | yes | Whose invoke rights the document describes. |
| `endpoint_id` | query | string (uuid) | no | Narrow to a single endpoint's contract, e.g. for a per-endpoint download. |

**Response 200 (application/json)**: `object`

| Status | Meaning |
|---|---|
| 200 | OpenAPI 3.0.3 document describing what service_account_id may invoke. `servers[0].url` already carries the workspace slug, so joining it with a `paths` key gives the URL a consumer calls. `Cache-Control: no-store`: the document is per... |
| 400 | The workspace has more live endpoints than one document may describe; request them one at a time with endpoint_id |
| 401 | Not authenticated |
| 403 | Missing data_api_endpoint:manage permission. The gate matches `/grants` LIST, not the other read routes: this document is the grant roster, resolved per service account |
| 404 | No such service account in this workspace |
| 409 | A described endpoint's output naming collides; re-publish it |
| 500 | Internal error |

## GET `/api/ws/{workspace}/data-api/service-accounts`

Operation id: `list_service_accounts`. Auth: Session cookie. Forbidden (403): Missing service_account:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: array of `DataApiServiceAccountDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `email` | string | yes | The synthetic address `users.email` requires. Not a mailbox. |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Service accounts in the workspace |
| 401 | Not authenticated |
| 403 | Missing service_account:read permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/service-accounts`

Operation id: `create_service_account`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing service_account:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `CreateServiceAccountInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `description` | string | no |  |

**Response 201 (application/json)**: `DataApiServiceAccountDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `email` | string | yes | The synthetic address `users.email` requires. Not a mailbox. |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 201 | Service account created |
| 400 | Empty or unusable name |
| 401 | Not authenticated |
| 403 | Missing service_account:manage permission |
| 409 | A service account with that name already exists here |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/data-api/service-accounts/{id}`

Operation id: `delete_service_account`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing service_account:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Service account id (a users.id) |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Service account, its grants and all its clients deleted |
| 401 | Not authenticated |
| 403 | Missing service_account:manage permission |
| 404 | No such service account in this workspace |
| 409 | The account still owns content that has no delete rule |
| 500 | Internal error |

## GET `/api/ws/{workspace}/data-api/service-accounts/{id}/clients`

Operation id: `list_clients`. Auth: Session cookie. Forbidden (403): Missing service_account:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Service account id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `DataApiClientDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `client_id` | string | yes |  |
| `expires_at` | string (date-time), nullable | no |  |
| `last_used_at` | string (date-time), nullable | no |  |
| `revoked_at` | string (date-time), nullable | no |  |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | The account's OAuth2 clients. Never carries secret material. |
| 401 | Not authenticated |
| 403 | Missing service_account:read permission |
| 404 | No such service account in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/data-api/service-accounts/{id}/clients`

Operation id: `issue_client`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing service_account:manage permission — :read does not imply issuing.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Service account id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `IssueClientInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `expires_at` | string (date-time), nullable | no | Optional hard expiry. Absent means the client lives until revoked. |

**Response 201 (application/json)**: `DataApiNewClientDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `client_id` | string | yes |  |
| `client_secret` | string | yes | Shown once; not recoverable afterwards. |
| `token_endpoint` | string | yes | Where to exchange these for a token. |

| Status | Meaning |
|---|---|
| 201 | Client issued; client_secret is shown ONCE and is not recoverable |
| 400 | expires_at out of range |
| 401 | Not authenticated |
| 403 | Missing service_account:manage permission — :read does not imply issuing |
| 404 | No such service account in this workspace |
| 500 | Internal error |

