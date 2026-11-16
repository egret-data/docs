---
sidebar_position: 7
---

# Service accounts

A **service account** is an identity for software, not a person: a pipeline, a scheduled job or an integration that calls egret or reaches the data. It is a first-class principal, a peer of a user. You can put it in groups, give it roles and grant it access to objects, and you can disable or delete it on its own.

:::note
Service accounts are managed through the REST API. A dedicated **Service accounts** page and a credentials screen in the Control Plane are not available yet.
:::

## What a service account is

A service account is stored as a user record, so every place that takes a user (a group, a role assignment, a grant) takes a service account too. It differs from a person in two ways:

- **It never signs in interactively.** It has no password and no single sign-on session.
- **It can never hold `platform_admin`.** egret refuses to grant it the role, directly or through a group.

## Scope

| Scope | Belongs to | Can hold |
|---|---|---|
| `platform` | The platform, no workspace. | Platform roles and platform groups. |
| `workspace` | One workspace (`workspace_id`). | Access inside that workspace. |

List them filtered by scope and workspace to see what exists. The service accounts you already created for [Data API](../../data-api/overview.md) endpoints are unchanged and now appear in this list as workspace-scoped service accounts.

## Manage service accounts

All paths are under `/api/control-plane/service-accounts` and need a platform session. Request and response shapes are in the [REST API reference](../../reference/rest-api/control-plane-access.md).

| Task | Request | Permission |
|---|---|---|
| List | `GET /service-accounts?scope=&workspace_id=` | `user:read` |
| Create | `POST /service-accounts` | `user:create` |
| Read one, with its group and role memberships | `GET /service-accounts/{id}` | `user:read` |
| Disable | `POST /service-accounts/{id}/disable` | `user:update` |
| Enable | `POST /service-accounts/{id}/enable` | `user:update` |
| Delete | `DELETE /service-accounts/{id}` | `user:delete` |
| Add to a group | `POST /service-accounts/{id}/groups` | `group:manage_members` |
| Remove from a group | `DELETE /service-accounts/{id}/groups/{group_id}` | `group:manage_members` |
| Add a role | `POST /service-accounts/{id}/roles` | `user:assign_role` |
| Remove a role | `DELETE /service-accounts/{id}/roles/{role_id}` | `user:assign_role` |

`group:manage_members` and `user:assign_role` guard changes to the authorization graph itself, so they are reserved to platform admins and do not appear in the [permissions catalog](./permissions.md).

### Create a service account

```http
POST /api/control-plane/service-accounts
Content-Type: application/json

{
  "scope": "workspace",
  "workspace_id": "<workspace id>",
  "name": "nightly-export",
  "description": "Reads the sales marts for the nightly export"
}
```

`scope` is `platform` or `workspace`. `workspace_id` applies to a workspace-scoped account; `description` is optional.

### Add it to a group or give it a role

```http
POST /api/control-plane/service-accounts/{id}/groups
Content-Type: application/json

{ "group_id": "<group id>" }
```

```http
POST /api/control-plane/service-accounts/{id}/roles
Content-Type: application/json

{ "role_id": "<role id>", "scope_type": "platform" }
```

Role membership here is at platform scope.

## Guards

egret refuses these changes:

- **Adding a service account to an OIDC-synced group.** The identity provider owns that membership, and a service account is not in the provider. Use a local group.
- **Granting it `platform_admin`**, or adding it to a group that holds `platform_admin`.

See [Groups](./groups.md) for synced and local groups.

## Disable and delete

Disabling is the kill switch, with the same effect as [disabling a user](./users.md#disable-or-enable-a-user): egret sets the status, recompiles policy so the engines stop honouring the account, and revokes its sessions and tokens. **Enable** reverses the status change. Use it first when a credential may be leaked; you can re-enable the account later. It also stops the account's [Catalog credentials](#credentials).

Deleting a service account removes the account and sweeps every grant that names it, then recompiles policy. It cannot be undone.

## Credentials

A service account holds **credentials** across two audiences:

| Audience | Value | Lets the client |
|---|---|---|
| Data API | `data-api` | Call the account's [Data API](../../data-api/overview.md) endpoints. |
| Catalog | `catalog` | Read the data lake directly. A catalog client is a credential of a service account; it is no longer ownerless. |

Every credential has the same lifecycle: it is `active`, `revoked` or `expired`, and you can rotate it, revoke it or set its expiry. A catalog credential also carries its warehouse and catalog role.

All paths are under `/api/control-plane/service-accounts/{id}/credentials`. Shapes are in the [REST API reference](../../reference/rest-api/control-plane-access.md).

| Task | Request | Permission |
|---|---|---|
| List, across both audiences | `GET /credentials` | `user:read` |
| Create | `POST /credentials` | The audience's mint permission |
| Rotate | `POST /credentials/{cid}/rotate` | `user:update` and the audience's mint permission |
| Revoke | `POST /credentials/{cid}/revoke` | `user:update` |
| Set or clear the expiry | `POST /credentials/{cid}/expiry` | `user:update` |

The mint permission is `catalog_registry:create` for `catalog` and `service_account:manage` for `data-api`, checked against the service account's workspace. See the [permissions reference](../../reference/permissions.md).

```http
POST /api/control-plane/service-accounts/{id}/credentials
Content-Type: application/json

{
  "audience": "catalog",
  "catalog": {
    "warehouse_id": "<warehouse id>",
    "catalog_role_id": "<catalog role id>",
    "consumer_type": "external"
  }
}
```

For `catalog`, supply `warehouse_id`, `catalog_role_id` and `consumer_type` (`engine` or `external`). The response carries the `client_secret` **once**; egret stores only a hash, so copy it now. Rotating mints a new secret and revokes the old credential.

### Scope rules

- A **workspace-scoped** service account holds credentials only in its own workspace.
- A **platform-scoped** service account can hold `catalog` credentials in any workspace. It cannot hold `data-api` credentials, which are bound to a workspace.

### When egret refuses a catalog credential

egret refuses a catalog credential when the owning service account is disabled, the credential is revoked or expired, or the credential's workspace is archived.

:::warning
Catalog credentials read the data lake (Iceberg) directly. They sit **outside** the data governance masking, row-filter and clearance model: engine policy does not apply to them. What governs them is the service account itself, so use **disable**, **revoke** and **expiry** to control access, and grant the catalog role sparingly.
:::

### Upgrade

On upgrade, egret gives every existing catalog client an owning service account at boot. The step is idempotent and needs no manual action. To run it again by hand, use `egret backfill catalog-client-sa`.

## Further reading

- [Users](./users.md)
- [Groups](./groups.md)
- [Roles](./roles.md)
- [REST API: Access control](../../reference/rest-api/control-plane-access.md)
