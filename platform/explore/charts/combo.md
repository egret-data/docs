---
sidebar_position: 9
---

# Combo chart

A combo chart draws some metrics as bars and others as lines on shared axes. Use it to put a volume and a rate, or an amount and a count, on one chart, for example yearly revenue as bars with the order count as a line on a second axis.

![The Display tab of a combo chart with revenue as bars and orders as a line](/img/platform/charts/combo-display.png)

Combos share the settings of the bar-and-line family; the full list is [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings). This page covers how combos differ.

## Create a combo chart

1. Go to **Explore → Charts**, press **+ Chart** and pick **Combo**.
2. Choose a **Dataset**, set **X-axis** (for example `orderdate`, grouped by **Year**) and add two or more metrics under **Y-axis**: **Revenue** and **Orders**.
3. On **Display**, check the series list. The first metric defaults to a line and the others to bars. Use each row's select (**Line**, **Area**, **Bar**) to change that.
4. On **Axes**, set **Orders** to **Right** so each metric has its own scale.
5. Press **Save**.

## Data

The **Data** tab is the same as for [bar charts](./bar#data). A combo needs at least one metric; it is only useful with two or more, and a **Series** breakout limits the chart to its first metric.

## Display

The **Series** section combines the bar and line settings:

- **Stack series** puts each metric in its own panel.
- **Stacking** (**Don't stack**, **Stack**, **Stack — 100%**) applies to the bar and area series when there are at least two of them.
- **Line shape**, **Missing values** and **Markers** apply to the line series.
- The **series list** has a drag handle, color, a **Line**/**Area**/**Bar** select, a name box, a gear button (for lines) and a show/hide switch for each metric.

![The settings popover of the line series](/img/platform/charts/combo-series-settings.png)

The gear opens **Settings for *series*** with **Line shape**, **Line style**, **Line size**, **Markers** and **Missing values**, each defaulting to **Auto**.

**Format** is as for the other types: **Legend**, **Data labels**, **Shorten large numbers**, **Goal value** and **Trend line**.

## Axes

![The Axes tab of a combo chart](/img/platform/charts/combo-axes.png)

Below the **Y label** switch, each series has an axis select with **Auto**, **Left** and **Right**. **Auto** lets Egret decide: with **Split y-axis when necessary** on (the default), metrics whose ranges differ greatly are put on two axes. Choosing **Left** or **Right** for any series switches to manual assignment. The select disappears when the chart is stacked or **Stack series** is on.

## Settings at a glance

| Setting | Where | Available for this chart |
|---|---|---|
| **Stack series** | Display → Series | Yes, when there is more than one series |
| **Stacking**, **Stack totals** | Display → Series | Yes, when at least two series are bars or areas |
| **Line shape**, **Missing values**, **Markers** | Display → Series | Yes, when a series is a line or area |
| Series list: color, **Line** / **Area** / **Bar**, name, gear, show/hide | Display → Series | Yes (the select is hidden while stacked) |
| **Legend**, **Data labels**, **Shorten large numbers**, **Goal value**, **Trend line** | Display → Format | Yes |
| **X label**, **X axis scale**, **Show lines and tick marks** | Axes → X-axis | Yes |
| **Y label**, per-series axis (**Auto** / **Left** / **Right**), **Y scale**, **Split y-axis when necessary**, tick settings, range | Axes → Y-axis | Yes |
| **Unpin from zero** | Axes → Y-axis | Only while no series is a bar or area, the chart is not stacked and there is no manual range |
| **Horizontal** | Axes | No |

## Choosing line or bar for each metric

Draw an amount as bars and a rate, count or ratio as a line, because the eye reads bars as totals and lines as movement. If both metrics are on a similar scale, leave them on one axis. If one is much larger than the other (revenue in hundreds of millions, orders in thousands), put the smaller one on the **Right** axis, or leave **Split y-axis when necessary** on and let Egret do it.

The chart in the screenshot above splits revenue (left, up to 350 million) from orders (right, up to 2,500). Hover a year to see its values in a tooltip.

## Limits and known issues

- The per-series axis assignment is not available when the series are stacked.
- With a **Series** breakout only the first metric is plotted, but each band can still be drawn as a **Line**, **Area** or **Bar** from the series list.

## Further reading

- [Bar chart](./bar), [Line chart](./line)
- [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings)
