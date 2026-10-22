---
sidebar_position: 3
---

# Columns

The **Columns** tab of a dataset lists every column the dataset exposes and lets you describe each one: how it is named, what kind of thing it is, how its values are shown, and how charts may use it. Open **Explore → Datasets**, click a dataset and stay on the first tab.

![The Columns tab of a virtual dataset](/img/platform/sql-datasets/ds-columns.png)

All changes on this tab **save as soon as you make them**. There is no Save button. A switch saves when you flip it; a text box saves when you leave it (click elsewhere or press **Tab**); a list or the format picker saves when you choose a value or close the picker. If a save fails, an error toast shows the message.

## The toolbar

- **Search columns…** keeps the rows whose column name or **Display name** contains the text (not case sensitive). With no match the table says *No columns match “text”.*
- A counter such as *10 columns · 2 calculated* tells you how many columns the dataset has and how many of them are [calculated](./calculated-columns).
- **+ Calculated column** opens the dialog that adds a formula column. See [Calculated columns](./calculated-columns).

A dataset with no columns shows *No columns yet — Refresh to sync from the source.* Press **Refresh columns** in the header ([Refresh and schema sync](./refresh-and-sync)).

## The table

Each row is one column. Calculated columns carry a *calculated* tag. The headers with a small **?** show a tooltip with a one-line explanation when you hover over them.

### Column

The column's name in the source, in monospaced type, with an icon for its class: a hash for numbers, a clock for dates and times, a letter for text, and a calculator for calculated columns. The name cannot be changed here. To show a friendlier name, set a **Display name**.

### Type

The data type reported by the engine, for example `bigint`, `varchar(25)`, `double` or `date`. Read only.

### Role

A list that says what kind of thing the column holds. The default is **—** (no role).

| Role | Effect |
|---|---|
| **—** | None. |
| **Category** | Stored with the column. Nothing in the product reads it yet. |
| **Country** | Stored with the column. Nothing in the product reads it yet. |
| **Currency** | Shows the values as money (US dollars, two decimals) in the dataset's **Preview** and, as a default, in charts, unless the column has its own **Format** with a number style. |
| **Email** | Shows values as mailto links in **Preview** and in chart tables, unless **Format → Display as** says otherwise. |
| **URL** | Shows values as links. |
| **Image** | Shows values as images (the value is the image address). |
| **Latitude**, **Longitude** | The pin map chart uses these two roles to fill its latitude and longitude pickers. The column must be numeric. |

Only these values are accepted. The server refuses anything else with a *bad request* error that lists them.

### Dimension

A switch. On means the column can be used to group a chart by (a category such as *country* or *product*). It is on for every new column.

With **Dimension** off, the chart editor's field pickers (X-axis, series, the columns of a grouped table, and so on) no longer offer the column. Two exceptions keep existing work running:

- A chart that already uses the column keeps it: the chart still runs and its picker still shows the column.
- A view that lists records rather than groups keeps every column: a [table chart](../charts/table) with no metric, and [Object detail](../charts/object-detail).

The switch is read by the chart editor only. The server does not refuse a chart that groups by such a column.

### Filter

A switch. On means dashboard filters can be connected to this column. It is on for every new column.

With **Filter** off, a dashboard filter's card mapping no longer offers the column for cards built on this dataset. A filter that is already connected to the column keeps its connection. See [Dashboard filters](../dashboards/filters).

### Time

A switch that marks the column as a date or a time. Turn it on to use the column on a time axis and to get time grains (day, week, month, and so on) in the chart editor. New columns get it on automatically when the engine reports a date or timestamp type. **Refresh** keeps a manual choice as long as the column's engine type does not change; when the type changes, the switch is set again from the new type.

### Format

A small picker that controls how values are displayed. It shows its current choice (*Default*, *Currency*, *Date* and so on). Choices are not applied until you close the picker. The picker adapts to the column type.

**Numbers** (and any type the picker does not recognise as date or text):

| Choice | Example |
|---|---|
| **Default** | 1,234.5 |
| **Integer** | 1,235 |
| **1 decimal** | 1,234.5 |
| **2 decimals** | 1,234.50 |
| **Percent** | 12.3% (a value of 0.123 shows as 12.3%) |
| **Currency** | $1,234.50 |
| **Compact** | 1.2K |
| **Scientific** | 1.23e+3 |

Below the list are **Decimals** (0 to 10, empty means automatic), **Prefix** and **Suffix**. Choosing **Currency** adds a **Currency** list with USD, EUR, GBP, JPY, CNY, VND, KRW, INR, AUD, CAD, SGD and THB.

![The number format picker on a total price column](/img/platform/sql-datasets/ds-format-number.png)

**Dates and times:** six patterns (*January 5, 2026*, *Jan 5, 2026*, *1/5/2026*, *2026-01-05*, *January 2026*, *Jan 5*) and a **Show time** checkbox.

![The date format picker](/img/platform/sql-datasets/ds-format-date.png)

**Text:** **Display as** with **Text**, **Link**, **Email** or **Image**, plus **Prefix** and **Suffix**.

![The text format picker](/img/platform/sql-datasets/ds-format-text.png)

A format set here is a **default**. Charts and tables built on the dataset use it, and a chart can override it for its own column. The [Preview](./usage-and-preview) tab applies it too, so you can check the result without building a chart. Dataset formats are applied when the chart is drawn; changing the format later changes existing charts that did not override it.

### Display name

A friendly label, for example *Order total* for `totalprice`. The chart editor shows it instead of the raw column name in its field lists, and it is the default **Column title** of the column on the chart page and in the dataset's **Preview**, so a table chart's header reads *Order total*. A chart that sets its own **Column title** for the column keeps it. The display name is applied when the chart is drawn and is not saved into the chart, so changing it later changes every chart that did not set its own title. Dashboard cards still show the column name in table headers. Leave it empty to show the column name. A name made only of spaces is treated as empty.

### Description

A short note about what the column contains, for people who maintain the dataset. It is stored with the column and shown here.

### Calculated columns: Edit and Delete

Rows of calculated columns have two extra buttons at the right: **Edit** opens a dialog to change the formula, and **Delete** asks for confirmation before it removes the column. See [Calculated columns](./calculated-columns#delete-a-calculated-column).

## Example: prepare the Orders with customers dataset

1. Open **Orders with customers**.
2. For `totalprice`, open **Format**, choose **Currency**, leave USD and 2 decimals, and close the picker. Type *Order total* as the **Display name**.
3. For `market_segment`, choose the role **Category** and type *Market segment* as the **Display name**.
4. For `orderdate`, open **Format** and choose *Jan 5, 2026*.
5. Check the result on the **Preview** tab: prices show as `$134,013.09` and dates as `Aug 7, 1994`.

## Limits and known issues

- **Dimension** and **Filter** are applied in the chart editor and in the dashboard filter mapping only, not by the server. **Category** and **Country** roles are not read anywhere.
- Dashboard cards show column names, not display names, in table headers.
- A format is stored as a small JSON text (for example `{"currency":"USD","decimals":2,"number_style":"currency"}`) that the API returns in the column's `format` field.
- Column names cannot be renamed or hidden. Hide a column by leaving it out of the SQL of a virtual dataset.

## Further reading

- [Calculated columns](./calculated-columns)
- [Metrics](./metrics)
- [Refresh and schema sync](./refresh-and-sync)
