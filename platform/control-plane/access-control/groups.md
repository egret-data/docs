---
sidebar_position: 2
---

# Groups

A **group** is a set of users you can give roles and grants to once instead of person by person. **Control Plane → Identity → Groups** lists local groups you create in egret and groups synced from your identity provider.

![The Groups list: local groups and groups synced from OIDC](/img/platform/admin/cp-groups.png)

You need **group:read** to open the page.

## The group list

The strip counts **groups** and **members**. **Source** filters the list: **All**, or one of the sources present (local, OIDC).

| Column | Meaning |
|---|---|
| **Group** | The group name, with a label *Synced from OIDC* for synced groups. |
| **Members** | The member count. |
| **Roles** | Platform roles granted to the group, or a dash. |

## Synced groups

Groups synced from OIDC are created at sign-in from the groups claim of the identity provider. Their name and membership are managed in the provider and cannot be changed in egret. The group page says *This group is synced from your identity provider — its name and membership are managed there and can't be changed here. You can still assign roles to it.* Membership changes when a member next signs in. A member who has not signed in for 7 days loses the synced groups, and with them the roles and workspaces they hold through those groups, until they sign in again. egret cannot see a rename or removal in the provider before then. A role or workspace that lapses is also re-applied to the engines within an hour: egret recompiles the profiles it reached every hour, so an expired grant stops applying on the engines without waiting for an unrelated change.

## Create a local group

1. Press **New group**.
2. Type the **Name**. It is required.
3. Press **Create**.

The dialog says *Create a local group.* After creating it, open the group to add members.

## The group page

![The local group finance-analysts: details, three members and no roles](/img/platform/admin/cp-group-detail.png)

| Section | What it holds |
|---|---|
| **Details** | The **Name** (editable for local groups). |
| **Members** | For a local group: *Users in this group. Search to add someone, or remove with ×.*, a **User** search with **Add**, and the **Member** and **Email** of each member with a remove button. For a synced group: *Members are synced from your identity provider.* |
| **Roles** | *Roles granted to every member of this group.* Choose **Scope** (**Platform** or **Workspace**) and **Role**, then **Add**. |

When a group holds a role or a workspace, every member gets it, in the platform and on the query engines: egret writes the group's members into the engine's policy. The **Applied on engines** column of [People & groups](../../data-governance/people-and-groups/index.md) shows the membership as applied.

## Give a group access to a workspace

Add the group as a member of the workspace with a workspace role (see [Members](../../workspace-settings/members.md)). Everyone in the group gets that role in the workspace. You can also share individual objects with a group.

## Limits and known issues

- Synced groups cannot be renamed, emptied or deleted here.
- Empty groups are allowed; a grant naming one matches nobody.

## Further reading

- [Users](./users.md)
- [Roles](./roles.md)
- [People & groups in Governance](../../data-governance/people-and-groups/index.md)
