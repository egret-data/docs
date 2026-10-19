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
The Ranger download endpoints and the plugin-config endpoints were called on a running instance. Provisioning an engine on
Kubernetes cannot run without a cluster; that part is described from the source and the repository's guides, and is marked
as not run locally.
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
| **Add engine** | Provisions the engine as Kubernetes workloads and wires the plugin, catalog and delegation. Not run locally. | A cluster and a service account for Egret; see [Kubernetes](./kubernetes). |

Then a workspace points at the engine with a database connection (**Manage → Workspace settings → Engines**).

Without a cluster the server logs `kubernetes unavailable; engine provisioning disabled` and **Add engine** does not work;
**Register external engine** does.

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
under `/service`:

| Route | Purpose |
|---|---|
| `GET /service/plugins/policies/download/{service}?lastKnownVersion=N` | The policies of a policy profile. Answers `304` when `N` is the current version, `200` with the policy set otherwise, `404` for an unknown profile. |
| `GET /service/tags/download/{service}?lastKnownVersion=N` | The resource-to-tag mapping, from the classification tags assigned in Governance. |
| `GET /service/plugins/definitions`, `/definitions/name/{name}`, `/services`, `/policies/{id}` | Service definitions and listings. |

`{service}` is the name of a **policy profile**, created under **Governance → Engine & policy**. The plugin's
`service.name` must equal it. Egret has no write routes under `/service`: policies are authored through the authenticated
control-plane API.

### Authentication of the plugin

`ranger.auth_token` decides who may call `/service`:

| `EGRET_RANGER__AUTH_TOKEN` | Behaviour |
|---|---|
| Empty | `/service` is open to anyone who can reach it. Stock plugins send no credentials, so they work. It is read-only. |
| Set | Every call needs `Authorization: Bearer <token>`. Without it the answer is `401`. |

A **stock Ranger plugin cannot send a bearer token**, and the plugin configuration Egret renders contains no credential. So a
token set on Egret locks stock plugins out unless something in front of Egret adds the header. Egret says so itself: the
plugin-config endpoint for an external engine warns *egret requires a bearer token on /service, and a stock Ranger plugin
cannot send it*. The usual arrangement is an empty token plus a network policy or ingress rule that exposes `/service` only
to the engines; the Helm chart's ingress does not route `/service` at all. See the [security
checklist](./security-hardening).

Checked on a running instance with the token set:

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/service/plugins/policies/download/docs-trino-policy
# 401
curl -s -o /dev/null -w '%{http_code}\n' -H 'Authorization: Bearer <token>' \
  'http://localhost:8080/service/plugins/policies/download/docs-trino-policy?lastKnownVersion=3'
# 304   (3 is the current policy version)
```

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
<property><name>ranger.plugin.trino.policy.rest.url</name><value>http://egret:8080</value></property>
<property><name>ranger.plugin.trino.policy.source.impl</name><value>org.apache.ranger.admin.client.RangerAdminRESTClient</value></property>
<property><name>ranger.plugin.trino.policy.cache.dir</name><value>/tmp/ranger/docs-trino-policy/policycache</value></property>
<property><name>ranger.plugin.trino.policy.pollIntervalMs</name><value>30000</value></property>
<property><name>ranger.plugin.trino.policy.rest.client.connection.timeoutMs</name><value>120000</value></property>
<property><name>ranger.plugin.trino.policy.rest.client.read.timeoutMs</name><value>30000</value></property>
</configuration>
```

`policy.rest.url` is Egret's base URL as the engine sees it (the plugin appends `/service/plugins/policies/download/...`
itself). The example above was returned by the API; on a fresh install it says `http://localhost:8080`, taken from
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
