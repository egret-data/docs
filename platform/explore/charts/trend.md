---
sidebar_position: 14
---

# Trend

A trend shows the latest value of a metric as a big number, with how much it changed against an earlier period, a previous row or a number you choose. Use it for "revenue this month, up 4 % on last month".

![The Data tab of a trend with two comparisons](/img/platform/charts/trend-data.png)

## Create a trend

1. Go to **Explore → Charts**, press **+ Chart** and pick **Trend**.
2. Choose a **Dataset**.
3. Set **Time / order dimension** to a time column, for example `orderdate`. Egret groups it by **Month** by default; change the **Group … by** select if you want days, weeks, quarters or years.
4. Set **Metric**, for example **Revenue**.
5. Press **Save**.

The preview shows the latest period's value, the period's name (**July 1998**), and a line such as **▲ 12.23% vs previous month: 24,379,023.47**.

## How the numbers are chosen

- The query groups the metric by the time field and **always sorts it ascending by that field**, so there is no **Sort** control on this chart type.
- The "latest" value is the last row that has both a date and a value. Empty trailing periods are skipped.
- A comparison finds the row for the earlier period by its date, not by its position, so a missing month shows **N/A** and **(No data)** instead of silently comparing against the wrong month.
- The change is shown as a percentage of the earlier value, with ▲ (up), ▼ (down) or • (unchanged). When the earlier value is zero the percentage cannot be computed and the absolute change is shown instead.

## Data

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Time / order dimension** | The column that orders the rows. Required. A time column gets a **Group … by** select. |
| **Metric** | The value to track. Required. |
| **Comparisons** | What the number is measured against; see below. |
| **Row limit** | The number of grouped rows fetched. |

### Comparisons

The section explains itself: **What the number is measured against. With none set, a chart grouped by a time period compares against the previous one; an ungrouped one compares against the previous row.**

Press **Add comparison** to add a row (at most three; the button then disables). Each row has a type select and a trash button.

| Type | Shown when | What it compares with |
|---|---|---|
| **Previous *period*** (for example **Previous month**) | The dimension is grouped by minute, hour, day, week, month, quarter or year | The row one period earlier. |
| ***Periods* ago** (for example **Months ago**) | Same | The row *n* periods earlier. A box **How many *periods* back** takes a whole number of 1 or more. |
| **Previous value** | Always | The nearest earlier row that has a value, whatever its date. |
| **Custom value…** | Always | A number you type. Needs both a **Value** and a **Label** (placeholder **Goal**). The label is what the caption says: with the label `Monthly goal` the caption reads **▼ 8.80% vs Monthly goal: 30,000,000**. |

A row that is not valid for the current grouping (for example **Previous month** after you switch to **Extract**) is ignored. With no valid rows, Egret uses the default comparison.

## Display

### Switch positive / negative colors

A switch with the hint **For a metric where less is better — cost, churn, time to resolve.** Increases are green and decreases red by default; the switch swaps them.

### Compact number

A switch with the hint **36,513 becomes 36.5k.** It abbreviates the big number and the comparison values. Even without it, the number shortens automatically when the card is too small, and the full value appears in a tooltip when you hover it.

### Formatting

One row for the time dimension and one for the metric. A date format on the dimension changes how the period is named. See [Column formatting and number formats](./column-formatting).

![The Display tab of a trend](/img/platform/charts/trend-display.png)

## Limits and known issues

- The trend card needs a time dimension; it has no "ungrouped" mode in the editor.
- There is no **Sort**; the order is fixed.
- A comparison against another column of the same row is not available.

## Further reading

- [Big number](./number)
- [Time grouping](./the-chart-editor#time-grouping)
