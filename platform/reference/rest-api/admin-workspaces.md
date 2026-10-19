---
sidebar_position: 6
sidebar_label: Workspace administration
description: REST endpoints in the admin-workspaces group.
---

# Workspace administration API

Platform-admin workspace lifecycle.

This page lists 10 endpoints (OpenAPI tag `admin-workspaces`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/admin/workspaces` | `list_ws` |  |
| POST | `/api/admin/workspaces` | `create_ws` |  |
| GET | `/api/admin/workspaces/{id}` | `get_ws` |  |
| PUT | `/api/admin/workspaces/{id}` | `update_ws` |  |
| DELETE | `/api/admin/workspaces/{id}` | `archive_ws` |  |
| GET | `/api/admin/workspaces/{id}/features` | `ws_features` |  |
| PUT | `/api/admin/workspaces/{id}/features` | `set_ws_features` |  |
| POST | `/api/admin/workspaces/{id}/restore` | `restore_ws` |  |
| GET | `/api/admin/workspaces/{id}/stats` | `workspace_stats` |  |
| POST | `/api/admin/workspaces/{id}/transfer` | `transfer_owner` |  |

## GET `/api/admin/workspaces`

Operation id: `list_ws`. Auth: Session cookie. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | integer (int32) | no | Page number (1-based) |
| `per_page` | query | integer (int32) | no | Items per page |

**Response 200 (application/json)**: array of `WorkspaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `slug` | string | yes |  |
| `name` | string | yes |  |
| `status` | string | yes |  |
| `created_at` | string (date-time) | yes |  |
| `created_by` | string, nullable | no |  |
| `owner_name` | string, nullable | no |  |
| `features` | string[] | no | Module keys this workspace currently has switched on. Populated wherever a caller reads a workspace's entitlements back (`list_ws`, `get_ws`, `/api/me/workspaces`) via [`dto_with_features`]; left empty by the create/lifecycle handlers,... |

| Status | Meaning |
|---|---|
| 200 | All workspaces |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 500 | Internal error |

## POST `/api/admin/workspaces`

Operation id: `create_ws`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing platform permission.

**Request body (application/json)**: `CreateWorkspace`

| Field | Type | Required | Description |
|---|---|---|---|
| `slug` | string | yes |  |
| `name` | string | yes |  |

**Response 200 (application/json)**: `WorkspaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `slug` | string | yes |  |
| `name` | string | yes |  |
| `status` | string | yes |  |
| `created_at` | string (date-time) | yes |  |
| `created_by` | string, nullable | no |  |
| `owner_name` | string, nullable | no |  |
| `features` | string[] | no | Module keys this workspace currently has switched on. Populated wherever a caller reads a workspace's entitlements back (`list_ws`, `get_ws`, `/api/me/workspaces`) via [`dto_with_features`]; left empty by the create/lifecycle handlers,... |

| Status | Meaning |
|---|---|
| 200 | Workspace created |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 500 | Internal error |

## GET `/api/admin/workspaces/{id}`

Operation id: `get_ws`. Auth: Session cookie. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |

**Response 200 (application/json)**: `WorkspaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `slug` | string | yes |  |
| `name` | string | yes |  |
| `status` | string | yes |  |
| `created_at` | string (date-time) | yes |  |
| `created_by` | string, nullable | no |  |
| `owner_name` | string, nullable | no |  |
| `features` | string[] | no | Module keys this workspace currently has switched on. Populated wherever a caller reads a workspace's entitlements back (`list_ws`, `get_ws`, `/api/me/workspaces`) via [`dto_with_features`]; left empty by the create/lifecycle handlers,... |

| Status | Meaning |
|---|---|
| 200 | Workspace detail |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 404 | No such workspace |
| 500 | Internal error |

## PUT `/api/admin/workspaces/{id}`

Operation id: `update_ws`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |

**Request body (application/json)**: `UpdateWorkspace`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Workspace updated |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 500 | Internal error |

## DELETE `/api/admin/workspaces/{id}`

Operation id: `archive_ws`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Workspace archived |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 500 | Internal error |

## GET `/api/admin/workspaces/{id}/features`

Operation id: `ws_features`. Auth: Session cookie. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |

**Response 200 (application/json)**: array of `FeatureDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | string | yes |  |
| `label` | string | yes |  |
| `description` | string | yes |  |
| `enabled` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | The catalog of modules, each with this workspace's on/off state |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 500 | Internal error |

## PUT `/api/admin/workspaces/{id}/features`

Operation id: `set_ws_features`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |

**Request body (application/json)**: `SetFeatures`

| Field | Type | Required | Description |
|---|---|---|---|
| `features` | object | yes | Feature key -> enabled. Unknown keys are rejected with 400 and nothing is written (`WorkspaceRepo::set_features` validates the whole batch before opening its transaction). The *resulting* state — this batch merged onto what is already... |

**Response 200 (application/json)**: array of `FeatureDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | string | yes |  |
| `label` | string | yes |  |
| `description` | string | yes |  |
| `enabled` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | The named keys were merged onto this workspace's state; the catalog with the resulting on/off state |
| 400 | An unknown feature key, or a resulting state that violates a cross-module dependency (e.g. dashboards enabled with charts disabled); nothing was written |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 500 | Internal error |

## POST `/api/admin/workspaces/{id}/restore`

Operation id: `restore_ws`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Workspace restored |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 500 | Internal error |

## GET `/api/admin/workspaces/{id}/stats`

Operation id: `workspace_stats`. Auth: Session cookie. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |

**Response 200 (application/json)**: `WorkspaceStatsDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `member_count` | integer (int64) | yes |  |
| `query_count` | integer (int64) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Workspace usage stats |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 500 | Internal error |

## POST `/api/admin/workspaces/{id}/transfer`

Operation id: `transfer_owner`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |

**Request body (application/json)**: `TransferOwner`

| Field | Type | Required | Description |
|---|---|---|---|
| `new_owner_id` | string | yes |  |

**Response 200 (application/json)**: `WorkspaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `slug` | string | yes |  |
| `name` | string | yes |  |
| `status` | string | yes |  |
| `created_at` | string (date-time) | yes |  |
| `created_by` | string, nullable | no |  |
| `owner_name` | string, nullable | no |  |
| `features` | string[] | no | Module keys this workspace currently has switched on. Populated wherever a caller reads a workspace's entitlements back (`list_ws`, `get_ws`, `/api/me/workspaces`) via [`dto_with_features`]; left empty by the create/lifecycle handlers,... |

| Status | Meaning |
|---|---|
| 200 | Workspace updated |
| 400 | Invalid owner id |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 404 | No such workspace |
| 500 | Internal error |

