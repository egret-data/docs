---
sidebar_position: 22
sidebar_label: Workflows
description: REST endpoints in the workflow group.
---

# Workflows API

Flow drafts and published versions (W1).

This page lists 53 endpoints (OpenAPI tag `workflow`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/ws/{workspace}/workflows/executions` | `list_executions` |  |
| GET | `/api/ws/{workspace}/workflows/executions/{id}` | `get_execution` |  |
| GET | `/api/ws/{workspace}/workflows/executions/{id}/file` | `download_execution_file` |  |
| GET | `/api/ws/{workspace}/workflows/executions/{id}/file/metas` | `execution_file_metas` |  |
| GET | `/api/ws/{workspace}/workflows/executions/{id}/file/preview` | `preview_execution_file` |  |
| GET | `/api/ws/{workspace}/workflows/executions/{id}/graph` | `get_execution_graph` |  |
| POST | `/api/ws/{workspace}/workflows/executions/{id}/kill` | `kill_execution` | Kill an execution that has not ended. |
| GET | `/api/ws/{workspace}/workflows/executions/{id}/logs` | `get_execution_logs` | An execution's log lines after a cursor, in `id` order. |
| POST | `/api/ws/{workspace}/workflows/executions/{id}/replay` | `replay_execution` | Run a finished execution again. |
| POST | `/api/ws/{workspace}/workflows/executions/{id}/resume` | `resume_execution` | Resume a `PAUSED` execution by hand. |
| GET | `/api/ws/{workspace}/workflows/flows` | `list_flows` |  |
| POST | `/api/ws/{workspace}/workflows/flows` | `create_flow` |  |
| POST | `/api/ws/{workspace}/workflows/flows/graph` | `graph_unsaved_flow` |  |
| POST | `/api/ws/{workspace}/workflows/flows/validate` | `validate_unsaved_flow` |  |
| GET | `/api/ws/{workspace}/workflows/flows/{id}` | `get_flow` |  |
| PUT | `/api/ws/{workspace}/workflows/flows/{id}` | `update_flow` | Replace a flow's draft. |
| DELETE | `/api/ws/{workspace}/workflows/flows/{id}` | `delete_flow` |  |
| POST | `/api/ws/{workspace}/workflows/flows/{id}/executions` | `start_flow_execution` |  |
| GET | `/api/ws/{workspace}/workflows/flows/{id}/graph` | `get_flow_graph` |  |
| POST | `/api/ws/{workspace}/workflows/flows/{id}/publish` | `publish_flow` |  |
| GET | `/api/ws/{workspace}/workflows/flows/{id}/triggers` | `list_flow_triggers` |  |
| POST | `/api/ws/{workspace}/workflows/flows/{id}/triggers/{trigger_id}/backfill` | `create_trigger_backfill` |  |
| DELETE | `/api/ws/{workspace}/workflows/flows/{id}/triggers/{trigger_id}/backfill` | `delete_trigger_backfill` |  |
| PUT | `/api/ws/{workspace}/workflows/flows/{id}/triggers/{trigger_id}/backfill/paused` | `set_trigger_backfill_paused` |  |
| PUT | `/api/ws/{workspace}/workflows/flows/{id}/triggers/{trigger_id}/disabled` | `set_trigger_disabled` |  |
| POST | `/api/ws/{workspace}/workflows/flows/{id}/validate` | `validate_flow` |  |
| GET | `/api/ws/{workspace}/workflows/flows/{id}/versions` | `list_flow_versions` |  |
| GET | `/api/ws/{workspace}/workflows/flows/{id}/versions/{version}` | `get_flow_version` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces` | `list_namespaces` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}` | `get_namespace` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/dependencies` | `namespace_dependencies` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/files` | `download_namespace_file` |  |
| POST | `/api/ws/{workspace}/workflows/namespaces/{namespace}/files` | `upload_namespace_file` |  |
| PUT | `/api/ws/{workspace}/workflows/namespaces/{namespace}/files` | `move_namespace_file` |  |
| DELETE | `/api/ws/{workspace}/workflows/namespaces/{namespace}/files` | `delete_namespace_file` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/directory` | `list_namespace_directory` |  |
| POST | `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/directory` | `create_namespace_directory` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/export` | `export_namespace_files` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/revisions` | `namespace_file_revisions` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/search` | `search_namespace_files` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/stats` | `namespace_file_stats` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv` | `list_kv` |  |
| DELETE | `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv` | `delete_kv_values` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv/inheritance` | `list_inherited_kv` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv/{key}` | `get_kv_value` |  |
| PUT | `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv/{key}` | `put_kv_value` |  |
| DELETE | `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv/{key}` | `delete_kv_value` |  |
| GET | `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv/{key}/revisions` | `kv_revisions` |  |
| GET | `/api/ws/{workspace}/workflows/schema` | `get_flow_schema` |  |
| GET | `/api/ws/{workspace}/workflows/triggers` | `list_triggers` |  |
| POST | `/api/ws/{workspace}/workflows/triggers/backfill/delete` | `delete_triggers_backfill` |  |
| PUT | `/api/ws/{workspace}/workflows/triggers/backfill/paused` | `set_triggers_backfill_paused` |  |
| PUT | `/api/ws/{workspace}/workflows/triggers/disabled` | `set_triggers_disabled` |  |

## GET `/api/ws/{workspace}/workflows/executions`

Operation id: `list_executions`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `flow_id` | query | string (uuid) | no | Only executions started from this draft. A trashed draft still matches: `FlowRepo`'s delete is soft, so the column keeps pointing at it. |
| `namespace` | query | string | no | Exactly this namespace. Cannot be combined with `namespace_prefix` (400). |
| `namespace_prefix` | query | string | no | This namespace and every namespace beneath it, dot-anchored: `a.b` matches `a.b` and `a.b.c`, never `a.bc`. A `_` or `%` is a literal character, not a wildcard. Cannot be combined with `namespace` (400). |
| `flow_key` | query | string | no | The YAML's own `id` — the only filter that still finds an execution whose `flow_id` was `NULL`ed by a real `DELETE`. |
| `state` | query | string | no | One or more states, **comma-separated** (`RUNNING,FAILED`): a run list shows failures beside what is in flight. |
| `since` | query | string (date-time) | no | Window over the execution's `created_at`, **inclusive**. |
| `until` | query | string (date-time) | no | Window over the execution's `created_at`, **exclusive**, so consecutive windows tile without double-counting the row on the boundary. |
| `root_only` | query | boolean | no | `true`: hide child executions — a loop iteration (`loop_index` set) and a subflow or flow-trigger child (`trigger_execution_id` set). A `CREATE_NEW_EXECUTION` retry is NOT hidden: it carries `parent_execution_id` without a `loop_index`, and... |
| `parent` | query | string (uuid) | no | Only the direct children of this execution: the rows whose `parent_execution_id` or `trigger_execution_id` is this id. An id from another workspace answers an empty page, never an error. Cannot be combined with `root_only=true` (400). |
| `limit` | query | integer (int64) | no | How many rows to return. Default 50, maximum 200; a larger value is clamped rather than refused, and the clamped value comes back in the response's own `limit`. |
| `offset` | query | integer (int64) | no | How many rows to skip. Negative is clamped to zero. |

**Response 200 (application/json)**: `ExecutionPageDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `rows` | ExecutionListItemDto[] | yes |  |
| `total` | integer (int64) | yes | Every execution matching the filter, not just this page's. Counted by a second statement carrying the same predicates, workspace one included. |
| `limit` | integer (int64) | yes | The page size actually used, after the clamp. |
| `offset` | integer (int64) | yes | The offset actually used, after the clamp. |

