---
sidebar_position: 9
sidebar_label: Access requests
description: REST endpoints in the access-requests group.
---

# Access requests API

Workspace join requests (requester side).

This page lists 4 endpoints (OpenAPI tag `access-requests`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| POST | `/api/access-requests` | `create_access_request` |  |
| GET | `/api/access-requests/joinable` | `list_joinable` |  |
| GET | `/api/access-requests/mine` | `list_my_access_requests` |  |
| POST | `/api/access-requests/{id}/cancel` | `cancel_access_request` |  |

## POST `/api/access-requests`

Operation id: `create_access_request`. Auth: Session cookie and `X-Egret-CSRF` header.

**Request body (application/json)**: `CreateAccessRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `workspace_id` | string (uuid) | yes |  |
| `role` | string, nullable | no |  |
| `reason` | string, nullable | no |  |

**Response 201 (application/json)**: `AccessRequestDto`

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
| 201 | Join request filed |
| 400 | Already a member or workspace not joinable |
| 401 | Not authenticated |
| 409 | A pending request for this workspace already exists |
| 500 | Internal error |

## GET `/api/access-requests/joinable`

Operation id: `list_joinable`. Auth: Session cookie.

**Response 200 (application/json)**: array of `JoinableWorkspaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `slug` | string | yes |  |
| `name` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Active workspaces the caller may request to join |
| 401 | Not authenticated |
| 500 | Internal error |

## GET `/api/access-requests/mine`

Operation id: `list_my_access_requests`. Auth: Session cookie.

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
| 200 | The caller's own join requests, newest first |
| 401 | Not authenticated |
| 500 | Internal error |

## POST `/api/access-requests/{id}/cancel`

Operation id: `cancel_access_request`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Access-request id |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Request cancelled |
| 401 | Not authenticated |
| 404 | No pending request to cancel for this user |
| 500 | Internal error |

