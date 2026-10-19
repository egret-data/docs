---
sidebar_position: 7
sidebar_label: User administration
description: REST endpoints in the admin-users group.
---

# User administration API

Platform-admin user directory + platform-role assignment.

This page lists 3 endpoints (OpenAPI tag `admin-users`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/admin/users` | `list_users` |  |
| GET | `/api/admin/users/{id}` | `get_user` |  |
| PUT | `/api/admin/users/{id}/platform-roles` | `set_platform_roles` |  |

## GET `/api/admin/users`

Operation id: `list_users`. Auth: Session cookie. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `page` | query | integer (int32) | no | Page number (1-based) |
| `per_page` | query | integer (int32) | no | Items per page |

**Response 200 (application/json)**: array of `UserDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `email` | string | yes |  |
| `name` | string | yes |  |
| `provider` | string | yes |  |
| `status` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | All users |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 500 | Internal error |

## GET `/api/admin/users/{id}`

Operation id: `get_user`. Auth: Session cookie. Forbidden (403): Missing platform permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | User id |

**Response 200 (application/json)**: `UserDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `email` | string | yes |  |
| `name` | string | yes |  |
| `provider` | string | yes |  |
| `status` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | User detail |
| 401 | Not authenticated |
| 403 | Missing platform permission |
| 404 | No such user |
| 500 | Internal error |

## PUT `/api/admin/users/{id}/platform-roles`

Operation id: `set_platform_roles`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Not a platform admin (role assignment is not delegatable).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | User id |

**Request body (application/json)**: `SetPlatformRoles`

| Field | Type | Required | Description |
|---|---|---|---|
| `roles` | string[] | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Platform roles replaced |
| 401 | Not authenticated |
| 403 | Not a platform admin (role assignment is not delegatable) |
| 500 | Internal error |

