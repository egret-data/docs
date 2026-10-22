---
sidebar_position: 9
---

# Security hardening checklist

What to change before an Egret deployment is reachable by anyone you do not fully trust. The repository's compose file, its
`.env.example` and its Helm chart are development tooling with public default credentials, and this checklist lists what
that means. Each item says how to check it. Tick them in order.

## 1. Secrets and keys

- [ ] **Generate your own `EGRET_SECURITY__SECRET_KEY`.** The value in `.env.example` is public. It encrypts the OIDC state
  cookie and must be base64 of at least 64 bytes.

  ```bash
  head -c 64 /dev/urandom | base64
  ```

- [ ] **Set `EGRET_SECRETS__MASTER_KEY`** to base64 of at least 32 bytes and store it in a secret manager, apart from your
  database backups. It encrypts every stored connection and storage credential (AES-256-GCM). If it is empty, sealing is off
  and saving a connection with a secret fails. A changed key makes existing secrets unreadable, so do not rotate it casually.
  This page does not describe a rotation procedure because the product does not document one.
- [ ] **Set a long random `EGRET_CATALOG__AUTH_TOKEN`** if the catalog is on. The Helm chart generates one and keeps it on
  upgrade.
- [ ] **Do not put secrets in `egret.toml` or in a values file in version control.** Use the environment, populated from
  your secret store.
- [ ] **Replace every dev credential**: PostgreSQL `egret`/`egret`, RustFS `egret`/`egretsecret`, Keycloak `admin`/`admin`
  and the Keycloak client secret `egret-secret`. Give the object-store account access to the Egret bucket only.

## 2. The break-glass administrator

- [ ] **Set the password yourself** with `EGRET_ADMIN_PASSWORD` at `egret init`; `init` does not print a supplied password
  (or let `init` generate one, printed once, and store it in a vault). Never keep the Helm default `Admin12345!` (`admin.password`).
- [ ] **Move day-to-day administration to IdP groups.** Grant `platform_admin` to a group in **Control Plane → Groups**, and
  keep the local account for recovery.
- [ ] **Keep the local sign-in rate limit.** Five attempts per five minutes (`rate_limit.login_*`) is what stands in front of
  password guessing, and successful attempts count.
- [ ] **Know that local sign-in cannot be switched off.** With SSO on, the local form is only hidden behind **Admin sign-in
  (break-glass)**; the `POST /api/auth/login` route still answers. Restrict who can reach it at the network layer if that
  matters to you.
- [ ] **Watch it.** Every authorization decision and governance change is in **Control Plane → Audit log**; keep `audit.enabled`
  on and set `audit.retention_days` to your policy (default 90; `0` disables pruning).

## 3. TLS

Egret speaks plain HTTP; terminate TLS in front of it.

- [ ] **Serve the app over HTTPS** at an ingress or load balancer, and set `EGRET_SESSION__SECURE=true` so the session and
  OIDC cookies are `Secure`. The Helm chart does this when `ingress.tls.enabled` is true.
- [ ] **Make the proxy overwrite `X-Forwarded-For`, not append to it.** The login and token rate limiters key on the first
  hop of that header. A proxy that appends hands the caller the limiter's key: a spoofed header gets a fresh budget on
  demand. The chart's nginx and ingress-nginx overwrite it. The price is that clients behind a second proxy share one bucket,
  which is the safe direction.
- [ ] **Use HTTPS to the identity provider**, and register only the exact redirect URI. The development realm uses
  `sslRequired: none` and `*` as a redirect URI.
- [ ] **Do not set `oidc.devRealm=true` in the Helm chart** outside a cluster only you can reach. It is the opt-in that lets
  `oidc.enabled=true` install the bundled Keycloak with the development realm; without it the chart refuses to render.
- [ ] **Enable TLS on the engines.** Trino enforces JWT only over HTTPS (over HTTP it accepts a valid token but also trusts a
  bare `X-Trino-User`). StarRocks' per-user JWT login sends the token in clear text with `mysql_clear_password` unless the
  front end has TLS.
- [ ] **Do not set `EGRET_ENGINE_TLS_INSECURE`** (`1`, `true`, `yes`). It turns off certificate verification when Egret
  connects to engines.

## 4. Network exposure

Expose only what clients need.

