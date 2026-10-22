---
sidebar_position: 5
---

# Row chart

A row chart is a bar chart turned on its side: one horizontal bar per category, with the category names down the left. It suits rankings and categories with long names, such as clerks, customers or products.

![A row chart of the ten clerks with the highest revenue](/img/platform/charts/row-data.png)

Row charts use the same settings as [bar charts](./bar) and the rest of the family; the full reference is [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings). This page covers what is particular to rows.

## Create a row chart

1. Go to **Explore → Charts**, press **+ Chart** and pick **Row**.
2. Choose a **Dataset**, set **X-axis** to the dimension to rank (for example `clerk`) and add a metric under **Y-axis** (for example **Revenue**).
3. Set **Row limit** to `10`.
4. Press **Save**.

The dimension is still called **X-axis** on the **Data** tab even though it is drawn vertically. The settings follow the drawing, not the field names: on the **Axes** tab the vertical category axis is labelled **Y-axis**.

A row chart is sorted by value on its own, as the gallery says: with no **Sort**, it orders by its first metric, largest first, with the category as the tie-breaker. Rows are drawn top to bottom in that order, so the largest bar is at the top. A **Sort** you add replaces the default.

## Data

Identical to the bar chart: **Dataset**, **X-axis**, **Y-axis**, **Series**, **Tooltip metrics**, **Max categories**, **Sort** and **Row limit**. A **Series** splits each row into segments; only the first metric is plotted then.

## Display

- **Stacking** is always offered, even with a single series, because a row chart with a **Series** is often stacked. Options: **Don't stack** (the default), **Stack**, **Stack — 100%**. **Stack totals** appears with **Stack**.
- Rows have no per-series **Line**/**Area**/**Bar** select, because every series is drawn as a bar.
- **Legend**, **Data labels**, **Shorten large numbers**, **Goal value** and the **series list** are as on a bar chart. **Trend line** is available.

## Axes

There is no **Horizontal** switch. The first group is the category axis, labelled **Y-axis**, with **Y label** and **Show lines and tick marks**. The second group is the value axis, labelled **X-axis**, with **X label**, **X scale** (**Linear** or **Log**), tick marks, **Number of tick marks** and **Auto x-axis range** (turn it off to type **X min** and **X max**). As with bars, the value axis starts at zero.

## Settings at a glance

| Setting | Where | Available for this chart |
|---|---|---|
| **Stacking**, **Stack totals** | Display → Series | Yes, always offered (default **Don't stack**) |
| **Stack series** | Display → Series | No (rows are horizontal) |
| **Line shape**, **Missing values**, **Markers**, series **Line** / **Area** / **Bar** select | Display → Series | No: every series is a bar |
| Series list: color, name, show/hide | Display → Series | Yes |
| **Legend**, **Data labels**, **Shorten large numbers**, **Goal value**, **Trend line** | Display → Format | Yes |
| **Y label**, **Show lines and tick marks** (category axis) | Axes → Y-axis group | Yes |
| **X label**, **X scale**, **Show lines and tick marks**, **Number of tick marks**, **Auto x-axis range** (value axis) | Axes → X-axis group | Yes |
| **Horizontal**, **Unpin from zero**, **Split y-axis when necessary** | Axes | No |

## Ranking categories

To rank, leave **Sort** empty and set **Row limit** to the number of rows you want: the default order is the first metric, descending, so a limit of 10 keeps the ten largest, drawn with the largest at the top. To list the categories alphabetically instead, add a **Sort** on the category, ascending. A row chart saved before this default existed may carry that alphabetical sort already; it shows in the **Sort** control, and removing it brings back the ranking.

## Limits and known issues

- The **Data** tab labels the category field **X-axis** although it is drawn vertically.

## Further reading

- [Bar chart](./bar)
- [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings)
