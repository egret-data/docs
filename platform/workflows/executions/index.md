---
sidebar_position: 1
---

# Executions

An execution is one run of a flow. The **Executions** page lists every run in the workspace, newest first, so you can see what is running, what failed and what started it.

![The Executions page with the state summary and the list of runs](/img/platform/workflows/executions-list.png)

## Find an execution

Go to **Workflows → Executions**. The page refreshes itself every few seconds while it is open; the header shows *Updated 2 s ago* and a **Refresh** button forces a reload.

| Control | What it does |
|---|---|
| **State** | One or more states: for example **Failed** and **Warning** to see everything that did not succeed. **All** clears the choice. |
| **Namespace** | Runs of flows in one namespace. |
| **Flow** | Runs of one flow. |
| **Time** | **Last hour**, **Last 24 hours**, **Last 7 days**, **Last 30 days**, or **Custom** with a start and an end. **All** shows every run. |
| **Show child executions** | Off by default. Loop iterations, subflow runs and flow-trigger runs are children of another execution, and are hidden until you switch this on. |

Under the filters a line counts what matches: the total, how many are on this page, and a count per state, such as *55 executions · 50 on this page · 1 paused · 23 success · 2 warning · 23 failed · 1 killed*. The list shows 50 runs per page; use **Previous** and **Next** at the bottom. Your filters and page are kept in the address, so you can share a link to a filtered list.

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

## Other places that list executions

- A flow's **Executions** tab shows the runs of that flow only. The flow and namespace pickers are hidden there because they are fixed.
- A namespace's **Executions** tab shows runs of the flows in that namespace and below it. See [Namespaces](../namespaces/index.md).
- The namespace **Overview** tab shows the most recent few.

## Open an execution

Press an execution's id. The [execution page](./detail.md) has tabs for **Overview**, **Topology**, **Gantt**, **Logs** and **Outputs**, and the [actions](./actions.md) **Resume**, **Replay** and **Kill**.

## Start an execution

There is no **New execution** button here. Start a run from a flow's page with **Run** ([Flows](../flows/index.md)), from a [trigger](../triggers/index.md), or from the API:

```bash
curl -b cookies.txt -H "X-Egret-CSRF: $CSRF" -H "Content-Type: application/json" \
  -X POST "http://localhost:5180/api/ws/default/workflows/flows/$FLOW_ID/executions" -d '{}'
```

The answer is the new execution, in the `RUNNING` state. With the worker off it stays there; see [Runtime and operations](../runtime.md).

## What is stored with an execution

- **A frozen copy of the flow's YAML and of the inputs.** A replay uses them, not the flow's current text.
- **Task runs**, each with its state, attempts, timing and outputs.
- **Log lines**, kept for `workflow.log_retention_days` (30 by default).
- **Files** created by tasks, kept for `workflow.storage_retention_days` (30 by default).

When the files or logs have been removed, the **Logs** and **Outputs** tabs say so instead of showing an empty list.

## Limits and known issues

- There is no bulk action (kill, replay or delete several runs), no change-status action and no delete.
- **Restart** a failed execution from the failed task is not available; use **Replay**, which starts a new execution from the beginning.
- The page polls rather than streaming. A long-running execution can lag behind by a few seconds.

## Further reading

- [Execution details](./detail.md)
- [Run actions](./actions.md)
- [Flows](../flows/index.md)
