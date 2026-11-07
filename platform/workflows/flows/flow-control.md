---
sidebar_position: 6
---

# Flow control tasks

Flow control tasks decide which other tasks run, in what order, how often and when to wait. Each one holds a list of child tasks. This page shows every flowable task the engine runs, with YAML you can paste into the [flow editor](./editor.md) and run. All examples use the namespace `docs.demo`; change it to a namespace you own.

| Task | Use it to |
|---|---|
| `Sequential` | Group tasks that run one after another. |
| `Parallel` | Run tasks at the same time. |
| `If` | Branch on a condition. |
| `Switch` | Branch on a value. |
| `Dag` | Order tasks by their dependencies. |
| `Loop` | Run a group of tasks once for each value. |
| `LoopUntil` | Repeat a group of tasks until a condition is true. |
| `Subflow` | Start another flow and optionally wait for it. |
| `AllowFailure` | Let a block fail without stopping the flow. |
| `Pause` | Wait for a person or a timer. |
| `WorkingDirectory` | Share one working directory between script tasks. |

Task types are written with their full class name, `io.kestra.plugin.core.flow.<Task>`. `ForEach` is not a task in Kestra 2.0 and egret refuses it; use `Loop`.

## Sequential

Tasks in a flow already run in order. `Sequential` groups some of them so a parent can treat them as one step, for example inside a `Parallel` branch or an `If`.

```yaml
- id: wrap_up
  type: io.kestra.plugin.core.flow.Sequential
  tasks:
    - id: step_one
      type: io.kestra.plugin.core.log.Log
      message: Step one
    - id: step_two
      type: io.kestra.plugin.core.log.Log
      message: Step two
```

It takes `tasks` and an optional `errors` list.

## Parallel

All child tasks start together. `concurrent` caps how many run at once; `0`, the default, means no cap.

```yaml
- id: notify
  type: io.kestra.plugin.core.flow.Parallel
  concurrent: 2
  tasks:
    - id: notify_sales
      type: io.kestra.plugin.core.log.Log
      message: Sales notified
    - id: notify_finance
      type: io.kestra.plugin.core.log.Log
      message: Finance notified
```

## If

`If` renders `condition` and picks `then` or `else`. The strings `false`, `0`, `-0`, an empty string and null count as false; everything else is true.

```yaml
- id: big_order
  type: io.kestra.plugin.core.flow.If
  condition: "{{ inputs.amount > 1000 }}"
  then:
    - id: flag_review
      type: io.kestra.plugin.core.log.Log
      message: "Order of {{ inputs.amount }} needs review"
  else:
    - id: auto_approve
      type: io.kestra.plugin.core.log.Log
      message: Order auto-approved
```

`If` has the output `evaluationResult`. On a finished run, the branch that did not run shows as *Not run* in the topology.

## Switch

`Switch` renders `value` and runs the `cases` entry with that key. When no key matches, `defaults` runs.

```yaml
- id: by_tier
  type: io.kestra.plugin.core.flow.Switch
  value: "{{ inputs.tier }}"
  cases:
    gold:
      - id: gold_perks
        type: io.kestra.plugin.core.log.Log
        message: Gold perks applied
    silver:
      - id: silver_perks
        type: io.kestra.plugin.core.log.Log
        message: Silver perks applied
  defaults:
    - id: no_perks
      type: io.kestra.plugin.core.log.Log
      message: No perks
```

The `If` and `Switch` above, with the `Parallel` and `Sequential` examples, make the flow `order-routing`. Its execution looks like this:

![The topology of a finished run: the taken branches are green and the others are marked Not run](/img/platform/workflows/execution-topology.png)

## Dag

`Dag` lists tasks with `dependsOn`, and the engine works out the order and which can run together. Each entry wraps a task in `task:`. A cycle or a dependency on a task that is not in the block is an error when you save (`dag_cycle`, `dag_dependency_not_found`).

```yaml
- id: pipeline
  type: io.kestra.plugin.core.flow.Dag
  tasks:
    - task:
        id: extract
        type: io.kestra.plugin.core.log.Log
        message: extract
    - task:
        id: transform
        type: io.kestra.plugin.core.log.Log
        message: transform
      dependsOn:
        - extract
    - task:
        id: load
        type: io.kestra.plugin.core.log.Log
        message: load
      dependsOn:
        - transform
```

## Loop

`Loop` is Kestra 2.0's `ForEach`. It renders `values` and runs the child tasks once for each item. Inside the loop, `{{ item.value }}` is the current item, `{{ item.index }}` its position, and `{{ item.key }}` the key when `values` is a map.

```yaml
- id: per_region
  type: io.kestra.plugin.core.flow.Loop
  values: ["emea", "apac", "amer"]
  concurrencyLimit: 2
  tasks:
    - id: announce
      type: io.kestra.plugin.core.log.Log
      message: "Processing {{ item.value }} (index {{ item.index }})"
```

