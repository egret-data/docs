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
| **Roles** | Every platform role the user holds, directly or through a group, or a dash. A role held only through groups names them, for example `platform_admin · via group platform-admins`; hover a role to see all its sources. Two roles are shown, and a **+N** badge lists the rest. |
| **Groups** | How many groups the user belongs to. |

The **⋯** menu on a row offers **View access** (the [Access Explorer](./access-explorer.md) for that person), **Assign roles**, **Edit**, **Reset password** (local accounts), **Impersonate** (not offered for a platform admin, directly or through a group), **Disable** (or **Enable** for a disabled user) and **Delete**. **Disable** and **Enable** are shown to platform admins only. On your own row **Disable** stays listed but cannot be chosen, and reads *You cannot disable your own account*.

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

![The page of Farid Haddad: details, his two directly granted platform roles and one group](/img/platform/admin/cp-user-detail.png)

### Details

**Name** is editable and saves automatically (*Changes save automatically.*). The group memberships of an SSO user come from the identity provider and change when they sign in.

### Roles

*Platform-wide roles assigned to this user. Workspace roles are assigned per workspace.* The editor lists the roles granted to the user directly; the **Through groups** table below lists the others.

1. Under **Scope**, choose **Platform** or **Workspace**.
2. For **Platform**, choose a **Role** (for example `data_steward` or `platform_admin`). For **Workspace**, pick the workspace first.
3. Press **Add**.

The table lists **Role** and **Scope** with a remove button. With none it reads *No roles assigned yet. Pick a scope above to grant one.* Platform admins can do anything everywhere, so grant `platform_admin` sparingly; the Access overview flags a high share.

**Through groups** (*Platform roles this user holds as a member of a group. Change them on the group's page.*) lists the **Role** and the **Group** of each platform role the user holds through a group, or *No platform role through a group.* It is read-only. A role held both directly and through a group appears in both tables.

### Groups

*Groups this user belongs to. Manage membership from the group's page.* The user's current groups are listed.

## Disable and delete

Egret's grants, rule exemptions, engine permissions and hand-written engine policies refer to a person by their **engine username** (for example `alice`), the name the query engines know them by. Disabling keeps that username with the person. Deleting retires it for good. When someone leaves or must lose access, **disable** them.

### Disable or enable a user

Press **Disable** in the header of the user page, or choose **Disable** in the row's **⋯** menu. Egret asks first: *Disable \<email\>?*, with the text *They are signed out at once and cannot sign in until the account is enabled again. Their memberships and role grants are kept. Their engine username stays theirs.* For a user who holds `platform_admin`, directly or through a group, it adds *While disabled they lose all-access on engines.* Press **Disable user** to confirm, or **Cancel**. The status becomes **Disabled**.

Disabling a platform admin removes them from the engines' `egret-admin` policies in the same step, so they lose all access on every engine as soon as the engines' plugins download the new policy version. Their other grants, rules and memberships stay and still name them.

**Enable** (in the header or the row menu) reverses it at once, without a confirmation. An enabled platform admin is put back into the `egret-admin` policies.

You cannot disable your own account; the server answers *you cannot disable or delete your own account*.

### Delete a user

Press **Delete** in the header of the user page or in the row menu. The dialog asks *Delete "\<email\>"?* and says:

> Deletes this user, their sessions, group memberships and role grants. Their engine username **\<username\>** is retired for good: nobody can be given it again, including this person if they come back, so grants and policies naming it will never apply to anyone. To stop them signing in and keep their username, grants and history, disable them instead.

![The Delete dialog for Farid Haddad: his engine username farid-haddad is retired for good, with Disable instead and the typed confirmation](/img/platform/admin/cp-user-delete.png)

A user who never had an engine username reads *They have no engine username yet.* instead of the second sentence. Type `delete` and press **Delete** to confirm.

For an active user, and when you may disable users, the dialog ends with the last sentence above and offers **Disable instead**; otherwise both are left out. It closes the delete dialog and opens the disable confirmation above. When the user is the last active platform admin, **Disable instead** cannot be pressed and says *No other active user holds platform_admin, and the last active platform admin cannot be disabled.*

You cannot delete your own account: **Delete** is greyed out on your own row and page.

A delete is recorded as a governance change. A reader who holds **user:read** sees it on [Governance → Overview → Recent changes](../../data-governance/overview.md#recent-changes) as *\<actor\> deleted user \<username\>*.

### What a retired username means

A username is never given to a second person. After `alice` is deleted, the next person whose email starts with `alice@` gets `alice-2`, and so on. That includes the same person: if they sign in again through SSO, or you create a new local account for them, they are a new user and get `alice-2`.

Grants, rule exemptions and policies that name `alice` stay in place but match nobody, and nobody can come to match them. For an allow this removes access, which is safe. In a deny, or in a grant's **Exclude** list or a policy's **Exclude from allow**, it can widen access for the returning person, because the entry that held them back names their old username. Governance → People & groups → [Reused names](../../data-governance/people-and-groups/index.md#reused-names) lists such names, and **Unmatched names** lists grant principals and rule exemptions that match nobody.

:::warning Prefer Disable to Delete
Delete only accounts that should never come back, such as test accounts. To take access away from a person, disable them: their username, grants and history are kept, and **Enable** undoes it.
:::

### The last active platform admin

There must always be one active platform admin: an active user who holds `platform_admin` directly or through a group. A disabled platform admin does not count as active. Egret refuses every change that would leave none, with *Cannot remove the last active platform admin* (HTTP 409), and changes nothing:

- disabling or deleting the user;
- removing `platform_admin` from the user, or from a group they hold it through;
- removing them from such a group, or deleting the group (see [Groups](./groups.md));
- `PUT /api/admin/users/{id}/platform-roles` with a set that drops `platform_admin`.

Two such changes made at the same moment are checked one after the other, so they cannot both pass. **Disable instead** in the delete dialog checks the same rule before asking the server; the server's answer is the one that holds.

The OIDC group sync cannot refuse, because it runs at sign-in. When the groups claim drops the group that is the last active admin's only hold on `platform_admin`, the sync keeps that membership, logs a warning, and applies the rest. Make another user a platform admin; the next sync then drops it.

## Limits and known issues

- Roles are assigned here at platform or workspace scope. Workspace membership itself is managed on the workspace's **Members** page.
- The engines' admin set and the last-admin check do not read a grant's expiry; no API writes an expiry on a platform role (KI-322).
- Bulk **Disable** acts at once, without the disable dialog (KI-262).

## Further reading

- [Groups](./groups.md)
- [Roles](./roles.md)
- [People & groups: Reused names](../../data-governance/people-and-groups/index.md#reused-names)
- [Backup and restore](../../deploy-operate/backup-restore.md)
- [Workspace Members](../../workspace-settings/members.md)
