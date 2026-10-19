---
sidebar_position: 6
---

# Lineage

Lineage tells you which tables a view reads and which views read a table. Egret records it for the views in its own catalogs, because [view exposure](./classifications/view-exposure.md) depends on it. There are two places lineage appears, and only one of them is finished.

## Data Lineage in the sidebar

:::caution Not available yet
**Governance → Data Lineage** is a placeholder. It is listed in the sidebar for platform admins, but the page has no functionality yet. It is meant for platform-wide (cross-workspace) lineage once the feature and its permission exist.
:::

## The Lineage tab on a table

The working lineage view is the **Lineage** tab on a table, view or materialized view in **Governance → Data**.

![The Lineage tab of the sessions table: it reads from nothing and nothing reads it](/img/platform/admin/gov-table-lineage.png)

- **Reads from** lists the base tables of a view.
- **Read by** lists the views and materialized views that read a table. An empty list says *No view or materialized view reads this table*, or *No reader is known* when the lineage is incomplete.
- A table with no record says *egret has no lineage recorded for this object*.

Each view carries how its lineage was obtained:

| State | Text |
|---|---|
| Computed | *Recorded: egret read the view's definition and recorded the tables it reads.* |
| Missing | *Not recorded: egret has no lineage for this view yet.* |
| Text match | *Matched by definition text, may over-report.* |

Lineage here is table-level, not column-level: it says which tables a view reads, not which columns flow where.

## Why it matters for governance

When a view is created in an egret catalog, egret uses its lineage to tag the view with the classifications of its base tables. If lineage fails to compute, the Governance overview raises a **view lineage failed** finding. See [View exposure](./classifications/view-exposure.md) and [Data](./data/index.md#lineage).

## Further reading

- [Data](./data/index.md)
- [Governance overview](./overview.md)
