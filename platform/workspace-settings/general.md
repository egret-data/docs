---
sidebar_position: 1
---

# General

**Manage → Workspace settings → General** shows the identity of the workspace you are in: its name, slug and id. It is read-only, because a workspace's name and lifecycle are managed centrally by platform admins.

![The General page of the Docs sandbox workspace](/img/platform/admin/ws-general.png)

## Open Workspace settings

1. Open the workspace in the **Explorer**.
2. In the left sidebar, under **MANAGE**, choose **Workspace settings**.
3. The settings have their own left menu with three groups:

| Group | Pages |
|---|---|
| **ACCESS** | [Members](./members.md), [Roles & permissions](./roles-and-permissions.md), [Access requests](./access-requests.md), [Shared objects](./shared-objects.md) |
| **DATA** | [Connections](./databases.md) |
| **WORKSPACE** | [Notifications](./notifications.md), **General** |

The page header reads *Manage members, access, and configuration for \<workspace name\>.* The settings menu has no **Collapse** of its own: the app sidebar's **Collapse** is the only one on the page. Below 1024 px wide the menu becomes one row of tabs, without the group headings, that scrolls sideways with a shade on the clipped edge.

Which pages you see depends on your permissions in the workspace. Every page except **General** needs `workspace:manage_members`, which workspace admins hold; a reader without it sees **General** only. **Workspace settings** (the address `/settings`) opens the first page you can open: **Members** for a workspace admin, **General** for anyone else. Opening a hidden page by its address shows *403 — Forbidden* and *You don't have access to this section.* with the reason, for example *Only a workspace admin can manage members.*, in place of the page. The server checks the permission on every request either way.

![Workspace settings as a workspace viewer: the settings menu lists General only, and the app sidebar has no Data API or Workflows items](/img/platform/admin/ws-settings-viewer.png)

## What General shows

*This workspace's identity. Name and lifecycle are managed centrally.*

| Field | Meaning |
|---|---|
| **Name** | The display name, for example *Docs sandbox*. |
| **Slug** | The immutable identifier used in URLs, for example `docs-sandbox` (the address is `/explore/docs-sandbox/...`). |
| **Workspace ID** | The UUID. Use it when you call the API or contact support. |

The panel says *Read-only — managed in the Control Plane.* and a second note explains: *Renaming or deleting a workspace is a platform-admin action and lives in the Control Plane, not here — so an accidental change from inside a workspace can't take it down.* **Manage workspaces in the Control Plane →** opens [Control Plane → Workspaces](../control-plane/workspaces/index.md) for platform admins.

## Change the workspace name

The name can be changed only by a platform admin:

1. Go to **Control Plane → Infrastructure → Workspaces** and open the workspace.
2. Press **Rename**, type the new name and press **Save**.

The slug does not change, so links keep working. See [Workspaces](../control-plane/workspaces/index.md#rename-a-workspace).

## Which modules does this workspace have?

The sidebar of a workspace shows only the modules that platform admins have enabled for it. To see or change the module switches (SQL Lab, Datasets, Charts, Dashboards, Data Apps, Alerts & Reports, Data API, Workflows and workflow extensions), ask a platform admin to open **Control Plane → Workspaces → \<workspace\> → Features** (see [Workspace details](../control-plane/workspaces/workspace-detail.md#features)).

## Limits and known issues

- Nothing on this page can be edited.
- The slug cannot be changed after a workspace is created.

## Further reading

- [Members](./members.md)
- [Workspaces in the Control Plane](../control-plane/workspaces/index.md)
