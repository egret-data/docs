---
sidebar_position: 28
sidebar_label: Access control
description: REST endpoints in the control-plane-access group.
---

# Access control API

Platform access control: users, groups, roles, and the permission catalog.

This page lists 41 endpoints (OpenAPI tag `control-plane-access`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/control-plane/access/effective` | `get_effective_access` | `GET /access/effective` — the effective-access resolver (AX-3): for a principal, enumerate the platform roles, permissions (with provenance), workspace membe... |
| GET | `/api/control-plane/access/roles` | `list_roles` |  |
| POST | `/api/control-plane/access/roles` | `create_role` |  |
| GET | `/api/control-plane/access/roles/{id}` | `get_role` |  |
| PATCH | `/api/control-plane/access/roles/{id}` | `update_role` |  |
| DELETE | `/api/control-plane/access/roles/{id}` | `delete_role` |  |
| GET | `/api/control-plane/access/roles/{id}/assignees` | `list_role_assignees` | `GET /access/roles/\{id\}/assignees` — the role's current assignees (users by email, groups by name), so the admin console can drill into who holds a role. |
| PUT | `/api/control-plane/access/roles/{id}/permissions` | `set_role_permissions` |  |
| GET | `/api/control-plane/access/who-can-access` | `who_can_access` | `GET /access/who-can-access` — the reverse of `/access/effective` (AX-3): for one object (`kind` + `id`), enumerate every principal who can reach it and why ... |
| GET | `/api/control-plane/groups` | `list_groups` |  |
| POST | `/api/control-plane/groups` | `create_group` |  |
| PATCH | `/api/control-plane/groups/{id}` | `rename_group` |  |
| DELETE | `/api/control-plane/groups/{id}` | `delete_group` |  |
| GET | `/api/control-plane/groups/{id}/members` | `list_group_members` | `GET /groups/\{id\}/members` — the group's current members, so the admin console can prefill and diff its manage-members dialog. |
| POST | `/api/control-plane/groups/{id}/members` | `add_group_member` |  |
| DELETE | `/api/control-plane/groups/{id}/members/{user_id}` | `remove_group_member` |  |
| POST | `/api/control-plane/groups/{id}/roles` | `assign_group_role` |  |
| DELETE | `/api/control-plane/groups/{id}/roles/{role_id}` | `unassign_group_role` |  |
| GET | `/api/control-plane/permissions` | `list_permissions` | `GET /permissions` — the code-defined catalog (`egret_core::rbac`), each permission annotated with the role names that currently grant it. |
| GET | `/api/control-plane/service-accounts` | `list_service_accounts` |  |
| POST | `/api/control-plane/service-accounts` | `create_service_account` |  |
| GET | `/api/control-plane/service-accounts/{id}` | `get_service_account` |  |
| DELETE | `/api/control-plane/service-accounts/{id}` | `delete_service_account` |  |
| GET | `/api/control-plane/service-accounts/{id}/credentials` | `list_credentials` |  |
| POST | `/api/control-plane/service-accounts/{id}/credentials` | `create_credential` |  |
| POST | `/api/control-plane/service-accounts/{id}/credentials/{cid}/expiry` | `set_credential_expiry` |  |
| POST | `/api/control-plane/service-accounts/{id}/credentials/{cid}/revoke` | `revoke_credential` |  |
| POST | `/api/control-plane/service-accounts/{id}/credentials/{cid}/rotate` | `rotate_credential` |  |
| POST | `/api/control-plane/service-accounts/{id}/disable` | `disable_service_account` |  |
| POST | `/api/control-plane/service-accounts/{id}/enable` | `enable_service_account` |  |
| POST | `/api/control-plane/service-accounts/{id}/groups` | `add_service_account_group` |  |
| DELETE | `/api/control-plane/service-accounts/{id}/groups/{group_id}` | `remove_service_account_group` |  |
| POST | `/api/control-plane/service-accounts/{id}/roles` | `add_service_account_role` |  |
| DELETE | `/api/control-plane/service-accounts/{id}/roles/{role_id}` | `remove_service_account_role` |  |
| GET | `/api/control-plane/users` | `list_users` |  |
| POST | `/api/control-plane/users` | `create_user` |  |
| PATCH | `/api/control-plane/users/{id}` | `update_user` |  |
| DELETE | `/api/control-plane/users/{id}` | `delete_user` | `DELETE /users/\{id\}` — hard-delete a user (Task 4). |
| POST | `/api/control-plane/users/{id}/password` | `reset_password` | `POST /users/\{id\}/password` — admin reset of a LOCAL user's password. |
| POST | `/api/control-plane/users/{id}/roles` | `assign_user_role` |  |
| DELETE | `/api/control-plane/users/{id}/roles/{role_id}` | `unassign_user_role` |  |

## GET `/api/control-plane/access/effective`

Operation id: `get_effective_access`. Auth: Session cookie. Forbidden (403): Missing role:read permission.

`GET /access/effective` — the effective-access resolver (AX-3): for a principal, enumerate the platform roles, permissions (with provenance), workspace memberships, object grants, and denies that feed them. Read-only, so it gates on `role:read`. `principal_id` accepts a raw UUID or a user email / group name (resolved to a UUID; 404 if unknown).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `principal_type` | query | string | yes | user \| group |
| `principal_id` | query | string | yes | UUID, or a user email / group name |

**Response 200 (application/json)**: `EffectiveAccess`

| Field | Type | Required | Description |
|---|---|---|---|
| `principal` | PrincipalInfo | yes |  |
| `platform_roles` | RoleSource[] | yes |  |
| `permissions` | EffectivePermission[] | yes |  |
| `workspaces` | WorkspaceMembership[] | yes |  |
| `objects` | ObjectGrant[] | yes |  |
| `denies` | DenyEntry[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Effective access for the principal |
| 400 | Invalid principal_type |
| 401 | Not authenticated |
| 403 | Missing role:read permission |
| 404 | No such principal |
| 500 | Internal error |

## GET `/api/control-plane/access/roles`

Operation id: `list_roles`. Auth: Session cookie. Forbidden (403): Missing role:read permission.

**Response 200 (application/json)**: array of `RoleDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `scope` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `permissionCount` | integer (int64) | yes |  |
| `assigneeCount` | integer (int64) | yes |  |
| `parentRoleId` | string (uuid), nullable | no | The role this one inherits permissions from (same scope). `None` at the top of a chain. |
| `inheritedPermissions` | string[] | yes | Effective-minus-own permissions, for read-only display. Populated on the single-role GET; empty on the list endpoint. |

| Status | Meaning |
|---|---|
| 200 | RBAC roles with permission and assignee counts |
| 401 | Not authenticated |
| 403 | Missing role:read permission |
| 500 | Internal error |

## POST `/api/control-plane/access/roles`

Operation id: `create_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Requires platform_admin.

**Request body (application/json)**: `CreateRoleInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `scope` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | no |  |
| `parentRoleId` | string (uuid), nullable | no |  |

**Response 201 (application/json)**: `RoleDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `scope` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `permissionCount` | integer (int64) | yes |  |
| `assigneeCount` | integer (int64) | yes |  |
| `parentRoleId` | string (uuid), nullable | no | The role this one inherits permissions from (same scope). `None` at the top of a chain. |
| `inheritedPermissions` | string[] | yes | Effective-minus-own permissions, for read-only display. Populated on the single-role GET; empty on the list endpoint. |

| Status | Meaning |
|---|---|
| 201 | Role created |
| 400 | Invalid scope |
| 401 | Not authenticated |
| 403 | Requires platform_admin |
| 409 | A role with this name already exists |
| 500 | Internal error |

## GET `/api/control-plane/access/roles/{id}`

Operation id: `get_role`. Auth: Session cookie. Forbidden (403): Missing role:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Role id |

**Response 200 (application/json)**: `RoleDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `scope` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `permissionCount` | integer (int64) | yes |  |
| `assigneeCount` | integer (int64) | yes |  |
| `parentRoleId` | string (uuid), nullable | no | The role this one inherits permissions from (same scope). `None` at the top of a chain. |
| `inheritedPermissions` | string[] | yes | Effective-minus-own permissions, for read-only display. Populated on the single-role GET; empty on the list endpoint. |

| Status | Meaning |
|---|---|
| 200 | A single role with its parent and inherited permissions |
| 401 | Not authenticated |
| 403 | Missing role:read permission |
| 404 | No such role |
| 500 | Internal error |

## PATCH `/api/control-plane/access/roles/{id}`

Operation id: `update_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Requires platform_admin.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Role id |

**Request body (application/json)**: `UpdateRoleInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `description` | string | yes |  |
| `parentRoleId` | string (uuid), nullable | no |  |

**Response 200 (application/json)**: `RoleDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `scope` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `permissionCount` | integer (int64) | yes |  |
| `assigneeCount` | integer (int64) | yes |  |
| `parentRoleId` | string (uuid), nullable | no | The role this one inherits permissions from (same scope). `None` at the top of a chain. |
| `inheritedPermissions` | string[] | yes | Effective-minus-own permissions, for read-only display. Populated on the single-role GET; empty on the list endpoint. |

| Status | Meaning |
|---|---|
| 200 | Role description updated |
| 401 | Not authenticated |
| 403 | Requires platform_admin |
| 404 | No such role |
| 500 | Internal error |

## DELETE `/api/control-plane/access/roles/{id}`

Operation id: `delete_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Requires platform_admin.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Role id |

| Status | Meaning |
|---|---|
| 204 | Role deleted |
| 401 | Not authenticated |
| 403 | Requires platform_admin |
| 404 | No such role |
| 409 | Seeded roles cannot be deleted |
| 500 | Internal error |

## GET `/api/control-plane/access/roles/{id}/assignees`

Operation id: `list_role_assignees`. Auth: Session cookie. Forbidden (403): Missing role:read permission.

`GET /access/roles/\{id\}/assignees` — the role's current assignees (users by email, groups by name), so the admin console can drill into who holds a role. Read-only, so it gates on `role:read`.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Role id |

**Response 200 (application/json)**: array of `RoleAssigneeDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `kind` | string | yes |  |
| `name` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | The role's current assignees (users and groups) |
| 401 | Not authenticated |
| 403 | Missing role:read permission |
| 500 | Internal error |

## PUT `/api/control-plane/access/roles/{id}/permissions`

Operation id: `set_role_permissions`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Requires platform_admin.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Role id |

**Request body (application/json)**: `SetPermissionsInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `permissions` | string[] | yes |  |

| Status | Meaning |
|---|---|
| 204 | Role permission set replaced |
| 400 | Unknown permission key |
| 401 | Not authenticated |
| 403 | Requires platform_admin |
| 500 | Internal error |

## GET `/api/control-plane/access/who-can-access`

Operation id: `who_can_access`. Auth: Session cookie. Forbidden (403): Missing role:read permission.

`GET /access/who-can-access` — the reverse of `/access/effective` (AX-3): for one object (`kind` + `id`), enumerate every principal who can reach it and why (direct object grants, the object's workspace-role holders, and platform admins). Read-only, so it gates on `role:read`. An unknown `kind` or a missing object surfaces `egret_core::Error::NotFound` → 404.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `kind` | query | string | yes | Object kind: chart \| dashboard \| dataset \| notebook \| saved_query \| folder \| app |
| `id` | query | string (uuid) | yes | Object UUID |

**Response 200 (application/json)**: `WhoCanAccess`

| Field | Type | Required | Description |
|---|---|---|---|
| `object` | ObjectRef | yes |  |
| `entries` | AccessEntry[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Principals who can access the object |
| 401 | Not authenticated |
| 403 | Missing role:read permission |
| 404 | Unknown object kind or no such object |
| 500 | Internal error |

## GET `/api/control-plane/groups`

Operation id: `list_groups`. Auth: Session cookie. Forbidden (403): Missing group:read permission.

**Response 200 (application/json)**: array of `GroupDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `source` | string | yes |  |
| `memberCount` | integer (int64) | yes |  |
| `roles` | string[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Platform groups with member counts and roles |
| 401 | Not authenticated |
| 403 | Missing group:read permission |
| 500 | Internal error |

## POST `/api/control-plane/groups`

Operation id: `create_group`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing group:create permission.

**Request body (application/json)**: `CreateGroupInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |

**Response 201 (application/json)**: `GroupDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `source` | string | yes |  |
| `memberCount` | integer (int64) | yes |  |
| `roles` | string[] | yes |  |

| Status | Meaning |
|---|---|
| 201 | Local group created |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Missing group:create permission |
| 409 | A group with this name already exists |
| 500 | Internal error |

## PATCH `/api/control-plane/groups/{id}`

Operation id: `rename_group`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing group:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Group id |

**Request body (application/json)**: `RenameGroupInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |

| Status | Meaning |
|---|---|
| 204 | Group renamed |
| 401 | Not authenticated |
| 403 | Missing group:update permission |
| 409 | Cannot rename an OIDC-synced group; or another group already has the new name; or grants or rule exemptions still name the old or the new name (the message lists them to a caller with policy:read, and otherwise gives only their count;... |
| 500 | Internal error |

## DELETE `/api/control-plane/groups/{id}`

Operation id: `delete_group`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing group:delete permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Group id |

| Status | Meaning |
|---|---|
| 204 | Group deleted |
| 401 | Not authenticated |
| 403 | Missing group:delete permission |
| 409 | Cannot delete an OIDC-synced group; or grants or rule exemptions still name the group (the message lists them to a caller with policy:read, and otherwise gives only their count; remove them first); or the delete would remove the last active... |
| 500 | Internal error |

## GET `/api/control-plane/groups/{id}/members`

Operation id: `list_group_members`. Auth: Session cookie. Forbidden (403): Missing group:read permission.

`GET /groups/\{id\}/members` — the group's current members, so the admin console can prefill and diff its manage-members dialog. Read-only, so it gates on `group:read` rather than `group:manage_members`.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Group id |

**Response 200 (application/json)**: array of `GroupMemberDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `email` | string | yes |  |
| `name` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | The group's current members |
| 401 | Not authenticated |
| 403 | Missing group:read permission |
| 500 | Internal error |

## POST `/api/control-plane/groups/{id}/members`

Operation id: `add_group_member`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Requires platform_admin.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Group id |

**Request body (application/json)**: `AddMemberInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | string (uuid) | yes |  |

| Status | Meaning |
|---|---|
| 204 | User added to the group |
| 401 | Not authenticated |
| 403 | Requires platform_admin |
| 404 | No such group or user |
| 409 | Cannot add members to an OIDC-synced group |
| 500 | Internal error |

## DELETE `/api/control-plane/groups/{id}/members/{user_id}`

Operation id: `remove_group_member`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Requires platform_admin.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Group id |
| `user_id` | path | string (uuid) | yes | User id to remove |

| Status | Meaning |
|---|---|
| 204 | User removed from the group |
| 401 | Not authenticated |
| 403 | Requires platform_admin |
| 409 | Would remove the last active platform admin (the user holds platform_admin only through this group) |
| 500 | Internal error |

## POST `/api/control-plane/groups/{id}/roles`

Operation id: `assign_group_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Requires platform_admin.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Group id |

**Request body (application/json)**: `AssignRoleInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `roleId` | string (uuid) | yes |  |

| Status | Meaning |
|---|---|
| 204 | Role assigned to the group |
| 401 | Not authenticated |
| 403 | Requires platform_admin |
| 404 | No such group or role |
| 500 | Internal error |

## DELETE `/api/control-plane/groups/{id}/roles/{role_id}`

Operation id: `unassign_group_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Requires platform_admin.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Group id |
| `role_id` | path | string (uuid) | yes | Role id to unassign |

| Status | Meaning |
|---|---|
| 204 | Role unassigned from the group |
| 401 | Not authenticated |
| 403 | Requires platform_admin |
| 404 | No such role |
| 409 | Would remove the last active platform admin |
| 500 | Internal error |

## GET `/api/control-plane/permissions`

Operation id: `list_permissions`. Auth: Session cookie. Forbidden (403): Missing role:read permission.

`GET /permissions` — the code-defined catalog (`egret_core::rbac`), each permission annotated with the role names that currently grant it.

**Response 200 (application/json)**: array of `PermissionGroupDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `group` | string | yes |  |
| `permissions` | PermissionDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The code-defined permission catalog, grouped, annotated with granting roles |
| 401 | Not authenticated |
| 403 | Missing role:read permission |
| 500 | Internal error |

## GET `/api/control-plane/service-accounts`

Operation id: `list_service_accounts`. Auth: Session cookie. Forbidden (403): Missing user:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `scope` | query | string | no | Filter by `platform` or `workspace` |
| `workspace_id` | query | string (uuid) | no | Filter by workspace |

**Response 200 (application/json)**: array of `ServiceAccountDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string (uuid) | yes |  |
| `scope` | string | yes | `platform` or `workspace`. |
| `workspace_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `status` | string | yes | Mirrors `users.status` (`active` / `disabled`). |

| Status | Meaning |
|---|---|
| 200 | Service accounts, newest first |
| 401 | Not authenticated |
| 403 | Missing user:read permission |
| 500 | Internal error |

## POST `/api/control-plane/service-accounts`

Operation id: `create_service_account`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:create permission.

**Request body (application/json)**: `CreateServiceAccountBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `scope` | string | yes | `platform` or `workspace`. |
| `workspace_id` | string (uuid), nullable | no | Required for `workspace`, forbidden for `platform`. |
| `name` | string | yes |  |
| `description` | string, nullable | no |  |

**Response 200 (application/json)**: `ServiceAccountDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string (uuid) | yes |  |
| `scope` | string | yes | `platform` or `workspace`. |
| `workspace_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `status` | string | yes | Mirrors `users.status` (`active` / `disabled`). |

| Status | Meaning |
|---|---|
| 200 | Service account created |
| 400 | Scope and workspace disagree, or the name is unusable |
| 401 | Not authenticated |
| 403 | Missing user:create permission |
| 404 | No such workspace |
| 409 | A service account with this name already exists |
| 500 | Internal error |

## GET `/api/control-plane/service-accounts/{id}`

Operation id: `get_service_account`. Auth: Session cookie. Forbidden (403): Missing user:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |

**Response 200 (application/json)**: `ServiceAccountDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string (uuid) | yes |  |
| `scope` | string | yes | `platform` or `workspace`. |
| `workspace_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `status` | string | yes | Mirrors `users.status` (`active` / `disabled`). |
| `groups` | string[] | yes | Names of the groups the account is a member of. |
| `roles` | string[] | yes | Names of the platform roles granted to the account directly. |

| Status | Meaning |
|---|---|
| 200 | The service account with its group and role memberships |
| 401 | Not authenticated |
| 403 | Missing user:read permission |
| 404 | No such service account |
| 500 | Internal error |

## DELETE `/api/control-plane/service-accounts/{id}`

Operation id: `delete_service_account`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:delete permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |

| Status | Meaning |
|---|---|
| 204 | Deleted along with its sessions, memberships and grants; its engine username is retired |
| 401 | Not authenticated |
| 403 | Missing user:delete permission |
| 404 | No such service account |
| 409 | The account still owns content |
| 500 | Internal error |

## GET `/api/control-plane/service-accounts/{id}/credentials`

Operation id: `list_credentials`. Auth: Session cookie. Forbidden (403): Missing user:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |

**Response 200 (application/json)**: array of `Credential`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `service_account_id` | string (uuid) | yes |  |
| `audience` | Audience | yes |  |
| `name` | string | yes |  |
| `client_id` | string | yes | The OAuth2 `client_id` the client presents. |
| `status` | CredentialStatus | yes |  |
| `created_at` | string (date-time) | yes |  |
| `last_used_at` | string (date-time), nullable | no |  |
| `expires_at` | string (date-time), nullable | no |  |
| `catalog` | CatalogBinding | no |  |

| Status | Meaning |
|---|---|
| 200 | The account's credentials across both audiences, newest first |
| 401 | Not authenticated |
| 403 | Missing user:read permission |
| 404 | No such service account |
| 500 | Internal error |

## POST `/api/control-plane/service-accounts/{id}/credentials`

Operation id: `create_credential`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing service_account:manage in the account's workspace (data-api) or catalog_registry:create (catalog).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |

**Request body (application/json)**: `CreateCredentialBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `audience` | Audience | yes |  |
| `name` | string, nullable | no | Defaults to `&lt;service account name> &lt;audience> credential`. |
| `catalog` | CatalogBinding | no |  |
| `expires_at` | string (date-time), nullable | no |  |

**Response 201 (application/json)**: `CreatedCredential`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `service_account_id` | string (uuid) | yes |  |
| `audience` | Audience | yes |  |
| `name` | string | yes |  |
| `client_id` | string | yes | The OAuth2 `client_id` the client presents. |
| `status` | CredentialStatus | yes |  |
| `created_at` | string (date-time) | yes |  |
| `last_used_at` | string (date-time), nullable | no |  |
| `expires_at` | string (date-time), nullable | no |  |
| `catalog` | CatalogBinding | no |  |
| `client_secret` | string | yes | Shown ONCE; only a hash is stored. |

| Status | Meaning |
|---|---|
| 201 | Credential minted; client_secret is shown ONCE |
| 400 | Bad audience/binding, or the warehouse is in a different workspace than a workspace service account |
| 401 | Not authenticated |
| 403 | Missing service_account:manage in the account's workspace (data-api) or catalog_registry:create (catalog) |
| 404 | No such service account or warehouse |
| 500 | Internal error |

## POST `/api/control-plane/service-accounts/{id}/credentials/{cid}/expiry`

Operation id: `set_credential_expiry`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |
| `cid` | path | string (uuid) | yes | Credential id |

**Request body (application/json)**: `SetExpiryBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `expires_at` | string (date-time), nullable | no | `null` clears the expiry. A time in the past expires the credential now. |

**Response 200 (application/json)**: `Credential`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `service_account_id` | string (uuid) | yes |  |
| `audience` | Audience | yes |  |
| `name` | string | yes |  |
| `client_id` | string | yes | The OAuth2 `client_id` the client presents. |
| `status` | CredentialStatus | yes |  |
| `created_at` | string (date-time) | yes |  |
| `last_used_at` | string (date-time), nullable | no |  |
| `expires_at` | string (date-time), nullable | no |  |
| `catalog` | CatalogBinding | no |  |

| Status | Meaning |
|---|---|
| 200 | Expiry set (null clears it) |
| 401 | Not authenticated |
| 403 | Missing user:update permission |
| 404 | No such service account or credential |
| 500 | Internal error |

## POST `/api/control-plane/service-accounts/{id}/credentials/{cid}/revoke`

Operation id: `revoke_credential`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |
| `cid` | path | string (uuid) | yes | Credential id |

**Response 200 (application/json)**: `Credential`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `service_account_id` | string (uuid) | yes |  |
| `audience` | Audience | yes |  |
| `name` | string | yes |  |
| `client_id` | string | yes | The OAuth2 `client_id` the client presents. |
| `status` | CredentialStatus | yes |  |
| `created_at` | string (date-time) | yes |  |
| `last_used_at` | string (date-time), nullable | no |  |
| `expires_at` | string (date-time), nullable | no |  |
| `catalog` | CatalogBinding | no |  |

| Status | Meaning |
|---|---|
| 200 | Revoked: the verifier refuses it from now on |
| 401 | Not authenticated |
| 403 | Missing user:update permission |
| 404 | No such service account or credential |
| 500 | Internal error |

## POST `/api/control-plane/service-accounts/{id}/credentials/{cid}/rotate`

Operation id: `rotate_credential`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:update, or the audience mint permission (service_account:manage in the account workspace / catalog_registry:create).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |
| `cid` | path | string (uuid) | yes | Credential id |

**Response 200 (application/json)**: `CreatedCredential`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `service_account_id` | string (uuid) | yes |  |
| `audience` | Audience | yes |  |
| `name` | string | yes |  |
| `client_id` | string | yes | The OAuth2 `client_id` the client presents. |
| `status` | CredentialStatus | yes |  |
| `created_at` | string (date-time) | yes |  |
| `last_used_at` | string (date-time), nullable | no |  |
| `expires_at` | string (date-time), nullable | no |  |
| `catalog` | CatalogBinding | no |  |
| `client_secret` | string | yes | Shown ONCE; only a hash is stored. |

| Status | Meaning |
|---|---|
| 200 | A replacement minted (same audience, name and binding) and the old one revoked; client_secret is shown ONCE |
| 401 | Not authenticated |
| 403 | Missing user:update, or the audience mint permission (service_account:manage in the account workspace / catalog_registry:create) |
| 404 | No such service account or credential |
| 409 | The credential is already revoked |
| 500 | Internal error |

## POST `/api/control-plane/service-accounts/{id}/disable`

Operation id: `disable_service_account`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |

**Response 200 (application/json)**: `ServiceAccountDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string (uuid) | yes |  |
| `scope` | string | yes | `platform` or `workspace`. |
| `workspace_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `status` | string | yes | Mirrors `users.status` (`active` / `disabled`). |
| `groups` | string[] | yes | Names of the groups the account is a member of. |
| `roles` | string[] | yes | Names of the platform roles granted to the account directly. |

| Status | Meaning |
|---|---|
| 200 | Disabled: its credentials stop verifying, engine profiles are recompiled and live sessions revoked |
| 401 | Not authenticated |
| 403 | Missing user:update permission |
| 404 | No such service account |
| 409 | Would remove the last active platform admin |
| 500 | Internal error |

## POST `/api/control-plane/service-accounts/{id}/enable`

Operation id: `enable_service_account`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |

**Response 200 (application/json)**: `ServiceAccountDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string (uuid) | yes |  |
| `scope` | string | yes | `platform` or `workspace`. |
| `workspace_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `status` | string | yes | Mirrors `users.status` (`active` / `disabled`). |
| `groups` | string[] | yes | Names of the groups the account is a member of. |
| `roles` | string[] | yes | Names of the platform roles granted to the account directly. |

| Status | Meaning |
|---|---|
| 200 | Re-enabled |
| 401 | Not authenticated |
| 403 | Missing user:update permission |
| 404 | No such service account |
| 500 | Internal error |

## POST `/api/control-plane/service-accounts/{id}/groups`

Operation id: `add_service_account_group`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing group:manage_members permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |

**Request body (application/json)**: `AddGroupBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `group_id` | string (uuid) | yes |  |

**Response 200 (application/json)**: `ServiceAccountDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string (uuid) | yes |  |
| `scope` | string | yes | `platform` or `workspace`. |
| `workspace_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `status` | string | yes | Mirrors `users.status` (`active` / `disabled`). |
| `groups` | string[] | yes | Names of the groups the account is a member of. |
| `roles` | string[] | yes | Names of the platform roles granted to the account directly. |

| Status | Meaning |
|---|---|
| 200 | Added to the group |
| 401 | Not authenticated |
| 403 | Missing group:manage_members permission |
| 404 | No such service account or group |
| 409 | OIDC-synced groups are IdP-owned; a service account cannot join one |
| 500 | Internal error |

## DELETE `/api/control-plane/service-accounts/{id}/groups/{group_id}`

Operation id: `remove_service_account_group`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing group:manage_members permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |
| `group_id` | path | string (uuid) | yes | Group id |

**Response 200 (application/json)**: `ServiceAccountDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string (uuid) | yes |  |
| `scope` | string | yes | `platform` or `workspace`. |
| `workspace_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `status` | string | yes | Mirrors `users.status` (`active` / `disabled`). |
| `groups` | string[] | yes | Names of the groups the account is a member of. |
| `roles` | string[] | yes | Names of the platform roles granted to the account directly. |

| Status | Meaning |
|---|---|
| 200 | Removed from the group |
| 401 | Not authenticated |
| 403 | Missing group:manage_members permission |
| 404 | No such service account |
| 409 | Would remove the last active platform admin |
| 500 | Internal error |

## POST `/api/control-plane/service-accounts/{id}/roles`

Operation id: `add_service_account_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:assign_role permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |

**Request body (application/json)**: `AddRoleBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `role_id` | string (uuid) | yes |  |
| `scope_type` | string | yes | Only `platform` is supported on this surface. |
| `workspace_id` | string (uuid), nullable | no |  |

**Response 200 (application/json)**: `ServiceAccountDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string (uuid) | yes |  |
| `scope` | string | yes | `platform` or `workspace`. |
| `workspace_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `status` | string | yes | Mirrors `users.status` (`active` / `disabled`). |
| `groups` | string[] | yes | Names of the groups the account is a member of. |
| `roles` | string[] | yes | Names of the platform roles granted to the account directly. |

| Status | Meaning |
|---|---|
| 200 | Role granted |
| 400 | platform_admin may not be granted to a service account, or the scope is unsupported |
| 401 | Not authenticated |
| 403 | Missing user:assign_role permission |
| 404 | No such service account or role |
| 500 | Internal error |

## DELETE `/api/control-plane/service-accounts/{id}/roles/{role_id}`

Operation id: `remove_service_account_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:assign_role permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Service account user id |
| `role_id` | path | string (uuid) | yes | Role id to revoke |

**Response 200 (application/json)**: `ServiceAccountDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string (uuid) | yes |  |
| `scope` | string | yes | `platform` or `workspace`. |
| `workspace_id` | string (uuid), nullable | no |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `status` | string | yes | Mirrors `users.status` (`active` / `disabled`). |
| `groups` | string[] | yes | Names of the groups the account is a member of. |
| `roles` | string[] | yes | Names of the platform roles granted to the account directly. |

| Status | Meaning |
|---|---|
| 200 | Role revoked |
| 401 | Not authenticated |
| 403 | Missing user:assign_role permission |
| 404 | No such service account or role |
| 409 | Would remove the last active platform admin |
| 500 | Internal error |

## GET `/api/control-plane/users`

Operation id: `list_users`. Auth: Session cookie. Forbidden (403): Missing user:read permission.

**Response 200 (application/json)**: array of `ControlPlaneUserDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `email` | string | yes |  |
| `name` | string | yes |  |
| `provider` | string | yes |  |
| `status` | string | yes |  |
| `roles` | string[] | yes | Platform roles granted to the user directly — the ones the Roles editor can unassign. |
| `effectiveRoles` | ControlPlaneEffectiveRoleDto[] | yes | Every platform role the user holds, directly or through a group, each with where it comes from (KI-260): what decides their access, and what the last-admin guard counts. |
| `groups` | string[] | yes |  |
| `username` | string, nullable | no | The engine username, `null` until one is minted. Read-only: a delete retires it for good (username-takeover spec 2026-10-23 §4.4), so the delete dialog names it. |

| Status | Meaning |
|---|---|
| 200 | Platform users with their roles and groups |
| 401 | Not authenticated |
| 403 | Missing user:read permission |
| 500 | Internal error |

## POST `/api/control-plane/users`

Operation id: `create_user`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:create permission.

**Request body (application/json)**: `CreateUserInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | yes |  |
| `name` | string | yes |  |
| `password` | string | yes |  |

**Response 201 (application/json)**: `ControlPlaneUserDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `email` | string | yes |  |
| `name` | string | yes |  |
| `provider` | string | yes |  |
| `status` | string | yes |  |
| `roles` | string[] | yes | Platform roles granted to the user directly — the ones the Roles editor can unassign. |
| `effectiveRoles` | ControlPlaneEffectiveRoleDto[] | yes | Every platform role the user holds, directly or through a group, each with where it comes from (KI-260): what decides their access, and what the last-admin guard counts. |
| `groups` | string[] | yes |  |
| `username` | string, nullable | no | The engine username, `null` until one is minted. Read-only: a delete retires it for good (username-takeover spec 2026-10-23 §4.4), so the delete dialog names it. |

| Status | Meaning |
|---|---|
| 201 | Local user created |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Missing user:create permission |
| 409 | A user with this email already exists |
| 500 | Internal error |

## PATCH `/api/control-plane/users/{id}`

Operation id: `update_user`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:update (or user:disable) permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | User id |

**Request body (application/json)**: `UpdateUserInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string, nullable | no |  |
| `status` | string, nullable | no |  |

**Response 200 (application/json)**: `ControlPlaneUserDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `email` | string | yes |  |
| `name` | string | yes |  |
| `provider` | string | yes |  |
| `status` | string | yes |  |
| `roles` | string[] | yes | Platform roles granted to the user directly — the ones the Roles editor can unassign. |
| `effectiveRoles` | ControlPlaneEffectiveRoleDto[] | yes | Every platform role the user holds, directly or through a group, each with where it comes from (KI-260): what decides their access, and what the last-admin guard counts. |
| `groups` | string[] | yes |  |
| `username` | string, nullable | no | The engine username, `null` until one is minted. Read-only: a delete retires it for good (username-takeover spec 2026-10-23 §4.4), so the delete dialog names it. |

| Status | Meaning |
|---|---|
| 200 | User profile and/or status updated (disabling also revokes the user's live sessions immediately) |
| 400 | Invalid status value, or a caller disabling their own account |
| 401 | Not authenticated |
| 403 | Missing user:update (or user:disable) permission |
| 404 | No such user |
| 409 | Would remove the last active platform admin |
| 500 | Internal error |

## DELETE `/api/control-plane/users/{id}`

Operation id: `delete_user`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:delete permission.

`DELETE /users/\{id\}` — hard-delete a user (Task 4). Guards: not yourself, not the last active platform admin (the last-admin guard inside `UserRepo::hard_delete`, KI-284). Cleans up the user's sessions, group memberships, and platform role/permission grants, then removes the row itself, in one transaction (`UserRepo::hard_delete`).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | User id |

| Status | Meaning |
|---|---|
| 204 | User hard-deleted along with sessions, group memberships and grants. Their engine username is retired permanently: no user can be given it again, so refs and policies naming it match nobody. To revoke access but keep the username, set... |
| 400 | Caller attempted to delete their own account |
| 401 | Not authenticated |
| 403 | Missing user:delete permission |
| 404 | No such user |
| 409 | Would remove the last active platform admin |
| 500 | Internal error |

## POST `/api/control-plane/users/{id}/password`

Operation id: `reset_password`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing user:update permission.

`POST /users/\{id\}/password` — admin reset of a LOCAL user's password. Rehashes the new plaintext, then revokes the user's live sessions (mirrors the disable branch of `update_user`) so a session issued under the old password can't linger.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | User id |

**Request body (application/json)**: `ResetPasswordInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `password` | string | yes |  |

| Status | Meaning |
|---|---|
| 204 | Password reset; the user's live sessions are revoked |
| 400 | Empty password, or the target is not a local account |
| 401 | Not authenticated |
| 403 | Missing user:update permission |
| 404 | No such user |
| 500 | Internal error |

## POST `/api/control-plane/users/{id}/roles`

Operation id: `assign_user_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Requires platform_admin.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | User id |

**Request body (application/json)**: `AssignRoleInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `roleId` | string (uuid) | yes |  |

| Status | Meaning |
|---|---|
| 204 | Role assigned to the user |
| 401 | Not authenticated |
| 403 | Requires platform_admin |
| 404 | No such user or role |
| 500 | Internal error |

## DELETE `/api/control-plane/users/{id}/roles/{role_id}`

Operation id: `unassign_user_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Requires platform_admin.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | User id |
| `role_id` | path | string (uuid) | yes | Role id to unassign |

| Status | Meaning |
|---|---|
| 204 | Role unassigned from the user |
| 401 | Not authenticated |
| 403 | Requires platform_admin |
| 404 | No such role |
| 409 | Would remove the last active platform admin |
| 500 | Internal error |

