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

![The Lineage tab of the sessions table: the view revenue_by_country reads it, found by recorded lineage](/img/platform/admin/gov-table-lineage.png)

- **Reads from** lists the base tables of a view.
- **Read by** lists the views and materialized views that read a table. An empty list says *No view or materialized view reads this table*. When a view's lineage is missing, the tab warns instead: *This list may be incomplete. 1 view in egret's catalogs has lineage egret does not know (failed or not yet computed); it may read this table* and *No reader is known.*
- A table with no record says *egret has no lineage recorded for this object*.

Each view carries how its lineage was obtained:

| State | Text |
|---|---|
| Computed | *Recorded: egret read the view's definition and recorded the tables it reads.* |
| Missing | *Not recorded: egret has no lineage for this view yet.* |
| Text match | *Matched by definition text, may over-report.* |

Lineage here is table-level, not column-level: it says which tables a view reads, not which columns flow where.

## Why it matters for governance

When a view is created in an egret catalog, egret uses its lineage to tag the view with the classifications of its base tables. If lineage fails to compute, the Governance overview raises a **view lineage failed** finding.

## How egret computes lineage

Egret computes a view's lineage by sending `EXPLAIN` of the view to an engine that serves its catalog, as its own reader `egret-lineage`. Only egret mints that reader's token, and only `EXPLAIN` is sent as it. What the reader may do is added to the policies at download time, and only for the Ranger plugin of a **provisioned Trino engine in JWT delegation mode** bound to the profile, where egret signs every token (on Kubernetes or on the Docker provisioner). That plugin receives, for `egret-lineage`:

- `use` and `select` on every catalog the profile's engines attach;
- `impersonate` of itself only, `execute` on query ids and `alter` of the session property `query_max_run_time`;
- a deny of every other access, and a leading exception in every mask, row filter and deny, so that a mask or filter cannot shorten the lineage it reads.

Any other plugin (an external engine, or an engine in another delegation mode) is served the stored policies unchanged, so a lineage `EXPLAIN` there is refused and the view's lineage stays unknown: egret then treats the view as possibly reading classified data.

On the demo stack the view `demo_warehouse.analytics.revenue_by_country` reads `sessions`. Once a provisioned engine served `demo_warehouse`, the lineage sweep recorded it (*computed: 1*). Right after the engine starts, the first sweeps can time out at the 5-second `EXPLAIN` limit; they pass once the engine is warm. Until lineage is computed, the **Lineage** tab of `sessions` shows the warning above instead of the view, and the view is listed on the tag's **View exposure** tab as *may read classified data*. See [View exposure](./classifications/view-exposure.md) and [Data](./data/index.md#lineage).

## Further reading

- [Data](./data/index.md)
- [Governance overview](./overview.md)
