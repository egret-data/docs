---
sidebar_position: 3
---

# Authentication setup

Egret has two ways to sign in: **single sign-on** through an OpenID Connect (OIDC) identity provider, and a **local
administrator** that is always available as a break-glass login. This page sets up single sign-on with Keycloak, explains
the realm file in the repository, and shows how groups become access.

## How sign-in works

1. The browser opens `GET /api/auth/oidc/login`. Egret starts an authorization-code flow with PKCE (`S256`), stores the
   state, nonce and PKCE verifier in a cookie encrypted with `security.secret_key`, and redirects to the provider.
2. The provider authenticates the person and redirects to `oidc.redirect_url` (`/api/auth/oidc/callback`).
3. Egret exchanges the code, validates the ID token and creates or updates the user. Users are matched by the token's `sub`;
   the email and name are refreshed at every sign-in. Group names from the `groups` claim are recorded and the user's
   membership of them is synchronized.
4. Egret sets a session cookie (`egret_session`, `HttpOnly`) and a CSRF cookie (`egret_csrf`), and redirects to
   `oidc.post_login_redirect` (`/`).

A session lasts at most `session.absolute_ttl_hours` (24) and ends after `session.idle_ttl_minutes` (60) without a
request. The provider can end it earlier with OIDC back-channel logout; see below.

## What you configure in Egret

| Key | Environment variable | Value |
|---|---|---|
| `oidc.enabled` | `EGRET_OIDC__ENABLED` | `true` |
| `oidc.issuer_url` | `EGRET_OIDC__ISSUER_URL` | The realm's issuer, for example `https://sso.example.com/realms/egret`. Egret reads discovery from it, and the ID token's `iss` must equal it. |
| `oidc.client_id` | `EGRET_OIDC__CLIENT_ID` | `egret` |
| `oidc.client_secret` | `EGRET_OIDC__CLIENT_SECRET` | The client's secret. |
| `oidc.redirect_url` | `EGRET_OIDC__REDIRECT_URL` | `https://<egret-host>/api/auth/oidc/callback`, exactly as registered at the provider. |
| `oidc.groups_claim` | `EGRET_OIDC__GROUPS_CLAIM` | `groups` |
| `oidc.scopes` | `EGRET_OIDC__SCOPES` | Default `["openid","email","profile"]`. |
| `security.secret_key` | `EGRET_SECURITY__SECRET_KEY` | Base64, at least 64 bytes. **Required** when OIDC is on. |
| `session.secure` | `EGRET_SESSION__SECURE` | `true` when Egret is served over HTTPS. |

With `oidc.enabled = true`, the server refuses to start unless `security.secret_key` decodes to at least 64 bytes and both
`issuer_url` and `client_id` are set. The sign-in page then offers **Sign in with SSO** next to the break-glass link; see
the [First login tour](../get-started/first-login-tour).

## Keycloak

### Use the realm file for development

`deploy/keycloak/egret-realm.json` is a ready realm named `egret`, imported by the compose stack at start
(`start-dev --import-realm`). It defines:

| Item | Setting |
|---|---|
| Client `egret` | Confidential, secret `egret-secret`, standard flow and direct access grants on, PKCE method `S256`. |
| Groups | `data-team` and `platform-admins`. |
| Group mapper `groups` | Type *Group Membership*, claim name `groups`, **full path off** (so the claim holds `data-team`, not `/data-team`), added to the ID token, access token and userinfo. |
| Audience mappers | `egret-catalog`, `trino` and `starrocks`, on the access token. They make the token acceptable to the embedded catalog and to engines for per-user delegation. |
| Back-channel logout | URL `http://egret.egret-system.svc.cluster.local:8080/api/auth/oidc/backchannel-logout` (the in-cluster address used by the Helm chart), session required: off. |
| Users | `admin-sso` (group `platform-admins`), `member-sso` and `tester` (group `data-team`). Passwords are in the file. |

The decoded access token for `tester` in this realm contains `"groups": ["data-team"]`, an `aud` list of
`["egret-catalog", "trino", "starrocks"]`, and the user's `sub`, `email` and `preferred_username`.

:::danger The realm file is for development only
It disables TLS (`sslRequired: none`), accepts `*` as a redirect URI, enables the password grant, contains a client secret
and three users with known passwords. Do not import it into a shared Keycloak. Create your own realm. The Helm chart
bundles this realm with `oidc.enabled=true` only when you also set `oidc.devRealm=true` (see [Kubernetes](./kubernetes)).
:::

