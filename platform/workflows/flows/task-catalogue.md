---
sidebar_position: 8
---

# Task catalogue

This page lists every task type the engine knows, grouped by what it does, with the properties you will use most and the outputs each one produces. The list is generated from the schema that the editor uses (`GET /api/ws/{workspace}/workflows/schema`), so it matches what the **Docs** tab shows on this server. Open the **Docs** tab in the editor for the full property list of a task.

Task types are written with their full class name. A few have a short alias, for example `core.log` for `io.kestra.plugin.core.log.Log`. Properties in the tables are the main ones, not every property.

## What runs where

| Group | Where it runs | Needs |
|---|---|---|
| Core tasks (this page, sections 1 to 6) | In the egret worker | The worker switch only |
| Script tasks | In a container | A container runner and the **Workflow containers** workspace feature |
| Kestra plugin tasks | In the plugin host, a Java container | The above plus the **Workflow Kestra plugins** feature |
| Egret platform tasks | Declared but not served | Nothing today |

Everything in sections 1 to 6 was run on the Docker demo stack, which has the worker and the scheduler on and no container runner. The script, plugin and platform tasks were not: the stack refuses them before they start (see [What runs on the Docker demo stack](../runtime.md#what-runs-on-the-docker-demo-stack)).

All tasks also accept the [common task keys](./yaml-reference.md#task-keys): `id`, `type`, `description`, `disabled`, `timeout`, `retry`, `runIf`, `allowFailure` and `allowWarning`.

## 1. Logging, debugging and execution control

| Type | Main properties | Outputs | What it does |
|---|---|---|---|
| `core.log.Log` | `message`, `level` | none | Writes a line to the execution's logs. |
| `core.debug.Return` | `format` | `value` | Renders a string and returns it. |
| `core.output.OutputValues` | `values` | `values` | Publishes a map of named values as outputs. |
| `core.execution.Fail` | `errorMessage`, `condition` | none | Fails the task on purpose, optionally only when `condition` is true. |
| `core.execution.Exit` | `state` | none | Ends the execution with the chosen state. |
| `core.execution.Assert` | `conditions`, `errorMessage` | none | Fails unless every expression in `conditions` is true. Logs `N succeeded, M failed`. |
| `core.execution.SetVariables` | `variables`, `overwrite` | none | Sets execution variables, read as `{{ vars.name }}` afterwards. |
| `core.execution.UnsetVariables` | `variables`, `ignoreMissing` | none | Removes execution variables. |
| `core.execution.Labels` | `labels` | none | Adds or overwrites labels on the running execution. |
| `core.flow.Sleep` | `duration` | none | Waits for an ISO-8601 duration. |
| `core.log.PurgeLogs` | `namespace`, `flowId`, `startDate`, `endDate`, `logLevels`, `purgeExecutionLogs`, `batchSize` | `count`, `executionLogsCount`, `nonExecutionLogsCount` | Deletes old log lines, limited to the flow's own namespace and its children. |

```yaml
id: assert-and-vars
namespace: docs.demo
tasks:
  - id: set
    type: io.kestra.plugin.core.execution.SetVariables
    variables:
      region: emea
  - id: check
    type: io.kestra.plugin.core.execution.Assert
    conditions:
      - "{{ vars.region == 'emea' }}"
  - id: label
    type: io.kestra.plugin.core.execution.Labels
    labels:
      checked: "true"
```

## 2. Flow control

These hold other tasks. They have their own page with a runnable example each: [Flow control](./flow-control.md).

| Type | One-line description |
|---|---|
| `core.flow.Sequential` | Runs tasks one after another. |
| `core.flow.Parallel` | Runs tasks together, optionally capped by `concurrent`. |
| `core.flow.If` | Runs `then` or `else` by a condition. |
| `core.flow.Switch` | Runs the `cases` entry that matches `value`, or `defaults`. |
| `core.flow.Dag` | Orders tasks by `dependsOn`. |
| `core.flow.Loop` | Runs a group once per value (Kestra's `ForEach`). |
| `core.flow.LoopUntil` | Repeats a group until a condition is true. |
| `core.flow.Subflow` | Starts another flow and optionally waits. |
| `core.flow.AllowFailure` | Lets a block fail without failing the flow. |
| `core.flow.Pause` | Waits for a resume or a timer. |
| `core.flow.WorkingDirectory` | Shares a working directory across script tasks (container runner needed). |

## 3. Internal storage files

Tasks that create and process files the execution owns. A file is addressed by a `kestra:///…` URI that a task returns in its outputs. Files are removed after `workflow.storage_retention_days` (30 by default).

| Type | Main properties | Outputs | What it does |
|---|---|---|---|
| `core.storage.Write` | `content`, `extension` | `uri` | Writes text to a new file. |
| `core.storage.Size` | `uri` | `size` | Returns the size in bytes. |
| `core.storage.Concat` | `files`, `separator`, `extension` | `uri` | Joins files into one. |
| `core.storage.Split` | `from`, `rows`, `bytes`, `partitions`, `regexPattern`, `separator` | `uris` | Splits a file into parts. |
| `core.storage.Reverse` | `from`, `charset`, `separator` | `uri` | Writes the lines in reverse order. |
| `core.storage.FilterItems` | `from`, `filterCondition`, `filterType`, `errorOrNullBehavior` | `uri`, `droppedItemsTotal`, `processedItemsTotal` | Keeps or drops records by an expression. The file must hold Ion records; a CSV written by `Write` fails with *item 0 … is not a record*. |
| `core.storage.DeduplicateItems` | `from`, `expr` | `uri`, `droppedItemsTotal`, `numKeys` | Drops repeated records by a key. Reads Ion records, as `FilterItems` does. |
| `core.storage.Delete` | `uri`, `errorOnMissing` | `deleted`, `uri` | Deletes a file. |
| `core.storage.PurgeCurrentExecutionFiles` | none | `uris` | Deletes the files this execution created. |

```yaml
id: storage-files
namespace: docs.demo
tasks:
  - id: write
    type: io.kestra.plugin.core.storage.Write
    content: |
      alpha
      beta
      gamma
    extension: .txt
  - id: size
    type: io.kestra.plugin.core.storage.Size
    uri: "{{ outputs.write.uri }}"
  - id: show
    type: io.kestra.plugin.core.log.Log
    message: "file size is {{ outputs.size.size }} bytes"
```

This run logged `file size is 17 bytes`.

## 4. Namespace files

Tasks that move files between an execution and the [namespace's files](../namespaces/files.md). They are limited to the flow's own namespace and its children.

| Type | Main properties | Outputs | What it does |
|---|---|---|---|
| `core.namespace.UploadFiles` | `namespace`, `destination`, `files`, `filesMap`, `conflict` | `files` | Copies execution files into the namespace. |
| `core.namespace.DownloadFiles` | `namespace`, `files`, `destination` | `files` | Copies namespace files into the execution; returns their URIs. |
| `core.namespace.DeleteFiles` | `namespace`, `files`, `deleteParentFolder` | `files` | Deletes namespace files. |
| `core.namespace.PurgeFiles` | `namespaces`, `namespacePattern`, `filePattern`, `behavior`, `includeChildNamespaces` | `size` | Purges files and their versions. |

```yaml
- id: download
  type: io.kestra.plugin.core.namespace.DownloadFiles
  namespace: docs.demo
  files:
    - /data/targets.csv
```

## 5. Key-value store

Tasks for the namespace's [KV store](../namespaces/kv-store.md). All take a `key` and an optional `namespace`.

| Type | Main properties | Outputs | What it does |
|---|---|---|---|
| `core.kv.Set` | `key`, `value`, `kvType`, `ttl`, `overwrite`, `kvDescription` | none | Creates or replaces a key. |
| `core.kv.Put` | `key`, `value` | none | Updates an existing key. |
| `core.kv.Get` | `key`, `errorOnMissing` | `value` | Reads a key. |
| `core.kv.GetKeys` | `prefix` | `keys` | Lists keys by prefix. |
| `core.kv.Delete` | `key`, `errorOnMissing` | `deleted` | Deletes a key. |
| `core.kv.PurgeKV` | `namespaces`, `keyPattern`, `behavior`, `includeChildNamespaces` | `size` | Purges keys. |

```yaml
id: kv-roundtrip
namespace: docs.demo
tasks:
  - id: save
    type: io.kestra.plugin.core.kv.Set
    key: last_run_note
    value: "written by {{ flow.id }}"
    kvType: STRING
  - id: read_back
    type: io.kestra.plugin.core.kv.Get
    key: last_run_note
  - id: show
    type: io.kestra.plugin.core.log.Log
    message: "KV says: {{ outputs.read_back.value }} / {{ kv('last_run_note') }}"
```

## 6. A tour of the core tasks

A flow that uses tasks from every group above ran 16 tasks in about 25 seconds: `Write`, `Concat`, `Reverse`, `Split`, `UploadFiles`, `DownloadFiles`, `Set`, `GetKeys`, `Delete`, `SetVariables`, `Labels`, `Sleep`, `Assert` and `Exit` all succeeded, and `Exit` with `state: WARNING` ended the execution in the **Warning** state.

## 7. Script tasks

Script tasks run shell or Python in a container.

| Type | Alias | Main properties |
|---|---|---|
| `io.kestra.plugin.scripts.shell.Commands` | `egret.container` | `commands`, `containerImage`, `env`, `inputFiles`, `outputFiles`, `namespaceFiles`, `taskRunner` |
| `io.kestra.plugin.scripts.shell.Script` | | `script`, and the same as above |
| `io.kestra.plugin.scripts.python.Commands` | | `commands`, `containerImage`, `beforeCommands`, and the same |
| `io.kestra.plugin.scripts.python.Script` | `egret.script.python` | `script`, and the same |

```yaml
- id: report
  type: io.kestra.plugin.scripts.python.Script
  containerImage: python:3.12-slim
  script: |
    print("hello from a container")
```

:::note Not available on the Docker demo stack
Script tasks are refused when the deployment has no container runner, and the demo stack has none. The editor reports *this egret deployment has no container runner (`workflow.container_runner`), so it cannot run `io.kestra.plugin.scripts.python.Script`*, and the flow cannot be started. They also need the **Workflow containers** feature on the workspace (a Control Plane setting, off by default) and the image on the platform's `allowed-images` list. The Python `dependencies`, `pythonVersion` and `packageManager` properties, and the `Process` task runner, are refused. This page documents them from the source; they were not run. On the demo stack the editor's **Problems** tab shows the message above and **Run** says *Fix 1 error to run*.
:::

## 8. Kestra plugin tasks

Plugin tasks run Kestra plugin code inside a separate Java container, the plugin host. Nine classes from three plugins are packaged.

| Plugin | Classes | Outputs |
|---|---|---|
| MySQL (`jdbc.mysql`) | `Query`, `Queries`, `Batch` | `rows`, `row`, `size`, `uri`, `outputs`, `rowCount`, `updatedCount` |
| PostgreSQL (`jdbc.postgresql`) | `Query`, `Queries`, `Batch`, `CopyIn`, `CopyOut` | the same, plus `rowCount` and `uri` for the copy tasks |
| Trino (`jdbc.trino`) | `Query` | `rows`, `row`, `size`, `uri` |

A plugin task is written with the `kestra.` prefix, which says "runs in the plugin host":

```yaml
- id: count_orders
  type: kestra.io.kestra.plugin.jdbc.trino.Query
  url: jdbc:trino://trino-demo:8080/tpch/tiny
  sql: select count(*) as n from orders
  fetchType: FETCH_ONE
```

:::note Not available on the Docker demo stack
Plugin tasks need the plugin host image, a container runner, and both workspace features. The demo stack has none of them: the example above, pointed at the stack's own Trino (`trino-demo`), is refused with *this egret deployment has no container runner*. It is documented from the source. `secret()` resolves only on these tasks.
:::

## 9. Egret platform tasks

The schema registers `egret.sql`, `egret.dataapi.call`, `egret.dataset.refresh`, `egret.report.send`, `core.http` and `core.slack` task types, but no deployment starts their handlers yet. A flow that uses one fails the check *this egret deployment has no handler for `egret.sql`* and cannot be started. They do not appear in the editor's suggestions.

So a flow cannot run SQL on an egret database, send a report or post a message today. There is no mail task either: Kestra's `notifications.mail.MailSend` is an unknown type, and the workspace SMTP setting (which delivers alerts and reports, to Mailpit on the demo stack) is not used by workflows. Workflows send no notifications: to find failed runs, filter the [Executions](../executions/index.md) page by **State: Failed**.

## Tasks Kestra has that egret does not

`http.Request`, `http.Download`, `http.SseRequest`, `PurgeExecutions`, `PurgeFlows`, `PurgeStorage`, `metric.Publish`, `TemplatedTask` and `ForEach` (renamed `Loop` in Kestra 2.0) are not available. A `type:` the engine does not know is an error when you save (`unknown_task_type`).

## Limits and known issues

- An unknown property on a task of a Kestra type saves with an `unknown_property` warning; on an egret-only task type it is accepted without a message.

## Further reading

- [Flow control](./flow-control.md)
- [Expressions](./expressions.md)
- [Runtime and operations](../runtime.md)
