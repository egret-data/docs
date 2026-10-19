---
sidebar_position: 14
sidebar_label: Datasets
description: REST endpoints in the datasets group.
---

# Datasets API

BI datasets: sources, columns, metrics, folders, trash + bookmarks.

This page lists 21 endpoints (OpenAPI tag `datasets`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/datasets` | `ds_list` |  |
| POST | `/api/ws/{workspace}/datasets` | `ds_create` |  |
| GET | `/api/ws/{workspace}/datasets/{id}` | `ds_get` |  |
| PUT | `/api/ws/{workspace}/datasets/{id}` | `ds_update` |  |
| DELETE | `/api/ws/{workspace}/datasets/{id}` | `ds_remove` |  |
| POST | `/api/ws/{workspace}/datasets/{id}/bookmark` | `ds_bookmark_add` |  |
| DELETE | `/api/ws/{workspace}/datasets/{id}/bookmark` | `ds_bookmark_remove` |  |
| PUT | `/api/ws/{workspace}/datasets/{id}/certification` | `ds_set_certification` |  |
| POST | `/api/ws/{workspace}/datasets/{id}/columns` | `ds_add_column` |  |
| PUT | `/api/ws/{workspace}/datasets/{id}/columns/{column_name}` | `ds_update_column` |  |
| DELETE | `/api/ws/{workspace}/datasets/{id}/columns/{column_name}` | `ds_delete_column` |  |
| POST | `/api/ws/{workspace}/datasets/{id}/data` | `ds_data` | Object-scoped dataset data-preview: runs ONLY a bounded `SELECT * FROM &lt;the dataset's own source> LIMIT n` (n from the optional body, clamped to [100, 1000]). |
| PATCH | `/api/ws/{workspace}/datasets/{id}/folder` | `ds_set_folder` |  |
| POST | `/api/ws/{workspace}/datasets/{id}/metrics` | `ds_add_metric` |  |
| PUT | `/api/ws/{workspace}/datasets/{id}/metrics/{metric_id}` | `ds_update_metric` |  |
| DELETE | `/api/ws/{workspace}/datasets/{id}/metrics/{metric_id}` | `ds_delete_metric` |  |
| PUT | `/api/ws/{workspace}/datasets/{id}/metrics/{metric_id}/certification` | `ds_set_metric_certification` |  |
| POST | `/api/ws/{workspace}/datasets/{id}/refresh` | `ds_refresh` |  |
| POST | `/api/ws/{workspace}/datasets/{id}/restore` | `ds_restore` |  |
| POST | `/api/ws/{workspace}/datasets/{id}/trash` | `ds_trash` |  |
| GET | `/api/ws/{workspace}/datasets/{id}/usage` | `ds_usage` |  |

## GET `/api/ws/{workspace}/datasets`

Operation id: `ds_list`. Auth: Session cookie. Forbidden (403): Missing dataset:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `trashed` | query | boolean | no | List only trashed datasets when true |

**Response 200 (application/json)**: array of `DatasetSummaryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `column_count` | integer (int64) | yes |  |
| `folder_id` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset (for a list badge). |

| Status | Meaning |
|---|---|
| 200 | Datasets in the workspace |
| 401 | Not authenticated |
| 403 | Missing dataset:read permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/datasets`

Operation id: `ds_create`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission (or the database is not granted).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `CreateDataset`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `database_id` | string (uuid) | yes |  |
| `description` | string | no |  |
| `source` | CreateSource | yes |  |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dataset created (columns introspected from the source) |
| 400 | Invalid source or introspection failed |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission (or the database is not granted) |
| 500 | Internal error |

## GET `/api/ws/{workspace}/datasets/{id}`

Operation id: `ds_get`. Auth: Session cookie. Forbidden (403): Missing dataset:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dataset detail (columns + metrics) |
| 401 | Not authenticated |
| 403 | Missing dataset:read permission |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/datasets/{id}`

Operation id: `ds_update`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission, or not the dataset owner.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `UpdateDataset`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `description` | string | no |  |
| `sql` | string, nullable | no |  |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dataset updated |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission, or not the dataset owner |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/datasets/{id}`

Operation id: `ds_remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission, or not the dataset owner.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dataset deleted |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission, or not the dataset owner |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/datasets/{id}/bookmark`

Operation id: `ds_bookmark_add`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dataset bookmarked for the caller |
| 401 | Not authenticated |
| 403 | Missing dataset:read permission |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/datasets/{id}/bookmark`

Operation id: `ds_bookmark_remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dataset bookmark removed for the caller |
| 401 | Not authenticated |
| 403 | Missing dataset:read permission |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/datasets/{id}/certification`

Operation id: `ds_set_certification`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:certify permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetDatasetCertification`

| Field | Type | Required | Description |
|---|---|---|---|
| `certified` | boolean | yes |  |
| `details` | string | no | Ignored when `certified` is false — withdrawing clears the note rather than leaving a stale justification attached to an uncertified dataset. |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Certification set |
| 401 | Not authenticated |
| 403 | Missing dataset:certify permission |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/datasets/{id}/columns`

Operation id: `ds_add_column`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission, or not the dataset owner.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `AddColumnBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `column_name` | string | yes |  |
| `expression` | string | yes |  |
| `verbose_name` | string | no |  |
| `description` | string | no |  |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Calculated column added (expression validated) |
| 400 | Invalid column expression |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission, or not the dataset owner |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/datasets/{id}/columns/{column_name}`

Operation id: `ds_update_column`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission, or not the dataset owner.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `column_name` | path | string | yes | Column name |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `UpdateColumnBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `verbose_name` | string, nullable | no |  |
| `description` | string, nullable | no |  |
| `expression` | string, nullable | no |  |
| `groupby` | boolean, nullable | no |  |
| `filterable` | boolean, nullable | no |  |
| `is_temporal` | boolean, nullable | no |  |
| `format` | string, nullable | no |  |
| `semantic_type` | "" / "category" / "country" / "currency" / "email" / "url" / "image" / "latitude" / "longitude" / null, nullable | no | Semantic role driving smart rendering and chart defaults; "" = none. Rejected with 400 if not one of the listed values. |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Column updated |
| 400 | Cannot set an expression on a physical column, or invalid expression |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission, or not the dataset owner |
| 404 | No such dataset or column in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/datasets/{id}/columns/{column_name}`

Operation id: `ds_delete_column`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission, or not the dataset owner.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `column_name` | path | string | yes | Calculated column name |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Calculated column deleted |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission, or not the dataset owner |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/datasets/{id}/data`

Operation id: `ds_data`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): No dataset:read grant on this dataset.

