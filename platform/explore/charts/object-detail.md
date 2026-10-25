---
sidebar_position: 22
---

# Object detail

Object detail shows one record as a list of field and value pairs, and lets you page through the records of the result. Use it to read a single order, customer or event in full, especially when it has many columns or long text.

![The Data tab of an object detail chart with seven of nine fields selected](/img/platform/charts/object-data.png)

## Create an object detail chart

1. Go to **Explore → Charts**, press **+ Chart** and pick **Object detail**.
2. Choose a **Dataset**.
3. Under **Fields**, tick the columns to show. The summary reads, for example, **7 of 9 selected**.
4. Optionally add a **Sort** and lower the **Row limit** to the number of records you want to page through.
5. Press **Save**.

## Data

| Field | What it does |
|---|---|
| **Dataset** | The dataset to read. |
| **Fields** | A checklist of the dataset's columns. A **Filter *n* fields…** box appears above it when there are many columns, and the first row (**N of M selected**) is a checkbox that selects or clears every field. At least one field is required. |
| **Sort**, **Row limit** | Query controls. The query returns raw rows, one record each. |

Object detail does not aggregate: it uses no metrics.

## Display

The **Display** tab has only **Formatting**, one row per field. Use it for **Column title** (the name shown to the left of the value), number styles and date formats. See [Column formatting and number formats](./column-formatting).

## What the card shows

- One row per field, with the field's title in capitals on the left and its value on the right.
- A footer with **previous record** and **next record** arrows and a position such as **1 / 50**, when the result has more than one row. The footer is hidden for a single record.
- Empty values show as **Empty**.
- Long text is cut at 140 characters with **Show more** and **Show less** links.
- Values that contain JSON are pretty-printed. A value that is an image address (`http(s)://…` ending in png, jpg, gif, webp, avif or svg) is shown as an image.
- Clicking a value opens the drill menu for that field.

## Settings at a glance

| Setting | Where | Default |
|---|---|---|
| **Fields** | Data | None; at least one required |
| **Sort**, **Row limit** | Data | No sort, 1000 |
| **Formatting** (one row per field) | Display | Dataset's formats |
| **Axes** tab | | Not applicable |

## Example: browsing orders

On the *orders* dataset, choose **orderkey**, **custkey**, **orderstatus**, **totalprice**, **orderdate**, **orderpriority** and **clerk**, set **Row limit** to `50` and press **Save**. The card shows the first order as seven field and value lines, with the date in the default style (for example **July 25, 1994**), numbers with thousands separators except the identifiers `orderkey` and `custkey`, which read as plain digits (for example **29989**; see [Separator style](./column-formatting#separator-style)), and the footer reads **1 / 50**. Without a **Sort**, which order is first is up to the database. The arrows step through the next 49 orders.

![The Display tab of an object detail chart](/img/platform/charts/object-display.png)

Use the format rows to rename a field, for example **Column title** `Order total` for `totalprice`, or to change the date style.

## Limits and known issues

- Object detail has no filter control of its own. To show one record, drill into a value elsewhere or set the **Sort** and **Row limit**.
- It reads only the first **Row limit** rows.

## Further reading

- [Table](./table)
- [Column formatting and number formats](./column-formatting)
