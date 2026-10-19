---
sidebar_position: 2
---

# Provision an engine

**Add engine** creates a Trino or StarRocks cluster on Kubernetes, attaches registry catalogs to it, and configures it in one step. Egret then monitors its health, binds a policy profile and the Ranger plugin automatically, and can restart or delete it.

:::warning Not run on the demo instance
Provisioning needs a Kubernetes cluster. The demo instance has none, so this page is written from the product source and the page structure, not from a live provisioning run. Treat the defaults described here as what the form offers, and verify behaviour on your own cluster.
:::

![The New engine form: engine type, name, catalogs and the configuration sections](/img/platform/admin/cp-engine-new.png)

You need **engine:create** and **engine:provision**. The form itself opens without a cluster and can be filled in; creating fails when egret cannot reach Kubernetes.

## Create an engine

1. Go to **Control Plane → Infrastructure → Engines** and press **Add engine**.
2. Choose the **Engine type** (**Trino** or **StarRocks**) and type a **Name**.
3. Under **Catalogs**, tick the catalogs to attach and mark exactly one **Primary**. The text says *Attach any number of registry catalogs, and mark one primary. The primary is the warehouse the engine is created against; the rest are attached in the same request, so the engine never comes up half-configured.* Until one is primary the form says *Mark one catalog primary to create the engine.*
4. Under **Configuration**, adjust what you need. Leave a field blank to use the chart default.
5. Press **Create engine**.

## The Configuration sections (Trino)

The form shows *Cluster-wide, coordinator, and worker Trino config. Leave fields blank to use the chart defaults.* The sections are listed on the left:

| Section | What it configures |
|---|---|
| **Image** | The container **Image** (default `trinodb/trino:483@sha256:…`), **Image pull policy** and **Image pull secrets** (names of Kubernetes docker-registry secrets in the engine namespace). |
| **Server** | `config.properties`, `node.properties`, `log.properties` and the event listener for the cluster, plus **Fault-tolerant execution** (retry failed tasks and queries, spooling exchange data to S3). Pick a property from the catalog or add a custom key with **Add property**. |
| **Coordinator** | The same property files, for the coordinator only. |
| **Worker** | The same property files, for the workers only. |
| **Workload** | Resource groups and workload settings. |
| **Pod & Containers** | Resources, placement, pod options, security contexts, environment, volume mounts, and init and sidecar containers for the coordinator and workers. |
| **Autoscaling** | A HorizontalPodAutoscaler or a KEDA ScaledObject for workers. |
| **Security & Exposure** | JWT authentication, password users, per-user delegation and ingress exposure. |

Each property row shows the **Setting**, **Details** and **Value**, and the form validates known keys before you save. After the engine exists, **Save changes** shows a **Review changes** dialog with the diff before applying.

### Security & Exposure

| Setting | Meaning |
|---|---|
| **JWT authentication** | Lets the engine accept per-user JWTs from egret. An engine must have JWT enabled before it can be assigned to a workspace. |
| **Password users** | Static users with passwords for clients that cannot use JWT. |
| **Per-user delegation** | The delegation mode: none, **JWT delegation** or **Impersonation**, so queries run as the signed-in person. |
| **Ingress exposure** | Whether and how the engine is exposed outside the cluster. |

## StarRocks

A StarRocks engine has its own configuration screen with sections such as **Replicas & resources**, **JVM**, **Per-node memory**, **Health probes**, **Graceful shutdown**, **Resource groups** and **Session properties**, plus a Security section for authentication and delegation. Attaching or detaching a catalog on StarRocks creates or drops it on the FE in place, without rolling the pods.

## What happens next

1. Egret creates the cluster and a **policy profile** for it, and shows a **phase** (for example starting, then running).
2. Attached catalogs are applied to the engine. On Trino this applies the catalog ConfigMap and restarts the coordinator.
3. The Governance area can now grant on the catalogs and see the engine under **Engine & policy**.

If the engine fails to start, its page shows *The engine failed to start.* with the reason, and the Governance overview raises an **engine failed** finding.

## Limits and known issues

- A Trino catalog attach or detach restarts the coordinator, so queries in flight are lost.
- Without Kubernetes the form cannot create an engine.

## Further reading

- [Engine detail](./engine-detail.md)
- [Catalogs](../catalogs/index.md)
- [Engines and policy](../../data-governance/engines-and-policy/index.md)
