---
sidebar_position: 5
---

# Engines and Ranger setup

Egret runs queries on **Trino** and **StarRocks** and enforces data policy inside them through the Apache Ranger plugin each
engine ships. Egret plays the part of the Ranger administration service: the engine's plugin polls Egret for policies.
This page covers the engine versions Egret has measured, how to connect an engine, and the plugin configuration Egret
serves. Managing engines in the app is covered in [Query engines](../control-plane/query-engines) and
[Data governance](../data-governance/engines-and-policy).

:::note What was run for this page
The Ranger download endpoints and the plugin-config endpoints were called on a running instance. **Add engine** was run on the
[demo stack](../get-started/run-the-demo-stack), where Egret provisions Trino as Docker containers. Provisioning on Kubernetes
was not run (no cluster); that part is described from the source and the repository's guides.
:::

## Supported versions

Egret reads each engine's Ranger plugin version from the engine's exact image, not from its type, and models policy
evaluation for specific (engine, plugin) pairs. The images below are the ones Egret has measured, by reading the plugin
jar out of each.

| Engine | Image | Ranger plugin |
|---|---|---|
| Trino | `trinodb/trino:470` | 2.5.0 |
| Trino | `trinodb/trino:483` | 2.8.0 |
| StarRocks | `starrocks/fe-ubuntu:4.1.4` | 2.8.0 |
| StarRocks | `starrocks/fe-ubuntu:4.1.6` | 2.9.0 |

