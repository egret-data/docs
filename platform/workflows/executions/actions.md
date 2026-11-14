---
sidebar_position: 3
---

# Run actions: resume, restart, replay, kill and change state

Actions work on an execution from its page: **Resume** releases a paused run, **Restart** runs the failed tasks again in the same execution (or in a new one, on another version of the flow), **Replay** runs a finished execution again as a new one, from the start or from a task you pick, **Kill** stops one that has not ended, and **Change status** and **Change state** set the state of an execution or of one of its task runs by hand. Each needs the `workflow:manage` permission; `workflow:read` is not enough. A button that does not apply is hidden, or disabled with the reason printed next to it.

| Action | Shown when | Result |
|---|---|---|
| **Resume** | The execution is **Paused** | The paused `Pause` tasks end successfully and the execution goes on. |
| **Restart** | The execution is **Failed** or **Paused** | The failed tasks run again in the same execution. On another version of the flow, a new execution does it. |
| **Change status** | The execution has ended, and was not killed | The execution gets the state you pick. Its task runs are not touched. |
| **Change state** (on a task run) | The execution has ended, and was not killed | The task run gets the state you pick and the execution continues or ends from it. |
| **Replay** | The execution has finished | A new execution from the start, on the version you pick, with the original's inputs or new ones. |
| **Replay from this task** (task-run row menu) | The execution has finished | A new execution that keeps the results of the tasks before the one you pick and runs it and the rest again. |
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
- **A failed subflow child is restarted in place** and the parent waits for it. A child that did not fail, a paused one included, is not run again: the `Subflow` task ends **Success** and keeps the child's outputs.
- **The flow must still be startable.** A restart is refused when the flow is in the trash or was deleted permanently (`404`), or is disabled (`409`), as for replay. If the flow has an `egret.sql` task, which runs as the flow's creator, only its creator can restart it (`400`).
- **Flow triggers fire again.** The restart adds the states `RESTARTED`, `RUNNING` and the new end state to the history, and each one is an event for a flow trigger.

