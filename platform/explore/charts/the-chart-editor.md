---
sidebar_position: 2
---

# The chart editor

The editor is where you build and change a chart. Settings are on the left, a live preview is on the right. This page covers the parts every chart type shares: the layout, running queries, the settings every **Data** tab has, exporting, tooltips and drill-through. The settings that belong to one chart type are on that type's page.

![The editor with a bar chart: settings on the left, preview and toolbar on the right](/img/platform/charts/bar-data.png)

## Open the editor

- **New chart**: **Explore → Charts → + Chart**, then pick a type. The address is `/explore/<workspace>/charts/new?type=<type>`.
- **Existing chart**: click its name in the list. Opening a chart you have saved shows its preview straight away.

## The editor layout

The left panel is 400 px wide and scrolls on its own. From top to bottom it has:

1. **← Charts**: back to the list.
2. The current chart type with a **Change** button. **Change** opens **Change visualization**, the same gallery you see when you create a chart. Between bar, row, line, area, combo and scatter, which share one set of settings, the change keeps the fields, the display settings and the sort. A change to any other type keeps the dataset but clears the fields and the sort, so pick the type first.
3. The tabs. **Data** and **Display** are always there. **Axes** appears for the types that have axis settings (bar, row, line, area, scatter, combo, waterfall and box plot). **Conditional formatting** appears for [Table](./table) and [Pivot Table](./pivot-table) only. If you switch to a type that does not have the open tab, the editor falls back to **Display**.

![The Change visualization dialog](/img/platform/charts/editor-change-viz.png)

The right side has the toolbar and the preview.

### The toolbar