Plugin 2.5.0 cannot present the engine credential the policy service requires (see [Authentication of the plugin](#authentication-of-the-plugin)), so Egret refuses to create an engine on `trinodb/trino:470` or update one onto it (400), and refuses to register an external engine that declares a plugin older than 2.8.0. An existing Trino 470 engine must move to Trino 483.

New provisioned engines default to **Trino 483** and **StarRocks 4.1.6**, pinned by digest. `GET
/api/control-plane/engines/modelled-ranger-plugins` lists the modelled pairs: Trino 2.5.0 and 2.8.0, StarRocks 2.8.0 and
2.9.0. An engine on a floating tag (`latest`, `4.1-latest`) or a rebuilt image is reported as **not modelled**: policies
still compile and the plugin still enforces them, but **Explain** and policy migrations refuse until you pin the image. The
digests and the pinning procedure are in the repository's `docs/en/guides/engine-versions.md`.

:::warning StarRocks 4.1.6 enforces view privileges that 4.1.4 did not
After moving a StarRocks engine from 4.1.4 to 4.1.6, a reader who relied on a view without holding a grant on it starts to
get `ERROR 5204`. Grant the view, or the base columns for an `INVOKER` view, to the readers who should have it.
:::

## Connect an engine

There are two ways, both under **Control Plane → Engines** (see [Query engines](../control-plane/query-engines)):

| Way | What Egret does | Needs |
|---|---|---|
| **Register external engine** | Stores the host, port and the plugin version you declare. Never touches the cluster. | A reachable Trino or StarRocks. Works with no Kubernetes. |
| **Add engine** | Provisions the engine and wires the plugin, catalog and delegation: as Kubernetes workloads, or, with the Docker provisioner, as containers on one Docker host (Trino only). | A cluster and a service account for Egret (see [Kubernetes](./kubernetes)), or the Docker provisioner. |

Then a workspace points at the engine with a database connection (**Manage → Workspace settings → Connections**).

`[engines] provisioner` (`EGRET_ENGINES__PROVISIONER`) chooses the backend: `auto` (the default: Kubernetes when Egret runs in
a cluster or finds a kubeconfig), `kubernetes`, `docker` or `none`. `auto` never picks `docker`. With `auto` and no cluster the
server logs `kubernetes unavailable; engine provisioning disabled` and **Add engine** does not work; **Register external
engine** does.

### The Docker provisioner

The [demo stack](../get-started/run-the-demo-stack) sets `EGRET_ENGINES__PROVISIONER=docker` and logs `engine provisioning:
docker` at start. Egret then starts each Trino engine as containers (`egret-engine-egret-engines-<name>-coordinator`, and
`…-worker-<n>` per worker), labelled `egret.managed=true` and `egret.project=<project>`, with no published ports, no mounts
and all capabilities dropped. Egret never touches a container without both labels.

| Key | What it sets |
|---|---|
| `EGRET_ENGINES__DOCKER__HOST` | The Docker API: `unix://`, `tcp://` or `http://`. Default `unix:///var/run/docker.sock`. The demo stack uses a socket proxy, `tcp://docker-proxy:2375`. |
| `EGRET_ENGINES__DOCKER__NETWORK` | The network the engine containers join. Required. |
| `EGRET_ENGINES__DOCKER__PROJECT` | The value of the `egret.project` label. Required. |
| `EGRET_ENGINES__DOCKER__CALLBACK_URL` | How engines reach Egret, when it differs from the default derived from `catalog.public_url`. |
| `EGRET_ENGINES__DOCKER__ALLOWED_IMAGES` | Image repositories an engine may use, as a JSON array. Default `["trinodb/trino"]`. |

StarRocks, ingress, autoscaling, extra mounts or containers, image pull secrets and extra ports are refused with an error that
names them, and the engine's **Logs** and **Exec** buttons answer *not available with the Docker engine provisioner* (use
`docker logs`). Whoever can reach the Docker API can control the host; the demo stack is not a safe place for untrusted users
(see its [Security](../get-started/run-the-demo-stack#security) section).

### Requirements on the engine

| Engine | Requirement |
|---|---|
| Trino | `http-server.process-forwarded=true`. Egret sends `X-Forwarded-Proto`; without the setting Trino answers *406* and Egret reports *502*. See [Engine 406 and 502 errors](./troubleshooting/engine-406-502). |
| Trino | For per-user delegation, JWT authentication (`http-server.authentication.type=JWT`) with `principal-field=preferred_username` and `required-audience=trino`, **over HTTPS**. Over plain HTTP Trino accepts a valid JWT but does not require one. |
| StarRocks | A security integration of type `authentication_jwt` for per-user delegation, with `required_issuer` equal to Egret's issuer and `required_audience` `starrocks`. The `jwks_url` must start with `http://` or `https://`. |
| Both | A network path from the engine to Egret for policy downloads, and to the catalog if you use it. |

The development stack's `deploy/trino/etc/config.properties` and `deploy/starrocks/init/security-integration.sql` are worked
examples of the JWT settings. They are development values: the Trino one uses a self-signed keystore and a placeholder
shared secret, and the StarRocks one runs over plain TCP, where `mysql_clear_password` sends the token in clear text. Enable
TLS on both before any real use.

## The policy service

Turn it on with `ranger.enabled = true` (`EGRET_RANGER__ENABLED`). Egret then serves a read-only, Ranger-compatible API
under `/ranger`, on the same server and port as `/api`. A plugin's `policy.rest.url` is `<egret>/ranger`, and the plugin
appends Ranger's own `/service/...` paths itself:

| Route | Purpose |
|---|---|
| `GET /ranger/service/plugins/secure/policies/download/{service}?lastKnownVersion=N` | The policies of a policy profile, for a plugin that sends a username and password (what Egret's engines do). The same answer is served at `/ranger/service/plugins/policies/download/{service}`. `304` when `N` is the current version, `200` with the policy set otherwise, `404` for an unknown profile. |
| `GET /ranger/service/tags/secure/download/{service}?lastKnownVersion=N` | The resource-to-tag mapping, from the classification tags assigned in Governance. Also served at `/ranger/service/tags/download/{service}`. |
| `GET /ranger/service/plugins/definitions`, `/definitions/name/{name}`, `/services`, `/policies/{id}` | Service definitions and listings, for the operator token only. |

`{service}` is the name of a **policy profile**, created under **Governance → Engine & policy**. The plugin's
`service.name` must equal it. Egret has no write routes under `/ranger`: policies are authored through the authenticated
control-plane API. The old `/service/...` paths at the server root answer `404`. Egret serves no Ranger roles or user
store: `/ranger/service/roles/secure/download/...` answers `404`, and the plugin carries on.

### Platform admins on the engines

When an engine is applied, Egret seeds `egret-admin - <resources>` policies into its profile (one per resource
hierarchy). They give every **active** platform admin all access on the engine, by engine username. Egret keeps them in
step with platform-admin membership: granting or removing `platform_admin` (to a user or to a group), adding or removing a
member of a group that holds it, deleting a user, disabling or enabling a platform admin, and `egret init` rewrite the `egret-admin`
policies of every engine in the same database transaction, and the policy version goes up. A disabled platform admin is
not in them. At every start the server also repairs `egret-admin` policies written before this behaviour existed
(one transaction per profile; a failure is logged and does not stop the start).

A change reaches an engine at the plugin's next download. Engine tokens already issued to a disabled or deleted user stay
valid until they expire (at most 15 minutes), but a disabled admin's tokens no longer carry all access once the new
policies are downloaded.

### Authentication of the plugin

Every request under `/ranger/service/` is authenticated. `ranger.auth_mode` (`EGRET_RANGER__AUTH_MODE`, Helm
`ranger.authMode`) is `required` by default:

| Caller | Header | May read |
|---|---|---|
| An engine | `Authorization: Basic` with the engine's own credential, username `engine-<engine id>` | The profile its engine is bound to and that profile's tag service. Anything else is `403`. |
| An operator | `Authorization: Bearer <ranger.auth_token>` | Everything. An empty `auth_token` (the default) accepts no bearer. |
| Anyone else | none | Nothing: `401`, with the same body whatever was wrong. |

`ranger.auth_token` (`EGRET_RANGER__AUTH_TOKEN`) is therefore only the operator's token for tooling. It does not lock the
plugins out: each engine presents its own credential, which needs a Ranger plugin 2.8.0 or later.

- **Engines Egret provisions** get their credential on the first apply of an engine bound to a policy profile. On
  Kubernetes it reaches the pods in a Secret; on the Docker provisioner it is written into the containers. You never see
  the password.
- **External engines** get theirs at registration: the register page shows the username, the password and a credential id
  **once**, and no other response carries the password. The Plugin config tab renders the files with the username and the
  placeholder `REPLACE_WITH_THE_ENGINE_PASSWORD`. **Rotate credential** on the engine's Overview tab issues a new one; the
  previous one keeps working until you confirm the new one is installed (**Retire previous credential**).

`ranger.auth_mode = "anonymous"` serves requests without a credential, and lets them read every profile. Use it only on a
throwaway local stack. The credential travels as HTTP Basic, so serve `/ranger` over TLS or keep it inside the cluster.

Checked against an engine's credential:

```bash
curl -s -o ranger-check.json -w '%{http_code} %{content_type}\n' \
  -u 'engine-<engine id>:<password>' \
  'https://egret.example.com/ranger/service/plugins/secure/policies/download/<profile>'
# 200 application/json   (a 200 with text/html is not Egret: route /ranger to Egret's backend)
```

A running plugin that is refused keeps enforcing the policies it holds in memory and retries every poll interval; a plugin
that starts with no cached policies and is refused denies everything.

## The plugin configuration Egret serves

Egret renders the plugin files in one place, so the files it mounts into engines it provisions are the same files it gives
you for an external engine. Fetch them with:

| Engine | Request |
|---|---|
| Any external engine | `GET /api/control-plane/engines/{id}/ranger-plugin-config`: the download URL, the auth mode, the plugin version, warnings and the files |
| Trino policy profile | `GET /api/control-plane/policies/services/{service}/trino-config` (needs `policy:read`) |

### Trino

`access-control.properties`:

```properties
access-control.name=ranger
ranger.service.name=<policy profile>
ranger.plugin.config.resource=/etc/trino/ranger-trino-security.xml
```

`ranger-trino-security.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
<property><name>ranger.plugin.trino.service.name</name><value>docs-trino-policy</value></property>
<property><name>ranger.plugin.trino.policy.rest.url</name><value>http://egret:8080/ranger</value></property>
<property><name>ranger.plugin.trino.policy.rest.client.username</name><value>engine-0b8f6c1e-…</value></property>
<property><name>ranger.plugin.trino.policy.rest.client.password</name><value>REPLACE_WITH_THE_ENGINE_PASSWORD</value></property>
<property><name>ranger.plugin.trino.policy.source.impl</name><value>org.apache.ranger.admin.client.RangerAdminRESTClient</value></property>
<property><name>ranger.plugin.trino.policy.cache.dir</name><value>/tmp/ranger/docs-trino-policy/policycache</value></property>
<property><name>ranger.plugin.trino.policy.pollIntervalMs</name><value>30000</value></property>
<property><name>ranger.plugin.trino.policy.rest.client.connection.timeoutMs</name><value>120000</value></property>
<property><name>ranger.plugin.trino.policy.rest.client.read.timeoutMs</name><value>30000</value></property>
</configuration>
```

`policy.rest.url` is Egret's base URL as the engine sees it, followed by `/ranger` (the plugin appends
`/service/plugins/...` itself). The username and password lines carry the engine's credential; for an external engine the
password is a placeholder you replace with the one shown at registration. The example above follows what the API returns; on a fresh install it says `http://localhost:8080`, taken from
`catalog.public_url`, which is not reachable from an engine in a cluster. Set `catalog.public_url` first.

### StarRocks

Three files: the line `access_control = ranger` for `fe.conf`, `ranger-starrocks-security.xml` (the same properties as
above with `starrocks` in place of `trino`) and `ranger-starrocks-audit.xml` (audit to Ranger off, because Egret keeps its
own audit log). Place the XML files in the front end's `conf` directory, which is on its class path. Three StarRocks facts
that cost time otherwise:

- `access_control = ranger` must be in `fe.conf` **before** the front end starts. `ADMIN SET FRONTEND CONFIG
  ("access_control"="ranger")` on a running front end reports success and changes nothing, and is not persisted.
- A literal `--` inside an XML comment crashes the front end at boot. The rendered files contain no comments.
- StarRocks' Ranger plugin supports **resource-based policies only**. Tag-based masking and row filters are enforced on
  Trino, and are not enforced by the StarRocks plugin.

### Verify the plugin is polling

On the engine, the plugin logs each poll (StarRocks: `fe.log`, `RangerAdminRESTClient.getServicePoliciesIfUpdated`).
Egret records the last download of every plugin, and **Governance → Engine & policy** shows the result for engines Egret
provisions. For an external engine it says that Egret does not judge it, because Egret does not run it and cannot tell
whether it should be polling. A 404 from the download route means no profile with that name exists yet. A `getRolesIfUpdated ... 404` warning from StarRocks is expected: Egret does not
implement Ranger's role download, and the plugin ignores it.

## Further reading

- [Data governance: engines and policy](../data-governance/engines-and-policy)
- [Storage and catalog setup](./storage-and-catalog)
- [Kubernetes](./kubernetes)