| Path | Audience | Note |
|---|---|---|
| `/` and `/api/*` | People | Behind TLS. |
| `/data-api/*`, `/oauth/token`, `/.well-known/*` | Data API consumers and clients of Egret's machine identity provider | Rate limited (`rate_limit.token_*`). |
| `/catalog/*` | Engines and Iceberg clients | Authenticated with Egret-issued tokens. |
| `/service/*` | **Engines only** | Read-only policy API; see below. |
| `/metrics`, `/healthz`, `/readyz` | **Your monitoring only** | **Unauthenticated.** `/metrics` answers `200` with Prometheus metrics to anyone who can reach it. The chart's ingress does not route them. |

- [ ] **Do not route `/service`, `/metrics`, `/healthz` or `/readyz` to the internet.**
- [ ] **Decide how the policy API is protected.** With `EGRET_RANGER__AUTH_TOKEN` empty, `/service` is open to anyone who can
  reach it (read-only: policies and tags). With a token set, a stock Ranger plugin cannot send it and is refused with 401.
  Prefer an empty token plus a network policy that admits only the engines. See [Engines and Ranger
  setup](./engines-and-ranger).
- [ ] **Keep PostgreSQL and the object store off the public network.** In Kubernetes, the chart's task and app pod network
  policies exist to keep user code away from the metadata database: set `workflow.tasks.networkPolicy.podCidr`,
  `serviceCidr` and `apiServerCidrs` correctly, because wrong values silently re-open PostgreSQL on some network plugins.

## 5. Features that widen the attack surface

- [ ] **Leave workflow webhooks off** (`workflow.webhooks_enabled = false`, the default). The routes are anonymous and the
  key in the URL is the only credential; the surface's own security review says it is not approved for exposure, and its
  bounds are per replica.
- [ ] **Do not use `workflow.container_runner = docker` outside development.** A Docker socket in the server is root on the
  node; the Helm chart refuses it. With `kubernetes`, task pods run as a non-root user in a Pod Security `restricted`
  namespace; restrict `allowed-images` and the metadata-service range.
- [ ] **Treat the workspace features `workflow_containers` and `workflow_kestra_plugins` as privileges.** They are off by
  default.
- [ ] **Restrict `workflow:use_secrets`.** Anyone who may save a flow that calls `secret()` can read any secret of the
  workspace; the permission is held by `ws_admin` only by default.
- [ ] **Set `automation.webhook_allow_hosts` narrowly.** Alert webhooks refuse private address space unless the host is
  listed.
- [ ] **For Data Apps, serve the apps origin on a sibling subdomain** (`apps.origin`), never another port of the same host,
  and never the same origin as Egret: the server refuses that, because author JavaScript on Egret's origin would run as Egret.

## 6. Engines and data policy

- [ ] **Pin engine images** to the measured versions. Floating tags are not modelled, and Explain refuses for them.
- [ ] **Turn on governance for connections whose data is sensitive** (**Governed data**) and use per-user delegation where
  the engine supports it, so row filters and masks apply per person. A shared service account bypasses them.
- [ ] **Remember StarRocks tag masking is not enforced by its Ranger plugin**; only resource-based policies are.
- [ ] **Re-check `access_control = ranger` after StarRocks container recreation.** It is lost silently.

## 7. Single sign-on

- [ ] **Do not import the development realm** into a shared Keycloak.
- [ ] **Register one redirect URI** and set `oidc.redirect_url` to it exactly.
- [ ] **Grant access to groups, not to individual users**, and review the group-to-role grants after every identity provider
  change. A group name the provider invents becomes a group in Egret: grant roles only to names you control.

## What to verify after hardening

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://egret.example.com/metrics                 # 404 or 403 from the proxy, not 200
curl -s -o /dev/null -w '%{http_code}\n' https://egret.example.com/service/plugins/services # not reachable from the internet
curl -sI https://egret.example.com/api/auth/config | grep -i set-cookie                     # no cookie yet; sign in and check Secure
```

Sign in, then check in the browser's developer tools that the `egret_session` cookie has `HttpOnly` and `Secure`.

## Further reading

- [Authentication setup](./authentication)
- [Configuration](./configuration)
- [Engines and Ranger setup](./engines-and-ranger)
- [Audit log](../control-plane/audit-log)
