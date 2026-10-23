---
sidebar_position: 27
sidebar_label: Classification tags
description: REST endpoints in the control-plane-tags group.
---

# Classification tags API

Platform classification-tag catalog (Access P3.1) + access policies (P3.3).

This page lists 8 endpoints (OpenAPI tag `control-plane-tags`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| POST | `/api/control-plane/classifications/lineage-sweep` | `run_lineage_sweep` |  |
| GET | `/api/control-plane/classifications/{id}/view-exposure` | `get_view_exposure` |  |
| GET | `/api/control-plane/tags` | `list_tags` |  |
| POST | `/api/control-plane/tags` | `create_tag` |  |
| PATCH | `/api/control-plane/tags/{id}` | `update_tag` |  |
| DELETE | `/api/control-plane/tags/{id}` | `delete_tag` |  |
| PUT | `/api/control-plane/tags/{id}/access-policy` | `set_access_policy` |  |
| DELETE | `/api/control-plane/tags/{id}/access-policy` | `clear_access_policy` |  |

## POST `/api/control-plane/classifications/lineage-sweep`

Operation id: `run_lineage_sweep`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing tag:manage permission.

**Response 200 (application/json)**: `SweepReport`

| Field | Type | Required | Description |
|---|---|---|---|
| `views` | integer | yes | Views the sweep tried. |
| `computed` | integer | yes | Views whose lineage it computed. |
| `retagged` | integer | yes | Views whose lineage-derived tags it changed. |
| `failures` | SweepFailure[] | yes | Views (or listings) it could not judge. Their tags are unchanged. |

| Status | Meaning |
|---|---|
| 200 | The sweep ran. `failures` names every view (or listing) whose lineage could not be computed; those views keep their tags |
| 401 | Not authenticated |
| 403 | Missing tag:manage permission |
| 409 | A sweep is already running, or the embedded catalog is not enabled |
| 500 | Internal error |

## GET `/api/control-plane/classifications/{id}/view-exposure`

Operation id: `get_view_exposure`. Auth: Session cookie. Forbidden (403): Missing tag:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Classification (tag) id |

**Response 200 (application/json)**: `ViewExposureDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `starrocksMaterializedViews` | ViewExposureItem[], nullable | no | `null` when at least one listing failed; see `starrocks_list_error`. |
| `starrocksListError` | string, nullable | no | Set exactly when `starrocks_materialized_views` is `null`; names each failing engine. |
| `enginesNotChecked` | EngineNotChecked[] | yes | Engines that reach the classification but were not asked (external, or not running). Their views are unknown, not absent. |
| `trinoViews` | TrinoViewItem[], nullable | no | The views in egret's catalogs that the DEFINER audit lists (spec B5): their lineage reaches a table of this classification, or a table a mask or row-filter rule selects, or is unknown. `null` when egret's catalogs could not all be listed;... |
| `trinoListError` | string, nullable | no | Set exactly when `trino_views` is `null`; names what could not be listed. |

| Status | Meaning |
|---|---|
| 200 | The materialized views that already exist and read a table of this classification |
| 401 | Not authenticated |
| 403 | Missing tag:read permission |
| 404 | No such classification |
| 500 | Internal error |

## GET `/api/control-plane/tags`

Operation id: `list_tags`. Auth: Session cookie. Forbidden (403): Missing tag:read permission.

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
| 200 | The platform tag catalog, each with its live assignment count |
| 401 | Not authenticated |
| 403 | Missing tag:read permission |
| 500 | Internal error |

## POST `/api/control-plane/tags`

Operation id: `create_tag`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing tag:manage permission.

**Request body (application/json)**: `CreateTag`

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | string | yes |  |
| `name` | string | yes |  |
| `description` | string, nullable | no |  |
| `color` | string, nullable | no |  |

**Response 201 (application/json)**: `TagDto`

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
| 201 | Tag created |
| 400 | Invalid tag key: `code` is `tag_key_invalid` |
| 401 | Not authenticated |
| 403 | Missing tag:manage permission |
| 409 | `code` is `tag_key_taken` (the key exists) or `tag_name_taken` (another classification has that name, ignoring case); `existing` names the holder |
| 500 | Internal error |

## PATCH `/api/control-plane/tags/{id}`

Operation id: `update_tag`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing tag:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Tag id |

**Request body (application/json)**: `UpdateTag`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string, nullable | no |  |
| `description` | string, nullable | no |  |
| `color` | string, nullable | no |  |

**Response 200 (application/json)**: `TagDto`

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
| 200 | Tag updated |
| 400 | The new name is masked by a tag masking policy while this tag is attached to a whole TABLE (which would make that table unreadable rather than masked) |
| 401 | Not authenticated |
| 403 | Missing tag:manage permission |
| 404 | No such tag |
| 409 | `code` is `tag_name_taken`: another classification has that name, ignoring case; `existing` names the holder |
| 500 | Internal error |

## DELETE `/api/control-plane/tags/{id}`

Operation id: `delete_tag`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing tag:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Tag id |

| Status | Meaning |
|---|---|
| 204 | Tag deleted |
| 401 | Not authenticated |
| 403 | Missing tag:manage permission |
| 409 | `code` is `tag_in_use`: `rules` lists the rules that still select this classification |
| 500 | Internal error |

## PUT `/api/control-plane/tags/{id}/access-policy`

Operation id: `set_access_policy`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing tag:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Tag id |

**Request body (application/json)**: `SetAccessPolicy`

| Field | Type | Required | Description |
|---|---|---|---|
| `required_roles` | string[] | no | Clearance role NAMES; a principal needs `>= 1` to access objects carrying this tag. Cleared = `>= 1` role OR `>= 1` group; both empty = no gate. |
| `required_groups` | string[] | no | Clearance GROUP ids (as strings; Access P3.4). Each is parsed as a `Uuid` before hitting the repo — a non-uuid entry is rejected `400 BadRequest` (never spliced unvalidated into a Cedar policy string). |

**Response 200 (application/json)**: `AccessPolicyWritten`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes | Always `true` — the write committed, or this response was never built. |
| `skipped` | SkipReport[] | yes | Every profile/item the accompanying recompile could not express. |

| Status | Meaning |
|---|---|
| 200 | Classification access policy set |
| 401 | Not authenticated |
| 403 | Missing tag:manage permission |
| 500 | Internal error |

## DELETE `/api/control-plane/tags/{id}/access-policy`

Operation id: `clear_access_policy`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing tag:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Tag id |

**Response 200 (application/json)**: `AccessPolicyWritten`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes | Always `true` — the write committed, or this response was never built. |
| `skipped` | SkipReport[] | yes | Every profile/item the accompanying recompile could not express. |

| Status | Meaning |
|---|---|
| 200 | Classification access policy cleared |
| 401 | Not authenticated |
| 403 | Missing tag:manage permission |
| 500 | Internal error |

