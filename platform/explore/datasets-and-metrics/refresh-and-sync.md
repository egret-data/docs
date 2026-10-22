---
sidebar_position: 8
---

# Refresh and schema sync

A dataset keeps a **snapshot of its columns**: the names and types it read from the source when it was created. The rows are never copied (charts always query the source live), but the column list is, so the settings you made on each column have something to attach to. When the source changes, press **Refresh** to bring the snapshot up to date. This page also covers editing a dataset's name, description and SQL, because changing the SQL is the main reason to refresh.

## Refresh a dataset

You can refresh from two places:

- On the dataset page, press the **Refresh columns** button (circular arrows) in the header. The icon spins while Egret works.
- In the Datasets list, open the **…** menu of the row and choose **Refresh**. The item reads **Refreshing…** while it runs.

When it is done, a toast says what changed in the column list: *Refreshed: no columns added or removed*, or for example *Refreshed: 2 new columns (discount_band, region); 1 column removed (comment)*. More than three names are shortened to the first three and *and N more*. Refresh needs the `dataset:manage` permission; see [Permissions](./permissions).

### What a refresh does

Egret asks the engine for the source's current columns (for a physical dataset, the table's columns; for a virtual dataset, the columns the SQL returns) and compares them with the snapshot:

| Situation | Result |
|---|---|
| A column is new in the source | It is added, with **Dimension** and **Filter** on and everything else empty. |
| A column still exists | Its type is updated. Your **Display name**, **Description**, **Role**, **Format**, **Dimension** and **Filter** settings stay. Its **Time** switch stays as you set it when the engine type is the same; when the type changed, the switch is set again from the new type. |
| A column no longer exists in the source | It is removed, together with its settings. |
| A calculated column | Never touched. It stays even if its formula refers to a column that no longer exists. |
| A metric | Never touched, on the same terms. |
| The source returns no columns at all | The refresh is refused with *source returned no columns; refusing to wipe the column snapshot*, and nothing changes. |

The order of the source columns is taken from the engine; calculated columns are placed after them.

Charts that use a removed column, or a calculated column or metric whose formula refers to one, fail the next time they run. Check the dataset's [Usage](./usage-and-preview#usage) tab before you refresh after a destructive change.

If the engine cannot be reached, or the table no longer exists, the refresh fails with the engine's message in an error toast and the snapshot stays as it was.

### When to refresh

- After the **columns of a table change**: a column was added, dropped or retyped.
- After **editing the SQL** of a virtual dataset (see below). Saving the new SQL alone does not change the columns.
- When the Columns tab shows *No columns yet — Refresh to sync from the source.*

There is no automatic or scheduled sync, and no indication that the snapshot is out of date. Rows are not affected: the next chart run already reads the current rows.

## Edit a dataset

Press the pencil (**Edit**) in the header, or choose **Edit** in the row menu. The header changes into a form:

![Editing a virtual dataset: name, description and SQL](/img/platform/sql-datasets/ds-edit.png)

- **Name**, required. It must be unique in the workspace. An empty name shows *Name required*.
- **Description**, optional.
- **SQL query**, for virtual datasets only: an editor with SQL colouring. The note under it reads *The query result becomes the dataset. After changing it, click Refresh to re-sync the columns.*

Press **Save**. The toast says *Saved*, or *Saved — Refresh to re-sync columns* when the SQL changed. **Cancel** closes the form; if you have unsaved edits, the browser asks *Discard unsaved changes?* and the page warns you before you navigate away.

A physical dataset has only **Name** and **Description**. Its source table cannot be changed; create a new dataset instead.

### Change the SQL of a virtual dataset

1. Press **Edit**, change the SQL and press **Save**.
2. Press **Refresh columns**. New columns appear, removed ones disappear.
3. Open **Preview** to check the rows.

Keep the SQL a single query without a trailing semicolon, with unique column names, as described in [Save a query as a dataset](../sql-lab/save-as-dataset#what-the-sql-has-to-look-like). The SQL is not checked when you press **Save**; it is read by the engine when you refresh and whenever a chart runs, so a wrong query only fails at that point.

:::tip Rename safely
Renaming the dataset does not affect charts. They follow the dataset by its identity, not its name.
:::

## Limits and known issues

- The snapshot can drift from the source silently.
- A manual **Time** choice is reset by **Refresh** when the column's engine type changes.
- Removing a source column removes its settings for good; adding it back creates a fresh column with default settings.

## Further reading

- [Columns](./columns)
- [Calculated columns](./calculated-columns)
- [Save a query as a dataset](../sql-lab/save-as-dataset)
