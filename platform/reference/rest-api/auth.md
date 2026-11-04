---
sidebar_position: 2
sidebar_label: Authentication
description: REST endpoints in the auth group.
---

# Authentication API

Local login/logout, session identity, and the pre-login config probe.

This page lists 6 endpoints (OpenAPI tag `auth`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| POST | `/api/admin/impersonate` | `impersonate_start` |  |
| GET | `/api/auth/config` | `auth_config` |  |
| POST | `/api/auth/impersonation/exit` | `impersonate_exit` |  |
| POST | `/api/auth/login` | `login` |  |
| POST | `/api/auth/logout` | `logout` |  |
| GET | `/api/auth/me` | `me` |  |

## POST `/api/admin/impersonate`

Operation id: `impersonate_start`. Auth: Session cookie and `X-Egret-CSRF` header. Forbidden (403): Not a platform admin, already impersonating, or target is an admin. A target holding a NON-admin platform role (a `data_steward`, say) is permitted here: the overlay this endpoint writes is platform-scoped, and the caller already holds strictly more than the target.

**Request body (application/json)**: `StartImpersonation`

| Field | Type | Required | Description |
|---|---|---|---|
| `target_user_id` | string | yes |  |
| `reason` | string | yes |  |
| `password` | string, nullable | no | Required for a local-auth admin (step-up). OIDC admins re-auth via OIDC (Task 8). |

| Status | Meaning |
|---|---|
| 200 | Impersonation started; the session now resolves to the target |
| 400 | Bad target / empty reason |
| 401 | Not authenticated, or wrong step-up password |
| 403 | Not a platform admin, already impersonating, or target is an admin. A target holding a NON-admin platform role (a `data_steward`, say) is permitted here: the overlay this endpoint writes is platform-scoped, and the caller already holds... |
| 409 | OIDC admin: re-authenticate at `authorize_url`, then the callback creates the overlay |
| 500 | Internal error |

## GET `/api/auth/config`

Operation id: `auth_config`. Auth: None (public).

**Response 200 (application/json)**: `AuthConfig`

| Field | Type | Required | Description |
|---|---|---|---|
| `oidc_enabled` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Pre-login capability probe (is OIDC enabled?) |
| 500 | Internal error |

## POST `/api/auth/impersonation/exit`

Operation id: `impersonate_exit`. Auth: Session cookie and `X-Egret-CSRF` header.

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Impersonation ended; the session returns to the admin |
| 401 | Not authenticated |
| 500 | Internal error |

## POST `/api/auth/login`

Operation id: `login`. Auth: None (public).

**Request body (application/json)**: `LoginRequest`

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | yes |  |
| `password` | string | yes |  |

**Response 200 (application/json)**: `MeResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string | yes |  |
| `email` | string | yes |  |
| `platform_roles` | string[] | yes |  |
| `permissions` | string[] | yes |  |
| `impersonating` | ImpersonationDto | no |  |

| Status | Meaning |
|---|---|
| 200 | Logged in; sets session + CSRF cookies |
| 401 | Invalid email or password |
| 429 | Too many failed attempts; `Retry-After` says when to try again |
| 500 | Internal error |

## POST `/api/auth/logout`

Operation id: `logout`. Auth: None (public).

**Response 200 (application/json)**: `Ack`

| Field | Type | Required | Description |
|---|---|---|---|
| `ok` | boolean | yes |  |

| Status | Meaning |
|---|---|
| 200 | Session revoked; clears session + CSRF cookies |
| 500 | Internal error |

## GET `/api/auth/me`

Operation id: `me`. Auth: Session cookie.

**Response 200 (application/json)**: `MeResponse`

| Field | Type | Required | Description |
|---|---|---|---|
| `user_id` | string | yes |  |
| `email` | string | yes |  |
| `platform_roles` | string[] | yes |  |
| `permissions` | string[] | yes |  |
| `impersonating` | ImpersonationDto | no |  |

| Status | Meaning |
|---|---|
| 200 | The authenticated caller's identity + permissions |
| 401 | Not authenticated |
| 500 | Internal error |

