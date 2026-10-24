---
sidebar_position: 11
---

# Export, reports and print

You can take a dashboard's data out of Egret in three ways: download the data of a single card, subscribe to the whole dashboard so that it is delivered on a schedule, or, for the system itself, render the dashboard as a page for an image or PDF. This page covers each.

![The Download data popover on a chart card](/img/platform/dashboards/card-export.png)

## Download the data of a card

1. Open the dashboard and hover the card. A download button appears at the top right, next to the pencil.
2. Press it. The **Download data** popover opens.
3. Choose a format, decide whether to keep the data formatted, and press **Download**.

| Format | What you get |
|---|---|
| **.csv** | A comma-separated file with a header row. Values that contain commas, quotes or line breaks are quoted. |
| **.xlsx** | An Excel workbook. Numbers and dates keep their types. |
| **.json** | A list with one object per row, keyed by the column headers. |
| **.png** | A picture of the chart as it is drawn on the card. Offered only for cards drawn as one chart image: not for a table, pivot table, Big number, Progress, Trend, Object detail or the default funnel. See [Export](../charts/the-chart-editor#export) for the full list. |

**Keep the data formatted** is on by default. On, the file has the values as the card shows them, for example "September 6, 2026" and "$187.50". Off, it has the raw values, for example `2026-09-06` and `187.50`. The hint under the checkbox changes with the choice. The checkbox does not apply to PNG.

The file is named after the card title, with the characters `\ / : * ? " < > |` replaced by `_` (or `chart` when there is no title), plus the extension.

### What is in the file

The download is built in your browser from the result already shown on the card, so it reflects the dashboard filters you have applied and any rename or format set in the card's visualization settings. Nothing is queried again.

For the table formats the popover says "The maximum download size is 10,000 rows." The result a card holds is limited by the chart's row limit, which Egret caps at 10,000 rows, so a file never has more rows than the card loaded.

The download button is not shown while the card is loading, has an error, is blocked by a required filter, or returned no columns. It is not shown in edit mode.

## Subscribe to a dashboard

To get a dashboard delivered regularly, create a **report** that targets it.

1. In **Explore → Dashboards**, open the **⋯** menu of the dashboard and choose **Subscribe…**.
2. The **New report** form opens in **Explore → Alerts & Reports** with the dashboard already chosen. Its sections are **General**, **Contents**, **Schedule** and **Notification**.
3. In **Contents**, **Deliver** is set to **A dashboard**, **Dashboard** is the dashboard you came from, and **Format** is one of **PNG image**, **PDF**, **CSV data** or **Text**. **+ Add another** adds more dashboards or charts to the same report.
4. Fill in the other sections and press **Create**.

The form, its schedule and delivery settings, owners and run history belong to Alerts & reports and are described there: see [Alerts & reports](../alerts-and-reports). Subscribe… appears only for people who can manage the dashboard.

PNG and PDF reports are produced by a separate rendering service that opens the dashboard as a page and captures it; CSV and text reports read the query results directly. On the Docker demo stack, which runs the renderer and delivers mail to Mailpit, a PNG of **Executive summary** arrived inside the email and a PDF arrived as an attachment. See [Reports](../alerts-and-reports/reports#what-recipients-get) for what the email looks like.

## Scheduled report rendering

When a PNG or PDF report runs, Egret opens a special page for each target:

```text
/embed/print/dashboard/<dashboard id>?t=<token>
/embed/print/chart/<chart id>?t=<token>
```

This page is for the rendering service, not for people. It has no navigation and no sign-in: the token in the address is its only credential. The token is made for one object and one user, works once, and expires after about a minute. Opening the address in a browser without a valid token shows a blank page, and a second visit with a used token fails.

What the page draws:

- the dashboard name as the page title, then **one block per chart card**, in the dashboard's card order, each with the chart's name and the chart. A chart is drawn in a box 384 px high and cut off at its bottom edge if it is taller; a table, pivot table or object detail card gets a box as tall as its rows, so it never runs into the next card. The table itself still stops at its own maximum height (60 % of the renderer's window) and shows its *Showing N rows* line, so a long table is cut off inside its card;
- the chart as saved, with filters set to each filter's **default value** (a report has nobody to choose values), including date windows relative to the moment of rendering;
- nothing for heading, text, link and iframe cards, and nothing for tabs: all tabs' chart cards are stacked together;
- the chart's name and settings, not the card's title override or visualization override.

The page tells the renderer it is ready only when every chart has finished drawing and fonts have loaded, so images are not captured half-drawn. If a chart fails to draw or the data cannot be fetched, the page stays blank and the render is reported as failed rather than delivering a partial image.

This is what a PDF of **Sales performance** (two tabs, a heading, a text card and six chart cards, filters with defaults) looked like on the demo stack: the title *Sales performance*; the cards **Revenue trend**, **Revenue by priority** and **Priority mix** on the first sheet and **Top clerks** and **Largest orders** (from the **Orders** tab) on the second; the line chart starting in January 1995 because the **Order date** filter defaults to 1995–1996; no heading or text card; and **Top clerks** under the chart's name, not the card title "Top 10 clerks". The **Largest orders** table had a sheet of its own, inside its card, with the first 26 of its 50 rows and the line *Showing 50 rows*. The whole render took about 20 seconds.

## Limits and known issues

- There is no whole-dashboard export button; reports (PNG, PDF) are the way to get the dashboard as one file.
- Rendered reports ignore card title and visualization overrides, text cards and tabs.
- The download popover's row limit text does not match the real limit (10,000 rows).
- PNG and PDF report rendering needs the rendering service. A large dashboard takes about 20 seconds to render. Egret allows 30 seconds per dashboard plus 30 seconds for the whole render, and a page that does not finish drawing within 20 seconds fails.
- A table card in a PNG or PDF report shows only the rows that fit the table's own maximum height; use a CSV report for every row.
- Charts on the print page are drawn at the rendering service's screen width (1280 px), and the PDF shrinks them to fit the sheet, so labels come out small (KI-283).

## Further reading

- [Alerts & reports](../alerts-and-reports)
- [Use filters and URL parameters](./using-filters)
- [Cards and card settings](./cards)
