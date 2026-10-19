---
sidebar_position: 18
sidebar_label: Alerts and reports
description: REST endpoints in the alerts group.
---

# Alerts and reports API

.

This page lists 21 endpoints (OpenAPI tag `alerts`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/render/payload` | `render_payload` |  |
| GET | `/api/ws/{workspace}/alerts` | `list` |  |
| POST | `/api/ws/{workspace}/alerts` | `create` |  |
| GET | `/api/ws/{workspace}/alerts/{id}` | `detail` |  |
| PUT | `/api/ws/{workspace}/alerts/{id}` | `update` |  |
| DELETE | `/api/ws/{workspace}/alerts/{id}` | `remove` |  |
| PUT | `/api/ws/{workspace}/alerts/{id}/active` | `set_active` |  |
| POST | `/api/ws/{workspace}/alerts/{id}/bookmark` | `bookmark_add` | A bookmark is the CALLER's own, so it needs no `alert:manage` — a viewer may star what they can READ, which is now a permission that exists and is therefore ... |
| DELETE | `/api/ws/{workspace}/alerts/{id}/bookmark` | `bookmark_remove` |  |
| PATCH | `/api/ws/{workspace}/alerts/{id}/folder` | `set_folder` |  |
| POST | `/api/ws/{workspace}/alerts/{id}/restore` | `restore` |  |
| POST | `/api/ws/{workspace}/alerts/{id}/run` | `run_now` | Run one schedule immediately (P5's "Run now"). |
| GET | `/api/ws/{workspace}/alerts/{id}/runs` | `runs` |  |
| POST | `/api/ws/{workspace}/alerts/{id}/trash` | `trash` | Move to the trash (soft delete), so the list keeps a Restore path and the scheduler stops claiming it — `deleted_at IS NULL` is part of the claim predicate, ... |
| GET | `/api/ws/{workspace}/notifications/slack` | `slack_get` | The print page's ONE request. |
| PUT | `/api/ws/{workspace}/notifications/slack` | `slack_put` |  |
| DELETE | `/api/ws/{workspace}/notifications/slack` | `slack_delete` |  |
| GET | `/api/ws/{workspace}/notifications/smtp` | `smtp_get` |  |
| PUT | `/api/ws/{workspace}/notifications/smtp` | `smtp_put` |  |
| DELETE | `/api/ws/{workspace}/notifications/smtp` | `smtp_delete` |  |
| POST | `/api/ws/{workspace}/notifications/smtp/test` | `smtp_test` | Send a probe message. |

## GET `/api/render/payload`

Operation id: `render_payload`. Auth: Session cookie.

**Response 200 (application/json)**: `RenderPayload`

| Field | Type | Required | Description |
|---|---|---|---|
| `kind` | string | yes |  |
| `id` | string | yes |  |
| `title` | string | yes |  |
| `cards` | RenderCard[] | yes |  |
| `parameters` | object | yes | The dashboard's parameter definitions, verbatim. The print page resolves them to filters with `applyParamsToChart` — the SAME module the interactive dashboard uses — and sends the result back to [`run_cards`]. |

| Status | Meaning |
|---|---|
| 200 | What is being rendered: the object's title, each card's saved spec and param mappings, and the dashboard's parameters. No rows — see POST /render/data |
| 401 | No render token |
| 404 | Token unknown, expired, or already used |

## GET `/api/ws/{workspace}/alerts`

Operation id: `list`. Auth: Session cookie.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `type` | query | ScheduleType | no | Narrow to one tab. Omitted returns both. |
| `trashed` | query | boolean | no | Show the trash bin (soft-deleted rows) instead of the live list. |

**Response 200 (application/json)**: array of `ScheduleSummaryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `type` | ScheduleType | yes | What a schedule does: evaluate a query (`alert`), deliver a rendering of a saved object (`report`), or watch a Data API endpoint's traffic (`dataapi_alert`, migration 0128). |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `active` | boolean | yes |  |
| `crontab` | string | yes |  |
| `timezone` | string | yes |  |
| `next_run_at` | string (date-time), nullable | no |  |
| `last_state` | RunState | no |  |
| `last_eval_at` | string (date-time), nullable | no |  |
| `owners` | OwnerDto[] | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `can_manage` | boolean | yes | Whether the caller may edit/delete schedules in this workspace. |
| `bookmarked` | boolean | yes | Whether the CALLER has starred this one — per-user, unlike `can_manage`. |
| `folder_id` | string, nullable | no | The folder this row is grouped under, or `None` for "Uncategorized". |
| `deleted_at` | string (date-time), nullable | no | Set only in the trash view; `None` for a live schedule. |

| Status | Meaning |
|---|---|
| 200 | Schedules in this workspace |

## POST `/api/ws/{workspace}/alerts`

Operation id: `create`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |

**Request body (application/json)**: `CreateSchedule`

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | ScheduleType | yes | What a schedule does: evaluate a query (`alert`), deliver a rendering of a saved object (`report`), or watch a Data API endpoint's traffic (`dataapi_alert`, migration 0128). |
| `name` | string | yes |  |
| `description` | string | no |  |
| `active` | boolean | no |  |
| `crontab` | string | yes |  |
| `timezone` | string | no |  |
| `database_id` | string (uuid), nullable | no |  |
| `sql` | string, nullable | no |  |
| `validator_type` | ValidatorType | no |  |
| `validator_config` | object | no |  |
| `chart_id` | string (uuid), nullable | no |  |
| `dashboard_id` | string (uuid), nullable | no |  |
| `report_format` | ReportFormat | no |  |
| `custom_width` | integer (int32), nullable | no |  |
| `custom_height` | integer (int32), nullable | no |  |
| `dataapi_endpoint_id` | string (uuid), nullable | no | `None` is workspace-scoped: watch every endpoint rather than one. |
| `dataapi_metric` | DataapiMetric | no |  |
| `dataapi_error_code` | string, nullable | no | Required, and only meaningful, when `dataapi_metric` is `error_code_count` — `schedule_dataapi_error_code_needs_metric` / `schedule_dataapi_metric_needs_error_code` (migration 0128). |
| `dataapi_window_s` | integer (int32), nullable | no |  |
| `grace_period_s` | integer (int32), nullable | no |  |
| `working_timeout_s` | integer (int32), nullable | no |  |
| `log_retention_days` | integer (int32), nullable | no |  |
| `email_subject` | string, nullable | no |  |
| `message` | string, nullable | no | A user-authored note carried into the notification body. Distinct from `description`, which is the line the LIST shows. |
| `message_footer` | string, nullable | no | The closing note, rendered UNDER the result — `message` opens the notification, this one closes it, and an inline image sits between them. Defaulted, so a client written before 0116 keeps working unchanged. |
| `skip_if_empty` | boolean | no | Metabase's `skip_if_empty`: send nothing when the run produced no rows. |
| `targets` | TargetInput[] | no | Objects a REPORT delivers, in page order. Empty falls back to the single `chart_id`/`dashboard_id`, which is every pre-0115 row. |
| `owners` | string (uuid)[] | no | Owner user ids. Empty means "the creator", resolved server-side — a schedule with no owner has no identity to run as (§5.2). |
| `recipients` | RecipientInput[] | no |  |

**Response 200 (application/json)**: `ScheduleDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `type` | ScheduleType | yes | What a schedule does: evaluate a query (`alert`), deliver a rendering of a saved object (`report`), or watch a Data API endpoint's traffic (`dataapi_alert`, migration 0128). |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `active` | boolean | yes |  |
| `crontab` | string | yes |  |
| `timezone` | string | yes |  |
| `next_run_at` | string (date-time), nullable | no |  |
| `database_id` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `validator_type` | ValidatorType | no |  |
| `validator_config` | object | yes |  |
| `last_state` | RunState | no |  |
| `last_eval_at` | string (date-time), nullable | no |  |
| `last_value` | number (double), nullable | no |  |
| `chart_id` | string, nullable | no |  |
| `dashboard_id` | string, nullable | no |  |
| `report_format` | ReportFormat | no |  |
| `custom_width` | integer (int32), nullable | no |  |
| `custom_height` | integer (int32), nullable | no |  |
| `dataapi_endpoint_id` | string, nullable | no |  |
| `dataapi_metric` | DataapiMetric | no |  |
| `dataapi_error_code` | string, nullable | no |  |
| `dataapi_window_s` | integer (int32), nullable | no |  |
| `grace_period_s` | integer (int32) | yes |  |
| `working_timeout_s` | integer (int32) | yes |  |
| `log_retention_days` | integer (int32) | yes |  |
| `email_subject` | string, nullable | no |  |
| `message` | string, nullable | no | A user-authored note carried into the notification body. Distinct from `description`, which is the line the LIST shows. |
| `message_footer` | string, nullable | no | The closing note, rendered UNDER the result — `message` opens the notification, this one closes it, and an inline image sits between them. Defaulted, so a client written before 0116 keeps working unchanged. |
| `skip_if_empty` | boolean | no | Metabase's `skip_if_empty`: send nothing when the run produced no rows. |
| `targets` | TargetInput[] | no | Objects a REPORT delivers, in page order. Empty falls back to the single `chart_id`/`dashboard_id`, which is every pre-0115 row. |
| `owners` | OwnerDto[] | yes |  |
| `recipients` | RecipientDto[] | yes |  |
| `created_by` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Created |
| 400 | Invalid body |
| 409 | Name already used by a schedule of this type |

## GET `/api/ws/{workspace}/alerts/{id}`

Operation id: `detail`. Auth: Session cookie.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `ScheduleDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `type` | ScheduleType | yes | What a schedule does: evaluate a query (`alert`), deliver a rendering of a saved object (`report`), or watch a Data API endpoint's traffic (`dataapi_alert`, migration 0128). |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `active` | boolean | yes |  |
| `crontab` | string | yes |  |
| `timezone` | string | yes |  |
| `next_run_at` | string (date-time), nullable | no |  |
| `database_id` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `validator_type` | ValidatorType | no |  |
| `validator_config` | object | yes |  |
| `last_state` | RunState | no |  |
| `last_eval_at` | string (date-time), nullable | no |  |
| `last_value` | number (double), nullable | no |  |
| `chart_id` | string, nullable | no |  |
| `dashboard_id` | string, nullable | no |  |
| `report_format` | ReportFormat | no |  |
| `custom_width` | integer (int32), nullable | no |  |
| `custom_height` | integer (int32), nullable | no |  |
| `dataapi_endpoint_id` | string, nullable | no |  |
| `dataapi_metric` | DataapiMetric | no |  |
| `dataapi_error_code` | string, nullable | no |  |
| `dataapi_window_s` | integer (int32), nullable | no |  |
| `grace_period_s` | integer (int32) | yes |  |
| `working_timeout_s` | integer (int32) | yes |  |
| `log_retention_days` | integer (int32) | yes |  |
| `email_subject` | string, nullable | no |  |
| `message` | string, nullable | no | A user-authored note carried into the notification body. Distinct from `description`, which is the line the LIST shows. |
| `message_footer` | string, nullable | no | The closing note, rendered UNDER the result — `message` opens the notification, this one closes it, and an inline image sits between them. Defaulted, so a client written before 0116 keeps working unchanged. |
| `skip_if_empty` | boolean | no | Metabase's `skip_if_empty`: send nothing when the run produced no rows. |
| `targets` | TargetInput[] | no | Objects a REPORT delivers, in page order. Empty falls back to the single `chart_id`/`dashboard_id`, which is every pre-0115 row. |
| `owners` | OwnerDto[] | yes |  |
| `recipients` | RecipientDto[] | yes |  |
| `created_by` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Schedule |
| 404 | No such schedule in this workspace |

## PUT `/api/ws/{workspace}/alerts/{id}`

Operation id: `update`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `UpdateSchedule`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `description` | string | no |  |
| `active` | boolean | yes |  |
| `crontab` | string | yes |  |
| `timezone` | string | no |  |
| `database_id` | string (uuid), nullable | no |  |
| `sql` | string, nullable | no |  |
| `validator_type` | ValidatorType | no |  |
| `validator_config` | object | no |  |
| `chart_id` | string (uuid), nullable | no |  |
| `dashboard_id` | string (uuid), nullable | no |  |
| `report_format` | ReportFormat | no |  |
| `custom_width` | integer (int32), nullable | no |  |
| `custom_height` | integer (int32), nullable | no |  |
| `dataapi_endpoint_id` | string (uuid), nullable | no | `None` is workspace-scoped: watch every endpoint rather than one. |
| `dataapi_metric` | DataapiMetric | no |  |
| `dataapi_error_code` | string, nullable | no | Required, and only meaningful, when `dataapi_metric` is `error_code_count` — `schedule_dataapi_error_code_needs_metric` / `schedule_dataapi_metric_needs_error_code` (migration 0128). |
| `dataapi_window_s` | integer (int32), nullable | no |  |
| `grace_period_s` | integer (int32), nullable | no |  |
| `working_timeout_s` | integer (int32), nullable | no |  |
| `log_retention_days` | integer (int32), nullable | no |  |
| `email_subject` | string, nullable | no |  |
| `message` | string, nullable | no | A user-authored note carried into the notification body. Distinct from `description`, which is the line the LIST shows. |
| `message_footer` | string, nullable | no | The closing note, rendered UNDER the result — `message` opens the notification, this one closes it, and an inline image sits between them. Defaulted, so a client written before 0116 keeps working unchanged. |
| `skip_if_empty` | boolean | no | Metabase's `skip_if_empty`: send nothing when the run produced no rows. |
| `targets` | TargetInput[] | no | Objects a REPORT delivers, in page order. Empty falls back to the single `chart_id`/`dashboard_id`, which is every pre-0115 row. |
| `owners` | string (uuid)[] | no |  |
| `recipients` | RecipientInput[] | no |  |

**Response 200 (application/json)**: `ScheduleDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `type` | ScheduleType | yes | What a schedule does: evaluate a query (`alert`), deliver a rendering of a saved object (`report`), or watch a Data API endpoint's traffic (`dataapi_alert`, migration 0128). |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `active` | boolean | yes |  |
| `crontab` | string | yes |  |
| `timezone` | string | yes |  |
| `next_run_at` | string (date-time), nullable | no |  |
| `database_id` | string, nullable | no |  |
| `sql` | string, nullable | no |  |
| `validator_type` | ValidatorType | no |  |
| `validator_config` | object | yes |  |
| `last_state` | RunState | no |  |
| `last_eval_at` | string (date-time), nullable | no |  |
| `last_value` | number (double), nullable | no |  |
| `chart_id` | string, nullable | no |  |
| `dashboard_id` | string, nullable | no |  |
| `report_format` | ReportFormat | no |  |
| `custom_width` | integer (int32), nullable | no |  |
| `custom_height` | integer (int32), nullable | no |  |
| `dataapi_endpoint_id` | string, nullable | no |  |
| `dataapi_metric` | DataapiMetric | no |  |
| `dataapi_error_code` | string, nullable | no |  |
| `dataapi_window_s` | integer (int32), nullable | no |  |
| `grace_period_s` | integer (int32) | yes |  |
| `working_timeout_s` | integer (int32) | yes |  |
| `log_retention_days` | integer (int32) | yes |  |
| `email_subject` | string, nullable | no |  |
| `message` | string, nullable | no | A user-authored note carried into the notification body. Distinct from `description`, which is the line the LIST shows. |
| `message_footer` | string, nullable | no | The closing note, rendered UNDER the result — `message` opens the notification, this one closes it, and an inline image sits between them. Defaulted, so a client written before 0116 keeps working unchanged. |
| `skip_if_empty` | boolean | no | Metabase's `skip_if_empty`: send nothing when the run produced no rows. |
| `targets` | TargetInput[] | no | Objects a REPORT delivers, in page order. Empty falls back to the single `chart_id`/`dashboard_id`, which is every pre-0115 row. |
| `owners` | OwnerDto[] | yes |  |
| `recipients` | RecipientDto[] | yes |  |
| `created_by` | string, nullable | no |  |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Updated |
| 400 | Invalid body |
| 404 | No such schedule in this workspace |

## DELETE `/api/ws/{workspace}/alerts/{id}`

Operation id: `remove`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Deleted |
| 404 | No such schedule in this workspace |

## PUT `/api/ws/{workspace}/alerts/{id}/active`

Operation id: `set_active`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetActiveBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `active` | boolean | yes |  |

**Response 200 (application/json)**: `ScheduleSummaryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `type` | ScheduleType | yes | What a schedule does: evaluate a query (`alert`), deliver a rendering of a saved object (`report`), or watch a Data API endpoint's traffic (`dataapi_alert`, migration 0128). |
| `name` | string | yes |  |
| `description` | string | yes |  |
| `active` | boolean | yes |  |
| `crontab` | string | yes |  |
| `timezone` | string | yes |  |
| `next_run_at` | string (date-time), nullable | no |  |
| `last_state` | RunState | no |  |
| `last_eval_at` | string (date-time), nullable | no |  |
| `owners` | OwnerDto[] | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `can_manage` | boolean | yes | Whether the caller may edit/delete schedules in this workspace. |
| `bookmarked` | boolean | yes | Whether the CALLER has starred this one — per-user, unlike `can_manage`. |
| `folder_id` | string, nullable | no | The folder this row is grouped under, or `None` for "Uncategorized". |
| `deleted_at` | string (date-time), nullable | no | Set only in the trash view; `None` for a live schedule. |

| Status | Meaning |
|---|---|
| 200 | Updated |
| 404 | No such schedule in this workspace |

## POST `/api/ws/{workspace}/alerts/{id}/bookmark`

Operation id: `bookmark_add`. Auth: Session cookie and `X-Egret-CSRF` header.

A bookmark is the CALLER's own, so it needs no `alert:manage` — a viewer may star what they can READ, which is now a permission that exists and is therefore checked rather than described.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Bookmarked for the caller |
| 401 | Not authenticated |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/alerts/{id}/bookmark`

Operation id: `bookmark_remove`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Bookmark removed for the caller |
| 401 | Not authenticated |
| 500 | Internal error |

## PATCH `/api/ws/{workspace}/alerts/{id}/folder`

Operation id: `set_folder`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Needs alert:manage.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetFolderBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `folder_id` | string (uuid), nullable | no | `null` moves the schedule back to Uncategorized. |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Moved |
| 401 | Not authenticated |
| 403 | Needs alert:manage |
| 404 | No such schedule here |
| 500 | Internal error |

## POST `/api/ws/{workspace}/alerts/{id}/restore`

Operation id: `restore`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Needs alert:manage.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Restored from the trash |
| 401 | Not authenticated |
| 403 | Needs alert:manage |
| 404 | No such schedule here |
| 500 | Internal error |

## POST `/api/ws/{workspace}/alerts/{id}/run`

Operation id: `run_now`. Auth: Session cookie and `X-Egret-CSRF` header.

Run one schedule immediately (P5's "Run now"). Goes through the exact same `AutomationRunner::run_now` the tick's own claim loop calls `evaluate_and_deliver` through — see that function's doc comment for why a manual run is not a second evaluator and does not bypass the grace period. Returns the run-log row it just wrote, so the caller can show the result without a second request.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `RunDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `state` | RunState | yes | Superset's five run states, verbatim. They are the vocabulary that makes the list page legible — in particular `noop` ("ran, condition false") and `grace` ("would have fired, suppressed") are the two answers to "why didn't I get an email?",... |
| `started_at` | string (date-time) | yes |  |
| `ended_at` | string (date-time), nullable | no |  |
| `value` | number (double), nullable | no |  |
| `error` | string, nullable | no |  |
| `notification_sent_at` | string (date-time), nullable | no |  |

| Status | Meaning |
|---|---|
| 200 | Ran once; the run-log row it wrote |
| 404 | No such schedule in this workspace |

## GET `/api/ws/{workspace}/alerts/{id}/runs`

Operation id: `runs`. Auth: Session cookie.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `RunDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `state` | RunState | yes | Superset's five run states, verbatim. They are the vocabulary that makes the list page legible — in particular `noop` ("ran, condition false") and `grace` ("would have fired, suppressed") are the two answers to "why didn't I get an email?",... |
| `started_at` | string (date-time) | yes |  |
| `ended_at` | string (date-time), nullable | no |  |
| `value` | number (double), nullable | no |  |
| `error` | string, nullable | no |  |
| `notification_sent_at` | string (date-time), nullable | no |  |

| Status | Meaning |
|---|---|
| 200 | Recent runs, newest first |

## POST `/api/ws/{workspace}/alerts/{id}/trash`

Operation id: `trash`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Needs alert:manage.

Move to the trash (soft delete), so the list keeps a Restore path and the scheduler stops claiming it — `deleted_at IS NULL` is part of the claim predicate, not merely a display filter.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |
| `id` | path | string (uuid) | yes | Schedule id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Moved to the trash |
| 401 | Not authenticated |
| 403 | Needs alert:manage |
| 404 | No such schedule here |
| 500 | Internal error |

## GET `/api/ws/{workspace}/notifications/slack`

Operation id: `slack_get`. Auth: Session cookie.

The print page's ONE request. Deliberately token-only: there is no `WsContext` extractor here, so an ordinary session cookie authenticates nothing on this route — widening it to sessions would make it a second, unaudited read path for any chart or dashboard. The workspace's Slack app.

Gated on `SMTP_MANAGE` — the same permission as the relay, and for the same reason: a bot token is workspace administration, not alert authoring. An editor who may write a schedule still may not swap the credential every schedule posts with.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |

**Response 200 (application/json)**: `SlackConfigDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `default_channel` | string, nullable | no |  |
| `has_token` | boolean | yes | Always true when a row exists: `token_secret_id` is NOT NULL. It is reported anyway so the editor's "a token is stored" line reads the same field on both credential paths — see `redact_recipient_config`. |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | The workspace's Slack app |
| 404 | Not configured |

## PUT `/api/ws/{workspace}/notifications/slack`

Operation id: `slack_put`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |

**Request body (application/json)**: `SlackConfigBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `token` | string, nullable | no | Three-way, like SMTP's password: absent keeps the stored token, `""` is rejected (a config with no token cannot deliver, so there is nothing sensible to store), a value replaces it. Required on first write. |
| `default_channel` | string, nullable | no |  |

**Response 200 (application/json)**: `SlackConfigDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `default_channel` | string, nullable | no |  |
| `has_token` | boolean | yes | Always true when a row exists: `token_secret_id` is NOT NULL. It is reported anyway so the editor's "a token is stored" line reads the same field on both credential paths — see `redact_recipient_config`. |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Saved |

## DELETE `/api/ws/{workspace}/notifications/slack`

Operation id: `slack_delete`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Removed |

## GET `/api/ws/{workspace}/notifications/smtp`

Operation id: `smtp_get`. Auth: Session cookie.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |

**Response 200 (application/json)**: `SmtpConfigDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `host` | string | yes |  |
| `port` | integer (int32) | yes |  |
| `username` | string, nullable | no |  |
| `from_address` | string | yes |  |
| `from_name` | string, nullable | no |  |
| `tls_mode` | TlsMode | yes | How the connection is secured. Spelled out rather than inferred from the port: 587-means-STARTTLS is a convention, not a rule, and guessing wrong silently sends credentials in the clear. |
| `has_password` | boolean | yes | Whether a password is stored. The password itself is never returned. |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | The workspace's SMTP settings, without the password |
| 404 | Not configured |

## PUT `/api/ws/{workspace}/notifications/smtp`

Operation id: `smtp_put`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |

**Request body (application/json)**: `SmtpConfigBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `host` | string | yes |  |
| `port` | integer (int32) | yes |  |
| `username` | string, nullable | no |  |
| `from_address` | string | yes |  |
| `from_name` | string, nullable | no |  |
| `tls_mode` | TlsMode | yes | How the connection is secured. Spelled out rather than inferred from the port: 587-means-STARTTLS is a convention, not a rule, and guessing wrong silently sends credentials in the clear. |
| `password` | string, nullable | no | Omitted means "keep the stored password"; `""` means "remove it". |

**Response 200 (application/json)**: `SmtpConfigDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `host` | string | yes |  |
| `port` | integer (int32) | yes |  |
| `username` | string, nullable | no |  |
| `from_address` | string | yes |  |
| `from_name` | string, nullable | no |  |
| `tls_mode` | TlsMode | yes | How the connection is secured. Spelled out rather than inferred from the port: 587-means-STARTTLS is a convention, not a rule, and guessing wrong silently sends credentials in the clear. |
| `has_password` | boolean | yes | Whether a password is stored. The password itself is never returned. |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Saved |

## DELETE `/api/ws/{workspace}/notifications/smtp`

Operation id: `smtp_delete`. Auth: Session cookie and `X-Egret-CSRF` header.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |

| Status | Meaning |
|---|---|
| 200 | Removed |

## POST `/api/ws/{workspace}/notifications/smtp/test`

Operation id: `smtp_test`. Auth: Session cookie and `X-Egret-CSRF` header.

Send a probe message.

This endpoint is the whole reason the settings page is trustworthy: "configured" and "configured correctly" are otherwise indistinguishable until an alert fires at 3am and silently does not arrive. The relay's own error text is returned verbatim, because "authentication failed" and "connection refused" send the operator to different places.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug. |

**Request body (application/json)**: `SmtpTestBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `to` | string, nullable | no | Where to send the probe. Defaults to the configured from-address. |

| Status | Meaning |
|---|---|
| 200 | The probe was accepted by the relay |
| 400 | The relay refused; the message says why |

