---
sidebar_position: 17
---

# Box plot

A box plot shows the spread of a numeric value for each category: the middle half of the values as a box, the median as a line, the mean as a diamond, whiskers for the range and, optionally, individual points. Use it to compare distributions, such as line prices by shipping mode.

![The Display tab of a box plot of line prices per ship mode](/img/platform/charts/boxplot-display.png)

## Create a box plot

1. Go to **Explore → Charts**, press **+ Chart** and pick **Box plot**.
2. Choose a **Dataset** (for example *Order lines*).
3. Set **Category** to the column to compare (`shipmode`) and **Value column** to the numeric column whose spread you want (`extendedprice`).
4. Press **Save**.

Unlike most charts, a box plot reads **raw rows, not aggregates**: the query returns the two columns row by row and Egret works out the quartiles in the browser. The category and the value are both picked from the dataset's columns, not its metrics.

## Data

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Category** | The column to group the boxes by. Required. Placeholder **Pick a column…**. |
| **Value column** | The numeric column to summarise. Required. Placeholder **Pick a numeric column…**. |
| **Sort**, **Row limit** | Query controls. |

:::warning
Because the quartiles are computed from the rows the query returns, **Row limit** (at most 10,000) decides how much data they are based on. On a dataset with more rows than the limit, the box plot summarises only the first rows the database returns, not the whole table. Add a filter by drilling in, or build a dataset that contains only the rows you want to compare.
:::

## Display

### Whiskers extend to

A radio group.

| Option | What it does |
|---|---|
| **1.5 × interquartile range** (default) | Whiskers reach the furthest value within 1.5 × the interquartile range of the box. Values beyond are outliers. |
| **Min/Max** | Whiskers reach the smallest and largest value. There are no outliers. |

### Show points

A radio group: **None**, **Outliers only** (not offered with **Min/Max**) and **All points**. The default is **Outliers only**; with **Min/Max** whiskers it becomes **None**.

### Show mean

A switch, on by default. Draws the mean as a diamond on each box.

### Show values on data points

A switch that prints values. When on, **Values to display** appears: **Median only** (default) or **All** (the whisker ends, quartiles and median).

### Color

A swatch for the one color the chart derives from: box fill, border, mean and points. Click for the palette or **Custom…**.

### Shorten large numbers

**Auto**, **Compact** or **Full**.

### Goal value and Goal label

A reference line at the value you type. **Goal label** (placeholder **Goal**) appears once a value is set.

### Formatting

One row for the category and one for the value column. See [Column formatting and number formats](./column-formatting).

## Axes

- **X-axis**: **X label** (switch plus an **Auto** text box) and **Show lines and tick marks** (**Hide**, **Show**, **Rotate 45°**, **Rotate 90°**).
- **Y-axis**: **Y label** (switch plus text box), **Auto y-axis range** (off reveals **Y min** and **Y max**), **Unpin from zero** (a switch, offered while the range is automatic), **Y scale** (**Linear**, **Log**), **Show lines and tick marks** and **Number of tick marks**.

**Unpin from zero** matters more here than elsewhere: a distribution of values between 40 and 60 spends most of a zero-based axis on empty space below the lowest whisker.

## Reading a box plot

- The **box** spans the first to the third quartile, so half of the values lie inside it. The line inside is the **median**.
- The **diamond** is the **mean**. When the mean sits above the median, a few large values are pulling the average up.
- The **whiskers** reach the furthest value within 1.5 times the box height (or the minimum and maximum with **Min/Max**). Dots beyond a whisker are **outliers**.
- Hover a box for its statistics: **Max**, **Q3**, **Median**, **Q1**, **Min** and **Mean**.

![The box plot with every point drawn and the values printed](/img/platform/charts/boxplot-points.png)

With **Show points** set to **All points**, every row is drawn as a dot over its box, which shows how the values cluster. With **Show values on data points**, the median is printed on each box; choose **All** under **Values to display** to print the whisker ends and quartiles too.

## Limits and known issues

- Quartiles are computed on at most 10,000 raw rows; see the warning above.
- Rows whose value is not a number are ignored.
- A category needs at least one numeric value to get a box.
- The **Axes** tab has no **Compact** option for category names.

## Further reading

- [Bar chart](./bar), [Scatter chart](./scatter)
