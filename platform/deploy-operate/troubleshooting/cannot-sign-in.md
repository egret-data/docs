---
sidebar_position: 1
---

# Cannot sign in

Problems on the sign-in page and right after it. For errors that come back from the identity provider, see [SSO
errors](./sso-errors).

## *Invalid email or password*

The local form (the whole page without SSO, or **Admin sign-in (break-glass)** with SSO) shows *Invalid email or password*
when the server answers `401 {"error":"unauthorized"}`.

**Causes**

- The email or password is wrong. The break-glass account is the one `egret init` created; `.env.example` and the Helm chart
  default it to `admin@egret.local`, but its password is the one `init` printed, or `EGRET_ADMIN_PASSWORD`, or the chart's
  `admin.password`.
- The account was never created: a fresh database has no administrator until `egret init` runs. In Kubernetes the
  `egret-init` hook job creates it after install; check `kubectl get job -n egret-system egret-init`.
- You are signing in with an SSO user's email on the local form. Use **Sign in with SSO**.

**Fix**

- Create the account, or reset access, with `egret init`. If an administrator already exists, `init` does nothing; pass
  `--force` and a **different** email to add another administrator (reproduced):

  ```bash
  EGRET_ADMIN_EMAIL=recovery@example.com EGRET_ADMIN_PASSWORD='choose-a-long-password' egret init --force
  ```

  Reusing the existing email fails with `conflict: user already exists: admin@egret.local`. Remove the recovery account when
  you no longer need it.

## *Too many attempts. Please wait a few minutes and try again.*

The server answered `429 {"error":"too many requests"}`. Local sign-in allows **5 attempts per 5 minutes** (`rate_limit.login_max_attempts`
and `login_window_secs`), counted per address and per email, and **successful attempts count**: reproduced with one successful
and four failed attempts, after which the next attempt was refused. Once exceeded, the key stays blocked for
`rate_limit.login_lockout_secs` (300).

**Fix**

- Wait. Do not keep retrying: a script that retries during the lockout can keep it open.
- Automation should not sign in with the local form at all. Use a Data API client or a catalog client for machine access, or
  keep one session and reuse its cookies.
- In a throwaway instance, restarting the server clears the limiter, which is in memory. Do not do that on a shared one.
- Behind a proxy, all clients share one bucket if the proxy hides their address, and a proxy that **appends** to
  `X-Forwarded-For` lets callers choose their own bucket. See the [security checklist](../security-hardening).

## Signed in, but sent straight back to the sign-in page

Typical when the session cookie is not stored or not sent.

| Cause | Check and fix |
|---|---|
| `EGRET_SESSION__SECURE=true` but the site is served over plain HTTP | Browsers drop `Secure` cookies on non-localhost HTTP. Serve HTTPS, or set it to `false` for a test instance. |
| The page and the API are on different origins | The cookie is set for the origin the browser sent the request to. In development, open the Vite port (5173 or the port your proxy serves), not the backend port, and make `oidc.redirect_url` use that same origin. |
| On the demo stack, the browser is on `localhost` | Egret and Keycloak know the stack as `http://egret.localtest.me:8080` (`DEMO_URL`): **Sign in with SSO** started on `localhost` returns to `egret.localtest.me`, where the sign-in was never started. Open the `egret.localtest.me` address; see [Run the demo stack](../../get-started/run-the-demo-stack#host-names). |
| The session ended | Sessions last at most `session.absolute_ttl_hours` (24) and end after `session.idle_ttl_minutes` (60) idle. `GET /api/auth/me` answers `401 {"error":"unauthorized"}` when there is no valid session. |
| A signed-in user was disabled or signed out by the identity provider | Back-channel logout revokes every session of that user. Sign in again. |

## A script gets `403 csrf check failed`

Every state-changing request needs the `X-Egret-CSRF` header (`csrf.header_name`) carrying the value of the `egret_csrf`
cookie. A `POST` with only the session cookie is refused (reproduced):

```text
csrf check failed [403]
```

Read the CSRF cookie after sign-in and send it back in the header, as the web app does. `GET` requests do not need it.

## Signed in, but the app is empty or says *Forbidden*

You are authenticated and have no permissions. An SSO user is created as a plain member; access comes from roles granted to
their **groups**.

- Check the user under **Control Plane → Users** and the groups under **Control Plane → Groups**: is the group there, and does
  it have a platform role or a workspace membership?
- No groups at all: the token does not carry them. See [SSO errors](./sso-errors).
- Grant access with **Manage → Workspace settings → Members**, or `egret workspace add-group --workspace <slug> --group <name>
  --role ws_editor`.
- **Access Explorer** (Control Plane) shows what a user can reach and through which grant.

## You forgot the break-glass password

There is no reset link. Create a second administrator as shown above, sign in with it, and set a new password for the first.

## Further reading

- [Authentication setup](../authentication)
- [First login tour](../../get-started/first-login-tour)
