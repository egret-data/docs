---
sidebar_position: 3
---

# The schema browser

The **Explorer** is the panel on the left of SQL Lab. It lists what is in the database you are querying, lets you insert names into the editor with a click, searches across the whole database and opens a quick preview of any table.

![The Explorer with the tpch catalog, the tiny schema and the orders table expanded](/img/platform/sql-datasets/sqllab-explorer.png)

## Choose a database

The picker at the top of the Explorer lists every database connection that is granted to the workspace, written as *name (engine)*, for example *trino-demo (trino)*. A small **egret** badge marks an engine that Egret provisioned itself. If there is only one database it is selected for you; otherwise the panel shows *Select a database to browse its schema.* until you choose one.

The choice is stored with the tab. Changing the database clears the search box and resets the names used for [autocomplete](./editor#autocomplete), but it does not touch the SQL in the editor. A database that was removed from the workspace after you chose it shows *This database is no longer available.*

## Browse the tree

How deep the tree goes depends on the engine:

| Engine | Levels |
|---|---|
| Trino | catalog → schema → table → column |
| StarRocks | schema (database) → table → column |

Press the chevron beside a name to open or close it. Clicking the name of a catalog or schema does the same. Each level loads when you first open it and shows *Loading…* while it does.

- **Table.** Click the name to append the full name (`tpch.tiny.orders` on Trino, `schema.table` on StarRocks) to the editor. Press the chevron to list its columns.
- **Column.** Click the name to append it. The column's type is shown on the right, for example `varchar(1)` or `double`.
- **Preview.** Hover over a table to reveal the eye icon (**Preview data**).

Tables are listed with `SHOW TABLES`, so views appear alongside tables.

Clicking a name appends it to the very end of the editor text with no space or comma in front of it. Type the separator yourself first, or add it afterwards.

### States you can meet

| Text in the panel | Meaning |
|---|---|
| *Loading…* | The level is being fetched. |
| *No catalogs.*, *No schemas.*, *No tables.*, *No columns.* | The level is empty. |
| *Couldn’t load — no access or engine error.* | The request failed. A missing permission, for example no `query:run`, a delegated connection without your engine token, and an unreachable engine all look the same here. |
| *No match.* | The text in the search box matches nothing at this level. |

Lists are cached in your browser for five minutes. If the schema changed (a table was created, a column added), reload the page to fetch it again. There is no refresh button.

## Search

Type in **Search tables…**. It behaves in two ways depending on the length of what you typed.

- **One character** filters the names that are already loaded in the tree: any level whose name contains the character is kept.
- **Two or more characters** switch the Explorer from the tree to a flat list of results. After a quarter of a second pause Egret searches the whole database, across all catalogs and schemas, for tables and views whose **name** contains the text. The match is case-insensitive, `%` and `_` are taken literally, and the list is capped at 200 results ordered by table name.

![Search results for "customer" across catalogs](/img/platform/sql-datasets/sqllab-explorer-search.png)

Each result shows the table name with `catalog.schema` on the right. Click it to append the full name to the editor, or use the eye icon to preview it. Clear the box to go back to the tree.

Messages: *Searching…* while the query runs; *No objects match “text”.* when nothing was found; *Search failed — check access or engine.* when the request errored.

:::tip Narrow wide searches
On a Trino server with the TPC-H and TPC-DS catalogs, a search for `customer` finds the table in every scale-factor schema (`tiny`, `sf1`, `sf100`, and so on). Add part of the schema you want to the SQL once you have inserted the name, or browse the tree to the exact schema instead.
:::

## Preview a table

The eye icon opens **Preview data**. Egret opens a **new tab** named after the table, fills it with

```sql
SELECT * FROM tpch.tiny.orders LIMIT 100
```

sets the limit to 100 rows and runs it straight away. Your other tabs are untouched. The preview tab is an ordinary tab: edit the SQL, run it again or save it.

![The preview tab for tpch.tiny.orders](/img/platform/sql-datasets/sqllab-preview.png)

## Collapse the Explorer

Press the collapse icon at the right of the **Explorer** header, or use **Hide explorer** in the **…** menu or the command palette, to give the editor the full width. A narrow strip with a **Show explorer** button stays at the left. Dragging the grey bar between the Explorer and the editor resizes the panel (between 12% and 40% of the width).

## What you can see

The tree shows what the connection's identity may see. With a connection that uses per-user delegation, the engine answers as you, so you only see the catalogs, schemas and tables your own engine permissions allow. With a shared service account, everyone in the workspace who can use SQL Lab sees the same objects. Browsing needs the same `query:run` permission as running queries; see [Permissions and availability](./permissions).

## Limits and known issues

- Each browse request (catalogs, schemas, tables, columns, search) reads at most 10,000 rows and gives up after 15 seconds; a slower engine shows the *Couldn’t load* message.
- Search matches table names only, never column names.
- Autocomplete and the Explorer share one data source, so only objects you have expanded are suggested while typing.

## Further reading

- [The query editor](./editor)
- [Databases](../../workspace-settings/databases)
