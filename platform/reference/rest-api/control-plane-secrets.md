---
sidebar_position: 33
sidebar_label: Secrets
description: REST endpoints in the control-plane-secrets group.
---

# Secrets API

Global named secrets (platform control plane).

This page lists 4 endpoints (OpenAPI tag `control-plane-secrets`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/api/control-plane/secrets` | `list` |  |
| POST | `/api/control-plane/secrets` | `create` |  |
| PUT | `/api/control-plane/secrets/{id}` | `update` |  |
| DELETE | `/api/control-plane/secrets/{id}` | `remove` |  |

## GET `/api/control-plane/secrets`

Operation id: `list`. Auth: Session cookie. Forbidden (403): Missing secret:read permission.

**Response 200 (application/json)**: array of `SecretDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string, nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `used_by` | integer (int64) | yes |  |
| `type` | string | yes |  |
| `keys` | string[] | yes |  |
| `system_managed` | boolean | yes | Minted and managed by egret for an engine or a catalog: it cannot be renamed, rotated or deleted here, and pickers leave it out (KI-207). |

| Status | Meaning |
|---|---|
| 200 | Global named secrets (plaintext never exposed) |
| 401 | Not authenticated |
| 403 | Missing secret:read permission |
| 500 | Internal error |

## POST `/api/control-plane/secrets`

Operation id: `create`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing secret:create permission.

**Request body (application/json)**: `CreateSecretInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes |  |
| `description` | string, nullable | no |  |
| `type` | string, nullable | no |  |
| `data` | object, nullable | no |  |
| `value` | string, nullable | no | Back-compat: a single value stored as `Opaque\{value\}`. |

**Response 201 (application/json)**: `SecretDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string, nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `used_by` | integer (int64) | yes |  |
| `type` | string | yes |  |
| `keys` | string[] | yes |  |
| `system_managed` | boolean | yes | Minted and managed by egret for an engine or a catalog: it cannot be renamed, rotated or deleted here, and pickers leave it out (KI-207). |

| Status | Meaning |
|---|---|
| 201 | Secret created |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Missing secret:create permission |
| 409 | A secret with this name already exists |
| 500 | Internal error |

## PUT `/api/control-plane/secrets/{id}`

Operation id: `update`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing secret:update permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Secret id |

**Request body (application/json)**: `UpdateSecretInput`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string, nullable | no |  |
| `description` | string, nullable | no |  |
| `type` | string, nullable | no |  |
| `data` | object, nullable | no |  |
| `value` | string, nullable | no |  |

**Response 200 (application/json)**: `SecretDto`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (uuid) | yes |  |
| `name` | string | yes |  |
| `description` | string, nullable | no |  |
| `created_at` | string (date-time) | yes |  |
| `used_by` | integer (int64) | yes |  |
| `type` | string | yes |  |
| `keys` | string[] | yes |  |
| `system_managed` | boolean | yes | Minted and managed by egret for an engine or a catalog: it cannot be renamed, rotated or deleted here, and pickers leave it out (KI-207). |

| Status | Meaning |
|---|---|
| 200 | Secret updated (renamed and/or rotated) |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Missing secret:update permission |
| 404 | No such secret |
| 409 | The new name clashes with an existing secret, or the secret is managed by egret |
| 500 | Internal error |

## DELETE `/api/control-plane/secrets/{id}`

Operation id: `remove`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Missing secret:delete permission.

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `id` | path | string (uuid) | yes | Secret id |

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Secret deleted |
| 401 | Not authenticated |
| 403 | Missing secret:delete permission |
| 404 | No such secret |
| 409 | Secret is still referenced by one or more connections, or is managed by egret |
| 500 | Internal error |

