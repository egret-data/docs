---
sidebar_position: 3
---

# Roles & permissions

**Workspace settings → Access → Roles & permissions** shows what each workspace role can do in this workspace. It is a read-only view: roles are defined once for the whole platform and apply to every workspace.

![The workspace Roles and permissions page with the three built-in roles and the custom roles, each with its permission count](/img/platform/admin/ws-roles.png)

*Roles are defined platform-wide in Control Plane → Access control and apply to every workspace. This is a read-only view. The Control Plane also lists `data_api_invoker`: it is granted on one Data API endpoint, never as a workspace role, so it is not shown here.*

## The summary

A strip counts the **roles**, how many are **built-in** and how many are **custom**. Controls:

| Control | What it does |
|---|---|
| **Search roles or permissions…** | Finds a role by name, or by a permission it grants. |
| **Hide empty roles** | Hides roles with no permissions, such as a new custom role. |

## The roles

Each role is a row with its name, a **built-in** label for the three platform defaults, and its permission count. The count includes what the role inherits from its parent, for example **9 permissions (7 inherited)**.

| Role | Permissions | Intended for |
|---|---|---|
| `ws_admin` | 25 | Administering the workspace, including members, connections and settings. |
| `ws_editor` | 17 | Building and editing content. |
| `ws_viewer` | 7 | Reading content. |

Custom roles, for example `finance_reporter`, are listed after the built-in ones with an **Inherits from \<parent\>** label when they have a parent. The summary counts them as **custom**. The page lists only these roles. A note under the title explains why `data_api_invoker`, listed in the Control Plane, is missing: it is granted on one Data API endpoint, never as a workspace role. The **Members** and **Access requests** role pickers offer the same roles as this page.

## See what a role grants

Select a row to expand it. The permissions are grouped by area, each with its description. For example, `ws_viewer` lists:

| Area | Permission | Meaning |
|---|---|---|
| ALERTS & REPORTS | `alert:read` | View scheduled alerts and reports. |
| APPS | `app:read` | Open published data apps. |
| CHARTS | `chart:read` | View charts. |
| DASHBOARDS | `dashboard:read` | View dashboards. |
| DATASETS | `dataset:read` | View datasets. |
| OTHER | `catalog:read` | View catalogs. |
| SQL LAB | `saved_query:read` | View saved queries. |

![The custom role finance_reporter expanded: it inherits from ws_viewer and adds chart and dashboard management](/img/platform/admin/ws-roles-expanded.png)

A role that inherits from another lists its own permissions first, then the ones it inherits under **Inherited from \<parent\>**. A role that inherits from `ws_viewer` (seven reads) and adds two permissions of its own, such as `finance_reporter` with `chart:manage` and `dashboard:manage`, shows **9 permissions (7 inherited)**. A permission the role also holds directly is listed once, under its own permissions.

## Choose a role for someone

| If the person should… | Give them |
|---|---|
| Only look at dashboards and datasets | `ws_viewer` |
| Create charts, datasets and dashboards | `ws_editor` |
| Manage members, connections and settings | `ws_admin` |
| Build and edit dashboards and charts but nothing else, with a role of your own | A custom role (see below) |

## Make a custom role

Custom roles are created by a platform admin in **Control Plane → Identity → Roles**: **New role** with scope **Workspace**, an optional parent to inherit from, and the permissions to add. See [Roles](../control-plane/access-control/roles.md). The role then appears in this list and in the **Role** picker of [Members](./members.md).

## Limits and known issues

- The page is read-only; permissions are changed in the Control Plane.
- A role applies in every workspace. There are no workspace-specific roles.
- A permission also needs the module to be enabled for the workspace (see [Workspace details](../control-plane/workspaces/workspace-detail.md#features)).

## Further reading

- [Members](./members.md)
- [Permissions catalog](../control-plane/access-control/permissions.md)
