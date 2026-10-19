---
sidebar_position: 30
sidebar_label: Catalog registry
description: REST endpoints in the control-plane-catalog-registry group.
---

# Catalog registry API

Catalog registry: platform catalogs, their engine attachments and workspace assignment.

This page lists 14 endpoints (OpenAPI tag `control-plane-catalog-registry`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/control-plane/catalogs` | `list_registry_catalogs` |  |
| POST | `/api/control-plane/catalogs` | `create_registry_catalog` |  |
| GET | `/api/control-plane/catalogs/{id}` | `get_registry_catalog` |  |
| PUT | `/api/control-plane/catalogs/{id}` | `update_registry_catalog` |  |
| DELETE | `/api/control-plane/catalogs/{id}` | `delete_registry_catalog` |  |
| POST | `/api/control-plane/catalogs/{id}/engines/{engine_id}` | `registry_attach_catalog` |  |
| DELETE | `/api/control-plane/catalogs/{id}/engines/{engine_id}` | `detach_catalog` |  |
| GET | `/api/control-plane/catalogs/{id}/impact` | `catalog_impact` |  |
| POST | `/api/control-plane/catalogs/{id}/reapply` | `reapply_registry_catalog` |  |
| POST | `/api/control-plane/catalogs/{id}/test` | `test_registry_catalog` |  |
| GET | `/api/control-plane/catalogs/{id}/workspaces` | `list_catalog_workspaces` |  |
| PUT | `/api/control-plane/catalogs/{id}/workspaces` | `set_catalog_workspaces` |  |
| POST | `/api/control-plane/engines/{id}/catalogs/{cid}` | `attach_catalog` |  |
| POST | `/api/control-plane/engines/{id}/catalogs/{cid}/apply` | `retry_catalog_apply` |  |

## GET `/api/control-plane/catalogs`

Operation id: `list_registry_catalogs`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `workspaceId` | query | string (uuid) | no | Only catalogs assigned to this workspace. |
| `secretId` | query | string (uuid) | no | Only catalogs referencing this secret (config or engine credential). |

**Response 200 (application/json)**: array of `RegistryCatalogDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `kind` | string | yes |  |
| `config` | object | yes |  |
| `advanced` | object | yes |  |
| `description` | string, nullable | no |  |
| `warehouseId` | string (uuid), nullable | no | The warehouse an egret catalog is. |
| `engines` | CatalogAttachmentDto[] | yes |  |
| `workspaceIds` | string (uuid)[] | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |
| `configError` | string, nullable | no | Why this row's stored `config` no longer parses, if it does not. A stored row the tightened validator now refuses stays visible and repairable instead of vanishing — and, critically, never fails the whole list (SP3c-1 review N1). |

| Status | Meaning |
|---|---|
| 200 | Registry catalogs with their engines and workspaces. A catalog whose stored configuration no longer parses is listed with `configError` set rather than omitted, and never fails the whole list |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 500 | Internal error |

## POST `/api/control-plane/catalogs`

Operation id: `create_registry_catalog`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:create permission.

**Request body (application/json)**: `CreateRegistryCatalogBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | SQL name on every engine: `^[a-z][a-z0-9_]\{0,62\}$`, immutable. |
| `kind` | string | yes | iceberg \| hive \| delta_lake \| hudi \| jdbc \| elasticsearch \| tpch \| tpcds \| generic |
| `config` | object | no |  |
| `advanced` | object | no |  |
| `description` | string, nullable | no |  |

**Response 201 (application/json)**: `RegistryCatalogDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `kind` | string | yes |  |
| `config` | object | yes |  |
| `advanced` | object | yes |  |
| `description` | string, nullable | no |  |
| `warehouseId` | string (uuid), nullable | no | The warehouse an egret catalog is. |
| `engines` | CatalogAttachmentDto[] | yes |  |
| `workspaceIds` | string (uuid)[] | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |
| `configError` | string, nullable | no | Why this row's stored `config` no longer parses, if it does not. A stored row the tightened validator now refuses stays visible and repairable instead of vanishing — and, critically, never fails the whole list (SP3c-1 review N1). |

| Status | Meaning |
|---|---|
| 201 | Catalog created (not attached to any engine) |
| 400 | Invalid name, kind or configuration, an unknown secret or storage connection, or an egret warehouse catalog (those are created with their warehouse) |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:create permission |
| 409 | A catalog with this name already exists |
| 500 | Internal error |

## GET `/api/control-plane/catalogs/{id}`

Operation id: `get_registry_catalog`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Registry catalog id |

**Response 200 (application/json)**: `RegistryCatalogDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `kind` | string | yes |  |
| `config` | object | yes |  |
| `advanced` | object | yes |  |
| `description` | string, nullable | no |  |
| `warehouseId` | string (uuid), nullable | no | The warehouse an egret catalog is. |
| `engines` | CatalogAttachmentDto[] | yes |  |
| `workspaceIds` | string (uuid)[] | yes |  |
| `createdAt` | string (date-time) | yes |  |
| `updatedAt` | string (date-time) | yes |  |
| `configError` | string, nullable | no | Why this row's stored `config` no longer parses, if it does not. A stored row the tightened validator now refuses stays visible and repairable instead of vanishing — and, critically, never fails the whole list (SP3c-1 review N1). |

| Status | Meaning |
|---|---|
| 200 | The catalog. If its stored configuration no longer parses, `configError` is set rather than the request failing |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 404 | No such catalog |
| 500 | Internal error |

## PUT `/api/control-plane/catalogs/{id}`

Operation id: `update_registry_catalog`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Registry catalog id |

**Request body (application/json)**: `UpdateRegistryCatalogBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `config` | object | yes |  |
| `advanced` | object | no |  |
| `description` | string, nullable | no |  |

**Response 200 (application/json)**: `CatalogUpdateResultDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `catalog` | RegistryCatalogDto | yes | A registry catalog. `config` is the typed per-kind configuration (snake_case fields, spec §4.2); it never holds a plaintext secret. |
| `outcomes` | ApplyOutcomeDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Stored, then applied to every attached engine; `outcomes` lists each engine (a failed engine is flagged, nothing is reverted) |
| 400 | Invalid configuration, an unknown secret or storage connection, or a changed warehouse |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such catalog |
| 500 | Internal error |

## DELETE `/api/control-plane/catalogs/{id}`

Operation id: `delete_registry_catalog`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:delete permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Registry catalog id |

| Status | Meaning |
|---|---|
| 204 | Catalog deleted |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:delete permission |
| 404 | No such catalog |
| 409 | Nothing deleted: an egret warehouse catalog (`code` = `warehouse_catalog`; it goes with its warehouse — this route refuses it unconditionally, delete the warehouse instead), or still attached or assigned (`code` = `catalog_in_use`, with... |
| 500 | Internal error |

## POST `/api/control-plane/catalogs/{id}/engines/{engine_id}`

Operation id: `registry_attach_catalog`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Registry catalog id |
| `engine_id` | path | string (uuid) | yes | Engine id |

**Response 201 (application/json)**: `CatalogAttachmentDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `engineId` | string (uuid) | yes |  |
| `engineName` | string | yes |  |
| `engineType` | string | yes |  |
| `applyStatus` | string | yes | `applied` \| `failed` \| `pending`. `pending` means egret has recorded the attachment and has not yet been able to tell the engine — a StarRocks engine whose FE is still coming up (5-10 minutes after create), which the bootstrap or a Retry... |
| `applyError` | string, nullable | no |  |
| `appliedAt` | string (date-time), nullable | no |  |
| `isPrimary` | boolean | yes | This catalog is that engine's PRIMARY: it leads the engine's render order and cannot be detached or edited. At most one of an engine's catalogs carries it (SP3c D2, migration 0150). |
| `createdAt` | string (date-time) | yes | When this attachment was recorded — `engine_catalog_attachments.created_at`. |

| Status | Meaning |
|---|---|
| 201 | Attached. Trino: the catalog was applied to the cluster first, so `applyStatus` is `applied`. StarRocks: the attachment is recorded first and the catalog is created on the FE immediately afterwards, so `applyStatus` is `applied` on success... |
| 400 | The engine cannot read this catalog, the name is one StarRocks reserves, or Kubernetes is not configured |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such catalog or engine |
| 409 | Already attached, or the engine is being deleted |
| 500 | Internal error |
| 502 | Trino only: Kubernetes rejected the apply (`code` = `engine_cluster_apply_failed`); nothing was attached. A StarRocks FE that rejects the DDL is reported as a `failed` attachment in the 201 body, not as a 502 |

## DELETE `/api/control-plane/catalogs/{id}/engines/{engine_id}`

Operation id: `detach_catalog`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Registry catalog id |
| `engine_id` | path | string (uuid) | yes | Engine id |

| Status | Meaning |
|---|---|
| 204 | Removed from the engine, then detached. The registry catalog itself is kept, and the credential egret minted for this attachment is revoked |
| 400 | This is the engine's primary catalog (detach it by deleting the engine), or Kubernetes is not configured |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such catalog or engine, or the catalog is not attached to it |
| 409 | The engine is being deleted; retry |
| 500 | Internal error |
| 502 | The engine rejected the removal; nothing was detached |

## GET `/api/control-plane/catalogs/{id}/impact`

Operation id: `catalog_impact`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Registry catalog id |

**Response 200 (application/json)**: `CatalogImpactDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `engines` | CatalogImpactEngineDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | What saving this catalog does to each attached engine |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 404 | No such catalog |
| 500 | Internal error |

## POST `/api/control-plane/catalogs/{id}/reapply`

Operation id: `reapply_registry_catalog`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Registry catalog id |

**Response 200 (application/json)**: array of `ApplyOutcomeDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `engineId` | string (uuid) | yes |  |
| `engineName` | string | yes |  |
| `status` | string | yes | `applied` \| `failed` \| `skipped`. `skipped`: the engine is external, so egret did not touch it (the attachment is only declared); `error` then says so. |
| `error` | string, nullable | no |  |

| Status | Meaning |
|---|---|
| 200 | The unchanged configuration re-applied to every attached engine (e.g. after rotating a secret). An external engine is listed with status `skipped`: egret does not apply catalogs to it |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such catalog |
| 500 | Internal error |

## POST `/api/control-plane/catalogs/{id}/test`

Operation id: `test_registry_catalog`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Registry catalog id |

**Response 200 (application/json)**: `CatalogTestResultDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes | Whether the check that ran succeeded — and it means only as much as `check` says it does. Read `check` FIRST: `unsupported` is always `ok:false` because nothing was measured, and that is not a broken catalog, so it renders neutral rather... |
| `check` | CatalogCheck | yes | Which check ran, so a green tick can never be read as the other one. |
| `engineName` | string, nullable | no | The engine the query ran on; null for `tcp` and `unsupported`. |
| `target` | string, nullable | no | For `tcp`, the `host:port` that was dialled, so the result names what it measured; null otherwise. |
| `message` | string | yes | One sentence an operator can act on. For `tcp` it always says, in the sentence itself, that reachability is all that was measured. |

| Status | Meaning |
|---|---|
| 200 | The verdict, and `check` names which of the three checks produced it. The target of a `tcp` check comes from the STORED configuration and never from the request, which carries no body at all |
| 400 | The catalog's STORED configuration does not parse, so there was no target to decide and nothing to test. Reachable for a row written before a validation rule that has since tightened — the message names the field, and this is the one thing... |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 404 | No such catalog |
| 500 | Internal error |
| 502 | `query` only: the Trino coordinator could not be reached at all. A coordinator that answers with a failure is a 200 with `ok:false` |

## GET `/api/control-plane/catalogs/{id}/workspaces`

Operation id: `list_catalog_workspaces`. Auth: Session cookie. Forbidden (403): Missing catalog_registry:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Registry catalog id |

**Response 200 (application/json)**: array of `CatalogWorkspaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `workspaceId` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `slug` | string | yes |  |
| `assignedAt` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Workspaces the catalog is assigned to |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:read permission |
| 404 | No such catalog |
| 500 | Internal error |

## PUT `/api/control-plane/catalogs/{id}/workspaces`

Operation id: `set_catalog_workspaces`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Registry catalog id |

**Request body (application/json)**: `SetCatalogWorkspacesBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `workspaceIds` | string (uuid)[] | yes |  |

**Response 200 (application/json)**: array of `CatalogWorkspaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `workspaceId` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `slug` | string | yes |  |
| `assignedAt` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | The full assignment set was replaced. Assignment decides which catalogs a workspace sees in its engine view (GET /api/ws/\{workspace\}/engines/\{engine_id\}), alongside the fallback that shows an unassigned warehouse catalog to the workspace... |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such catalog or workspace (nothing changed) |
| 500 | Internal error |

## POST `/api/control-plane/engines/{id}/catalogs/{cid}`

Operation id: `attach_catalog`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |
| `cid` | path | string (uuid) | yes | Registry catalog id |

**Response 201 (application/json)**: `CatalogAttachmentDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `engineId` | string (uuid) | yes |  |
| `engineName` | string | yes |  |
| `engineType` | string | yes |  |
| `applyStatus` | string | yes | `applied` \| `failed` \| `pending`. `pending` means egret has recorded the attachment and has not yet been able to tell the engine — a StarRocks engine whose FE is still coming up (5-10 minutes after create), which the bootstrap or a Retry... |
| `applyError` | string, nullable | no |  |
| `appliedAt` | string (date-time), nullable | no |  |
| `isPrimary` | boolean | yes | This catalog is that engine's PRIMARY: it leads the engine's render order and cannot be detached or edited. At most one of an engine's catalogs carries it (SP3c D2, migration 0150). |
| `createdAt` | string (date-time) | yes | When this attachment was recorded — `engine_catalog_attachments.created_at`. |

| Status | Meaning |
|---|---|
| 201 | Attached. Trino: the catalog was applied to the cluster first, so `applyStatus` is `applied`. StarRocks: the attachment is recorded first and the catalog is created on the FE immediately afterwards, so `applyStatus` is `applied` on success... |
| 400 | The engine cannot read this catalog, the name is one StarRocks reserves, or Kubernetes is not configured |
| 401 | Not authenticated |
| 403 | Missing engine:update permission |
| 404 | No such engine or catalog |
| 409 | Already attached, or the engine is being deleted |
| 500 | Internal error |
| 502 | Trino only: Kubernetes rejected the apply (`code` = `engine_cluster_apply_failed`); nothing was attached. A StarRocks FE that rejects the DDL is reported as a `failed` attachment in the 201 body, not as a 502 |

## POST `/api/control-plane/engines/{id}/catalogs/{cid}/apply`

Operation id: `retry_catalog_apply`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing catalog_registry:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |
| `cid` | path | string (uuid) | yes | Registry catalog id |

**Response 200 (application/json)**: `ApplyOutcomeDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `engineId` | string (uuid) | yes |  |
| `engineName` | string | yes |  |
| `status` | string | yes | `applied` \| `failed` \| `skipped`. `skipped`: the engine is external, so egret did not touch it (the attachment is only declared); `error` then says so. |
| `error` | string, nullable | no |  |

| Status | Meaning |
|---|---|
| 200 | Re-applied; the attachment is `applied`. StarRocks: an absent catalog is created and an existing one is updated in place with `ALTER CATALOG … SET` |
| 400 | Kubernetes is not configured (Trino), or the catalog cannot be rendered for this engine |
| 401 | Not authenticated |
| 403 | Missing catalog_registry:update permission |
| 404 | No such engine, or the catalog is not attached to it |
| 409 | The engine is being deleted; The engine is external (`code` = `engine_is_external`): egret does not apply a catalog to it |
| 500 | Internal error |
| 502 | The engine rejected the apply — Kubernetes for Trino, the FE for StarRocks (including a catalog of this name the FE already holds with different properties); the attachment stays `failed` with the new error |

