---
sidebar_position: 24
---

# Column formatting and number formats

Every chart type has a **Formatting** section at the bottom of its **Display** tab (for a table, a gear button on each column). It sets how a column's values are written: the title, number style, decimals, date format and more. The formats apply wherever the value is shown: the chart, tooltips, tables, exports (when **Keep the data formatted** is on) and dashboard cards.

![The format popover of a numeric column in a table](/img/platform/charts/table-column-settings.png)

## Open a column's format

- **Charts with a Formatting section**: click a row (it shows the column's icon, its name and a **Number**, **Date** or **Text** badge) to expand the settings underneath.
- **Table**: press the gear next to a column in the **Columns** list on the **Data** tab. The settings open in a popover titled with the column name.

Which columns are listed depends on the chart: the ones it plots (for a bar chart: the X-axis, series and Y metrics), or every result column for tables, funnels, box plots and sankeys. A pie chart lists its dimensions and metric; a map lists the metric.

## Settings for every column

### Column title

Replaces the column's name in headers, legends and tooltips. The placeholder is the original name. Clearing the box goes back to the original. When the dataset gives the column or metric a **Display name**, that name is used as the title in the chart editor and the dataset's Preview unless you set a title here; see [Columns](../datasets-and-metrics/columns#display-name). The title also names the column in the **Sort** menu and the drill menu. Dashboard cards do not apply the dataset's display names (KI-251, KI-290).

## Number columns

Shown for columns whose type is numeric.

### Number style

| Option | Result for `1234.5` |
|---|---|
| **Normal** (default) | 1,234.5 |
| **Percent** | 123,450%. The value is treated as a fraction, so `0.05` shows as 5%. |
| **Currency** | $1,234.50 |
| **Scientific** | 1.23e+3 |

### Currency and Display

For **Currency** only. **Currency** is a searchable list of currencies (default US dollar). **Display** chooses how the currency is written: **$** (symbol), **USD** (code), **dollars** (name) or **$ (narrow)**.

### Decimal places

A whole number from 0 to 10. Empty (**Auto**) shows up to three decimal places, or two for currency.

### Separator style

How the decimal point and thousands separator are written.

| Option | Example |
|---|---|
| `100,000.00` (default) | Comma for thousands, period for decimals |
| `100 000,00` | Space for thousands, comma for decimals |
| `100.000,00` | Period for thousands, comma for decimals |
| `100000.00` | No thousands separator |
| `100’000.00` | Apostrophe for thousands |

**Identifier columns** have no thousands separator unless you choose a style: an order number reads `29989`, not `29,989`. Egret treats a column as an identifier when its type is an integer (`tinyint`, `smallint`, `int`/`integer`, `bigint`, `largeint`) and its name is `id`, ends in `_id` or `Id` (`customer_id`, `customerId`), or ends in `key` (`orderkey`, `custkey`, `order_key`). A decimal column named `…key` stays a number. The select shows the style the column is drawn with (`100000.00` for an identifier), and a style you choose, here or in the dataset's column format, always wins. The rule applies to table cells, Object detail and formatted exports. A dimension drawn on a chart (a funnel step, a box plot or Sankey category) is written as stored, but once that column has any formatting, even only a **Column title** or a dataset **Display name**, it gets thousands separators (KI-294).

### Multiply by a number

Multiplies the value before it is formatted, for example `100` to show a ratio as a percentage without the **Percent** style, or `0.001` to show thousands. The placeholder is `1`.

### Prefix and Suffix

Text added before and after the number, for example `~` or ` orders`.

### Compact (1.2K)

A switch. Shortens large numbers: 1,234 becomes 1.2K and 5,100,000 becomes 5.1M. With **Compact** on, **Decimal places** sets the digits after the point (default 1).

### Negatives in ( )

A switch. Shows −5 as (5).

### Show a mini bar chart

A switch, offered in table columns only. Draws a bar behind each cell, sized to the cell's value relative to the column's largest absolute value.

## Date columns

Shown for date, time and timestamp columns.

### Date style

| Option | Example |
|---|---|
| **January 31, 2024** (default) | `MMMM D, YYYY` |
| **1/31/2024** | `M/D/YYYY` |
| **31/1/2024** | `D/M/YYYY` |
| **2024-01-31** | `YYYY-MM-DD` |
| **January 2024** | `MMMM YYYY` |
| **Q1 2024** | `[Q]Q YYYY` |
| **2024** | `YYYY` |

### Abbreviate

A switch. Shortens month and day names: January becomes Jan.

### Date separator

Shown for the date styles that use slashes. **2024/01/31**, **2024-01-31** or **2024.01.31** replace the slash.

### Show the time

**Off** (default), **HH:MM**, **HH:MM:SS** or **HH:MM:SS.MS**. When on, **Time style** appears: **5:24 PM (12-hour clock)** or **17:24 (24-hour clock)**.

## Text columns

Shown in tables for text columns.

### Display as

| Option | What it does |
|---|---|
| **Automatic** (default) | Plain text. |
| **Text** | Plain text. |
| **Link** | Shows the value as a link. **Link text** and **Link URL** accept a template where `{{value}}` is replaced by the cell's value. Both default to `{{value}}`. |
| **Email** | Shows the value as a mailto link. |
| **Image** | Shows the value as an image address. |

## Where formats come from

Column formats you set here are saved with the chart. Underneath them sit the dataset's own defaults: a **Format** set on a dataset column or metric (on the dataset's **Columns** and **Metrics** tabs) applies to every chart on that dataset, and so does a column role such as email, URL, image or currency (which pick **Display as** or the currency style). Defaults are applied when the chart is drawn and are not copied into the chart, so editing the dataset updates its charts. A format you set on the chart wins over the dataset's. See [Datasets & metrics](../datasets-and-metrics).

:::tip
Use **Percent** when the metric is a fraction (0.05), and **Multiply by a number** with `100` plus the suffix `%` when you want complete control over the output.
:::

## Limits and known issues

- **Show a mini bar chart** and **Display as** appear in tables only.
- Formats are shown in the chart's own language, English, regardless of the browser language.
- A time column grouped by a period (for example **Month**) is named by the period (**January 1992**) unless you set a date format on that column.

## Further reading

- [Conditional formatting](./conditional-formatting)
- [Table](./table)
- [Datasets & metrics](../datasets-and-metrics)
