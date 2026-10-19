---
sidebar_position: 21
---

# Pivot Table

A pivot table cross-tabulates a metric: one dimension down the side, another across the top, with subtotals and grand totals. Use it for "customers by region and market segment" where a plain table would repeat the region on every row.

![A pivot table of customers by region (rows) and segment (columns) with totals](/img/platform/charts/pivot-display.png)

## Create a pivot table

1. Go to **Explore → Charts**, press **+ Chart** and pick **Pivot Table**.
2. Choose a **Dataset** (for example *Customers by nation*).
3. Under **Rows**, press **Add rows…** and pick the dimension to list down the side (`region`).
4. Under **Columns**, pick the dimension to spread across the top (`segment`).
5. Under **Values**, add one or more metrics (**Customers**).
6. Press **Save**.

The preview shows a **Total** column down the right and a **Grand totals** row at the bottom.

## Data

![The Data tab of a pivot table](/img/platform/charts/pivot-data.png)

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Rows** | One or more dimensions down the side. The first is the outermost group. Required. A dimension chosen for **Columns** is not offered here. |
| **Columns** | Zero or more dimensions across the top. Optional. A dimension chosen for **Rows** is not offered here. |
| **Values** | One or more metrics shown in the cells. Required. |
| **Sort**, **Row limit** | Query controls. |

Time columns used as rows or columns get a **Group … by** select (default **Month**). Chips in each list can be dragged to reorder; the order is the nesting order.

The query returns the grouped result plus the rollups for the totals, so totals are computed by the database and not by adding up the cells in the browser.

## Display

The **Display** tab starts with **Totals**:

| Setting | What it does | Default |
|---|---|---|
| **Show row totals** | A **Total** column on the right. Hint: **A Total column down the right-hand side.** | On |
| **Show column totals** | Subtotal rows per group and a **Grand totals** row at the bottom. Hint: **Subtotal bands per group, and a Grand totals row at the bottom.** | On |
| **Condense duplicate totals** | Hides a subtotal row when its group has only one row, since the two would read the same. | On |
| **Subtotals for** | One switch per row dimension except the last. Turn one off to drop that level's subtotal rows. Shown when column totals are on and there are two or more row dimensions. | On for each |

Below are the **Formatting** rows for the dimensions and metrics. See [Column formatting and number formats](./column-formatting).

## Conditional formatting

The pivot table has a **Conditional formatting** tab. Rules apply to the **Values** (metric) columns only, and the **Highlight whole row** option is not offered. See [Conditional formatting](./conditional-formatting).

## Working with the pivot table

- **Collapse** a group: click the **–** beside a row group heading; click **+** to expand. Collapsed groups are saved with the chart.
- **Sort** a row dimension: click its header to cycle ascending, descending and unsorted.
- **Resize** columns by dragging header edges. Widths are saved.
- **Drill**: click a value cell to open the drill menu. It filters by every row and column group of that cell.

## Settings at a glance

| Setting | Where | Default |
|---|---|---|
| **Rows**, **Columns**, **Values** | Data | Rows and values required |
| **Sort**, **Row limit** | Data | No sort, 1000 |
| **Show row totals**, **Show column totals**, **Condense duplicate totals** | Display → Totals | On, on, on |
| **Subtotals for** each row dimension but the last | Display → Totals | On |
| **Formatting** (one row per dimension and metric) | Display | Dataset's formats |
| Rules | Conditional formatting | None |
| **Axes** tab | | Not applicable |

## Example: customers by region and segment

With **Rows** = `region`, **Columns** = `segment` and **Values** = **Customers**, the table has one row per region and one column per segment, a **Total** column on the right and a **Grand totals** row at the bottom. In the sample data the grand total is 1,500 customers (the sum of the five region totals).

Adding a second row dimension, for example `nation` after `region`, nests the nations under each region, adds a subtotal row per region (while **Show column totals** and **Subtotals for** *region* are on) and shows **+** / **–** controls to collapse a region.

## Limits and known issues

- A pivot table needs at least one row dimension and one value.
- It is limited to 10,000 grouped rows.
- Only metrics can be cell values; raw columns cannot.

## Further reading

- [Table](./table)
- [Conditional formatting](./conditional-formatting)
