---
sidebar_position: 7
---

# Save a query as a dataset

When a query returns the rows you want to chart, you can promote it to a **virtual dataset**. A virtual dataset is a SQL query that Egret keeps under a name, with its own columns and metrics, so charts and dashboards can be built on it without anyone rewriting the SQL. This page covers the SQL Lab side; the dataset itself is described in [Datasets & metrics](../datasets-and-metrics).

![The Save as dataset dialog with the query shown read-only](/img/platform/sql-datasets/sqllab-save-dataset.png)

## Save the editor query as a dataset

1. Write the query and choose its database. Check that it runs and returns the columns you expect.
2. Press **Save as dataset** in the toolbar, or choose **Save as dataset…** in the command palette.
3. In the **Save as dataset** dialog, type a **Name** (required) and, optionally, a **Description**. The **Query** box shows the SQL that will be saved; it is read only. To change it, close the dialog and edit the editor.
4. Press **Create dataset**. The button stays disabled until the name and the SQL are not empty.

Egret asks the engine to describe the query, creates the dataset with one column per result column, and opens the new dataset's page. The dataset belongs to the connection of the tab. If no connection is chosen, the toast *Pick a connection* appears instead.

![The dataset page that opens after the query is saved](/img/platform/sql-datasets/sqllab-dataset-created.png)

## What the SQL has to look like

Egret embeds the saved query as a subquery, `SELECT … FROM (<your query>) AS _egret_src`, whenever it reads columns or builds a chart. So the saved text must be a query expression that is valid inside parentheses.

| Do | Why |
|---|---|
| Give every computed column an alias. | An unnamed expression such as `select 1+1` becomes `_col0`. |
| Keep the column names unique. | Two columns with the same name, such as `select 1 as x, 2 as x`, are refused with *the query returns more than one column named `x`; give each column its own name with AS*. |
| Remove `{{parameter}}` placeholders. | A dataset has no parameter values, so the engine sees the braces. See [Query parameters](./parameters#where-parameters-work). |
| Use one `SELECT` or `WITH` statement. | `SHOW`, `DESCRIBE`, `EXPLAIN`, `CREATE` and several statements are not queries and are refused by the engine. |

`WITH` clauses, joins, window functions and `ORDER BY` are fine. A trailing semicolon and a line comment at the very end of the query are also fine: Egret saves the SQL without the final `;`, so `select 1 as x;` is stored as `select 1 as x`.

If the engine rejects the query, the dialog shows an error toast with the engine's message, for example `engine: line 1:22: Table 'tpch.tiny.ordres' does not exist`. The line and column are those of your text.

## Worked example: orders with their customers

The demo workspace has a dataset built from a join of two `tpch` tables. This is the query as it was saved:

```sql
SELECT o.orderkey,
       o.orderdate,
       o.orderstatus,
       o.orderpriority,
       o.totalprice,
       c.name AS customer_name,
       c.mktsegment AS market_segment,
       c.acctbal AS customer_balance
FROM tpch.tiny.orders o
JOIN tpch.tiny.customer c ON o.custkey = c.custkey
```

Why it works as a dataset:

- Columns coming from the second table are renamed with `AS`, so the dataset has readable names (`customer_name`) and no clash with order columns.
- Every column has a distinct name.
- There is no `ORDER BY` or `LIMIT`. Charts add their own ordering and limits, so a row limit inside the saved SQL would silently cap every chart.
- Nothing in it depends on who runs it.

The result is a dataset with eight columns. From there you add two [calculated columns](../datasets-and-metrics/calculated-columns) (`order_year`, `order_size`) and five [metrics](../datasets-and-metrics/metrics) (`revenue`, `order_count`, `customers`, `avg_order_value`, `large_order_share`).

## Troubleshooting

| Symptom | What to check |
|---|---|
| The dialog shows an error toast with a syntax error mentioning `)` | A comment on the last line that swallows the closing parenthesis. |
| The dialog shows *the query returns more than one column named …* | Two columns have the same name. Alias one. |
| The dataset is created but a chart on it is very slow | The query is slow. Add filters inside the saved SQL, or save a smaller query. |
| Columns are named `_col0`, `_col1` | Unnamed expressions. Add `AS name`. |
| You edited the query after saving and the dataset did not change | The dataset keeps its own copy of the SQL; edit the dataset instead. |

## After you save

- The dataset appears in **Explore → Datasets** with the *virtual* tag and `SQL` as its source.
- Editing the dataset's SQL later is done on the dataset page, followed by **Refresh** (see [Refresh and schema sync](../datasets-and-metrics/refresh-and-sync)).
- The dataset keeps its own copy of the SQL. Changing or deleting a saved query in SQL Lab does not affect it, and neither does editing the editor tab afterwards.
- To copy an existing dataset, use **Duplicate** in the dataset's row menu. It opens the **Duplicate dataset** dialog with the name *copy of …*, and the copy keeps the SQL, the column settings and the metrics. See [Duplicate](../datasets-and-metrics/organize#duplicate).

## Charts straight from a result

SQL Lab's **Chart** switch is a quick look only. For charts you keep, save the query as a dataset, add [metrics](../datasets-and-metrics/metrics) and [column settings](../datasets-and-metrics/columns), and then press **Create chart** on the dataset page.

## Limits and known issues

- Only virtual datasets can be created this way, and only from a single SQL text. There is no way to attach several queries to one dataset.
- The **Save as dataset** dialog does not offer a folder; move the dataset from the dataset list afterwards.
- A virtual dataset reads its data when a chart runs, not when you save it; a slow query makes every chart on it slow.

## Further reading

- [Creating a dataset](../datasets-and-metrics/creating-a-dataset)
- [Datasets & metrics](../datasets-and-metrics)
- [Charts](../charts)
