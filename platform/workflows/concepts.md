---
sidebar_position: 1
---

# Workflow concepts

Workflows run multi-step jobs written as YAML: query a database, call a Data API endpoint, move files, wait for a person, then do the next thing. This page names the parts of the system so the rest of the Workflows pages read easily.

Egret's engine implements the flow language of [Kestra](https://kestra.io) 2.0 (pinned to 2.0.0-rc13). Task types keep Kestra's full class names, such as `io.kestra.plugin.core.log.Log`, and a Kestra flow that only uses supported tasks can be pasted in as it is. Where egret does something different, or does not do it yet, the matching page says so.

## The building blocks

### Flow

A flow is one YAML document with an `id`, a `namespace` and a list of `tasks`. It can also declare inputs, variables, outputs, error handling and triggers. A flow is identified by its namespace plus its id, so `company.team/hello` and `docs.demo/hello` are different flows. The full list of keys is in the [flow YAML reference](./flows/yaml-reference.md).

A flow has a **draft** (the text you saved last) and zero or more **versions** (snapshots you created on purpose). Saving changes the draft. **Run** starts an execution of the saved draft. **Create version** freezes a copy you can compare and restore later. See [Flows](./flows/index.md).

### Task

A task is one step. Every task has an `id` and a `type`. There are two kinds:

- **Runnable tasks** do work and end: write a log line, set a KV key, write a file.
- **Flowable tasks** decide what runs next: `If`, `Switch`, `Parallel`, `Loop` and similar. They hold other tasks. See [Flow control](./flows/flow-control.md).

The [task catalogue](./flows/task-catalogue.md) lists every task type the engine knows and which ones need extra infrastructure.

### Namespace

A namespace is a dotted name such as `company.team`. It groups flows and owns **namespace files** and a **key-value (KV) store** that those flows can read. A namespace's parents (`company` for `company.team`) are listed too. See [Namespaces](./namespaces/index.md).

### Execution

An execution is one run of a flow. It keeps its own copy of the flow's YAML and the inputs it started with, so editing the flow later does not change a run that is under way or its replay. An execution has a state, a list of task runs, logs and outputs. See [Executions](./executions/index.md).

### Trigger

A trigger starts executions by itself. Egret runs three kinds: **Schedule** (a cron expression), **Flow** (another flow's execution ended) and **Webhook** (an HTTP call, off by default). See [Triggers](./triggers/index.md).

## The moving parts

| Part | What it does | Switch |
|---|---|---|
| **Worker** | Claims task runs that are ready and runs them. Without it an execution starts and then waits in *Running* for ever. | `EGRET_WORKFLOW__WORKER_ENABLED` (default off) |
| **Scheduler** | Evaluates Schedule and Flow triggers and creates their executions. | `EGRET_WORKFLOW__SCHEDULER_ENABLED` (default off) |
| **Container runner** | Runs script tasks (shell, Python) in containers. | `workflow.container_runner` = `none`, `docker` or `kubernetes` (default `none`) |
| **Plugin host** | A separate Java container that runs Kestra plugin tasks (JDBC queries). | Workspace feature **Workflow Kestra plugins**, plus a plugin host image |

The Docker demo stack these pages were checked on runs the worker and the scheduler, with webhooks off and no container runner. Every core task, Pause, Subflow, Loop, retries, kill, replay, schedules, backfills and flow triggers ran there. Script tasks, Kestra plugin tasks (including the JDBC Trino query) and egret platform tasks (`egret.sql`, `egret.report.send` and the others) are refused before they start, so they are documented from the source. See [Runtime and operations](./runtime.md#what-runs-on-the-docker-demo-stack) for the full list.

## Execution states

An execution and each of its task runs move through these states. The first three groups are what you will see most.

| State | Meaning | Ends the execution |
|---|---|---|
| `CREATED`, `QUEUED` | Accepted, waiting for the engine. | No |
| `RUNNING` | At least one task run is working. | No |
| `PAUSED` | A `Pause` task or a `LoopUntil` is waiting. | No |
| `RETRYING`, `RESTARTED` | A task is being tried again, or a paused execution was resumed. | No |
| `KILLING` | A kill was sent and a worker is stopping the running task. | No |
| `SUCCESS` | Everything finished without a failure. | Yes |
| `WARNING` | Finished, but a task failed under `allowFailure: true` or timed out under it. | Yes |
| `FAILED` | A task failed and nothing handled it. | Yes |
| `KILLED` | Stopped by a person. | Yes |
| `CANCELLED`, `SKIPPED`, `RETRIED`, `RESUBMITTED` | Used on task runs that were not run or were replaced. | Yes |

## What you can do with workflows

- [Write a flow in the editor](./flows/editor.md), run it with inputs and watch it in [Executions](./executions/detail.md).
- [Pass data between tasks](./flows/inputs-and-outputs.md) with [expressions](./flows/expressions.md).
- [Run a flow on a schedule](./triggers/schedule.md) and [backfill](./triggers/backfill.md) the ticks you missed.
- [Share files and values](./namespaces/index.md) between flows through a namespace.

## Permissions

Workflows use two permissions in each workspace: `workflow:read` to see flows and executions, and `workflow:manage` to create, edit, run, kill and replay. A third, `workflow:use_secrets`, is needed to save a flow that calls `secret()`. The [Runtime and operations](./runtime.md) page lists what each role gets.

## Further reading

- [Flows](./flows/index.md)
- [Executions](./executions/index.md)
- [Runtime and operations](./runtime.md)
