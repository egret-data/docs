---
sidebar_position: 19
---

# Map

A map shows data geographically. A **region map** shades countries or states by a metric. A **pin map** puts one marker on the map for every row, at a latitude and longitude. Use a region map for "revenue by country" and a pin map for store, customer or incident locations.

![The Data tab of a region map: revenue by country on the world map](/img/platform/charts/map-region-data.png)

## Create a region map

1. Go to **Explore → Charts**, press **+ Chart** and pick **Map**.
2. Choose a **Dataset** with a region column and a metric (for example *Sales by country*).
3. Set **Map** to the base map: **US states**, **World countries** or **Vietnam provinces**. The default is **US states**.
4. Leave **Map type** as **Region map**.
5. Set **Region** to the column that holds the region and **Metric** to the value that shades it.
6. Press **Save**.

### How regions are matched

A region value can be the map's **code** or its **name**, in any letter case:

| Map | Codes | Names |
|---|---|---|
| **US states** (52 regions: the 50 states, DC and Puerto Rico) | Two-letter codes, for example `CA` | State names, for example `California` |
| **World countries** (175 countries) | Two-letter country codes, for example `US`, `VN` | Country names as the map spells them, for example `United States of America`, `W. Sahara` |
| **Vietnam provinces** (34 provinces) | The province name | The province name as the map spells it, for example `Hà Nội`, `TP. Hồ Chí Minh`, `Huế` |

Rows whose value matches no region are not drawn, and they do not count in the legend. A note under the map says how many rows were left out and names up to three of their values, as stored, so you can find the spelling to fix. For example: *Showing 1 of 2 rows: 1 matches no region on the Vietnam provinces map ("Thành phố Hồ Chí Minh").* Regions with no row are drawn in the palest shade. The legend on the left of the map shows the range of the metric, from low to high, over the rows that are drawn.

![The Vietnam provinces base map with revenue per province](/img/platform/charts/map-vietnam.png)

The Vietnam map draws the 34-province layout and labels the **Hoàng Sa** and **Trường Sa** archipelagos.

## Create a pin map

1. Create a map chart and set **Map type** to **Pin map**. If the dataset marks columns as numeric latitude and longitude (the *Role* setting of a dataset column), Egret fills **Latitude** and **Longitude** in for you.
2. Pick the **Map** that covers your data. Pins outside it are still drawn and can be reached by panning or zooming out.
3. Set **Latitude** and **Longitude**. Only numeric columns are offered.
4. Optionally set **Label** to the column that names each pin in its tooltip, and add **Tooltip columns**.
5. Press **Save**.

![The Data tab of a pin map](/img/platform/charts/map-pin-data.png)

## Data

| Field | Applies to | What it does |
|---|---|---|
| **Dataset** | Both | The dataset to read. |
| **Map** | Both | **US states**, **World countries** or **Vietnam provinces**. |
| **Map type** | Both | **Region map** or **Pin map**. Switching hides the other type's fields. |
| **Region** | Region map | The column holding the region. Placeholder **Pick a region column…**. Required. |
| **Metric** | Region map | The metric that shades each region. Required. |
| **Latitude**, **Longitude** | Pin map | Numeric columns. Required. |
| **Label** | Pin map | A column used to name the pin in its tooltip. Optional. |
| **Tooltip columns** | Pin map | Extra columns fetched with each row and shown in the pin's tooltip only. The hint reads **Fetched with each row and shown in the pin's tooltip only.** |
| **Sort**, **Row limit** | Both | Query controls. |

A region map aggregates (one row per region). A pin map does not: the query returns **raw rows**, one pin per row, so the **Row limit** is the maximum number of pins (10,000).

## Display

### Color

A swatch. For a region map it is the color the shading ramps up to; for a pin map it is the pin color. Default is the first color of Egret's palette. Click for the palette or **Custom…**.

### Formatting

For a region map, one row for the metric (see [Column formatting and number formats](./column-formatting)). A pin map has none.

## Interactions

- Hover a region or a pin for its tooltip.
- Click a region to open the drill menu (**Filter by *region column* is *value***, **See these records**). A pin drills to its own row.
- Pan and zoom with the mouse or touchpad.

## Limits and known issues

- There are three base maps. Others (for example a US county or a custom shape) are not available.
- There is no grid or heat map of points; for density over an area use a region map.
- A region map names the values that match no region in a note under the map (see above). A pin map says why rows are missing: a note under the map reports how many rows are outside the chosen map, have a latitude or longitude out of range, or have none. When none can be drawn, the card explains the cause, including a hint to check whether latitude and longitude are swapped.
- The first load of a base map downloads its shapes (the Vietnam map is the largest); the card shows **Loading map…** meanwhile.

## Further reading

- [Datasets & metrics](../datasets-and-metrics)
- [Column formatting and number formats](./column-formatting)
