---
sidebar_position: 5
---

# Catalogs

A **catalog** is a set of tables an engine can query. **Control Plane → Infrastructure → Catalogs** is the registry of every catalog the platform knows about: Iceberg warehouses that egret manages itself, and external sources such as a Hive metastore, a JDBC database or generated TPC-H data. From here you attach a catalog to an engine so it can be queried, and assign it to workspaces so they can see it.

![The Catalogs list with an egret warehouse and a TPC-H catalog](/img/platform/admin/cp-catalogs.png)

You need **catalog_registry:read** to open the page. Creating, editing, attaching and assigning need the matching `catalog_registry` permissions (see the [permissions catalog](../access-control/permissions.md)).

## The catalog list

A strip counts **catalogs**, how many are **attached to an engine** and how many are **needing attention**.

| Column | Meaning |
|---|---|
| **Name** | The catalog name, as it is addressed in SQL on every engine. |
| **Kind** | `egret warehouse`, `iceberg`, `hive`, `delta`, `hudi`, `jdbc`, `elasticsearch`, `tpch`, `tpcds` or `generic`. |
| **Engines** | How many engines it is attached to. |
| **Workspaces** | The workspaces it is assigned to, or a dash. |
| **Status** | Shows a state when the catalog needs attention, for example an attachment that could not be applied; a dash otherwise. |
| Actions | **Delete**. |

## How catalogs become usable

A catalog goes through three steps, each on the catalog's page:

1. **Create** it (see [Create a catalog](./create-catalog.md)). This stores its configuration. Nothing is queryable yet.
2. **Attach** it to an engine (**Engines** tab). The engine can now query it. On a provisioned Trino engine this restarts the coordinator; on an external engine it only *declares* that the engine serves the catalog.
3. **Assign** it to workspaces (**Workspaces** tab) so those workspaces see it in their engine view.

The Governance area uses step 2: grants and rules on a catalog reach only the policy profiles of engines that serve it.

## Delete a catalog

Press **Delete** on a row and confirm. Check the **Engines** and **Workspaces** columns first: a catalog that is attached or assigned is in use. For an egret warehouse the **Settings** tab holds a soft-delete retention (see [Catalog detail](./catalog-detail.md#settings-warehouse)).

## Egret warehouses and external catalogs

| | egret warehouse | External catalog |
|---|---|---|
| What it is | An Iceberg warehouse egret runs itself, over a storage connection | A source egret does not manage |
| Metadata | Held in egret's embedded catalog | In the external metastore or database |
| Extra tabs | **Roles & grants**, **Catalog Clients**, **Browse**, **Connect**, **Settings** | **Configuration**, **Engines**, **Workspaces** only |
| Governance tags | Yes | No |

## Limits and known issues

- The kind cannot be changed after creation, because engines read a different set of properties for each kind.
- Attaching a Trino catalog restarts the coordinator, so queries in flight are lost.
- Governance tags work only on egret-managed catalogs.

## Further reading

- [Create a catalog](./create-catalog.md)
- [Catalog detail](./catalog-detail.md)
- [Storage](../storage/index.md)
