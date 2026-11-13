---
sidebar_position: 3
---

# Run actions: resume, restart, replay, kill and change state

Actions work on an execution from its page: **Resume** releases a paused run, **Restart** runs the failed tasks again in the same execution, **Replay** runs a finished execution again as a new one, **Kill** stops one that has not ended, and **Change status** and **Change state** set the state of an execution or of one of its task runs by hand. Each needs the `workflow:manage` permission; `workflow:read` is not enough. A button that does not apply is hidden, or disabled with the reason printed next to it.

| Action | Shown when | Result |
|---|---|---|
| **Resume** | The execution is **Paused** | The paused `Pause` tasks end successfully and the execution goes on. |
| **Restart** | The execution is **Failed** or **Paused** | The failed tasks run again in the same execution. |
| **Change status** | The execution has ended, and was not killed | The execution gets the state you pick. Its task runs are not touched. |
| **Change state** (on a task run) | The execution has ended, and was not killed | The task run gets the state you pick and the execution continues or ends from it. |
| **Replay** | The execution has finished | A new execution from the original's frozen YAML and inputs. |
| **Kill** | The execution has not ended | The execution ends `KILLED`. |

## Resume a paused execution

1. Open the paused execution. A `Pause` task is waiting.
2. Press **Resume**.
3. Confirm in the dialog **Resume this execution?**, which says every paused task ends now as a success, whatever its duration or timeout, and the execution continues.

![The Resume this execution? dialog](/img/platform/workflows/execution-resume.png)

The `Pause` task ends `SUCCESS`, the execution moves through `RESTARTED` and `RUNNING`, and the tasks after the pause run.

```yaml
id: approval-gate
namespace: docs.demo
tasks:
  - id: before
    type: io.kestra.plugin.core.log.Log
    message: Waiting for approval
  - id: gate
    type: io.kestra.plugin.core.flow.Pause
  - id: after
    type: io.kestra.plugin.core.log.Log
    message: Approved
```

