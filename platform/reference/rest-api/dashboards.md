---
sidebar_position: 16
sidebar_label: Dashboards
description: REST endpoints in the dashboards group.
---

# Dashboards API

BI dashboards: CRUD, layout (tabs + cards), folders, trash + bookmarks.

This page lists 15 endpoints (OpenAPI tag `dashboards`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/dashboards` | `db_list` |  |
| POST | `/api/ws/{workspace}/dashboards` | `db_create` |  |
| GET | `/api/ws/{workspace}/dashboards/{id}` | `db_get` |  |
| PUT | `/api/ws/{workspace}/dashboards/{id}` | `db_update` |  |
| DELETE | `/api/ws/{workspace}/dashboards/{id}` | `db_remove` |  |
| POST | `/api/ws/{workspace}/dashboards/{id}/bookmark` | `db_bookmark_add` |  |
| DELETE | `/api/ws/{workspace}/dashboards/{id}/bookmark` | `db_bookmark_remove` |  |
| POST | `/api/ws/{workspace}/dashboards/{id}/cards/{card_id}/data` | `db_card_run` | Object-scoped on the DASHBOARD: a `dashboard:read` object grant TRANSITIVELY authorizes running the data of any card on that dashboard — NO per-chart grant i... |
| PUT | `/api/ws/{workspace}/dashboards/{id}/certification` | `db_set_certification` |  |
| POST | `/api/ws/{workspace}/dashboards/{id}/duplicate` | `db_duplicate` |  |
| PATCH | `/api/ws/{workspace}/dashboards/{id}/folder` | `db_set_folder` |  |
| POST | `/api/ws/{workspace}/dashboards/{id}/restore` | `db_restore` |  |
| GET | `/api/ws/{workspace}/dashboards/{id}/revisions` | `db_revisions` | Reading history needs only `dashboard:read` — it discloses who edited the dashboard and when, which anyone who can read the dashboard can already see in the ... |
| POST | `/api/ws/{workspace}/dashboards/{id}/revisions/{revision_id}/revert` | `db_revision_revert` | Restore an earlier revision by replaying it through the ordinary update path. |
| POST | `/api/ws/{workspace}/dashboards/{id}/trash` | `db_trash` |  |

## GET `/api/ws/{workspace}/dashboards`

Operation id: `db_list`. Auth: Session cookie. Forbidden (403): Missing dashboard:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `trashed` | query | boolean | no | List only trashed dashboards when true |

**Response 200 (application/json)**: array of `DashboardSummaryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `created_by` | string, nullable | no |  |
| `folder_id` | string, nullable | no |  |
| `card_count` | integer (int64) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `bookmarked` | boolean | yes |  |
| `certified` | boolean | yes | A steward has vouched for this dashboard. Display only — the list carries no `certified_by`, since the badge here answers "is it trusted", and "by whom" is a question the detail page already answers. |
| `can_manage` | boolean | yes | Whether this caller may run the list's mutating actions — duplicate, move, trash, delete. |

| Status | Meaning |
|---|---|
| 200 | Dashboards in the workspace |
| 401 | Not authenticated |
| 403 | Missing dashboard:read permission |
| 500 | Internal error |

## POST `/api/ws/{workspace}/dashboards`

Operation id: `db_create`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `CreateDashboard`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `description` | string | no |  |

**Response 200 (application/json)**: `DashboardDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `parameters` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `created_by_name` | string, nullable | no | Display name for `created_by` — the profile name, else the email. Resolved server-side: the endpoints that can turn a user id into a name are admin-gated, so the browser cannot do it for an ordinary workspace editor. Same shape and same... |
| `created_at` | string (date-time), nullable | no | NULL for dashboards predating migration 0106, which does not invent a creation date. |
| `updated_by` | string, nullable | no |  |
| `updated_by_name` | string, nullable | no | Display name for `updated_by`, resolved the same way as `created_by_name`. |
| `updated_at` | string (date-time) | yes |  |
| `folder_id` | string, nullable | no | The folder this dashboard is filed under; NULL = Uncategorized. Present on `DashboardSummaryDto` since folders shipped, and absent here until now, which is why the info sidebar had no folder to name. |
| `width` | string | yes |  |
| `certified` | boolean | yes | Marked as trusted by a steward. Same three fields datasets and metrics have carried since 0098, so "is this certified" is one question across the product rather than three. |
| `certified_by` | string | yes | Who certified it, as their email — the string is read by whoever sees the badge, and a uuid would tell them nothing. Empty while `certified` is false. |
| `certification_details` | string | yes | Why, in the certifier's words. Empty is allowed: a certification with no note is still a certification. |
| `can_manage` | boolean | yes | May the CALLER edit this dashboard? Workspace-scoped `dashboard:manage`, answered by the PDP — the session's permission list carries platform grants only and can never contain it. |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `tabs` | DashboardTabDto[] | yes |  |
| `cards` | DashboardCardDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard created (empty layout) |
| 401 | Not authenticated |
| 403 | Missing dashboard:manage permission |
| 500 | Internal error |

## GET `/api/ws/{workspace}/dashboards/{id}`

Operation id: `db_get`. Auth: Session cookie. Forbidden (403): Missing dashboard:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DashboardDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `parameters` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `created_by_name` | string, nullable | no | Display name for `created_by` — the profile name, else the email. Resolved server-side: the endpoints that can turn a user id into a name are admin-gated, so the browser cannot do it for an ordinary workspace editor. Same shape and same... |
| `created_at` | string (date-time), nullable | no | NULL for dashboards predating migration 0106, which does not invent a creation date. |
| `updated_by` | string, nullable | no |  |
| `updated_by_name` | string, nullable | no | Display name for `updated_by`, resolved the same way as `created_by_name`. |
| `updated_at` | string (date-time) | yes |  |
| `folder_id` | string, nullable | no | The folder this dashboard is filed under; NULL = Uncategorized. Present on `DashboardSummaryDto` since folders shipped, and absent here until now, which is why the info sidebar had no folder to name. |
| `width` | string | yes |  |
| `certified` | boolean | yes | Marked as trusted by a steward. Same three fields datasets and metrics have carried since 0098, so "is this certified" is one question across the product rather than three. |
| `certified_by` | string | yes | Who certified it, as their email — the string is read by whoever sees the badge, and a uuid would tell them nothing. Empty while `certified` is false. |
| `certification_details` | string | yes | Why, in the certifier's words. Empty is allowed: a certification with no note is still a certification. |
| `can_manage` | boolean | yes | May the CALLER edit this dashboard? Workspace-scoped `dashboard:manage`, answered by the PDP — the session's permission list carries platform grants only and can never contain it. |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `tabs` | DashboardTabDto[] | yes |  |
| `cards` | DashboardCardDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard detail (tabs + cards) |
| 401 | Not authenticated |
| 403 | Missing dashboard:read permission |
| 404 | No such dashboard in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/dashboards/{id}`

Operation id: `db_update`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `UpdateDashboard`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `description` | string | no |  |
| `parameters` | object | no |  |
| `width` | string | no |  |
| `tabs` | NewTabInput[] | no |  |
| `cards` | CardInput[] | no |  |

**Response 200 (application/json)**: `DashboardDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `parameters` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `created_by_name` | string, nullable | no | Display name for `created_by` — the profile name, else the email. Resolved server-side: the endpoints that can turn a user id into a name are admin-gated, so the browser cannot do it for an ordinary workspace editor. Same shape and same... |
| `created_at` | string (date-time), nullable | no | NULL for dashboards predating migration 0106, which does not invent a creation date. |
| `updated_by` | string, nullable | no |  |
| `updated_by_name` | string, nullable | no | Display name for `updated_by`, resolved the same way as `created_by_name`. |
| `updated_at` | string (date-time) | yes |  |
| `folder_id` | string, nullable | no | The folder this dashboard is filed under; NULL = Uncategorized. Present on `DashboardSummaryDto` since folders shipped, and absent here until now, which is why the info sidebar had no folder to name. |
| `width` | string | yes |  |
| `certified` | boolean | yes | Marked as trusted by a steward. Same three fields datasets and metrics have carried since 0098, so "is this certified" is one question across the product rather than three. |
| `certified_by` | string | yes | Who certified it, as their email — the string is read by whoever sees the badge, and a uuid would tell them nothing. Empty while `certified` is false. |
| `certification_details` | string | yes | Why, in the certifier's words. Empty is allowed: a certification with no note is still a certification. |
| `can_manage` | boolean | yes | May the CALLER edit this dashboard? Workspace-scoped `dashboard:manage`, answered by the PDP — the session's permission list carries platform grants only and can never contain it. |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `tabs` | DashboardTabDto[] | yes |  |
| `cards` | DashboardCardDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard metadata + layout replaced |
| 400 | Invalid layout (tab/card mismatch) or width not 'fixed'/'full' |
| 401 | Not authenticated |
| 403 | Missing dashboard:manage permission |
| 404 | No such dashboard, or a referenced chart not in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/dashboards/{id}`

Operation id: `db_remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard deleted |
| 401 | Not authenticated |
| 403 | Missing dashboard:manage permission |
| 404 | No such dashboard in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/dashboards/{id}/bookmark`

Operation id: `db_bookmark_add`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard bookmarked for the caller |
| 401 | Not authenticated |
| 403 | Missing dashboard:read permission |
| 404 | No such dashboard in this workspace |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/dashboards/{id}/bookmark`

Operation id: `db_bookmark_remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard bookmark removed for the caller |
| 401 | Not authenticated |
| 403 | Missing dashboard:read permission |
| 404 | No such dashboard in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/dashboards/{id}/cards/{card_id}/data`

Operation id: `db_card_run`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): No dashboard:read grant on this dashboard.

Object-scoped on the DASHBOARD: a `dashboard:read` object grant TRANSITIVELY authorizes running the data of any card on that dashboard — NO per-chart grant is needed. The card must belong to the path dashboard (else 404). Runs the card chart's persisted query, optionally merged with resolved dashboard-parameter filters from the request body, so a shared viewer can view the card's (filtered) data without any `query:run` permission.

The body is OPTIONAL (a body-less call runs the saved query unfiltered). Incoming filters are appended to the persisted `spec.filters` and validated by `compile_chart_sql` → `chartquery::build`, which resolves every filter `col` against the dataset's real columns (an unknown column → 400) and renders the values/operators through the injection-safe `sql_literal`/`FilterOp` path. The client cannot inject a predicate on an arbitrary column.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `card_id` | path | string (uuid) | yes | Card id (must belong to the dashboard) |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `CardRunBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `filters` | Filter[] | no | Resolved, dashboard-param-derived filters to AND onto the card's saved query. |
| `temporal_units` | object | no | Resolved `temporal_unit` dashboard-param overrides: dimension column name -> temporal unit token (e.g. "month"). Each token is validated against the `TemporalUnit` enum by `chartquery::build` (an unknown token → 400) and rendered as an... |

**Response 200 (application/json)**: `ChartRunResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `columns` | ColumnMeta[] | yes |  |
| `rows` | object[][] | yes | Row-major cell values; each inner vec is one row aligned to `columns`. |

| Status | Meaning |
|---|---|
| 200 | The card's chart SAVED query (with dashboard filters), executed: columns + rows |
| 400 | Card has no chart, its saved spec is invalid, or a filter references an unknown column |
| 401 | Not authenticated |
| 403 | No dashboard:read grant on this dashboard |
| 404 | No such dashboard, or the card is not on this dashboard |
| 500 | Internal error |
| 502 | Query engine error |

## PUT `/api/ws/{workspace}/dashboards/{id}/certification`

Operation id: `db_set_certification`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:certify permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetDashboardCertification`

| Field | Type | Required | Description |
|---|---|---|---|
| `certified` | boolean | yes |  |
| `details` | string | no | Free text explaining the certification. Ignored when `certified` is false — withdrawing clears the note rather than leaving a stale justification attached. |

**Response 200 (application/json)**: `DashboardDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `parameters` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `created_by_name` | string, nullable | no | Display name for `created_by` — the profile name, else the email. Resolved server-side: the endpoints that can turn a user id into a name are admin-gated, so the browser cannot do it for an ordinary workspace editor. Same shape and same... |
| `created_at` | string (date-time), nullable | no | NULL for dashboards predating migration 0106, which does not invent a creation date. |
| `updated_by` | string, nullable | no |  |
| `updated_by_name` | string, nullable | no | Display name for `updated_by`, resolved the same way as `created_by_name`. |
| `updated_at` | string (date-time) | yes |  |
| `folder_id` | string, nullable | no | The folder this dashboard is filed under; NULL = Uncategorized. Present on `DashboardSummaryDto` since folders shipped, and absent here until now, which is why the info sidebar had no folder to name. |
| `width` | string | yes |  |
| `certified` | boolean | yes | Marked as trusted by a steward. Same three fields datasets and metrics have carried since 0098, so "is this certified" is one question across the product rather than three. |
| `certified_by` | string | yes | Who certified it, as their email — the string is read by whoever sees the badge, and a uuid would tell them nothing. Empty while `certified` is false. |
| `certification_details` | string | yes | Why, in the certifier's words. Empty is allowed: a certification with no note is still a certification. |
| `can_manage` | boolean | yes | May the CALLER edit this dashboard? Workspace-scoped `dashboard:manage`, answered by the PDP — the session's permission list carries platform grants only and can never contain it. |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `tabs` | DashboardTabDto[] | yes |  |
| `cards` | DashboardCardDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Updated dashboard |
| 401 | Not authenticated |
| 403 | Missing dashboard:certify permission |
| 404 | No such dashboard in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/dashboards/{id}/duplicate`

Operation id: `db_duplicate`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id to duplicate |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DashboardDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `parameters` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `created_by_name` | string, nullable | no | Display name for `created_by` — the profile name, else the email. Resolved server-side: the endpoints that can turn a user id into a name are admin-gated, so the browser cannot do it for an ordinary workspace editor. Same shape and same... |
| `created_at` | string (date-time), nullable | no | NULL for dashboards predating migration 0106, which does not invent a creation date. |
| `updated_by` | string, nullable | no |  |
| `updated_by_name` | string, nullable | no | Display name for `updated_by`, resolved the same way as `created_by_name`. |
| `updated_at` | string (date-time) | yes |  |
| `folder_id` | string, nullable | no | The folder this dashboard is filed under; NULL = Uncategorized. Present on `DashboardSummaryDto` since folders shipped, and absent here until now, which is why the info sidebar had no folder to name. |
| `width` | string | yes |  |
| `certified` | boolean | yes | Marked as trusted by a steward. Same three fields datasets and metrics have carried since 0098, so "is this certified" is one question across the product rather than three. |
| `certified_by` | string | yes | Who certified it, as their email — the string is read by whoever sees the badge, and a uuid would tell them nothing. Empty while `certified` is false. |
| `certification_details` | string | yes | Why, in the certifier's words. Empty is allowed: a certification with no note is still a certification. |
| `can_manage` | boolean | yes | May the CALLER edit this dashboard? Workspace-scoped `dashboard:manage`, answered by the PDP — the session's permission list carries platform grants only and can never contain it. |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `tabs` | DashboardTabDto[] | yes |  |
| `cards` | DashboardCardDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard duplicated (layout copied) |
| 401 | Not authenticated |
| 403 | Missing dashboard:manage permission |
| 404 | No such dashboard in this workspace |
| 500 | Internal error |

## PATCH `/api/ws/{workspace}/dashboards/{id}/folder`

Operation id: `db_set_folder`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetFolder`

| Field | Type | Required | Description |
|---|---|---|---|
| `folder_id` | string (uuid), nullable | no |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard moved to folder |
| 401 | Not authenticated |
| 403 | Missing dashboard:manage permission |
| 404 | No such dashboard or target folder in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/dashboards/{id}/restore`

Operation id: `db_restore`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard restored from trash |
| 401 | Not authenticated |
| 403 | Missing dashboard:manage permission |
| 404 | No such dashboard in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/dashboards/{id}/revisions`

Operation id: `db_revisions`. Auth: Session cookie. Forbidden (403): Missing dashboard:read permission.

Reading history needs only `dashboard:read` — it discloses who edited the dashboard and when, which anyone who can read the dashboard can already see in the info sidebar. Reverting needs `dashboard:manage`, because it writes.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `DashboardRevisionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `kind` | string | yes | `baseline` \| `edit` \| `revert` — see migration 0107. |
| `created_at` | string (date-time) | yes |  |
| `created_by` | string, nullable | no |  |
| `created_by_name` | string, nullable | no | Display name for `created_by`, resolved server-side for the same reason `DashboardDetailDto.created_by_name` is. |
| `is_current` | boolean | yes | True for the revision that matches the dashboard's live state — the newest one. The client suppresses the revert action on it rather than deriving "newest" from the array order, which would silently become wrong the day the endpoint gains a... |

| Status | Meaning |
|---|---|
| 200 | Revision history, newest first (at most 20 — see migration 0107) |
| 401 | Not authenticated |
| 403 | Missing dashboard:read permission |
| 404 | No such dashboard in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/dashboards/{id}/revisions/{revision_id}/revert`

Operation id: `db_revision_revert`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:manage permission.

Restore an earlier revision by replaying it through the ordinary update path.

The snapshot CARRIES the card and tab ids it was taken with, so a revert keeps the id of every card that still exists instead of renumbering the whole dashboard. Nothing is remapped here: `replace_layout` decides what an id means, and it honours one only when this dashboard already owns it — a card deleted since the revision comes back with a fresh id, and an id that never belonged here cannot be adopted. (This is still NOT `DashboardRepo::duplicate`, which needs a tab_map because it copies rows into a DIFFERENT dashboard.)

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `revision_id` | path | string (uuid) | yes | Revision to restore (must belong to this dashboard) |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `DashboardDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `parameters` | object | yes |  |
| `created_by` | string, nullable | no |  |
| `created_by_name` | string, nullable | no | Display name for `created_by` — the profile name, else the email. Resolved server-side: the endpoints that can turn a user id into a name are admin-gated, so the browser cannot do it for an ordinary workspace editor. Same shape and same... |
| `created_at` | string (date-time), nullable | no | NULL for dashboards predating migration 0106, which does not invent a creation date. |
| `updated_by` | string, nullable | no |  |
| `updated_by_name` | string, nullable | no | Display name for `updated_by`, resolved the same way as `created_by_name`. |
| `updated_at` | string (date-time) | yes |  |
| `folder_id` | string, nullable | no | The folder this dashboard is filed under; NULL = Uncategorized. Present on `DashboardSummaryDto` since folders shipped, and absent here until now, which is why the info sidebar had no folder to name. |
| `width` | string | yes |  |
| `certified` | boolean | yes | Marked as trusted by a steward. Same three fields datasets and metrics have carried since 0098, so "is this certified" is one question across the product rather than three. |
| `certified_by` | string | yes | Who certified it, as their email — the string is read by whoever sees the badge, and a uuid would tell them nothing. Empty while `certified` is false. |
| `certification_details` | string | yes | Why, in the certifier's words. Empty is allowed: a certification with no note is still a certification. |
| `can_manage` | boolean | yes | May the CALLER edit this dashboard? Workspace-scoped `dashboard:manage`, answered by the PDP — the session's permission list carries platform grants only and can never contain it. |
| `deleted_at` | string (date-time), nullable | no |  |
| `bookmarked` | boolean | yes |  |
| `tabs` | DashboardTabDto[] | yes |  |
| `cards` | DashboardCardDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard restored to the revision; the restored state is itself recorded as a new revision |
| 400 | The stored snapshot is not a valid dashboard layout |
| 401 | Not authenticated |
| 403 | Missing dashboard:manage permission |
| 404 | No such dashboard or revision, or a chart the revision references no longer exists in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/dashboards/{id}/trash`

Operation id: `db_trash`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing dashboard:manage permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Dashboard id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Dashboard moved to trash |
| 401 | Not authenticated |
| 403 | Missing dashboard:manage permission |
| 404 | No such dashboard in this workspace |
| 500 | Internal error |

