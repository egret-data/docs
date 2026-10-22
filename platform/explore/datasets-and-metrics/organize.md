---
sidebar_position: 9
---

# Organise datasets

When a workspace has many datasets, a few tools keep the list manageable: **bookmarks** to mark the ones you use, **folders** to group them, the **trash** to hide the ones you no longer want, **tags** to classify them, and **sharing** to give individual people access. They all live in the Datasets list and in each row's **…** menu.

![The Datasets list grouped into the folders Sales analytics and Sample data, then Uncategorized, with two bookmarked datasets](/img/platform/sql-datasets/datasets-list.png)

## Bookmarks

Each row has a star at the start of the **Name** cell. Click it to bookmark the dataset; the star turns solid. Bookmarks are **personal**: they belong to your account, and nobody else sees them. To list only your bookmarked datasets, press the **Bookmarks** button (the star) in the toolbar. With none, the page says *No bookmarked datasets.* Press the button again to see everything.

Bookmarking needs only read access to the dataset.

## Folders

Folders group datasets into a flat, one-level list. They are shared: every member who can see the datasets list sees the same folders. Folders for datasets are separate from folders for charts, dashboards or saved queries.

### Create a folder

Press **New folder** in the toolbar, type a name in the dialog and press **Create**. A toast says *Folder created*. (You can also create one while moving a dataset; see below.)

### Move a dataset into a folder

Use any of these:

- **Row menu.** Open **…** on the dataset and choose **Move to "Folder name"**. **Remove from folder** puts it back in *Uncategorized*. **Move to new folder…** asks for a name, creates the folder and moves the dataset in one step (toast *Moved*).
- **Drag and drop.** Drag a row onto a folder heading, or onto *Uncategorized*.
- **Bulk select.** Press **Bulk select** in the toolbar to add checkboxes. Tick several datasets, then press **Move n to folder…** and pick a folder, **Uncategorized**, or **New folder…**.

### How the list looks with folders

As soon as the workspace has at least one dataset folder, the list is grouped under headings with the number of datasets in each, for example *Sales analytics (3)*, *Sample data (5)* and *Uncategorized (4)*. Click a heading to collapse or expand it; Egret remembers this in your browser. When you search or filter, only the matching datasets are shown, still under their headings. The summary line shows the number of datasets and of folders (*12 datasets · 2 folders*). The Trash view repeats the folder count although it shows no folders.

A folder heading's **…** menu has:

| Item | What it does |
|---|---|
| **Share…** | Gives users or groups access to the folder and everything in it. See below. |
| **Rename** | Renames the folder. |
| **Delete** | Deletes the folder; the datasets in it move to *Uncategorized*. |

## Trash

**Move to Trash** (row menu, or **Move n to Trash** after bulk select) hides a dataset from the main list without deleting it.

From the row menu, a dialog asks *Move “name” to Trash?* first. It lists the charts built on the dataset and says *N charts use this dataset and will keep working until the dataset is deleted. You can restore it from the Trash.* (or *No charts use this dataset. You can restore it from the Trash.*). Press **Move to Trash** to confirm; the toast says *Moved to Trash*. **Move n to Trash** after bulk select trashes the selected datasets without this dialog.

Press the **Trash** button in the toolbar to open the **Trash** view, where each row shows the same columns as the main list and a **…** menu with:

