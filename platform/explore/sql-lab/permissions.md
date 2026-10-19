---
sidebar_position: 9
---

# Permissions and availability

Two separate things decide whether you can use SQL Lab: whether the module is switched on for the workspace, and what your role in the workspace allows. After that, the database engine applies its own rules to the queries you send.

## The workspace feature switch

**SQL Lab** is one of the workspace modules (the others are Datasets, Charts, Dashboards, Apps, Alerts & Reports, Data API and Workflows). It is on by default for every workspace. A platform administrator turns it on or off in **Control Plane → Workspaces → (the workspace) → Features** and presses **Save**. See [Workspaces](../../control-plane/workspaces).

The switch describes what the module is: *Write and run free-form SQL, browse engine schemas, and save queries.* When it is off:

- The **SQL Lab** item disappears from the sidebar.
- The page `/explore/<workspace>/sql-lab` shows **403 — Forbidden**.
- The server refuses every `sqllab/…` request, and refuses `POST /queries`, the call that submits free-form SQL, with a 403 whose code is `feature_disabled`. This applies to every member including platform admins.
- Reading a past run, cancelling it and listing history stay available, because the chart builder uses the same calls.

Turning the switch off does not delete saved queries, snippets or history; they come back when it is turned on again. Charts, datasets and dashboards are separate modules and keep working.

## Roles and permissions

A workspace role is a set of permissions. These are the permissions that matter for SQL Lab and the three built-in workspace roles as they are seeded:

| Permission | What it allows | `ws_viewer` | `ws_editor` | `ws_admin` |
|---|---|:---:|:---:|:---:|
| `query:run` | Run queries. Also needed to browse catalogs, schemas, tables and columns, to search objects, to read History and results, to cancel a run and to download CSV. | no | yes | yes |
| `saved_query:read` | List and open saved queries and snippets. | yes | yes | yes |
| `saved_query:manage` | Create, edit, delete and move saved queries; create, edit and delete snippets. | no | yes | yes |
| `dataset:manage` | Create a dataset, which **Save as dataset** does. | no | yes | yes |

You can see the real list for your workspace in **Manage → Workspace settings → Roles**; see [Roles and permissions](../../workspace-settings/roles-and-permissions) and the [permission reference](../../reference/permissions).

What this means in practice:

- A **viewer** can read saved queries and snippets but cannot run SQL, browse schemas or see history. The SQL Lab page opens for a viewer (the module is on), but the Explorer shows *Couldn’t load — no access or engine error.* and **Run** is refused with a `forbidden` toast. Viewers use dashboards, charts and datasets instead.
- An **editor** or **admin** can do everything in SQL Lab.
- **Saved queries** can also be shared one by one: **Actions → Share…** gives a user or group access to that query only, whatever their workspace role. See [Shared objects](../../workspace-settings/shared-objects).
- **Save as dataset** also needs the **Datasets** module to be on; with it off, the dialog fails with a feature-disabled error.

(The viewer behaviour above comes from the role definitions and the server code; it was not reproduced with a viewer account on the demo instance.)

## Which databases you can use

The database picker lists only the connections that are granted to the workspace; see [Databases](../../workspace-settings/databases). A request for any other database is refused with *database not granted to workspace*.

## What the engine allows

SQL Lab sends your text to the engine and returns the engine's answer. Two settings of the connection decide who the engine thinks you are:

- **Shared service account** (default): every query runs as the connection's own user. Everything that account can read is readable by everyone who may run queries in this workspace. Restrict the account in the engine, or give the connection to fewer workspaces.
- **Per-user delegation**: Egret mints a short-lived engine token for you and the query runs as your identity, so the engine's own access policies (for example the ones managed in [Data Governance](../../data-governance/overview)) apply to you. A user who did not sign in through SSO cannot use such a connection.

The Explorer and the search use the same identity as running queries, so a table you may not read is not listed.

## Who can see what you run

| Object | Visible to |
|---|---|
| A result and its CSV | The user who ran it and platform admins |
| History | Only you |
| Saved queries and snippets | Members with `saved_query:read` (and anyone a query was shared with) |

## Limits and known issues

- The SQL Lab page itself is reachable by a viewer even though most of it does not work for them.
- There is no per-database permission inside SQL Lab; use the connection's grants and the engine's policies.

## Further reading

- [Roles and permissions](../../workspace-settings/roles-and-permissions)
- [Workspaces](../../control-plane/workspaces)
- [Databases](../../workspace-settings/databases)
