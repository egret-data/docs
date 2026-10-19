---
sidebar_position: 4
---

# Bar chart

A bar chart compares a metric across categories, one bar per category. Add a **Series** to split each bar into groups, or stack the groups. Use it for questions such as "revenue by order priority" or "orders by status".

![A stacked bar chart of revenue by order priority and status, with the Display tab open](/img/platform/charts/bar-display.png)

Bar charts share their settings with row, line, area, combo and scatter charts. This page walks through the steps and the options that matter for bars. For the complete, option-by-option reference, see [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings).

## Create a bar chart

1. Go to **Explore → Charts**, press **+ Chart** and pick **Bar**.
2. On **Data**, choose a **Dataset**, for example *orders*.
3. Set **X-axis** to the dimension to group by, for example `orderpriority`.
4. Under **Y-axis** press **Add y-axis…** and pick a metric, for example **Revenue**.
5. Optionally set **Series** to a second dimension, for example `orderstatus`.
6. Press **Save**.

The first run happens as soon as the required fields are set. **View SQL** shows what was run:

```sql
SELECT "orderpriority" AS "orderpriority", sum(totalprice) AS "revenue"
FROM "tpch"."tiny"."orders"
GROUP BY "orderpriority"
ORDER BY "orderpriority" ASC
LIMIT 1000
```

## Data

![The Data tab of a bar chart with a series](/img/platform/charts/bar-data.png)

| Field | Required | What it does |
|---|---|---|
| **Dataset** | Yes | The dataset to read. |
| **X-axis** | Yes | The dimension on the category axis. A time column gets a **Group … by** select (default **Month**). |
| **Y-axis** | Yes | One or more metrics. Several metrics draw several bars per category. |
| **Series** | No | Splits each category by another dimension. Only the first metric is plotted when a series is set. |
| **Tooltip metrics** | No | Extra metrics shown only in the tooltip. |
| **Max categories** | No | Keeps the largest categories and sums the rest into **Other**. |
| **Sort**, **Row limit** | No | Query controls; see [The chart editor](./the-chart-editor). |

Without a **Sort**, categories are drawn in alphabetical order (or chronological order for dates and numeric order for numbers). Add a **Sort** by the metric, descending, to rank the bars.

## Display

On **Display**, the options that are specific to bars:

- **Stacking** (when there is more than one series): **Don't stack**, **Stack** or **Stack — 100%**. The default is **Don't stack**. **Stack** also reveals **Stack totals**, which prints each column's total.
- **Stack series**: draws each series in its own panel instead.
- The **series list** lets you rename, recolor, reorder and hide series, or draw a series as a line or area to make a combo chart.
- **Data labels** with **Data label density**, **Legend**, **Shorten large numbers**, **Goal value** and **Trend line**.

The legend defaults to **Auto**, which shows it once there is a breakout or more than one metric. In the screenshot above it is set to **On**.

## Axes

![The Axes tab of a bar chart](/img/platform/charts/bar-axes.png)

The **Axes** tab starts with **Horizontal**, a switch unique to bar charts that lays the bars on their side. After that come the **X-axis** group (**X label**, **X axis scale**, **Show lines and tick marks**) and the **Y-axis** group (**Y label**, **Y scale**, **Show lines and tick marks**, **Number of tick marks**, **Auto y-axis range**). A bar chart's value axis always starts at zero: **Unpin from zero** is not offered because bars are measured from the baseline.

## Related tasks

### Rank categories

Add **Sort → Revenue → descending** and set a **Row limit** such as 10 to show the top ten. Turn on **Horizontal** if the category names are long, or use a [Row chart](./row).

### Show a share of the total

Choose a **Series**, then set **Stacking** to **Stack — 100%**.

:::tip
Click a bar to open the drill menu: **Filter by …** or **See these records**. See [The chart editor](./the-chart-editor#drill-through).
:::

## Limits and known issues

- A bar chart needs both an **X-axis** and at least one metric; until then the preview reads **Set up your Bar**.
- A chart with a **Series** plots only its first metric.
- Row limit is capped at 10,000 rows.

## Further reading

- [Settings shared by bar, row, line, area, combo and scatter charts](./cartesian-settings)
- [Row chart](./row), [Combo chart](./combo)
- [Column formatting and number formats](./column-formatting)
