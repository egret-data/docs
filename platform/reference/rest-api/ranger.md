---
sidebar_position: 25
sidebar_label: Ranger-compatible policy service
description: REST endpoints in the ranger group.
---

# Ranger-compatible policy service API

Ranger Admin REST serving surface polled by engine plugins (read-only policy/service-def download).

This page lists 6 endpoints (OpenAPI tag `ranger`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/ranger/service/plugins/definitions` | `list_defs` |  |
| GET | `/ranger/service/plugins/definitions/name/{name}` | `get_def` |  |
| GET | `/ranger/service/plugins/policies/download/{service}` | `download_policies` | `GET /plugins/policies/download/\{service\}?lastKnownVersion=N` |
| GET | `/ranger/service/plugins/policies/{id}` | `get_policy` |  |
| GET | `/ranger/service/plugins/services` | `list_services` |  |
| GET | `/ranger/service/tags/download/{service}` | `download_tags` | `GET /tags/download/\{service\}?lastKnownVersion=N` |

## GET `/ranger/service/plugins/definitions`

Operation id: `list_defs`. Auth: Session cookie. Forbidden (403): An engine credential: these routes are for the operator bearer only.

**Response 200 (application/json)**: `RangerServiceDefs`

| Field | Type | Required | Description |
|---|---|---|---|
| `serviceDefs` | object[] | yes | Each element is a raw Ranger service-definition object (stored verbatim). |

| Status | Meaning |
|---|---|
| 200 | All stored Ranger service-definitions |
| 401 | Missing or invalid credential while `ranger.auth_mode` is `required` |
| 403 | An engine credential: these routes are for the operator bearer only |
| 500 | Internal error |

## GET `/ranger/service/plugins/definitions/name/{name}`

Operation id: `get_def`. Auth: Session cookie. Forbidden (403): An engine credential: these routes are for the operator bearer only.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `name` | path | string | yes | Service-definition name (e.g. `trino`) |

**Response 200 (application/json)**: `object`

| Status | Meaning |
|---|---|
| 200 | The raw Ranger service-definition |
| 401 | Missing or invalid credential while `ranger.auth_mode` is `required` |
| 403 | An engine credential: these routes are for the operator bearer only |
| 404 | No such service-definition |
| 500 | Internal error |

## GET `/ranger/service/plugins/policies/download/{service}`

Operation id: `download_policies`. Auth: Session cookie. Forbidden (403): An engine credential asked for a profile its engine is not bound to.

`GET /plugins/policies/download/\{service\}?lastKnownVersion=N`

Returns 304 when the plugin's cached version matches; 200 + `ServicePolicies` otherwise.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service` | path | string | yes | Policy profile (Ranger service) name |
| `lastKnownVersion` | query | integer (int64) | no | The plugin's cached policy version; a match yields `304 Not Modified`. |

**Response 200 (application/json)**: `RangerServicePolicies`

| Field | Type | Required | Description |
|---|---|---|---|
| `serviceName` | string | yes |  |
| `serviceId` | integer (int64) | yes |  |
| `policyVersion` | integer (int64) | yes |  |
| `policyUpdateTime` | integer (int64), nullable | no | epoch millis; omitted when unknown |
| `serviceDef` | object | yes | The raw Ranger service-definition (stored verbatim). |
| `policies` | object[] | yes | The service's enabled policies, each a raw Ranger policy object. |
| `auditMode` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | The service's enabled policies + service-def (plugin download envelope) |
| 304 | Not modified — the plugin's lastKnownVersion matches the current policy version |
| 401 | Missing or invalid credential (engine Basic or operator bearer) while `ranger.auth_mode` is `required` |
| 403 | An engine credential asked for a profile its engine is not bound to |
| 404 | No such policy profile |
| 500 | Internal error |

## GET `/ranger/service/plugins/policies/{id}`

Operation id: `get_policy`. Auth: Session cookie. Forbidden (403): An engine credential: these routes are for the operator bearer only.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | integer (int64) | yes | Policy id |

**Response 200 (application/json)**: `object`

| Status | Meaning |
|---|---|
| 200 | The raw stored Ranger policy body (with id) |
| 401 | Missing or invalid credential while `ranger.auth_mode` is `required` |
| 403 | An engine credential: these routes are for the operator bearer only |
| 404 | No such policy |
| 500 | Internal error |

## GET `/ranger/service/plugins/services`

Operation id: `list_services`. Auth: Session cookie. Forbidden (403): An engine credential: these routes are for the operator bearer only.

**Response 200 (application/json)**: array of `RangerServiceRef`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | integer (int64) | yes |  |
| `name` | string | yes |  |
| `type` | string | yes |  |
| `configs` | object | yes | The service's config map (stored verbatim). |
| `policyVersion` | integer (int64) | yes |  |
| `isEnabled` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | All policy profiles (Ranger services) |
| 401 | Missing or invalid credential while `ranger.auth_mode` is `required` |
| 403 | An engine credential: these routes are for the operator bearer only |
| 500 | Internal error |

## GET `/ranger/service/tags/download/{service}`

Operation id: `download_tags`. Auth: Session cookie. Forbidden (403): An engine credential asked for a profile its engine is not bound to.

`GET /tags/download/\{service\}?lastKnownVersion=N`

Serves the real resource→tag mapping (`catalog_tag_assignments`) for the service's warehouse(s) as a Ranger `ServiceTags`. Returns 304 when the plugin's cached `tagVersion` matches the current one; 200 otherwise.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `service` | path | string | yes | Policy profile (Ranger service) name |
| `lastKnownVersion` | query | integer (int64) | no | The plugin's cached policy version; a match yields `304 Not Modified`. |

**Response 200 (application/json)**: `RangerServiceTags`

| Field | Type | Required | Description |
|---|---|---|---|
| `op` | string | yes |  |
| `serviceName` | string | yes |  |
| `tagVersion` | integer (int64) | yes |  |
| `tags` | object | yes | Tag map keyed by numeric tag-id → tag-def instance. |
| `serviceResources` | object[] | yes |  |
| `resourceToTagIds` | object | yes | `\{ "&lt;resourceId>": [&lt;tagId>, ...] \}` linking each resource to its tags. |

| Status | Meaning |
|---|---|
| 200 | The service's catalog tag assignments (plugin tag-download envelope) |
| 304 | Not modified — the plugin's lastKnownVersion matches the current tag version |
| 401 | Missing or invalid credential (engine Basic or operator bearer) while `ranger.auth_mode` is `required` |
| 403 | An engine credential asked for a profile its engine is not bound to |
| 404 | No such policy profile |
| 500 | Internal error |