| Status | Meaning |
|---|---|
| 200 | One page of the workspace's executions, newest first, with the total behind it |
| 400 | The query string does not decode — a malformed `flow_id`/`parent`/`since`/`until`, a `root_only` that is not `true`/`false`, a non-numeric `limit`/`offset`, or a **repeated** key (`?state=A&state=B` answers `duplicate field state`; several... |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/executions/{id}`

Operation id: `get_execution`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Execution id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `ExecutionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `flow_id` | string (uuid), nullable | no | The draft this execution came from, and `NULL` only if something outside this crate issued a real `DELETE` — **trashing a flow does not clear it**, because `FlowRepo`'s delete is soft and nothing in `egret-workflow/src` issues a `DELETE... |
| `namespace` | string | yes |  |
| `flow_key` | string | yes | The YAML's own `id`; `flow_id` is taken by the draft's uuid above. |
| `state` | string | yes | Kestra's wire spelling — `RUNNING`, `SUCCESS`, `FAILED`, … |
| `history` | string[] | yes | The state timeline, as stored: an array of state NAMES, e.g. `["CREATED","RUNNING","SUCCESS"]`. It carries no timestamps — see [`TaskRunDto::history`], which is written by the same function. |
| `inputs` | object | yes |  |
| `seq` | integer (int64) | yes |  |
| `execution_trigger` | object, nullable | no | The trigger record, `NULL` for an API start. |
| `trigger_execution_id` | string (uuid), nullable | no |  |
| `trigger_run_ix` | integer (int32), nullable | no |  |
| `parent_execution_id` | string (uuid), nullable | no |  |
| `parent_run_ix` | integer (int32), nullable | no |  |
| `loop_index` | integer (int32), nullable | no |  |
| `loop_value` | string, nullable | no |  |
| `attempt_number` | integer (int32) | yes |  |
| `origin_offset_ms` | integer (int64) | yes |  |
| `replayed_from_execution_id` | string (uuid), nullable | no | The execution this one is a manual replay of (`POST …/replay`), `NULL` for every other start. A `CREATE_NEW_EXECUTION` retry is NOT linked here; it carries `parent_execution_id` instead. |
| `started_at` | string (date-time), nullable | no | The first time the execution entered `RUNNING`. `NULL` before it runs, for one that never ran (an SLA that cancelled it at creation), and for an execution recorded before these times existed — a UI shows that last case as estimated, never... |
| `ended_at` | string (date-time), nullable | no | When the execution entered a terminal state; `NULL` while it has not (a paused execution has none), and for an execution recorded before these times existed. Written once: later writes to a finished execution do not move it. |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `labels` | LabelDto[], nullable | no | The execution's own label column; `null` for none. At start it holds the labels beyond the flow's own `labels:` (a backfill's, a replay's copy); once a `Labels` task has run it holds the full merged list, the flow's labels included. The... |
| `backfill_id` | string (uuid), nullable | no | The backfill that fired this execution (W7f), `null` otherwise. |
| `source` | string | yes | The flow source this execution runs, frozen at start. The plan is pure over it, which is why a detail page can draw the topology from this string alone. |
| `runs` | TaskRunDto[] | yes | Every task run, in `run_ix` order — the executor's creation order. |
| `can_manage` | boolean | yes | Whether the caller may resume and replay this execution: they hold `workflow:manage` in this workspace. A detail page hides both actions when this is false; the routes still check for themselves. |
| `effective_labels` | LabelDto[] | yes | What the run sees as `labels`: the flow's, then `labels`, the later key winning. Empty when the frozen source does not parse. |

| Status | Meaning |
|---|---|
| 200 | The execution, its frozen source, and every task run in run_ix order |
| 400 | `\{id\}` is not a UUID. Decided by axum's `Path` extractor before any handler runs — and AFTER `Auth`, so an anonymous caller still gets 401 and this leaks no existence |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such execution in this workspace. **An execution belonging to another workspace answers exactly this**, indistinguishably from one that never existed: a 403 would confirm the id is real. |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/executions/{id}/file`

Operation id: `download_execution_file`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Execution id: any id of the file's loop family (its loop root or any iteration under it) |
| `path` | query | string | yes | The file's `kestra:///…` URI, as the execution's outputs or inputs name it. |
| `workspace` | path | string | yes |  |

**Response 200 (application/octet-stream)**: array of `integer (int32)`

| Status | Meaning |
|---|---|
| 200 | The file's bytes, streamed. `Content-Type: application/octet-stream`, `Content-Disposition: attachment` with the file's name (sanitised, and percent-encoded in `filename*`), `X-Content-Type-Options: nosniff`. |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such execution in this workspace, or `path` is not a file of its loop family: malformed, another execution's (a trigger's or a replay source's too -- ask that execution by its own id), never stored, or its contents are gone. **One answer... |
| 500 | Internal error |
| 503 | Internal storage is unavailable or not configured; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/executions/{id}/file/metas`

Operation id: `execution_file_metas`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Execution id: any id of the file's loop family |
| `path` | query | string | yes | The file's `kestra:///…` URI, as the execution's outputs or inputs name it. |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `FileMetasDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `size` | integer (int64) | yes | The file's size in bytes, as indexed when it was stored. |

| Status | Meaning |
|---|---|
| 200 | The file's size, from the index (the store is not asked). |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such execution in this workspace, or `path` is not a file of its loop family (one answer, never a redirect). |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/executions/{id}/file/preview`

Operation id: `preview_execution_file`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Execution id: any id of the file's loop family |
| `path` | query | string | yes | The file's `kestra:///…` URI, as the execution's outputs or inputs name it. |
| `maxRows` | query | integer (int32) | no | At most this many rows (default 100; anything above 5000 is 5000, below 1 is 1). |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `FilePreviewDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `previewable` | boolean | yes | `false` (with no rows) for a file that is neither Ion nor UTF-8 text, Ion that does not parse, or Ion nested deeper than 100 levels. |
| `rows` | object[] | yes | `.ion`: one JSON value per top-level Ion value (a struct's null fields omitted, a timestamp as its Ion text, a decimal as a number). Anything else: one string per line. |
| `truncated` | boolean | yes | More rows follow than `maxRows`, or the preview's byte budget (`workflow.storage.max_read_bytes`) ended the read. |

| Status | Meaning |
|---|---|
| 200 | Up to `maxRows` rows (default 100, at most 5000), read from the start of the file and never more than `workflow.storage.max_read_bytes` of it. A `.ion` file (text or binary Ion) gives one JSON value per top-level value; any other file whose... |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such execution in this workspace, or `path` is not a file of its loop family, or its contents are gone (one answer, never a redirect). |
| 500 | Internal error |
| 503 | Internal storage is unavailable or not configured; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/executions/{id}/graph`

Operation id: `get_execution_graph`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Execution id |
| `subflows` | query | string[] | no | Uids of `Subflow` nodes to expand in place, repeated (`subflows=a&subflows=b`). A `Subflow` whose run started a child execution expands from that execution's frozen source, with its states; otherwise from the child flow's current draft,... |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `ExecutionGraph`

| Field | Type | Required | Description |
|---|---|---|---|
| `graph` | FlowGraph | yes |  |
| `states` | object | yes | Node uid -> its state. A node with no run has no entry. |

| Status | Meaning |
|---|---|
| 200 | The graph of the execution's frozen source, and the state of every node that has a run. A task with no run has no entry; a task in a `Loop` body is folded over every iteration by Kestra's priority, with `iterations` and no `run_id` |
| 400 | `\{id\}` is not a UUID |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such execution in this workspace; one of another workspace answers exactly this |
| 422 | The graph, counted after expansion, has more than 5,000 nodes; the message names the count |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/executions/{id}/kill`

Operation id: `kill_execution`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough.**.

Kill an execution that has not ended.

Tasks retrying, paused or not yet started end `KILLED` at once; a running task is stopped by a worker -- the one running it, or the next one to claim it -- and the execution is `KILLING` until it has. With `cascade` (the default) its `Loop` iterations and `Subflow` child executions are killed the same way.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Execution id |
| `cascade` | query | boolean | no | Also kill the execution's child executions -- its `Loop` iterations and its `Subflow` children, recursively (default `true`). A replay of it, or an execution a Flow trigger fired on it, is not a child. With `false`, the children run on, and... |
| `workspace` | path | string | yes |  |

**Response 202 (application/json)**: `ExecutionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `flow_id` | string (uuid), nullable | no | The draft this execution came from, and `NULL` only if something outside this crate issued a real `DELETE` — **trashing a flow does not clear it**, because `FlowRepo`'s delete is soft and nothing in `egret-workflow/src` issues a `DELETE... |
| `namespace` | string | yes |  |
| `flow_key` | string | yes | The YAML's own `id`; `flow_id` is taken by the draft's uuid above. |
| `state` | string | yes | Kestra's wire spelling — `RUNNING`, `SUCCESS`, `FAILED`, … |
| `history` | string[] | yes | The state timeline, as stored: an array of state NAMES, e.g. `["CREATED","RUNNING","SUCCESS"]`. It carries no timestamps — see [`TaskRunDto::history`], which is written by the same function. |
| `inputs` | object | yes |  |
| `seq` | integer (int64) | yes |  |
| `execution_trigger` | object, nullable | no | The trigger record, `NULL` for an API start. |
| `trigger_execution_id` | string (uuid), nullable | no |  |
| `trigger_run_ix` | integer (int32), nullable | no |  |
| `parent_execution_id` | string (uuid), nullable | no |  |
| `parent_run_ix` | integer (int32), nullable | no |  |
| `loop_index` | integer (int32), nullable | no |  |
| `loop_value` | string, nullable | no |  |
| `attempt_number` | integer (int32) | yes |  |
| `origin_offset_ms` | integer (int64) | yes |  |
| `replayed_from_execution_id` | string (uuid), nullable | no | The execution this one is a manual replay of (`POST …/replay`), `NULL` for every other start. A `CREATE_NEW_EXECUTION` retry is NOT linked here; it carries `parent_execution_id` instead. |
| `started_at` | string (date-time), nullable | no | The first time the execution entered `RUNNING`. `NULL` before it runs, for one that never ran (an SLA that cancelled it at creation), and for an execution recorded before these times existed — a UI shows that last case as estimated, never... |
| `ended_at` | string (date-time), nullable | no | When the execution entered a terminal state; `NULL` while it has not (a paused execution has none), and for an execution recorded before these times existed. Written once: later writes to a finished execution do not move it. |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `labels` | LabelDto[], nullable | no | The execution's own label column; `null` for none. At start it holds the labels beyond the flow's own `labels:` (a backfill's, a replay's copy); once a `Labels` task has run it holds the full merged list, the flow's labels included. The... |
| `backfill_id` | string (uuid), nullable | no | The backfill that fired this execution (W7f), `null` otherwise. |
| `source` | string | yes | The flow source this execution runs, frozen at start. The plan is pure over it, which is why a detail page can draw the topology from this string alone. |
| `runs` | TaskRunDto[] | yes | Every task run, in `run_ix` order — the executor's creation order. |
| `can_manage` | boolean | yes | Whether the caller may resume and replay this execution: they hold `workflow:manage` in this workspace. A detail page hides both actions when this is false; the routes still check for themselves. |
| `effective_labels` | LabelDto[] | yes | What the run sees as `labels`: the flow's, then `labels`, the later key winning. Empty when the frozen source does not parse. |

| Status | Meaning |
|---|---|
| 202 | The kill is recorded. The body is the execution afterwards: `KILLING` while a running task still has to be stopped by a worker (it then becomes `KILLED` on its own), or `KILLED` if nothing was running. Every run that was retrying, paused or... |
| 400 | `cascade` is not `true` or `false` |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough.** |
| 404 | No such execution in this workspace, indistinguishably from one that never existed |
| 409 | The execution has already ended (code `execution_terminated`). Nothing is written. |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/executions/{id}/logs`

Operation id: `get_execution_logs`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

An execution's log lines after a cursor, in `id` order.

**Lines appear about 2 seconds after they are written (the settle lag, [`crate::logs::SETTLE_LAG`]).** A page stops before the first line whose `inserted_at` is less than 2 s old, and serves nothing above it. The reason is out-of-order commits: `bigserial` ids are allocated at insert and committed later, so with two writers (two egret replicas) id 100 can commit after id 101. A client that had read 101 and moved its cursor past it would never see 100. Holding lines back until the lowest unserved one has settled lets the lower id commit first, provided a log write lasts less than half the lag (a log batch is one short `INSERT`).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Execution id |
| `after` | query | integer (int64) | no | The cursor: only lines with an `id` greater than this. Omit it for the first call, then pass the previous response's `next_after`. |
| `limit` | query | integer (int64) | no | How many lines to return, 1..=2000 (default 500). Outside that range is a 400, not a clamp. |
| `task_id` | query | string | no | Only lines of this task (the YAML's task `id`). |
| `task_run_id` | query | string (uuid) | no | Only lines of this task run. |
| `min_level` | query | LogLevel | no | Only lines at this level or above. The five names, upper case, compared case-sensitively; anything else is a 400. |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `LogPageDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `items` | LogLineDto[] | yes | In `id` order, at most `limit` of them. |
| `next_after` | integer (int64), nullable | no | The last returned `id` -- the next call's `after` -- or `null` when nothing was returned (keep the `after` you sent). |
| `execution_state` | string | yes | The execution's state (Kestra's wire spelling, `RUNNING`, `SUCCESS`, ...), read on this call. For display: **do not stop polling on a terminal state alone** -- see `complete`. |
| `complete` | boolean | yes | The execution is terminal AND became so more than the 2 s settle lag ago. **Stop polling when `complete` is true and `items` is empty**: then every stored line has been served. A terminal `execution_state` alone is not enough -- the run's... |

