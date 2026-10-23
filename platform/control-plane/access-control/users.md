---
sidebar_position: 1
---

# Users

**Control Plane → Identity → Users** lists every account on the platform and lets you create local accounts, disable or enable people, and give them platform roles. People who sign in through SSO are created automatically on their first sign-in.

![The Users list with provider, status, roles and group counts](/img/platform/admin/cp-users.png)

You need **user:read** to open the page. Creating, updating, disabling and deleting need the matching permissions.

## The user list

A summary strip counts **users**, **active** and **disabled**. Two filters narrow the list:

| Filter | Options |
|---|---|
| **Status** | **All**, **Active**, **Disabled** |
| **Provider** | **All**, plus the providers present: `local`, `oidc` |

| Column | Meaning |
|---|---|
| **User** | Avatar, display name and email. |
| **Provider** | `local` for accounts created in egret, `oidc` for people who sign in through SSO. |
| **Status** | **Active** or **Disabled**. A disabled user cannot sign in. |
| **Roles** | Platform roles granted to the user directly, or a dash. A role the user holds through a group is not shown (KI-260). |
| **Groups** | How many groups the user belongs to. |

The **⋯** menu on a row offers **View access** (the [Access Explorer](./access-explorer.md) for that person), **Assign roles**, **Edit**, **Impersonate** and **Delete**.

## Create a local account

Use this for break-glass accounts and for installations without SSO.

1. Press **New user**.
2. Enter the **Email**, **Name** and **Password**. All are required.
3. Press **Create**.

The dialog says *Create a local account with an email and password.* The new user appears with provider `local`.

:::note
Prefer SSO for people. A local account has its own password and does not follow the identity provider's group membership.
:::

## Bulk select

**Bulk select** adds checkboxes. After you tick users, a bar shows *N selected* with **Disable**, **Enable**, **Assign role…** and **Clear**. **Done** leaves bulk mode. Bulk **Disable** acts at once, without the confirmation the user page asks for; the toast that reports it offers **Undo** (KI-262).

![Bulk select with two users ticked and the actions bar](/img/platform/admin/cp-users-bulk.png)

## The user page

Select a user to open their page. The header shows the name, status, provider and email, with **Disable** (or **Enable**) and **Delete**. A local account also has **Reset password**: *Set a new password for this local account. Their existing sessions are signed out immediately.*

![The page of Farid Haddad: details, his directly granted platform role and one group](/img/platform/admin/cp-user-detail.png)

### Details

**Name** is editable and saves automatically (*Changes save automatically.*). The group memberships of an SSO user come from the identity provider and change when they sign in.

### Roles

*Platform-wide roles this user holds. Workspace roles are assigned per workspace.* Only roles granted to the user directly are listed; roles granted to one of the user's groups are on the group's page.

1. Under **Scope**, choose **Platform** or **Workspace**.
2. For **Platform**, choose a **Role** (for example `data_steward` or `platform_admin`). For **Workspace**, pick the workspace first.
3. Press **Add**.

The table lists **Role** and **Scope** with a remove button. With none it reads *No roles assigned yet. Pick a scope above to grant one.* Platform admins can do anything everywhere, so grant `platform_admin` sparingly; the Access overview flags a high share.

### Groups

*Groups this user belongs to. Manage membership from the group's page.* The user's current groups are listed.

## Disable and delete

**Disable** blocks sign-in without removing anything and signs the user out. It asks first: *Disable \<email\>?* (*They are signed out at once and cannot sign in until the account is enabled again. Their memberships and role grants are kept.*), with **Cancel** and **Disable user**. The status becomes **Disabled**. **Enable** reverses it at once, without a confirmation. **Delete** asks *Delete "\<email\>"?* (*This user, their sessions, group memberships, and role grants will be permanently removed. This cannot be undone.*) and needs you to type `delete`. Prefer disabling: grants and shares that name a deleted user become unmatched names (see [People & groups](../../data-governance/people-and-groups/index.md)).

## Limits and known issues

- Roles are assigned here at platform or workspace scope. Workspace membership itself is managed on the workspace's **Members** page.

## Further reading

- [Groups](./groups.md)
- [Roles](./roles.md)
- [Workspace Members](../../workspace-settings/members.md)
