---
sidebar_position: 20
---

# Table

A table lists rows. In its simplest form it shows raw rows from a dataset; add metrics and it becomes an aggregated table with one row per combination of the columns you chose. Tables support sorting, column order and width, hiding and formatting columns, frozen columns and rows, pagination and [conditional formatting](./conditional-formatting).

![A table of customers by region and market segment with conditional formatting](/img/platform/charts/table-display.png)

## Create a table

**A table of raw rows**

1. Go to **Explore → Charts**, press **+ Chart** and pick **Table**.
2. Choose a **Dataset**.
3. Open **Add or remove columns…** under **Columns** and tick the columns to show.
4. Leave **Metrics** empty. The hint reads **With none, the table lists raw rows.**

**An aggregated table**

1. In the same place, add one or more **Metrics** (for example **Customers** and **Average balance**).
2. Under **Columns**, keep the dimension columns to group by (for example `region` and `segment`). With metrics set, the columns become the **group by** fields and the table has one row per group.
3. Press **Save**.

A table with neither a metric nor a column is not valid: the preview asks for **at least one column or metric**.

## Data

![The Data tab of a table](/img/platform/charts/table-data.png)

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Metrics** | Zero or more metrics. Chips can be reordered and removed. |
| **Group … by** | For each time column among the grouped columns, a select such as **orderdate:** to group by **Month**, **Day** and so on. Only with metrics. |
| **Columns** | The columns of the result, once the table has run. See below. |
| **Sort**, **Row limit** | Query controls. The sort runs in the database, so with **Row limit** it decides which rows you get. |

### Columns

The **Columns** list shows each result column in the order it is displayed. It has:

- **Show all** and **Hide all** links.
- A **Search columns…** box, shown when the table has 12 or more columns. Reordering is disabled while a search is active.
- One row per column: a drag handle (reorder), a type icon, the column's name (and its title, when you set one), a settings button (gear) that opens the column's format, and an eye button that hides or shows the column.
- **Add or remove columns…**, a menu with a checklist of the dataset's columns and metrics. Ticking a column adds it to the query.

Hiding a column only hides it in the table. It is still fetched, and conditional formatting rules can still use it.

The gear opens the per-column format: **Column title**, number style, decimals, prefix and suffix, **Show a mini bar chart**, date style, **Display as** and more. All of it is documented in [Column formatting and number formats](./column-formatting).

![The format popover of a numeric column](/img/platform/charts/table-column-settings.png)

## Display

| Setting | What it does | Default |
|---|---|---|
| **Freeze first columns** | The number of leftmost columns that stay in place when you scroll sideways. Counts only visible columns. | `0` |
| **Show row index** | Adds a **#** column that numbers the visible rows. | Off |
| **Freeze first rows** | The number of top rows (after sorting) that stay under the header when you scroll down. | `0` |
| **Pagination → Paginate** | Splits the result into pages with **Prev** and **Next** buttons. | Off |
| **Page size** | **25**, **50** or **100** rows per page. Shown when pagination is on. | **25** |

Without pagination the table scrolls inside the card (up to 60 % of the window height) and a footer reads **Showing *n* rows**. With pagination, the footer shows the range (for example **1–25 of 100**) between **Prev** and **Next**.

## Conditional formatting

The **Conditional formatting** tab holds the table's color rules. See [Conditional formatting](./conditional-formatting).

## Working with the table

- **Sort**: click a column header to sort the rows on screen by that column; click again to reverse. This reorders what was fetched and does not change the query.
- **Reorder**: drag a header to move the column.
- **Resize**: drag the edge of a header. The width is saved with the chart.
- **Drill**: in an aggregated table, click a value to open the drill menu (**Filter by …** or **See these records**); the menu uses the row's group-by values.

## Limits and known issues

- A chart returns at most 10,000 rows; use **Pagination** to browse them.
- Sorting by clicking a header sorts only the fetched rows. For "top 10", set a **Sort** and a **Row limit** on the **Data** tab.
- A table with every column hidden shows **Every column is hidden. Turn one back on under Columns.**
- Clicking cells in a raw-rows table does not open a drill menu; only aggregated tables do.

## Further reading

- [Pivot Table](./pivot-table), [Object detail](./object-detail)
- [Conditional formatting](./conditional-formatting)
- [Column formatting and number formats](./column-formatting)
