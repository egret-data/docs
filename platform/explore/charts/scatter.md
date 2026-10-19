---
sidebar_position: 8
---

# Scatter chart

A scatter chart plots points. Use it to see how two metrics relate across a set of categories (for example, customers against average account balance for each nation), or to plot one metric against a category as dots. A third metric can size each point to make a bubble chart.

![The Data tab of a bubble chart: average balance on X, customers on Y, total balance as bubble size](/img/platform/charts/scatter-data.png)

Scatter charts share settings with the rest of the bar-and-line family. See [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings) for options not repeated here.

## Create a bubble chart

1. Go to **Explore → Charts**, press **+ Chart** and pick **Scatter**.
2. Choose a **Dataset** (for example *Customers by nation*).
3. Set **X-axis** to the dimension that makes one point per value, for example `nation`.
4. Set **X metric (optional)** to a metric, for example **Average balance**. Leaving it at **None — use the dimension** plots the metric against the category instead.
5. Under **Y-axis**, add the metric for the vertical position, for example **Customers**.
6. Set **Bubble size** to a third metric, for example **Total balance**. The control appears once an **X metric** is chosen; **None — every point the same size** gives uniform dots.
7. Press **Save**.

## Data

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **X-axis** | The dimension that defines the points: one point per value. Required. |
| **X metric (optional)** | A metric drawn on the horizontal axis, making a metric-versus-metric plot. Default **None — use the dimension**. |
| **Bubble size** | A metric that sizes each point. Shown only when an **X metric** is set. Default **None — every point the same size**. |
| **Y-axis** | One or more metrics for the vertical position. Required. |
| **Series** | Colors the points by another dimension. |
| **Tooltip metrics** | Extra metrics shown in the tooltip. The plotted metrics are not offered. |
| **Sort**, **Row limit** | Query controls. |

There is no **Max categories**: a scatter chart does not fold points into **Other**.

## Display

The **Series** section lists the series (one per Y metric, or per **Series** value) with a color swatch, a name box and a show/hide switch. Scatter series have no **Line**/**Area**/**Bar** select and no line settings.

The **Format** section has **Legend**, **Data labels**, **Shorten large numbers** and **Goal value**. **Trend line** is shown only when the X-axis is a category; it is hidden for a metric-versus-metric plot.

## Axes

![The Axes tab of a bubble chart](/img/platform/charts/scatter-axes.png)

On a metric-versus-metric plot both axes are value axes, so the X group is short: **X label** and **Show lines and tick marks**, where the rotation and **Compact** choices are disabled with the note **Rotation and Compact apply to a category axis; this chart plots values across.** **X axis scale** is hidden. The Y group has **Y label**, **Y scale**, **Show lines and tick marks**, **Number of tick marks**, **Auto y-axis range** and **Unpin from zero**.

Scatter charts are the one type where **Unpin from zero** is **on** by default: a cloud of points rarely needs the origin.

## Settings at a glance

| Setting | Where | Available for this chart |
|---|---|---|
| **X metric (optional)**, **Bubble size** | Data | Yes (scatter only) |
| **Max categories** | Data | No |
| **Stack series**, **Stacking**, **Line shape**, **Missing values**, **Markers** | Display → Series | No (points only; **Stack series** is hidden when an X metric is set) |
| Series list: color, name, show/hide | Display → Series | Yes |
| **Legend**, **Data labels**, **Shorten large numbers**, **Goal value** | Display → Format | Yes |
| **Trend line** | Display → Format | Only without an X metric |
| **X label**, **Show lines and tick marks** | Axes → X-axis | Yes |
| **X axis scale** | Axes → X-axis | Only without an X metric |
| **Y label**, **Y scale**, tick settings, **Auto y-axis range**, **Unpin from zero** | Axes → Y-axis | Yes (**Unpin from zero** on by default) |
| **Horizontal** | Axes | No |

## Reading a bubble chart

Each bubble is one value of the **X-axis** dimension (here, one nation). Its horizontal position is the **X metric** (average account balance), its vertical position is the **Y-axis** metric (number of customers), and its area is the **Bubble size** metric (total balance). Hover a bubble for the nation and the three values. Because every metric is aggregated per nation, there is one bubble per nation: 25 in the TPC-H sample.

## Limits and known issues

- Bubble size is available only with an **X metric**.
- Only metrics can be plotted on a value axis. To plot a raw column, create a dataset metric for it first.
- Scatter charts do not stack.

## Further reading

- [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings)
- [Datasets & metrics](../datasets-and-metrics)
