---
sidebar_position: 19
sidebar_label: Data Apps
description: REST endpoints in the apps group.
---

# Data Apps API

Per-workspace data apps: CRUD, folders, trash, bookmarks, revisioned drafts, publish, versions.

This page lists 19 endpoints (OpenAPI tag `apps`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/apps` | `list` |  |
| POST | `/api/ws/{workspace}/apps` | `create` |  |
| GET | `/api/ws/{workspace}/apps/capabilities` | `capabilities` |  |
| GET | `/api/ws/{workspace}/apps/{id}` | `get_one` |  |
| PATCH | `/api/ws/{workspace}/apps/{id}` | `update` |  |
| DELETE | `/api/ws/{workspace}/apps/{id}` | `delete_app` |  |
| POST | `/api/ws/{workspace}/apps/{id}/bookmark` | `bookmark_add` |  |
| DELETE | `/api/ws/{workspace}/apps/{id}/bookmark` | `bookmark_remove` |  |
| GET | `/api/ws/{workspace}/apps/{id}/draft` | `draft_get` |  |
| PUT | `/api/ws/{workspace}/apps/{id}/draft` | `draft_put` |  |
| POST | `/api/ws/{workspace}/apps/{id}/duplicate` | `duplicate` |  |
| PATCH | `/api/ws/{workspace}/apps/{id}/folder` | `set_folder` |  |
| POST | `/api/ws/{workspace}/apps/{id}/publish` | `publish` |  |
| POST | `/api/ws/{workspace}/apps/{id}/restore` | `restore` |  |
| POST | `/api/ws/{workspace}/apps/{id}/ticket` | `ticket` |  |
| POST | `/api/ws/{workspace}/apps/{id}/trash` | `trash` |  |
| GET | `/api/ws/{workspace}/apps/{id}/versions` | `versions` |  |
| GET | `/api/ws/{workspace}/apps/{id}/versions/{version_id}` | `version_get` |  |
| POST | `/api/ws/{workspace}/apps/{id}/versions/{version_id}/restore` | `version_restore` |  |

## GET `/api/ws/{workspace}/apps`

Operation id: `list`. Auth: Session cookie. Forbidden (403): Missing app:read, or the apps feature is disabled.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `trashed` | query | boolean | no | List the trash bin instead of live apps when true |

**Response 200 (application/json)**: array of `AppSummary`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `owner_user_id` | string (uuid), nullable | no |  |
| `is_owner` | boolean | yes | The caller created this app (metadata only; access is role/share based). |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no | Set while the app is in the trash. |
| `bookmarked` | boolean | yes | Bookmarked by the caller. |
| `draft_revision` | integer (int64) | yes |  |
| `latest_version_no` | integer (int32), nullable | no | `None` until the first publish. |
| `can_write` | boolean | yes | The caller holds `app:write` on THIS app (per object: a share on one app makes it true on that row only). |
| `can_manage` | boolean | yes | The caller holds `app:manage` on THIS app (sharing, permanent delete). |

| Status | Meaning |
|---|---|
| 200 | Apps in the workspace, most recently updated first |
| 401 | Not authenticated |
| 403 | Missing app:read, or the apps feature is disabled |
| 500 | Internal error |

## POST `/api/ws/{workspace}/apps`

Operation id: `create`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:write, or the apps feature is disabled.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `AppCreate`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `description` | string, nullable | no |  |
| `folder_id` | string (uuid), nullable | no | An `app` folder of this workspace. |
| `database` | string, nullable | no | A database (by name) of this workspace; the template's connection cell is pre-filled with it. |

**Response 201 (application/json)**: `AppDetail`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `owner_user_id` | string (uuid), nullable | no |  |
| `is_owner` | boolean | yes |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `draft_revision` | integer (int64) | yes |  |
| `latest_version_no` | integer (int32), nullable | no |  |
| `can_write` | boolean | yes | The caller holds `app:write` on THIS app (per object: a share on one app makes it true on that row only). |
| `can_manage` | boolean | yes | The caller holds `app:manage` on THIS app (sharing, permanent delete). |

| Status | Meaning |
|---|---|
| 201 | App created with a revision-1 draft from the template |
| 400 | Empty name |
| 401 | Not authenticated |
| 403 | Missing app:write, or the apps feature is disabled |
| 404 | The folder or database is not in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/apps/capabilities`

Operation id: `capabilities`. Auth: Session cookie. Forbidden (403): Missing app:read, or the apps feature is disabled.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: `AppCapabilities`

| Field | Type | Required | Description |
|---|---|---|---|
| `can_create` | boolean | yes | The caller holds `app:write` in the workspace: `POST /apps` will not be refused for lack of permission. |

| Status | Meaning |
|---|---|
| 200 | What the caller may do with apps in this workspace |
| 401 | Not authenticated |
| 403 | Missing app:read, or the apps feature is disabled |
| 500 | Internal error |

## GET `/api/ws/{workspace}/apps/{id}`

Operation id: `get_one`. Auth: Session cookie. Forbidden (403): Missing app:read on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `AppDetail`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `owner_user_id` | string (uuid), nullable | no |  |
| `is_owner` | boolean | yes |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `draft_revision` | integer (int64) | yes |  |
| `latest_version_no` | integer (int32), nullable | no |  |
| `can_write` | boolean | yes | The caller holds `app:write` on THIS app (per object: a share on one app makes it true on that row only). |
| `can_manage` | boolean | yes | The caller holds `app:manage` on THIS app (sharing, permanent delete). |

| Status | Meaning |
|---|---|
| 200 | The app (also when trashed; see deleted_at) |
| 401 | Not authenticated |
| 403 | Missing app:read on this app |
| 404 | No such app in this workspace |
| 500 | Internal error |

## PATCH `/api/ws/{workspace}/apps/{id}`

Operation id: `update`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:write on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `AppUpdate`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string, nullable | no |  |
| `description` | string, nullable | no |  |

**Response 200 (application/json)**: `AppDetail`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `owner_user_id` | string (uuid), nullable | no |  |
| `is_owner` | boolean | yes |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `draft_revision` | integer (int64) | yes |  |
| `latest_version_no` | integer (int32), nullable | no |  |
| `can_write` | boolean | yes | The caller holds `app:write` on THIS app (per object: a share on one app makes it true on that row only). |
| `can_manage` | boolean | yes | The caller holds `app:manage` on THIS app (sharing, permanent delete). |

| Status | Meaning |
|---|---|
| 200 | App renamed / re-described |
| 400 | Empty name |
| 401 | Not authenticated |
| 403 | Missing app:write on this app |
| 404 | No such app in this workspace |
| 409 | The app is in the trash |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/apps/{id}`

Operation id: `delete_app`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:manage on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

| Status | Meaning |
|---|---|
| 204 | The app is permanently deleted, with its draft, versions, shares and every user's bookmark of it. Irreversible |
| 401 | Not authenticated |
| 403 | Missing app:manage on this app |
| 404 | No such app in this workspace |
| 409 | The app is not in the trash; move it to Trash first |
| 500 | Internal error |

## POST `/api/ws/{workspace}/apps/{id}/bookmark`

Operation id: `bookmark_add`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:read on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

| Status | Meaning |
|---|---|
| 204 | App bookmarked for the caller |
| 401 | Not authenticated |
| 403 | Missing app:read on this app |
| 404 | No such app in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/apps/{id}/bookmark`

Operation id: `bookmark_remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:read on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

| Status | Meaning |
|---|---|
| 204 | The caller's bookmark removed |
| 401 | Not authenticated |
| 403 | Missing app:read on this app |
| 404 | No such app in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/apps/{id}/draft`

Operation id: `draft_get`. Auth: Session cookie. Forbidden (403): Missing app:write on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `AppDraft`

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | string | yes |  |
| `layout` | object | no | marimo's grid-layout companion file, verbatim JSON; omitted for the default vertical arrangement. |
| `revision` | integer (int64) | yes |  |

| Status | Meaning |
|---|---|
| 200 | The draft; `ETag` is its quoted revision |
| 401 | Not authenticated |
| 403 | Missing app:write on this app |
| 404 | No such app in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/apps/{id}/draft`

Operation id: `draft_put`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:write on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `If-Match` | header | string | yes | The revision the edit is based on, quoted or bare |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `AppSaveDraft`

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | string | yes | marimo source, at most 1 MiB (1 048 576 bytes). |
| `layout` | object | no | The complete new layout state; omit or send `null` to clear it. |

**Response 200 (application/json)**: `AppDraftSaved`

| Field | Type | Required | Description |
|---|---|---|---|
| `revision` | integer (int64) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Saved; `ETag` is the new quoted revision |
| 400 | If-Match is not a revision |
| 401 | Not authenticated |
| 403 | Missing app:write on this app |
| 404 | No such app in this workspace |
| 409 | Stale revision (reload current_revision), or the app is in the trash |
| 413 | Source exceeds 1 MiB |
| 428 | If-Match is missing |
| 500 | Internal error |

## POST `/api/ws/{workspace}/apps/{id}/duplicate`

Operation id: `duplicate`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:write on this app, or app:write in the workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App to copy |
| `workspace` | path | string | yes |  |

**Response 201 (application/json)**: `AppDetail`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `owner_user_id` | string (uuid), nullable | no |  |
| `is_owner` | boolean | yes |  |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `draft_revision` | integer (int64) | yes |  |
| `latest_version_no` | integer (int32), nullable | no |  |
| `can_write` | boolean | yes | The caller holds `app:write` on THIS app (per object: a share on one app makes it true on that row only). |
| `can_manage` | boolean | yes | The caller holds `app:manage` on THIS app (sharing, permanent delete). |

| Status | Meaning |
|---|---|
| 201 | A new app named `Copy of &lt;name>`, owned by the caller, in the source's folder, whose revision-1 draft is the source's current draft (source and layout). Versions, shares and bookmarks are not copied |
| 401 | Not authenticated |
| 403 | Missing app:write on this app, or app:write in the workspace |
| 404 | No such app in this workspace |
| 409 | The app is in the trash |
| 500 | Internal error |

## PATCH `/api/ws/{workspace}/apps/{id}/folder`

Operation id: `set_folder`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:write on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `AppSetFolder`

| Field | Type | Required | Description |
|---|---|---|---|
| `folder_id` | string (uuid), nullable | no |  |

| Status | Meaning |
|---|---|
| 204 | App moved to the folder (or back to Uncategorized) |
| 401 | Not authenticated |
| 403 | Missing app:write on this app |
| 404 | No such app, or the folder is not an app folder of this workspace |
| 409 | The app is in the trash |
| 500 | Internal error |

## POST `/api/ws/{workspace}/apps/{id}/publish`

Operation id: `publish`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:write on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `AppPublish`, one of `null`, `AppPublish`.

**Response 201 (application/json)**: `AppVersionSummary`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `version_no` | integer (int32) | yes |  |
| `from_revision` | integer (int64), nullable | no | The draft revision this version was published from; `None` for a restore. |
| `restored_from` | string (uuid), nullable | no | The version this one republished; `None` for a publish. |
| `published_by` | string (uuid), nullable | no |  |
| `published_by_name` | string, nullable | no | The publisher's display name: the profile name, else the email. Null when `published_by` is null or the user no longer exists. |
| `published_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 201 | The draft published as a new version |
| 400 | The body is not an AppPublish |
| 401 | Not authenticated |
| 403 | Missing app:write on this app |
| 404 | No such app in this workspace |
| 409 | expected_revision is stale (reload current_revision), the draft is still the new-app starter (code `starter_draft`), or the app is in the trash |
| 500 | Internal error |

## POST `/api/ws/{workspace}/apps/{id}/restore`

Operation id: `restore`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:write on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

| Status | Meaning |
|---|---|
| 204 | App restored from the trash |
| 401 | Not authenticated |
| 403 | Missing app:write on this app |
| 404 | No such app in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/apps/{id}/ticket`

Operation id: `ticket`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:read (run) or app:write + query:run (edit).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `AppTicketRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `mode` | AppTicketMode | yes |  |
| `version_id` | string (uuid), nullable | no | Run mode only: the version to open. Omitted = the latest published version. |

**Response 200 (application/json)**: `AppTicket`

| Field | Type | Required | Description |
|---|---|---|---|
| `url` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | A one-time URL for the apps-origin iframe |
| 400 | An edit ticket cannot name a version |
| 401 | Not authenticated |
| 403 | Missing app:read (run) or app:write + query:run (edit) |
| 404 | No such app or version in this workspace |
| 409 | The app is in the trash, or (run) has no published version |
| 500 | Internal error |
| 503 | The apps origin is not configured |

## POST `/api/ws/{workspace}/apps/{id}/trash`

Operation id: `trash`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:write on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

| Status | Meaning |
|---|---|
| 204 | App moved to the trash |
| 401 | Not authenticated |
| 403 | Missing app:write on this app |
| 404 | No such app in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/apps/{id}/versions`

Operation id: `versions`. Auth: Session cookie. Forbidden (403): Missing app:write on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `AppVersionSummary`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `version_no` | integer (int32) | yes |  |
| `from_revision` | integer (int64), nullable | no | The draft revision this version was published from; `None` for a restore. |
| `restored_from` | string (uuid), nullable | no | The version this one republished; `None` for a publish. |
| `published_by` | string (uuid), nullable | no |  |
| `published_by_name` | string, nullable | no | The publisher's display name: the profile name, else the email. Null when `published_by` is null or the user no longer exists. |
| `published_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Published versions, newest first |
| 401 | Not authenticated |
| 403 | Missing app:write on this app |
| 404 | No such app in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/apps/{id}/versions/{version_id}`

Operation id: `version_get`. Auth: Session cookie. Forbidden (403): Missing app:write on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `version_id` | path | string (uuid) | yes | Version id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `AppVersion`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `version_no` | integer (int32) | yes |  |
| `from_revision` | integer (int64), nullable | no | The draft revision this version was published from; `None` for a restore. |
| `restored_from` | string (uuid), nullable | no | The version this one republished; `None` for a publish. |
| `published_by` | string (uuid), nullable | no |  |
| `published_by_name` | string, nullable | no | The publisher's display name: the profile name, else the email. Null when `published_by` is null or the user no longer exists. |
| `published_at` | string (date-time) | yes |  |
| `source` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | The version with its source |
| 401 | Not authenticated |
| 403 | Missing app:write on this app |
| 404 | No such app in this workspace, or no such version of it |
| 500 | Internal error |

## POST `/api/ws/{workspace}/apps/{id}/versions/{version_id}/restore`

Operation id: `version_restore`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing app:write on this app.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | App id |
| `version_id` | path | string (uuid) | yes | Version to republish |
| `workspace` | path | string | yes |  |

**Response 201 (application/json)**: `AppVersionSummary`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `version_no` | integer (int32) | yes |  |
| `from_revision` | integer (int64), nullable | no | The draft revision this version was published from; `None` for a restore. |
| `restored_from` | string (uuid), nullable | no | The version this one republished; `None` for a publish. |
| `published_by` | string (uuid), nullable | no |  |
| `published_by_name` | string, nullable | no | The publisher's display name: the profile name, else the email. Null when `published_by` is null or the user no longer exists. |
| `published_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 201 | The version's source republished as a new version; the draft is untouched |
| 401 | Not authenticated |
| 403 | Missing app:write on this app |
| 404 | No such app in this workspace, or no such version of it |
| 409 | The app is in the trash |
| 500 | Internal error |

