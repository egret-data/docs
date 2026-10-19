---
sidebar_position: 4
---

# Access and data

Two separate questions decide what a person sees in an app: **may they open it**, and **what may the app's queries read when they do**. Egret answers the first from the app's permissions and shares, and the second from the viewer's own data permissions.

![The Share dialog for an app](/img/platform/apps/share-dialog.png)

## Who can open and edit an app

Access to an app comes from three places, combined:

| Source | What it gives |
|---|---|
| **Workspace role** | `app:read` lets a person open every published app; `app:write` lets them create, edit, publish and restore. By default **ws_viewer**, **ws_editor** and **ws_admin** hold `app:read`; **ws_editor** and **ws_admin** hold `app:write`. |
| **A share on one app** | Gives a person or group a role **on that app only**. A share that grants write on one app makes the Apps list show write actions on that row and no other. |
| **A folder share** | Shares given to a folder apply to the apps in it. |

The list reflects this per row. A row you cannot write has no **Edit**, **Rename…** or **Duplicate**; a row you cannot manage has no **Share…**.

To edit, you need `app:write` on the app **and** `query:run` in the workspace, because an author writes arbitrary SQL. A viewer needs `app:read` on the app. A **ws_viewer** can therefore open published apps even though that role cannot run SQL itself.

### Share an app

1. In **Explore → Apps**, open the **⋯** menu of the app and choose **Share…**.
2. Choose **User** or **Group**, type the user's email or the group name.
3. Choose the role: **Viewer**, **Editor** or **Blocked**.
4. Optionally set **Access expires**. Leave it blank for no expiry.
5. Press **Add**.

The dialog says *Grant people and groups access to this app.* and lists everyone with direct access under **People & groups with access**, or *No direct access yet.* You can change a row's role or remove it from that list.

| Role | Effect |
|---|---|
| **Viewer** | May open the published app. |
| **Editor** | May edit and publish it. |
| **Blocked** | A deny: the person or group cannot open the app even if their workspace role would allow it. |

Sharing needs `app:manage` on the app. Shares work as on other objects; see [Shared objects](../../workspace-settings/shared-objects).

:::note
Viewers are signed-in Egret users: workspace members and people shared in. There are no public links and no embedding outside Egret.
:::

## What the app can read

An app's code is written by its author, but it runs **as the viewer**. Every query goes through the query gateway, which executes it with the viewer's identity, so the engine decides what that person may read. Ranger row filters and column masks that apply to the viewer apply to the app. The author never holds a credential for the engine, and neither does the pod.

| If… | Then… |
|---|---|
| Two viewers open the same app | They may see different rows, depending on their own data permissions. |
| An author with wide access builds the app | Viewers still see only what they could read themselves. |
| A viewer lacks access to a table the app queries | The query fails for that viewer, with the engine's refusal, while it works for others. |

The viewer's identity reaches the engine through the connection's per-user settings, described in [Databases](../../workspace-settings/databases). A connection that does not run queries as the signed-in user shows every viewer what its shared credential can read; for data that needs per-person rules, turn on **Per-user delegation** or **Run queries as the logged-in user** on the connection.

### What the app cannot do

- **Write data.** Queries must be read-only; see [what the gateway allows](./authoring#what-the-gateway-allows).
- **Reach the engine directly.** Pods can talk only to Egret.
- **See another viewer's session.** Run mode starts one process per viewer and per published version, never shared between people, so one viewer's data cannot leak to another through the app's memory. Idle run pods are stopped after five minutes by default.
- **Keep a token forever.** A viewer's session token lasts 30 minutes idle and 8 hours at most, and dies when the viewer signs out.

Every gateway call is written to the audit log with the viewer, the app and the outcome, so access through apps is reviewable alongside every other access.

## When a viewer cannot open an app

Opening an app shows one of these messages when it cannot start:

| Message | Meaning |
|---|---|
| *You can't open this app* | The viewer lacks `app:read` on it, or the workspace denies running queries. Ask a workspace admin. |
| *App not found* | The app was deleted or belongs to another workspace. |
| *Nobody has published this app yet* | The author has not published a version. Ask them to publish before sharing. |
| *This app can't be opened right now* | The app is in the trash. |
| *Apps are not set up on this deployment* | The apps origin is not configured. An operator needs to set `apps.origin`. |

![The viewer page when the apps origin is not configured](/img/platform/apps/view-unavailable.png)

The last message is what the demo instance showed for **Revenue explorer**, so the running app could not be captured.

## Where apps are served

An app is served from a separate origin, a sibling subdomain of Egret's own host (for example `apps.egret.example`), inside a sandboxed iframe. Egret hands the browser a one-time ticket that lasts 30 seconds by default; the apps origin turns it into a cookie for that viewer. Apps get their own origin so that an app's JavaScript cannot read Egret's session. An operator sets this up with `apps.origin`, `apps.egret_origin` and an `[apps.pod]` launcher (`kubernetes` in production).

## Limits and known issues

- The running app could not be opened in the demo environment; its behaviour is from the source.
- There is no public sharing and no embedding.

## Further reading

- [Write an app](./authoring)
- [Databases](../../workspace-settings/databases)
- [Shared objects](../../workspace-settings/shared-objects)
