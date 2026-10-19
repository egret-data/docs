---
sidebar_position: 10
---

# Permissions

Who can see, build and certify datasets depends on three things: the Datasets module being on for the workspace, your role (or a share on the dataset), and, for certification, a platform-level permission. The database's own access rules then apply when the dataset is read.

## The module switch

**Datasets** is a workspace module, on by default. A platform administrator can turn it off in **Control Plane → Workspaces → (the workspace) → Features** ([Workspaces](../../control-plane/workspaces)). With it off, **Datasets** leaves the sidebar and the datasets pages and API are refused for every member. Charts and dashboards depend on datasets, so a workspace normally keeps this module on.

## Permissions

| Permission | Scope | What it allows | `ws_viewer` | `ws_editor` | `ws_admin` |
|---|---|---|:---:|:---:|:---:|
| `dataset:read` | Workspace or one dataset | See the Datasets list and a dataset's columns, metrics, **Usage** and **Preview**; bookmark; list folders. | yes | yes | yes |
| `dataset:manage` | Workspace or one dataset | Create, edit, refresh, trash, restore and delete datasets; change columns; add, edit and delete calculated columns and metrics; create, rename and delete dataset folders and move datasets between them; share. | no | yes | yes |
| `dataset:certify` | **Platform** | Certify and uncertify datasets and metrics. | no | no | no (but `platform_admin` can) |

`dataset:certify` is granted to the platform role `data_steward`, and platform administrators can always certify. See [Certification](./certification).

Creating a dataset also needs:

- A database connection **granted to the workspace**. A database that is not granted is refused with *database not granted*.
- `query:run`, in practice. The **New dataset** dialog fills its **Catalog**, **Schema** and **Table** lists with the same browse requests as SQL Lab's Explorer, and those need `query:run`. The built-in editor and admin roles have both permissions. A custom role with `dataset:manage` but without `query:run` therefore cannot pick a table in the dialog.

Check your workspace's actual roles under **Manage → Workspace settings → Roles**; see [Roles and permissions](../../workspace-settings/roles-and-permissions) and the [permission reference](../../reference/permissions).

## Per-dataset access

A dataset can be shared on its own with **Share…** (see [Organise datasets](./organize#share)). A grant gives the person the permissions of the role they were given, on that dataset (and the datasets in a shared folder), whatever their workspace role:

- **Viewer**: `dataset:read` on it.
- **Editor**: `dataset:read` and `dataset:manage` on it.
- **Blocked (No access)**: an explicit denial that wins over any allowance.

The checks on every dataset action use the dataset itself, so a share, a folder share and a workspace role all count.

## Permission needed for each action

| Action | Permission |
|---|---|
| Open the Datasets list, a dataset page, **Usage**, **Preview** | `dataset:read` |
| Bookmark a dataset | `dataset:read` |
| **Create**, **Duplicate** | `dataset:manage` on the workspace, a granted database |
| **Edit** (name, description, SQL) | `dataset:manage` on the dataset |
| **Refresh**, column settings, **+ Calculated column**, **+ Metric**, metric edit and delete | `dataset:manage` on the dataset |
| **Move to Trash**, **Restore**, **Delete permanently**, header **Delete** | `dataset:manage` on the dataset |
| **New folder**, **Rename**, folder **Delete**, moving datasets | `dataset:manage` |
| **Share…** | `dataset:manage` on the dataset |
| **Tags…** | Depends on the tag permissions of Data Governance; see [Classifications](../../data-governance/classifications). Not verified here. |
| Certification of a dataset or a metric | `dataset:certify` (platform) |

When the server refuses an action, the call returns `403` and the page shows an error toast. A request for a dataset that does not exist in this workspace returns `404`, so ids from another workspace reveal nothing.

## Examples

- **An analyst who may only look.** Give the person the `ws_viewer` role, or share the dataset with them as **Viewer**. They can open the dataset, read its **Preview** and **Usage**, and build their own charts on it if they also hold chart permissions.
- **A colleague who maintains one dataset.** Share that dataset with them as **Editor**. They can change it without being a workspace editor, and they cannot touch other datasets.
- **A data steward.** Give the person the platform role `data_steward`. They can certify any dataset or metric in any workspace, and they can only edit datasets where they also have `dataset:manage`.
- **A contractor who must not see one dataset.** Share it with them as **Blocked (No access)**. The denial wins over their workspace role.

## What the data shows

A dataset only holds definitions. When someone opens **Preview** or a chart, Egret runs a query against the database. The query runs as described on the connection:

- With the **shared service account**, the query reads whatever that account can read, no matter who asked. Giving someone a viewer share on a dataset therefore lets them see its rows even if they have no access in the engine.
- With **per-user delegation**, the query runs as the person looking, and the engine's access policies (row filters, column masks, denied tables) apply. A reader who may not read the table sees an error in **Preview** (an error message with the engine's text).

See [Databases](../../workspace-settings/databases) and [Data Governance](../../data-governance/overview).

## What the interface shows

The Datasets pages do not hide buttons according to your role. **Create**, **Edit**, **Refresh**, **Move to Trash** and **Delete** are shown to everyone who can open the page, and the server refuses the action when you lack `dataset:manage`; an error toast shows the refusal. The only controls that are withheld are the certification ones: the certification button and the **Certified** switches on the Metrics tab appear only for people who may certify.

This comes from the interface code and the role definitions; it was not exercised with a viewer account on the demo instance.

## Limits and known issues

- The `dataset:manage` role does not include certification by design.
- There is no separate permission for refreshing, trashing or deleting; all of them are `dataset:manage`.

## Further reading

- [Roles and permissions](../../workspace-settings/roles-and-permissions)
- [Shared objects](../../workspace-settings/shared-objects)
- [Permission reference](../../reference/permissions)
