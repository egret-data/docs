---
sidebar_position: 17
sidebar_label: Folders
description: REST endpoints in the folders group.
---

# Folders API

Generic per-kind folders (charts / dashboards / datasets).

This page lists 4 endpoints (OpenAPI tag `folders`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/folders/{kind}` | `folders_list` |  |
| POST | `/api/ws/{workspace}/folders/{kind}` | `folders_create` |  |
| PATCH | `/api/ws/{workspace}/folders/{kind}/{id}` | `folders_rename` |  |
| DELETE | `/api/ws/{workspace}/folders/{kind}/{id}` | `folders_delete` |  |

## GET `/api/ws/{workspace}/folders/{kind}`

Operation id: `folders_list`. Auth: Session cookie. Forbidden (403): Missing the entity kind's read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `kind` | path | string | yes | Entity kind: charts \| dashboards \| datasets |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `FolderDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Folders for the entity kind in the workspace |
| 401 | Not authenticated |
| 403 | Missing the entity kind's read permission |
| 404 | Unknown entity kind |
| 500 | Internal error |

## POST `/api/ws/{workspace}/folders/{kind}`

Operation id: `folders_create`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing the entity kind's manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `kind` | path | string | yes | Entity kind: charts \| dashboards \| datasets |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `CreateFolder`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |

**Response 200 (application/json)**: `FolderDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Folder created |
| 401 | Not authenticated |
| 403 | Missing the entity kind's manage permission |
| 404 | Unknown entity kind |
| 500 | Internal error |

## PATCH `/api/ws/{workspace}/folders/{kind}/{id}`

Operation id: `folders_rename`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing the entity kind's manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `kind` | path | string | yes | Entity kind: charts \| dashboards \| datasets |
| `id` | path | string (uuid) | yes | Folder id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `RenameFolder`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |

**Response 200 (application/json)**: `FolderDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Folder renamed |
| 401 | Not authenticated |
| 403 | Missing the entity kind's manage permission |
| 404 | Unknown entity kind, or no such folder in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/folders/{kind}/{id}`

Operation id: `folders_delete`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing the entity kind's manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `kind` | path | string | yes | Entity kind: charts \| dashboards \| datasets |
| `id` | path | string (uuid) | yes | Folder id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Folder deleted |
| 401 | Not authenticated |
| 403 | Missing the entity kind's manage permission |
| 404 | Unknown entity kind, or no such folder in this workspace |
| 500 | Internal error |

