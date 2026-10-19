---
sidebar_position: 7
---

# Area chart

An area chart is a line chart with the space under the line filled. With a **Series**, the areas stack by default, so the top edge shows the total and each band shows a share. Use it for composition over time, such as orders by priority per quarter.

![The Display tab of a stacked area chart of orders by priority](/img/platform/charts/area-display.png)

Area charts use the shared settings of the bar-and-line family; see [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings) for every option.

## Create an area chart

1. Go to **Explore → Charts**, press **+ Chart** and pick **Area**.
2. Choose a **Dataset**, set **X-axis** to a time column (for example `orderdate`, grouped by **Quarter**), add a metric under **Y-axis** (**Orders**) and set **Series** to a dimension such as `orderpriority`.
3. Press **Save**.

## What is different about areas

- **Stacked by default.** Where bar charts default to **Don't stack**, an area chart defaults to **Stack**. With a single series there is nothing to stack and no **Stacking** select is shown. With a breakout or several metrics, the select offers **Don't stack**, **Stack** and **Stack — 100%**. **Stack totals** appears with **Stack**.
- **Line settings apply.** **Line shape**, **Missing values** and **Markers** appear in the **Series** section, because an area is a filled line. The per-series gear popover has the same overrides as for a line.
- **Value axis.** **Unpin from zero** is not offered, since areas are filled down to the baseline.
- **Series display.** The series list lets you change an individual series to **Line** or **Bar** (only when **Stacking** is **Don't stack**).

Everything else is as on a [line chart](./line): the **Data** tab fields, **Legend**, **Data labels**, **Shorten large numbers**, **Goal value**, **Trend line** and the axes settings.

## Data

The **Data** tab is the one described for [bar charts](./bar#data): **Dataset**, **X-axis**, **Y-axis**, **Series**, **Tooltip metrics**, **Max categories**, **Sort** and **Row limit**. Two choices matter most for areas:

- Use a time column for the **X-axis**. Dates are drawn in chronological order and the grouping select (**Month** by default) sets the number of points.
- Use **Series** to get the bands. Without it, an area chart is one filled line. With several metrics and no series, each metric is a band.

## Settings at a glance

| Setting | Where | Available for this chart |
|---|---|---|
| **Stack series** | Display → Series | Yes, when there is more than one series |
| **Stacking**, **Stack totals** | Display → Series | Yes, when there is more than one series (default **Stack**) |
| **Line shape**, **Missing values**, **Markers** | Display → Series | Yes |
| Series list with **Line** / **Area** / **Bar** select and the line gear | Display → Series | Yes (select only when **Stacking** is **Don't stack**) |
| **Legend**, **Data labels**, **Shorten large numbers**, **Goal value**, **Trend line** | Display → Format | Yes |
| **X label**, **X axis scale**, **Show lines and tick marks** | Axes → X-axis | Yes |
| **Y label**, per-series axis, **Y scale**, **Split y-axis when necessary**, tick settings, **Auto y-axis range** | Axes → Y-axis | Yes |
| **Unpin from zero** | Axes → Y-axis | No: areas always reach zero |
| **Horizontal** | Axes | No |

## Reading an area chart

In a **Stack** chart, the top edge is the total and the thickness of a band is that series' value, so bands near the bottom are easy to compare and bands higher up are not: their baseline moves. If you care about comparing every series with the others, use **Don't stack** or a [line chart](./line). In a **Stack — 100%** chart the top edge is always the full height and the bands show shares.

## Related tasks

### Show shares instead of totals

Set **Stacking** to **Stack — 100%**. Each category's areas then fill the full height and show each band's proportion.

### Compare two series without hiding one behind the other

Set **Stacking** to **Don't stack**. Areas overlap, so recolor them or switch one to **Line**.

## Limits and known issues

- With a **Series**, only the first metric is plotted.
- Stacked areas draw the series in the order shown in the series list. Drag the handles to reorder.

## Further reading

- [Line chart](./line)
- [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings)
