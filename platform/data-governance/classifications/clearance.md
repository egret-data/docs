---
sidebar_position: 1
---

# Clearance

A **clearance** makes a classification tag a gate. Once a tag has a clearance, only principals who hold one of the required roles, or belong to one of the required groups, can open objects carrying the tag. A tag with no clearance only labels; it restricts nobody.

![The Clearance tab of Confidential with the role data_steward required, and the warnings egret shows](/img/platform/admin/gov-tag-clearance.png)

## Add a clearance

1. Open **Governance → Classifications** and select the tag.
2. Open the **Clearance** tab and choose the type: **Role** or **Group**.
3. Search and pick the role or group (*Select a role…*, or *Search groups…*).
4. Press **Add**. The tag's header now shows a **Clearance** badge with a lock, and the list's **Clearance** column counts the requirement (*1 role*). The page adds the warnings described below.

Add several rows to require "any of these". To lift the gate, remove all rows. The toast says *Clearance cleared*, and the section reads *Not gated — anyone can open objects with this tag.*

The table lists each requirement with its **Type** and **Name** and a remove button.

## How a clearance is enforced

A clearance is enforced in two places, which behave differently:

| Where | Roles | Groups |
|---|---|---|
| **On object access** in the platform (opening an object that carries the tag) | Enforced. | Enforced. |
| **In the query engine** (SQL Lab, notebooks, any client) | Enforced: the role's holders are written into a deny policy by username. | **Not enforced.** |

Egret serves the engine no group names (no group provider, no usersync), and a role name does not reach it either, so only the **enumerated usernames of a required role's members** do. When a group is among the requirements the page shows:

:::warning
Not enforced in the engine: no group provider or usersync means a group name never reaches Trino or StarRocks, and a role name does not either — only a required role's enumerated members do. A group requirement is enforced on object access only; opening the object is gated, but reading the same data through SQL Lab or a notebook is not.
:::

If a clearance names only groups, egret saves it but warns *Clearance saved but not enforced in any engine*.

### On columns or on a whole table

A clearance applies wherever the classification is: on the columns that carry it, or on every column of a table that carries it on the table itself. When the clearance requires a role, the Clearance tab says what it compiles to: *Compiles to one deny tag policy in each Trino profile's tag service. On StarRocks it compiles to a select deny and a NULL mask per tagged column, or, on a whole table, one select deny on the table and a NULL mask per column. StarRocks does not access-check a masked column, so an uncleared reader reads NULL in a classified column rather than being refused, unless the classification is on the whole table.*

What an uncleared reader who holds a grant on the table gets:

| Classification is on | Trino | StarRocks |
|---|---|---|
| A column | Refused on a read of the column. | NULL in the column, directly and through a view. |
| The whole table | Refused on a read of any column. | Refused on every direct read of the table, `SELECT *` and `count(*)` included. NULL in every column through a view. |

A cleared reader reads the table as the rules give it to them. **Who can read?** says, for each person on a StarRocks engine, *member-sso is **refused** `email` (clearance PII, on the whole table); through a view it reads NULL*. See [Explain access](../data/explain-access.md#clearance-on-starrocks).

On StarRocks the NULL masks need the table's columns, which egret reads from its catalog. So egret keeps them in step with the table:

- A change to the table's columns (add, drop or rename a column), and a create, rename, register or undrop of the table, recompiles the StarRocks profiles at once. The plugin applies the new masks at its next poll (KI-305).
- A change that would push a clearance over its ceiling is refused at the Iceberg commit with a 409 that names the table, for example *egret refused the table change: compiling the clearance on tag "PII" would expand to 501 policies on StarRocks, over the ceiling of 500: whole-table on demo_warehouse.sales.events (1 deny + 491 column masks) …*. The same check applies to a register and to an undrop from the **Recycle bin** (*egret refused the undrop: …*). A refused register is dropped again and stays in the Recycle bin (KI-306).
- For a table that is not in the catalog yet, only the select deny is compiled, and **Who can read?** says that a view over it is not protected until the table exists (KI-307). The masks are written when the table is created.

A rename or drop of the table does not move its classifications to the new name (KI-303).

## What a clearance does not do

- **Writes are not withheld.** Once gated, the page warns *This clearance withholds reads only, on Trino and on StarRocks alike: a user without it can still overwrite a column they cannot read.* Measured, an uncleared user inserted and deleted through a live clearance on Trino.
- **Views.** Trino views in egret's catalogs carry the classification, so a user without clearance is refused through them. On StarRocks, a reader who holds the grant reads NULL through a plain or nested view, and an INVOKER view is refused. Existing StarRocks materialized views, and views of other connectors, are not covered. On Trino an uncleared owner's DEFINER view blocks everybody, the cleared included. See [View exposure](./view-exposure.md).
- **Materialized views.** With a role clearance, users not cleared for every classification on an engine cannot create any materialized view on that engine, even over unclassified data.

## Roles held through a group do not count in the engine

A person who holds the required role only through a group is *Not cleared* in the engine: *the required role is held through a group, and engines count only roles held directly*. Give the role to the user directly. An expired role assignment is *Not cleared* too, though engines may apply it until the next recompile. Each person's clearances are listed on their [People & groups](../people-and-groups/index.md#clearances) page.

## A StarRocks limit

A StarRocks clearance expands, per profile, to one policy per tagged column, and to 1 plus the column count for each table that carries the classification as a whole. Above 500 for one clearance, or above 1,000 policies for the whole profile, egret refuses the write that would cause it rather than truncating the clearance: adding the classification, a rule or clearance write, a role membership change or a table change. The Clearance tab says: *A StarRocks clearance expands, per profile, to one policy per tagged column, and 1 plus the table's column count for a classification on a whole table: if that comes to more than 500 for one StarRocks profile, the write that would cause it is refused (a classification, rule or table change), rather than truncating the clearance. Profiles that see fewer are unaffected.*

The refusal names up to five of the largest whole-table tables with their column counts and ends with *Attach PII to fewer tables, or to columns*. The API answers it as a 409 with the code `expansion_ceiling` (a catalog's workspace assignment answers a 409 with the same sentence and no code).

## What the engine does

On the demo stack the tag *Confidential* is on the table `demo_warehouse.finance.invoices`, and its clearance requires the role `data_steward`. `member-sso` has a grant to read the schema `finance`, but `SELECT count(*) FROM demo_warehouse.finance.invoices` answers *Access Denied: Cannot select from columns [] in table or view invoices*. The platform admin gets the same answer: platform admins are not exempt from a clearance unless they hold the role directly. Farid Haddad, who holds `data_steward` directly, is listed as cleared.

## Check who is cleared

- The tag page's **Clearance** table lists what is required.
- A person's **Clearances** tab shows *Cleared* or *Not cleared*, with the reason, for each gated tag.
- The Governance overview raises an **Info** finding for classifications with no clearance: *N classifications have no clearance: they gate nothing.*

## Further reading

- [Classifications](./index.md)
- [View exposure](./view-exposure.md)
- [How permissions work](../concepts.md)
