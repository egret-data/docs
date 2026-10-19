---
sidebar_position: 6
---

# Line chart

A line chart shows how a metric changes along an ordered axis, most often time. Use it for trends such as monthly revenue, daily signups or orders per quarter.

![The Display tab of a line chart of monthly revenue](/img/platform/charts/line-display.png)

Line charts share their settings with the rest of the bar-and-line family. This page covers what matters for lines; the full list is [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings).

## Create a line chart

1. Go to **Explore → Charts**, press **+ Chart** and pick **Line**.
2. Choose a **Dataset**, for example *orders*.
3. Set **X-axis** to a time column such as `orderdate`. A select labelled **orderdate:** appears below it; Egret groups by **Month** by default. Change it to **Day**, **Week**, **Quarter** or **Year** as needed.
4. Add a metric under **Y-axis**, for example **Revenue**.
5. Optionally pick a **Series** to draw one line per value.
6. Press **Save**.

Dates are drawn in chronological order and numbers in numeric order, whatever order the database returned them in. Other categories are alphabetical unless you add a **Sort**.

## Data

The **Data** tab is the same as for [bar charts](./bar#data): **Dataset**, **X-axis**, **Y-axis**, **Series**, **Tooltip metrics**, **Max categories**, **Sort** and **Row limit**. For a line chart on a time column, the grouping select is the setting that matters most: it decides how many points the line has.

Use **Extract** groupings (for example **Day of week**) to compare a repeating pattern instead of a timeline.

## Display

The **Series** section on a line chart offers three line-specific settings.

| Setting | Options | Default |
|---|---|---|
| **Line shape** | **Linear**, **Smooth**, **Step** | **Linear** |
| **Missing values** | **Connect**, **Zero**, **Gap** | **Connect** |
| **Markers** | **Auto**, **On**, **Off** | **Auto** |

**Connect** draws a line across a period with no data. **Gap** leaves a break. **Zero** treats the missing period as zero, which changes any stacked totals. **Auto** markers appear only when there are few enough points to read.

Below those is the series list. For each line you can recolor, rename, reorder or hide it, switch it to **Area** or **Bar**, and use the gear button to override **Line shape**, **Line style** (**Solid**, **Dashed**, **Dotted**), **Line size** (**S**, **M**, **L**), **Markers** and **Missing values** for that line alone.

The **Format** section has **Legend**, **Data labels** (with **Data label density**), **Shorten large numbers**, **Goal value** and **Trend line**. **Trend line** overlays a least-squares line fitted to the points, which makes a long-run direction easier to see through noise.

## Axes

![The Axes tab of a line chart](/img/platform/charts/line-axes.png)

- **X-axis** group: **X label**, **X axis scale** (**Ordinal**, **Linear**, **Timeseries**) and **Show lines and tick marks**. On a line chart with a date X column, **Timeseries** spaces points by real time, so gaps in the data show as gaps in the axis; **Ordinal** gives every point equal spacing.
- **Y-axis** group: **Y label**, **Y scale** (**Linear**, **Log**), **Show lines and tick marks**, **Number of tick marks**, **Auto y-axis range** and **Unpin from zero**. Unlike bars, a line chart can leave zero off the axis: turn on **Unpin from zero** to let the value axis fit the data.

With several metrics, each gets a **Left** / **Right** / **Auto** axis select, and **Split y-axis when necessary** puts metrics with very different ranges on two axes.

## Settings at a glance

| Setting | Where | Available for this chart |
|---|---|---|
| **Stack series** | Display → Series | Yes, when there is more than one series |
| **Stacking**, **Stack totals** | Display → Series | Only when at least two series are switched to **Area** or **Bar** |
| **Line shape**, **Missing values**, **Markers** | Display → Series | Yes |
| Series list with the line gear (**Line shape**, **Line style**, **Line size**, **Markers**, **Missing values**) | Display → Series | Yes |
| **Legend**, **Data labels**, **Shorten large numbers**, **Goal value**, **Trend line** | Display → Format | Yes |
| **X label**, **X axis scale**, **Show lines and tick marks** | Axes → X-axis | Yes |
| **Y label**, per-series axis, **Y scale**, **Split y-axis when necessary**, tick settings, range, **Unpin from zero** | Axes → Y-axis | Yes |
| **Horizontal** | Axes | No |

## Related tasks

### Compare two periods

Set **Series** to a dimension with a few values (for example the order priority), or add two metrics. Each becomes a line with its own color and legend entry. Use the series list to rename them.

### Mark a target

Type a value in **Goal value** (and a **Goal label** such as `Plan`). A horizontal reference line is drawn across the chart.

### Hide a noisy tail

If the last period is incomplete it drops sharply and distorts the picture. Lower **Row limit** (with **Sort** ascending by the time column) so the incomplete period is not fetched. The chart in the screenshot above stops at July 1998 for this reason.

## Limits and known issues

- A line chart needs an **X-axis** and a metric.
- With a **Series**, only the first metric is plotted.
- The default **X axis scale** for a date column is **Ordinal**, not **Timeseries**.

## Further reading

- [Area chart](./area), [Combo chart](./combo)
- [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings)
