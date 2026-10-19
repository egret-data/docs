---
sidebar_position: 1
---

# SQL Lab

SQL Lab is the interactive SQL editor in a workspace. You pick one of the workspace's databases, write a query, run it, and look at the rows. When a query is worth keeping you can save it, keep pieces of it as snippets, or turn it into a [virtual dataset](../datasets-and-metrics/creating-a-dataset.md) that charts and dashboards can use.

![SQL Lab with a query and its results](/img/platform/sql-datasets/sqllab-results.png)

SQL Lab is the first item in the **Explore** group of the sidebar, so it is the page a workspace opens on when the SQL Lab module is turned on. It runs on the database connections that a workspace admin has added under **Manage → Workspace settings → Databases** (see [Databases](../../workspace-settings/databases.md)). Trino and StarRocks connections are supported.

## What is on the page

The page is one resizable workspace. Drag the grey bars between the panels to change their sizes.

| Area | What it does | Details |
|---|---|---|
| **Tab strip** (top) | One editor per tab, plus the **+** button and the **⌘ K for commands** hint. | [The query editor](./editor.md) |
| **Explorer** (left) | Database picker, a search box and a tree of catalogs, schemas, tables and columns. | [The schema browser](./schema-browser.md) |
| **Toolbar** (above the editor) | **Run**, **Cancel**, **Format**, **Limit**, the database badge, a status badge, **Save**, **Save as dataset**, the command palette button and a **…** menu. | [The query editor](./editor.md) |
| **Editor** | The SQL text, with syntax colouring and autocomplete. A **Parameters** bar appears when the SQL contains `{{name}}`. | [Query parameters](./parameters.md) |
| **Results** (below) | The rows of the last run as a table or a small chart, with filter, copy and export. | [Query results](./results.md) |
| **History**, **Saved**, **Snippets** (tabs next to **Results**) | Your past runs, the workspace's saved queries and reusable SQL fragments. | [History, saved queries and snippets](./history-saved-snippets.md) |

## Run your first query

1. Go to **Explore → SQL Lab**.
2. In the **Explorer**, choose a database from the picker at the top. If the workspace has exactly one database it is selected for you. The database name and engine appear as a badge in the toolbar, for example *trino-demo · trino*.
3. Click in the editor and write a query. The editor opens with `SELECT 1` in it:

   ```sql
   SELECT orderstatus,
          count(*) AS orders,
          round(sum(totalprice), 2) AS revenue
   FROM tpch.tiny.orders
   GROUP BY 1
   ORDER BY 3 DESC
   ```

4. Leave **Limit** at **1,000 rows** or choose another value.
5. Press **Run** (or **⌘ Enter** on macOS, **Ctrl Enter** elsewhere).

While the query runs, a *Running…* badge shows in the toolbar and the **Cancel** button is enabled. When it ends the badge reads, for example, *Done in 397 ms · 3 rows* (or *Failed in 125 ms*), and the rows appear in **Results**.

:::tip Name tables completely
Trino tables are `catalog.schema.table`, for example `tpch.tiny.orders`. Click a table in the Explorer to insert its full name at the end of the editor text instead of typing it.
:::

## How the pieces fit together

1. **Explore** the schema in the Explorer, or open a table's preview.
2. **Write and run** SQL in the editor. Use [parameters](./parameters.md) for values that change between runs.
3. **Read** the [results](./results.md); sort, filter, copy or export them.
4. **Keep** what you need: [save the query](./history-saved-snippets.md#saved-queries), store a [snippet](./history-saved-snippets.md#snippets), or [save it as a dataset](./save-as-dataset.md).

## Who the query runs as

By default every query runs with the connection's own credentials, so all workspace members who can use SQL Lab see what that service identity can see. If the connection has per-user delegation switched on, the query runs as you, with a short-lived engine token minted from your session, and the engine's own access policies apply to you. A user who is not signed in through SSO cannot run on a delegated connection and gets a *forbidden* error. These options are set per connection; see [Databases](../../workspace-settings/databases.md).

SQL Lab does not itself restrict the kind of statement you can send. A `DROP TABLE` on the demo Trino was sent to the engine and refused by the engine ("This connector does not support dropping tables"). What is allowed depends on the connection's credentials and on the engine's access policies.

## Where your work is stored

| What | Where | Who sees it |
|---|---|---|
| Open tabs (title, SQL, database, limit) | Your browser's local storage, one set per workspace | Only you, only in that browser |
| Query history | Egret, last 50 runs | Only you |
| Saved queries | Egret, in the workspace | Workspace members with read access to saved queries |
| Snippets | Egret, in the workspace | Workspace members with read access to saved queries |
| Result rows | Egret's object store, one file per run | The user who ran the query (and platform admins) |

Because tabs live in the browser, clearing site data or switching browsers gives you a fresh *Query 1*. Anything you want to keep must be saved.

## Pages in this section

- [The query editor](./editor.md): tabs, formatting, run and cancel, the row limit, keyboard shortcuts and the command palette.
- [The schema browser](./schema-browser.md): browse and search catalogs, schemas, tables and columns, and preview a table.
- [Query parameters](./parameters.md): `{{name}}` placeholders and how values are quoted.
- [Query results](./results.md): the grid, the chart view, copy and export, and the row limits.
- [History, saved queries and snippets](./history-saved-snippets.md)
- [Save a query as a dataset](./save-as-dataset.md)
- [Query errors](./query-errors.md): how the engine's error is shown and what the common ones mean.
- [Permissions and availability](./permissions.md): the workspace feature switch and the roles that gate SQL Lab.

## Limits and known issues

- SQL Lab needs at least one database connection granted to the workspace. Without one the database picker is empty and **Run** reports *Pick a database*.
- The row limit, the 60-second query timeout and the 100,000-row ceiling are server settings; see [Query results](./results.md#limits).
- Cancelling a query leaves the Results panel empty without saying the query was cancelled. See the [editor page](./editor.md#run-and-cancel).

## Further reading

- [Datasets & metrics](../datasets-and-metrics/index.md)
- [Charts](../charts/index.md)
- [Databases](../../workspace-settings/databases.md)
