---
sidebar_position: 2
---

# Execution details

Open an execution to see what happened in a run: its inputs, the tasks that ran and how long each took, every log line, and each task's outputs. The page has a header that stays in place and five tabs.

![The Overview tab of a successful execution, with Change status, Replay, Edit labels and Delete in the header](/img/platform/workflows/execution-overview.png)

## The header

| Item | What it shows |
|---|---|
| Title | The execution's full id, and its state as a coloured chip. An execution you paused with **Pause** shows a **Paused by hand** note beside the **Paused** chip. |
| **Flow** | The flow as `namespace.id`. |
| **Namespace** | The flow's namespace. |
| **Started** | The start time in your time zone. |
| **Duration** | The run time. While the execution runs it says *so far* and keeps counting, with a progress estimate based on the flow's average duration (see [Progress estimate](#progress-estimate)). |
| **Trigger** | What started it: **API**, **Schedule**, **Webhook**, **Flow trigger**, **Subflow**, **Loop iteration**, **Retry** or **Replay**. |
| **Replayed from** | Appears on a replay, with the id of the original; a replay carries the label `system.replay: true`. A child execution shows its parent instead. |
| Buttons | **Pause**, **Resume**, **Restart**, **Change status**, **Replay** and **Kill**, each only when it applies. **Edit labels** and **Delete** are always listed and are disabled, with the reason printed under the buttons, until the execution has ended. An **Actions for *task*** menu on each row of the **Task runs** table offers **Change state** (sets one task run's state), **Replay from this task** and **Delete logs** (deletes that task run's log lines). See [Run actions](./actions.md). |

