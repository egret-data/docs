---
sidebar_position: 4
sidebar_label: Machine identity provider
description: REST endpoints in the idp group.
---

# Machine identity provider API

egret mini machine-IdP: OIDC discovery, JWKS, and token minting (client_credentials + RFC 8693 token exchange).

This page lists 3 endpoints (OpenAPI tag `idp`). It is generated from `openapi.json`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.

| Method | Path | Operation id | Notes |
|---|---|---|---|
| GET | `/.well-known/jwks.json` | `jwks` |  |
| GET | `/.well-known/openid-configuration` | `discovery` |  |
| POST | `/oauth/token` | `token_endpoint` |  |

## GET `/.well-known/jwks.json`

Operation id: `jwks`. Auth: None (public).

**Response 200 (application/json)**: `JwksDoc`

| Field | Type | Required | Description |
|---|---|---|---|
| `keys` | object[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | The IdP's active public JWKs (for JWT verification) |
| 500 | Internal error |

## GET `/.well-known/openid-configuration`

Operation id: `discovery`. Auth: None (public).

**Response 200 (application/json)**: `DiscoveryDoc`

| Field | Type | Required | Description |
|---|---|---|---|
| `issuer` | string | yes |  |
| `jwks_uri` | string | yes |  |
| `token_endpoint` | string | yes |  |
| `grant_types_supported` | string[] | yes |  |
| `id_token_signing_alg_values_supported` | string[] | yes |  |

| Status | Meaning |
|---|---|
| 200 | OIDC discovery metadata for the egret machine-IdP |

## POST `/oauth/token`

Operation id: `token_endpoint`. Auth: None (client credentials in the body).

**Request body (application/x-www-form-urlencoded)**: `TokenForm`

| Field | Type | Required | Description |
|---|---|---|---|
| `grant_type` | string, nullable | no | Required: `client_credentials` or `urn:ietf:params:oauth:grant-type:token-exchange`. |
| `client_id` | string, nullable | no | Required for `client_credentials`. |
| `client_secret` | string, nullable | no | Required for `client_credentials`. |
| `subject_token` | string, nullable | no | Required for token exchange: an unexpired access token this IdP issued. A Bearer `Authorization` header alone does not stand in for it. |
| `subject_token_type` | string, nullable | no | Required for token exchange: `urn:ietf:params:oauth:token-type:access_token`. |
| `scope` | string, nullable | no | Accepted and ignored. |

**Response 200 (application/json)**: `TokenResp`

| Field | Type | Required | Description |
|---|---|---|---|
| `access_token` | string | yes |  |
| `token_type` | string | yes |  |
| `expires_in` | integer (int64) | yes |  |

| Status | Meaning |
|---|---|
| 200 | A signed access token (client_credentials, or an RFC 8693 exchange of an unexpired token this IdP issued for a fresh one with the same client and audience) |
| 400 | OAuth `\{ "error": ... \}` body: `invalid_request` (a field the grant requires is missing or malformed; carries `error_description`), `invalid_grant` (the subject_token is invalid, expired, foreign, for another audience, or its client was... |
| 401 | Invalid client credentials (OAuth `\{ "error": ... \}` body) |
| 429 | Too many failed token requests (OAuth `\{ "error": ... \}` body). client_credentials counts every request that runs a secret check, per ip+client_id; a token exchange counts a subject token that fails verification per ip, and one that names... |
| 500 | Internal error |

