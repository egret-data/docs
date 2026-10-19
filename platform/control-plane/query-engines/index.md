---
sidebar_position: 2
---

# Query engines

**Control Plane → Infrastructure → Engines** is the registry of the query engines of the platform: the Trino and StarRocks clusters that run SQL for SQL Lab, charts and dashboards. An engine here is either **provisioned** by egret on Kubernetes, or **external**: a cluster you run yourself and have registered so egret can manage its access policy.

![The Engines list with one external engine, docs-trino](/img/platform/admin/cp-engines.png)

You need **engine:read** to open the page. Registering and creating engines need **engine:create**.

## The engine list

A summary strip counts **engines**, how many are **running** and **not running**, and how many are **external**. Tabs filter by engine type: **Trino**, **StarRocks** and **RisingWave** (RisingWave arrives in a later phase).

| Column | Meaning |
|---|---|
| **Name** | The engine name. |
| **Type** | `trino` or `starrocks`. |
| **Endpoint** | Where it listens, for example `localhost:8091`. |
| **Status** | A lifecycle status for a provisioned engine. **External** for a registered one: egret does not monitor it. |
| Actions | **Details** opens the engine. |

## Add an engine

Two buttons sit at the top right:

| Button | Does |
|---|---|
| **Register external engine** | Records a cluster you run yourself. Egret does not provision, restart or monitor it. See [Register an external engine](./register-external.md). |
| **Add engine** | Provisions a Trino or StarRocks cluster on Kubernetes against catalogs from the registry. See [Provision an engine](./provision.md). |

:::note
The demo instance has no Kubernetes. Provisioning cannot run there (the platform logs *kubernetes unavailable; engine provisioning disabled*), so the provisioning pages of this guide are written from the product source. Registering an external engine works everywhere.
:::

## Which one to choose

| | Provisioned engine | External engine |
|---|---|---|
| Who runs the cluster | Egret, on Kubernetes | You |
| Lifecycle, monitoring, restart | Egret | You |
| Policy profile | Created and bound automatically | You create it and bind it (see [Engines and policy](../../data-governance/engines-and-policy/index.md)) |
| Ranger plugin | Configured by egret | You install it from the **Plugin config** tab |
| Assign to workspaces | Yes, when JWT is enabled | The workspace picker lists egret-provisioned engines |
| Delete | Destroys the cluster | Removes the record only |

## Open an engine

Select **Details** on a row. The page depends on the kind: see [Engine detail](./engine-detail.md).

## How engines relate to catalogs and workspaces

- A **catalog** (see [Catalogs](../catalogs/index.md)) becomes queryable on an engine when it is **attached** (provisioned engine) or **declared** (external engine).
- A **workspace** sees the engines assigned to it, plus the database connections an admin adds in **Workspace settings → Engines** (see [Databases](../../workspace-settings/databases.md)).
- **Governance** policies reach an engine through the profile the engine downloads (see [Engines and policy](../../data-governance/engines-and-policy/index.md)).

## Limits and known issues

- RisingWave is listed but not available yet.
- Egret cannot see whether an external engine is up or whether it downloads its profile.

## Further reading

- [Register an external engine](./register-external.md)
- [Provision an engine](./provision.md)
- [Engine detail](./engine-detail.md)
