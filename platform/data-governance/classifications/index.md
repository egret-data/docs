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
| **Where used** | **Data**: per schema, each table that carries the tag and on which columns (for example *customers — Columns: email, name, phone*). **BI**: the datasets, charts and dashboards that carry it. |
| **Clearance** | The roles and groups that gate objects carrying the tag. See [Clearance](./clearance.md). |
| **Rules** | The egret rules that select the tag, with **Rule**, **Kind**, **Reaches this tag** and **Exempt**. See [Tag-based policy](./tagging.md#rules-that-select-a-tag). |
| **Views** | Materialized views and Trino views that could read classified data. See [View exposure](./view-exposure.md). |
| **Manual policies** | *Hand-written tag policies whose tag matches this classification's name.* |

![The Rules tab of Personal data (PII): the rule Hash personal data, exempting the group data-stewards](/img/platform/admin/gov-tag-rules.png)

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

## Further reading

- [Clearance](./clearance.md)
- [Tagging data and BI objects](./tagging.md)
- [View exposure](./view-exposure.md)