| Control | What it does |
|---|---|
| Chart name | A text box with the placeholder **Untitled chart**. It is the name the chart is saved under. |
| **Auto** | When on (the default), the chart re-runs 500 ms after you stop changing the query settings. When off, press **Run**. |
| **Run** | Runs the query now. Disabled while a run is in progress (it reads **Running…**). If a required field is missing it shows a message such as **This chart needs X-axis and a metric**. |
| **Save** / **Update** | Opens the save dialog. See [Save and update](./#save-and-update). |
| Download icon (**Export chart**) | Opens **Download data**. See [Export](#export). Disabled until the chart has run. |
| **View SQL** | A disclosure under the toolbar. It shows the SQL Egret generated for the last run. |

![View SQL expanded under the toolbar](/img/platform/charts/editor-view-sql.png)

Only settings that change the *query* (fields, sort, row limit, time grouping, filters) trigger a re-run. Display settings such as colors and labels redraw the chart from the rows already fetched.

### The preview

Until the query has run, the preview shows an empty state: **Set up your *type*** with a hint. The hint is **Add: …** followed by the missing fields, with **, then Run** when **Auto** is off, or **Ready — adjust the fields on the left.** / **Ready — click Run to preview.** when nothing is missing. While the query runs a skeleton is shown, and a failed query shows its error with a **Retry** button.

## The Data tab

Every chart type starts the **Data** tab with the same **Dataset** control and ends it with the same query controls. In between are the fields that belong to the type.

### Dataset

A select listing every dataset in the workspace. Changing the dataset clears every field, sort, filter and formatting choice, because column names differ between datasets.

### Fields

Egret picks fields from the dataset's **dimensions** (columns) and **metrics** (named aggregations). Fields that take several values, such as **Y-axis** on a bar chart, are lists: each selected field is a chip you can reorder by dragging the handle and remove with **×**, and an **Add …** button opens a picker. When a picker has more than eight fields it adds a **Filter … fields…** search box.

![The metric picker opened from Add y-axis](/img/platform/charts/editor-add-metric.png)

Field names show the dataset's *Display name* when one is set (**Orders** above its metric name `order_count`). Hover a name to see the underlying column or metric name.

The pickers offer only the dataset columns whose **Dimension** switch is on, plus any column the chart already uses. A table with no metric and Object detail list every column. See [Columns](../datasets-and-metrics/columns#dimension).

### Time grouping

When a field you pick is a time column, a second select appears under it, labelled **Group *column* by**. Egret groups time columns by **Month** until you change it. The menu has two groups:

| Group | Options |
|---|---|
| **Group by** (truncate to a period) | **Minute**, **Hour**, **Day**, **Week**, **Month**, **Quarter**, **Year** |
| **Extract** (a number from the date) | **Minute of hour**, **Hour of day**, **Day of week**, **Day of month**, **Day of year**, **Week of year**, **Month of year**, **Quarter of year** |

Choose **None** to group by the raw value. **Group by** gives one point per period; **Extract** gives a repeating pattern, such as one point per weekday.

![The time grouping menu](/img/platform/charts/editor-temporal.png)

### Sort

**Sort** appears below the type's own fields. Pick **Add a sort…** and choose a field; each sort row has a direction button (ascending or descending), move-up and move-down buttons, and a remove button. Rows are sorted by the first row, then the second, and so on. The sort runs in the database query, so together with **Row limit** it decides which rows you get.

The control is offered when the chart groups by at least one dimension (or, for tables of raw rows, when columns are chosen). It is not shown for [Trend](./trend), which always sorts by its time field, or for charts with a single value.

For the bar, line, area, row, combo and scatter charts the editor always sorts ascending by the X-axis, and then by the series, after any sorts you add.

![The sort control](/img/platform/charts/editor-sort.png)

### Row limit

The maximum number of rows the query returns. Default **1000**. The hint under the box reads **Up to 10,000 rows.** If you type more, it changes to **Over the maximum — only 10,000 rows will be returned.** and the server clamps the value to 10,000 (minimum 1).

The row limit applies to the grouped result, not to the underlying table. A bar chart grouped by status with a limit of 1000 still aggregates the whole table.

**Row limit** is not shown for [Big number](./number), [Progress](./progress) and [Gauge](./gauge): their query always returns one row.

## The Display and Axes tabs

**Display** holds the settings that change how the chart looks: legends, labels, colors, number formats. For most types it ends with a **Formatting** section, one row per column the chart uses. Clicking a row opens that column's number or date format. See [Column formatting and number formats](./column-formatting).

**Axes** holds the axis titles, scales and tick settings. See [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings) for the full list.

## Tooltips

Hover a bar, point, slice, box, step, link or region to see a tooltip with its values, formatted with the column formats you set in **Formatting**. What a tooltip contains depends on the type: a bar, line or area chart lists every series at the hovered category; a pie chart lists every slice with its value and share, and the total; a box plot lists **Max**, **Q3**, **Median**, **Q1**, **Min** and **Mean**; a waterfall shows the step's change and the **Running total**; a Sankey link reads `source > target: value`; a bubble chart lists the X metric, the Y metrics and the bubble-size metric. Gauges and funnels have no tooltip.

![A tooltip over a bar](/img/platform/charts/editor-tooltip.png)

To put more numbers in the tooltip of a bar, line, area, row or combo chart, add **Tooltip metrics** on the **Data** tab. These metrics are fetched with the query and appear only in the tooltip. They are not available when the chart has a **Series** (breakout), and the picker offers only metrics that are not already plotted. A pin [Map](./map) has the same idea under **Tooltip columns**.

## Drill-through

In the editor you can click a chart value to explore it:

1. Click a bar, a point, a pie slice, a table cell, a pivot cell or a map region. The click opens a small menu.
2. Choose one of:
   - **Filter by *column* is *value***: adds a filter chip above the chart and re-runs the query. For a time column grouped by a period the filter is a range, shown as **column ≥ start and < end**.
   - **See these records**: opens a dialog titled **Records where …** with the underlying rows of the dataset that match, using your **Row limit**. The dialog title is **All records** when there are no filters.
3. To remove a filter, click the **×** on its chip. Filter chips are saved with the chart.

![The drill menu after clicking a bar](/img/platform/charts/editor-drill-menu.png)

A single-value chart ([Big number](./number), [Gauge](./gauge), [Progress](./progress)) offers only **See these records**, because it has no dimension to filter by.

Dashboard cards have the same click menu. The menu names columns by their database names (for example `orderpriority`) rather than their display names.

## Export

The download icon opens **Download data**:

1. Choose a format: **.csv**, **.xlsx** or **.json**. **.png** is also offered for the charts that are drawn as one chart image: bar, row, line, area, scatter, combo, pie, gauge, waterfall, box plot, Sankey, map, and a funnel with **Funnel type** = **Bar — a column per step**. It is not offered for Big number, Progress, Trend, Table, Pivot Table, Object detail or the default funnel.
2. For the table formats, tick or clear **Keep the data formatted**. When ticked (the default), values are exported the way they appear on screen, for example **September 6, 2026** or **$187.50**. When cleared, they are exported as stored, for example **2026-09-06** or **187.50**.
3. Press **Download**. The file is named after the chart.

![The Download data popover](/img/platform/charts/editor-export.png)

For the table formats the popover says **The maximum download size is 10,000 rows.** The export contains the rows the chart fetched, and a chart fetches at most 10,000.

## Related tasks

Use **Duplicate** on the Charts list to try a different chart type or setting on a copy, without touching the original.

## Limits and known issues

- The editor has no undo. Close the tab without saving to discard changes.
- Filters can only be created by drilling in. There is no filter builder, and filters do not exist for single-value charts.
- Axis titles default to the metric's database name (for example `revenue`) rather than its display name (**Revenue**).

## Further reading

- [Charts](./)
- [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings)
- [Column formatting and number formats](./column-formatting)
