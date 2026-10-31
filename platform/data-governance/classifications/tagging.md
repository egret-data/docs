---
sidebar_position: 2
---

# Tagging data and BI objects

A tag does nothing until it is applied. This page covers how to apply a tag to the tables and columns of an egret catalog and to BI objects, and how to write a **tag-based rule** so a mask or row filter follows the tag wherever it is applied.

![The Add classification dialog for the started_at column, with the list of classifications open](/img/platform/admin/gov-add-tag.png)

## Tag a table or a column

Tags attach to tables and columns in egret-managed catalogs (Iceberg warehouses). Tagging needs the permission to update catalogs (**catalog_registry:update**) and **tag:read** to list the tags.

1. Open **Governance → Data** and select the table.
2. To tag the table, press **Add tag** in the header. To tag a column, select the column in **Columns** and press **Add tag** in the column panel.
3. In **Add tag**, open **Tag** and choose a tag. Tags already on the object are not offered; if there are none left the dialog says *Every tag is already on this table* (or *column*). With no tags defined it says *No tags are defined yet.*
4. Press **Add tag**. A toast says *Tag added.*

![The Data page for the sessions table: header, engine docs-trino, and the Columns list with classifications and rules](/img/platform/admin/gov-table-overview.png)

The tag then appears in the **Tags** column of the table's **Columns** list, in the object header for a table-level tag, and in the column panel. You can also tag from **Control plane → Catalogs → \<catalog\> → Browse**, where each table and column has a tag control.

:::note
A tag applied to a table reaches its columns for policy purposes: engines roll tags up the resource hierarchy. A tag applied to a column does not show up when you explain access for the table. Ask about the column.
:::

