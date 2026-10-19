---
sidebar_position: 5
---

# Ranger plugin

The **Plugin** tab of an engine's page tells you how to connect an engine you run yourself to egret's policies. It shows what to install on the engine, what egret assumes, and what you must supply. For an engine egret provisions, the plugin is configured for you.

![The Plugin tab: service name, download URL, settings and the two configuration files](/img/platform/admin/gov-engine-plugin.png)

The tab shows only for an engine bound to a policy profile. With no profile, the Control Plane's **Plugin config** tab reads *engine … is bound to no policy profile: bind a profile first*.

## Install the plugin on your engine

1. On the engine page, select **Plugin**.
2. Note the **Ranger service name** (the profile name) and the **Policy download URL**.
3. Copy the files under **Files**: `access-control.properties` and `ranger-trino-security.xml` for Trino. Each has **Copy** and **Download** buttons.
4. Install them on the coordinator, restart it, and make sure the engine can reach the download URL.
5. Check the Governance overview: the plugin liveness checks move from *Not judged* once the engine downloads.

### Install on your engine

| Field | Meaning |
|---|---|
| **Ranger service name** | The profile name the plugin asks for, for example `docs-trino-policy`. |
| **Policy download URL** | `<public url>/service/plugins/policies/download/<profile>`. |
| **Authentication** | Whether egret requires a bearer token on the download. Egret does not show or issue the token. |
| **Declared plugin version** | The Ranger plugin version recorded for the engine. |

### Warnings

The tab raises warnings when something will stop the download:

- The download URL is a loopback or unspecified address, so no external engine can reach it. The URL comes from the `[catalog] public_url` setting, which defaults to localhost on a fresh install. Set it to an address the engine can reach.
- Egret requires a bearer token on `/service`, and a stock Ranger plugin cannot send it, so the download is refused (401) unless something in front of egret adds the token or exempts the engine.

### You must supply

*egret renders no credential and invents none.* You provide:

- A network path from the engine to the download URL.
- The files shown, installed by you. Egret never connects to the engine.
- A way to present egret's bearer token on the download, for example a proxy that adds it.

### What egret assumes

Egret cannot check these on an engine it does not run. Explain and the migration check rely on them:

- The plugin has no super-users configured (no `ranger.plugin.*.super.users`), so every request is evaluated against the downloaded policies.
- The plugin has no group provider and no usersync, so a user belongs to no group beyond the one egret's policies name.
- Plugin audit is off, so egret's evaluation is the only decision record.

:::caution
If any assumption is false on your engine, explain can answer *Allowed* where the engine refuses, or the reverse. A super-user in the plugin config is checked before every policy.
:::

## Plugin versions

Egret proves migrations and explains access only for Trino with plugin 2.5.0 or 2.8.0 and StarRocks with 2.8.0 or 2.9.0. Another version is recorded as you declare it, and those features refuse. The governance overview flags an unmodelled version as a finding.

## Where the same information is in the Control Plane

The Control Plane engine page has a **Plugin config** tab with the same content, and its **Settings** tab sets the plugin version. See [Engine detail](../../control-plane/query-engines/engine-detail.md).

## Limits and known issues

- On the demo instance the download URL is `http://localhost:8080`, which a remote engine cannot reach, and the bearer-token warning is shown. Both warnings are expected locally.
- Egret does not know whether an external engine ever downloaded its profile.

## Further reading

- [Engines and policy](./index.md)
- [Explain access](../data/explain-access.md)
