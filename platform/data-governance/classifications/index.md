---
sidebar_position: 5
---

# Classifications

**Governance → Classifications** defines the **tags** you use to classify data and BI objects, for example *Personal data (PII)* or *Finance*. A tag does three jobs: it labels an object, it can select the columns a mask or row filter applies to, and it can **gate** the objects that carry it behind a role or group.

![The Classifications list: four classifications with their keys, data and BI counts and clearance](/img/platform/admin/gov-classifications.png)

The page needs the **tag:read** permission. Creating, editing and deleting tags needs **tag:manage**, which the built-in `data_steward` role holds.

## The tag list

The header counts **classifications**, how many are **with clearance** and how many are **unused** (carried by nothing). **Search classifications** filters the table.

| Column | Meaning |
|---|---|
| **Name** | The tag name with its colour. Select it to open the tag page. |
| **Key** | The immutable identifier used in rules and policies, for example `personal-data-pii`. |
| **Description** | What the tag means, or a dash. |
| **Data** | How many tables and columns carry the tag, for example *0 tables · 4 columns*, or a dash. |
| **BI objects** | How many datasets, charts or dashboards carry the tag. |
| **Clearance** | *None*, or how many roles and groups gate the tag (for example *1 role* with a lock). |

The **⋯** menu on a row has **Delete**.

## Create a tag

1. Press **New classification**. The dialog says *A tag to classify tables, columns and BI objects with.*
2. Type a **Name**. It is required. The **Key** follows the name (for example `personal-data-pii`) until you edit it.
3. Optionally pick a **Color** and write a **Description**.
4. Edit the **Key** if you want a different one.
5. Press **Create classification**.

### Fields

| Field | Notes |
|---|---|
| **Name** | Required. Shown everywhere the tag appears. |
| **Color** | A color picker. The line beside it reads *Color of the swatch shown next to the name.* and gives the value, for example `#6366f1`. |
| **Key** | Required. *Fixed once created. Follows the name until you edit it. Lowercase letters, digits, -, _ and :.* |
| **Description** | Free text. |

## The tag page

Select a tag to open its page. The header shows the colour, name, key and description, a **Clearance** badge when a clearance is set, and **Edit** and **Delete**. **Edit** turns the header into a form for **Name**, **Color** and **Description** with **Save** and **Cancel**; *Key personal-data-pii is fixed once created.*

![The page of Personal data (PII), Where used tab: the tables and columns that carry it](/img/platform/admin/gov-tag-detail.png)

The page has five tabs:

