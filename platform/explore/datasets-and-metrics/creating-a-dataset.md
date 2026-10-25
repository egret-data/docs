---
sidebar_position: 2
---

# Creating a dataset

You can create a dataset in three ways: from a table in one of your databases (a physical dataset), from a SQL query in [SQL Lab](../sql-lab) (a virtual dataset), or by duplicating a dataset that already exists. All three end on the new dataset's page, with its columns already detected.

![The New dataset dialog filled in for the tpch customer table](/img/platform/sql-datasets/datasets-create.png)

## Before you start

- The workspace needs at least one database connection. Workspace admins add connections under **Manage → Workspace settings → Databases** ([Connections](../../workspace-settings/databases)).
- You need the `dataset:manage` permission in the workspace, which the built-in `ws_editor` and `ws_admin` roles have. See [Permissions](./permissions).
- The Datasets module must be on for the workspace.

## Create a physical dataset from a table

1. Go to **Explore → Datasets** and press **Create**. (On an empty workspace the button reads **Create your first dataset**.)
2. In **New dataset**, choose a **Connection**. The list shows each connection as *name (engine)*.
3. Type a **Name**. The name must be unique in the workspace; an existing name is refused with *a dataset with this name already exists*.
4. Optionally type a **Description**.
5. On Trino, choose a **Catalog**. The list stays disabled until you pick a connection (it says *Pick a database first*).
6. Choose a **Schema**, then a **Table**. Each list stays disabled until the one before it has a value.
7. Press **Create**.

Egret reads the table's columns from the engine, creates the dataset, shows the toast *Dataset created* and opens its page. The button reads **Creating…** while this happens and stays disabled until a table is chosen.

StarRocks connections have no catalog level, so the dialog shows only **Schema** and **Table**.

:::tip Need a join or a filter?
The dialog links to **Need a custom query? Use SQL Lab**. A physical dataset is exactly one table. For anything else, write the query in SQL Lab and save it as a virtual dataset.
:::

## Create a virtual dataset from SQL Lab

1. Write a query in [SQL Lab](../sql-lab/editor) and run it to check it.
2. Press **Save as dataset**, type a **Name** and an optional **Description**, and press **Create dataset**.

The steps and the rules the SQL must follow are on [Save a query as a dataset](../sql-lab/save-as-dataset). Virtual datasets cannot be created from the Datasets page itself.

## Duplicate a dataset

In the datasets list, open the **…** menu of a dataset, physical or virtual, and choose **Duplicate**.

1. The **Duplicate dataset** dialog says *The copy keeps the source, the column settings and the metrics of “name”.* and proposes the **Name** *copy of name*.
2. Change the name if you like and press **Duplicate** (or **Enter**). The button reads **Duplicating…** while it works.
3. The copy's page opens.

The copy has the same database and source (the same table, or the same SQL) and every column setting: display names, roles, formats, descriptions, the **Dimension**, **Filter** and **Time** switches, and calculated columns. It also gets every metric. Certification, shares and tags are not copied, and no chart moves to the copy.

If the name is taken, the dialog keeps it and shows *a dataset with this name already exists* under the field. Duplicating needs read access to the source dataset and the same rights as creating a dataset (`dataset:manage` and a granted database). The API call is `POST /api/ws/{workspace}/datasets/{id}/duplicate` with `{"name": "..."}`.

## What a new dataset contains

| Item | Initial value |
|---|---|
| Columns | One for every column of the table or query, in the engine's order. |
| Column type | The engine's type, for example `bigint`, `varchar(25)`, `double`, `date`. |
| **Role** | Empty (—). |
| **Dimension** and **Filter** | On for every column. |
| **Time** | On for columns whose type the engine reports as a date or a timestamp, off for the rest. |
| **Format**, **Display name**, **Description** | Empty. |
| Metrics | None. |
| Folder | None (shown under *Uncategorized* once you have folders). |

Column types are mapped to three classes: numeric, temporal and string. The class decides which icon the column gets (a hash, a clock, a letter) and which format choices are offered.

## Choose the right kind

- Pick a **physical** dataset when one table already has what charts need. It is the simplest to keep correct: the source is the table, and **Refresh** follows the table's schema.
- Pick a **virtual** dataset when you must join, filter, rename or derive columns first, or when a table has columns that nobody should chart. The SQL is the single place to fix the logic.
- Start from a physical dataset and add [calculated columns](./calculated-columns) and [metrics](./metrics) when the change is small; reach for a virtual dataset when the join or filter is the point.

## Example: a Customers dataset

1. **Explore → Datasets → Create**.
2. **Connection**: *trino-demo (trino)*. **Name**: *Customers*. **Description**: *One row per customer (tpch tiny).*
3. **Catalog**: *tpch*. **Schema**: *tiny*. **Table**: *customer*.
4. Press **Create**.

The new dataset has eight columns (`custkey`, `name`, `address`, `nationkey`, `phone`, `acctbal`, `mktsegment`, `comment`). Open **Preview** to see the first rows, then set `acctbal` to a **Currency** format and add a metric `customer_count` = `COUNT(*)`.

## Using the REST API

The dialog calls `POST /api/ws/{workspace}/datasets`. The body names the database and the source:

```json
{
  "name": "Customers",
  "description": "One row per customer (tpch tiny).",
  "database_id": "<database id>",
  "source": {"kind": "physical", "catalog": "tpch", "schema": "tiny", "table": "customer"}
}
```

For a virtual dataset use `"source": {"kind": "virtual", "sql": "SELECT ..."}`. The response is the full dataset with its detected columns. A name that already exists returns `409`, and a source the engine rejects returns `502` with the engine's message. See the [REST API reference](../../reference/rest-api).

## Errors

| Message | Cause |
|---|---|
| *Pick a database* | No connection chosen. |
| *Name required* | The name is empty. |
| *a dataset with this name already exists* | Names are unique per workspace. |
| ``the query returns more than one column named `x`; give each column its own name with AS`` | A virtual dataset's query returns two columns with the same name. Alias one of them. |
| *engine: … Table '…' does not exist* | The table was dropped or renamed after you opened the dialog. |
| An engine syntax error | For a virtual dataset, the SQL is not a single query. See [Save a query as a dataset](../sql-lab/save-as-dataset). |

## Limits and known issues

- The dialog's lists load from the engine with the same identity as SQL Lab's Explorer, so a table you cannot see there cannot be chosen here.
- A virtual dataset's columns are read when it is created or refreshed; see [Refresh and schema sync](./refresh-and-sync).

## Further reading

- [Columns](./columns)
- [Metrics](./metrics)
- [Save a query as a dataset](../sql-lab/save-as-dataset)
