---
sidebar_position: 16
---

# Waterfall

A waterfall shows how a series of increases and decreases adds up. Each bar floats from where the previous one ended, green for a rise and red for a fall, and a final bar shows the running total. Use it for profit bridges, headcount changes and budget variances.

![The Display tab of a waterfall of monthly profit changes](/img/platform/charts/waterfall-display.png)

## Create a waterfall

1. Go to **Explore → Charts**, press **+ Chart** and pick **Waterfall**.
2. Choose a **Dataset** where each row is a step with a signed change (for example *Monthly profit change*).
3. Set **X-axis (steps)** to the step name or period and **Metric (delta)** to the change.
4. Add a **Sort** on the step column so the steps run in order.
5. Press **Save**.

## Data

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **X-axis (steps)** | What each bar is called: a period or a label. Required. A time column gets a **Group … by** select. |
| **Metric (delta)** | The signed change for each step. Required. |
| **Sort**, **Row limit** | Query controls. |

Each row becomes one bar. A positive metric draws a rise, a negative one a fall. Dates and numbers are ordered chronologically or numerically. Other step names are alphabetical until you add a **Sort** to the query.

## Display

The **Display** tab has two sections, **Bars** and **Format**.

### Bars

| Setting | What it does |
|---|---|
| **Increase color** | The color of rises. Default green. |
| **Decrease color** | The color of falls. Default red. |
| **Show total** | A switch, on by default. Adds a final bar named **Total** with the running sum. |
| **Total color** | The total bar's color. Shown while **Show total** is on. By default the bar uses the text color (dark in the light theme, light in the dark theme), and the swatch shows that color. |

Each color is a swatch that opens the palette or **Custom…**.

### Format

| Setting | What it does |
|---|---|
| **Show values on data points** | A switch that prints each bar's value. When on, **Data label density** appears (**Fit**, default, or **All**). |
| **Shorten large numbers** | **Auto**, **Compact** or **Full**. |
| **Goal value**, **Goal label** | A reference line. **Goal label** (placeholder **Goal**) appears once a value is set. |

### Formatting

One row per column. See [Column formatting and number formats](./column-formatting).

## Axes

![The Axes tab of a waterfall](/img/platform/charts/waterfall-axes.png)

The waterfall's axes use their own, shorter panel.

- **X-axis**: **X label** (a switch, with an **Auto** text box for your own title) and **Show lines and tick marks** (**Hide**, **Show**, **Compact**, **Rotate 45°**, **Rotate 90°**).
- **Y-axis**: **Y label** (with the text box), **Auto y-axis range** (turn off to type **Y min** and **Y max**), **Y scale** (**Linear** or **Log**), **Show lines and tick marks** (**Hide**, **Show**) and **Number of tick marks** (2 to 20).

## Reading the waterfall

Each bar starts where the previous one ended. A green bar going up is a positive change and a red bar going down is a negative one; the last bar, **Total**, stands on the zero line and its height is the running sum of every step. In the profit bridge above the steps add up from the first month to the closing total of 1,800. Hover a bar to see its change and the running total.

![The same waterfall with values shown on the bars](/img/platform/charts/waterfall-labels.png)

## Settings at a glance

| Setting | Where | Default |
|---|---|---|
| **X-axis (steps)**, **Metric (delta)** | Data | Required |
| **Increase color**, **Decrease color** | Display → Bars | Green, red |
| **Show total**, **Total color** | Display → Bars | On, the text color |
| **Show values on data points**, **Data label density** | Display → Format | Off, **Fit** |
| **Shorten large numbers** | Display → Format | **Auto** |
| **Goal value**, **Goal label** | Display → Format | None |
| **X label**, **Show lines and tick marks** (X) | Axes → X-axis | On, **Show** |
| **Y label**, **Auto y-axis range**, **Y scale**, **Show lines and tick marks**, **Number of tick marks** (Y) | Axes → Y-axis | On, on, **Linear**, **Show**, automatic |

## Limits and known issues

- A waterfall has one metric and no series.
- Rows with a non-numeric delta are skipped.
- Two rows with the same step name become two bars, not one.
- Without a **Sort**, text step names are alphabetical, so a business order such as "Opening, Revenue, Costs" needs a **Sort** on a column that orders it, or step names that sort naturally (for example dates).

## Further reading

- [Funnel](./funnel), [Bar chart](./bar)
