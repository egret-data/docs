---
sidebar_position: 5
sidebar_label: Current user
description: REST endpoints in the me group.
---

# Current user API

The caller's own workspaces.

This page lists 1 endpoint (OpenAPI tag `me`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/me/workspaces` | `list_my_workspaces` |  |

## GET `/api/me/workspaces`

Operation id: `list_my_workspaces`. Auth: Session cookie.

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
| `permissions` | string[], nullable | no | The caller's own permissions in this workspace among [`PAGE_PERMISSIONS`]: the ones that decide whether a whole Explore page opens. Only `/api/me/workspaces` fills it, from the same PDP decision the page's routes ask, so the UI can leave... |

| Status | Meaning |
|---|---|
| 200 | Workspaces the caller can see (all, if platform admin) |
| 401 | Not authenticated |
| 500 | Internal error |

