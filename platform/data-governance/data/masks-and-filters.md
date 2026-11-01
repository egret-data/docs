---
sidebar_position: 2
---

# Masks and row filters

A **rule** changes what a person sees in a table without denying access to it. A **mask** replaces the values of a column (hash, redact, show the last four characters). A **row filter** hides the rows that do not match an expression. Rules apply to everyone except the principals you exempt, and they are enforced in the query engine.

![The Rules tab of the sessions table: a row filter, a Nullify mask on revenue and a Hash mask selected by the classification Personal data (PII)](/img/platform/admin/gov-table-masks.png)

Reading rules needs **policy:read**. Creating, editing and deleting them needs **policy:update**.

## Read the Masks & filters tab

The tab lists the rules that select the object you opened, in groups. A group appears only when it has rules.

| Group | Holds |
|---|---|
| **Here** | Rules whose path names exactly this object. |
| **Inherited** | Rules on a parent (catalog or schema), with a **From** column. |
| **On columns** | Rules on a column of this table, with a **Column** column. |
| **By tag** | Rules selected by a classification tag, with a **Tagged** column, for example *On column user_id*. |
| **Matching a pattern** | Rules whose path uses a pattern, with a **Pattern** column. |

Each row shows the rule **Name**, the path or tag it selects, its **Kind** (for example `mask · MASK_HASH` or `row filter · user_id IS NOT NULL`) and who is **Exempt**. A tag rule is listed on every tagged table, not on the catalog or schema pages; those say *Tag-based rules are listed on each table's page.* An empty tab says *No mask or row filter selects this table*.

## Create a rule

1. Open the table and select the **Masks & filters** tab.
2. Press **Add rule**. The dialog **New rule** opens with the path preset to this table.
3. Type a **Name**. A name is required: *Name the rule.*
4. Choose the **Kind**: **Filter rows** or **Mask a column**.
5. Fill the kind's field: **Filter expression** for a row filter, **Mask type** for a mask.
6. Choose what the rule **Applies to**: **Classification** or **Path**, and name the target.
7. Optionally add **Exempt** users and groups.
8. Press **Preview**, read the result, then press **Create**. You see *Rule created.*

![The New rule dialog for a mask: the Hash mask type on the session_id column, previewed](/img/platform/admin/gov-rule-dialog.png)

### Kind

| Option | What it does |
|---|---|
| **Mask a column** | Replaces the column's values for every non-exempt reader. |
| **Filter rows** | Keeps only rows for which the expression is true. |

