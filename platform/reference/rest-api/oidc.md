---
sidebar_position: 3
sidebar_label: OIDC single sign-on
description: REST endpoints in the oidc group.
---

# OIDC single sign-on API

OIDC single-sign-on login initiation and provider callback.

This page lists 3 endpoints (OpenAPI tag `oidc`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| POST | `/api/auth/oidc/backchannel-logout` | `backchannel_logout` | `POST /api/auth/oidc/backchannel-logout` — OIDC Back-Channel Logout 1.0. |
| GET | `/api/auth/oidc/callback` | `oidc_callback` |  |
| GET | `/api/auth/oidc/login` | `oidc_login` |  |

## POST `/api/auth/oidc/backchannel-logout`

Operation id: `backchannel_logout`. Auth: None (public).

`POST /api/auth/oidc/backchannel-logout` — OIDC Back-Channel Logout 1.0.

Keycloak (or any conformant IdP) calls this server-to-server when a user logs out or their session ends upstream. There is no cookie and no CSRF token on this request — it's secured entirely by the logout token's JWS signature (verified against the provider's JWKS, `iss`/`aud`/`exp` enforced) — see [`crate::oidc::verify_logout_token`]. On success, every egret session for the token's `sub` is revoked. An unrecognized `sub` (e.g. a user who never completed OIDC login) is a no-op 200, matching the spec's guidance that the RP should not leak whether it knows a given subject. Always sets `Cache-Control: no-store` per the Back-Channel Logout spec.

**Request body (application/x-www-form-urlencoded)**: `BackchannelLogoutForm`

| Field | Type | Required | Description |
|---|---|---|---|
| `logout_token` | string | yes |  |

| Status | Meaning |
|---|---|
| 200 | Logout token accepted; matching sessions (if any) revoked |
| 400 | Missing/invalid logout token, or JWKS unavailable |

## GET `/api/auth/oidc/callback`

Operation id: `oidc_callback`. Auth: None (public).

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| `code` | query | string | yes | Authorization code from the OIDC provider |
| `state` | query | string | yes | Opaque state value echoed back for CSRF protection |

| Status | Meaning |
|---|---|
| 303 | Login succeeded; sets session + CSRF cookies and redirects to the post-login page |
| 400 | Missing, malformed, or mismatched OIDC state cookie (text/plain body) |
| 401 | OIDC code exchange failed (text/plain body) |
| 409 | Email already used by another account (text/plain body) |
| 500 | Provisioning or session failure (text/plain body) |

## GET `/api/auth/oidc/login`

Operation id: `oidc_login`. Auth: None (public).

| Status | Meaning |
|---|---|
| 303 | Redirect to the OIDC provider's authorize endpoint (sets the encrypted state cookie) |

