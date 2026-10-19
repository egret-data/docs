---
sidebar_position: 31
sidebar_label: Egret warehouses
description: REST endpoints in the control-plane-catalog group.
---

# Egret warehouses API

Embedded-catalog warehouse management: warehouses, catalog roles/grants/clients, browse, and admin ops.

This page lists 30 endpoints (OpenAPI tag `control-plane-catalog`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| DELETE | `/api/control-plane/clients/{id}` | `revoke_client` |  |
| DELETE | `/api/control-plane/grants/{grant_id}` | `revoke_grant` |  |
| DELETE | `/api/control-plane/roles/{role_id}` | `delete_role` |  |
| GET | `/api/control-plane/roles/{role_id}/grants` | `list_grants` |  |
| POST | `/api/control-plane/roles/{role_id}/grants` | `add_grant` |  |
| GET | `/api/control-plane/warehouses` | `list_warehouses` |  |
| POST | `/api/control-plane/warehouses` | `create_warehouse` |  |
| GET | `/api/control-plane/warehouses/{id}` | `get_warehouse` |  |
| DELETE | `/api/control-plane/warehouses/{id}` | `delete_warehouse` |  |
| GET | `/api/control-plane/warehouses/{id}/clients` | `list_clients` |  |
| POST | `/api/control-plane/warehouses/{id}/clients` | `create_client` |  |
| GET | `/api/control-plane/warehouses/{id}/config` | `warehouse_config` |  |
| PUT | `/api/control-plane/warehouses/{id}/delete-profile` | `set_delete_profile_route` |  |
| GET | `/api/control-plane/warehouses/{id}/deleted-tabulars` | `browse_deleted` |  |
| PUT | `/api/control-plane/warehouses/{id}/format-policy` | `set_format_policy` |  |
| GET | `/api/control-plane/warehouses/{id}/namespaces` | `browse_namespaces` |  |
| GET | `/api/control-plane/warehouses/{id}/namespaces/{ns}/tables` | `browse_tables` |  |
| GET | `/api/control-plane/warehouses/{id}/namespaces/{ns}/tables/{table}` | `browse_schema` |  |
| GET | `/api/control-plane/warehouses/{id}/namespaces/{ns}/views/{view}` | `browse_view` |  |
| PUT | `/api/control-plane/warehouses/{id}/protection` | `set_protection` |  |
| GET | `/api/control-plane/warehouses/{id}/roles` | `list_roles` |  |
| POST | `/api/control-plane/warehouses/{id}/roles` | `create_role` |  |
| GET | `/api/control-plane/warehouses/{id}/search` | `search_tabulars` |  |
| PUT | `/api/control-plane/warehouses/{id}/status` | `set_warehouse_status` |  |
| PUT | `/api/control-plane/warehouses/{id}/storage-credential` | `rotate_credential` |  |
| GET | `/api/control-plane/warehouses/{id}/tasks` | `list_tasks` |  |
| POST | `/api/control-plane/warehouses/{id}/undrop` | `undrop_tabular` |  |
| GET | `/api/control-plane/warehouses/{warehouse_id}/resource-tags` | `list_resource_tags` |  |
| PUT | `/api/control-plane/warehouses/{warehouse_id}/resource-tags` | `assign_resource_tag` |  |
| DELETE | `/api/control-plane/warehouses/{warehouse_id}/resource-tags` | `unassign_resource_tag` |  |

## DELETE `/api/control-plane/clients/{id}`

Operation id: `revoke_client`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:delete permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Catalog Client id |

| Status | Meaning |
|---|---|
| 204 | Catalog Client revoked |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:delete permission |
| 500 | Internal error |

## DELETE `/api/control-plane/grants/{grant_id}`

Operation id: `revoke_grant`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:delete permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `grant_id` | path | string (uuid) | yes | Grant id |

| Status | Meaning |
|---|---|
| 204 | Grant revoked |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:delete permission |
| 500 | Internal error |

## DELETE `/api/control-plane/roles/{role_id}`

Operation id: `delete_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:delete permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `role_id` | path | string (uuid) | yes | Catalog role id |

| Status | Meaning |
|---|---|
| 204 | Catalog role deleted |
| 400 | Role is in use by one or more Catalog Clients |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:delete permission |
| 500 | Internal error |

## GET `/api/control-plane/roles/{role_id}/grants`

Operation id: `list_grants`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `role_id` | path | string (uuid) | yes | Catalog role id |

**Response 200 (application/json)**: array of `GrantDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `securableType` | string | yes |  |
| `namespace` | string[], nullable | no |  |
| `tableName` | string, nullable | no |  |
| `privilege` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Grants held by the catalog role |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |

## POST `/api/control-plane/roles/{role_id}/grants`

Operation id: `add_grant`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:create permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `role_id` | path | string (uuid) | yes | Catalog role id |

**Request body (application/json)**: `AddGrantBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `securableType` | string | yes |  |
| `namespace` | string[], nullable | no |  |
| `tableName` | string, nullable | no |  |
| `privilege` | string | yes |  |

| Status | Meaning |
|---|---|
| 201 | Grant added to the catalog role |
| 400 | Invalid securable/privilege |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:create permission |
| 500 | Internal error |

## GET `/api/control-plane/warehouses`

Operation id: `list_warehouses`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

**Response 200 (application/json)**: array of `WarehouseDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `workspaceId` | string (uuid) | yes |  |
| `storageConnId` | string (uuid) | yes |  |
| `lakekeeperWarehouseId` | string, nullable | no |  |

| Status | Meaning |
|---|---|
| 200 | Embedded-catalog warehouses (egret rows) |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |

## POST `/api/control-plane/warehouses`

Operation id: `create_warehouse`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:create permission.

**Request body (application/json)**: `CreateWarehouseBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `workspaceId` | string (uuid) | yes |  |
| `storageConnectionId` | string (uuid) | yes |  |

**Response 201 (application/json)**: `WarehouseDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `workspaceId` | string (uuid) | yes |  |
| `storageConnId` | string (uuid) | yes |  |
| `lakekeeperWarehouseId` | string, nullable | no |  |

| Status | Meaning |
|---|---|
| 201 | Warehouse created (egret row + lakekeeper warehouse when a provisioner is wired) with its registry catalog, assigned to the workspace |
| 400 | Unknown storage connection or invalid input |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:create permission |
| 409 | A warehouse with this name already exists |
| 500 | Internal error |
| 502 | Embedded catalog unreachable while provisioning |

## GET `/api/control-plane/warehouses/{id}`

Operation id: `get_warehouse`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Response 200 (application/json)**: `WarehouseDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `workspaceId` | string (uuid) | yes |  |
| `storageConnId` | string (uuid) | yes |  |
| `lakekeeperWarehouseId` | string, nullable | no |  |

| Status | Meaning |
|---|---|
| 200 | The warehouse |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 404 | No such warehouse |
| 500 | Internal error |

## DELETE `/api/control-plane/warehouses/{id}`

Operation id: `delete_warehouse`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:delete permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

| Status | Meaning |
|---|---|
| 204 | Warehouse deleted |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:delete permission |
| 409 | The warehouse cannot be deleted yet: its registry catalog is attached to an engine, or a concurrent engine create has just created and assigned its catalog (retry) |
| 500 | Internal error |

## GET `/api/control-plane/warehouses/{id}/clients`

Operation id: `list_clients`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Response 200 (application/json)**: array of `ClientDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `consumerType` | string | yes |  |
| `catalogRoleId` | string (uuid) | yes |  |
| `clientId` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Catalog Clients bound to the warehouse |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |

## POST `/api/control-plane/warehouses/{id}/clients`

Operation id: `create_client`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:create permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Request body (application/json)**: `CreateClientBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `consumerType` | string | yes |  |
| `workspaceId` | string (uuid) | yes |  |
| `catalogRoleId` | string (uuid) | yes |  |

**Response 201 (application/json)**: `CreatedClientDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `clientId` | string | yes |  |
| `clientSecret` | string | yes | Shown ONCE. |

| Status | Meaning |
|---|---|
| 201 | Catalog Client created; client_secret is shown ONCE |
| 400 | Unknown consumerType (engine or external) |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:create permission |
| 404 | No such warehouse or catalog role |
| 500 | Internal error |

## GET `/api/control-plane/warehouses/{id}/config`

Operation id: `warehouse_config`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Response 200 (application/json)**: `WarehouseConfigDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `active` | boolean | yes |  |
| `deleteProfileSeconds` | integer (int64), nullable | no |  |
| `numTables` | integer (int64) | yes |  |
| `numViews` | integer (int64) | yes |  |
| `statsUpdatedMs` | integer (int64) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Warehouse admin config (status, soft-delete TTL, statistics) |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 404 | No such warehouse/browser |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## PUT `/api/control-plane/warehouses/{id}/delete-profile`

Operation id: `set_delete_profile_route`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Request body (application/json)**: `DeleteProfileBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `seconds` | integer (int64), nullable | no | Soft-delete retention in seconds; null = hard delete. |

| Status | Meaning |
|---|---|
| 204 | Soft-delete retention updated |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such warehouse/browser |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## GET `/api/control-plane/warehouses/{id}/deleted-tabulars`

Operation id: `browse_deleted`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Response 200 (application/json)**: array of `DeletedTabularDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `namespace` | string[] | yes |  |
| `kind` | string | yes |  |
| `deletedAt` | string (date-time) | yes |  |
| `expiration` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Soft-deleted tables/views awaiting purge |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## PUT `/api/control-plane/warehouses/{id}/format-policy`

Operation id: `set_format_policy`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Request body (application/json)**: `FormatPolicyBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `versions` | integer (int32)[] | yes |  |

| Status | Meaning |
|---|---|
| 204 | Allowed Iceberg format versions updated |
| 400 | At least one format version is required |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such warehouse/browser |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## GET `/api/control-plane/warehouses/{id}/namespaces`

Operation id: `browse_namespaces`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Response 200 (application/json)**: array of `NamespaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `parts` | string[] | yes |  |
| `id` | string (uuid), nullable | no |  |
| `protected` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Top-level namespaces (empty when no browser/lakekeeper warehouse is wired) |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## GET `/api/control-plane/warehouses/{id}/namespaces/{ns}/tables`

Operation id: `browse_tables`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |
| `ns` | path | string | yes | Dot-delimited namespace |

**Response 200 (application/json)**: array of `TabularDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `kind` | string | yes |  |
| `id` | string (uuid), nullable | no |  |
| `protected` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Tables and views in the namespace |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## GET `/api/control-plane/warehouses/{id}/namespaces/{ns}/tables/{table}`

Operation id: `browse_schema`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |
| `ns` | path | string | yes | Dot-delimited namespace |
| `table` | path | string | yes | Table name |

**Response 200 (application/json)**: `SchemaDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `location` | string | yes |  |
| `formatVersion` | integer (int32) | yes |  |
| `lastUpdatedMs` | integer (int64) | yes |  |
| `currentSnapshotId` | integer (int64), nullable | no |  |
| `snapshotCount` | integer | yes |  |
| `columns` | ColumnDto[] | yes |  |
| `partitionFields` | PartitionDto[] | yes |  |
| `sortFields` | SortDto[] | yes |  |
| `properties` | object | yes |  |
| `snapshots` | SnapshotDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Table detail (schema, partitioning, snapshots) |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 404 | No such warehouse/browser or table |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## GET `/api/control-plane/warehouses/{id}/namespaces/{ns}/views/{view}`

Operation id: `browse_view`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |
| `ns` | path | string | yes | Dot-delimited namespace |
| `view` | path | string | yes | View name |

**Response 200 (application/json)**: array of `ColumnDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `type` | string | yes |  |
| `required` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | The view's current-schema columns |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 404 | No such warehouse/browser or view |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## PUT `/api/control-plane/warehouses/{id}/protection`

Operation id: `set_protection`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Request body (application/json)**: `ProtectionBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `target` | string | yes |  |
| `id` | string (uuid) | yes |  |
| `protected` | boolean | yes |  |

**Response 200 (application/json)**: `ProtectionDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `protected` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | New protected flag for the target |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such warehouse/browser or target |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## GET `/api/control-plane/warehouses/{id}/roles`

Operation id: `list_roles`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Response 200 (application/json)**: array of `CatalogRoleDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `consumerType` | string | yes |  |
| `description` | string, nullable | no |  |

| Status | Meaning |
|---|---|
| 200 | Catalog roles defined on the warehouse |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |

## POST `/api/control-plane/warehouses/{id}/roles`

Operation id: `create_role`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:create permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Request body (application/json)**: `CreateRoleBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `consumerType` | string | yes |  |
| `description` | string, nullable | no |  |

**Response 201 (application/json)**: `CatalogRoleDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `consumerType` | string | yes |  |
| `description` | string, nullable | no |  |

| Status | Meaning |
|---|---|
| 201 | Catalog role created |
| 400 | Unknown consumerType (engine or external) |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:create permission |
| 409 | A role with this name already exists |
| 500 | Internal error |

## GET `/api/control-plane/warehouses/{id}/search`

Operation id: `search_tabulars`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |
| `q` | query | string | no | Table/view name search term (empty ⇒ empty result) |

**Response 200 (application/json)**: array of `SearchResultDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `namespace` | string[] | yes |  |
| `name` | string | yes |  |
| `kind` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Table/view name-search matches |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## PUT `/api/control-plane/warehouses/{id}/status`

Operation id: `set_warehouse_status`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Request body (application/json)**: `StatusBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `active` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 204 | Warehouse activated/deactivated |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such warehouse/browser |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## PUT `/api/control-plane/warehouses/{id}/storage-credential`

Operation id: `rotate_credential`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Request body (application/json)**: `RotateCredBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `accessKey` | string | yes |  |
| `secretKey` | string | yes |  |

| Status | Meaning |
|---|---|
| 204 | S3 storage credential rotated |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such warehouse/browser |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## GET `/api/control-plane/warehouses/{id}/tasks`

Operation id: `list_tasks`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Response 200 (application/json)**: array of `TaskDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `queue` | string | yes |  |
| `entity` | string, nullable | no |  |
| `status` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Recent background (GC) tasks on the warehouse |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## POST `/api/control-plane/warehouses/{id}/undrop`

Operation id: `undrop_tabular`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Warehouse id |

**Request body (application/json)**: `UndropBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `kind` | string | yes |  |
| `id` | string (uuid) | yes |  |

| Status | Meaning |
|---|---|
| 204 | Table/view recovered |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such warehouse/browser or tabular |
| 409 | A view on a catalog whose profile has classified columns: a restored view would bypass the classification hold, so it is refused; re-create it with CREATE VIEW |
| 500 | Internal error |
| 502 | Embedded catalog unreachable |

## GET `/api/control-plane/warehouses/{warehouse_id}/resource-tags`

Operation id: `list_resource_tags`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `warehouse_id` | path | string (uuid) | yes | Warehouse id |
| `schema` | query | string | yes | Schema name |
| `table` | query | string | yes | Table name |

**Response 200 (application/json)**: array of `ResourceTagDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `schema` | string | yes |  |
| `table` | string | yes |  |
| `column` | string | yes |  |
| `tag` | TagDto | yes | A classification tag carried by an object (Access P3.1). Local snake_case DTO so egret-bi does not depend on egret-controlplane. `assignment_count` is the tag's global assignment count (as computed by `TagRepo`). |

| Status | Meaning |
|---|---|
| 200 | The table's tags plus its columns' tags |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |

## PUT `/api/control-plane/warehouses/{warehouse_id}/resource-tags`

Operation id: `assign_resource_tag`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `warehouse_id` | path | string (uuid) | yes | Warehouse id |

**Request body (application/json)**: `ResourceTagBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `schema` | string | yes |  |
| `table` | string | yes |  |
| `column` | string, nullable | no | Empty / omitted ⇒ a table-level tag. |
| `tag_id` | string (uuid) | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Tag assigned to the catalog resource (idempotent) |
| 400 | The coordinate cannot be stored (an empty schema or table, or `*`/`?` in any level — see migration 0177), or the tag is being attached to a whole TABLE while a tag-addressed mask names it, which would make that table unreadable rather than... |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 409 | A rule overlap: the assignment would make two mask (or two row-filter) policies decide one column differently (compiled rules, hand-written tag policies, or one of each), or a profile it recompiles already holds such a pair. The body adds... |
| 500 | Internal error |

## DELETE `/api/control-plane/warehouses/{warehouse_id}/resource-tags`

Operation id: `unassign_resource_tag`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `warehouse_id` | path | string (uuid) | yes | Warehouse id |

**Request body (application/json)**: `ResourceTagBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `schema` | string | yes |  |
| `table` | string | yes |  |
| `column` | string, nullable | no | Empty / omitted ⇒ a table-level tag. |
| `tag_id` | string (uuid) | yes |  |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Tag removed from the catalog resource (idempotent) |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 409 | A rule overlap that the unassignment does not remove: a profile it recompiles already holds two mask (or two row-filter) rules that decide one request differently. Same body as the assignment's 409 |
| 500 | Internal error |

