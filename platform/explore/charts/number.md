---
sidebar_position: 11
---

# Big number

A big number shows one aggregated value, large and formatted: total revenue, orders this year, average discount. Use it for the headline figure on a dashboard, and color it when it crosses a threshold.

![The Display tab of a big number with a label and two colored ranges](/img/platform/charts/scalar-display.png)

## Create a big number

1. Go to **Explore → Charts**, press **+ Chart** and pick **Big number**.
2. Choose a **Dataset**.
3. Set **Metric** to the value to show, for example **Revenue**.
4. Press **Save**.

The chart runs a single-row query: the metric is aggregated over the whole dataset (apart from filters you add by drilling in).

## Data

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Metric** | The metric to show. Required. |
| **Row limit** | Present, as on every chart, but ignored: the query always returns one row. |

There is no **Sort**, because there is nothing to order.

## Display

### Label

A caption under the number. Empty by default. The hint explains why: **Off by default — a dashboard card already shows the chart's name in its header.**

### Sublabel

A second, smaller caption under the label. Empty by default.

### Conditional colours

Colors the number by range. The settings text explains it: **The number takes the colour of the first range it falls in. Leave a bound empty for an open-ended range. A named range also prints its name under the number, so the colour is never the only thing carrying the meaning.**

Press **Add range** to add a row. A row has:

| Part | What it does |
|---|---|
| Color swatch | Click for the palette or **Custom…**. |
| **Min** | The lower bound, inclusive. Empty shows the placeholder **−∞** (no lower bound). |
| **Max** | The upper bound, inclusive. Empty shows **∞** (no upper bound). |
| **Label** | An optional name, placeholder **Optional**. When the number falls in a named range, the name is printed under the number. |
| Trash button | Removes the range. |

Ranges are checked from top to bottom and the first match wins, so put narrow ranges above wide ones. With no ranges, the number uses the default text color, and the panel says **No ranges — the number uses the default text colour.**

When a color is hard to read on the card, a note under the row explains the contrast problem and the minimum Egret expects for a number this size.

For example, with **Below plan** as −∞ to 2 000 000 000 in red and **On plan** as 2 000 000 000 to ∞ in green, a revenue of 2.2 billion shows green with **On plan** beneath it.

### Formatting

One row for the metric. Use it for the number's style: currency, percent, compact numbers, decimals. See [Column formatting and number formats](./column-formatting).

## How the number is sized

The number grows to fill the card. When it would not fit, Egret shortens it and shows the full value in a tooltip when you hover it. On a dashboard the maximum size depends on how many columns of the grid the card spans. If the metric is empty, the card shows **—**.

With **Compact** switched on under **Formatting**, the number is shortened even when it would fit.

## Settings at a glance

| Setting | Where | Default |
|---|---|---|
| **Metric** | Data | Required |
| **Label**, **Sublabel** | Display | Empty |
| **Conditional colours** (ranges) | Display | None |
| **Formatting** (one row for the metric) | Display | Dataset's format |
| **Axes** tab | | Not applicable |

## Limits and known issues

- A big number is one number. For a comparison against another period use [Trend](./trend); for a target use [Progress](./progress) or [Gauge](./gauge).
- Clicking the number opens the drill menu with only **See these records**.
- The panel spells the color settings with British spelling (**Conditional colours**); other chart types use **color**.

## Further reading

- [Trend](./trend)
- [Column formatting and number formats](./column-formatting)
