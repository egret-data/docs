---
sidebar_position: 12
sidebar_label: Queries
description: REST endpoints in the queries group.
---

# Queries API

Workspace query submission, status, results, and history.

This page lists 7 endpoints (OpenAPI tag `queries`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/queries` | `history` |  |
| POST | `/api/ws/{workspace}/queries` | `submit` |  |
| DELETE | `/api/ws/{workspace}/queries` | `history_clear` |  |
| GET | `/api/ws/{workspace}/queries/{id}` | `status` |  |
| POST | `/api/ws/{workspace}/queries/{id}/cancel` | `cancel` |  |
| GET | `/api/ws/{workspace}/queries/{id}/results` | `results` |  |
| GET | `/api/ws/{workspace}/queries/{id}/results.csv` | `results_csv` |  |

## GET `/api/ws/{workspace}/queries`

Operation id: `history`. Auth: Session cookie. Forbidden (403): Missing query:run permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: array of `QueryListItem`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `database_id` | string | yes |  |
| `status` | QueryStatus | yes |  |
| `sql` | string | yes |  |
| `row_count` | integer (int64), nullable | no |  |
| `submitted_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Recent queries submitted by the caller (max 50), less those they cleared |
| 401 | Not authenticated |
| 403 | Missing query:run permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/queries`

Operation id: `submit`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing query:run permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `SubmitQuery`

| Field | Type | Required | Description |
|---|---|---|---|
| `database_id` | string (uuid) | yes |  |
| `sql` | string | yes |  |
| `limit` | integer, nullable | no |  |
| `params` | QueryParam[] | no | Template parameters substituted into `\{\{name\}\}` placeholders before the query is sent to the engine. |

**Response 202 (application/json)**: `SubmitAck`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `status` | QueryStatus | yes |  |

| Status | Meaning |
|---|---|
| 202 | Query accepted; poll status by id |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Missing query:run permission |
| 404 | Database not granted to workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/queries`

Operation id: `history_clear`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing query:run permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | The caller's query history in this workspace is cleared; nobody else's is touched |
| 401 | Not authenticated |
| 403 | Missing query:run permission |
| 500 | Internal error |

## GET `/api/ws/{workspace}/queries/{id}`

Operation id: `status`. Auth: Session cookie. Forbidden (403): Not the owner / missing permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Query id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `QueryStatusDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `database_id` | string | yes |  |
| `status` | QueryStatus | yes |  |
| `columns` | ColumnMeta[], nullable | no | Column metadata `[\{name,type\}]`; `null` until the query finishes. |
| `preview` | object, nullable | no | Inline preview rows (bounded, row-major); `null` until the query finishes. |
| `row_count` | integer (int64), nullable | no |  |
| `bytes_scanned` | integer (int64), nullable | no |  |
| `truncated` | boolean | yes |  |
| `error` | string, nullable | no |  |

| Status | Meaning |
|---|---|
| 200 | Query status (with inline preview once finished) |
| 401 | Not authenticated |
| 403 | Not the owner / missing permission |
| 404 | No such query in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/queries/{id}/cancel`

Operation id: `cancel`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Not the owner / missing permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Query id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Cancellation requested |
| 401 | Not authenticated |
| 403 | Not the owner / missing permission |
| 404 | No such query in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/queries/{id}/results`

Operation id: `results`. Auth: Session cookie. Forbidden (403): Not the owner / missing permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Query id |
| `page` | query | integer | no | Zero-based page index (default 0) |
| `page_size` | query | integer | no | Rows per page (default 100, clamped 1..=1000) |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `ResultsPage`

| Field | Type | Required | Description |
|---|---|---|---|
| `columns` | ColumnMeta[] | yes | Column metadata `[\{name,type\}]`. |
| `rows` | object[] | yes | Row-major cell values; each element is one row (a JSON array). |
| `page` | integer | yes |  |
| `page_size` | integer | yes |  |
| `row_count` | integer (int64) | yes |  |
| `truncated` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | A page of the full result set |
| 401 | Not authenticated |
| 403 | Not the owner / missing permission |
| 404 | No such query in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/queries/{id}/results.csv`

Operation id: `results_csv`. Auth: Session cookie. Forbidden (403): Not the owner / missing permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Query id |
| `workspace` | path | string | yes |  |

**Response 200 (text/csv)**: `string`

| Status | Meaning |
|---|---|
| 200 | The full result set as a CSV download |
| 401 | Not authenticated |
| 403 | Not the owner / missing permission |
| 404 | No such query in this workspace |
| 500 | Internal error |

