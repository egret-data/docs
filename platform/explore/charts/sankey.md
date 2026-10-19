---
sidebar_position: 18
---

# Sankey

A Sankey diagram shows flows between two kinds of nodes, with the width of each link proportional to the value it carries. Use it for movement between categories: traffic from channels to landing pages, customers moving between plans, money from sources to uses.

![The Display tab of a Sankey diagram of visitor flows](/img/platform/charts/sankey-display.png)

## Create a Sankey diagram

1. Go to **Explore → Charts**, press **+ Chart** and pick **Sankey**.
2. Choose a **Dataset** with one row per link (for example *Traffic flows*).
3. Set **Source** to the column that names where a flow starts and **Target** to the column that names where it ends.
4. Set **Value** to the metric that sizes the link (for example **Visits**).
5. Press **Save**.

Nodes are created from the distinct values of the source and target columns. A value that appears as a target in one row and a source in another becomes a node in the middle, so you can chain flows: Channel → Landing page → Sign up.

## Data

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Source** | The dimension the flow starts from. Required. |
| **Target** | The dimension the flow goes to. Required. The picker does not offer the column chosen as **Source**. |
| **Value** | A metric that sets the width of each link. Required. |
| **Sort**, **Row limit** | Query controls. |

The query groups by both columns and aggregates the metric, giving one link per source and target pair.

## Display

| Setting | Options | Default |
|---|---|---|
| **Align** | **Left**, **Right**, **Justify**. With **Right** or **Justify**, nodes with no outgoing flow are pushed to the right edge, however deep they are; with **Left** they stay at their own depth. | **Left** |
| **Show edge labels** | A switch that prints each link's value. | Off |
| **Auto formatting** | **Auto**, **Compact**, **Full**. Shown when edge labels are on. **Auto** shortens the numbers (4.2K) once the largest link reaches 10,000. | **Auto** |
| **Edge color** | **Gray**, **Source**, **Target**. **Source** colors each link like the node it starts from. | **Source** |

Below these, **Formatting** has one row for each column the chart uses. See [Column formatting and number formats](./column-formatting).

There is no **Axes** tab.

## Reading the diagram

Nodes are drawn as bars in columns: sources on the left, then the nodes they lead to. A link's width is its value, and its color follows **Edge color**. A node's height is the larger of its incoming and outgoing totals. Hover a link to see it as `source > target: value` (for example `Search > Home: 4,200`); hover a node to see its name.

In the screenshot, three channels (Search, Social, Email) feed three pages (Home, Pricing, Blog), which all feed **Sign up**. Search to Home is the widest link because it carries 4,200 visits.

![The Sankey diagram with edge labels switched on](/img/platform/charts/sankey-labels.png)

## Related tasks

### Show the value on each link

Turn on **Show edge labels**, then set **Auto formatting** to **Compact** for short numbers such as 4.2K or **Full** for exact counts.

## Limits and known issues

The chart refuses data it cannot draw and says why in the preview:

| Message | Cause |
|---|---|
| **Select two different columns for source and target to create a flow.** | **Source** and **Target** are the same column. |
| **A sankey chart can't show more than 150 unique nodes — this one has *n*.** | Too many distinct source and target values. |
| **Selected columns create circular flows. Try picking different columns that flow in one direction.** | A flow loops back, for example A → B and B → A. |

The metric must be one of the dataset's metrics.

## Further reading

- [Funnel](./funnel), [Waterfall](./waterfall)
