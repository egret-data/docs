---
sidebar_position: 15
---

# Funnel

A funnel shows how a quantity falls from one stage of a process to the next: visitors who viewed a product, added it to the cart and paid. Each stage is a column; the band between columns narrows with the value, and each stage after the first shows its share of the first.

![The Display tab of a funnel of checkout stages, with the first stage at 12,400 visitors](/img/platform/charts/funnel-display.png)

## Create a funnel

1. Go to **Explore → Charts**, press **+ Chart** and pick **Funnel**.
2. Choose a **Dataset** with one row per stage (for example *Checkout funnel*).
3. Set **Stage (dimension)** to the column that names the stage and **Metric** to the value (for example **Visitors**).
4. Under **Sort**, sort by the metric descending so the stages run from largest to smallest, or reorder them by hand (see **Steps** below).
5. Press **Save**.

## Data

![The Data tab with the Steps list](/img/platform/charts/funnel-data.png)

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Stage (dimension)** | The column holding the stage names. Required. A time column gets a **Group … by** select. |
| **Metric** | The value at each stage. Required. |
| **Steps** | The stages in display order, with a show/hide switch each. Appears after the chart has run. |
| **Sort**, **Row limit** | Query controls. |

### Steps

Drag a stage's handle to change its order and use its switch to leave it out. The note under the list says **A funnel reads left to right in this order — it is not re-sorted by size.** Until you reorder, stages appear in the order the query returned them, so add a **Sort** or reorder the steps; otherwise the stage order follows whatever the database returns. Stage names show with the dimension's column format, but the list's names cannot be edited.

## Display

### Funnel type

| Option | What it draws |
|---|---|
| **Funnel — one narrowing band** (default) | The classic funnel. The first stage shows its name, value and the metric name; each later stage shows its name, its share of the first stage (for example **65.32 %**) and its value, and a band whose height follows its value relative to the largest stage. |
| **Bar — a column per step** | One column per stage, drawn as a stacked-bar chart with a legend and axis. |

### Formatting

One row for the dimension and one for the metric. See [Column formatting and number formats](./column-formatting).

## Reading the funnel

- The first stage is the reference. It shows its name, its value in large type and the metric name, and every later stage shows a percentage of it, for example **65.32 %** for 8,100 of 12,400.
- The height of each band follows the stage's value relative to the **largest** stage, and the bands fade from dark to light along the funnel.
- Hiding a stage with its switch removes it from the funnel, and the percentages are recomputed against the new first stage.

![The same data as a Bar funnel, one column per stage](/img/platform/charts/funnel-bar.png)

With **Bar — a column per step**, each stage is a column on a bar chart with its own legend entry, which is easier to read when stages are many or the values very different. The stage names under the columns follow the same fit rule as a bar chart's X axis: all of them are drawn, upright or rotated, or none when they cannot all fit.

## Settings at a glance

| Setting | Where | Notes |
|---|---|---|
| **Stage (dimension)**, **Metric** | Data | Both required |
| **Steps** (order, show/hide) | Data | Appears after the chart has run |
| **Sort**, **Row limit** | Data | Query controls |
| **Funnel type** | Display | **Funnel — one narrowing band** (default) or **Bar — a column per step** |
| **Formatting** | Display | One row for the dimension, one for the metric |

There is no **Axes** tab.

## Limits and known issues

- The percentage under each stage is relative to the **first stage in the displayed order**, not to the previous stage.
- Stage names cannot be renamed here; rename or alias them in the dataset or the query.
- Clicking a stage opens the drill menu for that stage.
- **.png** export is offered only with **Bar — a column per step**. The default funnel is not drawn as one image, so it offers **.csv**, **.xlsx** and **.json** only.

## Further reading

- [Bar chart](./bar), [Waterfall](./waterfall)
