---
sidebar_position: 1
---

# Alerts & reports

**Alerts & Reports** runs work on a schedule and tells people about the result. There are three kinds of scheduled item, all in one list:

| Kind | What it does | Where you create it |
|---|---|---|
| **Alert** | Runs a SQL query on a schedule and notifies you when the first value it returns meets a condition. | **+ Alert** on the **Alerts** tab |
| **Data API alert** | Watches the traffic of a [Data API](../data-api/overview) endpoint (error rate, call count, latency) and notifies you when a measurement crosses a threshold. | **+ Data API alert** |
| **Report** | Delivers a dashboard or a chart to a list of recipients on a schedule, as an image, PDF, CSV or text. | **+ Report** on the **Reports** tab |

![The Alerts tab listing four alerts, one of them a Data API alert](/img/platform/alerts/alerts-list.png)

## The list

Open **Explore → Alerts & Reports**. The page has two tabs, **Alerts** (which also lists Data API alerts, marked with a **Data API** tag) and **Reports**.

| Column | What it shows |
|---|---|
| **Name** | The name, a star to bookmark it, and its description. |
| **Active** | A switch. Turn it off to pause the schedule without deleting it; a paused item shows **Paused** and keeps its history. |
| **Last run** | The result of the last *scheduled* run: **Success**, **Working**, **Error**, **Not triggered** or **On grace**. **Never run** until the scheduler has run it. See [Run history](./alerts-and-reports/run-history). |
| **Schedule** | A plain-language form of the cron schedule, with the timezone, for example `Every day at 08:00 Asia/Ho_Chi_Minh`. Hover for the raw cron expression. |
| **Next run** | When the scheduler will run it next, for example `in 9 hours`. |
| **Owners** | The people whose permissions the query runs with. |

Above the table: **Search** by name, description or owner; **Last run** filters by state (including **Never run**); the counters show how many are total, **active** and **paused** and a **failing** shortcut. The toolbar buttons are **Bookmarks**, **Bulk select**, **Trash** and **New folder**. Folders group items on the page.

### Row actions

The **⋯** menu on a row:

![The row menu with Run log, Run now, Edit, Move to new folder and Move to Trash](/img/platform/alerts/row-menu.png)

| Action | What it does |
|---|---|
| **Run log** | Opens the history of runs for this item. |
| **Run now** | Runs it once immediately and shows the result in a message such as *Ran now: Success*. A manual run follows the same rules as a scheduled one, including the grace period. |
| **Edit…** | Opens the editor. |
| **Move to new folder…** | Puts it in a folder. |
| **Move to Trash** | Soft-deletes it so the scheduler stops running it. **Trash** offers **Restore** and **Delete permanently**; permanently deleting also removes the run history and recipients. |

## Permissions

Creating, editing and deleting alerts and reports needs the `alert:manage` permission, which the built-in **ws_editor** and **ws_admin** roles hold. Viewing the list needs only workspace membership. A single permission covers alerts, Data API alerts and reports.

An alert **runs as its owner**. The query is executed with the owner's permissions, so row filters and column masks that apply to the owner apply to the alert. Leave **Owners** empty and you become the owner; naming several owners keeps the alert running when one person leaves.

## What the pages cover

| Page | Covers |
|---|---|
| [Create an alert](./alerts-and-reports/create-an-alert) | The General and Condition tabs, and a worked example. |
| [Reports](./alerts-and-reports/reports) | Delivering a dashboard or chart. |
| [Schedules and limits](./alerts-and-reports/schedules) | Cron, repeat options, timezone, grace period, timeouts and retention. |
| [Notifications](./alerts-and-reports/notifications) | Email, Slack and webhook destinations; message text; attachments. |
| [Run history](./alerts-and-reports/run-history) | Run states, the run log, and why a notification did not arrive. |
| [Data API alerts](./alerts-and-reports/data-api-alerts) | Watching endpoint traffic. |

:::note
Egret needs somewhere to send the message. Email needs workspace SMTP and Slack needs a workspace Slack app, both set under [Workspace settings → Notifications](../workspace-settings/notifications). Without them the alert still runs and records its result, but it tells nobody; the run log shows `smtp is not configured for this workspace`.
:::

## Limits and known issues

- **Last run** and the header badge on an item show the last *scheduled* run. A **Run now** result appears in the run log only, so a freshly created item you have only run manually still reads **Never run**.
- PNG and PDF reports need the rendering service; see [Reports](./alerts-and-reports/reports#png-and-pdf-need-the-renderer).

## Further reading

- [Workspace settings → Notifications](../workspace-settings/notifications)
- [Data API activity](../data-api/activity)
