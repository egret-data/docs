---
sidebar_position: 3
---

# Permissions

Egret authorizes actions with a catalog of named permissions. This page lists all 64 of them, grouped by area, with what each
allows and which built-in roles hold it on a fresh install. The catalog is defined in code (`crates/egret-core/src/rbac.rs`)
and every role's permission rows must name a key from it. The same list appears in the app under **Control Plane →
Permissions**, with the number of roles each is granted to.

## How permissions work

- A permission is a string `resource:action`, for example `dataset:manage` or `engine:read`.
- A **role** is a named set of permissions. Roles are assigned to users and groups: *platform roles* under **Control Plane**,
  *workspace roles* per workspace under **Manage → Workspace settings → Members**. See [Access
  control](../control-plane/access-control) and [Roles and permissions](../workspace-settings/roles-and-permissions).
- Each permission has a **scope**:

  | Scope | Checked against | Granted by |
  |---|---|---|
  | `platform` | The whole platform: control-plane routes such as engines, storage, catalogs, secrets, users | A platform role |
  | `workspace` | One workspace: the datasets, charts, dashboards, queries and flows inside it | A workspace role, or an object-level grant on one object |

- **`platform_admin` passes every check.** The authorization model has a rule that lets members of the role do anything, so a
  permission that no other built-in role holds is, in practice, an administrator's permission.
- A person's effective permissions come from every role they hold directly and through groups. **Access Explorer** in the
  Control Plane shows what a user can reach and which grant gives it.
- Permissions that guard **changes to the authorization graph itself** (creating roles, assigning permissions to roles, putting
  users in groups, assigning platform roles, reading the audit log) are not in the catalog. They are reserved to
  `platform_admin`, so nobody can delegate the power to give themselves more power.

## Built-in roles

| Role | Scope | Description | Permissions |
|---|---|---|---|
| `platform_admin` | platform | Full platform control | Everything, through the bypass above |
| `data_steward` | platform | Manage catalog, policy, databases | 16 |
| `ws_admin` | workspace | Manage workspace members and resources | 25 |
| `ws_editor` | workspace | Create and edit workspace content | 17 |
| `ws_viewer` | workspace | View workspace content | 7 |
| `data_api_invoker` | workspace | Call one published Data API endpoint. Granted object-scoped to a service account, never assigned as a workspace membership | 1 |

You can create more roles under **Control Plane → Roles**.

## The catalog

The last column is what a fresh install grants; your roles may differ.

<!-- perm-table:start -->
### Engines

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `engine:read` | platform | View engines | `data_steward` |
| `engine:create` | platform | Create engines | none (only the `platform_admin` bypass) |
| `engine:update` | platform | Update engine config | none (only the `platform_admin` bypass) |
| `engine:delete` | platform | Delete engines | none (only the `platform_admin` bypass) |
| `engine:provision` | platform | Provision / restart engines on the cluster | none (only the `platform_admin` bypass) |
| `engine:kill` | platform | Kill running queries | none (only the `platform_admin` bypass) |

### Catalogs

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `catalog_registry:read` | platform | View registry catalogs and their engine attachments, and browse an egret warehouse's namespaces, tables and Catalog Clients | `data_steward` |
| `catalog_registry:create` | platform | Create registry catalogs and egret warehouses, and mint Catalog Clients (data-lake credentials) and catalog roles | none (only the `platform_admin` bypass) |
| `catalog_registry:update` | platform | Edit registry catalogs, re-apply them to engines, assign them to workspaces, and change an egret warehouse's settings, protection and format policy | none (only the `platform_admin` bypass) |
| `catalog_registry:delete` | platform | Delete registry catalogs and egret warehouses, and revoke Catalog Clients and catalog roles | none (only the `platform_admin` bypass) |

### Storage

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `storage:read` | platform | View storage registrations | `data_steward` |
| `storage:create` | platform | Create storage registrations | none (only the `platform_admin` bypass) |
| `storage:update` | platform | Update storage registrations | none (only the `platform_admin` bypass) |
| `storage:delete` | platform | Delete storage registrations | none (only the `platform_admin` bypass) |

### Secrets

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `secret:read` | platform | View secrets (metadata) | none (only the `platform_admin` bypass) |
| `secret:create` | platform | Create secrets | none (only the `platform_admin` bypass) |
| `secret:update` | platform | Update secrets | none (only the `platform_admin` bypass) |
| `secret:delete` | platform | Delete secrets | none (only the `platform_admin` bypass) |

### Data API

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `service_account:read` | workspace | View service accounts and their OAuth2 clients (never the secret) | `ws_admin` |
| `service_account:manage` | workspace | Create and delete service accounts and issue their OAuth2 clients | `ws_admin` |
| `data_api_endpoint:read` | workspace | View Data API endpoints and their versions | `ws_admin` |
| `data_api_endpoint:manage` | workspace | Create, edit, publish and roll back Data API endpoints | `ws_admin` |
| `data_api_endpoint:invoke` | workspace | Call a published Data API endpoint | `data_api_invoker`, `ws_admin` |

### Workflows

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `workflow:read` | workspace | View flow drafts, their validation report, and their published versions | `ws_admin`, `ws_editor` |
| `workflow:manage` | workspace | Create, edit, publish and delete flow drafts; restore a flow from the trash or delete it permanently | `ws_admin`, `ws_editor` |
| `workflow:use_secrets` | workspace | Save and publish flows that call secret(), which reads any secret of the workspace | `ws_admin` |