While an execution is not finished, the page follows it live (see [Follow an execution live](#follow-an-execution-live)) and stops when the execution ends. Until then the header offers only the actions that apply to an unfinished execution (**Pause** and **Kill** while it runs, and **Resume**, **Restart** and **Kill** when it is paused); **Replay** and **Change status** appear once the execution has finished, as **Kill** disappears. **Edit labels** and **Delete** stay in the header all the time and are disabled until then; on a running execution the reasons *Labels can be edited once the execution has ended and its afterExecution tasks have finished* and *The execution is still running, or its afterExecution tasks are. Kill it first, then delete it* are printed under the buttons.

![A running execution: Pause and Kill are active, Edit labels and Delete are disabled with their reasons printed below, and the Duration counts up](/img/platform/workflows/execution-running.png)

In the topology of a running execution, a task that has not started yet is labelled *Not started* (on the graph, the collapsed card, the list view, and the note when you select it: *export has not started yet in this execution.*). On a finished execution, a task with no run is labelled *Not run*, as for a branch that was not taken.

## Overview

The **Overview** tab is the summary. Its sections:

- **Inputs**: a table of the input names and values the execution started with. An input the caller left out and the flow filled from `defaults:` is not listed. *No inputs* appears when none were sent.
- **Trigger**: the trigger that started the run. For a schedule it names the trigger id, a **Backfill** badge if a backfill started it, and a table of the trigger's variables (`date`, `next`, `previous`). A run started by hand says *No trigger started this execution, so it has no trigger variables.*
- **Labels**: the flow's labels plus any added by the trigger, a backfill or a `Labels` task, or the list you saved with **Edit labels** (see [Edit the labels of an execution](./actions.md#edit-the-labels-of-an-execution)).
- **Child executions**: executions this one started, with **Started by** (**Loop iteration**, **Subflow** or **Flow trigger**), the iteration number and value, the state and the start time. Select a row to open the child.
- **Task runs**: each task with its **Value** (the loop value for a task inside a loop), **State** and **Duration**, and an **Actions for *task*** menu. On a finished execution it offers **Change state** and **Replay from this task**; **Delete logs** is offered on any execution, running included.

![A loop's execution lists one child execution per value](/img/platform/workflows/execution-children.png)

:::note Secret inputs
A `SECRET` input shows `******` here, in the logs and in every API answer; the real value is stored encrypted and used only by the tasks. Task outputs are not masked. See [Secret inputs](../flows/inputs-and-outputs.md#secret-inputs).
:::

## Topology

The **Topology** tab draws the execution's own copy of the flow as a graph, coloured by the state of each task. Each node shows the task id, its type, the state, the duration, and `3 attempts` when it was retried. A task that did not run is greyed and marked *Not run*. Error handlers are labelled **On error** and `finally` tasks are labelled **Finally**.

![The topology of a failed run with an error handler that ran and a finally task that did not](/img/platform/workflows/execution-topology-failed.png)

| Control | What it does |
|---|---|
| Zoom in, zoom out, fit view | Scale the graph. Scroll and drag also move it. |
| **Horizontal**, **Vertical** | Change the direction. |
| **Expand all**, **Collapse all** | Open or fold every flowable task and subflow. |
| **List view** | The same tasks as a tree table. |

Select a node to open a side panel with that task run's logs and outputs. Select a `Loop` body to see its iterations, and a `Subflow` node to jump to the child execution. The address keeps your selection (`?node=`), so you can share a link to it.

The topology of the example above is `flaky-import`: `import_rows` failed three times, `notify_failure` ran as the error handler, and `always_runs`, a flow-level `finally` task, is drawn as *Finally · Not run* because flow-level `finally` does not run yet. See [Retries, errors and timeouts](../flows/error-handling.md).

## Gantt

The **Gantt** tab lays the task runs out on a time axis. Each row has the task, its **State**, its **Duration** and a bar placed on the **Timeline**. A task that was retried shows a retry count and a mark for each attempt; the row's description lists them, for example *Attempt 1: Failed, 0 s*. Select a row to open the same panel as in the topology.

![The Gantt tab: three attempts of import_rows and the handler that followed](/img/platform/workflows/execution-gantt.png)

## Logs

The **Logs** tab lists every log line the execution wrote, grouped by task run (`import_rows #0   3 lines`). Each line has a time stamp, a level (`TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`) and the message, and retried tasks number their attempts.

![The Logs tab grouped by task run, with the ⋯ menu, Collapse all and Download above the lines](/img/platform/workflows/execution-logs.png)

| Control | What it does |
|---|---|
| **Level** | Show lines at that level or above. |
| **Task** | Show one task's lines. |
| **Task run** | Show one run of a task, for example one iteration or attempt. |
| **Collapse all** / **Expand all** | Fold or open every group. |
| **Download** | Saves the lines the **Level**, **Task** and **Task run** filters select as a file. See [Download and delete logs](#download-and-delete-logs). |
| **⋯** (**More log actions**) | Opens a menu with **Delete logs**. Shown with the `workflow:manage` permission. |

While the execution runs, new lines appear as they are written. If you scroll up the page stops following and a **Jump to latest** button appears. A finished execution whose lines were removed after the retention period says so instead of showing an empty list.

## Follow an execution live

An unfinished execution updates in real time over Server-Sent Events (SSE), so you do not need to refresh. If the stream drops, the page falls back to polling every two seconds. Both routes need `workflow:read`.

- `GET /api/ws/{workspace}/workflows/executions/{id}/follow` sends the current state, then a new event each time it changes, then a final event when the execution finishes, and closes.
- `GET /api/ws/{workspace}/workflows/executions/{id}/logs/follow` sends log lines as they are written. It closes once the execution has finished and the remaining lines are sent.

```bash
curl -N -b cookies.txt \
  "http://egret.localtest.me:8080/api/ws/default/workflows/executions/$EXECUTION_ID/follow"
```

## Progress estimate

A running execution shows an estimate of its progress next to **Duration**. It compares the time so far with the average duration of the flow's terminated executions over the last 30 days. It is an estimate: with no terminated runs in that period there is nothing to compare, and no estimate is shown. The figure comes from `GET /api/ws/{workspace}/workflows/executions/namespaces/{namespace}/flows/{flowId}/average-duration`, which answers `{avgDurationMs, count}`.

<!-- TODO: screenshot -->

## Evaluate an expression

The **Eval** panel on the execution page and on a task run's panel evaluates a [Pebble](../flows/expressions.md) expression in the context of that execution, or of that one task run. Use it to inspect and debug: check what `{{ outputs.extract.rows }}` or `{{ inputs.date }}` resolves to without changing the flow. The panel shows the **result**, or the **error** when the expression does not evaluate.

<!-- TODO: screenshot -->

:::note Secrets stay sealed
Eval never reveals secret values. `{{ secret('x') }}` returns an error, and a `SECRET` input renders as its mask (`******`).
:::

The routes are `POST /api/ws/{workspace}/workflows/executions/{id}/eval` and `POST /api/ws/{workspace}/workflows/executions/{id}/task-runs/{taskRunId}/eval`. They need `workflow:read`. The body is the raw expression (`text/plain`). The answer is `{result, error}`, and an expression error comes back in the body with HTTP `200`.

```bash
curl -b cookies.txt -H "X-Egret-CSRF: $CSRF" -H "Content-Type: text/plain" \
  -X POST "http://egret.localtest.me:8080/api/ws/default/workflows/executions/$EXECUTION_ID/eval" \
  -d "{{ inputs.date }}"
```

```json
{ "result": "2026-11-23", "error": null }
```

## Download and delete logs

### Download

**Download** saves the log as a file from the server, named `<execution-id>.log`. It applies the current **Level**, **Task** and **Task run** filters, so with no filter it is the whole log. Each line reads `<time> <LEVEL> <message>` with the time in UTC and milliseconds, and the lines are in the order they were written. It needs `workflow:read`.

- **At most 100 000 lines.** A longer log ends with the line `… truncated at 100000 lines`. Narrow the filters to get the rest.
- **A running execution can be missing its last lines.** Lines appear in the file about 2 seconds after they are written, as on the page. Download again after the execution has ended for the full file.
- **A failed download is saved as the file.** The download is a link, so when the request fails (no permission, the execution is gone, a server error) the browser saves the error text as `<execution-id>.log` and the page shows no message. Open the file if the log looks wrong.

The API route is `GET /api/ws/{workspace}/workflows/executions/{id}/logs/download` with the optional `task_id`, `task_run_id` and `min_level` query parameters, the same as the log list.

```bash
curl -b cookies.txt -OJ \
  "http://egret.localtest.me:8080/api/ws/default/workflows/executions/$EXECUTION_ID/logs/download?min_level=WARN"
```

### Delete logs

Use this to remove log lines that hold something you must not keep. It needs `workflow:manage`, and it works on a running execution too.

1. Open the **⋯** menu above the lines and choose **Delete logs**, or open the **Actions for *task*** menu on a row of the **Task runs** table on the **Overview** tab and choose **Delete logs**.
2. In the dialog **Delete these logs?**, press **Delete logs**.

![The Logs tab with the ⋯ menu open and its Delete logs item](/img/platform/workflows/execution-logs-menu.png)

![The Delete these logs? dialog on the unfiltered Logs tab](/img/platform/workflows/execution-delete-logs-dialog.png)

The dialog says what it deletes: *Deletes every log line of this execution* and then each filter that is set, for example *at WARN and above*, *of task extract* or *of run #1*. It adds *Lines written after this stay. This cannot be undone.* From the menu in the toolbar it follows the current **Level**, **Task** and **Task run** filters. From a task run's row it deletes all the lines of that task run, every attempt included, and the dialog says *Deletes the logs of* the task and run number. A toast says *Deleted the logs* (or *Deleted the logs of* the task run), and the tab reads the lines again.

Things to know:

- **Lines written after the delete stay.** On a running execution the tasks keep logging.
- **Only log lines are deleted.** The execution, its task runs and outputs are not touched.
- **No effect on a flow's other executions.** There is no delete of the logs of a whole flow.

The API route is `DELETE /api/ws/{workspace}/workflows/executions/{id}/logs`. It answers `204`. The optional filters, all combined, are `task_id`, `task_run_id`, `attempt` (counted from 0) and `min_level` (that level and above). With none, every line of the execution is deleted.

```bash
curl -b cookies.txt -H "X-Egret-CSRF: $CSRF" \
  -X DELETE "http://egret.localtest.me:8080/api/ws/default/workflows/executions/$EXECUTION_ID/logs?min_level=DEBUG"
```

## Outputs

The **Outputs** tab lists the task runs that produced outputs. Select one to see its values. Each output has **Copy value** and **Copy expression**; the expression, such as `{{ outputs.summary.value }}`, can be pasted into another task. A file output (a `kestra:///…` URI) shows its size, a **Preview** for text files and a **Download** link.

![The Outputs tab showing the Return task's value and its expression](/img/platform/workflows/execution-outputs.png)

*No outputs* means no task run of the execution produced any. The tab lists task runs only: the flow's own [outputs](../flows/inputs-and-outputs.md#flow-outputs) are not shown here. `GET /api/ws/{workspace}/workflows/executions/{id}` returns them in an `outputs` field (a `SECRET` value is `******`); the executions list does not carry it.

## Limits and known issues

- The **Overview** tab does not list inputs that came from `defaults:`.
- Tasks inside a `Loop` have task runs in the child executions, not in the parent. Open a child to see them.
- Flow `outputs:` are not shown in the UI; read them from the execution API.
- The log **Download** is capped at 100 000 lines, can miss the last 2 seconds of a running execution, and saves an error answer as the file. See [Download](#download).
- **Delete logs** works on the current filters or on one task run; the **Attempt** filter exists only in the API.

## Further reading

- [Run actions](./actions.md)
- [Flow control](../flows/flow-control.md)
- [Inputs and outputs](../flows/inputs-and-outputs.md)
