---
sidebar_position: 13
---

# Gauge

A gauge shows one value on a dial, with the dial divided into colored ranges. Use it when a value is good or bad depending on where it sits: average discount, uptime, utilisation.

![The Display tab of a gauge with three ranges, and the gauge showing 0.05](/img/platform/charts/gauge-display.png)

## Create a gauge

1. Go to **Explore → Charts**, press **+ Chart** and pick **Gauge**.
2. Choose a **Dataset** and a **Metric**, for example **Average discount** on *Order lines*.
3. On **Display**, edit the **Ranges** (see below), then press **Save**.

## Data

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Metric** | The value the needle points to. Required. The query returns one row, so there is no **Row limit**. |

## Display

### Ranges

The dial's scale is made from its ranges: it starts at the smallest **Min** and ends at the largest **Max**, and each range paints that stretch of the arc in its color. The needle shows the metric's value.

When you have not edited the ranges, Egret draws three equal-width ranges from 0 to twice the current value: red up to half the value, yellow up to the value, green above. As soon as you edit one, the three are saved as your ranges.

The editor has a header row (**MIN**, **MAX**, **LABEL**) and one row per range:

| Part | What it does |
|---|---|
| Color swatch | Click for the palette or **Custom…**. |
| **Min** | The start of the range. |
| **Max** | The end of the range. Changing it also changes the next range's **Min**, so the ranges always touch. |
| **Label** | An optional name, placeholder **Optional**. Named ranges are listed in the chart's accessible description. |
| Trash button | Removes the range. The last remaining range cannot be removed. |

Press **Add range** to append a range that starts where the last one ends and is ten units wide. Ranges are sorted by their end value when drawn; a range whose **Min** is greater than its **Max** is ignored.

### Formatting

One row for the metric. The number under the needle and the tick numbers around the dial use its format. See [Column formatting and number formats](./column-formatting).

## Related tasks

### Set a sensible scale

Edit the first range's **Min** and the last range's **Max** to the scale you want, for example 0 and 0.1 for a discount rate between 0 % and 10 %. Then set the **Max** of the first and second ranges to mark where the colors change.

### Show a percentage

Open **Formatting → *metric*** and set **Number style** to **Percent**. The dial scale and the number both use that format.

## Settings at a glance

| Setting | Where | Default |
|---|---|---|
| **Metric** | Data | Required |
| **Ranges** (color, **Min**, **Max**, **Label**) | Display | Three equal ranges from 0 to twice the value (red, yellow, green) |
| **Formatting** (one row for the metric) | Display | Dataset's format |
| **Axes** tab | | Not applicable |

## Example: average discount

On the *Order lines* dataset the average discount is 0.05. With ranges 0 to 0.03 (**Low**, red), 0.03 to 0.07 (**Target**, amber) and 0.07 to 0.1 (**High**, green), the needle points into the middle of the amber band, and the dial runs from 0 to 0.1 with tick numbers around it, as in the screenshot above.

## Limits and known issues

- A gauge takes one metric and has no goal field: the ranges are the goal.
- The tick numbers thin out on a small card so that they never overlap.
- Clicking the gauge opens the drill menu with only **See these records**.

## Further reading

- [Progress bar](./progress), [Big number](./number)
- [Column formatting and number formats](./column-formatting)
