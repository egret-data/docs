---
sidebar_position: 8
sidebar_label: Workspace members
description: REST endpoints in the workspace-members group.
---

# Workspace members API

Workspace membership (add/remove principals).

This page lists 9 endpoints (OpenAPI tag `workspace-members`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/access-requests` | `list_workspace_access_requests` | `GET /ws/\{workspace\}/access-requests?status=` — the workspace's join requests filtered by `status` (default `pending`). |
| POST | `/api/ws/{workspace}/access-requests/{id}/approve` | `approve_access_request` | `POST /ws/\{workspace\}/access-requests/\{id\}/approve` — approve a pending request: add the requester as a member with the chosen role + optional expiry via the... |
| POST | `/api/ws/{workspace}/access-requests/{id}/deny` | `deny_access_request` | `POST /ws/\{workspace\}/access-requests/\{id\}/deny` — deny a pending request with an optional note. |
| POST | `/api/ws/{workspace}/impersonate` | `ws_impersonate_start` | `POST /api/ws/\{workspace\}/impersonate` — a `ws_admin` of `\{workspace\}` (or a platform_admin) starts impersonating a MEMBER of that workspace. |
| GET | `/api/ws/{workspace}/members` | `list_members` |  |
| POST | `/api/ws/{workspace}/members` | `add_member` |  |
| DELETE | `/api/ws/{workspace}/members/{ptype}/{pid}` | `remove_member` |  |
| GET | `/api/ws/{workspace}/roles` | `list_workspace_roles` | `GET /ws/\{workspace\}/roles` — the workspace-scope role catalog with each role's direct permissions. |
| GET | `/api/ws/{workspace}/shares` | `list_workspace_shares` | `GET /ws/\{workspace\}/shares` — every OBJECT grant whose object lives in THIS workspace (charts, dashboards, datasets, folders, saved queries, apps), enriched... |

## GET `/api/ws/{workspace}/access-requests`

Operation id: `list_workspace_access_requests`. Auth: Session cookie. Forbidden (403): Missing workspace permission.

`GET /ws/\{workspace\}/access-requests?status=` — the workspace's join requests filtered by `status` (default `pending`). Gated on `workspace:manage_members`.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `status` | query | string | no | Filter by status (default: pending) |

**Response 200 (application/json)**: array of `AccessRequestDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `workspace_id` | string | yes |  |
| `workspace_name` | string, nullable | no |  |
| `requester_id` | string | yes |  |
| `requester_name` | string, nullable | no |  |
| `requested_role` | string | yes |  |
| `reason` | string | yes |  |
| `status` | string | yes |  |
| `decided_by` | string, nullable | no |  |
| `decided_at` | string, nullable | no |  |
| `decision_note` | string, nullable | no |  |
| `expires_at` | string, nullable | no |  |
| `created_at` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | The workspace's join requests, newest first |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/access-requests/{id}/approve`

Operation id: `approve_access_request`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workspace permission.

`POST /ws/\{workspace\}/access-requests/\{id\}/approve` — approve a pending request: add the requester as a member with the chosen role + optional expiry via the repo's single grant path, then mark it approved. The repo enforces the cross-workspace guard (`NotFound` → 404) and pending guard (`Conflict` → 409).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Access-request id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `ApproveAccessRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `role` | string, nullable | no | Role to grant the requester; defaults to the originally requested role. |
| `expires_at` | string (date-time), nullable | no | Optional time-boxed expiry for the membership grant. |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Request approved and member added |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 404 | No such request in this workspace |
| 409 | Request already decided |
| 500 | Internal error |

## POST `/api/ws/{workspace}/access-requests/{id}/deny`

Operation id: `deny_access_request`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workspace permission.

`POST /ws/\{workspace\}/access-requests/\{id\}/deny` — deny a pending request with an optional note. The repo enforces the cross-workspace + pending guards.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Access-request id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `DenyAccessRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `note` | string, nullable | no | Optional note recorded on the denied request. |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Request denied |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 409 | Request not pending or not in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/impersonate`

Operation id: `ws_impersonate_start`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Not a ws_admin, already impersonating, target not a member, target is a ws_admin here, or the target holds ANY platform-scoped role grant — wider than the platform endpoint's rule, because the overlay this one writes is workspace-scoped and no /api/control-plane route confines such an overlay.

`POST /api/ws/\{workspace\}/impersonate` — a `ws_admin` of `\{workspace\}` (or a platform_admin) starts impersonating a MEMBER of that workspace. The resulting overlay is **workspace-scoped**: `WsContext` confines it to `\{workspace\}` even though the target may belong to others (see the containment guard there).

Guards run in a deliberate order so a caller learns nothing before its own authority is proven: (1) not already impersonating; (2) caller is `ws_admin` here or a platform_admin; (3) the shared target guards (not-self, reason non-empty, target exists, and — because the overlay THIS endpoint writes is workspace-scoped — the target holds NO platform-scoped role grant at all; `validate_impersonation_target`, and read its ⚠ paragraph: that third guard is what stops this endpoint minting a scoped overlay with platform authority, which no `/api/control-plane` route confines, and it is deliberately WIDER here than on the platform endpoint); (4) the target is a MEMBER of this workspace and is NOT...

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `StartWsImpersonation`

| Field | Type | Required | Description |
|---|---|---|---|
| `target_user_id` | string | yes |  |
| `reason` | string | yes |  |
| `password` | string, nullable | no | Required for a local-auth caller (step-up). OIDC callers re-auth via OIDC. |

| Status | Meaning |
|---|---|
| 200 | Impersonation started; the session now resolves to the target, scoped to this workspace |
| 400 | Bad target / empty reason |
| 401 | Not authenticated, or wrong step-up password |
| 403 | Not a ws_admin, already impersonating, target not a member, target is a ws_admin here, or the target holds ANY platform-scoped role grant — wider than the platform endpoint's rule, because the overlay this one writes is workspace-scoped and... |
| 409 | OIDC caller: re-authenticate at `authorize_url`, then the callback creates the overlay |
| 500 | Internal error |

## GET `/api/ws/{workspace}/members`

Operation id: `list_members`. Auth: Session cookie. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: array of `MemberDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `principal_type` | string | yes |  |
| `principal_id` | string | yes |  |
| `role` | string | yes |  |
| `principal_name` | string, nullable | no |  |
| `granted_by_name` | string, nullable | no |  |
| `added_at` | string (date-time) | yes |  |
| `is_platform_admin` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Members of the workspace |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/members`

Operation id: `add_member`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `AddMember`

| Field | Type | Required | Description |
|---|---|---|---|
| `principal_type` | string | yes |  |
| `principal_id` | string | yes |  |
| `role` | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Member added |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/members/{ptype}/{pid}`

Operation id: `remove_member`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workspace permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `ptype` | path | string | yes | Principal type (user \| group) |
| `pid` | path | string (uuid) | yes | Principal id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Member removed |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 500 | Internal error |

## GET `/api/ws/{workspace}/roles`

Operation id: `list_workspace_roles`. Auth: Session cookie. Forbidden (403): Missing workspace permission.

`GET /ws/\{workspace\}/roles` — the workspace-scope role catalog with each role's direct permissions. Read-only, so a workspace admin can SEE what each role grants; gated on `workspace:manage_members` (the same gate as the member routes) rather than the platform-level `role:read`.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: array of `WsRoleDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `parent_role_id` | string, nullable | no |  |
| `permissions` | WsPermDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Workspace-scope roles with their permissions |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 500 | Internal error |

## GET `/api/ws/{workspace}/shares`

Operation id: `list_workspace_shares`. Auth: Session cookie. Forbidden (403): Missing workspace permission.

`GET /ws/\{workspace\}/shares` — every OBJECT grant whose object lives in THIS workspace (charts, dashboards, datasets, folders, saved queries, apps), enriched with object name, role name, principal name and effect. Read-only, so a workspace admin can SEE what has been shared; gated on `workspace:manage_members` (the same gate as the member/role routes). The object set is restricted to this workspace in SQL — a grant on an object in another workspace is never returned (cross-workspace IDOR guard).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: array of `ObjectGrantRollupDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `kind` | string | yes |  |
| `object_id` | string | yes |  |
| `object_name` | string, nullable | no |  |
| `principal_type` | string | yes |  |
| `principal_id` | string | yes |  |
| `principal_name` | string, nullable | no |  |
| `role` | string | yes |  |
| `effect` | string | yes |  |
| `expires_at` | string, nullable | no | Optional expiry (RFC3339). `None` = never expires. This is the management roll-up, so an expired grant is still returned (not filtered). |

| Status | Meaning |
|---|---|
| 200 | Object grants whose object lives in this workspace |
| 401 | Not authenticated |
| 403 | Missing workspace permission |
| 500 | Internal error |

