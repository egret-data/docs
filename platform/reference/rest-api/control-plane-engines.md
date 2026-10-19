---
sidebar_position: 29
sidebar_label: Engines
description: REST endpoints in the control-plane-engines group.
---

# Engines API

Engine provisioning: Trino-on-Kubernetes clusters, their catalogs, native query monitor, and pod logs/exec.

This page lists 24 endpoints (OpenAPI tag `control-plane-engines`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/admin/workspaces/{id}/engines` | `list_workspace_engines` |  |
| POST | `/api/admin/workspaces/{id}/engines` | `assign_workspace_engine` |  |
| DELETE | `/api/admin/workspaces/{id}/engines/{engine_id}` | `unassign_workspace_engine` |  |
| GET | `/api/control-plane/engines` | `list_engines` |  |
| POST | `/api/control-plane/engines` | `create_engine` |  |
| POST | `/api/control-plane/engines/external` | `register_external_engine` |  |
| GET | `/api/control-plane/engines/modelled-ranger-plugins` | `list_modelled_ranger_plugins` |  |
| GET | `/api/control-plane/engines/{id}` | `get_engine` |  |
| PUT | `/api/control-plane/engines/{id}` | `update_engine` |  |
| DELETE | `/api/control-plane/engines/{id}` | `delete_engine` |  |
| POST | `/api/control-plane/engines/{id}/catalogs/{cid}/test` | `test_catalog` | `POST /engines/\{id\}/catalogs/\{cid\}/test` — "test connection": runs `SHOW SCHEMAS FROM "&lt;catalog>"` against the engine's Trino coordinator via the native-moni... |
| GET | `/api/control-plane/engines/{id}/cluster` | `get_cluster` |  |
| PATCH | `/api/control-plane/engines/{id}/external` | `update_external_engine` | `PATCH /api/control-plane/engines/\{id\}/external`. |
| GET | `/api/control-plane/engines/{id}/pods/{pod}/exec` | `pod_exec` | `GET /engines/\{id\}/pods/\{pod\}/exec` — upgrades to a WebSocket and bridges it to a `/bin/sh` session inside the pod via `KubeClient::exec`. |
| GET | `/api/control-plane/engines/{id}/pods/{pod}/logs` | `pod_logs` | `GET /engines/\{id\}/pods/\{pod\}/logs?tail=&previous=&container=` — bounded tail of a pod's logs. |
| GET | `/api/control-plane/engines/{id}/pods/{pod}/logs/follow` | `pod_logs_follow` | `GET /engines/\{id\}/pods/\{pod\}/logs/follow?tail=` — upgrades to a WebSocket and streams the pod's logs as they arrive (`kubectl logs -f` equivalent), a ONE-di... |
| GET | `/api/control-plane/engines/{id}/queries` | `list_queries` |  |
| GET | `/api/control-plane/engines/{id}/queries/{qid}` | `get_query` |  |
| DELETE | `/api/control-plane/engines/{id}/queries/{qid}` | `kill_query` |  |
| GET | `/api/control-plane/engines/{id}/ranger-plugin-config` | `ranger_plugin_config` | `GET /api/control-plane/engines/\{id\}/ranger-plugin-config`. |
| POST | `/api/control-plane/engines/{id}/restart` | `restart_engine` | `POST /engines/\{id\}/restart` — roll the engine's pods without changing config (like `kubectl rollout restart`). |
| POST | `/api/control-plane/engines/{id}/rotate-secrets` | `rotate_engine_secrets` | `POST /engines/\{id\}/rotate-secrets` — mint a new Trino internal-communication secret and `egret-monitor` password and re-apply the engine (pods roll). |
| GET | `/api/control-plane/engines/{id}/workspaces` | `list_engine_workspaces` |  |
| PUT | `/api/control-plane/engines/{id}/workspaces` | `set_engine_workspaces` |  |

## GET `/api/admin/workspaces/{id}/engines`

Operation id: `list_workspace_engines`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |

**Response 200 (application/json)**: array of `WorkspaceEngineDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `type` | string | yes |  |
| `status` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Engines assigned to this workspace |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 500 | Internal error |

## POST `/api/admin/workspaces/{id}/engines`

Operation id: `assign_workspace_engine`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |

**Request body (application/json)**: `AssignEngineBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `engineId` | string (uuid) | yes |  |

| Status | Meaning |
|---|---|
| 204 | Engine assigned to the workspace |
| 400 | Engine is not assignable (e.g. no JWT auth) |
| 401 | Not authenticated |
| 403 | Missing engine:update permission |
| 404 | No such engine or workspace |
| 409 | The engine is external (`code` = `engine_is_external`): egret does not assign to a workspace it |
| 500 | Internal error |

## DELETE `/api/admin/workspaces/{id}/engines/{engine_id}`

Operation id: `unassign_workspace_engine`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Workspace id |
| `engine_id` | path | string (uuid) | yes | Engine id |

| Status | Meaning |
|---|---|
| 204 | Engine unassigned from the workspace |
| 401 | Not authenticated |
| 403 | Missing engine:update permission |
| 404 | No such workspace |
| 409 | The workspace still has Data API endpoints, schedules or datasets on the engine's connection; nothing changed |
| 500 | Internal error |

## GET `/api/control-plane/engines`

Operation id: `list_engines`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

**Response 200 (application/json)**: array of `EngineDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `type` | string | yes |  |
| `namespace` | string | yes |  |
| `status` | string | yes | For an external engine this is the row's placeholder `running`, which means nothing: read `origin` instead (egret does not monitor it). |
| `spec` | EngineSpecDto | yes | The provisioning parameters surfaced back to clients (subset of the stored `spec` jsonb; internal bookkeeping keys are ignored on deserialize). |
| `origin` | string | yes | `provisioned` (egret runs the cluster) or `external` (egret holds a row for a cluster it never provisions, updates, restarts, scales or deletes). |
| `host` | string, nullable | no | External only: the host the engine answers on. |
| `port` | integer (int32), nullable | no | External only: the port the engine answers on. |
| `image` | string, nullable | no | Provisioned only: the full image ref the engine's stored spec runs (for StarRocks the FE image; for Trino the `trinoConfig.image` override when set, else the bare `imageVersion` expanded to `trinodb/trino:&lt;version>`). Absent when the spec... |
| `rangerPluginVersion` | string, nullable | no | The Ranger plugin version egret reads this engine at. External: the version the operator declared. Provisioned: the version its exact image ships (`egret_perm::plugin_version_for_image`); absent when the image is not one egret has measured. |
| `rangerPluginVersionModelled` | boolean, nullable | no | Whether egret's Ranger evaluator has been read against this engine's (type, plugin version) PAIR: only the pairs in `egret_perm::MODELLED_RANGER_PLUGINS` are. When `false`, a migration to the profile bound to this engine is refused (never... |
| `rangerPluginVersionNote` | string, nullable | no | Why the engine is not modelled, and how to fix it (for a provisioned engine: pin its image). Absent when modelled. |

| Status | Meaning |
|---|---|
| 200 | Provisioned query engines (Trino on Kubernetes) |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 500 | Internal error |

## POST `/api/control-plane/engines`

Operation id: `create_engine`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:create permission.

**Request body (application/json)**: `CreateEngineBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `warehouseId` | string (uuid), nullable | no | Superseded by `catalogs` and dropped in SP3c-2. A body that sends this and no `catalogs` behaves exactly as it did before; a body that sends BOTH is refused rather than having one of them quietly ignored. |
| `catalogs` | NewEngineCatalog[] | no | Registry catalogs to attach at create. Exactly one must be `primary`, and every id must exist — an unknown or repeated id refuses the create before anything is provisioned. Mutually exclusive with `warehouseId`. CREATE ONLY: `PUT... |
| `imageVersion` | string, nullable | no |  |
| `coordinatorReplicas` | integer (int32) | yes |  |
| `workerReplicas` | integer (int32) | yes |  |
| `cpuMin` | string | yes |  |
| `cpuMax` | string | yes |  |
| `memory` | string | yes |  |
| `trinoConfig` | object | no | Optional full per-role config surface, stored under `spec["trinoConfig"]`. Wire shape: `\{ queryMaxMemory, logLevel, configProperties, env, coordinator\{replicas, resources, heap, queryMaxMemoryPerNode, additionalJvmConfig, probes\},... |
| `authzServiceId` | integer (int64), nullable | no | Link the new engine to an EXISTING Ranger profile (authz_services id). When omitted, provisioning creates a fresh profile named after the engine. |
| `kind` | string | no | Which engine to provision: `"trino"` (default, back-compat) or `"starrocks"`. Selects between the Trino spec-building path and [`create_starrocks_engine`]. |
| `starrocks` | StarRocksConfigBody | no |  |
| `tlsCertSecretRef` | string (uuid), nullable | no | Optional: a kubernetes.io/tls named secret to back the coordinator TLS. |

**Response 201 (application/json)**: `CreateEngineResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `type` | string | yes |  |
| `namespace` | string | yes |  |
| `status` | string | yes | For an external engine this is the row's placeholder `running`, which means nothing: read `origin` instead (egret does not monitor it). |
| `spec` | EngineSpecDto | yes | The provisioning parameters surfaced back to clients (subset of the stored `spec` jsonb; internal bookkeeping keys are ignored on deserialize). |
| `origin` | string | yes | `provisioned` (egret runs the cluster) or `external` (egret holds a row for a cluster it never provisions, updates, restarts, scales or deletes). |
| `host` | string, nullable | no | External only: the host the engine answers on. |
| `port` | integer (int32), nullable | no | External only: the port the engine answers on. |
| `image` | string, nullable | no | Provisioned only: the full image ref the engine's stored spec runs (for StarRocks the FE image; for Trino the `trinoConfig.image` override when set, else the bare `imageVersion` expanded to `trinodb/trino:&lt;version>`). Absent when the spec... |
| `rangerPluginVersion` | string, nullable | no | The Ranger plugin version egret reads this engine at. External: the version the operator declared. Provisioned: the version its exact image ships (`egret_perm::plugin_version_for_image`); absent when the image is not one egret has measured. |
| `rangerPluginVersionModelled` | boolean, nullable | no | Whether egret's Ranger evaluator has been read against this engine's (type, plugin version) PAIR: only the pairs in `egret_perm::MODELLED_RANGER_PLUGINS` are. When `false`, a migration to the profile bound to this engine is refused (never... |
| `rangerPluginVersionNote` | string, nullable | no | Why the engine is not modelled, and how to fix it (for a provisioned engine: pin its image). Absent when modelled. |
| `catalogAttachErrors` | CatalogAttachErrorDto[] | yes | Catalogs from the body's `catalogs` that could not be attached. Empty on success. The engine EXISTS and is provisioned; these catalogs simply are not on it, and each can be retried with `POST /api/control-plane/engines/\{id\}/catalogs/\{cid\}`.... |

| Status | Meaning |
|---|---|
| 201 | Engine created and provisioned; the primary catalog is attached, and `catalogAttachErrors` lists any of the request's other `catalogs` the engine came up without |
| 400 | Unknown/unprovisioned warehouse, invalid input, or provisioning failed |
| 401 | Not authenticated |
| 403 | Missing engine:create permission |
| 409 | An engine with this name already exists, or its same-name policy profile is bound to another engine |
| 500 | Internal error |

## POST `/api/control-plane/engines/external`

Operation id: `register_external_engine`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:create permission.

**Request body (application/json)**: `RegisterExternalEngine`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Unique across engines. Lower-case letters, digits and `-`, 1 to 63 characters, starting and ending alphanumeric. |
| `type` | string | yes | `trino` or `starrocks`. |
| `host` | string | yes | Host or IP the engine answers on: no scheme, no port, no path. |
| `port` | integer (int32) | yes | Trino's HTTP port or StarRocks' FE query port. |
| `rangerPluginVersion` | string | yes | The Ranger plugin version installed on the engine, `x.y.z`, one of the Ranger 2.x releases. **Only the pairs in `egret_perm::MODELLED_RANGER_PLUGINS` are modelled by egret's evaluator** (a type and version PAIR; the refusal sentence names... |
| `authzServiceId` | integer (int64), nullable | no | A policy profile to bind. Its type must equal `type`, no other engine may bind it, and a Trino profile needs a usable `tagService`. |
| `catalogs` | string (uuid)[] | no | Registry catalogs to declare attached. Nothing is applied to the engine. |

**Response 201 (application/json)**: `EngineDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `type` | string | yes |  |
| `namespace` | string | yes |  |
| `status` | string | yes | For an external engine this is the row's placeholder `running`, which means nothing: read `origin` instead (egret does not monitor it). |
| `spec` | EngineSpecDto | yes | The provisioning parameters surfaced back to clients (subset of the stored `spec` jsonb; internal bookkeeping keys are ignored on deserialize). |
| `origin` | string | yes | `provisioned` (egret runs the cluster) or `external` (egret holds a row for a cluster it never provisions, updates, restarts, scales or deletes). |
| `host` | string, nullable | no | External only: the host the engine answers on. |
| `port` | integer (int32), nullable | no | External only: the port the engine answers on. |
| `image` | string, nullable | no | Provisioned only: the full image ref the engine's stored spec runs (for StarRocks the FE image; for Trino the `trinoConfig.image` override when set, else the bare `imageVersion` expanded to `trinodb/trino:&lt;version>`). Absent when the spec... |
| `rangerPluginVersion` | string, nullable | no | The Ranger plugin version egret reads this engine at. External: the version the operator declared. Provisioned: the version its exact image ships (`egret_perm::plugin_version_for_image`); absent when the image is not one egret has measured. |
| `rangerPluginVersionModelled` | boolean, nullable | no | Whether egret's Ranger evaluator has been read against this engine's (type, plugin version) PAIR: only the pairs in `egret_perm::MODELLED_RANGER_PLUGINS` are. When `false`, a migration to the profile bound to this engine is refused (never... |
| `rangerPluginVersionNote` | string, nullable | no | Why the engine is not modelled, and how to fix it (for a provisioned engine: pin its image). Absent when modelled. |

| Status | Meaning |
|---|---|
| 201 | Registered. Nothing was provisioned: egret holds a row (`origin: external`), optionally bound to a policy profile, with the given catalogs declared attached (`applyStatus: declared`). The bound profile was recompiled in the same... |
| 400 | Invalid name, type, host, port or plugin version; a catalog the engine cannot read; `authzServiceId` naming no policy profile or a Trino profile with no usable tag service; or Kubernetes-free registration was malformed |
| 401 | Not authenticated |
| 403 | Missing engine:create permission |
| 404 | A catalog id in `catalogs` names no registry catalog (the message names it); nothing was written |
| 409 | The name is taken, the profile has another type or is bound to another engine, or binding it would create an order-ambiguous mask or row-filter pair (`code: rule_overlap`); nothing was written |
| 500 | Internal error |

## GET `/api/control-plane/engines/modelled-ranger-plugins`

Operation id: `list_modelled_ranger_plugins`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

**Response 200 (application/json)**: array of `ModelledRangerPluginDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | yes |  |
| `version` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | The (engine type, Ranger plugin version) pairs egret's evaluator is verified against, in declaration order: what an external engine may be registered at and still be modelled |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |

## GET `/api/control-plane/engines/{id}`

Operation id: `get_engine`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

**Response 200 (application/json)**: `EngineDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `type` | string | yes |  |
| `namespace` | string | yes |  |
| `status` | EngineStatusDto | yes |  |
| `spec` | EngineSpecDto | yes | The provisioning parameters surfaced back to clients (subset of the stored `spec` jsonb; internal bookkeeping keys are ignored on deserialize). |
| `origin` | string | yes | `provisioned` (egret runs the cluster) or `external` (egret holds a row for a cluster it never provisions, updates, restarts, scales or deletes). |
| `host` | string, nullable | no | External only: the host the engine answers on. |
| `port` | integer (int32), nullable | no | External only: the port the engine answers on. |
| `image` | string, nullable | no | Provisioned only: the full image ref the engine's stored spec runs (for StarRocks the FE image; for Trino the `trinoConfig.image` override when set, else the bare `imageVersion` expanded to `trinodb/trino:&lt;version>`). Absent when the spec... |
| `rangerPluginVersion` | string, nullable | no | The Ranger plugin version egret reads this engine at. External: the version the operator declared. Provisioned: the version its exact image ships (`egret_perm::plugin_version_for_image`); absent when the image is not one egret has measured. |
| `rangerPluginVersionModelled` | boolean, nullable | no | Whether egret's Ranger evaluator has been read against this engine's (type, plugin version) PAIR: only the pairs in `egret_perm::MODELLED_RANGER_PLUGINS` are. When `false`, a migration to the profile bound to this engine is refused (never... |
| `rangerPluginVersionNote` | string, nullable | no | Why the engine is not modelled, and how to fix it (for a provisioned engine: pin its image). Absent when modelled. |

| Status | Meaning |
|---|---|
| 200 | The engine row flattened with live Kubernetes status |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 404 | No such engine |
| 500 | Internal error |

## PUT `/api/control-plane/engines/{id}`

Operation id: `update_engine`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

**Request body (application/json)**: `CreateEngineBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `warehouseId` | string (uuid), nullable | no | Superseded by `catalogs` and dropped in SP3c-2. A body that sends this and no `catalogs` behaves exactly as it did before; a body that sends BOTH is refused rather than having one of them quietly ignored. |
| `catalogs` | NewEngineCatalog[] | no | Registry catalogs to attach at create. Exactly one must be `primary`, and every id must exist — an unknown or repeated id refuses the create before anything is provisioned. Mutually exclusive with `warehouseId`. CREATE ONLY: `PUT... |
| `imageVersion` | string, nullable | no |  |
| `coordinatorReplicas` | integer (int32) | yes |  |
| `workerReplicas` | integer (int32) | yes |  |
| `cpuMin` | string | yes |  |
| `cpuMax` | string | yes |  |
| `memory` | string | yes |  |
| `trinoConfig` | object | no | Optional full per-role config surface, stored under `spec["trinoConfig"]`. Wire shape: `\{ queryMaxMemory, logLevel, configProperties, env, coordinator\{replicas, resources, heap, queryMaxMemoryPerNode, additionalJvmConfig, probes\},... |
| `authzServiceId` | integer (int64), nullable | no | Link the new engine to an EXISTING Ranger profile (authz_services id). When omitted, provisioning creates a fresh profile named after the engine. |
| `kind` | string | no | Which engine to provision: `"trino"` (default, back-compat) or `"starrocks"`. Selects between the Trino spec-building path and [`create_starrocks_engine`]. |
| `starrocks` | StarRocksConfigBody | no |  |
| `tlsCertSecretRef` | string (uuid), nullable | no | Optional: a kubernetes.io/tls named secret to back the coordinator TLS. |

**Response 200 (application/json)**: `EngineDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `type` | string | yes |  |
| `namespace` | string | yes |  |
| `status` | string | yes | For an external engine this is the row's placeholder `running`, which means nothing: read `origin` instead (egret does not monitor it). |
| `spec` | EngineSpecDto | yes | The provisioning parameters surfaced back to clients (subset of the stored `spec` jsonb; internal bookkeeping keys are ignored on deserialize). |
| `origin` | string | yes | `provisioned` (egret runs the cluster) or `external` (egret holds a row for a cluster it never provisions, updates, restarts, scales or deletes). |
| `host` | string, nullable | no | External only: the host the engine answers on. |
| `port` | integer (int32), nullable | no | External only: the port the engine answers on. |
| `image` | string, nullable | no | Provisioned only: the full image ref the engine's stored spec runs (for StarRocks the FE image; for Trino the `trinoConfig.image` override when set, else the bare `imageVersion` expanded to `trinodb/trino:&lt;version>`). Absent when the spec... |
| `rangerPluginVersion` | string, nullable | no | The Ranger plugin version egret reads this engine at. External: the version the operator declared. Provisioned: the version its exact image ships (`egret_perm::plugin_version_for_image`); absent when the image is not one egret has measured. |
| `rangerPluginVersionModelled` | boolean, nullable | no | Whether egret's Ranger evaluator has been read against this engine's (type, plugin version) PAIR: only the pairs in `egret_perm::MODELLED_RANGER_PLUGINS` are. When `false`, a migration to the profile bound to this engine is refused (never... |
| `rangerPluginVersionNote` | string, nullable | no | Why the engine is not modelled, and how to fix it (for a provisioned engine: pin its image). Absent when modelled. |

| Status | Meaning |
|---|---|
| 200 | Engine spec updated and pods rolled |
| 400 | Invalid config, Kubernetes not configured, `catalogs` sent (create-only — attach through POST /engines/\{id\}/catalogs/\{cid\}), `starrocks.feMetaStorageClass`/`feMetaStorageSize` sent (create-only — they render into the FE StatefulSet's... |
| 401 | Not authenticated |
| 403 | Missing engine:update permission |
| 404 | No such engine |
| 409 | The engine changed concurrently (e.g. a delete in progress), or `authz_service_id` names a profile of the wrong type or one another engine already binds; retry; The engine is external (`code` = `engine_is_external`): egret does not update,... |
| 500 | Internal error |
| 502 | Kubernetes rejected the update; the previous spec was restored |

## DELETE `/api/control-plane/engines/{id}`

Operation id: `delete_engine`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:delete permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

| Status | Meaning |
|---|---|
| 204 | For an external engine: egret's rows only (the engine, its declared attachments and its profile binding) are removed and nothing is sent to any cluster or provisioner, and Kubernetes need not be configured. For a provisioned engine: cluster... |
| 400 | Kubernetes not configured |
| 401 | Not authenticated |
| 403 | Missing engine:delete permission |
| 404 | No such engine |
| 409 | Nothing deleted: Data API endpoints (including trashed), schedules or datasets still use the engine's workspace connections (`code` = `engine_has_dependents`, with `dependents`), or a database constraint refused the delete (`code` =... |
| 500 | Internal error |
| 502 | The Kubernetes delete failed (`code` = `engine_cluster_delete_failed`); the engine stays `deleting` and the request can be retried |

## POST `/api/control-plane/engines/{id}/catalogs/{cid}/test`

Operation id: `test_catalog`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:read permission.

`POST /engines/\{id\}/catalogs/\{cid\}/test` — "test connection": runs `SHOW SCHEMAS FROM "&lt;catalog>"` against the engine's Trino coordinator via the native-monitor coordinator proxy ([`crate::monitor::coordinator_call`], same service name + auth headers as query monitoring) and reports whether the query reaches `FINISHED`. Submits `POST /v1/statement`, then follows `nextUri` (GET) until a terminal state, an `error` object, or [`CATALOG_TEST_MAX_POLLS`] iterations are exhausted (→ `ok:false`, "timed out"). Never returns a transport/coordinator-shape failure as an HTTP error status — those map to `ok:false` with an explanatory message — EXCEPT when the coordinator itself is unreachable or kubernetes isn't configured, which surface as the usual `CpError` (mirrors the other coordinator-proxied routes in this file and in `monitor.rs`).

SP3c-2 Task 4 deleted this route's five siblings but KEPT this one: it is the only route in the product that tests a *named engine's* view of a catalog. The registry's `POST /catalogs/\{id\}/test` (`test_registry_catalog` in `catalogs.rs`) picks an applied Trino attachment across ALL of a catalog's engines and cannot be pointed at one, and it gates on `catalog_registry:read`, and it tests an applied attachment across ALL of a catalog's engines rather than one named engine. This route is the only ENGINE-SCOPED test, which is why it survived SP3c-2 Task 4 while its five siblings did not.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |
| `cid` | path | string (uuid) | yes | Registry catalog id |

**Response 200 (application/json)**: `CatalogTestDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |
| `message` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Test-connection result (ok=false with a message on a coordinator/query failure) |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 404 | No such engine or catalog (or catalog not on this engine) |
| 409 | The engine is external (`code` = `engine_is_external`): egret does not test a catalog on it |
| 500 | Internal error |
| 502 | Trino coordinator unreachable |

## GET `/api/control-plane/engines/{id}/cluster`

Operation id: `get_cluster`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

**Response 200 (application/json)**: `ClusterDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `running` | integer (int32) | yes |  |
| `queued` | integer (int32) | yes |  |
| `blocked` | integer (int32) | yes |  |
| `nodes` | NodeDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | Cluster summary: running/queued/blocked query tallies + node list |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 404 | No such engine |
| 409 | The engine is external (`code` = `engine_is_external`): egret does not monitor it |
| 500 | Internal error |
| 502 | Trino coordinator unreachable or returned a non-JSON error |

## PATCH `/api/control-plane/engines/{id}/external`

Operation id: `update_external_engine`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:update permission.

`PATCH /api/control-plane/engines/\{id\}/external`.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

**Request body (application/json)**: `UpdateExternalEngine`

| Field | Type | Required | Description |
|---|---|---|---|
| `authzServiceId` | integer (int64), nullable | no | The policy profile to bind: absent leaves the binding, `null` unbinds, a number binds (same rules as at registration). |
| `host` | string, nullable | no | New host (bare host: no scheme, port or path). |
| `port` | integer (int32), nullable | no |  |
| `rangerPluginVersion` | string, nullable | no | The Ranger plugin version installed on the engine, as at registration. The response says whether egret's evaluator models the (type, version) pair. |

**Response 200 (application/json)**: `EngineDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `type` | string | yes |  |
| `namespace` | string | yes |  |
| `status` | string | yes | For an external engine this is the row's placeholder `running`, which means nothing: read `origin` instead (egret does not monitor it). |
| `spec` | EngineSpecDto | yes | The provisioning parameters surfaced back to clients (subset of the stored `spec` jsonb; internal bookkeeping keys are ignored on deserialize). |
| `origin` | string | yes | `provisioned` (egret runs the cluster) or `external` (egret holds a row for a cluster it never provisions, updates, restarts, scales or deletes). |
| `host` | string, nullable | no | External only: the host the engine answers on. |
| `port` | integer (int32), nullable | no | External only: the port the engine answers on. |
| `image` | string, nullable | no | Provisioned only: the full image ref the engine's stored spec runs (for StarRocks the FE image; for Trino the `trinoConfig.image` override when set, else the bare `imageVersion` expanded to `trinodb/trino:&lt;version>`). Absent when the spec... |
| `rangerPluginVersion` | string, nullable | no | The Ranger plugin version egret reads this engine at. External: the version the operator declared. Provisioned: the version its exact image ships (`egret_perm::plugin_version_for_image`); absent when the image is not one egret has measured. |
| `rangerPluginVersionModelled` | boolean, nullable | no | Whether egret's Ranger evaluator has been read against this engine's (type, plugin version) PAIR: only the pairs in `egret_perm::MODELLED_RANGER_PLUGINS` are. When `false`, a migration to the profile bound to this engine is refused (never... |
| `rangerPluginVersionNote` | string, nullable | no | Why the engine is not modelled, and how to fix it (for a provisioned engine: pin its image). Absent when modelled. |

| Status | Meaning |
|---|---|
| 200 | Updated. Egret's row only: nothing is sent to the engine, a provisioner or Kubernetes. The policy profile it was or is bound to were recompiled in the same transaction. `rangerPluginVersionModelled` is as at registration |
| 400 | The engine is not external; nothing to update; invalid host, port or plugin version; or `authzServiceId` naming no profile, one of the wrong type, or a Trino profile with no usable tag service |
| 401 | Not authenticated |
| 403 | Missing engine:update permission |
| 404 | No such engine |
| 409 | The engine changed concurrently (e.g. a delete); the profile is bound to another engine; or the change would create an order-ambiguous mask or row-filter pair (`code: rule_overlap`). Nothing was written |
| 500 | Internal error |

## GET `/api/control-plane/engines/{id}/pods/{pod}/exec`

Operation id: `pod_exec`. Auth: Session cookie. Forbidden (403): Missing engine:provision permission.

`GET /engines/\{id\}/pods/\{pod\}/exec` — upgrades to a WebSocket and bridges it to a `/bin/sh` session inside the pod via `KubeClient::exec`. Same ownership guard as [`pod_logs`]: the pod must be one of the engine's live pods, checked BEFORE the WS upgrade so an unknown pod 404s instead of upgrading and failing inside the socket.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |
| `pod` | path | string | yes | Pod name (must belong to the engine) |

| Status | Meaning |
|---|---|
| 101 | WebSocket upgrade bridging an interactive exec session in the pod |
| 400 | Kubernetes not configured |
| 401 | Not authenticated |
| 403 | Missing engine:provision permission |
| 404 | No such engine, or pod does not belong to the engine |
| 409 | The engine is external (`code` = `engine_is_external`): egret does not exec into the pods of it |
| 500 | Internal error |

## GET `/api/control-plane/engines/{id}/pods/{pod}/logs`

Operation id: `pod_logs`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

`GET /engines/\{id\}/pods/\{pod\}/logs?tail=&previous=&container=` — bounded tail of a pod's logs. The pod must belong to the engine (verified against the live pod list from `EngineProvisioner::status`), so one platform admin can't read an arbitrary pod's logs by guessing a name.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |
| `pod` | path | string | yes | Pod name (must belong to the engine) |
| `tail` | query | integer (int64) | no | Number of trailing lines (1..=5000, default 1000) |
| `previous` | query | boolean | no | Read the previous (crashed) container instance |
| `container` | query | string | no | Container name (defaults to the pod's main container) |

**Response 200 (application/json)**: `PodLogsDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `logs` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Bounded tail of the pod's logs |
| 400 | Kubernetes not configured or log read failed |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 404 | No such engine, or pod does not belong to the engine |
| 409 | The engine is external (`code` = `engine_is_external`): egret does not read the pods of it |
| 500 | Internal error |

## GET `/api/control-plane/engines/{id}/pods/{pod}/logs/follow`

Operation id: `pod_logs_follow`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

`GET /engines/\{id\}/pods/\{pod\}/logs/follow?tail=` — upgrades to a WebSocket and streams the pod's logs as they arrive (`kubectl logs -f` equivalent), a ONE-directional stream (pod -> browser), unlike [`pod_exec`]'s bidirectional bridge. Same ownership guard as [`pod_logs`]/[`pod_exec`]: the pod must be one of the engine's live pods, checked BEFORE the WS upgrade so an unknown pod 404s instead of upgrading and failing inside the socket.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |
| `pod` | path | string | yes | Pod name (must belong to the engine) |
| `tail` | query | integer (int64) | no | Number of trailing lines to backfill (1..=5000, default 1000) |

| Status | Meaning |
|---|---|
| 101 | WebSocket upgrade streaming the pod's logs (kubectl logs -f equivalent) |
| 400 | Kubernetes not configured |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 404 | No such engine, or pod does not belong to the engine |
| 409 | The engine is external (`code` = `engine_is_external`): egret does not read the pods of it |
| 500 | Internal error |

## GET `/api/control-plane/engines/{id}/queries`

Operation id: `list_queries`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

**Response 200 (application/json)**: array of `QueryDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `user` | string | yes |  |
| `state` | string | yes |  |
| `query` | string | yes |  |
| `elapsed` | string | yes |  |
| `cpu` | string | yes |  |
| `memory` | string | yes |  |
| `progressPercent` | number (double) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Live queries on the engine's Trino coordinator |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 404 | No such engine |
| 409 | The engine is external (`code` = `engine_is_external`): egret does not monitor it |
| 500 | Internal error |
| 502 | Trino coordinator unreachable or returned a non-JSON error |

## GET `/api/control-plane/engines/{id}/queries/{qid}`

Operation id: `get_query`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |
| `qid` | path | string | yes | Trino query id |

**Response 200 (application/json)**: `QueryDetailDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes |  |
| `user` | string | yes |  |
| `state` | string | yes |  |
| `query` | string | yes |  |
| `elapsed` | string | yes |  |
| `cpu` | string | yes |  |
| `memory` | string | yes |  |
| `progressPercent` | number (double) | yes |  |
| `errorMessage` | string, nullable | no |  |
| `outputStage` | object | yes |  |

| Status | Meaning |
|---|---|
| 200 | Query detail including error message and output-stage plan |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 404 | No such engine |
| 409 | The engine is external (`code` = `engine_is_external`): egret does not monitor it |
| 500 | Internal error |
| 502 | Trino coordinator unreachable or returned a non-JSON error |

## DELETE `/api/control-plane/engines/{id}/queries/{qid}`

Operation id: `kill_query`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:kill permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |
| `qid` | path | string | yes | Trino query id |

| Status | Meaning |
|---|---|
| 200 | Query cancelled on the coordinator |
| 401 | Not authenticated |
| 403 | Missing engine:kill permission |
| 404 | No such engine |
| 409 | The engine is external (`code` = `engine_is_external`): egret does not cancel queries on it |
| 500 | Internal error |
| 502 | Trino coordinator unreachable or rejected the cancel |

## GET `/api/control-plane/engines/{id}/ranger-plugin-config`

Operation id: `ranger_plugin_config`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

`GET /api/control-plane/engines/\{id\}/ranger-plugin-config`.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

**Response 200 (application/json)**: `RangerPluginConfigDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `serviceName` | string | yes | The bound policy profile: the Ranger service name the plugin asks for. |
| `downloadUrl` | string | yes | `\{public_url\}/service/plugins/policies/download/\{serviceName\}`: where the plugin's download lands. The files below carry `public_url` itself (the plugin appends the path). |
| `authMode` | string | yes | `anonymous`, or `bearer-configured` (egret requires a bearer token on `/service`; the token is never shown here). |
| `rangerPluginVersion` | string, nullable | no | The plugin version the engine was DECLARED to run. |
| `rangerPluginVersionModelled` | boolean | yes | Whether egret's evaluator models the (type, version) pair. When `false`, migrations into this profile are refused. |
| `warnings` | string[] | yes | Things that make the install not work, or not safe, as configured. |
| `assumptions` | string[] | yes | What egret's `explain` and migration gate assume about the plugin and cannot check on an external engine. |
| `adminMustSupply` | string[] | yes | What the admin must supply themselves. egret renders no credential and invents none. |
| `files` | RangerPluginFileDto[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The Ranger plugin files to install on this external engine, rendered by the same code that renders the files egret mounts into its own engines. No credential is included or minted |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 404 | No such engine |
| 409 | The engine is provisioned (egret mounts these files itself), or it is bound to no policy profile (bind one first) |
| 500 | Internal error |

## POST `/api/control-plane/engines/{id}/restart`

Operation id: `restart_engine`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:provision permission.

`POST /engines/\{id\}/restart` — roll the engine's pods without changing config (like `kubectl rollout restart`). Unlike `update`, this always forces a roll: `prov.restart` patches a fresh timestamp annotation onto the pod templates regardless of whether the rendered config changed. For Trino this rolls the coordinator + worker Deployments directly; for StarRocks it merge-patches the restart stamp onto the `StarRocksCluster` CR's FE + CN specs and the operator propagates it to the pod templates.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

| Status | Meaning |
|---|---|
| 200 | Coordinator + worker pods rolled (rollout restart) |
| 400 | Kubernetes not configured or restart failed |
| 401 | Not authenticated |
| 403 | Missing engine:provision permission |
| 404 | No such engine |
| 409 | The engine is external (`code` = `engine_is_external`): egret does not restart it |
| 500 | Internal error |

## POST `/api/control-plane/engines/{id}/rotate-secrets`

Operation id: `rotate_engine_secrets`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:update permission.

`POST /engines/\{id\}/rotate-secrets` — mint a new Trino internal-communication secret and `egret-monitor` password and re-apply the engine (pods roll). The new pair is recorded on the row even if the apply fails — the cluster may already have received it — so a failed rotation's pair is kept resolvable, never deleted, alongside whatever it superseded. A later successful rotation deletes only the ONE pair its own apply superseded; anything further back (left by an earlier failed rotation, or by a losing concurrent apply) stays orphaned but resolvable until the engine itself is deleted — a wider sweep here could destroy a pair a DIFFERENT, still in-flight apply on this engine just minted, which is the one thing this route must never do.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

| Status | Meaning |
|---|---|
| 204 | New internal secrets applied; the engine's pods restart |
| 400 | Not a Trino engine, or Kubernetes not configured |
| 401 | Not authenticated |
| 403 | Missing engine:update permission |
| 404 | No such engine |
| 409 | The engine changed concurrently (e.g. a delete in progress); retry; The engine is external (`code` = `engine_is_external`): egret does not rotate the secrets of it |
| 500 | Internal error |
| 502 | Kubernetes rejected the apply; the engine row now names the new secret pair (the cluster may already hold it), and the previous pair is kept — not deleted — until a later successful apply supersedes it |

## GET `/api/control-plane/engines/{id}/workspaces`

Operation id: `list_engine_workspaces`. Auth: Session cookie. Forbidden (403): Missing engine:read permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

**Response 200 (application/json)**: array of `EngineWorkspaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `workspaceId` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `slug` | string | yes |  |
| `assignedAt` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Workspaces this engine is assigned to |
| 401 | Not authenticated |
| 403 | Missing engine:read permission |
| 404 | No such engine |
| 500 | Internal error |

## PUT `/api/control-plane/engines/{id}/workspaces`

Operation id: `set_engine_workspaces`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing engine:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Engine id |

**Request body (application/json)**: `SetWorkspacesBody`

| Field | Type | Required | Description |
|---|---|---|---|
| `workspaceIds` | string (uuid)[] | yes |  |

**Response 200 (application/json)**: array of `EngineWorkspaceDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `workspaceId` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `slug` | string | yes |  |
| `assignedAt` | string (date-time) | yes |  |

| Status | Meaning |
|---|---|
| 200 | Assignment set replaced; returns the new workspace set |
| 400 | An engine that is not assignable (e.g. no JWT auth) |
| 401 | Not authenticated |
| 403 | Missing engine:update permission |
| 404 | No such engine, or an added workspace does not exist; nothing applied |
| 409 | A removed workspace still has Data API endpoints, schedules or datasets on the engine's connection; nothing applied; The engine is external (`code` = `engine_is_external`): egret does not assign workspaces to it |
| 500 | Internal error |

