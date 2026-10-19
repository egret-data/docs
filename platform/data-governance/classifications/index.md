---
sidebar_position: 5
---

# Classifications

**Governance → Classifications** defines the **tags** you use to classify data and BI objects, for example *Personal data (PII)* or *Finance*. A tag does three jobs: it labels an object, it can select the columns a mask or row filter applies to, and it can **gate** the objects that carry it behind a role or group.

![The Classifications list with one tag, Personal data (PII), and its key and clearance](/img/platform/admin/gov-classifications.png)

The page needs the **tag:read** permission. Creating, editing and deleting tags needs **tag:manage**, which the built-in `data_steward` role holds.

## The tag list

The header counts **tags**, **gated** tags (those with a clearance) and **tagged BI objects**. **Search tags…** filters the table. With no tags the table says *No tags yet.*

| Column | Meaning |
|---|---|
| **Tag** | The tag name with its colour. Select it to open the tag page. |
| **Key** | The immutable identifier used in rules and policies, for example `personal-data-pii`. |
| **Description** | What the tag means, or a dash. |
| **BI objects** | How many datasets, charts or dashboards carry the tag. |
| **Clearance** | The roles and groups that gate the tag, or a dash when it is not gated. |

## Create a tag

1. Press **New tag**.
2. Type a **Name**. It is required. The **Key** is filled from the name (for example `personal-data-pii`).
3. Optionally pick a **Color** and write a **Description**.
4. Edit the **Key** if you want a different one.
5. Press **Create**.

The dialog says *Create a classification tag that can be assigned to data and BI objects.*

### Fields

| Field | Notes |
|---|---|
| **Name** | Required. Shown everywhere the tag appears. |
| **Color** | A colour picker. |
| **Key** | Required. *Immutable identifier — auto-filled from the name; edit if you like. Lowercase letters, numbers, -, _, :.* It cannot be changed after creation. |
| **Description** | *What this tag means…* |

## The tag page

Select a tag to open its page. The header shows the colour, name, key, a **Gated** badge when a clearance is set, and the count of tagged objects. **Delete** is on the right.

![The tag page: details on the left, clearance on the right, and the exposure and rules sections below](/img/platform/admin/gov-tag-detail.png)

### Details

**Name**, **Color** and **Description** save automatically when you leave the field (*Tag updated*). The **Key** is read-only.

### Clearance

The clearance gates objects carrying the tag. See [Clearance](./clearance.md).

### Existing materialized views, Trino views, and Mask and filter rules

These sections show where classified data could leak through views, and which rules select the tag. See [View exposure](./view-exposure.md) and [Tag-based policy](./tagging.md#rules-that-select-a-tag).

## Delete a tag

1. Open the tag and press **Delete**, or use the row action on the list.
2. Confirm *Delete "\<name\>"?* The dialog says *This tag will be permanently removed from the catalog and from every object it's assigned to.*

If a mask or row-filter rule still selects the tag, the delete is refused and a message points to the **Mask and filter rules** section of the tag page, which lists the rules. Delete or change those rules first.

## Where tags are applied

Tags attach to:

- **Tables and columns** in egret-managed catalogs, from the Data page. See [Tagging data](./tagging.md).
- **BI objects** (datasets, charts, dashboards), from the object's Tags control. The count appears in **BI objects**.

## Limits and known issues

- A tag key cannot be changed. Create a new tag and move objects over.
- Tags cannot be added to catalogs that egret does not manage (*Tags can be added to egret-managed catalogs only*).
- The tag page's *N tagged objects* counts BI objects; a tag on a table column appears on the Data page and in explain, not in this count.

## Further reading

- [Clearance](./clearance.md)
- [Tagging data and BI objects](./tagging.md)
- [View exposure](./view-exposure.md)
