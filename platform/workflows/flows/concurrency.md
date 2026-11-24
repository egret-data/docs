---
sidebar_position: 9
---

# Flow concurrency

A flow can limit how many of its executions run at the same time. When a new execution would exceed the limit, it waits in the **Queued** state and starts when a running one finishes. Use it to protect a source or a destination that cannot take parallel runs, for example a flow that rewrites one table.

## Set a limit

Add a `concurrency` block to the flow:

```yaml
id: my-flow
namespace: company.team
concurrency:
  limit: 2        # max concurrent executions of this flow (>= 1)
  behavior: QUEUE # what to do when at the limit (default QUEUE)
tasks:
  - id: hello
    type: io.kestra.plugin.core.log.Log
    message: Hello from egret
```

| Key | What it does |
|---|---|
| `limit` | The most executions of this flow that may run at once. Must be 1 or more. |
| `behavior` | What happens to a new execution when the flow is at its limit. Default `QUEUE`. |

The limit is per flow: each flow has its own count, and a subflow's executions count against the subflow's own flow, not the parent's.

## What happens at the limit

1. A flow with `limit: 2` already has two executions that are not finished (any non-terminal state).
2. You start a third one: manually, from a schedule, from a webhook or from a flow trigger.
3. The new execution is held in the **`QUEUED`** state. No task runs.
4. When one of the running executions ends, the **oldest** queued execution is promoted and runs.

So queued executions start in the order they were created. A queued execution shows a **Queued** state chip in the [executions list](../executions/index.md#find-an-execution) and on its detail page. To see what is waiting, filter the list by the **Queued** state.

<!-- TODO: screenshot: the executions list filtered by the Queued state -->

## Behaviors

| `behavior` | Status |
|---|---|
| `QUEUE` | A new execution over the limit is held in `QUEUED` until a slot frees. The default. |
| `CANCEL` | A new execution over the limit is set to `CANCELLED` at once, without running. |
| `FAIL` | A new execution over the limit is set to `FAILED` at once, without running. |

All three behaviors are enforced. A `CANCELLED` or `FAILED` over-limit execution is terminal at once — it runs no task and holds no slot — and still fires the usual end hooks (flow triggers, alerts). You can also act on a `QUEUED` execution by hand: see [unqueue and force-run](../executions/actions.md#unqueue-a-queued-execution).

## Limits and known issues

- The limit is enforced for **newly started** executions: scheduled, manual, webhook and flow-trigger runs.
- Executions created by **replay**, **restart** or as **subflow children** count toward the limit, but are not queued themselves yet. A replay or a restart can therefore briefly take a flow above its limit. A later release closes this gap.
- `limit` below 1 is refused when you save.

## Further reading

- [Flow YAML reference](./yaml-reference.md)
- [Executions](../executions/index.md)
- [Workflow concepts](../concepts.md#execution-states)
