---
sidebar_position: 4
---

# Calculated columns

A calculated column is a new column defined by a SQL expression over the dataset's other columns, for example `extendedprice * (1 - discount)`. It behaves like any other column: you can group by it, filter on it, show it in a table and give it a display name. Use calculated columns for derived values that many charts need, so no chart has to repeat the formula.

![The Add calculated column dialog on the Line items dataset](/img/platform/sql-datasets/ds-calc-dialog.png)

## Add a calculated column

1. Open the dataset and stay on the **Columns** tab.
2. Press **+ Calculated column**.
3. Type a **Column name**, for example `discount_amount`. The name must be unique in the dataset.
4. Type the **Formula**, for example `extendedprice * discount`. Under the box, **Insert:** lists the dataset's real columns as small buttons; click one to append its name to the formula. Combine columns with operators (`+ - * /`) and engine functions such as `ROUND(…)`, `year(…)` or `CASE WHEN … END`.
5. Optionally type a **Display name** and a **Description**.
6. Press **Add column**. The button reads **Adding…** while Egret checks the formula.

The new column appears at the bottom of the table with a *calculated* tag and a **Dimension**, **Filter** and **Time** switch like any other. The counter above the table now reads, for example, *17 columns · 1 calculated*.

### What Egret checks

Before saving, Egret asks the engine to run `SELECT <your formula> AS _egret_expr FROM <the dataset's source>` with no rows, and uses the answer to learn the column's type.

- An empty formula, or one with a semicolon outside quotes (a second statement), is refused with *expression must be a single statement*.
- A formula the engine cannot parse or resolve is refused with the engine's message, shown in an error toast, for example `engine: line 2:24: mismatched input '*'. Expecting: <expression>`. The line number counts the line Egret adds in front.
- A name that is already taken is refused with *column name already exists*.
- An empty name or formula shows *Name and expression required* in the dialog.

The inferred type decides the icon and the format choices. A formula that returns a date or timestamp turns **Time** on automatically.

## Write formulas the dataset can resolve

The formula runs against the dataset's source, so:

- It can use any **source column**: the columns of the table for a physical dataset, or the columns your SQL returns for a virtual dataset.
- It **cannot use another calculated column**. With `net_price` defined, a second formula `net_price * 2` fails with `Column 'net_price' cannot be resolved`. Repeat the original expression in the second formula, or put the logic in the SQL of a virtual dataset.
- It must be a scalar expression. Aggregates belong in [metrics](./metrics).
- It uses the SQL dialect of the database (Trino or StarRocks).

Examples that work on the `tpch` demo:

| Dataset | Column name | Formula |
|---|---|---|
| Line items (physical, `tpch.tiny.lineitem`) | `net_price` | `extendedprice * (1 - discount)` |
| Line items | `discount_amount` | `extendedprice * discount` |
| Orders with customers (virtual) | `order_year` | `year(orderdate)` |
| Orders with customers | `order_size` | `CASE WHEN totalprice >= 300000 THEN 'Large' WHEN totalprice >= 100000 THEN 'Medium' ELSE 'Small' END` |

Once `order_size` exists, a chart can group by it: the table chart *Orders by size band* shows 532 large, 9,149 medium and 5,319 small orders with their average order value.

## Edit a calculated column

On the row of the column, press **Edit**. A dialog titled with the column name shows the **Formula** in a text area. Change it and press **Save**. The new formula is checked in the same way as when you add one, and the column's type is updated from the result. Renaming a calculated column is not possible; delete it and add a new one.

The other settings of a calculated column (role, switches, format, display name, description) are edited in the table like any other column.

## Delete a calculated column

Press **Delete** on its row. The column is removed immediately, with no confirmation. Charts that group by or filter on it will fail until you edit them, so check the dataset's [Usage](./usage-and-preview#usage) tab first.

## How calculated columns behave

- They are **kept across a refresh**. [Refresh](./refresh-and-sync) re-reads the source columns and leaves calculated columns and metrics alone, even if a formula now refers to a column that no longer exists; such a formula breaks only when a chart uses it.
- They are **not part of the Preview**. The [Preview](./usage-and-preview#preview) tab shows the source columns only.
- They are computed by the engine at query time, so they cost nothing to store and always reflect current data.
- The formula text is stored as you typed it and the engine evaluates it as part of the query, so a calculated column inherits the identity and access rules of the connection.

## Limits and known issues

- A formula can only be a single line in the **Add** dialog. The **Edit** dialog is multi-line.
- Calculated columns cannot reference each other.
- Deleting one does not warn you about charts that use it.

## Further reading

- [Columns](./columns)
- [Metrics](./metrics)
- [Refresh and schema sync](./refresh-and-sync)