| Tab | What it shows |
|---|---|
| **Where used** | **Data**: per schema, each table that carries the tag and on which columns (for example *customers — Columns: email, name, phone*), with a badge where the catalog no longer matches (see below). **BI**: the datasets, charts and dashboards that carry it. |
| **Clearance** | The roles and groups that gate objects carrying the tag. See [Clearance](./clearance.md). |
| **Rules** | The egret rules that select the tag, with **Rule**, **Kind**, **Reaches this tag** and **Exempt**. See [Tag-based policy](./tagging.md#rules-that-select-a-tag). |
| **Views** | Materialized views and Trino views that could read classified data. See [View exposure](./view-exposure.md). |
| **Manual policies** | The hand-written tag policies the engines apply to this classification's name. See [Manual policies](#manual-policies). |

![The Rules tab of Personal data (PII): the rule Hash personal data, exempting the group data-stewards](/img/platform/admin/gov-tag-rules.png)

### Badges in Where used

In a catalog egret manages, **Where used** compares each table and column that carries the tag with the catalog and marks the ones that no longer match. A live table with all its columns shows no badge.

| Badge | Beside | Means |
|---|---|---|
| **Not in the catalog** | The table | The catalog has no table of that name: it was renamed before egret moved classifications, it was purged, or the tag was attached before the table was created. The renamed table may be unclassified under its new name. |
| **Dropped** | The table | The table is in the catalog's **Recycle bin**. The tag applies again if the table is undropped. |
| **Renamed to \<column\>** | A column | The table has no column of that name, and the table's schema history shows the column now has another name, for example **Renamed to mail**. This is a suggestion: check it before you attach the tag to the new column. |
| **Not in the table** | A column | The table has no column of that name, and no renamed column was found: it was dropped, or never existed. |

To fix a row, attach the tag to the new name and remove it from the old one. The Governance overview reports the same rows. See [Renames and drops](./tagging.md#renames-and-drops).

### Manual policies

The **Manual policies** tab lists the hand-written tag policies, written on a profile's **Advanced** tab (see [Hand-written policies](../engines-and-policy/policy-editor.md)), that the engines apply to this classification's name. It needs **policy:read**; without it the tab says *Manual tag policies are read with the policy:read permission, which this account does not have.* It opens with *Manual tag policies, written in an engine profile's own editor, that the engines apply to this classification's name. A listed policy names the classification; it may still be disabled or outranked on the engine.*

| Column | What it shows |
|---|---|
| **Policy** | The policy name (a link to the policy editor), its type and profile, and its tag resource, for example `tag=p*x`. A note under it says why it is listed (see below). |
| **Engines** | The engines that download the profile, or *No engine downloads profile …*. |
| **Items** | Who each item allows, denies or masks, and how. |
| **State** | **Enabled** or **Disabled**, *Denies every access its items do not allow (deny all else).* when set, and any part of the policy egret does not evaluate. |

A row is a match on the tag name, not a decision. A policy is listed in three ways:

| Note under the policy | Means |
|---|---|
| None | The tag value matches the name as it reads, for example the literal `pii`. |
| *Names this classification through a pattern.* | The pattern matches the name, for example `p*` on `pii`. |
| **Wider than its pattern**, with *The engine applies this policy to every tag starting with “p”, not only the tags its pattern matches.* (or *… to every tag, …*) | The pattern does **not** match the name, but the engines apply the policy to it anyway. See below. |

When nothing is listed the tab says *No manual tag policy names this classification.*, or *No readable manual tag policy names this classification.* when some policies could not be read (they are listed under the table). With no tag service on any profile it says *No engine profile has a tag service, so no engine downloads tag policies.*

#### How the engines pick tag policies

This is Apache Ranger's own behaviour, and it is wider than the patterns read. For a tag, Ranger does not test the policy's pattern. It looks the policy up by the text of each tag value **before its first `*`, `?` or `{`**, and applies the policy to every tag whose name starts with that text (case-sensitive):

| Tag value in the policy | The engines apply it to | Example |
|---|---|---|
| A name with no wildcard, for example `pii` | That tag only | `pii`, not `PII` or `pii_x` |
| A pattern, for example `p*x` or `pi?` | Every tag that starts with the text before the first wildcard | `p*x` applies to `pii` and `phone` |
| A value that starts with `*`, `?` or a token, for example `*i`, `?ii` or `{USER}` | Every tag | `*i` applies to `phone` |
| A value marked recursive | Every tag that starts with the value | recursive `pii` applies to `piix` |
| A value marked exclude | Every tag, the excluded one too | exclude `pii` applies to `pii` |

So a deny or a mask written as `*i` to reach the tags that end in `i` restricts every tagged column on the engine, and an allow written that way grants on every tag. Values written as a name or as a prefix pattern (`*`, `p*`, `pii*`) apply exactly as they read. egret measured this on Ranger 2.5.0, 2.8.0 and 2.9.0, which agree.

Since platform #809 the tab lists these policies too, with **Wider than its pattern** and the prefix the engine uses (an empty prefix reads *every tag*). Before, it listed only the policies whose pattern matched the name, and left out the ones the engines apply more widely. For a shape egret has not measured (a tag policy with resources other than `tag`, more than one resource, an empty value, or a tag service whose `tag` resource is set up differently from the default), the tab still lists the policy only when its pattern matches the name.

## Delete a tag

1. Open the tag and press **Delete**, or use **⋯ → Delete** on the list.
2. The dialog *Delete \<name\>?* says what goes with it, for example *Removes it from 0 tables and 4 columns.* and *Removes it from 0 BI objects.* Type the key to confirm.

If a mask or row-filter rule still selects the tag, the dialog says so (*1 rule selects it: the delete will be refused until they are deleted or retargeted.*) and the delete is refused. Delete or retarget those rules first; the **Rules** tab lists them.

## Where tags are applied

Tags attach to:

- **Tables and columns** in egret-managed catalogs, from the Data page. See [Tagging data](./tagging.md).
- **BI objects** (datasets, charts, dashboards), from the object's Tags control. The count appears in **BI objects**; tables and columns are counted in **Data**.

## Limits and known issues

- A tag key cannot be changed. Create a new tag and move objects over.
- Tags cannot be added to catalogs that egret does not manage (*Tags can be added to egret-managed catalogs only*).
- A hand-written tag policy whose value starts with a wildcard, is recursive or excludes a tag applies to more tags than its pattern reads. The **Manual policies** tab shows it with **Wider than its pattern**.

## Further reading

- [Clearance](./clearance.md)
- [Tagging data and BI objects](./tagging.md)
- [View exposure](./view-exposure.md)
