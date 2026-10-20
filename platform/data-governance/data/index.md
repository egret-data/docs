---
sidebar_position: 2
---

# Data

**Governance → Data** is the place to look at the access to one piece of data: a catalog, a schema, a table, a view or a column. Open an object to see who can read it, which tags and rules apply, which engines serve it and where it comes from.

![The Data page for the sessions table: header, engine docs-trino, and the Columns list with tags and masking rules](/img/platform/admin/gov-table-overview.png)

The page needs the **policy:read** or **tag:read** permission. Reading grants and rules needs **policy:read**; reading and applying tags needs **tag:read**.

## Browse the catalog tree

The left panel is a tree of the **catalogs** egret knows about. Each catalog shows its kind and source, for example *Iceberg · egret* for a warehouse egret manages, *TPC-H · via engine* or *JDBC · via engine* for catalogs listed through an engine. Expand a catalog to its schemas, and a schema to its tables, views and materialized views.

| Control | What it does |
|---|---|
| **Go to path** | Type `catalog.schema.table` (or a shorter path) and press Enter to open it directly. An empty or malformed path shows *Enter a path such as catalog.schema.table.* |
| **Filter loaded items** | Filters the items already loaded in the tree. It does not search catalogs you have not expanded. |
| Keyboard | Up and Down move through items. Right expands, Left collapses, Enter opens. |

On a narrow screen the tree sits behind a **Show catalogs** toggle.

:::note
Schemas and tables are listed live by asking the catalog or engine. If a level cannot be listed the tree says *This level could not be listed. Retry, or reload the page.* An engine can return an empty list for names it cannot match, for example mixed-case names in Trino JDBC catalogs.
:::

New catalogs are added by an administrator in [Control plane → Catalogs](../../control-plane/catalogs/index.md). Until one is registered the tree shows *No catalogs*.

## The object header

Every object page has the same header:

- The **name** and the **path** (`catalog.schema.table`), and the kind: *Catalog*, *Schema*, *Table*, *View* or *Materialized view*.
- **Grant access**, which opens the [grant dialog](./grants.md) with this object as the scope.
- **Add tag** on a table, view or materialized view, which opens the [tag picker](../classifications/tagging.md). Tags exist only on egret-managed catalogs; on any other the button is disabled with *Tags can be added to egret-managed catalogs only*.
- **Who can read?**, which opens [Explain access](./explain-access.md) for this object.
- **Engines**: the engines that serve the catalog, for example `docs-trino · Trino`. *No engine attached* means no engine is declared to serve the catalog, so no policy reaches an engine.
- **Tags**: the tags on this object. A schema or catalog shows none, because tags attach to tables and columns.

The header never waits on the API. Its name and path come from the URL, so one failing call never blanks the page.

## Tabs by level

The tabs depend on what you opened:

| Level | Tabs |
|---|---|
| Catalog | **Overview**, **Permissions**, **Masks & filters**, **Details** |
| Schema | **Overview**, **Permissions**, **Masks & filters** |
| Table, view, materialized view | **Overview**, **Permissions**, **Masks & filters**, **Lineage**, **Details** |

The selected tab is kept in the address (`?tab=permissions`, `?tab=masks`, `?tab=lineage`, `?tab=details`), so you can link to it and the Back button walks through tabs. **Overview** is the absence of the parameter.

### Overview

- **Catalog**: the **Schemas** it contains, the **Attached engines** (or *Not attached to any engine*) and the **Workspaces** it is assigned to.
- **Schema**: a table with **Name** and **Kind** for each table, view or materialized view.

![The schema analytics: three tables and the view revenue_by_country](/img/platform/admin/gov-data-schema.png)

- **Table**: the **Columns** table with **Name**, **Type**, **Tags** and **Masking rules** per column. Select a column to open its panel (see below).

### Permissions

The grants that reach the object. See [Grants](./grants.md).

### Masks & filters

The mask and row-filter rules that select the object. See [Masks and row filters](./masks-and-filters.md).

### Lineage

On a table, **Reads from** lists the base tables of a view, and **Read by** lists the views and materialized views that read this table. Each view shows how its lineage was obtained: *Recorded: egret read the view's definition and recorded the tables it reads*, *Not recorded: egret has no lineage for this view yet*, or *Matched by definition text, may over-report*. An ordinary table shows *egret has no lineage recorded for this object* and, when nothing reads it, *No view or materialized view reads this table*. This tab is what [View exposure](../classifications/view-exposure.md) is built on.

### Details

| Field | Meaning |
|---|---|
| **Full path** | The `catalog.schema.table` path. |
| **Source** | The kind and origin, for example *Iceberg · egret*. |
| **Warehouse** | The egret warehouse behind an egret catalog. |
| **Workspaces** | Workspaces the catalog is assigned to. |
| **Engines** | Engines that serve it, or *None*. |

![The Details tab of the sessions table](/img/platform/admin/gov-table-details.png)

## The column panel

Selecting a column in the **Columns** table opens a panel on the right and adds `?column=<name>` to the address. It shows, for that column:

- **Who can read this column?**, an [explain](./explain-access.md) for the column.
- **Add tag** and the **Tags** on the column.
- **Masking rules** that select it.
- **Grants** set on the column. Grants on the table and above reach the column too; the panel says so and points to **Permissions**.

Close the panel with **Close**.

![The column panel for user_id with its tag, the masking rule selected by the tag, and no column grant](/img/platform/admin/gov-column-panel.png)

## Limits and known issues

- The Data page shows egret grants and rules only. Hand-written and egret-seeded engine policies are not listed; **Who can read?** gives the engine's own answer.
- Lineage is only as complete as egret's record of each view. A table with no recorded readers shows *No view or materialized view reads this table*, even if a view in another system reads it.

## Further reading

- [How permissions work](../concepts.md)
- [Grants](./grants.md)
- [Masks and row filters](./masks-and-filters.md)
- [Explain access](./explain-access.md)
