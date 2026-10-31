---
sidebar_position: 1
---

# Grants

A **grant** says who can read or write which part of a catalog. Grants are the main way you give people access to data in the query engines. You create them on the **Permissions** tab of the Data page, from a person's page, or from the grant dialog's **Grant access** button.

![The Permissions tab of the sessions table: the grant to member-sso here, and two inherited catalog grants (the workspace assignment of Default and the role data_steward)](/img/platform/admin/gov-table-permissions.png)

## Anatomy of a grant

| Part | Meaning |
|---|---|
| **Effect** | **Allow** or **Deny**. A deny grant is marked with a **Deny** badge in lists. |
| **Actions** | **Read**, **Write**, or both. Ranger has no "write": egret evaluates it as insert and delete on Trino, and as insert, update and delete on StarRocks. |
| **Scope** | A catalog, narrowed to a schema, a table and a column. Each narrower level is optional. |
| **Principals** | Who the grant is for: **Include** (users, groups or roles) and **Exclude** (principals removed from the include set). |

Grants are written as sentences in lists, for example `user member-sso can read demo_warehouse.analytics.sessions`. A level whose value is a pattern (`*`, `ord*`, `order?`) is quoted in the sentence, and the engine matches it as a glob.

## Read the Permissions tab

The tab opens with the sentence *Lists egret grants. Hand-written and egret-seeded engine policies are not listed here; Who can read? gives the engines' answer.* It groups grants by how they reach the object:

| Group | What it holds |
|---|---|
| **Here** | Grants whose scope is exactly this object. |
| **Inherited** | Grants on a parent: the schema, or the catalog. The **From** column says which (**Catalog**, **Schema**). |
| **Matching a pattern** | Grants whose scope contains a pattern. They name every value they match, so they are never listed as **Here**. The **Pattern** column shows the value. |

Grants set by a workspace assignment appear under **Inherited** with the label *Set by workspace assignment · Default*. They cannot be edited here; change the catalog's workspace assignment in the Control Plane instead.

