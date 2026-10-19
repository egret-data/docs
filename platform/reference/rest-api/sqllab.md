---
sidebar_position: 13
sidebar_label: SQL Lab
description: REST endpoints in the sqllab group.
---

# SQL Lab API

SQL Lab: saved queries + schema browse (catalogs / schemas / tables / columns).

This page lists 15 endpoints (OpenAPI tag `sqllab`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/sqllab/databases/{db}/catalogs` | `catalogs` |  |
| GET | `/api/ws/{workspace}/sqllab/databases/{db}/columns` | `columns` |  |
| GET | `/api/ws/{workspace}/sqllab/databases/{db}/schemas` | `schemas` |  |
| GET | `/api/ws/{workspace}/sqllab/databases/{db}/search` | `search` |  |
| GET | `/api/ws/{workspace}/sqllab/databases/{db}/tables` | `tables` |  |
| GET | `/api/ws/{workspace}/sqllab/queries` | `list` |  |
| POST | `/api/ws/{workspace}/sqllab/queries` | `save` |  |
| GET | `/api/ws/{workspace}/sqllab/queries/{id}` | `load` |  |
| PUT | `/api/ws/{workspace}/sqllab/queries/{id}` | `update` |  |
| DELETE | `/api/ws/{workspace}/sqllab/queries/{id}` | `remove` |  |
| PATCH | `/api/ws/{workspace}/sqllab/queries/{id}/folder` | `sq_set_folder` |  |
| GET | `/api/ws/{workspace}/sqllab/snippets` | `snippets_list` |  |
| POST | `/api/ws/{workspace}/sqllab/snippets` | `snippets_create` |  |
| PUT | `/api/ws/{workspace}/sqllab/snippets/{id}` | `snippets_update` |  |
| DELETE | `/api/ws/{workspace}/sqllab/snippets/{id}` | `snippets_remove` |  |

## GET `/api/ws/{workspace}/sqllab/databases/{db}/catalogs`

Operation id: `catalogs`. Auth: Session cookie. Forbidden (403): Missing query:run permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `db` | path | string (uuid) | yes | Granted database id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `string`

| Status | Meaning |
|---|---|
| 200 | Catalog names visible on the database |
| 401 | Not authenticated |
| 403 | Missing query:run permission |
| 404 | Database not granted to this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/sqllab/databases/{db}/columns`

Operation id: `columns`. Auth: Session cookie. Forbidden (403): Missing query:run permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `db` | path | string (uuid) | yes | Granted database id |
| `catalog` | query | string | no | Catalog to scope to |
| `schema` | query | string | no | Schema to scope to |
| `table` | query | string | no | Table to describe columns for |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `SchemaColumn`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `type` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Columns (name + type) of the table |
| 401 | Not authenticated |
| 403 | Missing query:run permission |
| 404 | Database not granted to this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/sqllab/databases/{db}/schemas`

Operation id: `schemas`. Auth: Session cookie. Forbidden (403): Missing query:run permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `db` | path | string (uuid) | yes | Granted database id |
| `catalog` | query | string | no | Catalog to list schemas in |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `string`

| Status | Meaning |
|---|---|
| 200 | Schema names in the catalog |
| 401 | Not authenticated |
| 403 | Missing query:run permission |
| 404 | Database not granted to this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/sqllab/databases/{db}/search`

Operation id: `search`. Auth: Session cookie. Forbidden (403): Missing query:run permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `db` | path | string (uuid) | yes | Granted database id |
| `q` | query | string | no | Object-name search term |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `SearchHit`

| Field | Type | Required | Description |
|---|---|---|---|
| `catalog` | string | yes |  |
| `schema` | string | yes |  |
| `table` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Matching tables/views across the database |
| 403 | Missing query:run permission |
| 404 | Database not granted to this workspace |

## GET `/api/ws/{workspace}/sqllab/databases/{db}/tables`

Operation id: `tables`. Auth: Session cookie. Forbidden (403): Missing query:run permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `db` | path | string (uuid) | yes | Granted database id |
| `catalog` | query | string | no | Catalog to scope to |
| `schema` | query | string | no | Schema to list tables in |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `string`

| Status | Meaning |
|---|---|
| 200 | Table names in the schema |
| 401 | Not authenticated |
| 403 | Missing query:run permission |
| 404 | Database not granted to this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/sqllab/queries`

Operation id: `list`. Auth: Session cookie. Forbidden (403): Missing saved_query:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: array of `SavedQueryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `database_id` | string, nullable | no |  |
| `name` | string | yes |  |
| `sql` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string, nullable | no |  |
| `folder_id` | string, nullable | no | Folder this saved query lives in (`None` = root). Serialized as a string. |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Saved queries in the workspace |
| 401 | Not authenticated |
| 403 | Missing saved_query:read permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/sqllab/queries`

Operation id: `save`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing saved_query:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `SaveQuery`

| Field | Type | Required | Description |
|---|---|---|---|
| `database_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `sql` | string | yes |  |
| `description` | string | no |  |

**Response 200 (application/json)**: `SavedQueryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `database_id` | string, nullable | no |  |
| `name` | string | yes |  |
| `sql` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string, nullable | no |  |
| `folder_id` | string, nullable | no | Folder this saved query lives in (`None` = root). Serialized as a string. |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Saved query created |
| 401 | Not authenticated |
| 403 | Missing saved_query:manage permission |
| 500 | Internal error |

## GET `/api/ws/{workspace}/sqllab/queries/{id}`

Operation id: `load`. Auth: Session cookie. Forbidden (403): Missing saved_query:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Saved query id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `SavedQueryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `database_id` | string, nullable | no |  |
| `name` | string | yes |  |
| `sql` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string, nullable | no |  |
| `folder_id` | string, nullable | no | Folder this saved query lives in (`None` = root). Serialized as a string. |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Saved query detail |
| 401 | Not authenticated |
| 403 | Missing saved_query:read permission |
| 404 | No such saved query |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/sqllab/queries/{id}`

Operation id: `update`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing saved_query:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Saved query id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SaveQuery`

| Field | Type | Required | Description |
|---|---|---|---|
| `database_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `sql` | string | yes |  |
| `description` | string | no |  |

**Response 200 (application/json)**: `SavedQueryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `database_id` | string, nullable | no |  |
| `name` | string | yes |  |
| `sql` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string, nullable | no |  |
| `folder_id` | string, nullable | no | Folder this saved query lives in (`None` = root). Serialized as a string. |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Saved query updated |
| 401 | Not authenticated |
| 403 | Missing saved_query:manage permission |
| 404 | No such saved query |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/sqllab/queries/{id}`

Operation id: `remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing saved_query:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Saved query id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Saved query deleted |
| 401 | Not authenticated |
| 403 | Missing saved_query:manage permission |
| 404 | No such saved query |
| 500 | Internal error |

## PATCH `/api/ws/{workspace}/sqllab/queries/{id}/folder`

Operation id: `sq_set_folder`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing saved_query:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Saved query id |
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
| 200 | Saved query moved to folder |
| 401 | Not authenticated |
| 403 | Missing saved_query:manage permission |
| 404 | No such saved query or target folder in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/sqllab/snippets`

Operation id: `snippets_list`. Auth: Session cookie.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: array of `SnippetDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `body` | string | yes |  |
| `description` | string | yes |  |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Workspace SQL snippets |

## POST `/api/ws/{workspace}/sqllab/snippets`

Operation id: `snippets_create`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `SnippetBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `body` | string | yes |  |
| `description` | string | no |  |

**Response 200 (application/json)**: `SnippetDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `body` | string | yes |  |
| `description` | string | yes |  |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Created snippet |

## PUT `/api/ws/{workspace}/sqllab/snippets/{id}`

Operation id: `snippets_update`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Snippet id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SnippetBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `body` | string | yes |  |
| `description` | string | no |  |

**Response 200 (application/json)**: `SnippetDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `body` | string | yes |  |
| `description` | string | yes |  |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Updated snippet |
| 404 | Snippet not found in this workspace |

## DELETE `/api/ws/{workspace}/sqllab/snippets/{id}`

Operation id: `snippets_remove`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Snippet id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Deleted |

