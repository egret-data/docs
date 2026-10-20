---
sidebar_position: 6
---

# Runtime and operations

This page is for the person who runs the platform: which switches make workflows run, how the engine behaves when something goes wrong, what it keeps and for how long, and who may do what. Settings are environment variables named `EGRET_WORKFLOW__<KEY>` (two underscores) or keys in the `[workflow]` section of `egret.toml`.

## Switches

| Setting | What it does | Default |
|---|---|---|
| `worker_enabled` | Starts the claim loop and the lease reaper. Without it an execution is created and then waits in *Running* for ever. | `false` |
| `scheduler_enabled` | Starts the trigger loop that fires schedules and flow triggers. Independent of the worker. | `false` |
| `webhooks_enabled` | Mounts the unauthenticated webhook routes. Off, they answer 404. | `false` |
| `container_runner` | `none`, `docker` or `kubernetes`. Needed for script tasks and the plugin host. | `none` |

Run the worker and the scheduler together unless you want a replica that only serves. A scheduler without a worker creates executions nobody advances, and the **Triggers** page says so.

## What runs on the Docker demo stack

The Docker demo stack (`just demo-up`) sets `EGRET_WORKFLOW__WORKER_ENABLED=true` and `EGRET_WORKFLOW__SCHEDULER_ENABLED=true` and leaves the other switches at their defaults. Each item below was tried on it.

| What | On the demo stack |
|---|---|
| Core tasks: log, outputs, variables, labels, assert, fail, exit, sleep, storage files, namespace files, KV | Run. |
| Flow control: `If`, `Switch`, `Parallel`, `Sequential`, `Dag`, `Loop`, `LoopUntil`, `AllowFailure`, `Subflow`, `Pause` | Run. A loop and a subflow create child executions. |
| Retries, timeouts, `errors:` handlers | Run. Flow-level `finally:` and `afterExecution:` do not run anywhere (see [Retries, errors and timeouts](./flows/error-handling.md)). |
| Resume, kill, replay | Work. A kill of a sleeping task ended `KILLED` about 4 seconds later. |
| Schedule triggers, backfills, flow triggers | Fire. |
| Webhook triggers | Not reachable: webhooks are off (the routes answer 404), and the frontend's web server does not forward `/workflows/v1/` to the backend. |
| Script tasks (`scripts.shell.*`, `scripts.python.*`) and `WorkingDirectory` with them | Refused before they start: no container runner is configured. Egret reaches Docker only through a socket proxy that is used to start engines. |
| Kestra plugin tasks (JDBC MySQL, PostgreSQL, Trino) | Refused: they need the container runner and the plugin host. The Trino engine `trino-demo` cannot be queried from a flow. |
| `egret.sql`, `egret.dataapi.call`, `egret.dataset.refresh`, `egret.report.send`, `core.http`, `core.slack` | Refused on every deployment: *this egret deployment has no handler for …*. |
| Notifications by mail | There is no mail task. The workspace SMTP setting that sends alerts and reports to Mailpit is not used by workflows. |

## Tuning

| Setting | Meaning | Default |
|---|---|---|
| `tick_interval_secs` | Seconds between claim ticks: the floor on how soon a ready task starts. | 1 |
| `batch` | Task runs one tick may claim. | 8 |
| `trigger_interval_secs` | Seconds between trigger evaluations. | 1 |
| `reaper_interval_secs` | Seconds between passes that hand back abandoned task runs. | 60 |
| `working_timeout_s` | How long a task run may hold its lease before the reaper takes it back. | 3600 |
| `kill_poll_ms` | How often a running task checks whether it was killed. | 5000 |
| `container_default_timeout_s` | Timeout for a script task with no `timeout:`. | 3600 |
| `log_retention_days` | Days to keep log lines (0 keeps them). | 30 |
| `storage_retention_days` | Days to keep execution files after the run ends (0 keeps them). | 30 |
| `kept_container_retention_days` | Days a kept task container outlives its run. | 7 |
| `log_run_max_lines`, `log_run_max_bytes` | Caps on the log one task run may write. | 10 000 lines, 10 MiB |
| `storage.max_file_bytes`, `max_task_bytes`, `max_read_bytes`, `max_namespace_files` | File caps. | 1 GiB, 5 GiB, 10 MiB, 10 000 |

## Behaviour when something goes wrong

- **A task type the deployment cannot run is refused up front.** The editor reports `task_type_not_served` and **Run** is disabled. An execution that slips through (started on an older build) is failed with a log line that says the deployment, not the flow, is at fault. It does not wait for ever.
- **A dead worker.** A task run whose worker stopped is handed back by the reaper after `working_timeout_s` and run again.
- **Retries and timeouts** are described in [Retries, errors and timeouts](./flows/error-handling.md).
- **Kill** stops a running task within `kill_poll_ms`; see [Run actions](./executions/actions.md).
- **Execution state is frozen.** An execution keeps its own YAML, so editing or deleting a flow does not change runs that already started.

## Workspace features

A workspace can switch workflow capabilities on or off under **Control Plane → Workspaces** (the workspace's Features tab).

| Feature | Default | Effect |
|---|---|---|
| **Workflows** | On | The Workflows pages and API. Off hides them and stops the workspace's schedules. |
| **Workflow containers** | Off | Allows script tasks. Requires **Workflows**. |
| **Workflow Kestra plugins** | Off | Allows Kestra plugin tasks (the JDBC plugins). Requires **Workflow containers**. |

Script and plugin tasks also need a `container_runner`, and the image on the platform's allowed-images list. The plugin host image is set under `workflow.plugin_host` (`image`, `jvm_max_heap` of 384m by default, `kill_grace_s` of 15). The Docker demo stack has none of this, so those parts are documented from the source.

## Permissions

| Permission | Allows |
|---|---|
| `workflow:read` | See flows, versions, executions, logs, namespaces, files, KV keys and triggers. |
| `workflow:manage` | Create, edit, version, run and delete flows; resume, replay and kill executions; edit namespace files and KV; switch triggers and start backfills. Granted to workspace editors and admins. |
| `workflow:use_secrets` | Save or publish a flow that calls `secret()`. Granted to workspace admins only. |

`workflow:read` is not enough for any action. A person with only read access sees read-only editors and disabled buttons with the reason beside them.

## Limits and known issues

- Flow `concurrency:`, `sla:`, `checks:` and `quotas:` are accepted and not enforced.
- Flow-level `finally:` and `afterExecution:` do not run.
- Deleting a flow keeps its namespace and id reserved.
- **One slow task holds up the others on its replica**. The worker runs the task runs it claimed in one tick one after another, and claims more only when they have all ended. On the demo stack a long `Sleep` kept four storage tasks of other executions in *Running* for 2 min 13 s, and no new task started, until the `Sleep` was killed. Keep long waits out of flows that share a replica with others, or kill them; a `Pause` does not hold the worker.
- The webhook URL is served by the backend under `/workflows/v1/`, a path the frontend's web server and the Helm ingress do not forward to the backend. Route it yourself before you switch webhooks on.
- Script tasks, plugin tasks and webhook calls were not run on the Docker demo stack; see the table above.

## Further reading

- [Workflow concepts](./concepts.md)
- [Configuration](../deploy-operate/configuration.md)
- [Troubleshooting](../deploy-operate/troubleshooting/index.md)
