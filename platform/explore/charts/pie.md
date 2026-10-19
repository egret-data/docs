---
sidebar_position: 10
---

# Pie chart

A pie chart shows each category's share of one metric. Switch it to a donut to leave room for the total in the middle, or add up to three dimensions to draw nested rings. Use it for a few categories that add up to a meaningful whole, such as orders by priority.

![The Display tab of a donut chart of orders by priority](/img/platform/charts/pie-display.png)

## Create a pie chart

1. Go to **Explore → Charts**, press **+ Chart** and pick **Pie**.
2. Choose a **Dataset**.
3. Under **Dimensions**, pick the category (for example `orderpriority`).
4. Set **Metric** to the measure that sizes each slice (for example **Orders**).
5. Press **Save**.

## Data

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Dimensions** | One to three dimensions. The first is the innermost ring; each further dimension adds an outer ring that breaks the slice down. A new empty picker (**Add a dimension…**) appears until you have three. For a time column, a **Group … by** select appears. Required. |
| **Metric** | A single metric. Required. |
| **Sort**, **Row limit** | Query controls. |

## Display

### Legend

**Auto**, **On** or **Off**. **Auto** shows the legend, because the colors of a pie mean nothing without it.

### Donut

A switch that cuts a hole in the middle. A chart with more than one ring always has a hole.

### Show total

**Auto**, **On** or **Off**. Shown when the chart is a donut or has several rings. **Auto** writes the grand total into the hole.

### Show labels

**Auto**, **On** or **Off**. Writes each slice's name on its arc and hides the ones that would overlap. **Auto** leaves a single ring bare, because its slices are named in the legend, and labels a multi-ring pie.

### Percentages

Where each slice's percentage is shown.

| Option | What it does |
|---|---|
| **Auto** | Same as **In legend**. |
| **Off** | No percentages. |
| **In legend** | The share is written beside the name in the legend. |
| **In chart** | The share is written on the slice. |
| **Both** | Both places. |

When percentages are shown, **Decimal places** appears: a whole number from 0 to 10, empty for automatic.

### Sort by value

A switch, on by default. Orders slices from largest to smallest. Turn it off to follow the query's order, or reorder slices by hand in the list below.

### Group slices below

A percentage, default **2.5**. Slices smaller than this are combined into a single grey **Other** slice. Enter `0` to turn grouping off. The list under **Slices** names which slices were folded: **Other — *names of the folded slices*, grouped by the threshold above**.

### Slices

![The Slices list at the bottom of the Display tab](/img/platform/charts/pie-slices.png)

One row per slice of the innermost ring (outer rings are not affected, as the note under the heading says). Each row has a drag handle to reorder, a color swatch, a name box to rename the slice (the placeholder is the original value) and a switch to hide the slice.

### Formatting

One row for the dimension and one for the metric. See [Column formatting and number formats](./column-formatting).

### A chart with several rings

![A pie chart with two rings: order priority inside, order status outside](/img/platform/charts/pie-rings.png)

With two dimensions the chart draws two rings. The inner ring is the first dimension and the outer ring splits each slice by the second dimension. The legend and the **Slices** list describe the innermost ring. Labels are on by default (**Show labels** **Auto**) because the outer ring has no legend of its own. Under the chart, a **Slice breakdown — 20 slices across 2 rings** disclosure opens a table of every slice for readers who cannot see the colors.

## Related tasks

### Draw a two-level breakdown

Add a second dimension, for example `orderstatus` after `orderpriority`. The chart gets an outer ring that splits each priority by status, a hole, a total in the middle and labels on the arcs (see above).

:::tip
Click a slice to open the drill menu and filter the chart to that category, or to list its records.
:::

## Reading a pie chart

Hovering the pie lists every slice with its value and share, and the total. The legend lists the slices from largest to smallest (with **Sort by value** on), each with its color and, with the default **Auto** percentages, its share. Slices smaller than **Group slices below** are merged into **Other**. The total in the hole is the grand total of the metric.

## Limits and known issues

- A pie chart takes one metric.
- At most three dimensions (rings).
- **Slices** edits only the innermost ring.
- Too many small categories make a pie hard to read; raise **Group slices below** or use a [Bar chart](./bar) or [Row chart](./row).

## Further reading

- [Column formatting and number formats](./column-formatting)
- [The chart editor](./the-chart-editor)