A paused execution shows **Resume** and **Kill** at the top right (the screenshot predates platform #747 and still shows a disabled **Replay**).

![A paused execution with Resume, Replay and Kill](/img/platform/workflows/execution-paused.png)

Resuming releases every paused `Pause` task of the execution at once, whatever its `pauseDuration`. If the execution is paused only because a `LoopUntil` is waiting for its next check, **Resume** is disabled and says *Waiting on a loop condition, not a Pause task*. A resume that arrives just as the pause's own timer ends is refused with a conflict and the page asks you to refresh. A resume feedback toast says *Resumed the execution*, or warns if the execution then ended in a failure.

The API route is `POST /api/ws/{workspace}/workflows/executions/{id}/resume`. It does not take inputs.

## Restart a failed execution

Use restart when a task failed for a reason you have since fixed outside the flow (a source that was down, a file that arrived late) and you want the same execution to carry on.

1. Open a **Failed** or **Paused** execution.
2. Press **Restart**.
3. In the dialog **Restart this execution?**, press **Restart**. The dialog says *The failed tasks run again in this same execution, and the tasks that succeeded keep their results. The execution keeps its id.*

![The Restart this execution? dialog on a failed execution](/img/platform/workflows/execution-restart.png)

The execution keeps its id. Every task run that failed or is paused runs again, together with the flow-control tasks that contain it; tasks that succeeded keep their results and are not run again. A toast says *Restarted the execution*. The history of a flow whose task fails on its first attempt reads `CREATED`, `RUNNING`, `FAILED`, `RESTARTED`, `RUNNING`, `SUCCESS`.

![The restarted execution, Success, with the label system.restarted: true](/img/platform/workflows/execution-restarted.png)

Things to know:

- **Same execution, not a new one.** Restart keeps the execution id, its logs and its successful results, and adds the label `system.restarted: true`. **Replay** starts a new execution from the beginning with a new id. Choose restart to carry on from the failure, replay to run everything again.
- **Attempts add up.** A restarted task gets a new attempt. Its `retry` setting counts all its attempts, so a task whose retries were already used does not retry again.
- **Earlier outputs of a re-run task are cleared** until it writes new ones.
- **Error and finally branches run again.** The `errors`, `finally` and `afterExecution` tasks of the flow and of its flow-control tasks are cleared and run again on the new outcome.
- **A `WorkingDirectory` block runs whole again**, in a new working directory.
- **A loop restarts at the failing iteration.** For a `Loop`, the last failed or paused iteration is restarted in place. An iteration cannot be restarted on its own: its **Restart** button is disabled and names the loop's execution to restart instead.
- **A failed subflow child is restarted in place** and the parent waits for it. A child that did not fail is not run again.
- **Flow triggers fire again.** The restart adds the states `RESTARTED`, `RUNNING` and the new end state to the history, and each one is an event for a flow trigger.

The API route is `POST /api/ws/{workspace}/workflows/executions/{id}/restart`. It answers `200` with the execution. A `revision` query parameter is refused with `400` `restart_revision_unsupported`.

```bash
curl -b cookies.txt -H "X-Egret-CSRF: $CSRF" \
  -X POST "http://egret.localtest.me:8080/api/ws/default/workflows/executions/$EXECUTION_ID/restart"
```

## Change the state of a task run

Use this to tell the engine that a task's result should count differently, for example to mark a failed task as a success so that the tasks after it run. In Kestra this is "mark as".

1. Open an execution that has ended (not **Killed**). The **Overview** tab's **Task runs** table has a **Change state** button on each row.
2. Press **Change state** on the row.
3. In the dialog **Change the state of *task*?**, pick the **New state** and press **Change state**. The dialog says *Sets the state of this task run's last attempt only. Earlier attempts keep theirs. The execution continues or ends from the new state.*

![The Change the state of flaky? dialog with Success picked, above the Task runs table](/img/platform/workflows/execution-change-task-state.png)

The **New state** list offers **Success**, **Warning**, **Failed** and **Cancelled**, without the state the task run is already in. Only the last attempt changes; no attempt is added. The execution then continues from the new state:

- A task run set to **Success** or **Warning** lets the tasks after it run. In a check on the demo stack, a task that failed was marked **Success** and the next task ran and the execution ended `SUCCESS`.
- Choosing **Cancelled** ends the execution as `CANCELLED` at once.
- The execution gets the label `system.restarted: true` and an extra attempt number, as for a restart, and the tasks of its `errors`, `finally` and `afterExecution` branches are cleared and run again.

The API route is `POST /api/ws/{workspace}/workflows/executions/{id}/task-runs/{task_run_id}/state` with the body `{"state": "SUCCESS"}`.

## Change the status of an execution

Use this to correct the end state of an execution without running anything, for example to mark a failed run that you handled by hand as a success or a warning. Only the state of the execution changes: its task runs keep theirs, and nothing runs again.

1. Open an execution that has ended (not **Killed**).
2. Press **Change status**.
3. In the dialog **Change the status of this execution?**, pick the **New state** and press **Change state**. The dialog says *Sets the execution to the state you pick. Its task runs keep their own states.*

![The Change the status of this execution? dialog with Warning picked](/img/platform/workflows/execution-change-status.png)

The list offers **Success**, **Warning**, **Failed** and **Cancelled**, without the current state. A toast says *Changed the status to* followed by the state. A parent execution whose `Subflow` task has already ended does not follow a change of the child's status.

The API route is `POST /api/ws/{workspace}/workflows/executions/{id}/status` with the body `{"state": "WARNING"}`. A body that is not valid is refused with `400`.

## Why an action is refused

The page shows the refusal in the dialog or as a message and changes nothing. In the API the refusal is a code in the answer.

| Code | Status | Meaning |
|---|---|---|
| `nothing_to_restart` | 409 | The execution has no failed or paused task to restart from. |
| `not_restartable` | 409 | For **Restart**: the execution is not **Failed** or **Paused**. For a state change: the execution has not ended, or it was killed. Refresh to see its latest state. |
| `after_execution_running` | 409 | The `afterExecution` tasks are still running. Try again once they have ended. |
| `files_pruned` | 409 | The execution's files were deleted after the retention period, so its tasks could not read their earlier outputs. Replay it instead. Applies to restart and to a task-run state change, not to a status change. |
| `state_unchanged` | 409 | The execution or task run is already in the state you picked. |
| `inside_working_directory` | 409 | The task run is inside a `WorkingDirectory` block, which cannot be changed one task at a time. Restart the execution instead, which runs the block whole again. |
| `restart_revision_unsupported` | 400 | A `revision` was passed to restart. Restart in the same execution does not take one. |

A state outside **Success**, **Warning**, **Failed** and **Cancelled** is refused with `400`. An execution id from another workspace answers `404`.

## Permission and audit

**Restart**, **Change status** and **Change state** need `workflow:manage`; without it the buttons are hidden. Each one is written to the audit log with the state the execution was in before: `workflow_execution:restart`, `workflow_execution:set_status` and `workflow_execution:set_task_run_state`.

## Replay an execution

Use replay to run a failed execution again, or to repeat a successful one with the same inputs.

1. Open a finished execution (any state that has ended).
2. Press **Replay**.
3. Read the dialog and press **Replay**.

![The replay dialog: a new execution from the frozen YAML and inputs](/img/platform/workflows/execution-replay.png)

The dialog says *Replay starts a new execution from this execution's frozen YAML and inputs. Edits made to the flow since it ran are not used.* It lists the names of the inputs the replay will use (*Inputs: customer, orders.*), or says *It has no inputs.* The page then opens the new execution, which shows **Replayed from** the original and **Replay** in the **Trigger** column of the list.

Things to know:

- **It starts from the beginning.** Replay does not resume from the failed task. All tasks run again.
- **It uses the old text.** If you fixed the flow and want the fix, press **Run** on the flow's page instead.
- **It is not available** while the execution is running (the button is shown only once the execution has finished), for a loop iteration (replay the loop's own execution), or when the flow is disabled. A flow in the trash cannot be replayed either; restore it first. An execution of a flow that was deleted permanently cannot be replayed: **Replay** is shown disabled, and the line under the buttons says *Replay: The flow was deleted permanently, so this execution cannot be replayed*.

## Kill an execution

1. Open the execution and press **Kill**.
2. In the dialog **Kill this execution?**, choose whether to **Also kill subflow executions**. It is on by default: the loop iterations and subflow executions of this execution, and theirs, are killed too. If you clear it, they keep running.
3. Press **Kill**.

![The kill dialog on a running execution, with the Also kill subflow executions option](/img/platform/workflows/execution-kill.png)

What happens next depends on where the execution is:

| Where the execution is | Result |
|---|---|
| Paused, retrying, or not yet started | `KILLED` at once. Tasks that had not finished end `KILLED`. |
| A task is running | The execution becomes `KILLING` and a worker stops the running task, usually within the worker's kill check of 5 seconds (`workflow.kill_poll_ms`), then it ends `KILLED`. On the demo stack a `Sleep` of two minutes (`docs.ops/slow-export`) ended `KILLED` about 4 seconds after **Kill**. |

A killed execution cannot be resumed; replay it to run it again. Killing an execution that has already ended answers *The execution has already ended* and changes nothing.

## Limits and known issues

- No bulk actions: each execution is acted on from its own page.
- **Restart** with a `revision` (a new execution on another version of the flow) is not available: it is refused with `restart_revision_unsupported`. Use **Replay** to run an execution again from the start.
- Not available: replay from a chosen task, delete an execution, and force-run.
- A restart cannot be started on a loop iteration, on an execution whose `afterExecution` tasks are still running, or after the pruner deleted its files.
- **Change state** is not offered for a task run inside a `WorkingDirectory` block. If a task run is set to **Cancelled** or is still **Paused**, the flow-control tasks that contain it can show **Running** under an execution that has ended.
- A `Subflow` inside a `LoopUntil` is matched to its earlier child by position only, so a restarted iteration starts a new child. A restarted `Subflow` whose child is still running waits for it.
- Restart and the state changes act on one execution; there is no bulk version.
- Replay always uses the execution's original inputs; they cannot be edited.

## Further reading

- [Execution details](./detail.md)
- [Flow control: Pause](../flows/flow-control.md#pause)
- [Runtime and operations](../runtime.md)
