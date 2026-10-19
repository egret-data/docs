---
sidebar_position: 2
---

# Catalog detail

Select a catalog on **Control Plane → Catalogs** to open its page. The header shows the name, kind and counts for **ENGINES** and **WORKSPACES**, with **CREATED** and **UPDATED** times (and the **WAREHOUSE** id for an egret warehouse). Which tabs appear depends on the kind.

| Kind | Tabs |
|---|---|
| External catalog (Iceberg, Hive, JDBC, TPC-H and so on) | **Configuration**, **Engines**, **Workspaces** |
| egret warehouse | **Configuration**, **Engines**, **Workspaces**, **Roles & grants**, **Catalog Clients**, **Browse**, **Connect**, **Settings** |

## Configuration

![The Configuration tab of the TPC-H catalog tpch_bench](/img/platform/admin/cp-catalog-config.png)

*What every attached engine is told about this catalog. Saving re-applies it to each of them.* **Edit configuration** opens the same fields as the create form. Below them the tab shows the **Description** and **Stored configuration (JSON)**.

For an egret warehouse the tab says *egret manages this catalog's configuration with its warehouse — the catalog is the warehouse, and its storage is the warehouse's.* There is nothing to edit.

## Engines

![The Engines tab after attaching tpch_bench to docs-trino](/img/platform/admin/cp-catalog-engines.png)

*Attaching a catalog makes it a catalog on that engine. Trino applies it to the cluster and restarts the coordinator; StarRocks creates it on the FE in place.*

### Attach a catalog to an engine

1. Under **Engine to attach**, choose an engine (*Select an engine*).
2. Optionally press **Test** to check the catalog first. A catalog with no network endpoint egret can dial, such as TPC-H, says *No test ran: egret had neither an engine that could run the query nor a host it could dial* and suggests attaching it to a Trino engine to test it.
3. Press **Attach**.

The table lists the engine, its type, whether it is **Primary**, and the **Apply** and **Applied** states, with **Retry** and **Detach**. An external engine shows the state *declared*: egret recorded that the engine serves the catalog and applied nothing. A provisioned engine shows whether the apply succeeded.

:::note
**Apply** is this catalog's state on that engine, not the engine's own health. An engine that has since failed still reads applied here, because the catalog did apply before it broke.
:::

**Retry** and **Detach** on a Trino engine rebuild every catalog that engine has, all at once. Either can be refused because a different catalog on the same engine has a stored configuration egret cannot parse, and the message names that other catalog. The engine's own **Catalogs** tab lists which.

With none attached the tab says *This catalog is not attached to any engine, so nothing can query it yet.*

## Workspaces

![The Workspaces tab: a checkbox per workspace](/img/platform/admin/cp-catalog-workspaces.png)

Tick the workspaces that should see the catalog and press **Save assignments** (**Reset** discards changes). A toast says *Workspace assignments saved*.

An assignment decides which catalogs a workspace sees in its engine view. It does not restrict what an engine will answer: a query naming this catalog directly is still served, and notebook warehouse selection ignores assignment entirely.

An egret warehouse is also visible to the workspace that owns it for as long as it has no assignments at all, and the first assignment replaces that fallback. Emptying the list does not hide such a catalog from its owner, and assigning it to one workspace takes it out of the owning workspace's view unless that workspace is on the list too.

Assigning a catalog to a workspace also writes a grant in the data-plane model: all members of the workspace can read it. It appears on Governance pages as *Set by workspace assignment*.

## Roles & grants (warehouse)

![Catalog roles and their grants](/img/platform/admin/cp-catalog-roles.png)

*Catalog roles, keyed by consumer type: engine, notebook or external. Their grants gate reads and writes on the warehouse.*

| Control | Does |
|---|---|
| **Add role** | A **Name**, a **Consumer type** (**engine**, **notebook**, **external**) and a **Description**. |
| **Add grant** | On a role: a **Namespace** (or **All namespaces**), a **Table** (or **All tables**) and a **Privilege**, **read** or **write**. *A write/manage privilege permits writes; any grant permits reads.* |

The table shows each role's **Consumer**, **Grants** (for example `catalog · write` or `demo_ns.orders · read`) and the number of **Clients**.

## Catalog Clients (warehouse)

*Machine credentials (client id + secret) an engine or notebook uses to authenticate.*

1. Press **Add client**.
2. Type a **Name**, choose the **Role** (for example *demo-engine (engine)*) and the **Workspace**.
3. Press **Create client**. Note the client id and secret that egret shows; the list afterwards shows only the **Client ID**.

The list shows **Name**, **Consumer**, **Role**, **Client ID** and **Revoke**.

## Browse (warehouse)

![Browsing the analytics namespace and the sessions table](/img/platform/admin/cp-catalog-browse.png)

A tree of **Namespaces** (with a count) and a **Recycle bin** for dropped tables, with a search field (*Search tables & views…*). Select a table to see its **Format** version, **Columns**, **Snapshots**, **Updated** time and **Location**, with the tabs **Schema**, **Properties** and **Snapshots**. Each table and column has a tag control, which assigns a [classification tag](../../data-governance/classifications/tagging.md).

## Connect (warehouse)

![The Connect tab with the REST catalog URI and the PyIceberg snippet](/img/platform/admin/cp-catalog-connect.png)

*egret exposes this warehouse as an Iceberg REST catalog. Point any Iceberg-compatible engine at it using a Catalog Client's credentials.* The tab shows the **CATALOG URI**, **WAREHOUSE** and **OAUTH TOKEN URL**, and ready-made snippets for **PyIceberg**, **Trino** and **StarRocks**. Replace the `<CLIENT_ID>:<CLIENT_SECRET>` placeholders with a client's values. If the engine runs in Docker, use the egret host reachable from that container instead of `localhost`. The snippets ask egret to vend short-lived, table-scoped S3 credentials, so no static object-store keys are needed.

## Settings (warehouse) {#settings-warehouse}

![The warehouse settings](/img/platform/admin/cp-catalog-settings.png)

**Edit** changes the editable settings.

| Setting | Meaning |
|---|---|
| **Status** | Whether the catalog is active and serving reads and writes. |
| **Soft-delete retention** | How long dropped tables stay recoverable before they are purged. Minimum about 7 days. Default 7 days. |
| **Format version** | Which Iceberg table format versions clients may create. Default *Allow v1 and v2*. |
| **Storage connection** | The connection this warehouse's data lives on. Its S3 key is managed there. |

**Background tasks** lists the catalog's garbage-collection queues (tabular expiry, purge and task-log cleanup) that reclaim storage from dropped tables, or *No pending tasks.*

## Limits and known issues

- A TPC-H catalog cannot be tested before it is attached.
- Attach and detach on Trino restart the coordinator.

## Further reading

- [Create a catalog](./create-catalog.md)
- [Storage](../storage/index.md)
- [Governance: Data](../../data-governance/data/index.md)