### Set up your own realm

In the Keycloak admin console, in a realm of your own (menu names vary slightly between Keycloak versions):

1. **Clients → Create client.** Client type *OpenID Connect*, client ID `egret`. Turn **Client authentication** on and
   keep **Standard flow** on. Direct access grants can stay off.
2. Set **Valid redirect URIs** to the single callback URL, `https://<egret-host>/api/auth/oidc/callback`, and **Web origins**
   to `https://<egret-host>`.
3. Under **Advanced**, set **Proof Key for Code Exchange Code Challenge Method** to `S256`.
4. Copy the client secret from **Credentials** into `EGRET_OIDC__CLIENT_SECRET`.
5. **Client scopes → egret-dedicated → Add mapper → By configuration → Group Membership.** Name `groups`, token claim name
   `groups`, **Full group path** off, **Add to ID token**, **Add to access token** and **Add to userinfo** on.
6. Create groups and put users in them.
7. For per-user delegation to engines, also add *Audience* mappers for `egret-catalog`, `trino` and `starrocks` as in the
   realm file.
8. Optional: under **Advanced**, set **Backchannel logout URL** to `https://<egret-host>/api/auth/oidc/backchannel-logout`.

Then set the Egret keys above and restart the server.

### Other providers

Any provider that supports the authorization-code flow with PKCE, publishes OIDC discovery under `issuer_url`, and puts the
user's groups in an ID-token claim as an array of strings works. Set `oidc.groups_claim` to that claim's name. If your
provider emits group paths (`/data-team`), turn that off or the group names in Egret will not match the names you grant to.

## Groups and access

A person who signs in through SSO has no access until a role is granted to one of their groups. Group names come only from
the token. They are recorded as IdP-managed groups, and a claim that names a group created locally in Egret does not join
the user to it.

| To give a group | Do |
|---|---|
| Platform administration | **Control Plane → Groups**, open the group, assign the platform role (for example `platform_admin`). |
| Access to a workspace | **Manage → Workspace settings → Members**, add the group with a role (`ws_admin`, `ws_editor`, `ws_viewer`). |
| The same from a terminal | `egret workspace add-group --workspace <slug> --group <idp-group> --role ws_editor` |

`deploy/seed-sso-test-rbac.sql` shows the grants the development realm uses: the group `platform-admins` gets the platform
role `platform_admin`, and `data-team` gets `ws_editor` in two workspaces. These grants belong to Egret and are **not**
part of the identity provider, so resetting the database removes them and SSO users lose access until they are made again.

## The break-glass administrator

`egret init` creates a local administrator and the `default` workspace. It is the way in when the identity provider is down,
misconfigured, or has not been connected yet.

```bash
EGRET_ADMIN_EMAIL=ops@example.com EGRET_ADMIN_PASSWORD='a long random password' egret init
```

- Without `EGRET_ADMIN_PASSWORD` (or with it empty), `init` generates a password and prints it once. Store it in a vault. A
  password you supply is never printed: `init` prints `Password: taken from EGRET_ADMIN_PASSWORD (not shown)`.
- `init` does nothing when a platform administrator already exists. `egret init --force` adds another one.
- On the sign-in page the account is behind **Admin sign-in (break-glass)** when SSO is on.
- Local sign-in is rate limited (`rate_limit.login_*`: 5 attempts per 5 minutes, successful attempts included), which also
  slows password guessing.

See the [security checklist](./security-hardening) for how to protect and monitor it.

## Back-channel logout

When the identity provider calls `POST /api/auth/oidc/backchannel-logout` (OIDC Back-Channel Logout 1.0), Egret revokes
every session of the token's `sub`. The call has no cookie and no CSRF token: it is secured by the logout token's signature,
checked against the provider's keys, with `iss`, `aud` and `exp` enforced. A subject Egret does not know is a no-op that
still answers 200, so the endpoint does not reveal who has an account. A bad token answers 400.

## Machine identity is separate

Egret also issues its own tokens to engines, the catalog and Data API clients, from `POST /oauth/token` with a published
`/.well-known/openid-configuration` and `/.well-known/jwks.json`. That issuer is configured by `idp.issuer`, not by the
`oidc` section, and is unrelated to people signing in. See [Configuration](./configuration#address-settings-that-people-confuse).

## Troubleshooting

See [SSO errors](./troubleshooting/sso-errors) and [Cannot sign in](./troubleshooting/cannot-sign-in).
