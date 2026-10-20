---
sidebar_position: 1
---

# Triggers

A trigger starts a flow without a person pressing **Run**: on a schedule, when another flow ends, or when an outside system calls a URL. You declare triggers under `triggers:` in the flow's YAML, and the **Triggers** page lists them all, with their state and switches.

![The Triggers page listing six triggers in three namespaces: a flow trigger, schedules that are on, one switched off, one disabled in YAML, and a webhook under the webhooks-off banner](/img/platform/workflows/triggers-list.png)

## The three kinds

| Kind | Starts the flow when | Page |
|---|---|---|
| **Schedule** | The time matches a cron expression. | [Schedule triggers](./schedule.md) |
| **Flow** | Another flow's execution ends in a state you chose, optionally after several flows have each ended. | [Flow and webhook triggers](./flow-and-webhook.md) |
| **Webhook** | An HTTP request reaches the webhook's URL. Off by default on the server. | [Flow and webhook triggers](./flow-and-webhook.md) |

Other Kestra trigger types (`ScheduleOnDates`, `http.Trigger`, plugin triggers) are not fired. A trigger of any other type appears in the flow as *Not run by egret* with no switch.

```yaml
triggers:
  - id: every_minute
    type: io.kestra.plugin.core.trigger.Schedule
    description: Fires once a minute (UTC)
    cron: "* * * * *"
    timezone: UTC
```

## What a trigger needs to fire

Three things must be on, and the **Triggers** page tells you which is missing:

1. **The scheduler** (`EGRET_WORKFLOW__SCHEDULER_ENABLED=true`). Without it schedules and flow triggers do not fire, and the page says *The scheduler is off on this server, so schedules and flow triggers do not fire.*
2. **The worker** (`EGRET_WORKFLOW__WORKER_ENABLED=true`). Without it triggers create executions that never run: *The worker is off, so triggered executions are created but do not run.*
3. **Webhooks** (`EGRET_WORKFLOW__WEBHOOKS_ENABLED=true`), for webhook triggers only: *Webhooks are off on this server; their URLs answer 404.*

A disabled flow fires nothing: the page says *This flow is disabled, so none of its triggers fire.*

:::note A flow does not have to be published
A trigger fires from the flow's saved draft, so a flow with a schedule starts running as soon as you save it, before you create any version. A flow shows up on the **Triggers** page as soon as it has a trigger that parses.
:::

## Find a trigger

Go to **Workflows → Triggers**.

| Control | What it does |
|---|---|
| Search | Matches the trigger id, the flow and the namespace (*Search trigger id, flow or namespace…*). |
| **Namespace**, **Flow** | Narrow to a namespace or a flow. |
| **Kind** | **Schedule**, **Webhook**, **Flow** or **Other**. |
| **Backfill** | **Running**, **Paused** or **Any** backfill. |
| **State** | **Enabled** or **Disabled**. |
| Refresh | The button at the top right. |

The table's columns:

| Column | Meaning |
|---|---|
| **ID** | The trigger's `id`. |
| **Flow** | The flow as `namespace.flow`. |
| **Type** | An icon for the kind. |
| **Next run** | When a schedule fires next, or a dash. |
| **Last evaluated** | The last tick the scheduler processed, which is not always when an execution started. |
| **Last execution** | The state, id and age of the execution the trigger last started. Select the id to open it. |
| **Status** | *Active*, or who switched it off and when. |
| **Enabled** | The runtime switch. |
| **Backfill** | A **Backfill** button for a schedule, or the state of a running backfill. See [Backfill](./backfill.md). |
| **Details** | Opens the trigger's drawer. |

## Switch a trigger on or off

The **Enabled** switch turns a trigger off without editing the YAML. It works for all three kinds: a switched-off schedule stops firing, a switched-off flow trigger stops listening, and a switched-off webhook answers 409 *Cannot execute webhook: the trigger … is disabled.*

- A trigger with `disabled: true` in the YAML has no switch: it says *Disabled in the flow's YAML*. Remove the line in the editor to enable it.
- Switching a **schedule** back on asks what to do about the runs it missed. See [Schedule triggers](./schedule.md#switch-a-schedule-on-again).
- To switch several at once, select rows and press **Enable** or **Disable** above the table (at most 100 at a time; each trigger gets its own result).
- Switching needs `workflow:manage`.

## The details drawer

**Details** opens a drawer for one trigger:

![The details drawer of a schedule: its definition, schedule facts and last execution](/img/platform/workflows/trigger-details.png)

| Section | Contents |
|---|---|
| Status | Active, or *Switched off by Administrator 13 minutes ago*. |
| **Definition** | The trigger's YAML block. A webhook's key is hidden until you press **Reveal**. |
| **Schedule** | **Cron**, **Timezone**, **Next run** (in the trigger's zone and in yours), **Last evaluated**, **Last error** and **Missed ticks**. |
| **Backfill** | The running backfill's window, progress and what happens afterwards. |
| **Flow trigger** | The states heard, the mode, and the `dependsOn` conditions with *Met* or *Not met* and the window. |
| **Webhook** | The path, with **Reveal** and **Copy**. |
| **Last execution** | The state, id and time of the last run it started, or *This trigger has not started an execution.* |

## The Triggers tab of a flow

Every flow page has a **Triggers** tab with the same table for that flow's triggers.

![The Triggers tab of a flow with the switch off and the backfill button disabled](/img/platform/workflows/flow-triggers.png)

## Limits and known issues

- `trigger.date`, `trigger.body` and the other `trigger.*` values are not available inside task expressions, only in the trigger's own `inputs:`. See [Expressions](../flows/expressions.md).
- A trigger id may be declared once per flow; a duplicate is an error when you save.
- Changing a schedule's trigger `id` starts a new schedule from now.
- The page does not show trigger logs; a schedule's failure is in its **Last error**.

## Further reading

- [Schedule triggers](./schedule.md)
- [Flow and webhook triggers](./flow-and-webhook.md)
- [Backfill](./backfill.md)
- [Runtime and operations](../runtime.md)
