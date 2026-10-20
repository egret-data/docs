---
sidebar_position: 2
---

# Members

**Workspace settings → Access → Members** controls who can use the workspace and with which role. Members can be single people or whole groups. A person's role decides what they can do in the workspace: view, build and edit, or administer.

![The Members page of the Docs sandbox workspace: people and groups with their roles](/img/platform/admin/ws-members.png)

You need to be a workspace admin (the `ws_admin` role) or a platform admin to open this page.

## The member list

The summary line counts **members**, **admins**, **people** and **groups**. The table has these columns:

| Column | Meaning |
|---|---|
| **Member** | The person's email or the group's name. A platform admin carries a *platform admin* tag, with the tooltip *Also a platform admin — has access to every workspace*. |
| **Type** | **User** or **Group**. |
| **Role** | The workspace role, shown as a dropdown you can change. |
| **Added by** | Who added the member. |
| **Added** | When, relative. |

A note under the title says *Workspace roles apply only inside \<workspace\> — see the Roles & permissions tab for what each grants. Platform-wide access is granted separately in Control Plane → Access control.* A search box filters the list. An empty workspace says *No members yet.*

## Add a member

1. Press **Add member**.
2. Under **Type**, choose **User** or **Group**.
3. Type the person's email (*User email…*) or the group's name (*Group name…*). A few letters are enough: matching people are suggested with their name and email (typing `emma` suggests *Emma Schmidt emma.schmidt@egret.local*); pick one. The person must already exist in the platform: an SSO user has signed in once, or a local account has been created.
4. Choose the **Role**. The default is `ws_viewer`.
5. Press **Add member**. A toast says *Member added*.

![The Add member dialog with an email typed and the matching user suggested](/img/platform/admin/ws-add-member.png)

The dialog is *Give a user or group a role in this workspace.* Adding a group gives every member of the group the role.

:::tip
Prefer adding groups: when someone joins the group in your identity provider, they gain access at their next sign-in, and you do not have to touch the workspace.
:::

### The roles you can choose

The role picker lists every workspace role defined on the platform: `ws_admin`, `ws_editor`, `ws_viewer`, `data_api_invoker` and any custom role (such as `finance_reporter`). See [Roles & permissions](./roles-and-permissions.md) for what each grants and [Roles](../control-plane/access-control/roles.md) to create a custom one.

## Change a role

Use the dropdown in the **Role** column. A toast says *Role updated*. The last admin of a workspace cannot be demoted: the dropdown is disabled with the tooltip *Last admin — role can't be changed*.

## Remove a member

Open the **⋯** menu on the row (**Actions for \<member\>**) and choose **Remove from workspace**. The dialog **Remove from workspace?** asks you to confirm, and a toast says *Removed from workspace*. The person keeps their account and any access they have through other workspaces or groups.

The menu also has **Impersonate**, which lets a platform admin see the workspace as that person (see [Impersonate a member](#impersonate-a-member)).

## Bulk select

**Bulk select** adds a checkbox to each row. After you tick rows, a bar shows *N selected* with **Remove**, **Set role…** and **Clear**. **Set role…** opens a dialog to choose one role for all the selected members; **Remove** removes them all. Press **Done** to leave bulk mode.

![Bulk select with two members ticked and the actions bar](/img/platform/admin/ws-members-bulk.png)

## Impersonate a member

**Impersonate** in the row menu lets a platform admin act as that member, to check what the person sees.

1. Open **⋯ → Impersonate** on the member's row. The dialog **Impersonate user** says *You'll act as this user until the session expires or you exit. This is logged and requires a reason.*
2. Type a **Reason** (required).
3. If you sign in with a local account, type your **Password**. *Signing in with SSO? Leave this blank — you'll be redirected to re-authenticate.*
4. Press **Impersonate**.

The workspace reloads as that person, with a banner at the top: *Impersonating member-sso@egret.local · 29:57 left* and an **Exit** button. The session lasts 30 minutes. Pages and actions the person may not use behave as they would for them (for example **Workspace settings → Members** is refused). Press **Exit** to return to your own session.

The audit log records `impersonation.start` (with your reason) and `impersonation.end` with you as the actor. What you do in between is recorded under the person you impersonate, not under your name.

:::caution
Impersonation changes the session you are signed in with. Do not use it from a browser session that someone else, or a script, shares.
:::

## Access requests

People who are not yet members can ask to join (see [Access requests](./access-requests.md)). Approving a request adds them here.

## Limits and known issues

- A workspace can have no admin when it is created in the Control Plane. Add a member with `ws_admin` first.
- Platform admins have access to every workspace without being members.

## Further reading

- [Roles & permissions](./roles-and-permissions.md)
- [Access requests](./access-requests.md)
- [Access Explorer](../control-plane/access-control/access-explorer.md)