With **Applies to** set to **Classification** and **Filter rows** chosen, a hint under **Kind** reads: *A row filter by classification filters every table that carries the classification, on the whole table or on any of its columns, on Trino and on StarRocks.* See [Row filters by classification](#row-filters-by-classification).

A new rule's suggested name follows **Kind** until you edit it: a name seeded as *Mask PII Data* becomes *Filter rows PII Data* when you switch to **Filter rows**.

### Mask type

The list is fixed and mirrors Ranger's own vocabulary:

| Mask type | Result |
|---|---|
| **Redact** | Characters are replaced by a fixed character. |
| **Partial mask: show last 4** | Only the last four characters stay visible. |
| **Partial mask: show first 4** | Only the first four characters stay visible. |
| **Hash** | The value is replaced by its hash. |
| **Nullify** | The value becomes NULL. |
| **Unmasked (retain original value)** | Explicitly leaves the value as it is. Use it with another rule to carve out an exception. |
| **Date: show only year** | A date keeps only its year. |
| **Custom** | You write the expression. A custom mask needs one: *A custom mask needs an expression.* Example: `cast(NULL as {type})`. |

### Filter expression

A SQL boolean expression over the table's columns, for example `region = 'us'` or `user_id IS NOT NULL`. Egret stores it as written and the engine evaluates it, so it must be valid in the engine's dialect.

### Applies to

| Option | Fields | Notes |
|---|---|---|
| **Path** | **Scope**: catalog (required), schema, table, and column for a mask. | A row filter by path needs catalog, schema and table together, and never a column; the dialog shows no column field and blocks saving until the three are set. A line below the fields reads *Applies to demo_warehouse.analytics.sessions*. |
| **Classification** | **Classification**: pick a classification. | The rule applies to every table or column carrying the tag. The tag is stored by its key, shown as *stored as personal-data-pii*. **Change** picks another. A tag rule is catalog-unscoped. |

### Exempt

The principals the rule does not apply to. The picker offers **user** and **group** only, and no **Exclude** list, because Ranger's mask and row-filter items cannot express a role or an exclusion. Egret refuses both at compile time.

### Preview this write

Like grants, a rule needs a current **Preview** before **Create**. For a tag rule the preview text warns: *A tag rule is catalog-unscoped, so this can recompile every Trino profile in the installation — see which, here, before committing.* A result reads, for example, *Would recompile docs-trino. created 1 · updated 0 · deleted 0 · unchanged 12*.

## Masks on StarRocks tables

A StarRocks table has two hidden columns, `_file` (the object-store path of each data file) and `_pos`. When a table has a
mask, egret refuses them to a reader who does not see the real value in every masked column of the table. That reader's
`SELECT *` on the table fails with error 5204 on `_file`. Name the columns you need, or read through a view over the table:
a view shows the masked values and no path. A reader who sees the real value in every masked column can still use
`SELECT *`.

A change to the masks takes effect on the next compile of the profile. To apply it at once, compile the profile with
`POST /api/control-plane/perm/compile/{profile_id}`.

## Row filters by classification

A row filter by classification filters every table that carries the classification, on the whole table or on any of its columns, on Trino and on StarRocks (since platform #818):

- **Trino**: a table that carries the classification on the table is filtered by the rule's tag policy. For each table where the classification is only on columns, egret also writes one row-filter policy on that table, named `perm-rule-<id>-<catalog>.<schema>.<table>`. A table is never filtered twice by one rule.
- **StarRocks**: one row-filter policy per table that carries the classification, at either level.

Attaching or removing the classification, and a rename the classification follows, recompile the Trino and StarRocks profiles, so the per-table policies follow the classification. These tables count toward the rule's expansion ceiling on both engines. An install upgraded from an earlier version recompiles the affected Trino profiles when the server starts.

The preview asks for no tick for this kind of rule. **Who can read?** names the rule that filters the table, for example *member-sso sees rows where region = 'us' (rule Filter rows PII P7)*.

:::note
On Trino, a table that carries classification A on a column and classification B on the whole table, each with a row-filter rule, is filtered by B's rule only: Ranger lets a tag policy decide before a resource policy of the same priority. **Who can read?** answers what Trino does.
:::

## Edit and delete

Rows have **Edit** and **Delete** buttons, labelled in words (below a 1024 px wide window, icons only). An edit replaces the whole rule, including **Exempt**: a field left out is cleared. Deleting shows *This rule is permanently removed and every profile it reaches recompiles.* A rule with a pattern states how far it reaches. Each rule also has a page, `/governance/rules/<id>`, showing its **Kind**, what it **Selects**, and who is **Exempt**.

## When two rules collide

Two mask or row-filter rules that select the same column or table at the same priority make the engine's decision ambiguous. Egret refuses to write a rule that creates such a pair as part of the same write, and reports older pairs on the profile's **Overlaps** tab. See [Policies and overlaps](../engines-and-policy/policies-and-overlaps.md).

## Verify a rule

Masks and filters are enforced by the engine. To check a rule for a person, open the column in **Governance → Data**, press **Who can read this column?** and explain the person, or a group to see every member (see [Explain access](./explain-access.md)). The answer says, per engine, what they read and why, for example *member-sso reads `user_id` as **hashed** (rule Hash personal data)*, or *(exempt from rule Hash personal data via group data-stewards)* for an exempt member, and which rows they see.

To confirm against the engine itself, query the table as a non-exempt user in SQL Lab, or compare the **Policies** tab of the engine, where each rule appears as a `Masking`, `Masking (by tag)` or `Row filter` policy compiled by egret.

On the demo stack the `sessions` table has three rules: the row filter *EU sessions only* (`country IN ('FRANCE', 'GERMANY', 'UNITED KINGDOM', 'ROMANIA', 'RUSSIA')`, exempt group `data-stewards`), the mask *Hide revenue outside finance* (**Nullify** on `revenue`, exempt group `finance-analysts`) and the tag rule *Hash personal data* (**Hash** on every column tagged *Personal data (PII)*, exempt group `data-stewards`). Queried through `docs-trino` as `member-sso`, who is in none of the exempt groups:

```sql
SELECT country, count(*) FROM demo_warehouse.analytics.sessions GROUP BY 1;
-- 5 rows: GERMANY 554, FRANCE 375, RUSSIA 484, UNITED KINGDOM 655, ROMANIA 655 (of 15 000 sessions)

SELECT session_id, user_id, revenue FROM demo_warehouse.analytics.sessions LIMIT 1;
-- 52486 | B25935C0F9C4BB9ABCFA13E4C15E56C16564B1390408CB5E24AC68140387D72C | NULL
```

The local platform admin `admin@egret.local` got the same masked values: platform admins have all access, but masks and row filters apply to everyone a rule does not exempt.

## Limits and known issues

- On a Trino profile without a tag service, tag rules compile to nothing. Egret refuses to bind such a profile to an engine.
- A mask on a column whose type the mask cannot apply to can return an error from the engine rather than a masked value.
- A rule that selects by path is copied to the new name when its table or column is renamed, and the original stays on the old name; a rule that selects by tag follows because classifications do. A rule that selects by a pattern the new name escapes refuses the rename. See [Renames and drops](./grants.md#renames-and-drops).
- A row filter or custom mask expression that names a renamed column is not rewritten (KI-321).

## Further reading

- [Grants](./grants.md)
- [Tag-based policy](../classifications/tagging.md)
- [Policies tab](../engines-and-policy/policies-and-overlaps.md)
