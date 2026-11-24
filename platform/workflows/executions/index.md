---
sidebar_position: 1
---

# Executions

An execution is one run of a flow. The **Executions** page lists every run in the workspace, newest first, so you can see what is running, what failed and what started it.

![The Executions page with the state summary and the list of runs](/img/platform/workflows/executions-list.png)

## Find an execution

Go to **Workflows → Executions**. The list refreshes itself every few seconds while it is open; the header shows *Updated 2 s ago* and a **Refresh** button forces a reload.

| Control | What it does |
|---|---|
| **State** | One or more states: for example **Failed** and **Warning** to see everything that did not succeed, or **Queued** to see executions held by a flow's [concurrency limit](../flows/concurrency.md). **All** clears the choice. |
| **Namespace** | Runs of flows in one namespace. The dropdown lists the namespaces that have executions. |
| **Flow** | Runs of one flow. After you pick a namespace, the dropdown lists that namespace's flows. |
| **Time** | **Last hour**, **Last 24 hours**, **Last 7 days**, **Last 30 days**, or **Custom** with a start and an end. **All** shows every run. |
| **Show child executions** | Off by default. Loop iterations, subflow runs and flow-trigger runs are children of another execution, and are hidden until you switch this on. |

Under the filters a line counts what matches: the total, how many are on this page (when there is more than one page), and a count per state, such as *41 executions · 1 running · 1 paused · 23 success · 3 warning · 10 failed · 3 killed*. The list shows 50 runs per page; use **Previous** and **Next** at the bottom. Your filters and page are kept in the address, so you can share a link to a filtered list.

Each row shows:

