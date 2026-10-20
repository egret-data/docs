---
sidebar_position: 6
---

# Access requests

**Workspace settings → Access → Access requests** is the queue of people asking to join the workspace. A workspace admin approves a request, optionally time-boxed, or denies it.

![The queue of Finance analytics with two pending requests: who, the requested role and the reason](/img/platform/admin/ws-requests.png)

You need to be a workspace admin or a platform admin. With no requests waiting the page says *No pending requests.*

## How people ask

A signed-in user who is not a member of a workspace asks from the workspace switcher.

1. Open the workspace menu at the top of the sidebar.
2. Choose **Request access…**.
3. In **Request access**, pick the **Workspace** from the list of workspaces you are not in (*Select a workspace…*). With none: *You're a member of every workspace.*
4. Choose the **Role**: `ws_viewer` (default) or `ws_editor`.
5. Write a **Reason**.
6. Press **Submit request**. A toast says *Access request sent*.

![The Request access dialog as member-sso, with her approved request under Your requests](/img/platform/admin/ws-request-dialog.png)

The dialog says *Ask a workspace admin to add you. They'll review and approve or deny the request.* **Your requests** below lists each request with a badge: **Pending**, **Approved**, **Denied** or **Cancelled**. A pending one has **Cancel**. Asking twice, or while a member, shows *You already requested or are a member.*

## Review the queue

Each request shows the requester's email, the requested role, how long ago they asked, and their reason. Two buttons act on it: **Approve** and **Deny**.

### Approve

1. Press **Approve**. The dialog **Approve request** says *Add \<email\> to the workspace.*
2. Keep the requested **Role** or choose another.
3. Optionally set **Access expires**. *Optional — leave blank for no expiry.*
4. Press **Confirm**. A toast says *Request approved*.

![The Approve request dialog with the role and an optional expiry date](/img/platform/admin/ws-request-approve.png)

The requester becomes a member with that role, and the request leaves the queue. They appear on [Members](./members.md) with *Added by* set to you. If you set **Access expires**, the grant is time-boxed to that date.

### Deny

Press **Deny**. The dialog **Deny request** says *\<email\> will not be added to the workspace.* An optional **Note** is kept with the request. Press **Confirm**. The requester sees **Denied** under **Your requests**.

## Example

On the demo stack, member-sso belongs to *Docs sandbox* only. She opens **Request access…**, picks *Finance analytics* with the reason *I need to build dashboards on the orders dataset for the sales review.* The workspace admin opens **Access requests**, presses **Approve**, keeps `ws_viewer`, sets **Access expires** to 31 March 2027 and confirms. *member-sso@egret.local* now appears on Members of Finance analytics with `ws_viewer`, and her **Your requests** list shows **Approved**. On her People page in Governance the membership shows the expiry date.

![The Members page of Finance analytics after the approval: member-sso is a ws_viewer, added by the admin](/img/platform/admin/ws-members-finance.png)

No mail is sent for a request or a decision: the requester sees the result in the dialog, and admins see the queue only when they open it.

## Where else requests appear

Platform admins also see a workspace's requests on **Control Plane → Workspaces → \<workspace\> → Access requests**, with the same actions.

![The Access requests tab of Finance analytics in the Control Plane](/img/platform/admin/cp-workspace-requests.png)

## Limits and known issues

- A request can ask for `ws_viewer` or `ws_editor` only. An admin can choose a different role when approving.
- The requester sees the result under **Your requests** in the same dialog.

## Further reading

- [Members](./members.md)
- [Roles & permissions](./roles-and-permissions.md)
