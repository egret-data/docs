---
sidebar_position: 1
---

# Apps

An app is a dashboard written in code. You build it in [marimo](https://marimo.io), a reactive Python notebook, publish it, and other people open it from Egret. Every query the app makes runs **as the person looking at it**, so row filters and column masks apply to the viewer and never to the author.

Use an app when a [dashboard](./dashboards) cannot express what you need: custom interaction, several linked queries, your own layout. For a standard chart or table, a dashboard is faster to build and needs no code.

![The Apps list with one published app](/img/platform/apps/apps-list.png)

:::warning What could be run for these docs
Apps run in pods that Egret starts on demand: one hardened Kubernetes pod per author per workspace for editing, and one per viewer per published version for running. The demo instance used for these docs has no Kubernetes and no apps origin, so the **editor and the running app could not be opened**. The list, the create dialog, row actions, versions, sharing, publishing and the REST API were all run and are documented from what they did. The editor and viewer experience inside marimo is described from the source code and is marked as such.
:::

## How it works

1. You create an app. Egret stores its Python source in the database as a **draft**.
2. You open the editor, a marimo notebook in an iframe. Saving in marimo writes to the draft.
3. You **publish** the draft. That freezes it as a numbered, immutable **version**.
4. Viewers press **Open**. Egret starts a marimo process for that viewer and that version. Its queries go through Egret's query gateway, which executes them under the viewer's identity.

Nothing in a pod holds credentials for a query engine. The source lives only in Postgres; a pod's disk is a disposable copy.

## The list

Open **Explore → Apps**. The list shows every app you can see.

| Column | What it shows |
|---|---|
| **Name** | The app's name, a star to bookmark it, and its description. |
| **Status** | **Draft only** until the first publish, then **Published vN** for the latest version. |
| **Updated** | When the app last changed. |

Above the table: **Search apps…**, and the toolbar buttons **Bookmarks**, **Bulk select**, **Trash** and **New folder**. Folders group apps. **+ App** creates one and is shown only to people who may create apps.

### Row actions

![The row menu](/img/platform/apps/row-menu.png)

| Action | What it does |
|---|---|
| **Open** | Runs the latest published version. Disabled for a draft-only app: *Publish a draft before it can be opened.* |
| **Edit** | Opens the editor on the draft. |
| **Rename…** | Changes the **Name** and **Description**. |
| **Duplicate** | Makes a copy. Needs permission to create apps in the workspace; without it you see *You can edit this app, but making a copy needs permission to create apps in this workspace.* |
| **Move to new folder…** | Puts the app in a new folder. |
| **Share…** | Grants people and groups access. Shown to people who can manage the app. See [Access and data](./apps/access-and-data). |
| **Move to Trash** | Soft-deletes the app. In **Trash**, **Restore** brings it back and **Delete permanently** removes the draft and every published version for good. |

## Create an app

1. Go to **Explore → Apps** and press **+ App** (or **Create your first app**).
2. Type a **Name**, for example `Revenue explorer`.
3. Press **Create**.

![The Create app dialog](/img/platform/apps/create-dialog.png)

Egret creates the app with a starter notebook and takes you straight to the editor. The dialog explains it in one line: *A data app is a marimo notebook that runs SQL as whoever is looking at it. You edit a draft; publishing it makes it the version people open.*

The starter source is:

```python
import marimo

__generated_with = "0.25.0"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    import egret_marimo as egret
    return egret, mo


@app.cell
def _(mo):
    mo.md("# New data app")
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

The workspace must have the **Apps** feature enabled, and an operator must have set up the apps origin and a pod launcher. Without the origin, opening an app fails with *Apps are not set up on this deployment. The apps origin is not configured. An operator needs to set apps.origin.*

![The editor page shell when the apps origin is not configured](/img/platform/apps/edit-unavailable.png)

## Limits and known issues

- The app source is limited to 1 MiB.
- Editing and running need a configured pod launcher. This was not available in the demo environment.
- An app cannot be opened until it has been published once.

## Further reading

- [Write an app](./apps/authoring)
- [Publish and version an app](./apps/publishing)
- [Access and data](./apps/access-and-data)
- [Dashboards](./dashboards)
