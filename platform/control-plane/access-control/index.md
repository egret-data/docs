---
sidebar_position: 6
---

# Access control

Platform administration of identity and permissions lives under **Overview**, **Identity** and **Access** in the Control Plane sidebar. This section explains each screen and how they fit together.

![The Access overview with counts, items that need attention, recent changes and the four layers of access](/img/platform/control-plane-access-overview.png)

| Sidebar entry | Page | Use it to |
|---|---|---|
| **Overview → Access overview** | This page | See posture and recent changes. |
| **Identity → Users** | [Users](./users.md) | Create local accounts, disable people, assign platform roles. |
| **Identity → Groups** | [Groups](./groups.md) | Create local groups, see synced groups, assign roles to a group. |
| **Identity → Roles** | [Roles](./roles.md) | Create custom roles and choose their permissions. |
| **Access → Access Explorer** | [Access Explorer](./access-explorer.md) | See what a person reaches, or who reaches an object. |
| **Access → Permissions** | [Permissions catalog](./permissions.md) | Browse every permission and the roles that grant it. |

Access overview needs the **user:read** permission, which platform admins hold.

## The Access overview page

### The counts

| Tile | Meaning |
|---|---|
| **USERS** | Total accounts, with how many are active. |
| **GROUPS** | Total groups, split into *local* and *synced* (from the identity provider). |
| **ROLES** | Total roles, split into platform and workspace roles. |
| **PLATFORM ADMINS** | Users holding the `platform_admin` role, and their share of all users (for example *15% of users — review*). |

### Needs attention

Findings about the way access is set up. Each has a title, a sentence and a **Review** button. Examples on the demo instance:

- **6 roles have no assignees**: *They grant nothing until assigned to a user or group.* Roles that are only used as workspace roles count here.
- **2 platform admins · 15% of users**: *Review who holds full-platform access and trim if it's too broad.*

### Recent changes

The latest audit entries with the action (for example `perm_grant:create`), the resource type, the actor and the time. The actor is shown by email (`by admin@egret.local`), or by a short user id when the account no longer exists. **View audit log** opens the full [Audit log](../audit-log.md).

### How access works

Four cards explain the layers and link to the screen for each:

1. **Identity**: who, users and groups synced from OIDC. Links to **Users**.
2. **Roles & permissions**: RBAC, which actions each role grants. Links to **Roles**.
3. **Object grants**: per-object access (Cedar), who can open a dataset, chart or dashboard. Links to **Explore**.
4. **Data plane**: column masking and row filters by tag (Ranger), enforced in the query engine. Links to **Engine & policy** in Governance.

These are the layers described in [How permissions work](../../data-governance/concepts.md).

## Who can do what here

The Control Plane pages check platform permissions: **user:read**, **group:read**, **role:read** (and the matching `create`, `update`, `delete`) for the Identity and Access pages. **Workspaces** and the **Audit log** need a platform admin. The [permissions catalog](./permissions.md) lists every permission.

## Limits and known issues

- On a new instance only `platform_admin` is assigned, so the **roles have no assignees** finding is expected.
- Synced groups cannot be edited here. Their names and membership come from the identity provider.

## Further reading

- [How permissions work](../../data-governance/concepts.md)
- [Workspace members](../../workspace-settings/members.md)
