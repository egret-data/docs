---
sidebar_position: 11
sidebar_label: Databases
description: REST endpoints in the databases group.
---

# Databases API

Workspace database registry (engines + connection secrets).

This page lists 9 endpoints (OpenAPI tag `databases`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/databases` | `list` |  |
| POST | `/api/ws/{workspace}/databases` | `create` |  |
| POST | `/api/ws/{workspace}/databases/test` | `test_unsaved` |  |
| GET | `/api/ws/{workspace}/databases/{id}` | `detail` |  |
| PUT | `/api/ws/{workspace}/databases/{id}` | `update` |  |
| DELETE | `/api/ws/{workspace}/databases/{id}` | `remove` |  |
| POST | `/api/ws/{workspace}/databases/{id}/test` | `test_saved` |  |
| GET | `/api/ws/{workspace}/engines` | `list_engines` |  |
| GET | `/api/ws/{workspace}/engines/{engine_id}` | `engine_detail` |  |

## GET `/api/ws/{workspace}/databases`

Operation id: `list`. Auth: Session cookie. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: array of `DatabaseDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `engine` | Engine | yes | Supported query engines. |
| `host` | string | yes |  |
| `port` | integer (int32) | yes |  |
| `options` | ConnOptions | yes | Non-secret connection options stored in `databases.options` (jsonb). |
| `has_secret` | boolean | yes |  |
| `status` | string | yes |  |
| `delegated` | boolean | yes |  |
| `governed` | boolean | yes | See [`Database::governed`]. Surfaced on the detail DTO so the Data API author's database picker can warn BEFORE publish that the connection it is pointed at cannot carry a governed endpoint. |
| `engine_id` | string, nullable | no | Set (as a UUID string) when this connection was materialized by an engine→workspace assignment (read-only, provisioned by egret); `None` for a self-service connection. The frontend uses it to split the workspace Engines page into... |

| Status | Meaning |
|---|---|
| 200 | Registered databases in the workspace |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/databases`

Operation id: `create`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `DatabaseInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `engine` | Engine | yes | Supported query engines. |
| `host` | string | yes |  |
| `port` | integer (int32) | yes |  |
| `options` | ConnOptions | no | Non-secret connection options stored in `databases.options` (jsonb). |
| `secret_id` | string (uuid), nullable | no |  |
| `new_secret` | NewSecret | no |  |
| `delegated` | boolean | no | B3a: run BI queries as the caller's per-user engine JWT (delegation). |
| `governed` | boolean, nullable | no | The data behind this connection is governed at the engine (Ranger row filters / column masks). Publishing a Data API endpoint onto it — or previewing one against it — requires `delegated` or `options.impersonate`; see... |

**Response 200 (application/json)**: `DatabaseDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `engine` | Engine | yes | Supported query engines. |
| `host` | string | yes |  |
| `port` | integer (int32) | yes |  |
| `options` | ConnOptions | yes | Non-secret connection options stored in `databases.options` (jsonb). |
| `has_secret` | boolean | yes |  |
| `status` | string | yes |  |
| `delegated` | boolean | yes |  |
| `governed` | boolean | yes | See [`Database::governed`]. Surfaced on the detail DTO so the Data API author's database picker can warn BEFORE publish that the connection it is pointed at cannot carry a governed endpoint. |
| `engine_id` | string, nullable | no | Set (as a UUID string) when this connection was materialized by an engine→workspace assignment (read-only, provisioned by egret); `None` for a self-service connection. The frontend uses it to split the workspace Engines page into... |

| Status | Meaning |
|---|---|
| 200 | Database registered |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/databases/test`

Operation id: `test_unsaved`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `TestInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `engine` | Engine | yes | Supported query engines. |
| `host` | string | yes |  |
| `port` | integer (int32) | yes |  |
| `options` | ConnOptions | no | Non-secret connection options stored in `databases.options` (jsonb). |
| `secret` | string, nullable | no |  |

**Response 200 (application/json)**: `TestOutcome`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |
| `latency_ms` | integer (int64) | yes |  |
| `detail` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Connection test outcome for the unsaved connection |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 500 | Internal error |

## GET `/api/ws/{workspace}/databases/{id}`

Operation id: `detail`. Auth: Session cookie. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Database id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DatabaseDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `engine` | Engine | yes | Supported query engines. |
| `host` | string | yes |  |
| `port` | integer (int32) | yes |  |
| `options` | ConnOptions | yes | Non-secret connection options stored in `databases.options` (jsonb). |
| `has_secret` | boolean | yes |  |
| `status` | string | yes |  |
| `delegated` | boolean | yes |  |
| `governed` | boolean | yes | See [`Database::governed`]. Surfaced on the detail DTO so the Data API author's database picker can warn BEFORE publish that the connection it is pointed at cannot carry a governed endpoint. |
| `engine_id` | string, nullable | no | Set (as a UUID string) when this connection was materialized by an engine→workspace assignment (read-only, provisioned by egret); `None` for a self-service connection. The frontend uses it to split the workspace Engines page into... |

| Status | Meaning |
|---|---|
| 200 | Database detail |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 404 | No such database in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/databases/{id}`

Operation id: `update`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Database id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `DatabaseInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `engine` | Engine | yes | Supported query engines. |
| `host` | string | yes |  |
| `port` | integer (int32) | yes |  |
| `options` | ConnOptions | no | Non-secret connection options stored in `databases.options` (jsonb). |
| `secret_id` | string (uuid), nullable | no |  |
| `new_secret` | NewSecret | no |  |
| `delegated` | boolean | no | B3a: run BI queries as the caller's per-user engine JWT (delegation). |
| `governed` | boolean, nullable | no | The data behind this connection is governed at the engine (Ranger row filters / column masks). Publishing a Data API endpoint onto it — or previewing one against it — requires `delegated` or `options.impersonate`; see... |

**Response 200 (application/json)**: `DatabaseDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `engine` | Engine | yes | Supported query engines. |
| `host` | string | yes |  |
| `port` | integer (int32) | yes |  |
| `options` | ConnOptions | yes | Non-secret connection options stored in `databases.options` (jsonb). |
| `has_secret` | boolean | yes |  |
| `status` | string | yes |  |
| `delegated` | boolean | yes |  |
| `governed` | boolean | yes | See [`Database::governed`]. Surfaced on the detail DTO so the Data API author's database picker can warn BEFORE publish that the connection it is pointed at cannot carry a governed endpoint. |
| `engine_id` | string, nullable | no | Set (as a UUID string) when this connection was materialized by an engine→workspace assignment (read-only, provisioned by egret); `None` for a self-service connection. The frontend uses it to split the workspace Engines page into... |

| Status | Meaning |
|---|---|
| 200 | Database updated |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 404 | No such database in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/databases/{id}`

Operation id: `remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Database id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Deleted |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 404 | No such database in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/databases/{id}/test`

Operation id: `test_saved`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Database id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `TestOutcome`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |
| `latency_ms` | integer (int64) | yes |  |
| `detail` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Connection test outcome for the saved database |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 404 | No such database in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/engines`

Operation id: `list_engines`. Auth: Session cookie. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: array of `WsEngineListDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `type` | string | yes | Engine kind (`trino`/`starrocks`/`risingwave`). |
| `status` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Engines provisioned (assigned) to the workspace |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 500 | Internal error |

## GET `/api/ws/{workspace}/engines/{engine_id}`

Operation id: `engine_detail`. Auth: Session cookie. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `engine_id` | path | string (uuid) | yes | Engine id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `WsEngineDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `type` | string | yes | Engine kind (`trino`/`starrocks`/`risingwave`). |
| `status` | string | yes |  |
| `catalogs` | WsEngineCatalogDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Assigned engine detail with catalogs → storage/secret names |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 404 | No such engine assigned to this workspace |
| 500 | Internal error |