| Column | Meaning |
|---|---|
| **ID** | The first eight characters of the execution id. Select it to open the execution. |
| **Flow** | The flow's id. |
| **Namespace** | The flow's namespace. |
| **State** | See [Workflow concepts](../concepts.md#execution-states). |
| **Start** | How long ago it started. |
| **Duration** | How long it ran; for a running execution, the time so far. |
| **Trigger** | What started it. |

The **Trigger** column says how the run began:

| Value | Started by |
|---|---|
| **API** | **Run** on the flow's page, or the API. |
| **Schedule** | A `Schedule` trigger, including each tick of a [backfill](../triggers/backfill.md). |
| **Webhook** | A `Webhook` trigger. |
| **Flow trigger** | A `Flow` trigger after another flow ended. |
| **Subflow** | A `Subflow` task of a parent execution. |
| **Loop iteration** | One item of a `Loop` task. |
| **Retry** | A flow-level retry with `CREATE_NEW_EXECUTION`. |
| **Replay** | A [replay](./actions.md#replay-an-execution) of an earlier execution. |

## Export to CSV

Press **Export CSV** above the list to download the executions that match the current filters (state, namespace, flow, time and **Show child executions**) as `executions.csv`. The export is not limited to the current page. It needs `workflow:read`.

<!-- TODO: screenshot -->

| Column | Meaning |
|---|---|
| `id` | The full execution id. |
| `namespace` | The flow's namespace. |
| `flow_id` | The flow's id. |
| `flow_key` | The flow's key. |
| `state` | The execution's state. |
| `created_at`, `started_at`, `ended_at` | Timestamps. |
| `duration_ms` | The run time in milliseconds. |
| `labels` | The execution's labels. |

The API route is `GET /api/ws/{workspace}/workflows/executions/export.csv`, with the same filter parameters as the list. The answer streams as an attachment.

```bash
curl -b cookies.txt -o executions.csv \
  "http://egret.localtest.me:8080/api/ws/default/workflows/executions/export.csv"
```

## Filter lists and statistics API

These read-only routes live under `/api/ws/{workspace}/workflows/executions` and need `workflow:read`.

| Route | Answer |
|---|---|
| `GET /namespaces` | The distinct namespaces. Fills the **Namespace** dropdown. |
| `GET /namespaces/{namespace}/flows` | The flows (by flow id) in a namespace. Fills the **Flow** dropdown. |
| `GET /namespaces/{namespace}/flows/{flowId}/average-duration` | `{avgDurationMs, count}`: the mean duration of the flow's terminated executions over the last 30 days. `avgDurationMs` is `null` when there are none. |
| `POST /latest` | The newest execution of each flow you ask for. The body is a list of `{namespace, id}` filters; each result is `{id, flowId, namespace, startDate, status}`. |

```bash
curl -b cookies.txt -H "X-Egret-CSRF: $CSRF" -H "Content-Type: application/json" \
  -X POST "http://egret.localtest.me:8080/api/ws/default/workflows/executions/latest" \
  -d '[{"namespace": "company.team", "id": "daily-import"}]'
```

## Act on many executions

Tick the checkbox at the start of a row to select it; the box in the header selects the whole page. A **bulk-action toolbar** appears above the list with the ten actions: **Restart**, **Replay**, **Change status**, **Kill**, **Pause**, **Resume**, **Edit labels**, **Delete**, **Unqueue** and **Force run**. **Unqueue** and **Force run** are enabled only when every selected execution is `QUEUED`. An action is enabled only when every selected execution is eligible for it; otherwise it is greyed out. Each needs `workflow:manage`.

<!-- TODO: screenshot -->

- **Select all matching the current filter.** When you select a whole page and more executions match the filter, the toolbar offers to select all of them. Choosing it switches the action to the by-query variant: it acts on every execution the filter matches, not only the ones on screen.
- **Confirmation.** **Delete** and **Kill** ask first, in a dialog that shows how many executions they will affect.
- **All or nothing.** If any selected execution cannot take the action, nothing is changed. The dialog lists each rejected id with the reason and says *Nothing was changed*. Remove those rows, or narrow the filter, and try again.
- **At most 1000 executions** per action. A larger selection is refused.

See [Bulk actions](./actions.md#bulk-actions) for each action and the API.

## Other places that list executions

- A flow's **Executions** tab shows the runs of that flow only. The flow and namespace pickers are hidden there because they are fixed.
- A namespace's **Executions** tab shows runs of the flows in that namespace and below it. See [Namespaces](../namespaces/index.md).
- The namespace **Overview** tab shows the most recent few.

## Open an execution

Press an execution's id. The [execution page](./detail.md) has tabs for **Overview**, **Topology**, **Gantt**, **Logs** and **Outputs**, and the [actions](./actions.md) **Pause**, **Resume**, **Restart**, **Replay**, **Kill**, **Change status**, **Edit labels** and **Delete**.

## Start an execution

There is no **New execution** button here. Start a run from a flow's page with **Run** ([Flows](../flows/index.md)), from a [trigger](../triggers/index.md), or from the API:

```bash
curl -b cookies.txt -H "X-Egret-CSRF: $CSRF" -H "Content-Type: application/json" \
  -X POST "http://egret.localtest.me:8080/api/ws/default/workflows/flows/$FLOW_ID/executions" -d '{}'
```

The answer is the new execution, in the `RUNNING` state. With the worker off it stays there; see [Runtime and operations](../runtime.md). The address above is the Docker demo stack's; use your own host.

## What is stored with an execution

- **A frozen copy of the flow's YAML and of the inputs.** A replay uses them by default (you can pick the flow's current version or a published one instead).
- **Task runs**, each with its state, attempts, timing and outputs.
- **Log lines**, kept for `workflow.log_retention_days` (30 by default). You can [download or delete](./detail.md#download-and-delete-logs) them earlier.
- **Files** created by tasks, kept for `workflow.storage_retention_days` (30 by default).

When the files or logs have been removed, the **Logs** and **Outputs** tabs say so instead of showing an empty list.

## Limits and known issues

- [Bulk actions](./actions.md#bulk-actions) apply to at most 1000 executions at a time and are all or nothing.
- **Restart** runs the failed tasks again in the same execution, or in a new one on another version of the flow; **Replay** starts a new execution from the beginning or from a task you pick, on the version you pick, with the same inputs or new ones. See [Run actions](./actions.md).
- The list polls every few seconds. Only the execution page and its logs stream live; see [Follow an execution live](./detail.md#follow-an-execution-live).
- An execution can stay in **Running** longer than its tasks need when another execution's long task holds the worker; see [Runtime and operations](../runtime.md#limits-and-known-issues).

## Further reading

- [Execution details](./detail.md)
- [Run actions](./actions.md)
- [Flows](../flows/index.md)
