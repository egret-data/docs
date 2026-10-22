---
sidebar_position: 2
---

# Datasets & metrics

A **dataset** is a table or a SQL query that you register in a workspace and describe once: which columns exist, how they are named and formatted, and which calculations (metrics) people may use. [Charts](../charts/index.md) and dashboards are built on datasets, never on raw tables, so the definitions live in one place and every chart that uses them stays consistent.

![The Datasets list](/img/platform/sql-datasets/datasets-list.png)

## Physical and virtual datasets

There are two kinds, shown in the **Kind** column of the list and as a tag in the dataset header.

| | Physical | Virtual |
|---|---|---|
| **Defined by** | A table (or view) in one of the workspace's databases: *catalog, schema, table* | A SQL query that you write |
| **Source** column in the list | The table name, for example `tpch.tiny.lineitem` | `SQL` |
| **Created from** | **Create** on the Datasets page, or **Duplicate** on an existing physical dataset | **Save as dataset** in [SQL Lab](../sql-lab/save-as-dataset.md), or **Duplicate** on an existing virtual dataset |
| **SQL is editable** | No. The source is the table. | Yes, on the dataset page, followed by **Refresh** |
| **Typical use** | A clean table that analysts can chart as it is | Joins, filters, renames and derived columns kept under one name |

Both kinds work the same way after they are created: they have columns with settings, optional calculated columns, metrics, and can have charts built on them.

## What a dataset holds

- **Columns.** One row for every column of the source, detected automatically, plus any [calculated columns](./calculated-columns.md) you add. Each column has a type, a role, a format, a display name, a description and switches for how charts may use it. See [Columns](./columns.md).
- **Metrics.** Named aggregations such as `revenue = SUM(totalprice)` that any chart on the dataset can measure. See [Metrics](./metrics.md).
- **A description** and a **certified** flag that tells readers a steward has vetted the dataset. See [Certification](./certification.md).

Datasets store **definitions, not data**. Opening a dataset or a chart runs a query against the source database, so charts always read current rows (subject to the connection's identity; see [Permissions](./permissions.md)).

## The Datasets page

Go to **Explore → Datasets**.

### Toolbar

The icon buttons at the top right of the list, from left to right:

| Button | What it does |
|---|---|
| **Bookmarks** (star) | Shows only the datasets you bookmarked. Press again to show all. |
| **Bulk select** | Adds a checkbox to each row. With rows selected, a **Move n to folder…** menu and **Move n to Trash** appear. |
| **Trash** | Switches to the trash view (see [Organise datasets](./organize.md)). |
| **New folder** | Creates a folder to group datasets. |
| **Create** | Opens **New dataset**. See [Creating a dataset](./creating-a-dataset.md). |

### Filters and the list

Below the toolbar:

- **Search name, schema, table…** matches the name, description, catalog, schema, table or database name.
- **Type** limits the list to *Physical* or *Virtual*; **Database** to one connection.
- A counter shows how many datasets match, for example *12 datasets*, and how many folders exist (*2 folders*).

The table columns are **Name**, **Kind**, **Database**, **Source**, **Columns** and **Updated**. Click **Name**, **Columns** or **Updated** to sort; the default order is the most recently updated first. In the **Name** cell, the star bookmarks the dataset, the name opens it, and a green check marks a certified dataset.

The **…** menu at the end of a row offers **Edit**, **Refresh**, **Duplicate**, the folder commands, **Share…**, **Tags…** and **Move to Trash**.

![The row menu of a dataset](/img/platform/sql-datasets/datasets-row-menu.png)

## A dataset page

Click a dataset's name to open it. The page has a header and four tabs.

![A dataset page with its Columns tab](/img/platform/sql-datasets/ds-columns.png)

- The **header** shows the name, the kind, a **Certified** badge when it applies, the description, counters (*10 columns*, *5 metrics*, or *1 column*, *1 metric* in the singular, *updated a minute ago*) and the source: the SQL for a virtual dataset, or `catalog.schema.table` for a physical one. On the right, the buttons are **Create chart**, **Certification** (only for people who may certify), **Edit**, **Refresh columns** and **Delete**.
- **Columns (n)**: every column and its settings. See [Columns](./columns.md).
- **Metrics (n)**: the dataset's aggregations. See [Metrics](./metrics.md).
- **Usage**: the charts built on this dataset, and **Preview**: the first 100 rows. See [Usage and preview](./usage-and-preview.md).

The tab you are on is kept in the address (`?tab=metrics`), so a link opens the same tab.

## Typical workflow

1. [Create a dataset](./creating-a-dataset.md) from a table or from a SQL Lab query.
2. On **Columns**, give columns friendly names, set formats and decide how they are used.
3. Add [calculated columns](./calculated-columns.md) and [metrics](./metrics.md).
4. Check the result on **Preview**.
5. Press **Create chart**, or ask a steward to [certify](./certification.md) the dataset.

## Pages in this section

- [Creating a dataset](./creating-a-dataset.md)
- [Columns](./columns.md): every column setting.
- [Calculated columns](./calculated-columns.md)
- [Metrics](./metrics.md)
- [Usage and preview](./usage-and-preview.md)
- [Certification](./certification.md)
- [Refresh and schema sync](./refresh-and-sync.md)
- [Organise datasets](./organize.md): bookmarks, folders, trash, tags and sharing.
- [Permissions](./permissions.md)

## Limits and known issues

- A dataset belongs to one database connection. It cannot combine tables from two connections; use a virtual dataset with a join inside one engine instead.
- Deleting a dataset removes its definition and its column snapshot; it never touches the source table.

## Further reading

- [SQL Lab](../sql-lab/index.md)
- [Charts](../charts/index.md)
- [Dashboards](../dashboards/index.md)
