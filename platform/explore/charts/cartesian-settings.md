---
sidebar_position: 3
---

# Settings shared by bar, row, line, area, combo and scatter charts

[Bar](./bar), [Row](./row), [Line](./line), [Area](./area), [Combo](./combo) and [Scatter](./scatter) charts are one family. They share one set of settings, so a chart keeps its fields and display choices when you switch between them with **Change**. This page documents every setting in the order the editor shows it. Each type's own page lists what is different for it.

Settings that depend on the data or on another setting only appear when they apply. The notes below say when.

![The Data tab of a stacked bar chart](/img/platform/charts/bar-data.png)

## Data tab

### Dataset

The dataset the chart reads. See [The chart editor](./the-chart-editor#dataset).

### X-axis

The dimension to group by. Required. For a time column, a **Group *column* by** select appears below it; see [Time grouping](./the-chart-editor#time-grouping). The default grouping is **Month**.

### X metric (optional) and Bubble size

Scatter charts only. See [Scatter](./scatter).

### Y-axis

One or more metrics. Required. Drag the handle on a chip to reorder; the order sets the series order and the right-axis assignment list. A chart with a **Series** plots only the first metric ("With a series, only the first metric is plotted.").

### Series

An optional second dimension that splits the chart into one series per value (a breakout). Default **None**. It cannot be the same field as the X-axis. With a series, the chart asks the database for two grouping columns.

### Tooltip metrics

Extra metrics fetched only to show in the tooltip. Appears when the dataset has at least one metric that is not already plotted (on a scatter chart, the X metric and bubble-size metric count as plotted). The hint changes to **Not shown while the chart has a breakout — each value would belong to one series, not to the category.** when a **Series** is set. Otherwise the hint reads **Fetched and shown in the tooltip only.**

### Max categories

Bar, row, line, area and combo charts. Empty by default (**Keep every category**). Enter a number (2 or more) to keep that many categories and sum the rest into one **Other** category. The hint reads **The rest are summed into “Other”.** Scatter charts do not have this setting.

### Sort and Row limit

The same query controls every chart has. See [Sort](./the-chart-editor#sort) and [Row limit](./the-chart-editor#row-limit). The chart is always ordered by the X-axis, ascending, after any sort you add. A row chart with no sort is the exception: it orders by its first metric, descending, then by the X-axis (see [Row chart](./row)).

## Display tab

The Display tab has a **Series** section, a **Format** section and, below them, **Formatting** for column formats.

### Series section

#### Stack series

A switch. When on, every series is drawn in its own panel, one under another, sharing the category axis, each with a value axis scaled to its own data. It is offered when the chart has more than one series (several metrics, or a **Series** breakout with more than one value) and is not a horizontal chart or a metric-versus-metric scatter. Turning it on hides **Stacking**, the right-axis choices and **Split y-axis when necessary**, because the panels replace them. Nothing is erased: turn it off and they return.

#### Stacking

A select. Offered on bar, area and combo charts that have more than one stackable series, and always on row charts.

| Option | What it does |
|---|---|
| **Don't stack** | Series are drawn side by side (bars) or overlapping (areas). |
| **Stack** | Series are stacked, and the total is the sum. |
| **Stack — 100%** | Series are stacked and scaled to fill the full height, so each shows its share. |

The default is **Don't stack** for bar, row and combo, and **Stack** for area.

#### Stack totals

A switch, shown when **Stacking** is **Stack**. It prints the total on top of each stacked column.

#### Line shape, Missing values, Markers

Shown when at least one series is drawn as a line (line charts, area charts, combo line series, and any series you set to **Line** or **Area**).

| Setting | Options | Default |
|---|---|---|
| **Line shape** | **Linear**, **Smooth**, **Step** | **Linear** |
| **Missing values** | **Connect** (bridge across the gap), **Zero** (drop to zero), **Gap** (leave a break) | **Connect** |
| **Markers** | **Auto** (only when there are few enough points to read), **On**, **Off** | **Auto** |

**Zero** rewrites the data, so it affects stack totals. Use it knowingly.

#### The series list

One row per series. A series is a metric, or a value of the **Series** dimension. The row has:

- A drag handle to reorder series. The order sets the stacking and legend order.
- A color swatch. Click it for the palette or **Custom…**.
- A display select (**Line**, **Area**, **Bar**), on line, area, bar and combo charts when **Stacking** is **Don't stack**. It sets how this one series is drawn, which is how you build a combo chart from any of them.
- A name box. Type a label to rename the series in the legend and tooltip; the placeholder is the original name.
- A settings button (gear), on series drawn as lines. It opens a popover with per-series overrides for **Line shape**, **Line style** (**Solid**, **Dashed**, **Dotted**), **Line size** (**S**, **M**, **L**), **Markers** (**On**, **Off**) and **Missing values**. Each also has **Auto**, which follows the chart-wide setting.
- A switch that shows or hides the series.

With more than ten series, the list shows the first ten and a **Show N more series** link.

### Format section

#### Legend

**Auto**, **On** or **Off**. **Auto** shows the legend when there is a breakout or more than one metric.

#### Data labels

A switch that prints each value on the chart. When on, **Data label density** appears: **Fit** (default) drops labels that would collide, **All** draws every one.

#### Shorten large numbers

**Auto**, **On** or **Off**. When on, axis numbers are shortened (for example 25.5K, 400M). **Auto** shortens once the axis numbers get wide.

#### Goal value and Goal label

Draws a horizontal reference line at the value you type. The box shows **none** when empty. When a goal is set, **Goal label** appears with the placeholder **Goal**.

#### Trend line

A switch that overlays a least-squares trend line. Not available for a scatter chart that plots a metric on the X-axis.

### Formatting

One row per column the chart uses. See [Column formatting and number formats](./column-formatting).

## Axes tab

The tab has one group per axis. For a row chart, and for a bar chart with **Horizontal** on, the category axis is vertical, so the groups are labelled **Y-axis** then **X-axis**, and every setting follows the group it is in.

### Horizontal

Bar charts only. A switch at the top of the tab that turns the columns into horizontal bars. Row charts are always horizontal and have no such switch.

### The category axis (**X-axis** on a vertical chart)

| Setting | Options and behaviour |
|---|---|
| **X label** | A switch that shows or hides the axis title. When on, a text box with the placeholder **Auto** lets you type your own title. |
| **X axis scale** | **Ordinal** (default; one position per category), **Linear** (a numeric axis; disabled unless the X column is numeric), **Timeseries** (a time axis; disabled unless the X column is a date or time). Not shown on horizontal charts or on a metric-versus-metric scatter. |
| **Show lines and tick marks** | **Hide**, **Show** (default), **Compact**, **Rotate 45°**, **Rotate 90°**. **Compact** shortens category names; the rotations tilt the labels. On a value axis (scatter), rotations and **Compact** are disabled with the note **Rotation and Compact apply to a category axis; this chart plots values across.** If you pick no rotation, Egret tilts long labels on its own. |

### The value axis (**Y-axis** on a vertical chart)

| Setting | Options and behaviour |
|---|---|
| **Y label** | The same switch and **Auto** text box as the X label. |
| Per-series axis (one select per series, labelled with the series name) | **Auto**, **Left**, **Right**. Appears when the chart has more than one series, is vertical, is not stacked and **Stack series** is off. Assigning one series to **Right** gives it its own scale on the right-hand side. |
| **Y scale** | **Linear** (default) or **Log**. |
| **Split y-axis when necessary** | A switch, on by default. Shown on charts with several metrics and no breakout. When the metrics' ranges differ greatly, Egret puts them on two axes. Turn it off to keep one axis. |
| **Show lines and tick marks** | **Hide** or **Show** (default). |
| **Number of tick marks** | A whole number from 2 to 20, or empty for automatic. Shown while ticks are shown. |
| **Auto y-axis range** | A switch, on by default. Turn it off to set **Y min** and **Y max** by hand; each box shows **auto** when empty. |
| **Unpin from zero** | A switch. Lets the value axis fit the data instead of always reaching zero. It is on by default for scatter charts and off for the others, and is offered only when no series is a bar or area and the chart is not stacked and has no manual range. |

:::tip
To compare a count and an amount, set one metric to **Right** under the value axis. The chart then has a scale on each side.
:::

## Limits and known issues

- A chart with a **Series** plots one metric. Use several metrics without a series, or a series without extra metrics.
- Scatter charts have no **Max categories** and no **Stacking**. A scatter's **Trend line** is hidden when the X-axis is a metric.
- Axis titles default to the metric's database name rather than its display name; rename it with **Y label**.

## Further reading

- [Bar](./bar), [Row](./row), [Line](./line), [Area](./area), [Combo](./combo), [Scatter](./scatter)
- [Column formatting and number formats](./column-formatting)
- [The chart editor](./the-chart-editor)