| Property | What it does | Default |
|---|---|---|
| `values` | A YAML list, a map, a JSON array in a string, or an expression such as `"{{ inputs.regions }}"`. An internal-storage URI runs one iteration per line of the file. | required |
| `concurrencyLimit` | `1` runs iterations one at a time, in order. `N` runs up to N together. `0` runs them all together. | `1` |
| `transmitFailed` | Whether a failed iteration fails the `Loop`. | `true` |
| `outputs` | Values to collect from each iteration. See [Loop outputs](#loop-outputs). | none |
| `fetchType` | `FETCH`, `STORE` or `AUTO`: how the collected outputs are kept. | `AUTO` |
| `retry` | A retry policy that the tasks of each iteration inherit. See [Loop retry](#loop-retry). | none |
| `tasks` | The body, run once per item. | required |

**Each iteration is its own execution.** The parent execution shows only the `Loop` task. Each item starts a *child execution* with the flow's tasks inside the loop, and the parent's **Overview** tab lists them under **Child executions** with the iteration number and value. The tasks inside the body have no task runs in the parent, so their outputs are not reachable from tasks after the loop unless the `Loop` collects them with `outputs:`.

![The Overview tab of a loop's execution listing three child executions, one per value](/img/platform/workflows/execution-children.png)

### Loop outputs

Declare `outputs:` on the `Loop`, with the same `id`, `type` and `value` as [flow outputs](./inputs-and-outputs.md#flow-outputs), to collect a result from each iteration. The expressions are evaluated at the end of every iteration, after its `errors:` and `finally:`, and can read the iteration's task outputs and `{{ item }}`.

```yaml
- id: per_region
  type: io.kestra.plugin.core.flow.Loop
  values: ["emea", "apac", "amer"]
  outputs:
    - id: size
      type: INT
      value: "{{ outputs.count.value }}"
  tasks:
    - id: count
      type: io.kestra.plugin.core.output.OutputValues
      values:
        value: 1
- id: total
  type: io.kestra.plugin.core.log.Log
  message: "{{ outputs.per_region.iterationCount }} iterations ran"
```

After the loop, `outputs.per_region.outputs` is a list with one entry per iteration:

```text
{item: {value: "emea", iteration: 0}, outputs: {size: 1}}
```

`item.value` is the iteration's value as a string, `iteration` its zero-based index, and `key` is present only when `values` is a map. The list is in the order the iterations ended, which is index order with `concurrencyLimit: 1`. An iteration with no outputs adds no entry.

Every `Loop` run, with or without `outputs:`, also has the counters `iterationCount`, `runningIterations` and `terminatedIterations` (a map from state to count) under `outputs.<id>`.

| `fetchType` | What the list holds |
|---|---|
| `FETCH` | The outputs map of each iteration. |
| `STORE` | One Ion file per iteration, `outputs.ion` in the iteration's storage; the entry holds `{uri: "kestra:///…"}` instead of the map. |
| `AUTO` (default) | `STORE` when `values:` is a string that renders to a `kestra://` URI, otherwise `FETCH`. The choice is made once per run. |

Failure and limits:

- An output that fails to render or convert fails its iteration: the iteration's history gets `FAILED` after its terminal state (`CREATED RUNNING SUCCESS FAILED`). With `transmitFailed: true` (the default) the `Loop` ends `FAILED` and that iteration's outputs are not added. An output with `required: false` that fails is `null` and logs a warning.
- One iteration's outputs may serialise to at most 1 MiB and the whole list to 16 MiB. Beyond either, the iteration fails with a message that points to `fetchType: STORE`. With `transmitFailed: false`, an iteration refused by the 16 MiB total is not added and counts under `FAILED` in `terminatedIterations`, although its own execution shows `SUCCESS`; the reason is in the `Loop` run's log.
- `SECRET` and `FILE` outputs follow the [flow output rules](./inputs-and-outputs.md#flow-outputs). A `SECRET` output with `fetchType: STORE` (or `AUTO` over a file) is refused when you save, because the file would hold the value in clear. Duplicate output ids inside a `Loop` are refused (`duplicate_output_id`).
- The parent flow's own `outputs:` are not evaluated inside a `Loop` iteration.

### Loop retry

A `retry:` on a `Loop`, or on a task that contains it, applies to every task and `Subflow` inside each iteration. When several policies could apply to a task, the nearest wins: the task's own `retry:`, then one on an ancestor inside the iteration, then the `Loop`'s or its ancestors', then the flow's. The `Loop` run itself is never retried. A `retry:` with `behavior: CREATE_NEW_EXECUTION` that reaches a task inside a `Loop` is saved with a `not_honoured` warning and refused when it runs.

## LoopUntil

`LoopUntil` runs its tasks, then checks `condition`. It repeats until the condition is true or a limit in `checkFrequency` is reached. The loop's own outputs are under `outputs.<id>`, with `iterationCount`.

```yaml
- id: wait_for_it
  type: io.kestra.plugin.core.flow.LoopUntil
  condition: "{{ outputs.wait_for_it.iterationCount >= 3 }}"
  checkFrequency:
    interval: PT1S
    maxIterations: 5
  tasks:
    - id: tick
      type: io.kestra.plugin.core.log.Log
      message: "Check number {{ outputs.wait_for_it.iterationCount }}"
```

This run logged `Check number 1`, `2` and `3` and then succeeded. `checkFrequency` takes `interval`, `maxIterations` and `maxDuration`; they must be literal values, not expressions. With `failOnMaxReached: true` the task fails when a limit is reached. While the loop waits for the next check the execution shows **Paused**, and **Resume** is disabled with *Waiting on a loop condition, not a Pause task*.

## Subflow

`Subflow` starts another flow in the same workspace as a new execution. With `wait: true` (the default) the parent waits for it.

```yaml
- id: add
  type: io.kestra.plugin.core.flow.Subflow
  namespace: docs.demo
  flowId: add-numbers
  wait: true
  inputs:
    a: 20
    b: 22
```

The subflow's id and namespace must exist in the workspace. A subflow that calls itself is refused (`self_subflow`). The task's outputs are `executionId`, `state` and `outputs`. With `wait: true`, `outputs` is the called flow's [flow-level outputs](./inputs-and-outputs.md#flow-outputs), so `{{ outputs.sub.outputs.total }}` reads them. A called flow that declares outputs which were not stored (it ended before it ran, or its outputs failed) fails the `Subflow` run with `Failed to extract outputs with the error: …`. A `retry:` on the `Subflow` or on an ancestor applies to it. With `transmitFailed: true` (default) a failed subflow fails the parent. A Subflow appears in the topology as a node you can expand.

The called flow:

```yaml
id: add-numbers
namespace: docs.demo
inputs:
  - id: a
    type: INT
  - id: b
    type: INT
tasks:
  - id: sum
    type: io.kestra.plugin.core.output.OutputValues
    values:
      total: "{{ inputs.a + inputs.b }}"
```

## AllowFailure

`AllowFailure` runs its tasks in order. If one fails, the rest of the block is skipped, the block ends in a warning and the flow continues with the next task.

```yaml
- id: optional_block
  type: io.kestra.plugin.core.flow.AllowFailure
  tasks:
    - id: may_fail
      type: io.kestra.plugin.core.execution.Fail
      errorMessage: expected
- id: after
  type: io.kestra.plugin.core.log.Log
  message: still runs
```

The run ends in the **Warning** state, with `may_fail` failed and `after` successful. For one task use `allowFailure: true` on the task instead; see [Retries, errors and timeouts](./error-handling.md).

## Pause

`Pause` stops the execution in the **Paused** state until a person resumes it or a timer ends.

```yaml
- id: gate
  type: io.kestra.plugin.core.flow.Pause
  pauseDuration: PT5S
```

Without `pauseDuration` it waits until someone resumes it: open the execution and press **Resume**. With `pauseDuration` it resumes on its own after that time; in testing a 5-second pause went `PAUSED`, `RESTARTED`, `RUNNING`, `SUCCESS` without help.

![A paused execution with the Resume, Replay and Kill buttons](/img/platform/workflows/execution-paused.png)

A pause can only be released through the page or the API (`POST /executions/{id}/resume`). `Pause` accepts `pauseDuration` only: `tasks`, `errors`, `behavior` and `onPause` are refused when you save, and `onResume` is accepted and ignored (the editor warns `ignored_property`). Killing a paused execution ends it `KILLED` at once.

## WorkingDirectory

`WorkingDirectory` runs child script tasks one after another on the same filesystem, so files written by one task are visible to the next. It supports `inputFiles`, `outputFiles`, `namespaceFiles` and `cache`. Its children must be script tasks, and flowable tasks inside it are not supported.

```yaml
- id: build
  type: io.kestra.plugin.core.flow.WorkingDirectory
  tasks:
    - id: write
      type: io.kestra.plugin.scripts.shell.Commands
      commands:
        - echo "hello" > note.txt
    - id: read
      type: io.kestra.plugin.scripts.shell.Commands
      commands:
        - cat note.txt
```

:::note Not run on the Docker demo stack
Script tasks need a container runner (`workflow.container_runner = docker`) and the **Workflow containers** workspace feature. The Docker demo stack has neither, even though it runs on Docker, so this example is refused there and is documented from the source. `WorkingDirectory` runs with the Docker runner only; Kubernetes support is planned. See [Runtime and operations](../runtime.md#what-runs-on-the-docker-demo-stack).
:::

## Limits and known issues

- Flow-level `finally:` and `afterExecution:` never run. On flowable tasks only `AllowFailure` runs `finally`. See [Retries, errors and timeouts](./error-handling.md).
- `Pause` cannot hold child tasks, `errors` or `onPause`.
- `LoopUntil` bounds must be literals.

## Further reading

- [Task catalogue](./task-catalogue.md)
- [Retries, errors and timeouts](./error-handling.md)
- [Executions](../executions/index.md)
