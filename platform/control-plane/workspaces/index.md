---
sidebar_position: 1
---

# Workspaces

A **workspace** is an independent data platform inside egret: it has its own members, database connections, datasets, dashboards and settings. **Control Plane → Infrastructure → Workspaces** is where a platform administrator creates, renames, archives and restores workspaces, and where they open one to manage it.

![The Workspaces list with a summary strip, a status filter and one workspace per row](/img/platform/admin/cp-workspaces.png)

The page is available to platform admins only. Workspace owners and admins manage what is *inside* a workspace under **Manage → Workspace settings** (see [Workspace settings](../../workspace-settings/general.md)).

## The workspace list

The strip counts **total**, **active** and **archived** workspaces. **Status** filters the list: **All**, **Active** or **Archived**.

| Column | Meaning |
|---|---|
| **Workspace** | The display name above its slug, for example `default`. Select it to open the workspace. |
| **Owner** | The user who owns the workspace. |
| **Created** | When it was created, relative. |
| **Status** | **active** or **archived**. |

## Create a workspace

1. Press **New workspace**.
2. Type a **Name**, for example `Finance analytics`.
3. Check the **Slug**. It is filled from the name (`finance-analytics`). Use lowercase letters, digits and hyphens. The slug is the immutable machine identifier used in URLs and APIs, so it cannot be changed later.
4. Press **Create**.

![The New workspace dialog with a name and its slug](/img/platform/admin/cp-workspace-new.png)

The new workspace appears in the list, owned by you, with no members. As a platform admin you can open it at once; everybody else needs to be added as a member (see [Members](../../workspace-settings/members.md)).

The **⋯** menu on a row offers **Open**, **Rename** and **Archive**.

## Open a workspace

Select a row to open the workspace's page, with the tabs **Overview**, **Members**, **Resources**, **Features**, **Access requests** and **Activity**. See [Workspace details](./workspace-detail.md).

## Rename a workspace

1. Open the workspace and press **Rename**.
2. Change the **Name** and press **Save**. The dialog says *Update the display name for \<slug\>.*

Only the display name changes. The slug is permanent.

## Transfer ownership

1. Open the workspace and press **Transfer owner**.
2. Choose the **New owner** (*Select a user…*).
3. Press **Transfer**.

The dialog says *Reassign this workspace to another user. They will be added as a workspace admin if they aren't already a member.*

## Archive and restore a workspace

1. Open the workspace and press **Archive**.
2. Confirm *Archive workspace?* The dialog says *\<name\> will be archived and hidden from active lookups. You can restore it later.*

An archived workspace shows **archived** in the list and the button on its page becomes **Restore**. Nothing is deleted: the archived workspace keeps its members, resources and content. Press **Restore** to bring it back. **Rename** and **Transfer owner** stay available while archived.

:::tip
Archive a workspace instead of deleting data. There is no delete button here.
:::

## What a new workspace needs

A workspace is useful once it has:

1. **Members.** Add people and groups (see [Members](../../workspace-settings/members.md)).
2. **An engine and catalogs.** Assign an engine and a catalog (see [Workspace details](./workspace-detail.md#resources) and [Catalogs](../catalogs/index.md)).
3. **A database connection** in **Workspace settings → Engines** (see [Databases](../../workspace-settings/databases.md)).
4. **Notifications** if alerts and reports will email or post to Slack (see [Notifications](../../workspace-settings/notifications.md)).

## Limits and known issues

- The slug cannot be changed after creation.
- A workspace cannot be deleted from the console, only archived.

## Further reading

- [Workspace details](./workspace-detail.md)
- [Access control](../access-control/index.md)
- [Audit log](../audit-log.md)
