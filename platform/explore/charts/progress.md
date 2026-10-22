---
sidebar_position: 12
---

# Progress bar

A progress bar shows one value against a goal as a filled bar. Use it for targets, such as orders so far against this quarter's target.

![The Display tab of a progress bar of orders against a goal of 20,000](/img/platform/charts/progress-display.png)

## Create a progress bar

1. Go to **Explore → Charts**, press **+ Chart** and pick **Progress**.
2. Choose a **Dataset** and set **Metric**, for example **Orders**.
3. Type a **Goal**, for example `20000`.
4. Press **Save**.

![The Data tab of the progress bar](/img/platform/charts/progress-data.png)

## Data

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Metric** | The value shown as the filled part of the bar. Required. |
| **Goal** | A target number, with the placeholder **Target value**. Accepts decimals. |

## Display

### Colour

The bar color. The default is the second color in Egret's chart palette. Click the swatch for the palette or **Custom…**. The track behind the bar uses shades derived from this color.

### Goal from a metric

A select that reads the target from another metric instead of the typed **Goal**. The options are **None — use the fixed goal** and every metric of the dataset. The hint reads **A metric whose value is the target, instead of a number typed once.** The chosen metric is fetched in the same single-row query.

### Formatting

One row for the metric; see [Column formatting and number formats](./column-formatting).

## How the bar reads

The bar fills to the metric's share of the goal. A small triangle above the bar marks the value, with the value written over it, and under the bar the scale runs from **0** to **Goal *n***. The bar shows a short message above its left end in these cases:

| Message | When |
|---|---|
| **Goal met** | The value equals the goal. |
| **Goal exceeded** | The value is greater than the goal. The bar is full and its track turns darker. |
| **No value data** | The query returned no value. |
| **No goal set** | There is a value but no goal: **Goal** is empty and no **Goal from a metric** is chosen, or the goal metric has no value. The bar stays empty and the scale under it is not drawn. |
| **No data available** | There is neither a value nor a goal. |

When the value is below the goal there is no message.

## Settings at a glance

| Setting | Where | Default |
|---|---|---|
| **Metric** | Data | Required |
| **Goal** | Data | Empty (no goal) |
| **Colour** | Display | The palette's second color (green) |
| **Goal from a metric** | Display | **None — use the fixed goal** |
| **Formatting** (one row for the metric) | Display | Dataset's format |

## Example: orders against a target

With **Metric** = **Orders** (15,000 orders in the sample) and **Goal** = `20000`, the bar is 75 % full, the pointer sits at 15,000 and the scale reads **0** to **Goal 20,000**, as in the screenshot above. Changing **Goal** to `15000` makes the message **Goal met** appear, and anything lower shows **Goal exceeded**.

## Limits and known issues

- The panel uses the spelling **Colour** here, **Color** on most other types.
- Clicking the bar opens the drill menu with only **See these records**.
- There is no **Row limit**: the query always returns one row.

## Further reading

- [Gauge](./gauge), [Big number](./number)