Each row has **Open**, which opens the [grant's own page](#the-single-grant-page) and is there for every reader, and **Edit** and **Delete**, which need the **policy:update** permission (without it the page says so). Below a 1024 px wide window the three show only their icons, so the pinned column does not cover the row.

## Create a grant

1. Open **Governance → Data** and select the table, for example `demo_warehouse.analytics.sessions`.
2. Press **Grant access**. The dialog opens as **New grant** with the catalog, schema and table already filled in.
3. Leave **Effect** as **Allow**. Under **Actions**, keep **Read** ticked.
4. Under **Principals → Include**, choose a kind (**user**, **group** or **role**), then search.
5. A user who already has an engine username is added by selecting the match. For a user who has none yet, the match shows **Allocate username and add**: press it. Confirm **Allocate and add** in the dialog *Allocate a username to Member SSO?* Egret reports *Member SSO was allocated a username and added, stored as member-sso.* The username is kept even if you close the form without saving.
6. Press **Preview**. The dialog scrolls to the preview, so its result and **Create** are both on screen. The preview names the profiles that would be recompiled, for example `docs-trino`, and how many policies would be created, updated, deleted or left unchanged.
7. Press **Create**. You see *Grant created.*

![The New grant dialog after a preview: read and write on demo_warehouse.analytics.sessions for alice-nguyen, which would recompile docs-trino](/img/platform/admin/gov-grant-dialog.png)

### Check the grant in SQL Lab

The engine applies the grant at its next policy download (the plugin polls every 30 seconds). On the demo stack, after this grant `member-sso` read `demo_warehouse.analytics.sessions` through the engine `docs-trino`, and a table with no grant for her answered *Access Denied: Cannot select from columns [] in table or view customers*.

### The dialog fields

| Field | Notes |
|---|---|
| **Effect** | **Allow** or **Deny**. Default **Allow**. |
| **Actions** | **Read** and **Write** check boxes. Default **Read**. At least one is required: *Choose at least one action.* |
| **Scope → Catalog** | A dropdown of registered catalogs. Required: *Choose a catalog.* |
| **Scope → Schema** | Free text, for example `sales`. Disabled until a catalog is chosen. |
| **Scope → Table** | Free text, for example `orders`. Disabled until a schema is entered. |
| **Scope → Column** | Free text, for example `ssn`. Disabled until a table is entered. |
| **Principals → Include** | Users, groups and roles. A role is typed by name (**Role name**) and added with **Add**. At least one is required: *Include at least one principal — a grant that includes nobody would compile to nothing.* |
| **Principals → Exclude** | Principals removed from the grant, same pickers. |

### Preview before you save

**Create** (or **Save changes** when editing) stays disabled until you have run **Preview** on the current form. Changing anything afterwards marks the preview stale (*The form changed since that preview — run it again before saving.*). The preview runs the real write in a transaction that is rolled back, so it reports the same compile result and the same errors the save would. Anything the compiler skipped is listed with its reason.

If saving fails, the server's message is shown verbatim at the top of the dialog; it names the rule, profile or ceiling that refused it.

## Edit and delete a grant

Press **Edit** on a row to reopen the dialog as **Edit grant**; the button is **Save changes**. The edit replaces the whole grant and keeps its id. Press **Delete** to remove it. The confirmation says *This grant is permanently removed and every profile it reaches recompiles.* A pattern grant states how far it reaches, for example *every table matching "ord*"*.

## The single grant page

Every grant has its own page at `/governance/grants/<id>`, reached from **Open** on a row of the Data page's **Permissions** tab and from links in explain results, the overlap report and the People pages. Opened from the Data page, its back link returns there (*Back to tiny* for the `tiny` schema). It shows the grant's **Effect**, **Actions**, **Scope**, **Principals** and **Except** set, with **Edit** and **Delete**. A workspace-assignment grant shows *The workspace assignment sync writes this grant; change the workspace's catalog assignment to change it.* A deleted id shows *No grant has this id; it may have been deleted.*

## Principals and what reaches the engine

Users are written to the engine by **username**. Groups and roles are expanded to their current members' usernames when the grant is compiled, because engines do not receive group or role names. Membership changes recompile at the next compile, not instantly. See [How permissions work](../concepts.md#what-does-not-reach-the-engine).

:::warning
A grant on a catalog that no engine serves compiles into a profile no engine downloads. Check the **Engines** line of the object header: *No engine attached* means the grant is stored but enforced nowhere.
:::

## Renames and drops

Grants and rules are stored on the names they cover. When a table or column is renamed through egret's Iceberg catalog, the catalog Trino, StarRocks, Spark and PyIceberg use for an egret warehouse, egret carries them to the new name. A restriction never leaves a name, and access follows the table.

### What a rename carries

For `ALTER TABLE sales.orders RENAME TO sales.orders_v2`:

| What names `sales.orders` | What happens |
|---|---|
| A **Deny** grant, a mask rule or a row-filter rule written on the table's path or on one of its columns | Copied to `sales.orders_v2` before the catalog commits the rename. The original stays on `sales.orders`, dormant, so a table created later under the old name, or renamed into it, is still restricted. A copied rule is named after the original and the new table, for example *pii-email (sales.orders_v2)*, with *#2*, *#3* … when that name is taken. |
| An **Allow** grant on the table's path or one of its columns | Moved to `sales.orders_v2` after the commit. It keeps its id, so its page and its history stay. |
| A catalog grant on the table under **Control plane → Catalogs → \<catalog\> → Roles & grants** | Moved to the new name after the commit. See [Catalog detail](../../control-plane/catalogs/catalog-detail.md#roles--grants-warehouse). |
| A classification | Moved. See [Renames and drops](../classifications/tagging.md#renames-and-drops). |

Only grants and rules whose schema and table are plain names follow the table. A grant or rule written with a pattern (`ord*`, `order?`, `*`) is a statement about names, so it stays as written; see [When a rename is refused](#when-a-rename-is-refused). Grants a workspace assignment writes cover the whole catalog and need nothing. A copy is skipped when the new name already carries the same restriction, so renaming back and forth does not stack copies.

A column rename, for example `ALTER TABLE sales.orders_v2 RENAME COLUMN email TO mail`, works the same way one level down: a deny grant or a mask on `email` is copied to `mail` and stays on `email`, and an allow grant on `email` moves to `mail`. egret pairs columns by their Iceberg field id. Row filters name no column and are not affected. An expression that names the renamed column, in a row filter or a custom mask, is not rewritten (KI-321).

A rename that changes only upper and lower case carries nothing: engines match names case-insensitively, so the grants already cover the new spelling.

### The hold

When a rename copies a restriction, egret holds it before the catalog commits it, as it does for a classified table:

1. It copies the deny grants, masks and row filters to the new name and recompiles the Trino and StarRocks profiles bound to the catalog.
2. It waits until every Trino and StarRocks plugin bound to the catalog serves the new policy version.
3. It lets the catalog rename the table.
4. It moves the allow grants and the catalog grants to the new name, recompiles, and records each change in **Recent changes** on the [Governance overview](../overview.md#recent-changes).

The renamed table is therefore restricted from its first read under the new name, on both engines. The client waits meanwhile: 54 to 57 seconds were measured with Trino and StarRocks bound and the default 30-second poll, and the limit is 90 seconds (KI-310). A rename that carries only allow grants is held for milliseconds and waits for no engine, and a rename that carries only catalog grants is not held.

Allow grants move after the commit, so a person who reads the table through an allow grant can be refused on the new name until the engines' next policy poll applies the moved grant, up to about two polls (KI-317). Restrictions apply from the first read; only access is late.

While a rename is held, a grant or rule that names either table literally cannot be created, changed or deleted. The write is refused with a 409 and the code `table_change_held`: *a change to sales.orders (a rename, or a view commit) is being held while the engines confirm it; retry when it has finished (at most 90 s)*.

### When a rename is refused

A refused rename answers the Iceberg client with a 409 whose message starts *egret refused the table change:* and ends *Nothing was renamed.* The table keeps its name. Trino prints the message as the query error.

| Cause | The message continues |
|---|---|
| A deny grant, mask or row filter covers the old name through a pattern, or through a schema when the table moves to another schema, and does not cover the new name | *1 restriction covers sales.orders through a name pattern and would not cover sales.archive: deny grant 7c1e… (sales.ord\*) — sales.archive lacks a deny of read for group:contractors. egret does not rewrite patterns: add it for the new name, change the patterns, or choose a name they cover.* Up to ten restrictions are listed. |
| A hand-written Ranger policy names the table literally with a deny, a mask, a row filter or an exclusion list | *hand-written Ranger policies name sales.orders with a deny, mask, row filter or exclusion list: lake-trino/orders-mask (412); egret does not rewrite hand-written policies: edit or migrate them first.* See [Hand-written policies](../engines-and-policy/policy-editor.md). |
| A restriction would follow the table into a namespace of more than one level | *sales.orders carries restrictions that cannot follow it into corp.fin.orders, whose namespace has more than one level, which no grant or rule can name: …; use a single-level schema* |
| The copies cannot be compiled on the new name, for example a ceiling, or a copied mask that collides with a different mask already on the new name | *the table's permissions cannot move to sales.orders_v2: \<the compiler's reason\>.* For a classified table the message says *classifications*. |
| A bound engine did not confirm within 90 seconds, for example it is stopped | *engines did not confirm the copied restrictions within 90 s: \<plugin ids\>; check that the engines are running and polling egret's Ranger endpoint, then retry.* egret removes the copies. |

A pattern restriction does not refuse the rename when the new name is already covered by a restriction of the same kind and at least the same effect, written with a plain name or with another pattern:

- a deny grant: the same or more actions, for the same or more principals, with no more exclusions;
- a mask: on the same column, with the same mask type and the same expression, exempting no more principals;
- a row filter: the same filter expression, exempting no more principals.

Expressions are compared as written, and principals as stored: a deny on a group does not cover a deny on one of its members. egret does not write the cover for you. Add the restriction on the new name first, then rename.

A pattern **allow** grant that stops covering the table, and a hand-written policy that allows the table by its literal name, do not refuse the rename. The table loses that access, and **Recent changes** records it, for example *Catalog client engine-docs-trino renamed sales.tmp_a to sales.a; allow grant on sales.tmp_\* no longer covers it*. A hand-written policy that names the table only through a pattern is not checked (KI-320).

The rename's other refusals, a held name, the cap of 8 holds and a name in the **Recycle bin**, are listed under [When a rename is refused](../classifications/tagging.md#when-a-rename-is-refused) for classifications.

### Drop a table or a namespace

- **Drop a table:** its grants and rules stay on its name, and an undrop from the catalog's **Recycle bin** finds them in place.
- **Drop a namespace with everything in it** (a recursive drop of a single-level namespace): egret deletes the allow grants written on the namespace's tables and their columns by plain name, and the catalog grants on tables in the namespace and in its child namespaces. **Recent changes** records each, for example *Catalog client engine-docs-trino deleted a grant: allow read on demo_warehouse.sales.orders to user reader-u (namespace dropped)*. Deny grants, masks, row filters, grants on the schema itself or by pattern, catalog grants on the namespace and hand-written policies stay, so a namespace re-created under the same name is still restricted.

### Permissions left on old names

The restrictions a rename leaves on the old name are dormant until a table takes that name. They count towards the profile's policy ceiling, and the Governance overview lists them under *permissions on tables that do not exist*, with the table they were copied to. Remove them when you no longer need the old name protected.

A rename made before this version of egret left grants, rules and catalog grants on the old name. They do not move by themselves. The overview reports them (*permissions on tables that do not exist*, *permissions on columns that do not exist*, *catalog grants on tables that do not exist*). Write them on the new name, then delete the old ones.

### Replace a table by renaming

When you rename `orders` to `orders_old` and then `orders_new` to `orders`, the allow grants and catalog grants of the old table follow it to `orders_old`, and the new `orders` has only the allow grants written for it. The old table's restrictions stay on `orders` as well as on `orders_old`, so the new `orders` is restricted like the old one. The Governance overview reports a name that lost its allow grants this way (*table names a rename left without their allow grants*) or its catalog grants (*table names a rename left without their catalog grants*), with a link to the table they went to.

:::tip
Grant access to `orders_new` before you rename it to `orders`. Its grants then follow it into place.
:::

Views are not covered: a grant, rule or catalog grant on a view stays on the old name when the view is renamed (KI-319).

## Limits and known issues

- The grant dialog offers kinds **user**, **group** and **role** only. The fourth kind that exists internally (workspace members) is written by egret itself.
- A grant whose principals include nobody is refused, both by the form and by the API, so an edit can never silently revoke a grant.
- After a rename, a person who reads the table through an allow grant can be refused on the new name for up to about two policy polls, until the engines apply the moved grant (KI-317).
- A rename that copies a restriction is held for up to 90 seconds; run from SQL Lab, a hold longer than 60 seconds shows a timeout although the rename went through (KI-310, KI-318).
- Grants, rules and catalog grants on a **view** stay on the old name when the view is renamed (KI-319).

## Further reading

- [Masks and row filters](./masks-and-filters.md)
- [Explain access](./explain-access.md)
- [People & groups](../people-and-groups/index.md)
