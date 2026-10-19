---
sidebar_position: 32
sidebar_label: Storage connections
description: REST endpoints in the control-plane-storage group.
---

# Storage connections API

Global storage connections (platform control plane).

This page lists 7 endpoints (OpenAPI tag `control-plane-storage`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/control-plane/storage` | `list` |  |
| POST | `/api/control-plane/storage` | `create` |  |
| GET | `/api/control-plane/storage/{id}` | `detail` |  |
| PUT | `/api/control-plane/storage/{id}` | `update` |  |
| DELETE | `/api/control-plane/storage/{id}` | `remove` |  |
| GET | `/api/control-plane/storage/{id}/download` | `download_object` | Stream a single object from a storage connection's bucket as an attachment. |
| GET | `/api/control-plane/storage/{id}/objects` | `browse_objects` | Browse the objects/folders in a storage connection's bucket (folder-style). |

## GET `/api/control-plane/storage`

Operation id: `list`. Auth: Session cookie. Forbidden (403): Missing storage:read permission.

**Response 200 (application/json)**: array of `StorageDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `purpose` | string, nullable | no |  |
| `provider` | string | yes |  |
| `endpoint` | string, nullable | no |  |
| `region` | string | yes |  |
| `bucket` | string | yes |  |
| `key_prefix` | string, nullable | no |  |
| `access_key` | string | yes |  |
| `path_style` | boolean | yes |  |
| `secret_ref` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Global storage connections |
| 401 | Not authenticated |
| 403 | Missing storage:read permission |
| 500 | Internal error |

## POST `/api/control-plane/storage`

Operation id: `create`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing storage:create permission.

**Request body (application/json)**: `StorageInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `purpose` | string, nullable | no |  |
| `provider` | string | yes |  |
| `endpoint` | string, nullable | no |  |
| `region` | string | yes |  |
| `bucket` | string | yes |  |
| `key_prefix` | string, nullable | no |  |
| `access_key` | string | yes |  |
| `secret_ref` | string (uuid), nullable | no |  |
| `path_style` | boolean | no |  |
| `new_secret` | NewSecret | no |  |

**Response 201 (application/json)**: `StorageDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `purpose` | string, nullable | no |  |
| `provider` | string | yes |  |
| `endpoint` | string, nullable | no |  |
| `region` | string | yes |  |
| `bucket` | string | yes |  |
| `key_prefix` | string, nullable | no |  |
| `access_key` | string | yes |  |
| `path_style` | boolean | yes |  |
| `secret_ref` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 201 | Storage connection created |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Missing storage:create permission |
| 409 | A storage connection with this name already exists |
| 500 | Internal error |

## GET `/api/control-plane/storage/{id}`

Operation id: `detail`. Auth: Session cookie. Forbidden (403): Missing storage:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Storage connection id |

**Response 200 (application/json)**: `StorageDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `purpose` | string, nullable | no |  |
| `provider` | string | yes |  |
| `endpoint` | string, nullable | no |  |
| `region` | string | yes |  |
| `bucket` | string | yes |  |
| `key_prefix` | string, nullable | no |  |
| `access_key` | string | yes |  |
| `path_style` | boolean | yes |  |
| `secret_ref` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Storage connection detail |
| 401 | Not authenticated |
| 403 | Missing storage:read permission |
| 404 | No such storage connection |
| 500 | Internal error |

## PUT `/api/control-plane/storage/{id}`

Operation id: `update`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing storage:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Storage connection id |

**Request body (application/json)**: `StorageInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `purpose` | string, nullable | no |  |
| `provider` | string | yes |  |
| `endpoint` | string, nullable | no |  |
| `region` | string | yes |  |
| `bucket` | string | yes |  |
| `key_prefix` | string, nullable | no |  |
| `access_key` | string | yes |  |
| `secret_ref` | string (uuid), nullable | no |  |
| `path_style` | boolean | no |  |
| `new_secret` | NewSecret | no |  |

**Response 200 (application/json)**: `StorageDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `purpose` | string, nullable | no |  |
| `provider` | string | yes |  |
| `endpoint` | string, nullable | no |  |
| `region` | string | yes |  |
| `bucket` | string | yes |  |
| `key_prefix` | string, nullable | no |  |
| `access_key` | string | yes |  |
| `path_style` | boolean | yes |  |
| `secret_ref` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Storage connection updated (secret rotation pushed to warehouses) |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Missing storage:update permission |
| 404 | No such storage connection |
| 409 | The new name clashes with an existing connection |
| 500 | Internal error |

## DELETE `/api/control-plane/storage/{id}`

Operation id: `remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing storage:delete permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Storage connection id |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Storage connection deleted |
| 401 | Not authenticated |
| 403 | Missing storage:delete permission |
| 404 | No such storage connection |
| 500 | Internal error |

## GET `/api/control-plane/storage/{id}/download`

Operation id: `download_object`. Auth: Session cookie. Forbidden (403): Missing storage:read permission.

Stream a single object from a storage connection's bucket as an attachment.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Storage connection id |
| `key` | query | string | yes | Object key to download |

| Status | Meaning |
|---|---|
| 200 | Object bytes streamed as an attachment |
| 400 | Invalid request or object could not be read |
| 401 | Not authenticated |
| 403 | Missing storage:read permission |
| 404 | No such storage connection |
| 500 | Internal error |

## GET `/api/control-plane/storage/{id}/objects`

Operation id: `browse_objects`. Auth: Session cookie. Forbidden (403): Missing storage:read permission.

Browse the objects/folders in a storage connection's bucket (folder-style).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Storage connection id |
| `prefix` | query | string | no | Folder prefix to list under |

**Response 200 (application/json)**: `ListingDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `folders` | string[] | yes |  |
| `objects` | ObjectDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Folders and objects under the prefix |
| 400 | Invalid request or bucket could not be listed |
| 401 | Not authenticated |
| 403 | Missing storage:read permission |
| 404 | No such storage connection |
| 500 | Internal error |

