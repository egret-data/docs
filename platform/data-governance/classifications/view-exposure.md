---
sidebar_position: 3
---

# View exposure

A classification's clearance stops a direct read of a classified column. A **view** reads the same data indirectly, so without more care it could read straight through the clearance. The tag page shows, per classification, the views that read classified data and what the engine does about them. This page explains those sections and what clearance does and does not protect through views.

![The tag page sections for materialized views, Trino views and rules](/img/platform/admin/gov-tag-detail.png)

The sections need **tag:read** (and **policy:read** for the rules section). They are below **Clearance** on the tag page of **Governance → Classifications**.

## What is protected

### Trino

- Views in egret's own Iceberg catalogs **carry their base tables' classifications**. A `CREATE VIEW` reaches egret before it is committed. Egret asks the engine which tables the view reads, tags every column of the view with those tables' classifications, and holds the commit until every Trino plugin has the new tags. The view does not exist until then, so nobody reads it untagged.
- Tags follow the base tables: classifying, reclassifying or declassifying a base column re-tags the views that read it.
- Lineage is table-level, so every column of a view gets every classification of every table it reads. This over-tags by design.

### StarRocks

- A column carries a clearance mask: **Nullify** for an uncleared user. A direct read returns `NULL` for that column, provided the query also reads another column the user may select.
- A base-column mask applies through plain and nested views, so an uncleared reader gets `NULL`. Through an INVOKER view the uncleared reader is refused.
- New materialized views are denied on a StarRocks profile with a classified column, because a materialized view stores real values and a mask does not follow stored data.

## What is not protected

- Data a cleared user copies out, with `CREATE TABLE AS SELECT`, `INSERT … SELECT` or an export. Clearance does not follow the data.
- Views of other connectors. A view in a catalog that is not in egret's registry never reaches egret, so it is not tagged.
- Native StarRocks tables: the registry cannot hold `default_catalog`, so a native table cannot carry a classification.
- Materialized views that already exist. The deny stops new ones only, and egret does not drop old ones.
- Engines older than StarRocks 4.1.6, where a reader with no grant on a plain view reads it anyway.

## The two sections on the tag page

### Existing materialized views

*StarRocks materialized views that read a table of this classification. StarRocks keeps every materialized view in default_catalog.* Every running StarRocks engine is asked once. The table has columns **View**, **Database** and **Engine**. A view matches when its base-table map names a classified table, or, if it has no map, when its definition names the classified catalog and database (*matched by definition text*). A materialized view over a listed one is listed too.

The warning under the heading depends on the clearance: *These views may hold real classified values; egret does not drop them.* With a role clearance it adds *users not cleared for every classification on an engine cannot create any materialized view on that engine, even over unclassified data.* Without one it says *This classification has no role clearance, so it does not stop anyone creating materialized views.* An engine egret did not ask (external or not running) is named as not checked, and an engine that cannot be reached is reported rather than shown as *none*. When nothing matches: *No materialized views read this classification's tables.* Drop or rebuild a listed view yourself.

### Trino views

*DEFINER views run as their owner: base masks and row filters apply as the owner, and an uncleared owner blocks every reader. INVOKER views run as the reader, so prefer SECURITY INVOKER.* The table lists every view in egret's catalogs whose lineage reads a table of the classification or a table a mask or row-filter rule selects:

| Column | Meaning |
|---|---|
| **View** | `catalog.schema.view`. |
| **Mode** | **DEFINER** or **INVOKER**, from the view's stored properties. Unknown if the metadata cannot be read; egret never guesses DEFINER. |
| **Owner** | The view's owner. |
| **Owner clearance** | Whether the owner holds a clearing role of every classification the view reaches. *Clearance unknown* means the lineage is not computed, or a reached clearance names only groups. |
| **Why listed** | The classification or rule that put the view here. |
| **Lineage** | Whether the view's lineage is recorded. A view with missing or failed lineage is listed anyway, as *may read classified data*. |

When none match: *No Trino views read this classification or a masked table.* A failed load says *Could not load the Trino views. Reload the page to try again.*

Owner clearance is read from current role membership, while the engine enforces the last compiled policy, so after a role grant expires the page says *not cleared* while the engine still lets the owner through until the next recompile.

## Recommendation: create views with SECURITY INVOKER

A Trino view is DEFINER by default. With the tags in place a DEFINER view over classified data does not leak, but an uncleared owner blocks every reader of it, cleared readers included, and base masks and row filters apply as the owner rather than the reader. An INVOKER view reads as its reader, so everyone gets their own masks, row filters and clearance.

Trino 483 does not remove the DEFINER property on `CREATE OR REPLACE VIEW … SECURITY INVOKER`. To switch, drop and recreate:

```sql
DROP VIEW ice.sales.v_orders;
CREATE VIEW ice.sales.v_orders SECURITY INVOKER AS SELECT ...;
```

## Expect a wait when creating a view

A view change on a catalog whose profile has a classified column is held until the plugins confirm the tags. The whole request has one deadline of 90 seconds, and a view that reads classified data waits one to two plugin poll intervals (30 to 60 seconds). A proxy in front of the catalog endpoint must read for longer than 90 seconds. At most 8 such holds run at once per egret process; a ninth is refused at once with a retry message. On a catalog with no classified column the commit is never held.

## Limits and known issues

- Not run on the demo instance: it has no view over classified data, so both sections show their empty states.
- The Trino list has a 15 second deadline. If egret's views cannot all be read, the page shows an error instead of a partial list.

## Further reading

- [Clearance](./clearance.md)
- [Data: Lineage tab](../data/index.md#lineage)