- **Restore**, which returns the dataset to the list.
- **Delete permanently**, which deletes it for good after a confirmation (see [Delete a dataset](#delete-a-dataset)).

![The Trash view with one trashed dataset and its Restore and Delete permanently menu](/img/platform/sql-datasets/datasets-trash.png)

Press the **Trash** button again to leave the view. An empty trash says *Trash is empty.*

What trashing does, as tested on the demo:

- The dataset disappears from the main list and can be restored with all its settings.
- Charts built on it **keep working** and keep running queries; they are not trashed with it. Each of them shows a notice in the chart editor: *This chart's dataset “name” is in the Trash. The chart keeps working until the dataset is deleted; restore the dataset from the Trash to keep it.* The chart editor's **Dataset** picker lists live datasets only, so it is empty for such a chart.
- Nothing is purged automatically. A trashed dataset stays until someone restores it or deletes it permanently.

### Delete a dataset

**Delete permanently** in the Trash, and the trash-can button in a dataset's header, both remove the dataset for good. Both open the same dialog, *Delete dataset “name”?*, and what it asks depends on whether charts are built on the dataset, counting charts in the Trash:

| Charts on the dataset | What the dialog says | To confirm |
|---|---|---|
| None | *This removes the dataset and its column snapshot. The underlying table or query is not affected. This cannot be undone.* | Type `delete`, press **Delete**. |
| One or more | *N charts are built on this dataset and will be deleted with it. The underlying table or query is not affected. This cannot be undone.*, followed by the list of those charts (type icon, link, *in Trash* tag) | Type the dataset's exact name (case matters), press **Delete dataset and N charts**. |

The confirm button stays off until the chart list has loaded. If the list cannot be read, the dialog says *Could not check which charts use this dataset, so it cannot be deleted right now.* and offers no delete.

After the delete, the toast says *Deleted* (or *Deleted the dataset and N charts*); from the header button the Datasets list opens instead.

:::warning Charts are deleted too
A permanent delete also deletes every chart built on the dataset, live or in the Trash. Use **Move to Trash** if you only want to hide a dataset.
:::

Through the REST API, `DELETE /api/ws/{workspace}/datasets/{id}` on a dataset that charts are built on answers `409` with `code: "in_use"`, the list of charts and the message *N charts built on this dataset would be deleted with it; confirm with the dataset name to delete them all*. Send `?confirm=<dataset name>` to delete the dataset and its charts.

## Duplicate

**Duplicate** in the row menu copies a dataset of either kind, with its column settings, calculated columns and metrics. See [Creating a dataset](./creating-a-dataset#duplicate-a-dataset).

## Tags

**Tags…** in the row menu opens **Tags for "name"** with the text *Classify this dataset with tags.* It lists the tags already assigned (*No tags assigned.* when there are none) and an **Add tag…** list. The **Add tag…** list offers the tags of the organisation-wide catalog that is defined under **Governance → Classifications**; see [Classifications](../../data-governance/classifications). Assign a tag by choosing it, and remove one with the **×** on its chip.

![The Tags dialog of the Line items dataset with the Add tag… list open on the organisation tag catalog](/img/platform/sql-datasets/datasets-tags.png)

## Share

**Share…** opens a dialog for giving one user or group access to this dataset, whatever their role in the workspace.

![The Share dialog for a dataset](/img/platform/sql-datasets/datasets-share.png)

1. Choose **User** or **Group**, type the email or the group name, and choose a role: **Viewer**, **Editor**, or **Blocked (No access)**.
2. Optionally set **Access expires** to a date; leave it blank for no expiry.
3. Press **Add**.

The lists *People & groups with access* and *Inherited from folder* show who has access and where it comes from. Inherited access, from the folder the dataset is in, is managed on the folder.

The roles map to the dataset permissions: **Viewer** can read the dataset and its preview and usage; **Editor** can also manage it (columns, metrics, refresh, trash). **Blocked** is an explicit denial that wins over any allowance. For the whole picture, see [Shared objects](../../workspace-settings/shared-objects).

## Limits and known issues

- Folders are one level deep.
- Bookmarks are personal and cannot be shared.
- **Delete permanently** removes the charts built on the dataset, after you type the dataset's name.
- **Move n to Trash** (bulk select) does not show which charts use the datasets.

## Further reading

- [Permissions](./permissions)
- [Shared objects](../../workspace-settings/shared-objects)
- [Classifications](../../data-governance/classifications)
