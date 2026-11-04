---
sidebar_position: 1
---

# Apps

An app is a dashboard written in code. You build it in [marimo](https://marimo.io), a reactive Python notebook, publish it, and other people open it from Egret. Every query the app makes goes through Egret's query gateway under the identity of **the person looking at it**, so their own data permissions apply, not the author's.

Use an app when a [dashboard](./dashboards) cannot express what you need: custom interaction, several linked queries, your own layout. For a standard chart or table, a dashboard is faster to build and needs no code.

![The Apps list with a Sales analysis folder holding two published apps, a draft-only app and another published app](/img/platform/apps/apps-list.png)

:::note Demo stack
On the Docker demo stack the marimo processes run inside the Egret container (one per author for editing, one per viewer and version for viewing) and are served from `http://apps.localtest.me:18080`. In production they run as Kubernetes pods. Measured on the demo stack: the first editor load took 15 to 18 seconds and the first view of a published app 25 to 60 seconds, while the process started and Trino warmed up; later opens took a few seconds.
:::

## How it works

1. You create an app. Egret stores its Python source in the database as a **draft**.
2. You open the editor, a marimo notebook in an iframe. Saving in marimo (Ctrl+S or ⌘+S) writes to the draft.
3. You **publish** the draft. That freezes it as a numbered, immutable **version**.
4. Viewers press **Open**. Egret starts a marimo process for that viewer and that version. Its queries go through Egret's query gateway, which executes them under the viewer's identity.

![The published Order trends app: a Year picker, three figures for 1995 and a line chart of orders per month](/img/platform/apps/viewer-trends.png)

Nothing in an app process holds credentials for a query engine. The source lives only in Postgres; the process's disk is a disposable copy.

## The list

Open **Explore → Apps**. The list shows every app you can see, grouped by folder, with a count such as `4 apps · 1 folder` above it.

| Column | What it shows |
|---|---|
| **Name** | The app's name, a star to bookmark it, and its description. Pressing the name opens a published app, or the editor for a draft-only app. |
| **Status** | **Draft only** until the first publish, then **Published vN** for the latest version. |
| **Updated** | When the app last changed. |

Above the table: **Search apps…**, and the toolbar buttons **Bookmarks**, **Bulk select**, **Trash** and **New folder**. **+ App** creates an app and is shown only to people who may create apps. A folder row has its own **⋯** menu to rename, share or delete the folder; apps not in a folder are listed under **Uncategorized**. Deleting a folder asks first (*Delete folder?*) and says how many apps move to **Uncategorized** ("The 2 apps in it move to Uncategorized; none is deleted."); no app is deleted. With **Bulk select**, **Move *n* to Trash** also asks first ("2 apps move to the Trash. You can restore them from there.").

### Row actions

Each row's **⋯** button is named after its app (*Actions for Revenue explorer*), as in the Data API lists, so screen readers tell the rows apart.

![The row menu of Revenue explorer, with Open, Edit, Rename, Duplicate, the folder actions, Share and Move to Trash](/img/platform/apps/row-menu.png)

| Action | What it does |
|---|---|
| **Open** | Runs the latest published version. Disabled for a draft-only app: *Publish a draft before it can be opened.* |
| **Edit** | Opens the editor on the draft. |
| **Rename…** | Changes the **Name** and **Description**. |
| **Duplicate** | Makes a copy of the draft, owned by you. Needs permission to create apps in the workspace; without it you see *You can edit this app, but making a copy needs permission to create apps in this workspace.* |
| **Move to "folder"** | Moves the app into an existing folder. The folder it is already in is shown greyed out. |
| **Remove from folder** | Moves the app back to **Uncategorized**. Shown for an app in a folder. |
| **Move to new folder…** | Creates a folder and moves the app into it. |
| **Share…** | Grants people and groups access. Shown to people who can manage the app. See [Access and data](./apps/access-and-data). |
| **Move to Trash** | Asks first (*Move to Trash?*, "*name*" moves to the Trash. You can restore it from there.), then soft-deletes the app. In **Trash**, **Restore** brings it back and **Delete permanently** removes the draft and every published version for good. |

## Create an app

1. Go to **Explore → Apps** and press **+ App** (or **Create your first app** in an empty list).
2. Type a **Name**, for example `Shipping costs`.
3. Press **Create**.

![The Create app dialog with the name Shipping costs](/img/platform/apps/create-dialog.png)

Egret creates the app with a starter notebook and takes you straight to the editor. The dialog explains it in one line: *A data app is a marimo notebook that runs SQL as whoever is looking at it. You edit a draft; publishing it makes it the version people open.* The dialog asks only for a name; add a description later with **Rename…**.

The starter source is written the way marimo saves a notebook, so opening the editor leaves it unchanged. An app created through the API with a database also gets a cell with `db = egret.connect("<database>")`. Until you change and save it, the draft cannot be published (see [Publish and version an app](./apps/publishing)). The starter source is:

```python
import marimo

__generated_with = "0.25.0"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    import egret_marimo as egret

    return (mo,)


@app.cell
def _(mo):
    mo.md("""
    # New data app
    """)
    return


if __name__ == "__main__":
    app.run()
```

The next pages cover [writing the app](./apps/authoring), [publishing and versions](./apps/publishing) and [who can open it and what data it sees](./apps/access-and-data).

## Requirements

| To do this | You need |
|---|---|
| Open a published app | `app:read` on the app (held by **ws_viewer**, **ws_editor** and **ws_admin** by default) |
| Create, edit, publish and restore | `app:write` (**ws_editor**, **ws_admin**), and to open the **editor** also `query:run` in the workspace |
| Share an app, delete it permanently | `app:manage` on the app |

The workspace must have the **Apps** feature enabled, and an operator must have set up the apps origin (`apps.origin`) and a launcher for the marimo processes. Without the origin, opening an app fails with *Apps are not set up on this deployment. The apps origin is not configured. An operator needs to set apps.origin.*

## Limits and known issues

- The app source is limited to 1 MiB.
- An app cannot be opened until it has been published once.
- The Create app dialog sets only the name; the description and a starting database cell cannot be set there (KI-041).
- The **Trash** view still shows **+ App**, while the Charts, Dashboards and Alerts & Reports Trash views offer no create button (KI-300).

## Further reading

- [Write an app](./apps/authoring)
- [Publish and version an app](./apps/publishing)
- [Access and data](./apps/access-and-data)
- [Dashboards](./dashboards)