### Policies

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `policy:read` | platform | View Ranger policies | `data_steward` |
| `policy:create` | platform | Create policies | `data_steward` |
| `policy:update` | platform | Update policies | `data_steward` |
| `policy:delete` | platform | Delete policies | `data_steward` |
| `policy:seed` | platform | Seed default policies for a profile | `data_steward` |

### Classifications

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `tag:read` | platform | View classification tags | `data_steward` |
| `tag:manage` | platform | Create, edit, and delete classification tags | `data_steward` |

### Workspaces

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `workspace:read` | platform | View workspaces | `data_steward`, `platform_admin` |
| `workspace:create` | platform | Create workspaces | `platform_admin` |
| `workspace:update` | platform | Update workspaces | `platform_admin` |
| `workspace:archive` | platform | Archive workspaces | `platform_admin` |
| `workspace:manage_members` | workspace | Manage workspace members and workspace-scoped resources | `ws_admin` |

### Users

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `user:read` | platform | View users | `data_steward`, `platform_admin` |
| `user:create` | platform | Create local users | none (only the `platform_admin` bypass) |
| `user:update` | platform | Update users (name/status) | none (only the `platform_admin` bypass) |
| `user:disable` | platform | Disable users | none (only the `platform_admin` bypass) |
| `user:delete` | platform | Delete users | none (only the `platform_admin` bypass) |

### Groups

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `group:read` | platform | View groups | `data_steward` |
| `group:create` | platform | Create local groups | none (only the `platform_admin` bypass) |
| `group:update` | platform | Update local groups | none (only the `platform_admin` bypass) |
| `group:delete` | platform | Delete local groups | none (only the `platform_admin` bypass) |

### Roles

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `role:read` | platform | View roles | `data_steward` |

### SQL Lab

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `query:run` | workspace | Run SQL queries in a workspace | `ws_admin`, `ws_editor` |
| `saved_query:read` | workspace | View saved queries | `ws_admin`, `ws_editor`, `ws_viewer` |
| `saved_query:manage` | workspace | Create, edit, and delete saved queries | `ws_admin`, `ws_editor` |

### Datasets

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `dataset:read` | workspace | View datasets | `ws_admin`, `ws_editor`, `ws_viewer` |
| `dataset:manage` | workspace | Create, update, and delete datasets | `ws_admin`, `ws_editor` |
| `dataset:certify` | platform | Mark datasets and their metrics as certified, and withdraw certification | `data_steward` |

### Charts

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `chart:read` | workspace | View charts | `ws_admin`, `ws_editor`, `ws_viewer` |
| `chart:manage` | workspace | Create, update, and delete charts | `ws_admin`, `ws_editor` |

### Dashboards

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `dashboard:read` | workspace | View dashboards | `ws_admin`, `ws_editor`, `ws_viewer` |
| `dashboard:manage` | workspace | Create, update, and delete dashboards | `ws_admin`, `ws_editor` |
| `dashboard:certify` | platform | Mark dashboards as certified, and withdraw certification | `data_steward` |

### Apps

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `app:read` | workspace | Open published data apps | `ws_admin`, `ws_editor`, `ws_viewer` |
| `app:write` | workspace | Author, publish and restore data apps | `ws_admin`, `ws_editor` |
| `app:manage` | workspace | Manage data-app shares | `ws_admin` |

### Alerts & Reports

| Permission | Scope | What it allows | Built-in roles that hold it |
|---|---|---|---|
| `alert:manage` | workspace | Create, edit, and delete scheduled alerts and reports | `ws_admin`, `ws_editor` |
| `alert:read` | workspace | View scheduled alerts and reports | `ws_admin`, `ws_editor`, `ws_viewer` |

<!-- perm-table:end -->

## Reading the table

- **"none (only the `platform_admin` bypass)"** means no built-in role holds the permission, so only an administrator can act
  until you grant it to a role of your own.
- `*:read` permissions let you view; `*:manage` lets you create, edit and delete within the workspace. Note that these are flat:
  a role that may edit a flow must also hold `workflow:read` to list it.
- `dataset:certify` and `dashboard:certify` are platform-scope permissions that control who can mark a dataset, metric or
  dashboard as certified.
- The four `catalog_registry:*` permissions are **wider than their name**: they also cover browsing an Egret warehouse's
  namespaces and tables, creating and deleting warehouses, and minting and revoking Catalog Clients, which are real
  data-lake credentials. Grant them as you would grant access to the lake.
- `workflow:use_secrets` is separate from `workflow:manage` on purpose: a flow's author decides where a secret's value goes
  (into a query, into a connection URL), so saving a flow that calls `secret()` is its own permission.
- `data_api_endpoint:invoke` is meant to be held **object-scoped** by a service account (one grant per endpoint), not
  workspace-wide by a person.
- A 403 from the REST API names the missing permission, for example *Missing dataset:manage permission*. The
  [REST API reference](./rest-api) lists it under every endpoint.

## Further reading

- [Access control](../control-plane/access-control)
- [Roles and permissions](../workspace-settings/roles-and-permissions)
- [Shared objects](../workspace-settings/shared-objects)
