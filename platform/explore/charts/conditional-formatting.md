---
sidebar_position: 23
---

# Conditional formatting

Conditional formatting colors table and pivot table cells by their value, so that large numbers, exceptions or empty cells stand out. You write rules on the **Conditional formatting** tab. It exists for [Table](./table) and [Pivot Table](./pivot-table) only. For a colored [Big number](./number) or [Gauge](./gauge), use their own **Ranges**.

![A table where Customers above 65 is highlighted and Average balance is shaded on a white-to-blue scale](/img/platform/charts/table-display.png)

## Add a rule

1. Open a table or pivot table chart and go to the **Conditional formatting** tab.
2. Press **Add rule**.
3. Under **Columns**, open **Pick columns…** and tick one or more columns.
4. Choose how to color (see below), set the values and press **Save rule**.

**Save rule** stays disabled until at least one column is picked. **Cancel** discards the rule.

![The rule editor for a single-color rule](/img/platform/charts/table-rule-editor.png)

## The rule list

The tab lists the rules with a swatch of the rule's color and a short description such as `customers > 65` or `avg_balance color range`. Each row has:

- The description. Click it to edit the rule (**edit rule *n***).
- **move rule up** and **move rule down** arrows.
- **delete rule**, a trash button.

With no rules the tab says **No rules yet.** Rules are saved with the chart.

![The rule list with a single-color rule and a color-range rule](/img/platform/charts/table-rules.png)

## How rules are applied

- Rules are checked **from the top of the list down, and the first rule that matches a cell colors it**. Put specific rules above general ones.
- A rule applies only to the columns it lists.
- A single-color rule tints the cell with its color at 65 % opacity. A **Highlight whole row** rule tints the row at 20 % opacity; cell colors from other rules show on top.
- A color-range rule shades the cell on a gradient at 75 % opacity.
- A null or non-numeric cell is never shaded by a color range.

## Single color

Colors a cell when its value passes a test.

| Setting | What it does |
|---|---|
| **When a value is** | The test. The list depends on the type of the picked columns, see below. |
| **Value** | What to compare with. Not shown for tests that need no value. |
| **Color** | One of five swatches: red, amber, green, blue, purple. |
| **Highlight whole row** | A switch. When on, the whole row is tinted when any picked column passes the test. Not offered on a pivot table. |

The tests (**When a value is**) by column type:

| Columns | Tests |
|---|---|
| All numeric | **is equal to**, **is not equal to**, **is less than**, **is greater than**, **is less than or equal to**, **is greater than or equal to**, **is null**, **is not null** |
| Text, dates or a mix | **is equal to**, **is not equal to**, **contains**, **does not contain**, **starts with**, **ends with**, **is null**, **is not null** |
| All boolean | **is true**, **is false**, **is null**, **is not null** |

A value that parses as a number is compared as a number, otherwise as text. The text tests are case-sensitive.

## Color range

Shades each cell between two colors according to where it sits between a low and a high value. Offered only when every picked column is numeric. Pick **Color range** under **Formatting**.

| Setting | What it does |
|---|---|
| Presets | **White to blue**, **White to green**, **White to red**, **Red to green**, **Blue to red**. |
| start color, end color | Two swatches under the gradient bar, labelled **low → high**. Click either to choose any color. |
| **Start the range at** | **Smallest value in this column** (or **in each column** when several are picked), **Smallest value in all of these columns** (several columns only), or **Custom value** with a number box. |
| **End the range at** | The same three choices with **Largest**. |

If the low and high values are equal, every cell takes the start color.

## Pivot tables

On a pivot table the rule's **Columns** picker lists only the metric (value) columns. **Highlight whole row** is not offered, and rules never color the dimension headers or totals.

## Limits and known issues

- Rules need at least one column.
- Only two-color gradients are possible.
- Rules apply on screen and in dashboard cards; exports contain the data without colors.
- There is no "format a cell based on another column's value" except through **Highlight whole row**, which tests the picked columns and tints the entire row.

## Further reading

- [Column formatting and number formats](./column-formatting)
- [Table](./table), [Pivot Table](./pivot-table)
