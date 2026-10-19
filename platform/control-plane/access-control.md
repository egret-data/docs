---
sidebar_position: 6
---

# Access control

Platform administration of identity and permissions lives under **Overview**, **Identity** and **Access** in the Control Plane sidebar.

## Access overview

![Access overview](/img/platform/control-plane-access-overview.png)

Who can access what, through which layer, plus the posture issues worth your attention (for example *roles with no assignees* and the share of users who are platform admins). **How access works** summarises the layers:

1. **Identity**: users and groups, synced from OIDC.
2. **Roles & permissions**: RBAC, which actions each role grants.
3. **Object grants**: per-object access (Cedar), who can open a dataset, chart or dashboard.
4. **Data plane**: column masking and row filters by tag (Ranger), enforced in the query engine.

## Users, groups and roles

![Users](/img/platform/control-plane-users.png)

**Users** lists accounts with their provider (*local* or *oidc*), status, roles and group count. **Groups** lists groups synced from your identity provider. **Roles**:

![Roles](/img/platform/control-plane-roles.png)

*Platform roles* apply across all of Egret; *workspace roles* apply inside one workspace and are assigned per workspace on its Members page. Built-in roles are `platform_admin`, `data_steward`, `ws_admin`, `ws_editor` and `ws_viewer`; **New role** and **Tree view** are available.

## Access Explorer and Permissions

![Access Explorer](/img/platform/control-plane-access-explorer.png)

The **Access Explorer** answers two questions with full provenance: what can this user or group reach, and who can reach this object. **Permissions** is the full catalog of platform permissions (64 across 18 areas) and how many roles each is granted to; change what a role grants on the Roles page.

![Permissions](/img/platform/control-plane-permissions.png)
