---
sidebar_position: 4
---

# Workflows stuck

*Reproduced.* An execution stays in *Running* and never finishes, or a schedule or trigger never starts one.

## An execution stays in *Running*

### Cause: the workflow worker is off

The worker that claims and runs tasks is **off by default** (`workflow.worker_enabled = false`). With it off, **Run** works:
Egret creates the execution, shows it as *Running*, and nothing ever advances it. There is no error and the flow editor shows
no warning.

Reproduced on a server started with the defaults:

- `POST /api/ws/default/workflows/flows/{id}/executions` answered with an execution in state `RUNNING` and history
  `["CREATED","RUNNING"]`.
- Six seconds later, and at any later time, the same execution was still `RUNNING` with `ended_at` empty and no logs.
- The server log said so at start, once:

  ```text
  workflow worker disabled by config; no claim loop, no reaper
  workflow scheduler disabled by config; no trigger loop
  ```

### Fix

Enable the worker, and the scheduler if you use triggers, and restart:

```bash
EGRET_WORKFLOW__WORKER_ENABLED=true
EGRET_WORKFLOW__SCHEDULER_ENABLED=true
```

In the Helm chart, set `workflow.workerEnabled=true` and `workflow.schedulerEnabled=true`. A server that was running keeps
the old setting until it restarts. Executions created while the worker was off are claimed once it starts; they do not need
to be re-run.

Any replica with the worker on can run any execution: there is no leader election. A replica dedicated to serving can keep
the worker off.

## A schedule or trigger never fires

| Cause | Check and fix |
|---|---|
| The scheduler is off (`workflow.scheduler_enabled`, default `false`) | `cron:` schedule triggers are recorded when you save a flow, and nothing fires them. Set `EGRET_WORKFLOW__SCHEDULER_ENABLED=true`. The **Triggers** page warns about this; the flow editor does not. |
| The scheduler is on but the worker is off | Executions are created and never run. The server logs a warning at start. Turn both on. |
| The trigger is disabled | **Workflows → Triggers** shows its state; enable it there. |
| A flow trigger (a flow that starts after another reaches a state) listens, but the scheduler was off | Events are written to an outbox even with the scheduler off. Turning it on processes the backlog oldest first, at most 500 events or about a second per tick. Expect old transitions to fire. |

Triggers are ticked every `workflow.trigger_interval_secs` (1 second), so latency between a cron instant and its execution is
about that.

## An execution was running and then stopped moving

A worker claims a task run with a lease. If the replica dies mid-task, the **reaper** hands the run back once the lease is
older than `workflow.working_timeout_s` (3600 seconds). Until then the execution looks stuck.

- Wait for the timeout, or lower `workflow.working_timeout_s` if your tasks are short. Too low and a live worker that is
  still inside a slow task has its run handed to a second worker, so the task runs twice.
- Kill the execution from **Workflows → Executions** (`POST /api/ws/{workspace}/workflows/executions/{id}/kill`). The worker
  polls for a kill every `workflow.kill_poll_ms` (5000 ms) and records the run as killed.
- An execution in *Paused* waits for a person: **Resume** it.

## A script or container task never starts, or is refused

Script tasks (`io.kestra.plugin.scripts.shell.*`, `...python.*`) need `workflow.container_runner` set to `docker`
(development) or `kubernetes`. With the default `none` no script handler is registered. They also need the workspace
feature `workflow_containers` and an image allowed by `workflow.plugin_configurations`. Kestra plugin tasks (`type:
kestra.<class>`) need `workflow_kestra_plugins` and `workflow.plugin_host.image`. The server refuses to start with a runner
other than `none` and no `plugin_host.image`. See [Configuration keys](../../reference/configuration-keys#workflow).

## How to tell which case you have

1. Open the execution under **Workflows → Executions** and read the **Logs** tab. No log lines at all, for an execution older
   than a few seconds, points at the worker being off.
2. Read the server log from start for `workflow worker disabled by config`.
3. In the database, `select state, history, ended_at from workflow.executions order by created_at desc limit 5` shows
   executions that never ended.

## Further reading

- [Flows](../../workflows/flows)
- [Executions](../../workflows/executions)
- [Triggers](../../workflows/triggers)
