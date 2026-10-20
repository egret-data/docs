---
sidebar_position: 5
---

# Query results

The **Results** panel below the editor shows what the last run returned. You can read it as a table, sort and filter it, open a long value, draw a quick chart, copy it and download it.

![A result table with three rows](/img/platform/sql-datasets/sqllab-results.png)

## The result table

After a successful run, the panel shows:

- A toolbar with a **Filter rows…** box, the row count (*3 rows*), **Copy** and **Export**.
- A **Table** / **Chart** switch and a status badge (*Done in 397 ms · 3 rows*) in the tab bar.
- The grid itself, with a **#** column of row numbers, then one column per result column. Each header shows the column name and, in small type, the column's SQL type as the engine reported it (`varchar(1)`, `bigint`, `double`, `date`).
- A footer line repeating the time, for example *Done in 397 ms*.

Numeric columns (the integer, decimal and floating-point types of Trino and StarRocks) are right-aligned; other columns are left-aligned. `NULL` shows as grey italic *NULL*. Long values are cut off with an ellipsis; see **Expand a value** below.

### Sort

Click a column name to sort the rows by it: the first click sorts ascending, the second descending, the third removes the sort. Numeric columns sort by number and the rest by text. `NULL` values always go last. Sorting happens in your browser on the rows that are loaded; it does not change the query.

### Filter rows

Type in **Filter rows…** to keep only rows in which any cell contains the text, ignoring case. The counter changes to *2 of 25* while a filter is active. When no row matches, the grid says *No rows match “text”.*

![Rows filtered by "an" and sorted by name](/img/platform/sql-datasets/sqllab-filter-rows.png)

### Resize columns

Hover over the right edge of a column header and drag. A column cannot be narrower than 60 pixels.

### Expand a value

Click any cell to open a dialog that titles itself with the column name and shows the whole value in a scrollable box. Use **Copy** in the dialog to copy that one value. This is how you read a long text, a JSON document or an `EXPLAIN` plan.

![The dialog that shows a whole cell value](/img/platform/sql-datasets/sqllab-cell.png)

## Chart a result

Press **Chart** in the switch above the grid to see the result as a simple chart. Press **Table** to go back.

| Control | Options |
|---|---|
| Chart type (first list) | **Bar** (default), **Line**, **Area** |
| **X** | Any column. The default is the first non-numeric column. |
| **Y** | Numeric columns only. The default is the first numeric column. |

![A bar chart of orders per order status](/img/platform/sql-datasets/sqllab-chart.png)

The chart groups the loaded rows by the **X** value and adds up the **Y** values that share an X. It shows one series and no legend, stops collecting after roughly 50 distinct X values (a note, *showing first 50 categories*, appears when it reaches that), and uses the first 1,000 rows. A result without a numeric column shows *No numeric column to chart.* This chart is a quick look and cannot be saved. To build charts that you keep, share and put on dashboards, [save the query as a dataset](./save-as-dataset) and use [Charts](../charts).

## Copy and export

| Action | What you get | Rows included |
|---|---|---|
| **Copy** (toolbar button) and **Export → Copy as TSV** | Tab-separated text on the clipboard: a header line of column names, then the rows. `NULL` becomes an empty cell. A toast says *Copied to clipboard*. | The rows currently shown (loaded rows that match the filter, in the current sort order). |
| **Export → Download JSON** | A file `results.json`: an array of objects keyed by column name, with `null` for `NULL`. | The rows currently shown, as above. |
| **Export → Download CSV** | A file named `query-<id>.csv` in RFC 4180 format: a header line, then the rows. Values with a comma, a quote or a line break are quoted; `NULL` becomes an empty field. | The **full result** of the run, not only the rows loaded in the grid. |

![The Export menu](/img/platform/sql-datasets/sqllab-export-menu.png)

**Download CSV** is also in the **…** menu and in the command palette. The command appears only after a successful run. The CSV is produced on the server from the stored result, so it contains every row that the run returned up to the limit, even when the grid shows only the first 1,000.

## Limits

Three different numbers decide how many rows you can work with.

| Limit | Default | What it controls |
|---|---|---|
| **Limit** in the toolbar | 1,000 | How many rows the engine returns for the run. Up to 100,000 (the server setting `engine.max_rows`). See [Row limit](./editor#row-limit). |
| Rows loaded in the grid | 1,000 | How many of those rows your browser loads for sorting, filtering, charting, **Copy** and **Download JSON**. |
| Query time out | 60 seconds | The server setting `engine.query_timeout_secs`. A longer query fails with `timeout`. |

When a run returns more than 1,000 rows, a grey note next to the counter says *interactive over first 1,000 rows*: the row count shows the real total, but sort, filter, chart, copy and JSON apply to the first 1,000. Use **Download CSV** for everything.

When Egret itself stopped reading at the limit (this happens for statements that are not a single `SELECT` or `WITH`, such as `SHOW` or `TABLE`), an amber chip reads *Results were limited to 1,000 rows.*

![A result that Egret stopped at the limit](/img/platform/sql-datasets/sqllab-truncated.png)

A single `SELECT` is limited inside the engine instead, and then there is no chip: a result that has exactly as many rows as the limit may have been cut.

## Who can see a result

A result belongs to the user who ran the query. Another workspace member cannot open it, even with the query id; platform admins can. Result rows are stored by Egret in its object store, one file per run.

## Limits and known issues

- The status chip for a cancelled run is missing; a cancelled query leaves the panel in its empty state.
- A zero-row result is reported with the filter message *No rows match “”.*
- The chart groups with a sum, so a repeated X value adds its Y values together; it is not a replacement for a dataset chart.
- The row order of a single `SELECT` with `ORDER BY` but no `LIMIT` is not guaranteed on Trino; sort in the grid or add a `LIMIT` (see [Row limit](./editor#row-limit)).
- Counters read *1 rows* for a one-row result.

## Further reading

- [The query editor](./editor)
- [Query errors](./query-errors)
- [Charts](../charts)
