---
sidebar_position: 6
---

# SSO errors

Single sign-on failures: at server start, at the identity provider, and on the callback. The plain-text callback errors and
the redirect were reproduced against the development Keycloak.

## The server does not start

| Message | Fix |
|---|---|
| `Error: oidc.enabled requires security.secret_key (base64, >=64 bytes)` | Set `EGRET_SECURITY__SECRET_KEY` to base64 of at least 64 bytes: `head -c 64 /dev/urandom \| base64`. |
| `Error: oidc.enabled requires issuer_url and client_id` | Set `EGRET_OIDC__ISSUER_URL` and `EGRET_OIDC__CLIENT_ID`. |

## The sign-in page has no **Sign in with SSO** button

The page asks `GET /api/auth/config` and shows the button only when it answers `{"oidc_enabled":true}`. If it answers
`false`, `EGRET_OIDC__ENABLED` is not set to `true` on the running process. Variables from `.env` reach `just` recipes but not a
binary you started yourself; see [Configuration](../configuration).

## Pressing **Sign in with SSO**

`GET /api/auth/oidc/login` redirects (303) to the provider's authorization endpoint with `response_type=code`, your
`client_id`, a PKCE challenge (`S256`), a state and a nonce, and sets a short-lived cookie `egret_oidc_state` (10 minutes,
`HttpOnly`, path `/api/auth/oidc`).

Errors here are shown **by the provider**:

| Provider message | Cause and fix |
|---|---|
| *Invalid parameter: redirect_uri* (Keycloak) | `oidc.redirect_url` is not in the client's valid redirect URIs. Register exactly `https://<egret-host>/api/auth/oidc/callback`, scheme and port included. |
| *Client not found* / *invalid client* | `oidc.client_id` does not match a client in the realm. |
| The provider page does not load | `oidc.issuer_url` is not reachable from the **browser**. It is also fetched by the server, so it must be reachable from both. |

## Errors on the callback

After a successful provider login the browser returns to `/api/auth/oidc/callback`. Failures here are shown as **plain text**
at that URL:

| Status and text | Cause and fix |
|---|---|
| `400 missing oidc state` | The `egret_oidc_state` cookie is gone: the login took more than 10 minutes, cookies are blocked, the callback was opened directly (reproduced), or it arrived on a different origin than the login started on. Start again from the sign-in page. Make the browser origin and `oidc.redirect_url` the same. |
| `400 bad oidc state` | The state cookie is unreadable: `EGRET_SECURITY__SECRET_KEY` changed or differs between replicas during the login. Use the same key on every replica. |
| `400 state mismatch` | The `state` the provider returned does not match the cookie: two sign-ins in two tabs, or a replayed link. Start again. |
| `401 oidc exchange failed` | Egret could not exchange the code or validate the ID token. See the list below. |
| `409 email already used by another account` | A different account (a local user, or another identity) already has this email. Resolve it under **Control Plane → Users**, or sign in with the account that owns the email. |
| `500 provisioning failed` or `session failed` | A database error while creating the user or the session. Read the server log. |

### `401 oidc exchange failed`

Check these in order:

1. **Client secret.** `oidc.client_secret` must equal the client's secret at the provider.
2. **Issuer.** The ID token's `iss` must equal `oidc.issuer_url` exactly. A realm reached as `http://sso:8080/realms/egret` by
   the server but issuing tokens as `http://localhost:8082/realms/egret` fails. Use one hostname that both the server and the
   browser can resolve.
3. **Redirect URI.** The `redirect_uri` sent in the token request must match the one registered.
4. **Clock.** The server and the provider need clocks within a minute or two, or the token looks expired or not yet valid.
5. **Network.** The server must reach the provider's token and key endpoints. In Kubernetes, a provider on a public hostname
   may need a DNS rewrite so pods can resolve it.

## Signed in, but no access, or the wrong access

| Symptom | Cause and fix |
|---|---|
| The app is empty, or every page says *Forbidden* | A new SSO user is created as a plain member. Access comes from roles granted to their **groups**; see [Authentication setup](../authentication#groups-and-access). |
| The user has no groups | The ID token has no `groups` claim, or `oidc.groups_claim` names a different claim, or the Keycloak group mapper is missing. Decode the token and look. |
| Groups are `/data-team`, not `data-team` | The mapper has **Full group path** on. Turn it off, or grant to the path names. |
| A group named in the token is not joined, and the log says `OIDC groups claim names a group that no longer exists but that grants or rule exemptions still name` | The group was deleted while grants or rules still refer to it. Egret does not re-create it from a claim, so the provider cannot take over grants written for the old group. Review `GET /api/control-plane/perm/unresolved-principals` and recreate or re-grant deliberately. |
| A claimed group is ignored | A local group of the same name exists. Local groups are not managed by the provider; the log says `OIDC groups claim names a local group`. |

To look at what your provider sends, request a token for a test user and decode the payload. With the development realm:

```bash
curl -s -X POST http://localhost:8081/realms/egret/protocol/openid-connect/token \
  -d 'grant_type=password&client_id=egret&client_secret=egret-secret&username=tester&password=pw&scope=openid' \
  | jq -r .access_token | cut -d. -f2 | base64 -d 2>/dev/null | jq '{iss, aud, groups, sub, email}'
```

The token for `tester` in the development realm carried `"groups": ["data-team"]` and `aud` of `["egret-catalog", "trino",
"starrocks"]`. The password grant works only because the development client enables direct access grants; yours should not.

## You are signed out unexpectedly

- Sessions end after 60 idle minutes and 24 hours in all (`session.idle_ttl_minutes`, `session.absolute_ttl_hours`).
- OIDC back-channel logout from the provider revokes every session of the user, and a user disabled or deleted at the
  provider is signed out when the provider sends it.

## Locked out entirely

Use the break-glass administrator: **Admin sign-in (break-glass)** on the sign-in page. If its password is lost, create
another administrator with `egret init --force`; see [Cannot sign in](./cannot-sign-in).

## Further reading

- [Authentication setup](../authentication)
- [Cannot sign in](./cannot-sign-in)