| Status | Meaning |
|---|---|
| 200 | Up to `limit` settled lines after `after`, in id order, with the next cursor, the execution's current state, and `complete`. Lines appear about 2 s after they are written (the settle lag guards against out-of-order commits). Stop polling on... |
| 400 | `limit` outside 1..=2000, a `min_level` that is not one of TRACE/DEBUG/INFO/WARN/ERROR, or a malformed `\{id\}`/`after`/`task_run_id` |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such execution in this workspace. **An execution belonging to another workspace answers exactly this**, indistinguishably from one that never existed. |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/executions/{id}/replay`

Operation id: `replay_execution`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough.**.

Run a finished execution again.

# It is a start, deliberately, and from the FROZEN source

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Execution id to replay |
| `workspace` | path | string | yes |  |

**Response 201 (application/json)**: `ExecutionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `flow_id` | string (uuid), nullable | no | The draft this execution came from, and `NULL` only if something outside this crate issued a real `DELETE` — **trashing a flow does not clear it**, because `FlowRepo`'s delete is soft and nothing in `egret-workflow/src` issues a `DELETE... |
| `namespace` | string | yes |  |
| `flow_key` | string | yes | The YAML's own `id`; `flow_id` is taken by the draft's uuid above. |
| `state` | string | yes | Kestra's wire spelling — `RUNNING`, `SUCCESS`, `FAILED`, … |
| `history` | string[] | yes | The state timeline, as stored: an array of state NAMES, e.g. `["CREATED","RUNNING","SUCCESS"]`. It carries no timestamps — see [`TaskRunDto::history`], which is written by the same function. |
| `inputs` | object | yes |  |
| `seq` | integer (int64) | yes |  |
| `execution_trigger` | object, nullable | no | The trigger record, `NULL` for an API start. |
| `trigger_execution_id` | string (uuid), nullable | no |  |
| `trigger_run_ix` | integer (int32), nullable | no |  |
| `parent_execution_id` | string (uuid), nullable | no |  |
| `parent_run_ix` | integer (int32), nullable | no |  |
| `loop_index` | integer (int32), nullable | no |  |
| `loop_value` | string, nullable | no |  |
| `attempt_number` | integer (int32) | yes |  |
| `origin_offset_ms` | integer (int64) | yes |  |
| `replayed_from_execution_id` | string (uuid), nullable | no | The execution this one is a manual replay of (`POST …/replay`), `NULL` for every other start. A `CREATE_NEW_EXECUTION` retry is NOT linked here; it carries `parent_execution_id` instead. |
| `started_at` | string (date-time), nullable | no | The first time the execution entered `RUNNING`. `NULL` before it runs, for one that never ran (an SLA that cancelled it at creation), and for an execution recorded before these times existed — a UI shows that last case as estimated, never... |
| `ended_at` | string (date-time), nullable | no | When the execution entered a terminal state; `NULL` while it has not (a paused execution has none), and for an execution recorded before these times existed. Written once: later writes to a finished execution do not move it. |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `labels` | LabelDto[], nullable | no | The execution's own label column; `null` for none. At start it holds the labels beyond the flow's own `labels:` (a backfill's, a replay's copy); once a `Labels` task has run it holds the full merged list, the flow's labels included. The... |
| `backfill_id` | string (uuid), nullable | no | The backfill that fired this execution (W7f), `null` otherwise. |
| `source` | string | yes | The flow source this execution runs, frozen at start. The plan is pure over it, which is why a detail page can draw the topology from this string alone. |
| `runs` | TaskRunDto[] | yes | Every task run, in `run_ix` order — the executor's creation order. |
| `can_manage` | boolean | yes | Whether the caller may resume and replay this execution: they hold `workflow:manage` in this workspace. A detail page hides both actions when this is false; the routes still check for themselves. |
| `effective_labels` | LabelDto[] | yes | What the run sees as `labels`: the flow's, then `labels`, the later key winning. Empty when the frozen source does not parse. |

