---
sidebar_position: 2
---

# Flow YAML reference

This page lists every key a flow document can hold, in the order the editor's **Docs** tab shows them, and says what the engine does with each one. The language is Kestra 2.0's flow language, so a key that is not listed here is either not part of it or is ignored.

:::warning Accepted does not always mean enforced
A flow can contain keys that the engine reads, stores and then does not act on. The editor warns about `concurrency`, `checks`, `sla` and `quotas` (*not yet enforced*), about every key marked **Ignored** (`ignored_property`), and about a key that is not a property at all, such as a typo (`unknown_property`), on the flow, a task of a Kestra type, a retry and a trigger (egret-only task types are not checked). It does not warn about flow-level `finally` and `afterExecution` (**Not run yet** below). Check the status column before you rely on a key.
:::

## A complete example

```yaml
id: greet-customer
namespace: docs.demo
description: Greets a customer and shows how inputs, variables and expressions combine.
labels:
  team: docs
  tier: demo
inputs:
  - id: customer
    type: STRING
    defaults: Ada
variables:
  greeting: Hello
tasks:
  - id: say_hello
    type: io.kestra.plugin.core.log.Log
    message: "{{ vars.greeting }}, {{ inputs.customer | upper }}!"
errors:
  - id: notify_failure
    type: io.kestra.plugin.core.log.Log
    level: ERROR
    message: "Run {{ execution.id }} failed"
```

## Top-level keys

| Key | Type | Status | What it does |
|---|---|---|---|
| `id` | string, required | Works | The flow's name. 1 to 100 characters, letters, digits, `.`, `_` and `-`, starting with a letter or digit. |
| `namespace` | string, required | Works | 1 to 150 characters: lowercase letters, digits, `.`, `_` and `-`, starting with a lowercase letter or digit. A dot separates a parent from a child. |
| `description` | string | Works | Free text shown in the editor. |
| `labels` | map or list | Works | Key-value pairs copied onto every execution of the flow. Write a map (`team: docs`) or a list of `key` and `value` pairs. |
| `inputs` | list | Works | Values asked for when the flow starts. See [Inputs and outputs](./inputs-and-outputs.md). |
| `variables` | map | Works | Constants for the flow, read as `{{ vars.name }}`. |
| `tasks` | list, at least one | Works | The steps. See [Task catalogue](./task-catalogue.md) and [Flow control](./flow-control.md). |
| `errors` | list of tasks | Works | Tasks that run when a task fails. See [Retries, errors and timeouts](./error-handling.md). |
| `outputs` | list | Accepted, not evaluated | Declared outputs of the flow. A flow's own outputs are not computed or shown, and a parent flow reading a subflow's `outputs` gets an empty map. |
| `triggers` | list | Works for `Schedule`, `Flow` and `Webhook` | What starts the flow. See [Triggers](../triggers/index.md). |
| `retry` | retry policy | Works | Runs the whole flow again as a new execution when it fails. See below. |
| `disabled` | boolean, default `false` | Works | A disabled flow cannot be run and its triggers do not fire. |
| `concurrency` | `limit`, `behavior` | Accepted, not enforced | The editor warns *`concurrency` is declared in this flow but is not yet enforced*. Two executions of a flow with `limit: 1` ran at the same time in testing. |
| `checks` | list of `when`, `message`, `behavior`, `style` | Accepted, not enforced | Same warning. `when` and `message` are required. |
| `sla` | list | Accepted, not enforced | Same warning. |
| `quotas` | list | Accepted, not enforced | Same warning. Kestra marks quotas as an Enterprise feature. |
| `finally` | list of tasks | Not run yet | Parsed and kept, but its tasks never run. The execution's topology shows them as *Finally · Not run*. |
| `afterExecution` | list of tasks | Not run yet | Parsed and kept, but never run. |

Keys such as `deleted`, `draft`, `revision`, `updated`, `workerSelector` and `policyRefs` are read from imported Kestra flows and ignored; the editor warns about each (`ignored_property`).

### Flow-level retry

```yaml
retry:
  type: constant
  interval: PT2S
  maxAttempts: 3
  behavior: CREATE_NEW_EXECUTION
```

When the flow fails, the engine starts a new execution of it and marks the failed one `RETRIED`. In testing a flow that always fails produced two `RETRIED` executions and a final `FAILED` one, each linked to the previous attempt.

## Task keys

Every task has the same base keys, then its own. A task entry looks like this:

```yaml
- id: fetch_rows
  type: io.kestra.plugin.core.log.Log
  description: Optional text
  message: Hello
  timeout: PT30S
  retry:
    type: constant
    interval: PT1S
    maxAttempts: 3
  runIf: "{{ vars.env == 'prod' }}"
  allowFailure: true
```

| Key | Status | What it does |
|---|---|---|
| `id` | Works | Unique among all tasks in the flow, including nested ones. Referenced as `outputs.<id>`. A duplicate is the error `duplicate_task_id`. An id with a dash must be written with brackets in expressions (`outputs['first-task']`); the dotted form is refused with `dashed_output_reference`. |
| `type` | Works | The task type, written with its full class name or a short alias such as `core.log`. See [Task catalogue](./task-catalogue.md). |
| `description` | Works | Free text. |
| `disabled` | Works | A disabled task is not run and has no task run. |
| `timeout` | Works | An ISO-8601 duration. When it passes the task fails with *Timeout after 00:00:03.000*. |
| `retry` | Works | Runs the task again when it fails. See below. |
| `runIf` | Works | An expression. When it renders to a false value the task ends `SKIPPED` and the flow goes on. |
| `allowFailure` | Works | The task may fail without failing the execution; the execution ends `WARNING`. |
| `allowWarning` | Works | Same idea for tasks that end in a warning. |
| `logLevel`, `logToFile`, `taskCache`, `workerGroup`, `workerSelector`, `version`, `assets`, `policyRefs` | Ignored | Accepted from Kestra flows and ignored, with a warning when you save. |

### Task retry

Three retry types are available. All of them take `maxAttempts`, `maxDuration` and `behavior` (`RETRY_FAILED_TASK`, the default, or `CREATE_NEW_EXECUTION`).

| `type` | Required keys | Delay between attempts |
|---|---|---|
| `constant` | `interval` | The same `interval` each time. |
| `exponential` | `interval`, `maxInterval` | Starts at `interval` and grows by `delayFactor` after each attempt, up to `maxInterval`. |
| `random` | `minInterval`, `maxInterval` | A random time between the two. |

Intervals are ISO-8601 durations such as `PT1S`. The `warningOnRetry` key is accepted and has no effect; the editor warns `ignored_property`. The **Gantt** and **Logs** tabs show each attempt of a task that was retried.

## Inputs, outputs and expressions

Any string value can hold an expression written in `{{ }}`. The flow keys above are available to expressions as `inputs`, `vars`, `outputs`, `labels`, `flow`, `execution`, `task` and `taskrun`. See [Expressions](./expressions.md).

## Limits and known issues

- Flow-level `finally` and `afterExecution` (the **Not run yet** rows) produce no warning when you save.
- A flow in the trash keeps its namespace and id reserved until it is restored or deleted permanently. See [Flows](./index.md#delete-restore-and-trash).
- The editor schema lists `ForEach`-style loops as `Loop`. A flow that uses `ForEach` is refused.

## Further reading

- [Flow control](./flow-control.md)
- [Retries, errors and timeouts](./error-handling.md)
- [Triggers](../triggers/index.md)