When you add a classification to a whole table, the dialog says: *On a whole table, this classification counts for clearance on every column. A rule that masks by classification needs it on columns, not on the table.* Trino and StarRocks both enforce the [clearance](./clearance.md#on-columns-or-on-a-whole-table) and a classification row filter for a table-level classification. A Trino engine does not apply a classification row filter for a column-level one (KI-287).

A mask rule that names a classification already on a whole table is refused. The refusal names that table and lists the other tables the classification is on, up to 49; past that it says the list is cut short.

On a catalog egret does not manage the button is disabled with *Tags can be added to egret-managed catalogs only*.

## Tag a BI object

Datasets, charts and dashboards are tagged from their own list or page: open the object's actions and choose **Tags**, which opens *Tags for "\<name\>"* with the description *Classify this dataset with tags.* Pick a tag in **Add tag** and remove one with its **Remove \<tag\>** button. The count shows in the **BI objects** column of the Classifications list.

## Rules that select a tag

A rule can select **by tag** instead of by path. It then applies to every table or column that carries the tag, now and in the future. This is how you mask all personal data without listing each column.

1. Open any table, select **Masks & filters**, and press **Add rule**.
2. Choose **Kind** (**Mask a column** or **Filter rows**), name it, and set the **Mask type** or **Filter expression**.
3. Set **Selects by** to **Tag**, search for the tag, and pick it.
4. Preview, then **Create**.

The rule shows under **By tag** on every tagged table, for example *Hash personal data — tag Personal data (PII) — mask · MASK_HASH — On column user_id*, and in the engine's **Policies** tab as a masking policy on `tag: Personal data (PII)`. The tag page's **Rules** tab lists every rule selecting the tag, with columns **Rule**, **Kind**, **Reaches this tag** and **Exempt**.

On the demo stack the rule *Hash personal data* (Hash, exempt group `data-stewards`) made `member-sso` read `user_id` as a 64-character hash such as `B25935C0F9C4BB9A…`. It took effect after the next plugin download, within a minute of saving.

:::warning
A tag rule is catalog-unscoped: it recompiles every Trino and StarRocks profile an engine uses. A compile failure on any profile fails the save and rolls the rule back. The preview names the profiles first.
:::

Engines match a rule by its tag's **name**, so a rule written on another tag with the same name also applies. A Trino profile must have a tag service for tag policies to compile; egret refuses to bind a profile without one to an engine.

### Tag rules and explain

**Who can read?** on a column says, for each person and engine, what a tag rule does to them, for example *member-sso reads `user_id` as **hashed** (rule Hash personal data)*, or why they see the real value. Under **Which policies decided this** it lists the **Tags that could decide here** for the target. Tags populate only when the target names both a schema and a table, and a tag on a column does not appear when you ask about its table. See [Explain access](../data/explain-access.md).

## Renames and drops

Classifications are stored on the table's name. egret keeps them with the table when the table changes through its Iceberg catalog, which is the catalog Trino, StarRocks, Spark and PyIceberg use for an egret warehouse.

### Rename a table or a column

When you rename a classified table, for example `ALTER TABLE sales.orders RENAME TO sales.orders_v2`, its classifications move to the new name, on the table and on its columns. When you rename a classified column, for example `ALTER TABLE sales.orders_v2 RENAME COLUMN email TO mail`, the column's classifications move to the new column name. egret pairs columns by their Iceberg field id, so swapping two column names in one change works too. A rename into another schema of the same catalog works the same way.

egret holds the rename before the catalog commits it:

1. It copies the classifications to the new name, while the old name keeps them, and recompiles the Trino and StarRocks profiles of the catalog.
2. It waits until every Trino plugin bound to the catalog serves the new tag version and every StarRocks plugin the new policy version.
3. It lets the catalog rename the table.
4. It removes the classifications from the old name, recompiles, and records the move in **Recent changes** on the [Governance overview](../overview.md#recent-changes).

So the renamed table is protected from its first read under its new name, on both engines. The client waits meanwhile: about two StarRocks policy polls when a StarRocks engine is bound (36 to 56 seconds measured with the 30-second poll), and never more than 90 seconds. With no engine bound to the catalog there is nothing to wait for (KI-310).

egret holds only renames that need it:

| Change | Held |
|---|---|
| A table rename, when the table or one of its columns carries a classification | Yes |
| A column rename, when the column carries a classification | Yes |
| A column rename, when the table carries a classification on the whole table and a StarRocks engine is bound (StarRocks masks each column by name) | Yes |
| A rename that changes only upper and lower case | No |
| A rename of an unclassified table or column, an append, any other change | No |

A rename of a table or column that carries a deny grant, a mask or a row filter written on its path is held the same way, whether or not it is classified, and egret then also waits for Trino's policy version. See [Renames and drops](../data/grants.md#renames-and-drops) on the Grants page.

A table renamed onto a name that still carries classifications, for example one a steward attached before the table existed, keeps both sets.

While a rename is held:

- A classification added to or removed from either name is refused with a 409 and the code `table_change_held`: *a change to sales.orders (a rename, or a view commit) is being held while the engines confirm it; retry when it has finished (at most 90 s)*.
- Another classified rename in the same catalog, and a schema change or undrop of a table there that carries a whole-table classification with a clearance, wait up to 30 seconds, then are refused with a 409 to retry.

### When a rename is refused

A refused rename answers the Iceberg client with a 409 (`CommitFailedException`) whose message starts *egret refused the table change:*, and the table keeps its name. Trino prints the message as the query error.

| Cause | The message continues |
|---|---|
| The classifications cannot be compiled on the new name, for example a ceiling or a mask that conflicts with a path rule on the new name | *the table's classifications cannot move to sales.orders_v3: \<the compiler's reason\>. Nothing was renamed.* |
| A bound engine did not confirm within 90 seconds, for example it is stopped | *engines did not confirm the moved classifications within 90 s: \<plugin ids\>; check that the engines are running and polling egret's Ranger endpoint, then retry. Nothing was renamed.* egret removes the copied classifications. When no plugin has polled lately, the list reads `<no plugin has polled>`. |
| The new name belongs to a table in the catalog's **Recycle bin** | *the new name sales.tmp1 belongs to a dropped table in the recycle bin, and the catalog does not rename onto it; undrop that table, purge it, or choose another name. Nothing was renamed.* |
| The new schema has more than one level | *the table carries classifications and its new namespace has more than one level, where egret cannot keep them; use a single-level schema* |
| Another rename of the same name is being held | *another change to this table or its new name is being held; retry when it has finished (at most 90 s)* |
| egret is already holding 8 renames | *egret is holding 8 classified table changes already, its maximum; retry in a minute* |

The compile and recycle-bin refusals come at once. The engine refusal comes after 90 seconds. Run from SQL Lab, the rename stops earlier, at SQL Lab's 60-second query limit, and shows a timeout instead of egret's reason; egret still refuses it and removes the copy (KI-310). A hold that succeeds after more than 60 seconds shows the same timeout in SQL Lab, but the rename went through: check **Recent changes** or list the tables (KI-318).

### Drop a table or a namespace

- **Drop a table:** the classifications stay on its name. Where used marks the table **Dropped**, and the Governance overview reports it as information. Undrop it from the catalog's **Recycle bin** and it is classified again. On StarRocks a view over it can show real values until the plugin's next poll (KI-305).
- **Drop a table, then create another one under its name:** if you rename the new table away, its classifications move with it and are also kept on the old name, because the dropped table may still be undropped.
- **Drop a namespace with everything in it** (a recursive drop): egret removes every classification under the namespace, on its tables and columns, and the classifications its views carried. Views in other schemas that read its tables lose the classifications they derived from them. **Recent changes** records, for example, *Catalog client engine-docs-trino removed 12 classification assignments with namespace sales (namespace dropped)*. On a catalog with soft delete (one with a **Recycle bin**), the catalog refuses a recursive drop unless it is also forced (*Cannot recursively delete namespace with soft-deletion without force flag*), so the classifications go only with a forced drop, and stay when nothing was dropped. Only a Catalog Client with a catalog-level **write** or **manage** grant may drop a namespace recursively, as an engine's client can; see [What each operation needs](../../control-plane/catalogs/catalog-detail.md#what-each-operation-needs).
- **Drop an empty namespace:** nothing changes. The catalog refuses to drop a namespace that still holds a table, dropped or not.

### Classifications left on an old name

A rename made before this version of egret left its classifications on the old name. They do not move by themselves. The Governance overview reports them (*classifications on tables that do not exist*, *classifications on columns that do not exist*), and the classification's **Where used** tab marks the table **Not in the catalog** or the column **Renamed to mail** (see [Classifications](./index.md#the-tag-page)). Attach the classification to the new name, then remove it from the old one. For a column, **Renamed to** is egret's suggestion from the table's schema history: confirm it before you re-attach.

### Replace a table by renaming

A common way to replace a table is to rename it away and rename a new table into its place: `orders` to `orders_old`, then `orders_new` to `orders`. The classifications follow the table they are on, so they move to `orders_old`, and the new `orders` carries none. The Governance overview reports this (*table names a rename left unclassified under a new table*) with a link to `orders_old`, whose classifications you can then attach to `orders`.

:::tip
Classify `orders_new` before you rename it to `orders`. Its classifications then follow it into place, and the table name is never unclassified.
:::

### What else a rename carries

Grants, masks and row filters written on the table's path follow a rename too, by their own rules: restrictions are copied to the new name and also stay on the old one, allow grants move, and catalog grants move. A restriction written with a pattern the new name escapes, or a hand-written Ranger policy that names the table, can refuse the rename. See [Renames and drops](../data/grants.md#renames-and-drops) on the Grants page.

These do not follow a rename:

- view definitions, datasets, charts and Data API SQL that name the old table: they fail until you change them;
- grants, rules and catalog grants on a renamed **view** (KI-319).

**Recent changes** names the engine's catalog client as the one who moved the classifications, for example *Catalog client engine-docs-trino*, not the person whose query renamed the table: an engine reaches the catalog with its own client.

## Examples

- **Mask every personal column**: tag the columns *Personal data (PII)*, add one mask rule by that tag with type **Hash**, exempt the `data-stewards` group (the demo setup).
- **Restrict reads**: add a [clearance](./clearance.md) to *Confidential* so only the `data_steward` role can read objects carrying it (the demo setup on `finance.invoices`).

## Limits and known issues

- The tag page counts tagged BI objects only; data tags are visible on the Data page.
- A mask by tag on a column type the mask cannot apply to returns an engine error rather than a masked value.
- On Trino, a row filter by a classification that is only on columns filters nothing (KI-287).
- A classified rename is held for up to 90 seconds, and a silent bound engine makes it fail (KI-310). Run from SQL Lab, a hold longer than 60 seconds shows a timeout although the rename went through (KI-318).
- Adding a classification with a clearance to a table that is not in the catalog yet does not say that a StarRocks view over it is unprotected until the table exists; **Who can read?** does (KI-307).

## Further reading

- [Clearance](./clearance.md)
- [Masks and row filters](../data/masks-and-filters.md)
- [Explain access](../data/explain-access.md)
