---
sidebar_position: 15
sidebar_label: Charts
description: REST endpoints in the charts group.
---

# Charts API

BI charts: CRUD, compile-to-SQL data requests, folders, trash + bookmarks.

This page lists 14 endpoints (OpenAPI tag `charts`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/charts` | `ch_list` |  |
| POST | `/api/ws/{workspace}/charts` | `ch_create` |  |
| POST | `/api/ws/{workspace}/charts/data` | `ch_data` |  |
| POST | `/api/ws/{workspace}/charts/run` | `ch_run_spec` | Run a client-supplied `QuerySpec` against a dataset and return the rows. |
| GET | `/api/ws/{workspace}/charts/{id}` | `ch_get` |  |
| PUT | `/api/ws/{workspace}/charts/{id}` | `ch_update` |  |
| DELETE | `/api/ws/{workspace}/charts/{id}` | `ch_remove` |  |
| POST | `/api/ws/{workspace}/charts/{id}/bookmark` | `ch_bookmark_add` |  |
| DELETE | `/api/ws/{workspace}/charts/{id}/bookmark` | `ch_bookmark_remove` |  |
| POST | `/api/ws/{workspace}/charts/{id}/data` | `ch_run` | Object-scoped: runs ONLY the chart's persisted query (no client-supplied spec — the handler takes only the path id), so an object guest with a `chart:read` g... |
| POST | `/api/ws/{workspace}/charts/{id}/duplicate` | `ch_duplicate` |  |
| PATCH | `/api/ws/{workspace}/charts/{id}/folder` | `ch_set_folder` |  |
| POST | `/api/ws/{workspace}/charts/{id}/restore` | `ch_restore` |  |
| POST | `/api/ws/{workspace}/charts/{id}/trash` | `ch_trash` |  |

## GET `/api/ws/{workspace}/charts`

Operation id: `ch_list`. Auth: Session cookie. Forbidden (403): Missing chart:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `trashed` | query | boolean | no | List only trashed charts when true |

**Response 200 (application/json)**: array of `ChartDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `dataset_id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `viz_type` | string | yes |  |
| `params` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `folder_id` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Charts in the workspace |
| 401 | Not authenticated |
| 403 | Missing chart:read permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/charts`

Operation id: `ch_create`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `CreateChart`

| Field | Type | Required | Description |
|---|---|---|---|
| `dataset_id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string | no |  |
| `viz_type` | string | yes |  |
| `params` | object | yes |  |

**Response 200 (application/json)**: `ChartDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `dataset_id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `viz_type` | string | yes |  |
| `params` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `folder_id` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Chart created |
| 400 | Malformed params (see the message) |
| 401 | Not authenticated |
| 403 | Missing chart:manage permission |
| 404 | Referenced dataset not in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/charts/data`

Operation id: `ch_data`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `ChartDataBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `dataset_id` | string (uuid) | yes |  |
| `query_spec` | QuerySpec | yes |  |

**Response 200 (application/json)**: `ChartDataResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `sql` | string | yes |  |
| `database_id` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Compiled SQL + target database id (the client submits it to the query seam) |
| 400 | Invalid query spec (unknown column/metric, bad filter, …) |
| 401 | Not authenticated |
| 403 | Missing chart:read permission |
| 404 | Referenced dataset not in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/charts/run`

Operation id: `ch_run_spec`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:read permission, or the charts module is disabled.

Run a client-supplied `QuerySpec` against a dataset and return the rows.

This is `ch_run` for a spec that is not (yet) a saved chart: the chart builder's preview, dashboard edit-mode cards, and filter-value dropdowns. It exists so those three do not have to go through the free-form SQL endpoint — which lets `POST /queries` be gated on the SQL Lab entitlement without breaking chart authoring, and stops raw SQL crossing the wire when a user is only building a chart.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `ChartDataBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `dataset_id` | string (uuid) | yes |  |
| `query_spec` | QuerySpec | yes |  |

**Response 200 (application/json)**: `ChartRunResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `columns` | ColumnMeta[] | yes |  |
| `rows` | object[][] | yes | Row-major cell values; each inner vec is one row aligned to `columns`. |

| Status | Meaning |
|---|---|
| 200 | The client-supplied spec, compiled + executed: columns + rows |
| 400 | Invalid query spec (unknown column/metric, bad filter, …) |
| 401 | Not authenticated |
| 403 | Missing chart:read permission, or the charts module is disabled |
| 404 | Referenced dataset not in this workspace |
| 500 | Internal error |
| 502 | Query engine error |

## GET `/api/ws/{workspace}/charts/{id}`

Operation id: `ch_get`. Auth: Session cookie. Forbidden (403): Missing chart:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Chart id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `ChartDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `dataset_id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `viz_type` | string | yes |  |
| `params` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `folder_id` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Chart detail |
| 401 | Not authenticated |
| 403 | Missing chart:read permission |
| 404 | No such chart in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/charts/{id}`

Operation id: `ch_update`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Chart id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `UpdateChart`

| Field | Type | Required | Description |
|---|---|---|---|
| `dataset_id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string | no |  |
| `viz_type` | string | yes |  |
| `params` | object | yes |  |

**Response 200 (application/json)**: `ChartDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `dataset_id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `viz_type` | string | yes |  |
| `params` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `folder_id` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Chart updated |
| 400 | Malformed params (see the message) |
| 401 | Not authenticated |
| 403 | Missing chart:manage permission |
| 404 | No such chart, or referenced dataset not in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/charts/{id}`

Operation id: `ch_remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Chart id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Chart deleted |
| 401 | Not authenticated |
| 403 | Missing chart:manage permission |
| 404 | No such chart in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/charts/{id}/bookmark`

Operation id: `ch_bookmark_add`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Chart id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Chart bookmarked for the caller |
| 401 | Not authenticated |
| 403 | Missing chart:read permission |
| 404 | No such chart in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/charts/{id}/bookmark`

Operation id: `ch_bookmark_remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Chart id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Chart bookmark removed for the caller |
| 401 | Not authenticated |
| 403 | Missing chart:read permission |
| 404 | No such chart in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/charts/{id}/data`

Operation id: `ch_run`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): No chart:read grant on this chart.

Object-scoped: runs ONLY the chart's persisted query (no client-supplied spec — the handler takes only the path id), so an object guest with a `chart:read` grant can view the shared chart's data without any query:run workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Chart id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `ChartRunResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `columns` | ColumnMeta[] | yes |  |
| `rows` | object[][] | yes | Row-major cell values; each inner vec is one row aligned to `columns`. |

| Status | Meaning |
|---|---|
| 200 | The chart's SAVED query, executed: columns + rows |
| 400 | Chart has no runnable query, or its saved spec is invalid |
| 401 | Not authenticated |
| 403 | No chart:read grant on this chart |
| 404 | No such chart in this workspace, or its dataset is gone |
| 500 | Internal error |
| 502 | Query engine error |

## POST `/api/ws/{workspace}/charts/{id}/duplicate`

Operation id: `ch_duplicate`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Chart id to duplicate |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `ChartDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `dataset_id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `viz_type` | string | yes |  |
| `params` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `folder_id` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Chart duplicated |
| 401 | Not authenticated |
| 403 | Missing chart:manage permission |
| 404 | No such chart in this workspace |
| 500 | Internal error |

## PATCH `/api/ws/{workspace}/charts/{id}/folder`

Operation id: `ch_set_folder`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Chart id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetFolder`

| Field | Type | Required | Description |
|---|---|---|---|
| `folder_id` | string (uuid), nullable | no |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Chart moved to folder |
| 401 | Not authenticated |
| 403 | Missing chart:manage permission |
| 404 | No such chart or target folder in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/charts/{id}/restore`

Operation id: `ch_restore`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Chart id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Chart restored from trash |
| 401 | Not authenticated |
| 403 | Missing chart:manage permission |
| 404 | No such chart in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/charts/{id}/trash`

Operation id: `ch_trash`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing chart:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Chart id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Chart moved to trash |
| 401 | Not authenticated |
| 403 | Missing chart:manage permission |
| 404 | No such chart in this workspace |
| 500 | Internal error |

