---
sidebar_position: 2
---

# Query engines

**Control Plane → Infrastructure → Engines** is the registry of the query engines of the platform: the Trino and StarRocks clusters that run SQL for SQL Lab, charts and dashboards. An engine here is either **provisioned** by egret, or **external**: a cluster you run yourself and have registered so egret can manage its access policy.

![The Engines list with the Trino and StarRocks tabs: the provisioned docs-trino and the external docs-trino-ext and trino-demo-ext](/img/platform/admin/cp-engines.png)

You need **engine:read** to open the page. Registering and creating engines need **engine:create**.

## The engine list

A summary strip counts **engines**, how many are **running** and **not running**, and how many are **external**. Tabs filter by engine type: **Trino** and **StarRocks**, the types egret provisions. Another type gets a tab only when the registry holds an engine of that type, so every engine is listed under a tab. **Search Trino engines…** filters the list by name.

| Column | Meaning |
|---|---|
| **Name** | The engine name. It links to the engine page. |
| **Type** | `trino` or `starrocks`. |
| **Endpoint** | The `host:port` a workspace connection to the engine dials: for example `docs-trino-trino.egret-engines.svc:8443` for a provisioned Trino engine with JWT delegation, the host and port you entered (for example `trino-demo:8080`) for an external one. |
| **Status** | The lifecycle status of a provisioned engine (**Provisioning**, **Running**, **Failed**). **External** for a registered one: egret does not monitor it. |
| Actions | **Details** opens the engine. |

## Add an engine

Two buttons sit at the top right:

| Button | Does |
|---|---|
| **Register external engine** | Records a cluster you run yourself. Egret does not provision, restart or monitor it. See [Register an external engine](./register-external.md). |
| **Add engine** | Starts a Trino or StarRocks cluster against catalogs from the registry. See [Provision an engine](./provision.md). |

Where a provisioned engine runs depends on how egret is deployed. On Kubernetes egret creates Deployments and Services in the engine namespace. With the Docker provisioner (`[engines] provisioner = "docker"`), egret starts each engine as Docker containers on the same Docker host.

:::note Demo stack
The Docker demo stack uses the Docker provisioner: **Add engine** starts Trino as containers named `egret-engine-egret-engines-<name>-coordinator` (and `…-worker-<i>`). The first engine pulls the `trinodb/trino` image; plan about 1.5 to 2 GB of memory per engine. StarRocks engines, ingress, pod logs and the shell are Kubernetes-only (see [Engine detail](./engine-detail.md#kubernetes-only-features)). After `just demo-down` and `just demo-up` the engine containers are gone: press **Restart** on each engine to create them again.
:::

## Which one to choose

| | Provisioned engine | External engine |
|---|---|---|
| Who runs the cluster | Egret, on Kubernetes or Docker | You |
| Lifecycle, monitoring, restart | Egret | You |
| Policy profile | Created and bound automatically | You create it and bind it (see [Engines and policy](../../data-governance/engines-and-policy/index.md)) |
| Ranger plugin | Configured by egret | You install it from the **Plugin config** tab |
| Assign to workspaces | Yes, when JWT authentication is on | No: the workspace picker lists provisioned engines only |
| Delete | Destroys the cluster (pods or containers) | Removes the record only |

## Open an engine

Select the name or **Details** on a row. The page depends on the kind: see [Engine detail](./engine-detail.md).

## How engines relate to catalogs and workspaces

- A **catalog** (see [Catalogs](../catalogs/index.md)) becomes queryable on an engine when it is **attached** (provisioned engine) or **declared** (external engine).
- A **workspace** sees the engines assigned to it, plus the database connections an admin adds in **Workspace settings → Connections** (see [Connections](../../workspace-settings/databases.md)).
- **Governance** policies reach an engine through the profile the engine downloads (see [Engines and policy](../../data-governance/engines-and-policy/index.md)).

## Limits and known issues

- Egret cannot see whether an external engine is up or whether it downloads its profile.
- After a delete the list can keep showing the engine until you reload the page.

## Further reading

- [Register an external engine](./register-external.md)
- [Provision an engine](./provision.md)
- [Engine detail](./engine-detail.md)
