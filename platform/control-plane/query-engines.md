---
sidebar_position: 2
---

# Query engines

**Control Plane → Engines** lists the query engines of the platform in tabs for **Trino**, **StarRocks** and **RisingWave** (RisingWave arrives in a later phase).

![Engines](/img/platform/control-plane-engines.png)

There are two ways to add an engine:

- **Add engine** provisions a Trino or StarRocks cluster against a catalog warehouse and monitors its health. This needs a Kubernetes cluster; without one the platform logs *kubernetes unavailable; engine provisioning disabled*.
- **Register external engine** records a cluster you run yourself.

## Register an external engine

![Register external engine](/img/platform/control-plane-engine-register.png)

Egret does not provision, restart or monitor a registered engine. It holds the record so that a policy profile can be bound to the engine and you can read the Ranger plugin configuration to install on it.

| Field | Meaning |
|---|---|
| **Name** | Lower-case letters, digits and hyphens, up to 63 characters. |
| **Engine type** | Trino or StarRocks. |
| **Host**, **Port** | A host name or IP address (no scheme, port or path) and the HTTP port. |
| **Plugin version** | The Ranger plugin version. Egret proves migrations and explains access only for Trino with plugin 2.5.0 or 2.8.0 and StarRocks with 2.8.0 or 2.9.0; another version is recorded as you declare it and those features refuse. |
| **Policy profile** | Bind a profile now, or later from the engine's Settings tab. A profile can belong to one engine. |