The API route is `POST /api/ws/{workspace}/workflows/executions/{id}/restart`. It answers `200` with the execution. The `source` query parameter picks the version to restart on; see [Restart on another version](#restart-on-another-version).

```bash
curl -b cookies.txt -H "X-Egret-CSRF: $CSRF" \
  -X POST "http://egret.localtest.me:8080/api/ws/default/workflows/executions/$EXECUTION_ID/restart"
```

## Change the state of a task run

Use this to tell the engine that a task's result should count differently, for example to mark a failed task as a success so that the tasks after it run. In Kestra this is "mark as".

1. Open an execution that has ended (not **Killed**). On the **Overview** tab, each row of the **Task runs** table has an **Actions for *task*** menu.
2. Open the menu on the row and choose **Change state**.
3. In the dialog **Change the state of *task*?**, pick the **New state** and press **Change state**. The dialog says *Sets the state of this task run's last attempt only. Earlier attempts keep theirs. The execution continues or ends from the new state.*

![The Change the state of b? dialog with Success picked, above the Task runs table](/img/platform/workflows/execution-change-task-state.png)

The **New state** list offers **Success**, **Warning**, **Failed** and **Cancelled**, without the state the task run is already in. Only the last attempt changes; no attempt is added. The execution then continues from the new state:

- A task run set to **Success** or **Warning** lets the tasks after it run. In a check on the demo stack, a task that failed was marked **Success** and the next task ran and the execution ended `SUCCESS`.
- Choosing **Cancelled** ends the execution as `CANCELLED` at once.
- The execution gets the label `system.restarted: true` and an extra attempt number, as for a restart, and the tasks of its `errors`, `finally` and `afterExecution` branches are cleared and run again. A task run inside one of those branches is cleared with them, so changing its state makes the branch run again rather than keeping the state you picked.
- The same flow checks as restart apply: the flow must not be in the trash or disabled, and on a flow with an `egret.sql` task only its creator can change a task run's state. **Change status** runs no task and has neither check.

The API route is `POST /api/ws/{workspace}/workflows/executions/{id}/task-runs/{task_run_id}/state` with the body `{"state": "SUCCESS"}`.

## Change the status of an execution

Use this to correct the end state of an execution without running anything, for example to mark a failed run that you handled by hand as a success or a warning. Only the state of the execution changes: its task runs keep theirs, and nothing runs again.

1. Open an execution that has ended (not **Killed**).
2. Press **Change status**.
3. In the dialog **Change the status of this execution?**, pick the **New state** and press **Change state**. The dialog says *Sets the execution to the state you pick. Its task runs keep their own states.*

![The Change the status of this execution? dialog with Warning picked](/img/platform/workflows/execution-change-status.png)

The list offers **Success**, **Warning**, **Failed** and **Cancelled**, without the current state. A toast says *Changed the status to* followed by the state. A parent execution whose `Subflow` task has already ended does not follow a change of the child's status.

The API route is `POST /api/ws/{workspace}/workflows/executions/{id}/status` with the body `{"state": "WARNING"}`. A body that is not valid is refused with `400`.

## Restart on another version

Use this to run the failed tasks again on a fixed version of the flow, and to keep the failed run as it is. Instead of restarting in place, Restart can create a new execution on the version you pick.

1. Open a **Failed** or **Paused** execution and press **Restart**.
2. In the dialog **Restart this execution?**, choose the version under **Run on**: **This run's version** (the default), **The flow's current version** or **A published version**. See [Choose the version](#choose-the-version).
3. Press **Restart**.

![The Restart this execution? dialog with the choice of version](/img/platform/workflows/execution-restart-dialog.png)

With **This run's version**, Restart works as described above, in place. With another version, the dialog says *Restarting on another version creates a new execution: the failed tasks run again on that version and the tasks that succeeded keep their results.* The new execution has its own id and the label `system.restarted: true`. The execution you restarted is not changed. The tasks that succeeded keep their results and outputs, so a later task can still read them.

The API route is the same, with `source`: `POST …/executions/{id}/restart?source=current` or `?source=version:3`. It answers `200` for a restart in place and `201` with the new execution when the source is not `frozen`. `revision=3` is an alias of `source=version:3`.

## Replay from a task

Use this when the early tasks of a run were right and slow or costly, and you want to run again from a later task, for example after you fixed the flow.

1. Open a finished execution. On the **Overview** tab, open the **Actions for *task*** menu on the row of the task to start from.
2. Choose **Replay from this task**.
3. In the dialog **Replay from *task*?**, choose the version and change the inputs if you need to, then press **Replay**.

![The Actions for task menu on a task-run row, with Change state and Replay from this task](/img/platform/workflows/execution-row-menu.png)

The dialog says *Replay starts a new execution that keeps the results of the tasks before *task* and runs *task* and every task after it again.* The new execution copies the earlier task runs with their outputs and states, runs the chosen task and everything after it, and has a new id. The page opens it, labelled `system.replay: true`, and shows **Replayed from** the original.

![A replayed execution with the label system.replay: true and Replayed from the original](/img/platform/workflows/execution-replayed.png)

Things to know:

- **Outputs of the tasks before the replay point are kept.** A task after it can read them with `{{ outputs.<task>… }}`.
- **Error and finally runs are dropped and run again.** The `errors`, `finally` and `afterExecution` runs of the flow and of every flow-control task the chosen task sits in are removed from the copy and run again on the new outcome. Kestra keeps the `errors` runs in some of these cases, which leaves the chosen task unable to run.
- **A `Loop` that is reset runs its iterations again.** If the replay point is inside a `Loop`, or the `Loop` itself, the loop starts over in the new execution and every iteration runs again. A task inside a loop iteration is replayed from its `Loop`'s own run; the dialog's refusal names the `Loop` task to pick instead.
- **A `WorkingDirectory` block runs whole.** A task inside one cannot be picked on its own; pick the block.
- **A task that moved or is missing is refused.** On another version, every task the new execution keeps or runs again must exist in that version under the same parent. Otherwise nothing is created; see [Why an action is refused](#why-an-action-is-refused).

The API route is `POST /api/ws/{workspace}/workflows/executions/{id}/replay?taskRunId={task_run_id}`.

```bash
curl -b cookies.txt -H "X-Egret-CSRF: $CSRF" -H "Content-Type: application/json" -d '{}' \
  -X POST "http://egret.localtest.me:8080/api/ws/default/workflows/executions/$EXECUTION_ID/replay?taskRunId=$TASK_RUN_ID&source=current"
```

## Choose the version

Replay and Restart ask which version of the flow the new execution runs on. The dialog lists them under **Run on**:

| Option | The new execution runs | API `source` |
|---|---|---|
| **This run's version** | The flow's YAML as it was when this execution ran. This is the default. | `frozen` |
| **The flow's current version** | The flow as it is saved now, the text that **Run** uses. Use it to fix the flow and then replay from the failed task. | `current` |
| **A published version** | The published version you pick in the list that appears. | `version:N` |

**The flow's current version** is disabled when the execution's flow no longer exists, and **A published version** when the flow has no published versions (the dialog says *This flow has no published versions*). A chosen version whose own YAML says `disabled: true` is refused, as is a disabled flow. On a version other than the frozen one, `variables` come from that version.

## Change the inputs

A replay uses the original inputs unless you change them.

1. In the replay dialog, press **Change inputs**. The section opens with a field per input of the chosen version, filled with the values the run had.
2. Edit the values and press **Replay**.

Things to know:

- **Without changes, the old inputs are reused.** The request body is `{}`.
- **Changing inputs replaces them all.** The new execution gets exactly the values in the form. An optional `SECRET` input you leave empty is dropped, not kept.
- **A `SECRET` input is never prefilled.** Its field says *Enter it again: the stored value is hidden.*
- **A `FILE` input you leave alone is reused.** Choose a new file to replace it.
- **The inputs are checked as for a run.** A value the version refuses is shown on its field and nothing starts.

The API takes `{}` (the old inputs), `{"inputs": {…}}` as JSON, or a multipart body when an input is a `FILE`.

## Why an action is refused

The page shows the refusal in the dialog or as a message and changes nothing. In the API the refusal is a code in the answer.

| Code | Status | Meaning |
|---|---|---|
| `nothing_to_restart` | 409 | The execution has no failed or paused task to restart from. |
| `not_restartable` | 409 | For **Restart**: the execution is not **Failed** or **Paused**. For a state change: the execution has not ended, or it was killed. Refresh to see its latest state. |
| `after_execution_running` | 409 | The `afterExecution` tasks are still running. Try again once they have ended. |
| `files_pruned` | 409 | The execution's files were deleted after the retention period, so its tasks could not read their earlier outputs. Replay the whole execution instead. Applies to restart, to a task-run state change and to a replay from a task, not to a status change. |
| `state_unchanged` | 409 | The execution or task run is already in the state you picked. |
| `inside_working_directory` | 409 | The task run is inside a `WorkingDirectory` block, which cannot be changed or replayed one task at a time. Restart the execution, or replay from the block itself. |
| `invalid_source` | 400 | `source` is not `frozen`, `current` or `version:N` (N is 1 or more), `revision` is not a whole number of 1 or more, or both were given. |
| `replay_task_not_in_source` | 400 | A task the new execution keeps or runs again is missing from the chosen version, sits under another parent there, or is of another type. The message names the task. |
| `replay_breakpoints_unsupported` | 400 | `breakpoints` was given. Replay with breakpoints is not available. |
| `task_run_not_found` | 404 | `taskRunId` is not a task run of this execution, for example after a restart removed it. |
| `flow_version_not_found` | 404 | The flow has no published version N. |

Restart and a task-run state change also give the flow refusals replay gives: `404` when the flow is in the trash or was deleted permanently, `409` *Cannot execute flow: flow is disabled.*, and `400` *the flow contains an `egret.sql` task, which runs as the flow's creator, so only its creator can start it* when you are not the flow's creator.

Replay and restart on another version have refusals without a code. A chosen version whose own YAML says `disabled: true` answers `409`. A task run inside a `Loop` iteration answers `400` and names the `Loop` task to replay from. If the chosen version has an `egret.sql` task, which runs as the flow's creator, only the creator can run it (`400`): this is judged on the version that runs, so a version that adds an `egret.sql` task is refused to anyone else. `files_pruned`, `after_execution_running` and `inside_working_directory` apply to a replay from a task and to a restart on another version, and not to a replay of the whole execution.

A state outside **Success**, **Warning**, **Failed** and **Cancelled** is refused with `400`. An execution id from another workspace answers `404`.

## Permission and audit

**Restart**, **Replay**, **Change status** and **Change state** need `workflow:manage`; without it the buttons are hidden. Each one is written to the audit log: `workflow_execution:restart`, `workflow_execution:replay`, `workflow_execution:set_status` and `workflow_execution:set_task_run_state`. Replay and restart events carry `task_run_id`, `source`, `inputs_replaced` and `replayed_from`.

## Replay an execution

Use replay to run a failed execution again, or to repeat a successful one, as a new execution. To start from one task, see [Replay from a task](#replay-from-a-task).

1. Open a finished execution (any state that has ended).
2. Press **Replay**.
3. In the dialog, choose the version under **Run on** (see [Choose the version](#choose-the-version)), press **Change inputs** if you want other inputs, and press **Replay**.

![The replay dialog with the choice of version and the Change inputs section](/img/platform/workflows/execution-replay-dialog.png)

With **This run's version**, the dialog says *Replay starts a new execution from this execution's frozen YAML and inputs. Edits made to the flow since it ran are not used.* With another version it says *Replay starts a new execution from the version you pick, with this execution's inputs unless you change them.* It lists the names of the inputs the replay will use (*Inputs: customer, orders.*), or says *It has no inputs.* The page then opens the new execution, which shows **Replayed from** the original and **Replay** in the **Trigger** column of the list. A replay has the label `system.replay: true`.

Things to know:

- **It starts from the beginning.** A replay from the button at the top runs all tasks again. To start from a task, use the row menu.
- **By default it uses the old text.** To use the fix you made to the flow, choose **The flow's current version**, or press **Run** on the flow's page.
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
- Replay with breakpoints (stopping before chosen tasks) is not available: it is refused with `replay_breakpoints_unsupported`.
- Not available: delete an execution and force-run.
- A restart cannot be started on a loop iteration, on an execution whose `afterExecution` tasks are still running, or after the pruner deleted its files.
- **Change state** is not offered for a task run inside a `WorkingDirectory` block. A task-run state change is refused with `after_execution_running` while a task run of the ended execution is still **Paused**.
- A `Subflow` inside a `LoopUntil` is matched to its earlier child by position only, so a restarted iteration starts a new child. A restarted `Subflow` whose child is still running waits for it.
- Restart and the state changes act on one execution; there is no bulk version.
- A replay or a restart on another version is refused when the retention pruner deleted the files of the execution, or of one it was replayed from, with `files_pruned`. The check follows the replay chain only: a source whose files were deleted behind a retry's parent link is not refused.
- A task run inside a `Loop` iteration cannot be picked: replay from the `Loop` task.

## Further reading

- [Execution details](./detail.md)
- [Flow control: Pause](../flows/flow-control.md#pause)
- [Runtime and operations](../runtime.md)
