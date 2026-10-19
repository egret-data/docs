---
sidebar_position: 6
---

# Usage and preview

The last two tabs of a dataset answer two practical questions: *who depends on this dataset?* (**Usage**) and *what does the data look like, with my settings applied?* (**Preview**).

![The Usage tab listing the charts built on a dataset](/img/platform/sql-datasets/ds-usage.png)

## Usage

Open the **Usage** tab to see every chart built on the dataset. The line at the top counts them, for example *2 charts built on this dataset*, and each row shows a chart's name with an arrow icon. Click a row to open the chart in the chart editor.

A dataset with no charts shows *No charts use this dataset yet.* with a **Create a chart** button that opens the chart editor with this dataset already chosen. Press **Create chart** in the dataset header for the same effect.

Use this tab before you:

- change or delete a [metric](./metrics#edit-a-metric) or a [calculated column](./calculated-columns#delete-a-calculated-column);
- rename a metric;
- change the SQL of a virtual dataset;
- [delete the dataset](./organize#delete-a-dataset).

The list shows charts only. Dashboards that contain those charts are not listed, so open a chart's page or the [Dashboards](../dashboards) list to find where it is used. Reading the list needs read access to the dataset, not manage access.

:::warning Deleting a dataset deletes its charts
Deleting a dataset permanently also deletes every chart built on it. The confirmation dialog says only that the table or query is not affected. Check **Usage** first.
:::

## Preview

The **Preview** tab shows the first 100 rows of the dataset with the dataset's column settings applied, so you can check a format or a role without building a chart.

![The Preview tab with currency and date formats applied](/img/platform/sql-datasets/ds-preview.png)

The tab opens with the line *Preview — first 100 rows* and a **Refresh** button that reads the rows again (the button reads **Loading…** while it works). The grid below is a plain table with the column names as headers.

What Preview applies from the **Columns** tab:

- Each column's **Format**: currency, percent, decimals, prefix or suffix for numbers; the date pattern for dates; link, email or image display for text.
- The **Role** as a default when there is no explicit format: **Currency** shows money, **Email**, **URL** and **Image** show links and images.

What Preview does not show:

- **Calculated columns.** Preview runs `SELECT *` on the dataset's own source, which has none of them. To check a calculated column, build a chart or a table chart on it.
- **Metrics.** They are aggregations and need a chart.
- **Display names.** The header shows the source column name.

Preview is bounded: it always reads at most 100 rows through a fixed query and cannot be given SQL. A reader who only has access to this dataset can still see Preview, because it runs on the dataset's own definition and not on free-form SQL.

### Messages

| Message | Meaning |
|---|---|
| Skeleton rows | The first read is in progress. |
| An error box with the server's text | The engine or Egret refused the read, for example because the database is unreachable or the connection's identity may not read the table. The text is the server's message. |
| *No rows.* | The source returned no rows. |

## Using the REST API

Both tabs are plain API calls, which is useful for scripts and for checking a dataset without opening the page. They need a signed-in session; a `POST` also needs the CSRF header (see the [REST API reference](../../reference/rest-api)).

```bash
# Charts built on a dataset (Usage tab)
curl -s "$BASE/api/ws/default/datasets/$DATASET_ID/usage" -b "$COOKIES"

# First rows of the dataset (Preview tab)
curl -s -X POST "$BASE/api/ws/default/datasets/$DATASET_ID/data" -b "$COOKIES" \
  -H "X-Egret-CSRF: $CSRF" -H "content-type: application/json" \
  -d '{"limit": 100}'
```

The usage call returns a list of `{id, name}` objects, one per chart. The data call returns `columns` (name and type) and `rows`. The optional `limit` is clamped to the range 100 to 1,000 (200 when you send none); the page asks for 100. The endpoint accepts no SQL, by design.

## Tips

- Keep **Preview** open in a second browser tab while you edit formats in the first one, and press **Refresh** after each change.
- Use **Usage** to decide who to tell before you change a dataset: the chart names usually identify the team.
- Use **Preview** after **Refresh** to confirm that a virtual dataset's new SQL returns what you expect before charts run it.

## Limits and known issues

- Preview shows the source's first rows in the engine's order, not a random sample; with no `ORDER BY` the order can change between reads.
- The 100-row limit is fixed in the page.
- Usage lists charts only.

## Further reading

- [Columns](./columns)
- [Creating a dataset](./creating-a-dataset)
- [Charts](../charts)
