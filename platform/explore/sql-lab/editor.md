---
sidebar_position: 2
---

# The query editor

The editor is where you write SQL, run it and shape how many rows come back. This page covers the tab strip, the toolbar, autocomplete, formatting, running and cancelling, the row limit, the command palette and the keyboard shortcuts.

![The SQL Lab editor with an empty result](/img/platform/sql-datasets/sqllab-empty.png)

## Tabs

The strip above the editor holds one tab per query.

- Press **+** to add a tab. A new tab is called **Query 2**, **Query 3** and so on, contains `SELECT 1` and uses a limit of 1,000 rows. It starts with no database chosen; if the workspace has only one database, the Explorer selects it for you.
- Click a tab title to switch to it.
- Double-click a title to rename the tab. Edit the name and press **Enter** to keep it, or **Escape** to cancel. An empty name keeps the old one.
- Hover over a tab and press **×** to close it. The last remaining tab cannot be closed.
- Opening a saved query or a table preview (see [The schema browser](./schema-browser#preview-a-table)) always opens a new tab, so it never overwrites what you were writing.

Every tab keeps its own SQL, its own database choice and its own row limit. Tabs are stored in your browser, per workspace, so they survive a page reload but not a change of browser or cleared site data.

:::note Results do not follow the tab
The result of a run belongs to the tab you are looking at. If you switch to another tab and come back, the grid is empty again and shows *No results yet.* The query is still in your [History](./history-saved-snippets#history); use **Re-run** there or press **Run** again.
:::

## The toolbar

From left to right:

| Control | What it does |
|---|---|
| **Run** | Runs the query. Reads **Run selection** while some text is selected. |
| **Cancel** | Asks the engine to stop the running query. Disabled when nothing is running. |
| **Format** | Reformats the editor text. |
| **Limit** | The maximum number of rows to return. |
| Database badge | Shows the database and engine for this tab, for example *trino-demo · trino*. Read only. Change the database in the [Explorer](./schema-browser#choose-a-database). |
| Status badge | *Running…*, *Done in 397 ms · 3 rows* or *Failed in 125 ms*. The time is measured in your browser from submit to the end of the run. |
| **Save** | Opens **Save query** (see [Saved queries](./history-saved-snippets#saved-queries)). |
| **Save as dataset** | Opens **Save as dataset** (see [Save a query as a dataset](./save-as-dataset)). |
| **⌘K** | Opens the [command palette](#the-command-palette). |
| **…** (More actions) | **Explain query**, **Download CSV** (after a successful run), **Hide explorer** / **Show explorer**, **Command palette…**, **Keyboard shortcuts**. |

When the window is narrow the toolbar wraps onto a second line instead of clipping.

![The More actions menu](/img/platform/sql-datasets/sqllab-more-menu.png)

## Write SQL

The editor is Monaco, the editor that VS Code uses. It colours SQL, numbers lines, matches brackets and supports the usual editing shortcuts of Monaco (find, undo, comment toggling and so on).

### Autocomplete

Suggestions appear as you type, and you can open them at any time with **Ctrl Space**.

- After `FROM` or `JOIN` the list holds the tables Egret knows about.
- After `name.` the list holds the columns of the table called `name` (for example `orders.`), or the child objects of a catalog or schema (for example `tpch.`).
- Anywhere else the list starts with the columns of the tables named after `FROM` and `JOIN` in your query, followed by tables and SQL keywords.

![Column suggestions after typing orders.](/img/platform/sql-datasets/sqllab-autocomplete.png)

Autocomplete only knows what the [Explorer](./schema-browser) has already loaded for the current database. To get column suggestions for a table, expand the table in the Explorer once. Switching database resets the list. Table aliases are not resolved: after `FROM orders o`, typing `o.` suggests tables, not the columns of `orders`; type the table name instead.

### Format

**Format** rewrites the whole editor text with one clause per line and two-space indentation. It uses the Trino dialect for Trino connections and the MySQL dialect for StarRocks. Keyword case is kept as you typed it. If the text cannot be parsed, the editor is left unchanged and nothing is reported.

```sql
select
  orderstatus,
  count(*) as n,
  sum(totalprice) as total
from
  tpch.tiny.orders
where
  orderdate > date '1995-01-01'
group by
  1
order by
  2 desc
```

### Insert names from the Explorer

Clicking a table or column in the Explorer appends its name to the end of the editor text. Egret does not add a space or a comma, so add your own separator first (`SELECT ` then click) or fix the text afterwards.

## Run and cancel

Press **Run**, or **⌘ Enter** (macOS) or **Ctrl Enter** (Windows and Linux) while the cursor is in the editor.

- **One statement per run.** Trino accepts a single statement per request. `SELECT 1; SELECT 2` fails with a parse error from the engine. A single trailing semicolon after a `SELECT` is fine.
- **Run selection.** When you select text, the button changes to **Run selection** and only the selected text is sent. Selecting one statement out of several is the way to run them one at a time. Selected text that is only whitespace is ignored and the whole editor text runs.
- **Explain.** **Explain query** in the **…** menu (and in the command palette) runs `EXPLAIN` in front of the selection or, with no selection, the whole text, and shows the plan in the grid as one wide cell. Click the cell to read the whole plan in a dialog.
- **Only one run at a time per tab.** **Run** is disabled while a query is running.
- **Cancel.** Press **Cancel** to stop the query. The engine is asked to stop and the run is recorded in History with the status *cancelled*. The status badge disappears and the Results panel goes back to *No results yet.*; nothing tells you that the run was cancelled.
- **Time out.** A query that runs longer than the server's `engine.query_timeout_secs` (60 seconds by default) is stopped and fails with the error `timeout`.

![The plan of an EXPLAIN in the results grid](/img/platform/sql-datasets/sqllab-explain.png)

![Run selection appears when text is selected](/img/platform/sql-datasets/sqllab-run-selection.png)

### Row limit

**Limit** caps how many rows come back. The default is **1,000 rows**. The list offers 10, 100, 1,000, 10,000 and 100,000 rows, and **Custom…** lets you type any whole number from 1 to 100,000. Larger numbers are clamped to 100,000, and the ceiling is a server setting (`engine.max_rows`). The limit is remembered per tab.

![The Limit list](/img/platform/sql-datasets/sqllab-limit.png)

How the limit is applied depends on the statement:

- A single `SELECT` or `WITH` statement is wrapped as `SELECT * FROM (<your query>) AS _egret_lim LIMIT n`, so the engine itself stops at `n` rows. Your own `LIMIT` still applies inside.
- Anything else (for example `SHOW`, `DESCRIBE`, `EXPLAIN`, or several statements in one text) is sent unchanged and Egret stops reading after `n` rows. The Results panel then shows the amber chip *Results were limited to n rows.*

For the first kind there is no chip, so a result that has exactly as many rows as your limit may have been cut. If the row count equals the limit, raise the limit or add a `WHERE` clause. See [Query results](./results#limits) for how many of those rows the grid loads.

## The command palette

Press **⌘ K** (macOS) or **Ctrl K** to open the palette, or press the **⌘K** button in the toolbar. It is a search box over a flat list of actions; type to narrow the list by name, move with **↑** and **↓**, run the highlighted action with **Enter** and close it with **Escape**. Pressing the shortcut again closes it.

![The command palette](/img/platform/sql-datasets/sqllab-palette.png)

| Action | What it does |
|---|---|
| **Run query** / **Run selection** | Same as **Run**. |
| **Explain query** | Same as **Explain query** in the **…** menu. |
| **Format SQL** | Same as **Format**. |
| **Save query…** | Opens the **Save query** dialog. |
| **Save as dataset…** | Opens the **Save as dataset** dialog. |
| **Hide explorer** / **Show explorer** | Collapses or restores the left panel. |
| **Go to Results**, **Go to History**, **Go to Saved** | Switches the lower panel. There is no entry for **Snippets**. |
| **Keyboard shortcuts** | Opens the shortcut list. |
| **Download results as CSV** | Only listed after a successful run. |

:::note ⌘K inside the editor
While the text cursor is inside the editor, Monaco handles **⌘ K** itself (it starts a chord) and the palette does not open. Click outside the editor, in the results area for example, then press the shortcut, or use the **⌘K** button.
:::

## Keyboard shortcuts

The **Keyboard shortcuts** dialog (**…** menu or the palette) lists the shortcuts that Egret defines:

| Action | Keys |
|---|---|
| Run query / selection | **⌘ / Ctrl Enter** |
| Command palette | **⌘ / Ctrl K** |
| Autocomplete | **Ctrl Space** |
| Rename tab | Double-click the tab |
| Insert object | Click it in the Explorer |

![The Keyboard shortcuts dialog](/img/platform/sql-datasets/sqllab-shortcuts.png)

The **Run** shortcut belongs to the editor it was pressed in, so it never runs another tab's query.

## Limits and known issues

- Switching tabs discards the visible result (see the note above).
- Cancelling shows no confirmation in the page.
- Autocomplete does not resolve aliases and only knows expanded Explorer nodes.

## Further reading

- [Query parameters](./parameters)
- [Query results](./results)
- [Query errors](./query-errors)
