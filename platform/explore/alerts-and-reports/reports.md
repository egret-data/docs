---
sidebar_position: 3
---

# Reports

A report delivers a dashboard or a chart to a list of recipients on a schedule, so people who never open Egret still see the numbers. Use a report for the Monday sales summary or a daily CSV of one chart's data.

![The Reports tab](/img/platform/alerts/reports-list.png)

## Create a report

1. Go to **Explore → Alerts & Reports**, open the **Reports** tab and press **+ Report**.
2. On **General**, name the report and choose its owners.
3. On **Contents**, choose what to deliver and in which format.
4. On **Schedule**, choose when it runs. See [Schedules and limits](./schedules).
5. On **Notification**, add destinations and write the message. See [Notifications](./notifications).
6. Press **Create**.

The **General** tab is the same as for an [alert](./create-an-alert#general). A report has no condition: it delivers on every run.

## Contents

![The Contents tab: Deliver, Dashboard, Format](/img/platform/alerts/editor-report.png)

| Setting | What it does |
|---|---|
| **Deliver** | **A dashboard** or **A chart**. |
| **Dashboard** or **Chart** | The object to deliver. The label follows the choice above. |
| **Also include dashboard** or **Also include chart** (via **+ Add another**) | Adds another object as an extra page in the same document. |
| **Format** | **PNG image**, **PDF**, **CSV data** or **Text**. |

### Formats

| Format | What recipients get | Needs the renderer |
|---|---|---|
| **PNG image** | A picture of the object. | Yes |
| **PDF** | A document. Several objects are always delivered as one multi-page PDF, so the format switches to PDF when you add a second object. | Yes |
| **CSV data** | The data behind the chart as a file. | No |
| **Text** | The data as text in the message. | No |

### PNG and PDF need the renderer

Charts and dashboards are drawn in a browser, so PNG and PDF reports are produced by a separate rendering service (`egret-renderer`) that Egret calls over HTTP. If the service is not deployed or cannot be reached, the run fails and the run log shows the cause, for example:

```text
render failed: error sending request for url (http://egret-renderer:8080/render)
```

:::warning Not run in this walk-through
The demo instance used for these docs has no rendering service. A PDF report for the **Sales overview** dashboard was created and run, and failed with the error above, so PNG and PDF output could not be captured here. The **CSV data** report below ran as designed.
:::

## A worked example

**Revenue by status CSV** delivers the chart **Revenue by order status** as a CSV every day at 06:30 UTC to `finance@example.com`:

| Setting | Value |
|---|---|
| **Deliver** | A chart: **Revenue by order status** |
| **Format** | **CSV data** |
| **Schedule** | Daily at 06:30, UTC |
| **Notification** | Email `finance@example.com` |

**Run now** produced a **Success** run. The workspace has no email server, so the run log's **Detail** reads `smtp is not configured for this workspace`: the report rendered, and only the send failed. See [Run history](./run-history).

## Reports and grace

Reports ignore the grace period. A report that runs on its schedule always delivers.

## Limits and known issues

- PNG and PDF reports depend on the rendering service.
- Report subjects accept the same placeholders as alerts, for example `Weekly sales overview - {{date}}`.

## Further reading

- [Notifications](./notifications)
- [Dashboards](../dashboards)
- [Workspace settings → Notifications](../../workspace-settings/notifications)
