---
sidebar_position: 5
---

# Metrics

A metric is a named aggregation, such as *revenue* = `SUM(totalprice)`, that is defined once on a dataset and reused by every chart built on it. Metrics are what a chart measures: the height of a bar, the value of a big number, a cell of a pivot table. Defining them on the dataset keeps the numbers the same everywhere, and lets a steward [certify](./certification) the official definition.

![The Metrics tab of the Orders with customers dataset](/img/platform/sql-datasets/ds-metrics.png)

Open a dataset and choose the **Metrics (n)** tab. The first line shows how many metrics there are, for example *5 metrics*.

## The metrics table

| Column | What it shows |
|---|---|
| **Metric** | The metric's name in bold, with a small check icon when it is certified, and a tag with the type of the result (*numeric*, *string*, *temporal*). |
| **Expression** | The SQL aggregation, in monospaced type. Hover over the **?** next to the header for a reminder. |
| **Format** | A picker, the same one as on the [Columns](./columns#format) tab. A change saves as soon as you close the picker. |
| **Certified** | A switch for people who may certify; everyone else sees **—**. See [Certification](./certification). |
| **Display name** | The friendly label, or **—**. |
| **Edit**, **Delete** | Row actions. |

A dataset with no metrics shows *No metrics yet.*

## Add a metric

1. Press **+ Metric**.
2. In **Add metric**, type a **Metric name** such as `total_sales`. Use letters, digits and underscores; the name is what charts store, and it must be unique in the dataset.
3. Type the **Expression**, a SQL aggregation over the dataset's columns, for example `SUM(totalprice)`.
4. Optionally set a **Display name** (for example *Total Sales*), a **Format**, and a **Description**.
5. Press **Save**.

![The Add metric dialog](/img/platform/sql-datasets/ds-metric-dialog.png)

Egret checks the expression in two steps. First, the same way as for a [calculated column](./calculated-columns#what-egret-checks): the engine runs it against the dataset's source and returns its type. If the engine rejects it, an error toast shows the message, for example `engine: line 1:12: Column 'nonexistent' cannot be resolved`, and nothing is saved. Second, the engine runs it next to `count(*)` with no grouping, the way a chart uses a metric. An expression that is not an aggregate fails this step and is refused with *metric expression must be an aggregate, such as SUM(column) or COUNT(\*):* followed by the engine's message. A name that already exists is refused with *metric name already exists*. An empty name or expression shows *Name and expression required*.

### Write the expression

The expression is a single SQL expression in the database's dialect. It may use:

- Source columns of the dataset (the table's columns, or the columns your SQL returns).
- Aggregate functions: `SUM`, `COUNT`, `AVG`, `MIN`, `MAX`, `COUNT(DISTINCT …)`, and the engine's others.
- `CASE` expressions inside an aggregate to make conditional measures.
- Arithmetic between aggregates, such as `SUM(a) / SUM(b)`.

It cannot use [calculated columns](./calculated-columns), because the check runs against the source columns only; repeat the calculated column's formula inside the metric instead. A semicolon outside quotes is refused.

A plain column such as `totalprice` is therefore refused when you save, with the engine's message `'totalprice' must be an aggregate expression or appear in GROUP BY clause` after the sentence above. Wrap it in an aggregate such as `SUM(totalprice)`.

Metrics that work on the demo data:

| Name | Expression | Format |
|---|---|---|
| `revenue` | `SUM(totalprice)` | Currency |
| `order_count` | `COUNT(*)` | Integer |
| `customers` | `COUNT(DISTINCT customer_name)` | Integer |
| `avg_order_value` | `AVG(totalprice)` | Currency |
| `large_order_share` | `AVG(CASE WHEN totalprice >= 300000 THEN 1.0 ELSE 0.0 END)` | Percent |
| `net_revenue` (Line items) | `SUM(extendedprice * (1 - discount))` | Currency |

`large_order_share` shows the usual way to make a share: average a 1-or-0 flag, then format it as **Percent**. Percent multiplies by 100, so a value of 0.0355 shows as 3.5%.

## Edit a metric

Press **Edit** on a row. The **Edit metric** dialog has the same fields as **Add metric**, including the name. Press **Save**; the expression is validated again.

Charts store a metric by its name. When you rename a metric, Egret rewrites every chart on the dataset that uses the old name (its metrics, its sort and its settings) and the dashboard cards' overrides of those charts, in the same save, so the charts keep running under the new name.

A rename of a metric that charts use is refused when the old or the new name is also the name of a column of the dataset, because Egret could not tell the metric from the column in the charts. The error says *cannot rename a metric that charts use while a column is also named "name": the charts could not be rewritten unambiguously*. Pick another name, or change the **Display name** when you only want a different label.

The **Format** column on the table is a shortcut: changing it saves the metric straight away, resending the current name, expression and other fields, and so repeats the engine check.

## Delete a metric

Press **Delete** on the row. A dialog asks *Delete metric “name”?* with the text *This cannot be undone.* Type `delete` and press **Delete metric**. The toast says *Deleted metric name*.

If charts use the metric, Egret refuses this first delete, and the dialog changes: it lists those charts (with their type icon, a link, and an *in Trash* tag for a trashed chart), says *N charts use this metric and will stop running until it is removed from them. This cannot be undone.*, and asks you to type the metric's exact name (case matters) instead of `delete`. Press **Delete metric** again to delete it. The charts are not changed; they fail when they run until you pick another metric in them.

## Use metrics in a chart

Press **Create chart** on the dataset page, choose a chart type, and the metrics appear in the metric pickers (for example *Y-axis*) next to the dataset's columns. A metric shows its **Display name** if it has one and is formatted with its **Format**; a chart can still override the format for its own use.

![A chart on the Orders with customers dataset that groups by a calculated column and measures two metrics](/img/platform/sql-datasets/ds-chart-metrics.png)

## Limits and known issues

- Metric names are not validated beyond being unique and non-empty; keep to letters, digits and underscores so that charts and the REST API can refer to them without quoting.
- A metric that charts use cannot be renamed to, or from, a name that is also a column name.
- Deleting a metric that charts use leaves those charts broken until they are edited.

## Further reading

- [Columns](./columns)
- [Certification](./certification)
- [Charts](../charts)