| Status | Meaning |
|---|---|
| 201 | A NEW execution, started from the replayed one's frozen source and inputs. The body is the new execution, not the old one — read its `id`. |
| 400 | The execution is a **loop iteration** (replay its loop root instead); or the **flow's current draft** does not parse, so whether it is disabled cannot be decided; or the replayed execution's frozen source no longer plans, or uses a task... |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough.** |
| 404 | No such execution in this workspace, indistinguishably from one that never existed — **or its flow is in the trash, or no longer exists at all**. A replay is a run of the flow and answers to the flow's current state. |
| 409 | The execution has not finished, **or its flow is disabled** (by the `state` column or by its own YAML's `disabled: true`). A replay of something still running would put two copies of one flow in flight at once. |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/executions/{id}/resume`

Operation id: `resume_execution`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough.**.

Resume a `PAUSED` execution by hand.

W7b Task 3 fix round 1, the user's ruling of 2026-10-11, after review found the old route released nothing a human needs: it only re-settled, which ends a pause whose deadline had passed -- what the waker does anyway. It now calls [`worker::resume_by_hand`](crate::worker::resume_by_hand), Kestra's `ExecutionService.resume`: every paused `Pause` run ends `SUCCESS` now, through the natural end's own path, and the execution settles on.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Execution id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `ExecutionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `flow_id` | string (uuid), nullable | no | The draft this execution came from, and `NULL` only if something outside this crate issued a real `DELETE` — **trashing a flow does not clear it**, because `FlowRepo`'s delete is soft and nothing in `egret-workflow/src` issues a `DELETE... |
| `namespace` | string | yes |  |
| `flow_key` | string | yes | The YAML's own `id`; `flow_id` is taken by the draft's uuid above. |
| `state` | string | yes | Kestra's wire spelling — `RUNNING`, `SUCCESS`, `FAILED`, … |
| `history` | string[] | yes | The state timeline, as stored: an array of state NAMES, e.g. `["CREATED","RUNNING","SUCCESS"]`. It carries no timestamps — see [`TaskRunDto::history`], which is written by the same function. |
| `inputs` | object | yes |  |
| `seq` | integer (int64) | yes |  |
| `execution_trigger` | object, nullable | no | The trigger record, `NULL` for an API start. |
| `trigger_execution_id` | string (uuid), nullable | no |  |
| `trigger_run_ix` | integer (int32), nullable | no |  |
| `parent_execution_id` | string (uuid), nullable | no |  |
| `parent_run_ix` | integer (int32), nullable | no |  |
| `loop_index` | integer (int32), nullable | no |  |
| `loop_value` | string, nullable | no |  |
| `attempt_number` | integer (int32) | yes |  |
| `origin_offset_ms` | integer (int64) | yes |  |
| `replayed_from_execution_id` | string (uuid), nullable | no | The execution this one is a manual replay of (`POST …/replay`), `NULL` for every other start. A `CREATE_NEW_EXECUTION` retry is NOT linked here; it carries `parent_execution_id` instead. |
| `started_at` | string (date-time), nullable | no | The first time the execution entered `RUNNING`. `NULL` before it runs, for one that never ran (an SLA that cancelled it at creation), and for an execution recorded before these times existed — a UI shows that last case as estimated, never... |
| `ended_at` | string (date-time), nullable | no | When the execution entered a terminal state; `NULL` while it has not (a paused execution has none), and for an execution recorded before these times existed. Written once: later writes to a finished execution do not move it. |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `labels` | LabelDto[], nullable | no | The execution's own label column; `null` for none. At start it holds the labels beyond the flow's own `labels:` (a backfill's, a replay's copy); once a `Labels` task has run it holds the full merged list, the flow's labels included. The... |
| `backfill_id` | string (uuid), nullable | no | The backfill that fired this execution (W7f), `null` otherwise. |
| `source` | string | yes | The flow source this execution runs, frozen at start. The plan is pure over it, which is why a detail page can draw the topology from this string alone. |
| `runs` | TaskRunDto[] | yes | Every task run, in `run_ix` order — the executor's creation order. |
| `can_manage` | boolean | yes | Whether the caller may resume and replay this execution: they hold `workflow:manage` in this workspace. A detail page hides both actions when this is false; the routes still check for themselves. |
| `effective_labels` | LabelDto[] | yes | What the run sees as `labels`: the flow's, then `labels`, the later key winning. Empty when the frozen source does not parse. |

| Status | Meaning |
|---|---|
| 200 | Every paused `Pause` run was released at once and ends `SUCCESS`, whatever its `pauseDuration:` or `timeout:` (Kestra: a pause resumed by hand always succeeds); the execution then runs on. The body is its detail afterwards. |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough.** |
| 404 | No such execution in this workspace, indistinguishably from one that never existed |
| 409 | The execution is not PAUSED (or its pause ended before the resume took the execution's lock), or it is PAUSED only because a `LoopUntil` waits for its next iteration and no `Pause` task is waiting. A resume that changes nothing must not... |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/flows`

Operation id: `list_flows`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `folder_id` | query | string (uuid) | no | List only flows in this folder |
| `namespace` | query | string | no | List only flows in this namespace |
| `state` | query | string | no | List only flows in this state (draft, live, disabled) |

**Response 200 (application/json)**: array of `FlowListItemDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `namespace` | string | yes |  |
| `flow_id` | string | yes |  |
| `state` | string | yes |  |
| `live_version_id` | string (uuid), nullable | no |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_by_name` | string, nullable | no | The creator's display name: the profile name, else the email. Null when `created_by` is null or the user no longer exists (W7a spec §7.4). |
| `latest_version` | integer (int32), nullable | no | The flow's highest version number; null when it has none. Versions are snapshots to compare and restore: executions run the saved draft (W7a spec §4, §5.3). |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Flow drafts in the workspace, newest first |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/flows`

Operation id: `create_flow`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace, or the flow calls secret() and the caller lacks workflow:use_secrets.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `CreateFlowRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | string | yes | The flow's YAML, byte for byte. `namespace`/`flow_id` are DERIVED from it (parsed, never accepted as separate body fields) so the stored identity can never disagree with what the YAML itself declares. |
| `folder_id` | string (uuid), nullable | no |  |

**Response 201 (application/json)**: `FlowDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `namespace` | string | yes |  |
| `flow_id` | string | yes |  |
| `source` | string | yes |  |
| `plan` | object | yes |  |
| `state` | string | yes |  |
| `live_version_id` | string (uuid), nullable | no |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_by_name` | string, nullable | no | The creator's display name: the profile name, else the email. Null when `created_by` is null or the user no longer exists (W7a spec §7.4). |
| `latest_version` | integer (int32), nullable | no | The flow's highest version number; null when it has none. Versions are snapshots to compare and restore: executions run the saved draft (W7a spec §4, §5.3). |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `validation` | ValidationReportDto | yes | A flow's validation report, over the wire. Errors block publish; warnings do not — see [`ValidationReport`]'s own doc comment. |
| `can_manage` | boolean | yes | Whether the caller may save, publish, run and delete this flow: they hold `workflow:manage` in this workspace. An editor opens read-only when this is false; every mutating route still checks for itself. |

| Status | Meaning |
|---|---|
| 201 | Draft created, with its validation report |
| 400 | The YAML does not parse |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace, or the flow calls secret() and the caller lacks workflow:use_secrets |
| 409 | A flow with this namespace and id already exists in the workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/flows/graph`

Operation id: `graph_unsaved_flow`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `subflows` | query | string[] | no | Uids of `Subflow` nodes to expand in place, repeated (`subflows=a&subflows=b`). A uid inside an expansion is `\{subflow_uid\}/\{child_uid\}`; a uid that names no `Subflow` node is ignored |

**Request body (application/json)**: `FlowGraphRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | string | yes |  |

**Response 200 (application/json)**: `FlowGraph`

| Field | Type | Required | Description |
|---|---|---|---|
| `nodes` | Node[] | yes |  |
| `edges` | Edge[] | yes |  |
| `clusters` | Cluster[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The topology of the unsaved YAML. A flow that parses but fails validation still gets its graph; its refused tasks carry `refusal`. Nothing is written |
| 400 | The YAML does not parse; the message carries the line and column |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 422 | The graph, counted after expansion, has more than 5,000 nodes; the message names the count |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/flows/validate`

Operation id: `validate_unsaved_flow`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Request body (application/json)**: `ValidateFlowRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | string | yes |  |

**Response 200 (application/json)**: `ValidationReportDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `errors` | FindingDto[] | yes |  |
| `warnings` | FindingDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The validation report of a source that belongs to no saved flow yet (the create page). The same report `POST /flows/\{id\}/validate` gives for the same source; nothing is written |
| 400 | The YAML does not parse; the message carries the line and column |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/flows/{id}`

Operation id: `get_flow`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `FlowDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `namespace` | string | yes |  |
| `flow_id` | string | yes |  |
| `source` | string | yes |  |
| `plan` | object | yes |  |
| `state` | string | yes |  |
| `live_version_id` | string (uuid), nullable | no |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_by_name` | string, nullable | no | The creator's display name: the profile name, else the email. Null when `created_by` is null or the user no longer exists (W7a spec §7.4). |
| `latest_version` | integer (int32), nullable | no | The flow's highest version number; null when it has none. Versions are snapshots to compare and restore: executions run the saved draft (W7a spec §4, §5.3). |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `validation` | ValidationReportDto | yes | A flow's validation report, over the wire. Errors block publish; warnings do not — see [`ValidationReport`]'s own doc comment. |
| `can_manage` | boolean | yes | Whether the caller may save, publish, run and delete this flow: they hold `workflow:manage` in this workspace. An editor opens read-only when this is false; every mutating route still checks for itself. |

| Status | Meaning |
|---|---|
| 200 | The draft, with its validation report |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such flow in this workspace |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/workflows/flows/{id}`

Operation id: `update_flow`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace, or the flow calls secret() and the caller lacks workflow:use_secrets.

Replace a flow's draft.

With `if_updated_at`, the save happens only if the draft is still the one the editor opened; otherwise it is refused with 409 and nothing is written. Saving and publishing both move `updated_at`, so after a publish the editor reads the draft again before saving.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `UpdateFlowRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | string | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `if_updated_at` | string (date-time), nullable | no | The draft's `updated_at` as the editor last read it (RFC 3339, the exact string `FlowDto.updated_at` carried -- microseconds included). When present and no longer the row's, the save is refused with 409 and nothing is written; absent, the... |

**Response 200 (application/json)**: `FlowDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `folder_id` | string (uuid), nullable | no |  |
| `namespace` | string | yes |  |
| `flow_id` | string | yes |  |
| `source` | string | yes |  |
| `plan` | object | yes |  |
| `state` | string | yes |  |
| `live_version_id` | string (uuid), nullable | no |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_by_name` | string, nullable | no | The creator's display name: the profile name, else the email. Null when `created_by` is null or the user no longer exists (W7a spec §7.4). |
| `latest_version` | integer (int32), nullable | no | The flow's highest version number; null when it has none. Versions are snapshots to compare and restore: executions run the saved draft (W7a spec §4, §5.3). |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `validation` | ValidationReportDto | yes | A flow's validation report, over the wire. Errors block publish; warnings do not — see [`ValidationReport`]'s own doc comment. |
| `can_manage` | boolean | yes | Whether the caller may save, publish, run and delete this flow: they hold `workflow:manage` in this workspace. An editor opens read-only when this is false; every mutating route still checks for itself. |

| Status | Meaning |
|---|---|
| 200 | Draft updated, with its validation report |
| 400 | The YAML does not parse |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace, or the flow calls secret() and the caller lacks workflow:use_secrets |
| 404 | No such flow in this workspace |
| 409 | Another flow already claims this namespace and id in the workspace, or `if_updated_at` was sent and the draft was changed since (`code` is `draft_changed`; the other conflict carries no code); nothing was written |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/workflows/flows/{id}`

Operation id: `delete_flow`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Draft soft-deleted |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 404 | No such flow in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/flows/{id}/executions`

Operation id: `start_flow_execution`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough** — starting an execution is a write..

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `StartExecutionRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `inputs` | object | no | The flow's `inputs:`, as a JSON **object**. |

**Response 201 (application/json)**: `ExecutionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `flow_id` | string (uuid), nullable | no | The draft this execution came from, and `NULL` only if something outside this crate issued a real `DELETE` — **trashing a flow does not clear it**, because `FlowRepo`'s delete is soft and nothing in `egret-workflow/src` issues a `DELETE... |
| `namespace` | string | yes |  |
| `flow_key` | string | yes | The YAML's own `id`; `flow_id` is taken by the draft's uuid above. |
| `state` | string | yes | Kestra's wire spelling — `RUNNING`, `SUCCESS`, `FAILED`, … |
| `history` | string[] | yes | The state timeline, as stored: an array of state NAMES, e.g. `["CREATED","RUNNING","SUCCESS"]`. It carries no timestamps — see [`TaskRunDto::history`], which is written by the same function. |
| `inputs` | object | yes |  |
| `seq` | integer (int64) | yes |  |
| `execution_trigger` | object, nullable | no | The trigger record, `NULL` for an API start. |
| `trigger_execution_id` | string (uuid), nullable | no |  |
| `trigger_run_ix` | integer (int32), nullable | no |  |
| `parent_execution_id` | string (uuid), nullable | no |  |
| `parent_run_ix` | integer (int32), nullable | no |  |
| `loop_index` | integer (int32), nullable | no |  |
| `loop_value` | string, nullable | no |  |
| `attempt_number` | integer (int32) | yes |  |
| `origin_offset_ms` | integer (int64) | yes |  |
| `replayed_from_execution_id` | string (uuid), nullable | no | The execution this one is a manual replay of (`POST …/replay`), `NULL` for every other start. A `CREATE_NEW_EXECUTION` retry is NOT linked here; it carries `parent_execution_id` instead. |
| `started_at` | string (date-time), nullable | no | The first time the execution entered `RUNNING`. `NULL` before it runs, for one that never ran (an SLA that cancelled it at creation), and for an execution recorded before these times existed — a UI shows that last case as estimated, never... |
| `ended_at` | string (date-time), nullable | no | When the execution entered a terminal state; `NULL` while it has not (a paused execution has none), and for an execution recorded before these times existed. Written once: later writes to a finished execution do not move it. |
| `created_at` | string (date-time) | yes |  |
| `updated_at` | string (date-time) | yes |  |
| `labels` | LabelDto[], nullable | no | The execution's own label column; `null` for none. At start it holds the labels beyond the flow's own `labels:` (a backfill's, a replay's copy); once a `Labels` task has run it holds the full merged list, the flow's labels included. The... |
| `backfill_id` | string (uuid), nullable | no | The backfill that fired this execution (W7f), `null` otherwise. |
| `source` | string | yes | The flow source this execution runs, frozen at start. The plan is pure over it, which is why a detail page can draw the topology from this string alone. |
| `runs` | TaskRunDto[] | yes | Every task run, in `run_ix` order — the executor's creation order. |
| `can_manage` | boolean | yes | Whether the caller may resume and replay this execution: they hold `workflow:manage` in this workspace. A detail page hides both actions when this is false; the routes still check for themselves. |
| `effective_labels` | LabelDto[] | yes | What the run sees as `labels`: the flow's, then `labels`, the later key winning. Empty when the frozen source does not parse. |

| Status | Meaning |
|---|---|
| 201 | The execution was created and driven as far as it goes without a worker; the body is its detail, read back after the start committed. Its uploaded files and its row were committed in one transaction. |
| 400 | `inputs` is not a JSON object; the flow's stored source does not parse or plan, or uses a task type this deployment does not serve; a `FILE` input's value is not a readable `kestra://` URI or its extension is not allowed; a multipart part... |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough** — starting an execution is a write. |
| 404 | No such flow in this workspace, or it is in the trash. **A flow belonging to another workspace answers exactly this**, indistinguishably from one that never existed. |
| 409 | The flow is disabled — by its `state` column or by its own YAML's `disabled: true` |
| 413 | An uploaded file is over `workflow.storage.max_file_bytes` (the message names the input and the cap), a text part is over 1 MiB, or the JSON body is over 2 MiB. Nothing is created. |
| 415 | A `Content-Type` that is neither `application/json` nor `multipart/form-data`. A request with no `Content-Type` is read as JSON (an empty body is `\{\}`). |
| 500 | Internal error |
| 503 | Internal storage failed while an uploaded file was being stored. Nothing is created; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/flows/{id}/graph`

Operation id: `get_flow_graph`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `version` | query | integer (int32) | no | Draw this published version's frozen source instead of the draft |
| `subflows` | query | string[] | no | Uids of `Subflow` nodes to expand in place, repeated (`subflows=a&subflows=b`). A uid inside an expansion is `\{subflow_uid\}/\{child_uid\}`; a uid that names no `Subflow` node is ignored |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `FlowGraph`

| Field | Type | Required | Description |
|---|---|---|---|
| `nodes` | Node[] | yes |  |
| `edges` | Edge[] | yes |  |
| `clusters` | Cluster[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The topology of the draft, or of the version |
| 400 | `version` is not an integer |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such flow, or no such version of it, in this workspace |
| 422 | The graph, counted after expansion, has more than 5,000 nodes; the message names the count |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/flows/{id}/publish`

Operation id: `publish_flow`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace, or the flow calls secret() and the caller lacks workflow:use_secrets.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `PublishFlowRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `note` | string | no |  |

**Response 200 (application/json)**: `FlowVersionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `flow_id` | string (uuid) | yes |  |
| `version` | integer (int32) | yes |  |
| `snapshot` | object | yes |  |
| `note` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_by_name` | string, nullable | no | The publisher's display name: the profile name, else the email. Null when `created_by` is null or the user no longer exists (W7a spec §7.4). |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | A new immutable version was frozen and is now live |
| 400 | The draft does not parse or validate, a task names an unknown type or a type this deployment does not serve (`task_type_not_served`), or a script task is refused by the container gate (workflow_containers off, no or empty allowed-images for... |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace, or the flow calls secret() and the caller lacks workflow:use_secrets |
| 404 | No such flow in this workspace, or a task references an object that does not exist or belongs to another workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/flows/{id}/triggers`

Operation id: `list_flow_triggers`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `FlowTriggersDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `flow_disabled` | boolean | yes | The flow's YAML says `disabled: true`, or its `state` is `disabled`. |
| `flow_deleted` | boolean | yes | The flow is in the trash: every trigger is effective-disabled. |
| `scheduler_enabled` | boolean | yes | This deployment runs the schedule loop. |
| `worker_enabled` | boolean | yes | This deployment runs the worker (and the Flow-trigger processor). |
| `webhooks_enabled` | boolean | yes | This deployment serves webhooks. |
| `triggers` | TriggerEntryDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Every trigger the flow's saved draft declares, in declaration order, with its runtime switch, its schedule or listener state, its webhook path and its last execution. A trashed flow answers too, with `flow_deleted: true`. |
| 400 | The flow's saved source does not parse, so its triggers are unknown |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such flow in this workspace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/flows/{id}/triggers/{trigger_id}/backfill`

Operation id: `create_trigger_backfill`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `trigger_id` | path | string | yes | The trigger's `id` in the flow's YAML |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `CreateBackfillRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `start` | string (date-time) | yes | The window's first instant (inclusive): the first tick at or after it fires first. |
| `end` | string (date-time), nullable | no | The window's last instant (inclusive); absent: the server's now. Must not be after the server's now. |
| `inputs` | object, nullable | no | Overlaid on the schedule's `inputs:` key by key. An object; no key may name a `FILE` input. |
| `labels` | LabelDto[] | no | Added to every execution the backfill fires, in this order. A list of `\{key, value\}` or a map. |

**Response 201 (application/json)**: `TriggerEntryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `trigger_id` | string | yes |  |
| `type` | string | yes | The YAML's `type`, in full. |
| `kind` | TriggerKindDto | yes | What a trigger is, as egret runs it: one of the three kinds it fires, or `other` (a `Leaf`: any other type, which egret never fires). |
| `yaml_disabled` | boolean | yes | The flow's or the trigger's YAML says `disabled: true`. |
| `runtime_disabled` | boolean | yes | Switched off at runtime (`workflow.disabled_triggers`). |
| `disabled_by` | string (uuid), nullable | no |  |
| `disabled_by_name` | string, nullable | no | The switcher's display name. |
| `disabled_at` | string (date-time), nullable | no |  |
| `effective_disabled` | boolean | yes | What the scheduler, the listener and the webhook route honour: the YAML (flow or trigger), the runtime switch, the flow's `state` being `disabled`, or the flow being in the trash. |
| `can_toggle` | boolean | yes | Whether the UI's switch is enabled. It is disabled for a trigger the YAML disables (`toggle_refusal: yaml_disabled`), but the switch route still accepts switching such a trigger OFF; only switching it ON is refused there (409... |
| `toggle_refusal` | ToggleRefusal | no |  |
| `duplicate_id` | boolean | yes | The flow declares this trigger id more than once (a save-time error, `duplicate_trigger_id`); the state is the id's. |
| `schedule` | ScheduleInfoDto | no |  |
| `flow` | FlowTriggerInfoDto | no |  |
| `webhook` | WebhookInfoDto | no |  |
| `last_execution` | LastExecutionDto | no |  |
| `backfill` | BackfillDto | no |  |
| `can_backfill` | boolean | yes | Whether the Backfill button is usable; the create route checks for itself. |
| `backfill_refusal` | CannotBackfill | no |  |

| Status | Meaning |
|---|---|
| 201 | Created. The window `[start, end]` is inclusive at both ends; the trigger's next date moves to the window's first tick, so the scheduler fires the window one tick per pass, then resumes the regular schedule from where it stood under its... |
| 400 | `code: source_does_not_parse`, `invalid_body`, `backfill_window_invalid` (start not before end), `backfill_end_in_future` (the message gives the server's time), `backfill_start_too_early` (more than ten years back), `backfill_no_ticks`,... |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 404 | No such flow in this workspace, the flow is in the trash, or its source declares no trigger with this id (`code: not_found`) |
| 409 | `code: backfill_not_supported` (not a Schedule), `trigger_disabled` (the trigger is effective-disabled), `trigger_off_queue` (the schedule has no next date; the message gives why) or `backfill_exists` |
| 413 | The body is over 64 KiB (`code: body_too_large`) |
| 500 | Internal error |

## DELETE `/api/ws/{workspace}/workflows/flows/{id}/triggers/{trigger_id}/backfill`

Operation id: `delete_trigger_backfill`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `trigger_id` | path | string | yes | The trigger's `id` in the flow's YAML |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `TriggerEntryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `trigger_id` | string | yes |  |
| `type` | string | yes | The YAML's `type`, in full. |
| `kind` | TriggerKindDto | yes | What a trigger is, as egret runs it: one of the three kinds it fires, or `other` (a `Leaf`: any other type, which egret never fires). |
| `yaml_disabled` | boolean | yes | The flow's or the trigger's YAML says `disabled: true`. |
| `runtime_disabled` | boolean | yes | Switched off at runtime (`workflow.disabled_triggers`). |
| `disabled_by` | string (uuid), nullable | no |  |
| `disabled_by_name` | string, nullable | no | The switcher's display name. |
| `disabled_at` | string (date-time), nullable | no |  |
| `effective_disabled` | boolean | yes | What the scheduler, the listener and the webhook route honour: the YAML (flow or trigger), the runtime switch, the flow's `state` being `disabled`, or the flow being in the trash. |
| `can_toggle` | boolean | yes | Whether the UI's switch is enabled. It is disabled for a trigger the YAML disables (`toggle_refusal: yaml_disabled`), but the switch route still accepts switching such a trigger OFF; only switching it ON is refused there (409... |
| `toggle_refusal` | ToggleRefusal | no |  |
| `duplicate_id` | boolean | yes | The flow declares this trigger id more than once (a save-time error, `duplicate_trigger_id`); the state is the id's. |
| `schedule` | ScheduleInfoDto | no |  |
| `flow` | FlowTriggerInfoDto | no |  |
| `webhook` | WebhookInfoDto | no |  |
| `last_execution` | LastExecutionDto | no |  |
| `backfill` | BackfillDto | no |  |
| `can_backfill` | boolean | yes | Whether the Backfill button is usable; the create route checks for itself. |
| `backfill_refusal` | CannotBackfill | no |  |

| Status | Meaning |
|---|---|
| 200 | Deleted. The ticks not yet fired are dropped; the executions already fired stay. The regular schedule resumes from the later of where it stood at create and the backfill's next tick, under its `recoverMissedSchedules` (absent: ALL); a... |
| 400 | `code: source_does_not_parse` |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 404 | `code: not_found` (no such flow or trigger) or `no_backfill` |
| 409 | `code: backfill_not_supported` (not a Schedule) |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/workflows/flows/{id}/triggers/{trigger_id}/backfill/paused`

Operation id: `set_trigger_backfill_paused`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `trigger_id` | path | string | yes | The trigger's `id` in the flow's YAML |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetBackfillPausedRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `paused` | boolean | yes |  |

**Response 200 (application/json)**: `TriggerEntryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `trigger_id` | string | yes |  |
| `type` | string | yes | The YAML's `type`, in full. |
| `kind` | TriggerKindDto | yes | What a trigger is, as egret runs it: one of the three kinds it fires, or `other` (a `Leaf`: any other type, which egret never fires). |
| `yaml_disabled` | boolean | yes | The flow's or the trigger's YAML says `disabled: true`. |
| `runtime_disabled` | boolean | yes | Switched off at runtime (`workflow.disabled_triggers`). |
| `disabled_by` | string (uuid), nullable | no |  |
| `disabled_by_name` | string, nullable | no | The switcher's display name. |
| `disabled_at` | string (date-time), nullable | no |  |
| `effective_disabled` | boolean | yes | What the scheduler, the listener and the webhook route honour: the YAML (flow or trigger), the runtime switch, the flow's `state` being `disabled`, or the flow being in the trash. |
| `can_toggle` | boolean | yes | Whether the UI's switch is enabled. It is disabled for a trigger the YAML disables (`toggle_refusal: yaml_disabled`), but the switch route still accepts switching such a trigger OFF; only switching it ON is refused there (409... |
| `toggle_refusal` | ToggleRefusal | no |  |
| `duplicate_id` | boolean | yes | The flow declares this trigger id more than once (a save-time error, `duplicate_trigger_id`); the state is the id's. |
| `schedule` | ScheduleInfoDto | no |  |
| `flow` | FlowTriggerInfoDto | no |  |
| `webhook` | WebhookInfoDto | no |  |
| `last_execution` | LastExecutionDto | no |  |
| `backfill` | BackfillDto | no |  |
| `can_backfill` | boolean | yes | Whether the Backfill button is usable; the create route checks for itself. |
| `backfill_refusal` | CannotBackfill | no |  |

| Status | Meaning |
|---|---|
| 200 | Paused or resumed (idempotent: already in that state is a 200 with no write and no audit event). Only the backfill row is written: a paused backfill is not fired, and a resumed one fires its next tick on the next pass. A switched-off... |
| 400 | `code: source_does_not_parse` or `invalid_body` |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 404 | `code: not_found` (no such flow or trigger) or `no_backfill` |
| 409 | `code: backfill_not_supported` (not a Schedule) |
| 413 | The body is over 64 KiB (`code: body_too_large`) |
| 500 | Internal error |

## PUT `/api/ws/{workspace}/workflows/flows/{id}/triggers/{trigger_id}/disabled`

Operation id: `set_trigger_disabled`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `trigger_id` | path | string | yes | The trigger's `id` in the flow's YAML |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetTriggerDisabledRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `disabled` | boolean | yes | `true`: off; `false`: on. |
| `recover_missed` | boolean | no | On a re-enable of a switched-off, overdue `Schedule` only (an already-on trigger keeps its dates): `false` (the default) skips the missed ticks (the next date becomes the first tick after now); `true` follows the trigger's... |

**Response 200 (application/json)**: `TriggerEntryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `trigger_id` | string | yes |  |
| `type` | string | yes | The YAML's `type`, in full. |
| `kind` | TriggerKindDto | yes | What a trigger is, as egret runs it: one of the three kinds it fires, or `other` (a `Leaf`: any other type, which egret never fires). |
| `yaml_disabled` | boolean | yes | The flow's or the trigger's YAML says `disabled: true`. |
| `runtime_disabled` | boolean | yes | Switched off at runtime (`workflow.disabled_triggers`). |
| `disabled_by` | string (uuid), nullable | no |  |
| `disabled_by_name` | string, nullable | no | The switcher's display name. |
| `disabled_at` | string (date-time), nullable | no |  |
| `effective_disabled` | boolean | yes | What the scheduler, the listener and the webhook route honour: the YAML (flow or trigger), the runtime switch, the flow's `state` being `disabled`, or the flow being in the trash. |
| `can_toggle` | boolean | yes | Whether the UI's switch is enabled. It is disabled for a trigger the YAML disables (`toggle_refusal: yaml_disabled`), but the switch route still accepts switching such a trigger OFF; only switching it ON is refused there (409... |
| `toggle_refusal` | ToggleRefusal | no |  |
| `duplicate_id` | boolean | yes | The flow declares this trigger id more than once (a save-time error, `duplicate_trigger_id`); the state is the id's. |
| `schedule` | ScheduleInfoDto | no |  |
| `flow` | FlowTriggerInfoDto | no |  |
| `webhook` | WebhookInfoDto | no |  |
| `last_execution` | LastExecutionDto | no |  |
| `backfill` | BackfillDto | no |  |
| `can_backfill` | boolean | yes | Whether the Backfill button is usable; the create route checks for itself. |
| `backfill_refusal` | CannotBackfill | no |  |

| Status | Meaning |
|---|---|
| 200 | Switched (idempotent: off twice, or on with no switch, is a 200). The answer is the trigger's entry as `GET .../triggers` returns it. Off stops the trigger's schedule claim, Flow-trigger listener and webhook; a fire already claimed commits... |
| 400 | The flow's saved source does not parse (`code: source_does_not_parse`), or the body is not a switch request: bad JSON, a missing or mistyped field, or no JSON content type (`code: invalid_body`) |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 404 | No such flow in this workspace, the flow is in the trash, or its source declares no trigger with this id (`code: not_found`) |
| 409 | `code: trigger_disabled_in_source` (switching on a trigger whose flow or trigger YAML says `disabled: true`; switching it off is accepted), `trigger_not_supported` (a trigger type egret does not run), or `recover_missed_unknown`... |
| 413 | The body is over 2 MiB (`code: body_too_large`) |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/flows/{id}/validate`

Operation id: `validate_flow`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id — scopes the request to this workspace, but the YAML checked is the request body, not the stored draft |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `ValidateFlowRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | string | yes |  |

**Response 200 (application/json)**: `ValidationReportDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `errors` | FindingDto[] | yes |  |
| `warnings` | FindingDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The validation report — never blocks on errors, since this route is called on unsaved edits |
| 400 | The YAML does not parse |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 404 | No such flow in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/flows/{id}/versions`

Operation id: `list_flow_versions`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `FlowVersionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `flow_id` | string (uuid) | yes |  |
| `version` | integer (int32) | yes |  |
| `snapshot` | object | yes |  |
| `note` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_by_name` | string, nullable | no | The publisher's display name: the profile name, else the email. Null when `created_by` is null or the user no longer exists (W7a spec §7.4). |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Published versions, newest first |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such flow in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/flows/{id}/versions/{version}`

Operation id: `get_flow_version`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `id` | path | string (uuid) | yes | Flow id |
| `version` | path | integer (int32) | yes | Version number |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `FlowVersionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `flow_id` | string (uuid) | yes |  |
| `version` | integer (int32) | yes |  |
| `snapshot` | object | yes |  |
| `note` | string | yes |  |
| `created_by` | string (uuid), nullable | no |  |
| `created_by_name` | string, nullable | no | The publisher's display name: the profile name, else the email. Null when `created_by` is null or the user no longer exists (W7a spec §7.4). |
| `created_at` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | One published version's frozen snapshot |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such flow, or no such version of it, in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/namespaces`

Operation id: `list_namespaces`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `prefix` | query | string | no | Only this namespace and the ones beneath it, dot-anchored: `company` matches `company` and `company.team`, never `companyx`. Empty means no filter. |

**Response 200 (application/json)**: array of `WorkflowNamespaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `namespace` | string | yes |  |
| `flows` | integer (int64) | yes | Flows in exactly this namespace that are not deleted. |
| `files` | integer (int64) | yes | Live namespace files (a path whose latest revision is not deleted; several revisions of one path are one file; directories are not counted). |
| `kv_keys` | integer (int64) | yes | Live KV keys (the latest revision neither deleted nor expired). |
| `own` | boolean | yes | False when the namespace is present only as a parent by dots of another (its counts are then all zero). True for a source, whose counts can all be zero when it holds only a live empty directory. |

| Status | Meaning |
|---|---|
| 200 | The workspace's namespaces, from flows that are not deleted, live namespace files and live KV keys, plus every parent by dots (`own: false`); a namespace holding only a live directory is listed (`own: true`, `files: 0`); sorted by namespace... |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}`

Operation id: `get_namespace`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `WorkflowNamespaceDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `namespace` | string | yes |  |
| `flows` | integer (int64) | yes | Flows in exactly this namespace that are not deleted. |
| `files` | integer (int64) | yes | Live namespace files (directories are not counted). |
| `kv_keys` | integer (int64) | yes | Live KV keys (the latest revision neither deleted nor expired). |
| `own` | boolean | yes | False when the namespace is present only as a parent by dots of another. |
| `can_manage` | boolean | yes | The caller holds `workflow:manage` in this workspace: the same PDP decision as the namespace file and KV write routes, which still check for themselves. The UI disables its writes when this is false. |

| Status | Meaning |
|---|---|
| 200 | The namespace's own counts; `own: false` when it is only a parent by dots of another; `can_manage` whether the caller holds workflow:manage |
| 400 | Not a valid namespace name (`^[a-z0-9][a-z0-9._-]*`, 1-150 characters) |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | Nothing lives in this namespace or beneath it in this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/dependencies`

Operation id: `namespace_dependencies`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace; its children (dot-anchored) are inside it |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `NamespaceDependenciesDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `nodes` | NamespaceDependencyNodeDto[] | yes | The namespace's flows and its children's, then every flow elsewhere with a direct edge to or from one of them; by namespace, then flow id. |
| `edges` | NamespaceDependencyEdgeDto[] | yes | Edges with at least one end in the namespace; one per (source, target, kind). |
| `unparsable` | integer (int64) | yes | Drafts in the WORKSPACE (not only this namespace) whose YAML does not parse. Each is still a node (`unparsable: true`) when it is in the namespace or an edge reaches it, but its own edges are unknown. |

| Status | Meaning |
|---|---|
| 200 | The flow-to-flow graph of the namespace, built from every flow's saved draft: `subflow` edges from `Subflow` tasks with a literal target, `flow_trigger` edges from `Flow` triggers' `dependsOn` entries naming a flow. A namespace with no... |
| 400 | Not a valid namespace name (`^[a-z0-9][a-z0-9._-]*`, 1-150 characters) |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 422 | The workspace has more than 2000 flows (not deleted), every one of which would be read (`code: dependencies_too_large`) |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/files`

Operation id: `download_namespace_file`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace; one with a `_files` segment, an empty segment or an invalid name is refused (400). A namespace with no flow can hold files. |
| `path` | query | string | yes | The file's path in the namespace (a leading `/` is added when missing). |
| `revision` | query | integer (int32) | no | A given revision, served even when the path is soft-deleted; none = the latest, which must be live. |
| `workspace` | path | string | yes |  |

**Response 200 (application/octet-stream)**: array of `integer (int32)`

| Status | Meaning |
|---|---|
| 200 | The file's bytes, streamed. `Content-Type: application/octet-stream`, `Content-Disposition: attachment` with the file's name (sanitised, and percent-encoded in `filename*`), `X-Content-Type-Options: nosniff`. |
| 400 | A path rule (named), a refused namespace, `/_flows`, or the path is a directory (named): a directory has no contents. Also a revision whose object is gone from internal storage (named; egret never falls back to another revision). |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such file in this workspace's namespace, no such revision of it, or (with no `revision`) the path is soft-deleted. A given revision of a soft-deleted path IS served. |
| 503 | Internal storage or the database is unavailable or not configured; the request can be retried. |

## POST `/api/ws/{workspace}/workflows/namespaces/{namespace}/files`

Operation id: `upload_namespace_file`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough.**.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace; it needs no flow |
| `path` | query | string | yes | The path in the namespace (a leading `/` is added when missing). |
| `if_revision` | query | integer (int32) | no | Write only if the path's current revision is this one, else 409 with `code: "file_changed"` and nothing written. The current revision is the latest LIVE one: `0` means "the path must not exist" (a path that never existed, or one... |
| `workspace` | path | string | yes |  |

**Request body (multipart/form-data)**: `NsFileUploadForm`

| Field | Type | Required | Description |
|---|---|---|---|
| `fileContent` | string (binary) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Stored, as the path's next revision. No content and no content type (Kestra's answer). |
| 400 | A path rule (named), a refused namespace, `/_flows`, no `fileContent` part or another part before it (named), a malformed multipart body, headers over the budget, or an `if_revision` that is not a whole number from 0 |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough.** |
| 408 | No byte of the body arrived for 30 seconds, or the body took longer than 12 hours in all; nothing was stored. |
| 409 | A directory is at `path`, a file is where one of its parent directories goes, or a soft-deleted entry of the other kind still holds history there (named; only a flow's `PurgeFiles` task removes history -- the API has no purge route). Also... |
| 413 | The file is over `workflow.storage.max_file_bytes`, or the body over its limit (named) |
| 415 | Not `multipart/form-data` |
| 503 | Internal storage or the database is unavailable or not configured; nothing was stored and the request can be retried. |

## PUT `/api/ws/{workspace}/workflows/namespaces/{namespace}/files`

Operation id: `move_namespace_file`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `from` | query | string | yes | The file or directory to move; it must exist. |
| `to` | query | string | yes | Where it goes; nothing may be there, not even a deleted path's history. |
| `workspace` | path | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Moved: every revision of the file (or of every path under the directory), numbers kept; the source is gone, `to`'s missing parents exist. No content and no content type (Kestra's answer). **A move runs to completion once it has started:**... |
| 400 | A path rule (named) for either path, a refused namespace, `/_flows`, or a move onto or under itself |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 404 | Nothing live at `from` in this workspace's namespace (named); nothing is written |
| 409 | `to` has any history -- a live entry, or a soft-deleted path's revisions at it, under it, of the other kind, or a file where one of its parents goes (named); nothing is moved and nothing purged (only a flow's `PurgeFiles` task removes... |
| 413 | Refused before anything is copied: `from` holds more rows -- revisions and directories -- than one move may copy (`workflow.storage.max_namespace_files`), or its revisions hold more bytes in all than one move may copy... |
| 503 | Internal storage or the database is unavailable; every copy made was rolled back and the source is untouched. |

## DELETE `/api/ws/{workspace}/workflows/namespaces/{namespace}/files`

Operation id: `delete_namespace_file`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `path` | query | string | yes | The path in the namespace (a leading `/` is added when missing). |
| `workspace` | path | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Soft-deleted: the path and, for a directory, every path under it; parents left empty stay. Revisions are kept (listed by `revisions`, served by `?revision=N`) until a flow's `PurgeFiles` removes them. A path with nothing live is not an... |
| 400 | A path rule (named), the root, a refused namespace, or `/_flows` |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 409 | The path is busy: a move or another write holds its lock for longer than the API waits (5 s); nothing was deleted, try again. |
| 503 | The database is unavailable; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/directory`

Operation id: `list_namespace_directory`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `path` | query | string | no | A path in the namespace; none (or `/`) = the namespace's root. |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `NsFileStatsDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `path` | string | yes | The stored path: a leading `/`; a directory's ends with `/`. |
| `type` | string | yes | `File` or `Directory`. |
| `size` | integer (int64) | yes | Bytes; 0 for a directory. |
| `revision` | integer (int32) | yes | The latest revision; always 1 for a directory. |
| `created` | string (date-time), nullable | no | When the latest revision was written; `null` only for the namespace's virtual root (`stats` with no `path`), which has no row. |

| Status | Meaning |
|---|---|
| 200 | The live children (files and directories) directly under the directory, in byte order; with no `path`, the namespace root's (an empty list for a namespace with no file). |
| 400 | A path rule (named), a refused namespace, `/_flows`, or the path is a FILE (named): only a directory has children. |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No live directory at `path` in this workspace's namespace |
| 413 | The directory holds more entries than one answer may hold (`workflow.storage.max_namespace_files`, named). |
| 503 | The database is unavailable; the request can be retried. |

## POST `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/directory`

Operation id: `create_namespace_directory`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace; it needs no flow |
| `path` | query | string | yes | The path in the namespace (a leading `/` is added when missing). |
| `workspace` | path | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | The directory and each missing parent exist (an existing live directory is not an error). No content and no content type (Kestra's answer). |
| 400 | A path rule (named), the root, a refused namespace, or `/_flows` |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 409 | A file is at `path` or where one of its parents goes, live or soft-deleted with its history (named; only a flow's `PurgeFiles` task removes history -- the API has no purge route). Also 409 when the path is busy: a move or another write... |
| 503 | The database is unavailable; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/export`

Operation id: `export_namespace_files`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `workspace` | path | string | yes |  |

**Response 200 (application/zip)**: array of `integer (int32)`

| Status | Meaning |
|---|---|
| 200 | A zip archive of the latest live revision of every FILE of the namespace (no directory entry, no flow, no soft-deleted file), each named by its path without the leading `/`; stored (not compressed), each file read twice (once for its CRC,... |
| 400 | A refused namespace, or a file whose path cannot be a zip entry name (its first segment looks like a Windows drive, `C:`; named) |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 413 | Refused before any byte is sent: the namespace holds more entries (files and directories) than one export may hold (`workflow.storage.max_namespace_files`, named), or its files hold more bytes in all than one export may read... |
| 503 | Internal storage or the database is unavailable or not configured; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/revisions`

Operation id: `namespace_file_revisions`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `path` | query | string | yes | The path in the namespace (a leading `/` is added when missing). |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `NsFileRevisionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `revision` | integer (int32) | yes |  |
| `deleted` | boolean | yes | The path was soft-deleted at this revision (its latest); its bytes are still served by `GET …/files?path&revision`. |
| `size` | integer (int64) | yes |  |
| `created` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Every revision of the file, ascending, a soft-deleted path's included, each flagged `deleted` when the path was deleted at it. |
| 400 | A path rule (named), a refused namespace, `/_flows`, or the path is a directory (named): a directory has no revisions. |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | The path has never held a file in this workspace's namespace (or its history was purged) |
| 503 | The database is unavailable; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/search`

Operation id: `search_namespace_files`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `q` | query | string | yes | A case-insensitive substring of a file's path; `""` finds nothing. |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `string`

| Status | Meaning |
|---|---|
| 200 | The paths of the live FILES whose path contains `q`, case-insensitively (Kestra's rule), in byte order; directories are never listed; `q=""` finds nothing. |
| 400 | No `q`, or a refused namespace |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 413 | More files match than one answer may hold (`workflow.storage.max_namespace_files`, named); narrow `q`. |
| 503 | The database is unavailable; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/files/stats`

Operation id: `namespace_file_stats`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `path` | query | string | no | A path in the namespace; none (or `/`) = the namespace's root. |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `NsFileStatsDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `path` | string | yes | The stored path: a leading `/`; a directory's ends with `/`. |
| `type` | string | yes | `File` or `Directory`. |
| `size` | integer (int64) | yes | Bytes; 0 for a directory. |
| `revision` | integer (int32) | yes | The latest revision; always 1 for a directory. |
| `created` | string (date-time), nullable | no | When the latest revision was written; `null` only for the namespace's virtual root (`stats` with no `path`), which has no row. |

| Status | Meaning |
|---|---|
| 200 | The live file or directory at `path`. With no `path` (or `/`): the namespace's virtual root, `\{path: "/", type: "Directory", size: 0, revision: 1, created: null\}` -- nothing is created, in any namespace, with or without files. |
| 400 | A path rule (named), a refused namespace, or `/_flows` |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | Nothing live at `path` in this workspace's namespace |
| 503 | The database is unavailable; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv`

Operation id: `list_kv`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace; one with a `_files` or `_kv` segment, an empty segment or an invalid name is refused (400). A namespace with no flow can hold keys; one that holds none (or that only another workspace holds) answers `[]`. |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `KvEntryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | string | yes |  |
| `type` | string | yes | `STRING`, `NUMBER`, `BOOLEAN`, `DATETIME`, `DATE`, `DURATION` or `JSON`: the type stored with the latest revision. |
| `size` | integer (int64) | yes | The stored value's size in bytes (its Ion text). |
| `description` | string, nullable | no |  |
| `expiresAt` | string (date-time), nullable | no | When the key expires; `null` never. |
| `revision` | integer (int32) | yes | The latest revision. |
| `updated` | string (date-time) | yes | When the latest revision was written. |

| Status | Meaning |
|---|---|
| 200 | The namespace's live keys (neither soft-deleted nor expired), each its latest revision, in the order their latest revisions were written. |
| 400 | A refused namespace (named) |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 413 | The namespace holds more live keys than one answer may hold (`workflow.storage.max_namespace_files`, named). |
| 503 | Internal storage is not configured, or the database is unavailable; the request can be retried. |

## DELETE `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv`

Operation id: `delete_kv_values`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `KvKeysBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `keys` | string[] | yes |  |

**Response 200 (application/json)**: `KvKeysBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `keys` | string[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | `\{"keys": [...]\}`: the keys that were live and are now soft-deleted, ascending; a key that was not live is left out. One transaction: all or nothing. |
| 400 | A malformed or missing body, a key that breaks the key rule (named; nothing is deleted), or a refused namespace |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 409 | A key is busy (named), or other bulk deletes are running, for longer than the API waits (5 s); nothing was deleted, try again. |
| 413 | More than 1,000 keys, or a body over 1 MiB (each cap is named); nothing was deleted. Send several requests. |
| 503 | Internal storage is not configured, or the database is unavailable; nothing was deleted and the request can be retried. |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv/inheritance`

Operation id: `list_inherited_kv`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace whose PARENTS are listed (cut at dots: `a.b.c` lists `a.b`, then `a`). |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `KvInheritedDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | string | yes |  |
| `type` | string | yes | `STRING`, `NUMBER`, `BOOLEAN`, `DATETIME`, `DATE`, `DURATION` or `JSON`: the type stored with the latest revision. |
| `size` | integer (int64) | yes | The stored value's size in bytes (its Ion text). |
| `description` | string, nullable | no |  |
| `expiresAt` | string (date-time), nullable | no | When the key expires; `null` never. |
| `revision` | integer (int32) | yes | The latest revision. |
| `updated` | string (date-time) | yes | When the latest revision was written. |
| `namespace` | string | yes | The ancestor namespace the key is read from. |

| Status | Meaning |
|---|---|
| 200 | The live keys of the namespace's ancestors only (not its own), deepest first; a key in two ancestors is listed once, from the deeper (Kestra's `KVController`, `:73-100`). Each entry names its namespace. **This path is also where a key named... |
| 400 | A refused namespace (named) |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 413 | The ancestors hold more live keys in all than one answer may hold (`workflow.storage.max_namespace_files`, named). |
| 503 | Internal storage is not configured, or the database is unavailable; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv/{key}`

Operation id: `get_kv_value`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `key` | path | string | yes | The key: `[a-zA-Z0-9][a-zA-Z0-9._-]*`, at most 350 bytes. `GET …/kv/inheritance` is the inheritance listing, not the key `inheritance`; that key is read here with any letter of it percent-encoded (`inheritanc%65`), since the route is... |
| `revision` | query | integer (int32) | no | A given revision, served even when the key is soft-deleted (not when it has expired); none = the latest, which must be live. |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: `KvDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | yes | The stored type (never re-inferred on read). |
| `value` | object | yes | The value: a DATETIME as `2025-01-02T03:04:05Z`, a DATE as `2025-01-02`, a DURATION as Java prints it (`PT24H`), a decimal with every digit, a JSON value as itself; any JSON type. |
| `revision` | integer (int32) | yes |  |
| `updated` | string (date-time) | yes | When this revision was written. |
| `description` | string, nullable | no |  |
| `expiresAt` | string (date-time), nullable | no |  |

| Status | Meaning |
|---|---|
| 200 | The value with its stored type. With no `revision`, the latest, which must be live; with one, that revision, served when the key is soft-deleted. |
| 400 | The key rule, a refused namespace, a `revision` that is not an integer, or a stored object that does not match its record (named) |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | No such key in this workspace's namespace, a latest read of a soft-deleted or expired key, an expired or unknown revision. Nothing is written by the read. |
| 413 | The stored value is over `workflow.storage.max_read_bytes` (named) |
| 503 | Internal storage or the database is unavailable or not configured; the request can be retried. |

## PUT `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv/{key}`

Operation id: `put_kv_value`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough.**.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace; it needs no flow |
| `key` | path | string | yes | The key: `[a-zA-Z0-9][a-zA-Z0-9._-]*`, at most 350 bytes (`inheritance` included) |
| `description` | header | string | no | The key's description, stored with this revision (`""` is kept as given). |
| `ttl` | header | string | no | An ISO-8601 duration (`PT1H`, `P1D`): the key expires that long after the write. `PT0S` is accepted (expired at once); a negative one, a malformed one, or one over 1,000 years is 400. |
| `If-None-Match` | header | string | no | `*` makes the write a create: it is refused (409 `kv_exists`) when the key exists, that is when its latest revision is live (neither deleted nor expired, judged under the key's lock). A key whose latest revision is deleted or expired does... |
| `workspace` | path | string | yes |  |

**Request body (text/plain)**: `string`

| Status | Meaning |
|---|---|
| 200 | Stored as the key's next revision (it overwrites unless `If-None-Match: *`). No content and no content type (Kestra's answer). |
| 400 | The key rule, a refused namespace, an `If-None-Match` other than `*`, a malformed or negative `ttl` (`Cannot convert value 'x' to Duration`, `ttl cannot be negative`), an empty or whitespace-only body (`empty body`), a body that is a single... |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace. **workflow:read is not enough.** |
| 408 | No byte of the body arrived for 30 seconds, or the body took longer than 12 hours in all; nothing was stored. |
| 409 | `code` `kv_exists`: `If-None-Match: *` was sent and the key exists (its latest revision is live); nothing was written. Without a `code`: the key is busy, another write holds its lock for longer than the API waits (5 s); nothing was written,... |
| 413 | The body, or the value as stored, is over `workflow.storage.max_read_bytes`; or the value holds more values than the dense-value limit (`max_read_bytes`/64), or a number of more than 1,000 digits (each named). Nothing was stored. |
| 415 | A `Content-Type` other than `text/plain` |
| 503 | Internal storage or the database is unavailable or not configured; nothing was stored and the request can be retried. |

## DELETE `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv/{key}`

Operation id: `delete_kv_value`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `key` | path | string | yes | The key (`inheritance` included) |
| `workspace` | path | string | yes |  |

**Response 200 (text/plain)**: `boolean`

| Status | Meaning |
|---|---|
| 200 | `true`: the key was live and is now soft-deleted (its revisions are kept, listed by `…/revisions` and served by `?revision=N`); `false`: there was no live key (never written, already deleted, or expired), nothing done. |
| 400 | The key rule, or a refused namespace |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 409 | The key is busy: another write holds its lock for longer than the API waits (5 s); nothing was deleted, try again. |
| 503 | Internal storage is not configured, or the database is unavailable; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/namespaces/{namespace}/kv/{key}/revisions`

Operation id: `kv_revisions`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace` | path | string | yes | The namespace |
| `key` | path | string | yes | The key (`inheritance` included) |
| `workspace` | path | string | yes |  |

**Response 200 (application/json)**: array of `KvRevisionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `revision` | integer (int32) | yes |  |
| `type` | string | yes |  |
| `size` | integer (int64) | yes |  |
| `description` | string, nullable | no |  |
| `expiresAt` | string (date-time), nullable | no |  |
| `created` | string (date-time) | yes |  |
| `deleted` | boolean | yes | The key was soft-deleted at this revision (its latest); the revision is still served by `GET …/kv/\{key\}?revision=N`. |
| `expired` | boolean | yes | This revision has expired: it is not served. |

| Status | Meaning |
|---|---|
| 200 | Every revision of the key, ascending, each flagged `deleted` (soft-deleted at it) and `expired`. |
| 400 | The key rule, or a refused namespace |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 404 | The key has no revision in this workspace's namespace |
| 503 | Internal storage is not configured, or the database is unavailable; the request can be retried. |

## GET `/api/ws/{workspace}/workflows/schema`

Operation id: `get_flow_schema`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |

**Response 200 (application/json)**: `object`

| Status | Meaning |
|---|---|
| 200 | The JSON Schema (draft 2020-12) of one flow document as this workspace may publish it: Kestra's definitions filtered to the types and properties egret honours, egret's own types, and the script and plugin types only when this workspace's... |
| 304 | `If-None-Match` names the current `ETag` |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 500 | Internal error |

## GET `/api/ws/{workspace}/workflows/triggers`

Operation id: `list_triggers`. Auth: Session cookie. Forbidden (403): Missing workflow:read permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `namespace_prefix` | query | string | no | This namespace and every namespace beneath it, dot-anchored: `a.b` matches `a.b` and `a.b.c`, never `a.bc`. Must be a valid namespace name (400 otherwise). |
| `flow_id` | query | string (uuid) | no | Only this flow (its uuid). |
| `kind` | query | string | no | One or more kinds, comma-separated: `schedule`, `webhook`, `flow`, `other`. Anything else is a 400. Empty (`kind=`) is no filter. |
| `state` | query | string | no | `enabled` or `disabled`, on `effective_disabled`. Anything else is a 400. Empty (`state=`) is no filter. |
| `backfill` | query | string | no | `running` (a backfill that is not paused), `paused` or `any`. Anything else is a 400. Empty (`backfill=`) is no filter. |
| `q` | query | string | no | A case-insensitive substring of the trigger id, the flow id or the namespace. |
| `limit` | query | integer (int64) | no | How many rows to return. Default 50, maximum 200; a larger value is clamped, and the clamped value comes back in the response's `limit`. |
| `offset` | query | integer (int64) | no | How many rows to skip. Negative is clamped to zero. |

**Response 200 (application/json)**: `TriggerPageDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `rows` | TriggerRowDto[] | yes |  |
| `total` | integer (int64) | yes | Every trigger that matches, across pages. |
| `limit` | integer (int64) | yes | The page size served (clamped). |
| `offset` | integer (int64) | yes |  |
| `unparsable` | integer (int64) | yes | Flows in scope whose source did not parse: their triggers are unknown and not listed. |
| `scheduler_enabled` | boolean | yes |  |
| `worker_enabled` | boolean | yes |  |
| `webhooks_enabled` | boolean | yes |  |
| `can_manage` | boolean | yes | The caller holds `workflow:manage` in this workspace: the switches and the bulk route are theirs to use. Per caller, not per row, so a page whose rows are all refused for another reason still says it. |

| Status | Meaning |
|---|---|
| 200 | One page of the triggers of the workspace's flows not in the trash, by namespace, flow id and declaration order. Rows carry no `depends_on.conditions` and no `webhook` (read the per-flow route), and carry `backfill`, `can_backfill` and... |
| 400 | `namespace_prefix` is not a valid namespace name, or `kind`/`state`/`backfill` holds an unknown value, or the query string does not decode |
| 401 | Not authenticated |
| 403 | Missing workflow:read permission, or the workflows module is disabled for this workspace |
| 422 | More than 2000 flows match the namespace and flow filters (`code: triggers_too_large`); narrow by namespace |
| 500 | Internal error |

## POST `/api/ws/{workspace}/workflows/triggers/backfill/delete`

Operation id: `delete_triggers_backfill`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `DeleteBackfillsRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `triggers` | BulkTriggerRef[] | yes | At most 100. |

**Response 200 (application/json)**: `BulkResultsDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `results` | BulkResultDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | A result per entry, in the order given. Each backfill is deleted in its own transaction, as the per-trigger route does, and a refusal (`ok: false` with its `code`: `no_backfill`, `not_found` for a flow outside this workspace, never a 403)... |
| 400 | More than 100 entries (`code: too_many_triggers`; nothing is deleted), or `invalid_body` |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 413 | The body is over 64 KiB (`code: body_too_large`); nothing is deleted |
| 500 | Internal error; entries before the failing one may be deleted |

## PUT `/api/ws/{workspace}/workflows/triggers/backfill/paused`

Operation id: `set_triggers_backfill_paused`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetBackfillsPausedRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `triggers` | BulkTriggerRef[] | yes | At most 100. |
| `paused` | boolean | yes |  |

**Response 200 (application/json)**: `BulkResultsDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `results` | BulkResultDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | A result per entry, in the order given. Each entry is paused or resumed in its own transaction, as the per-trigger route does, and a refusal (`ok: false` with its `code`: `no_backfill`, `not_found` for a flow outside this workspace, never a... |
| 400 | More than 100 entries (`code: too_many_triggers`; nothing is changed), or `invalid_body` |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 413 | The body is over 64 KiB (`code: body_too_large`); nothing is changed |
| 500 | Internal error; entries before the failing one may be changed |

## PUT `/api/ws/{workspace}/workflows/triggers/disabled`

Operation id: `set_triggers_disabled`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing workflow:manage permission, or the workflows module is disabled for this workspace.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspace` | path | string | yes | Workspace slug |
| `workspace` | path | string | yes |  |

**Request body (application/json)**: `SetTriggersDisabledRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `triggers` | BulkTriggerRef[] | yes | At most 100. |
| `disabled` | boolean | yes |  |
| `recover_missed` | boolean | no | As [`SetTriggerDisabledRequest::recover_missed`], for every entry. |

**Response 200 (application/json)**: `BulkResultsDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `results` | BulkResultDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | A result per entry, in the order given. Each entry is switched in its own transaction, as the per-trigger route does, and a refusal (`ok: false` with its `code`: a flow outside this workspace is `not_found`, never a 403) does not stop the... |
| 400 | More than 100 entries (`code: too_many_triggers`; nothing is switched), or the body is not a bulk switch request: bad JSON, a missing or mistyped field, or no JSON content type (`code: invalid_body`) |
| 401 | Not authenticated |
| 403 | Missing workflow:manage permission, or the workflows module is disabled for this workspace |
| 413 | The body is over 64 KiB (`code: body_too_large`); nothing is switched |
| 500 | Internal error; entries before the failing one may be switched |

