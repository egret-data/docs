---
sidebar_position: 6
---

# Run history

Every run of an alert, Data API alert or report writes a row to its **run log**, whether it fired or not. The run log is the answer to "why didn't I get a message?": a schedule that wrote nothing is indistinguishable from a scheduler that never ran, so every outcome is recorded.

![The run log dialog for an alert, showing its recent runs with their states and details](/img/platform/alerts/run-log.png)

## Open the run log

Two places show it:

- In the list, open the **⋯** menu on a row and choose **Run log**. The dialog is titled *Run log — name*.
- Open the item. **Recent runs** under the editor shows the last five runs, newest first.

Each row has four columns.

| Column | What it shows |
|---|---|
| **State** | The outcome of the run. |
| **Started** | When the run began, for example `8 minutes ago`. |
| **Value** | The number the run measured: the first column of the first row for an alert, the metric for a Data API alert. Empty for a report. |
| **Detail** | An error or delivery message, shown in red. **Notification sent** when every destination took the message, and `—` when nothing was sent. |

## Run states

| State | Meaning | Notification sent |
|---|---|---|
| **Success** | The run completed, the condition was met (for a report, it ran), and every destination took the message. | Yes |
| **Not triggered** | The run completed and the condition was not met, or the query returned no rows or a null, or **Don't send when there are no rows** applied. | No |
| **On grace** | The condition was met, but the item already fired within its [grace period](./schedules#grace-period-seconds). | No |
| **Error** | The run could not complete (the query failed, the first column was not a number, or a report could not be rendered), or it fired and at least one destination did not take the message. **Detail** has the reason, one entry per failed destination. | Only to the destinations that took it |
| **Working** | A run is in progress, or a worker died mid-run and the run has not yet been reclaimed after the working timeout. | No |

The state labels in the API are `success`, `noop`, `grace`, `error` and `working`.

:::note
A run that fired but could not deliver to every destination is **Error**, so it counts in the list's **failing** total and shows a red badge. When some destinations took the message and others did not, **Detail** names each failure and the destinations that worked still received it.
:::

## Examples from a real run log

These runs were captured on the Docker demo stack, where email goes to Mailpit and the renderer is running. States and **Detail** are shown as Egret records them since platform #726:

| Item | State | Value | Detail |
|---|---|---|---|
| Pending orders above 100 (condition `> 100`, email and a webhook to a public host) | **Error** | 363 | `webhook <host>: webhook returned 405` (the email arrived) |
| Pending orders above 100, run again within the grace period | **On grace** | 363 | — |
| Cancelled orders spike (`> 0`) | **Not triggered** | 0 | — |
| Urgent open orders exist (value is not null and not zero) | **Success** | 1488 | **Notification sent** |
| Orders by status error rate, a Data API alert (`> 0.05`) | **Success** | 0.27 | **Notification sent** |
| Late orders to Slack, with no workspace Slack app | **Error** | 64 | `slack #<channel>: no slack bot token is configured for this destination` |
| Webhook to an internal host (`http://mailpit:8025/hook`) | **Error** | 7304 | `webhook mailpit: webhook host resolves to a blocked address (172.24.0.5): private` |
| Executive summary snapshot, a PNG report | **Success** | — | **Notification sent** |
| A five-dashboard PDF report (36.9 seconds to render) | **Success** | — | **Notification sent** |

Other messages you may see, all with **Error**: `email: smtp is not configured for this workspace`, `query failed: engine: line 2:8: Column 'nope' cannot be resolved` and `alert query must return a number or NULL in its first column, got "O"`.

When several destinations fail, **Detail** lists every one, separated by `; `, each prefixed with the destination: `email: …`, `slack #channel: …` or `webhook <host>: …`. A webhook is named by its host only, because the path and query of a webhook URL often carry its secret. A note about a delivery that did go out, such as a skipped attachment, follows the failures; it does not make the run an **Error**.

## Why didn't I get a message?

Work down this list.

1. **Is it active and scheduled?** The list shows **Paused** for an item whose **Active** switch is off, and **Next run** for one that will run.
2. **What did the last run record?** Open the run log.
3. **Not triggered**: the condition was not met. Check the **Value** against your threshold, and check that the query returns a number in its first column.
4. **On grace**: it fired recently. Wait out the grace period, or lower it.
5. **Error**: read **Detail**. Either the query, the first column, the renderer or the engine failed, or the condition was met and a destination refused the message: a missing SMTP server, a missing Slack app, a webhook to a blocked or failing address, or a non-`2xx` response. Each failed destination is named. `render failed: … (timeout)` means the renderer did not finish within its time limit; `render failed: error sending request …` means it could not be reached. See [Reports](./reports#png-and-pdf-need-the-renderer).

## Run now

**Run now** (in the row menu) runs the item once and shows the state in a message, for example *Ran now: Success*. It writes a run-log row like any run, and updates the **Last run** column in the list and the status badge on the item's page. It does not move **Next run**.

If a scheduled run of the same item is in progress (**Working**) when you press **Run now**, the manual run is still recorded in the run log, and the scheduled run writes **Last run** when it ends.

## Retention

Finished runs are kept for the item's **Run log retention (days)**, 90 by default. See [Schedules and limits](./schedules#run-log-retention-days).

## Limits and known issues

- **Value** is empty for reports, and in the run log dialog of a report the **Value** and **Detail** headings run together (KI-171).

## Further reading

- [Notifications](./notifications)
- [Schedules and limits](./schedules)