Object-scoped dataset data-preview: runs ONLY a bounded `SELECT * FROM &lt;the dataset's own source> LIMIT n` (n from the optional body, clamped to [100, 1000]). Accepts NO client SQL, so an object guest with a `dataset:read` grant can preview only the shared dataset — no `query:run` workspace permission required.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `DatasetDataBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `limit` | integer (int64), nullable | no | Rows to preview. Clamped to [100, 1000]; defaults to 200 when absent. |

**Response 200 (application/json)**: `ChartRunResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `columns` | ColumnMeta[] | yes |  |
| `rows` | object[][] | yes | Row-major cell values; each inner vec is one row aligned to `columns`. |

| Status | Meaning |
|---|---|
| 200 | A bounded preview of the dataset's OWN source (SELECT * … LIMIT n): columns + rows |
| 400 | Malformed request body |
| 401 | Not authenticated |
| 403 | No dataset:read grant on this dataset |
| 404 | No such dataset in this workspace |
| 500 | Internal error |
| 502 | Query engine error |

## PATCH `/api/ws/{workspace}/datasets/{id}/folder`

Operation id: `ds_set_folder`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
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
| 200 | Dataset moved to folder |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission |
| 404 | No such dataset or target folder in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/datasets/{id}/metrics`

Operation id: `ds_add_metric`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission, or not the dataset owner.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `MetricBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `metric_name` | string | yes |  |
| `expression` | string | yes |  |
| `verbose_name` | string | no |  |
| `description` | string | no |  |
| `format` | string | no |  |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Metric added (expression validated) |
| 400 | Invalid metric expression |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission, or not the dataset owner |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/datasets/{id}/metrics/{metric_id}`

Operation id: `ds_update_metric`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission, or not the dataset owner.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `metric_id` | path | string (uuid) | yes | Metric id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `MetricBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `metric_name` | string | yes |  |
| `expression` | string | yes |  |
| `verbose_name` | string | no |  |
| `description` | string | no |  |
| `format` | string | no |  |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Metric updated (expression validated) |
| 400 | Invalid metric expression |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission, or not the dataset owner |
| 404 | No such dataset, or metric not in this dataset |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/datasets/{id}/metrics/{metric_id}`

Operation id: `ds_delete_metric`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission, or not the dataset owner.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `metric_id` | path | string (uuid) | yes | Metric id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Metric deleted |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission, or not the dataset owner |
| 404 | No such dataset, or metric not in this dataset |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/datasets/{id}/metrics/{metric_id}/certification`

Operation id: `ds_set_metric_certification`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:certify permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `metric_id` | path | string (uuid) | yes | Metric id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetDatasetCertification`

| Field | Type | Required | Description |
|---|---|---|---|
| `certified` | boolean | yes |  |
| `details` | string | no | Ignored when `certified` is false — withdrawing clears the note rather than leaving a stale justification attached to an uncertified dataset. |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Certification set |
| 401 | Not authenticated |
| 403 | Missing dataset:certify permission |
| 404 | No such dataset or metric |
| 500 | Internal error |

## POST `/api/ws/{workspace}/datasets/{id}/refresh`

Operation id: `ds_refresh`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission, or not the dataset owner.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DatasetDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `database_id` | string | yes |  |
| `kind` | string | yes |  |
| `catalog` | string, nullable | no |  |
| `schema` | string, nullable | no |  |
| `table` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |
| `columns` | DatasetColumnDto[] | yes |  |
| `metrics` | MetricDto[] | yes |  |
| `certified` | boolean | yes | Certified as a trusted/official dataset. |
| `certified_by` | string | yes |  |
| `certification_details` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Physical columns reconciled from the source |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission, or not the dataset owner |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/datasets/{id}/restore`

Operation id: `ds_restore`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dataset restored from trash |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/datasets/{id}/trash`

Operation id: `ds_trash`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dataset:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dataset moved to trash |
| 401 | Not authenticated |
| 403 | Missing dataset:manage permission |
| 404 | No such dataset in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/datasets/{id}/usage`

Operation id: `ds_usage`. Auth: Session cookie. Forbidden (403): Missing dataset:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dataset id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `DatasetUsageDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Charts that use this dataset |
| 403 | Missing dataset:read permission |
| 404 | No such dataset in this workspace |

