---
sidebar_position: 1
---

# Governance overview

**Governance → Overview** is the landing page of the Governance area. It answers two questions: what needs attention in the way data access is set up, and what changed recently.

The page needs the **policy:read** or **tag:read** permission. Platform admins have both. A person who holds only some of the permissions sees only the checks and counts those permissions allow.

## The header counts

The strip under the title counts four things:

| Count | What it counts |
|---|---|
| **catalogs** | Catalogs registered in the platform, whether egret manages them or not. |
| **egret grants** | Grants written in the permission model (see [Grants](./data/grants.md)). Grants created by workspace assignment are included. |
| **egret rules** | Mask and row-filter rules (see [Masks and row filters](./data/masks-and-filters.md)). |
| **classifications** | Classification tags (see [Classifications](./classifications/index.md)). |

A count you are not allowed to read is returned as "no value" by the API, never as `0`.

## Needs attention

**Needs attention** lists findings from a fixed set of checks. Each finding has a severity (**Critical**, **Warning** or **Info**), a one-sentence description, a count and, when it helps, an **Open** link to the object concerned. A finding keeps the true total even when the list shows only a handful of examples. The list is sorted by severity, then by kind.

The checks the server runs are:

| Check | What it looks for |
|---|---|
| Unresolved principal references | A grant or rule exemption names a user, group or role egret does not know, so it cannot match anyone (see [Unmatched names](./people-and-groups/index.md)). |
| Engine usernames reused after a delete | A grant, rule, engine permission or policy names a username that was written for someone other than the person who holds it now, or an `egret-admin` policy still names someone who is no longer an active platform admin. **Critical** when a finding is definite, otherwise **Warning**. Platform admins only; **Open** goes to [Reused names](./people-and-groups/index.md#reused-names). |
| Plugin silent, behind or quiet | An engine's Ranger plugin has not downloaded the policy profile, downloaded an older version of it, or has been quiet for longer than expected. |
| Profile compile failed | The last compile of a policy profile failed. Engines keep the previous compile. When the refusal names rules, for example the two rules of a new tie, the sentence ends *The refusal names rules A and B.* and each rule is listed among the examples with a link to its page. |
| Engine failed | A provisioned engine reports a failed status. |
| Rule overlaps | Two mask or row-filter rules decide the same column or table with the same priority (see [Policies and overlaps](./engines-and-policy/policies-and-overlaps.md)). |
| View lineage failed | The view lineage that drives view exposure could not be read. |
| Catalog attachments failed | A catalog could not be applied to an engine it is attached to. |
| Policy warnings | Hand-written policies carry things egret warns about. |
| Plugin version not modelled | An engine runs a Ranger plugin version egret cannot prove migrations or explanations for. |
| Classifications without clearance | Tags that gate nothing (**Info**). |
| Classifications on tables that do not exist | A table carries classifications, but its catalog has no table of that name: it was renamed before egret moved classifications, purged, or classified before it was created (**Warning**). |
| Classifications on dropped tables | A dropped table, in its catalog's **Recycle bin**, keeps its classifications (**Info**). |
| Classifications on columns that do not exist | A classified column is not in its live table, with egret's guess at its new name when the table's schema history has one (**Warning**). |
| Table names a rename left unclassified under a new table | A table was renamed and took its classifications with it, and a new table now holds its old name without them (**Warning**). |
| Permissions on tables that do not exist | A grant, mask rule or row-filter rule written on a plain table name, or an enabled hand-written policy that names a table literally, names a table its catalog does not have: restrictions a rename kept on the old name on purpose, rows left by a rename before this version or by a purge, or rows written before the table was created (**Warning**, **policy:read**). A dropped table is not reported. |
| Permissions on columns that do not exist | A grant or rule on a plain column name of a live table names a column the table does not have, with egret's guess at its new name when the table's schema history has one (**Warning**, **policy:read**). |
| Catalog grants on tables that do not exist | A catalog grant on a table, under **Roles & grants** of a catalog, names a table the catalog does not have (**Warning**, **catalog_registry:read**). |
| Table names a rename left without their allow grants | A table was renamed and its allow grants moved with it, and a new table now holds its old name without all of them (**Warning**, **policy:read**). |
| Table names a rename left without their catalog grants | The same for catalog grants (**Warning**, **catalog_registry:read**). |
| Catalogs attached to no engine | No engine serves the catalog (**Info**). |

On the demo stack, with the engine `docs-trino` serving `demo_warehouse`, the list held one finding:

- **Info**: *3 classifications have no clearance: they gate nothing.*, listing the tags.

The reused-username finding states each verdict separately, for example *2 references or policies were written for a username before the person who holds it now existed. 1 more may have been. 1 egret-admin policy still gives engine ALL access to someone who is no longer an active platform admin.* Its examples name the username and the place, never an email. Names that match nobody (dead names on **Reused names**) do not raise it; such a name in a grant or rule exemption is reported as an unresolved principal reference when it widens access.

The four classification checks compare the classifications on tables and columns of egret's catalogs with what the catalogs hold now. Each example links to the classification, except the last check's, which opens the renamed table's Data page. They read:

| Check | Sentence | Example |
|---|---|---|
| Tables that do not exist | *1 table carries classifications but does not exist in its catalog: renamed before egret moved classifications, purged, or classified before it was created.* | `demo_warehouse.sales.ghost`, *tm-pii* |
| Dropped tables | *1 dropped table keeps its classifications, which apply again if it is restored.* | `demo_warehouse.sales.orders_v2`, *tm-email, tm-pii* |
| Columns that do not exist | *1 classified column is not in its table: it was renamed (egret names the new column).* With several: *4 classified columns are not in their table: 3 were renamed (egret names the new column), 1 was dropped or never existed.* | `demo_warehouse.sales.orders_v2.region`, *renamed to area* |
| Names a rename left unclassified | *1 table name lost its classifications when its table was renamed, and a new table now holds the name without them: check whether it needs the classifications of the renamed table.* | `demo_warehouse.sales.t`, *tm-pii moved to demo_warehouse.sales.t_old by a rename* |

The last one is the swap pattern: `t` renamed to `t_old`, then `t_new` renamed to `t`. The classifications followed the table to `t_old`. Attach them to the new `t` if it needs them. See [Renames and drops](./classifications/tagging.md#renames-and-drops).

The five permission checks do the same for grants, rules, hand-written policies and catalog grants. Their **Open** link goes to the Data page, or to **Control plane → Catalogs** for the two catalog-grant checks; each example links to the grant, the rule, the profile of a hand-written policy, the catalog, or the renamed table's Data page. They read:

| Check | Sentence | Example |
|---|---|---|
| Permissions on tables that do not exist | *1 table name carries grants, rules or hand-written policies but has no table: left by a rename (egret keeps restrictions on the old name on purpose), a purge, or written before the table existed. A table created under that name is governed by them.* | `demo_warehouse.sales.orders`, *deny grant, mask rule pii-email; kept when the table was renamed to sales.orders_v2* |
| Permissions on columns that do not exist | *1 grant or rule names a column that is not in its table: it was renamed (egret names the new column).* With several, as for classifications: *… 1 was renamed (egret names the new column), 1 was dropped or never existed.* | `demo_warehouse.sales.orders_v2.email`, *renamed to mail* |
| Catalog grants on tables that do not exist | *1 catalog grant names a table that does not exist: it covers nothing until a table takes the name.* | `demo_warehouse.sales.orders`, *role analysts, read* |
| Names a rename left without allow grants | *1 table name lost its allow grants when its table was renamed, and a new table now holds the name without them: check whether it needs the allow grants of the renamed table.* | `demo_warehouse.sales.orders_v2`, *2 allow grants moved to demo_warehouse.sales.archive by a rename* |
| Names a rename left without catalog grants | The same sentence with *catalog grants*. | `demo_warehouse.sales.orders_v2`, *role analysts, read moved to sales.archive by a rename* |

A rename keeps a table's deny grants, masks and row filters on the old name on purpose, so the first check also lists those: delete them when the old name no longer needs protecting. A column rename keeps a restriction on both columns, so the second check shows it only once the old column name is gone from the table. The last two are the swap pattern for access: give the new table the grants it needs, or grant `t_new` before you rename it. See [Renames and drops](./data/grants.md#renames-and-drops).

Before an engine serves a catalog, the finding is that the catalog is attached to no engine. When everything is in order the list reads *Nothing needs attention.*

A **Not checked here** line names what the page does not check: views that may expose classified data through `DEFINER`, and classification coverage. It appears for platform admins too. Those two are covered on the [View exposure](./classifications/view-exposure.md) page. When your permissions do not allow one of the checks above, it is added to that line; for someone who is not a platform admin it names *engine usernames reused after a delete*.

:::note
Each check needs its own permissions: engine drift checks need **policy:read** and **engine:read**, the catalog attachment check needs **catalog_registry:read**, and so on. A check you cannot run is listed as not checked, not silently dropped.
:::

## Recent changes

**Recent changes** lists governance changes as they are recorded, newest first, with the columns **When**, **Who** and **What**, and a **View** link that opens the object concerned. The text describes each change in a sentence, for example *Administrator created a grant: allow read on demo_warehouse.finance to group finance-analysts, group data-team*, *Administrator set the clearance of classification Confidential: roles data_steward; groups none*, *Administrator created an engine grant: trino.set_system_session_property (query_max_run_time) on engine docs-trino to user member-sso* or *Administrator migrated legacy: analysts read finance_pg of profile docs-legacy-trino into egret grants and rules*. A classified rename or a recursive namespace drop in an egret catalog reads *Catalog client engine-docs-trino moved classifications PII and Finance from sales.orders to sales.orders_v2 (table renamed)*, *… from sales.orders_v2.email to sales.orders_v2.mail (column renamed)* or *Catalog client engine-docs-trino removed 12 classification assignments with namespace sales (namespace dropped)*. These are the audit actions `tag:move` and `tag:purge`; a move links to the renamed table, a purge has no link. The link column reads **View**, or *(deleted)* when the object no longer exists.

A rename also records what it did to grants, rules and hand-written policies (see [Renames and drops](./data/grants.md#renames-and-drops)):

| Audit action | Sentence | Links to |
|---|---|---|
| `perm_grant:move` | *Catalog client engine-docs-trino moved allow grant (read) from sales.orders to sales.orders_v2 (table renamed)*, or *(column renamed)* | The grant |
| `perm_grant:copy` | *Catalog client engine-docs-trino copied deny grant (read) from sales.orders to sales.orders_v2; the original stays on sales.orders (table renamed)* | The copy |
| `perm_rule:copy` | *Catalog client engine-docs-trino copied mask rule pii-email from sales.orders.email to sales.orders_v2.email as pii-email (sales.orders_v2); the original stays on sales.orders.email (table renamed)* | The copy |
| `perm_grant:left` | *Catalog client engine-docs-trino renamed sales.tmp_a to sales.a; allow grant on sales.tmp_\* no longer covers it* | The grant |
| `ranger_policy:left` | *Catalog client engine-docs-trino renamed sales.orders to sales.orders_v2; hand-written policy lake-trino/orders-read still names sales.orders* | The profile |
| `perm_grant:delete` after a recursive drop | *Catalog client engine-docs-trino deleted a grant: allow read on demo_warehouse.sales.orders to user reader-u (namespace dropped)* | Nothing: the link column reads *(deleted)* |

A reader who also holds **catalog_registry:read** sees catalog grants that renames and recursive drops changed, as *Catalog client engine-docs-trino moved catalog grant read of role analysts from sales.orders to sales.orders_v2 (table renamed)* (with *, merged with the same grant there* when the role already held it on the new name) and *… removed catalog grant read of role analysts on sales.orders (namespace dropped)*. These are `catalog_grant:move` and `catalog_grant:delete`, and link to the catalog in **Control plane → Catalogs**. Adding or deleting a catalog grant by hand is not recorded here.

A reader who also holds **user:read** sees user deletes too, as *Administrator deleted user alice* (the username, or the email when the user had none), with no link. Without **user:read** these rows are left out, because they carry the deleted person's email.

The list is paged: use the button at the bottom to load older changes. Under the list a note says *The oldest change you can see is from \<date\>*, and that changes older than 90 days are pruned. A second note warns that role assignments and catalog tags are recorded after they commit and can be missing if the audit writer was overloaded. Recording began when this version of egret was installed, so a fresh instance shows *No governance change has been recorded yet*.

A change made by an administrator acting as another user is shown as "Admin as User". A change by a deleted user is shown as *A deleted user*, and a change made by the platform itself, for example a recompile, as *egret*. A change made through egret's Iceberg catalog, a classification, grant, rule or catalog grant moved or copied by a rename or removed by a namespace drop, shows the catalog client that made it in **Who**, as *Catalog client engine-docs-trino*, or *Catalog client \<client id\> (deleted)* for a client deleted since. For a rename run on an engine this is the engine's client, not the person who ran the query.

![The Governance overview on the demo stack: one finding (three classifications without clearance) and the most recent governance changes](/img/platform/admin/gov-overview.png)

## The Governance sidebar

The sidebar has one group, **Governance**, with six items. Each item shows only to a reader with the permission its page needs.

| Item | Use it to | Needs |
|---|---|---|
| **Overview** | See posture and recent changes (this page). | `policy:read` or `tag:read` |
| **Data** | Browse catalogs and see who can read an object. See [Data](./data/index.md). | `policy:read` or `tag:read` |
| **People & groups** | See what reaches each person, group or role. See [People & groups](./people-and-groups/index.md). | `policy:read` |
| **Classifications** | Define tags and clearances. See [Classifications](./classifications/index.md). | `tag:read` |
| **Data Lineage** | A placeholder. See [Lineage](./lineage.md). | Platform admin |
| **Engine & policy** | Bind policy profiles to engines and manage engine permissions. See [Engines and policy](./engines-and-policy/index.md). | `policy:read` |

If you are new to the area, read [How permissions work](./concepts.md) first.

## Further reading

- [How permissions work](./concepts.md)
- [Control plane audit log](../control-plane/audit-log.md)
