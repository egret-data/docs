---
sidebar_position: 4
---

# Query parameters

A query parameter is a named placeholder written as `{{name}}` in your SQL. SQL Lab shows a small input for it above the editor, and substitutes the value you type before the query is sent to the engine. Use parameters for values you change often, such as a status, a date or a minimum amount, without editing the SQL each time.

![Two parameters, status and min_total, filled in above the editor](/img/platform/sql-datasets/sqllab-params.png)

## Add a parameter to a query

1. Write the query and put `{{name}}` where the value goes:

   ```sql
   SELECT orderkey, orderstatus, totalprice
   FROM tpch.tiny.orders
   WHERE orderstatus = {{status}}
     AND totalprice > {{min_total}}
   ```

2. A **Parameters** bar appears between the toolbar and the editor with one box per distinct name, in the order the names first appear in the text.
3. For each parameter, choose a type in the middle list and type a value in the box on the right.
4. Press **Run**.

The query that reaches the engine is

```sql
SELECT orderkey, orderstatus, totalprice
FROM tpch.tiny.orders
WHERE orderstatus = 'F'
  AND totalprice > 300000
```

and the History tab records that rendered text, with the values filled in.

## Parameter names

A name starts with a letter or an underscore and continues with letters, digits and underscores. Spaces inside the braces are ignored, so `{{ status }}` and `{{status}}` are the same parameter. Anything else between the braces, for example `{{order-id}}`, is not recognised by the bar and the engine request fails with *invalid parameter placeholder*.

## Types

| Type (list label) | Value you type | What is sent to the engine |
|---|---|---|
| **str** (default) | Any text | The text as a quoted string literal, escaped for the engine's dialect. A quote inside the value is escaped, so a value such as `it's` is safe. |
| **num** | A number such as `300000` or `-4.5` | The number, unquoted. Text that is not a number is rejected. |
| **bool** | `true`, `false`, `1` or `0` (any letter case) | `true` or `false`. Anything else is rejected. |

Do not wrap a string parameter in quotes yourself. Write `WHERE orderstatus = {{status}}`, not `'{{status}}'`; Egret adds the quotes. With your own quotes around it the text becomes `''F''`, which the engine rejects.

The type defaults to **str**, so a numeric comparison needs the type changed to **num**. Comparing a number column with a quoted string fails in the engine with a type error.

An empty value is a valid value: a **str** parameter you leave blank is sent as the empty string `''`, and a query that filters on it returns no rows. A query that returns zero rows shows *No rows match “”.* in the grid, which is the grid's text for any empty result.

## Where parameters work

- In any single statement you run from the editor, including a selection. The parameters of the selected text are the ones used.
- In [saved queries](./history-saved-snippets#saved-queries) and [snippets](./history-saved-snippets#snippets): the placeholder text is stored as you wrote it, but the values you typed are not. Open the saved query and fill the values in again.
- Not in a [dataset](./save-as-dataset). A dataset is defined by a SQL text without values; a query that still contains `{{name}}` fails when Egret reads its columns.

## Examples

Each of these was run on the demo Trino with the `tpch` catalog.

**A date.** Parameters have no date type. Use a **str** parameter after the engine's date keyword; Egret supplies the quotes:

```sql
SELECT orderkey, totalprice
FROM tpch.tiny.orders
WHERE orderdate = DATE {{day}}
```

With **day** = `1996-01-02` the engine receives `DATE '1996-01-02'` and returns the two orders of that day.

**A pattern.** Put the wildcard in the value, not in the SQL:

```sql
SELECT count(*) FROM tpch.tiny.customer WHERE name LIKE {{pattern}}
```

With **pattern** = `Customer#00000001%` the count is 10.

**A flag.** A **bool** parameter becomes a Boolean literal:

```sql
SELECT {{include_closed}} AS include_closed
```

With the value `TRUE` the result is `true`.

**A value you cannot trust.** A string value is escaped, so quotes in it cannot change the query. With **status** = `F' OR '1'='1` the query `... WHERE orderstatus = {{status}}` looks for that literal text and returns no rows instead of every row.

**A list does not work.** One parameter is one literal. `WHERE nationkey IN ({{ids}})` with the text `1,2,3` becomes `IN ('1,2,3')`, and the engine rejects it because a number is compared with text. Write `WHERE nationkey IN ({{a}}, {{b}}, {{c}})` with one parameter per value.

## Tips

- Name parameters after what they mean (`min_total`, not `p1`), because the name is the label on the input.
- Put the parameters you change most at the top of the query so you can see them when you read the SQL again.
- When you want to keep a parametrised query, [save it](./history-saved-snippets#saved-queries) and write the usual values in its description.

## Errors

| You see | Cause |
|---|---|
| A toast `Error: {"error":"invalid input: parameter 'min_total' is not a number: abc"}` | A **num** parameter holds text that is not a number. The toast appears in the bottom-right corner and the query is not run. |
| *invalid input: missing value for parameter: name* | The request named a placeholder that no parameter supplies. The editor always sends every placeholder it finds, so you meet this only if you call the [REST API](../../reference/rest-api) yourself. |
| `unterminated '{{' in query template` | A `{{` has no closing `}}`. |
| An engine error about `{` | The placeholder was not replaced, for example because it was typed with unsupported characters. |

## Limits and known issues

- Parameter values are kept only while the tab is open and its result panel is mounted; switching to another tab and back clears them (see [The query editor](./editor#tabs)).
- Substitution is plain text interpolation with escaping, done by Egret. It is not a prepared-statement bind.
- Placeholders in comments and string literals are also substituted. Remove a `{{name}}` you do not want replaced.

## Further reading

- [The query editor](./editor)
- [History, saved queries and snippets](./history-saved-snippets)
