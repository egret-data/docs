---
sidebar_position: 10
sidebar_label: Sharing
description: REST endpoints in the shares group.
---

# Sharing API

Per-object grants: share a dashboard / chart / dataset / folder with a user or group at a workspace role.

This page lists 6 endpoints (OpenAPI tag `shares`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/objects/{kind}/{id}/grants` | `grant_list` |  |
| PUT | `/api/ws/{workspace}/objects/{kind}/{id}/grants` | `grant_put` |  |
| DELETE | `/api/ws/{workspace}/objects/{kind}/{id}/grants/{grant_id}` | `grant_delete` |  |
| GET | `/api/ws/{workspace}/objects/{kind}/{id}/tags` | `object_tags_list` |  |
| PUT | `/api/ws/{workspace}/objects/{kind}/{id}/tags/{tag_id}` | `object_tag_assign` |  |
| DELETE | `/api/ws/{workspace}/objects/{kind}/{id}/tags/{tag_id}` | `object_tag_unassign` |  |

## GET `/api/ws/{workspace}/objects/{kind}/{id}/grants`

Operation id: `grant_list`. Auth: Session cookie. Forbidden (403): Missing &lt;kind>:manage on the object.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `kind` | path | string | yes | Object kind: dashboard \| chart \| dataset \| folder \| saved_query \| app |
| `id` | path | string (uuid) | yes | Object id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `ObjectGrantDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `principal_type` | string | yes |  |
| `principal_id` | string (uuid) | yes |  |
| `principal_name` | string, nullable | no | Human-readable grantee name: a user's email or a group's name. `None` if the principal row could not be resolved (e.g. deleted). |
| `role` | string | yes | The workspace role name (`ws_viewer` \| `ws_editor`). |
| `effect` | string | yes | `allow` \| `deny`. |
| `expires_at` | string (date-time), nullable | no | Optional expiry (P2a). `None` = never expires. This is the object's own direct-grant list (manage-only), so an expired grant is still listed here — only the read-time admission predicates exclude expired grants. |

| Status | Meaning |
|---|---|
| 200 | Direct object grants |
| 400 | Unknown kind |
| 401 | Not authenticated |
| 403 | Missing &lt;kind>:manage on the object |
| 404 | No such object in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/objects/{kind}/{id}/grants`

Operation id: `grant_put`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing &lt;kind>:manage on the object.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `kind` | path | string | yes | Object kind: dashboard \| chart \| dataset \| folder \| saved_query \| app |
| `id` | path | string (uuid) | yes | Object id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `ObjectGrantBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `principal_type` | string | yes | `user` \| `group`. |
| `principal_id` | string | yes | A user's email, a group's name, or a UUID. |
| `role` | string | yes | `ws_viewer` (Viewer, read) \| `ws_editor` (Editor, manage). For a "Blocked" grant, send `ws_editor` with `effect="deny"`. |
| `effect` | string | no | `allow` (default) \| `deny`. A deny blocks the principal on this object. |
| `expires_at` | string (date-time), nullable | no | Optional expiry (RFC3339). `None` = never expires (unchanged default). Enforced at read time by the PDP/admission predicates, not here. |

**Response 200 (application/json)**: `ObjectGrantDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `principal_type` | string | yes |  |
| `principal_id` | string (uuid) | yes |  |
| `principal_name` | string, nullable | no | Human-readable grantee name: a user's email or a group's name. `None` if the principal row could not be resolved (e.g. deleted). |
| `role` | string | yes | The workspace role name (`ws_viewer` \| `ws_editor`). |
| `effect` | string | yes | `allow` \| `deny`. |
| `expires_at` | string (date-time), nullable | no | Optional expiry (P2a). `None` = never expires. This is the object's own direct-grant list (manage-only), so an expired grant is still listed here — only the read-time admission predicates exclude expired grants. |

| Status | Meaning |
|---|---|
| 200 | Grant created (or already existed) |
| 400 | Unknown kind, role, or principal_type |
| 401 | Not authenticated |
| 403 | Missing &lt;kind>:manage on the object |
| 404 | No such object in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/objects/{kind}/{id}/grants/{grant_id}`

Operation id: `grant_delete`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing &lt;kind>:manage on the object.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `kind` | path | string | yes | Object kind: dashboard \| chart \| dataset \| folder \| saved_query \| app |
| `id` | path | string (uuid) | yes | Object id |
| `grant_id` | path | string (uuid) | yes | Grant id to revoke |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Grant revoked (idempotent) |
| 400 | Unknown kind |
| 401 | Not authenticated |
| 403 | Missing &lt;kind>:manage on the object |
| 404 | No such object in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/objects/{kind}/{id}/tags`

Operation id: `object_tags_list`. Auth: Session cookie. Forbidden (403): Missing &lt;kind>:read on the object.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `kind` | path | string | yes | Object kind: dashboard \| chart \| dataset \| folder \| saved_query \| app |
| `id` | path | string (uuid) | yes | Object id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `TagDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `key` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `color` | string | yes |  |
| `assignment_count` | integer (int64) | yes |  |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | The object's classification tags |
| 400 | Unknown kind |
| 401 | Not authenticated |
| 403 | Missing &lt;kind>:read on the object |
| 404 | No such object in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/objects/{kind}/{id}/tags/{tag_id}`

Operation id: `object_tag_assign`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing &lt;kind>:manage on the object.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `kind` | path | string | yes | Object kind: dashboard \| chart \| dataset \| folder \| saved_query \| app |
| `id` | path | string (uuid) | yes | Object id |
| `tag_id` | path | string (uuid) | yes | Tag id to assign |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Tag assigned (idempotent) |
| 400 | Unknown kind |
| 401 | Not authenticated |
| 403 | Missing &lt;kind>:manage on the object |
| 404 | No such object in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/objects/{kind}/{id}/tags/{tag_id}`

Operation id: `object_tag_unassign`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing &lt;kind>:manage on the object.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `kind` | path | string | yes | Object kind: dashboard \| chart \| dataset \| folder \| saved_query \| app |
| `id` | path | string (uuid) | yes | Object id |
| `tag_id` | path | string (uuid) | yes | Tag id to unassign |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Tag unassigned (idempotent) |
| 400 | Unknown kind |
| 401 | Not authenticated |
| 403 | Missing &lt;kind>:manage on the object |
| 404 | No such object in this workspace |
| 500 | Internal error |

