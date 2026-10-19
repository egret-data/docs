---
sidebar_position: 1
---

# General

**Manage → Workspace settings → General** shows the workspace's identity.

![Workspace general settings](/img/platform/settings-general.png)

| Field | Meaning |
|---|---|
| **Name** | The display name, shown in the workspace picker. |
| **Slug** | The short identifier used in URLs and the API, for example `default`. |
| **Workspace ID** | The immutable UUID. |

This page is **read-only**. Renaming or deleting a workspace is a platform-admin action in the
[Control Plane](../control-plane/workspaces), so a change cannot be made by accident from inside the workspace.
