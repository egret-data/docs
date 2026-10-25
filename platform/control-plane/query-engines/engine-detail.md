---
sidebar_position: 3
---

# Engine detail

Select an engine in **Control Plane → Engines** to open its page. The tabs depend on whether egret runs the engine (a provisioned engine) or you do (an external engine).

## Provisioned engine

![The Overview tab of a provisioned engine on the Docker demo stack: phase running, one container, its catalogs and workspaces](/img/platform/admin/cp-engine-overview.png)

The header shows the engine name, its namespace (`egret-engines`), the image, the endpoint, the authentication (*JWT auth*) and the Ranger plugin version, with the type and status badges. The endpoint is the `host:port` a workspace connection to the engine dials, for example `docs-trino-trino.egret-engines.svc:8443` (port 8443 is the HTTPS listener of an engine with JWT delegation). **Open in Engine & policy** opens the engine in Governance, **Restart** restarts the engine, and the **More engine actions** menu (**⋯**) holds **Delete engine**. The tabs are **Overview**, **Catalogs**, **Workspaces**, **Settings** and **Monitor**.

### Overview

A strip shows the **phase**, **pods** (ready/total; **containers** on the Docker provisioner), **replicas** (for example *Coord 1 · Worker 0*, the counts the engine runs with), **catalogs**, **workspaces** and **auth** (*JWT auth*, impersonation, password auth or no delegation). For StarRocks, **FE replicas** and **CN replicas** replace *replicas*.

**Status** lists each pod with its **Phase** and **Ready** state and the **Logs** and **Exec** actions. On the Docker provisioner the table lists containers, for example `egret-engine-egret-engines-docs-trino-coordinator`, without **Logs** and **Exec**, and a note says *Logs and a shell are not available here for an engine Docker runs: read a container's log with docker logs on the Docker host.*

If the engine cannot start the page shows *The engine failed to start.* with the reason. While starting it reads *Starting up — the engine isn't reachable yet.*

### Catalogs

![The Catalogs tab: demo_warehouse is primary and applied, tpch_bench is applied](/img/platform/admin/cp-engine-catalogs.png)

*Data sources this engine can query. Attaching or detaching a catalog applies it to the cluster and restarts the Trino coordinator, so queries in flight are lost.* Each catalog shows its **Kind**, **Primary**, the **Apply** state and when it was **Applied**, with **Test** (runs `SHOW SCHEMAS` on the engine) and **Detach**. On an engine with JWT delegation the test runs as you, with the engine token Egret mints for you, so it fails if the engine's policy does not let you read the catalog. The primary catalog cannot be detached: *demo_warehouse is this engine's primary catalog. Detach it by deleting the engine.*

To attach another, choose it in **Catalog to attach** and press **Attach**. With nothing left the form says *Every catalog egret can show you is already on this engine.*

*Apply is this catalog's state on this engine, not a check that it still works*: a catalog that reached the engine before the engine broke is still recorded as **Applied**.

### Workspaces

![The Workspaces tab with Docs sandbox assigned](/img/platform/admin/cp-engine-workspaces.png)

*Workspaces assigned to this engine can query it with per-user delegation.*

1. Press **Add workspace**. The dialog says *Assign this engine to an active workspace.* and lists the workspaces not yet assigned.
2. Select one. A toast says *Workspace assigned*.

The engine then appears in that workspace's SQL Lab as a connection named after the engine (`docs-trino (trino)`) and under **Workspace settings → Connections → Provisioned by egret**. **Remove** unassigns it. **Add workspace** is disabled until **JWT authentication** is on in the engine's **Security & Exposure** settings.

### Settings

![The Settings tab with the configuration sections; Worker and Security & Exposure carry values](/img/platform/admin/cp-engine-settings.png)

*Cluster-wide, coordinator, and worker Trino config plus security and exposure. Saving re-provisions the engine.* (on the Docker provisioner: *Saving recreates the engine's containers.*) The sections are the ones of the create form (see [Provision an engine](./provision.md#the-configuration-sections-trino)).

1. Change a value, for example **Server → config.properties → Add property** `query.max-run-time` = `2h`.
2. Press **Save changes**. The **Review changes** dialog lists only what changes, for example *1 field will change.* with the old and new value, and says *Saving re-provisions (rolls) the engine pods; running queries are interrupted.* (on Docker: *Saving recreates the engine's containers; running queries are interrupted.*).
3. Press **Save changes** in the dialog to apply, or **Cancel** to save nothing.

On the demo stack the save recreated the coordinator container within a minute while the header kept showing **Running**, and the new value was in effect: `SHOW SESSION LIKE 'query_max_run_time'` reported the default `2.00h`.

Once you confirm, the save finishes on the server even if the browser disconnects (a closed tab, a dropped connection): the old containers or pods are replaced and the engine comes back without a second save.

With **Expose via ingress** on and no **Host**, the field says *Enter the host the ingress serves, or turn off Expose via ingress.* and **Save changes** stays disabled. The Docker provisioner refuses an ingress whatever the host (see [Provision an engine](./provision.md#kubernetes-and-docker)), although the section is still offered there (KI-264).

### Monitor

![The Monitor tab on the demo stack: the query counts, the node count and the live queries](/img/platform/admin/cp-engine-monitor.png)

The tab has a strip with the **running**, **queued** and **blocked** query counts and the **nodes**, and the **Queries** table (*Live queries on the coordinator, refreshed every 3s*) with **Query**, **User**, **State**, **SQL**, **Progress**, **Elapsed**, **Memory** and **CPU**, a state filter (**All states**) and **Search user or SQL…**.

How Egret signs in to the coordinator depends on the engine:

| Engine | Egret asks as | What you see |
|---|---|---|
| JWT delegation (the default for a provisioned Trino engine) | **You**, with the engine token Egret mints for you | What the engine's own policy lets you see: other users' queries only if it lets you view them. Killing a query is decided the same way. |
| Password users or impersonation | The engine's `egret-monitor` account | The queries that account may see. |
| No authentication | `egret-monitor` | Every query. |

The node list comes from Trino's `GET /v1/node` where the coordinator serves it. Trino 483 does not by default, and then Egret reads `system.runtime.nodes` instead. That query runs as the same sign-in, so on a JWT engine it appears in the **Queries** table under your name (on the demo stack: `SELECT http_uri FROM system.runtime.nodes`, user `admin`, **FINISHED**). If it is refused too, **nodes** shows `—`: the count is unknown, not zero, and the query counts are still shown.

### Restart

**Restart** asks *Restart engine?* (*This rolls the coordinator and worker pods; running queries are interrupted.* On the Docker provisioner: *This restarts the coordinator and worker containers; running queries are interrupted.*). For a Trino engine it adds *If the pods (containers) are gone, they are created again.* On the demo stack the status went to **Provisioning** and back to **Running** in 38 seconds, and the container was recreated.

A Trino engine that has run before and now has no pod or container at all, for example after `just demo-down` and `just demo-up` on the demo stack, is created again from its stored settings when you press **Restart**. An engine that is still being created (status **Provisioning**) is left to finish.

### Delete

![The Delete dialog asks you to type the engine name](/img/platform/admin/cp-engine-delete.png)

**⋯ → Delete engine** opens *Delete «\<engine\>»?*:

- *Query history and notebook engine access on its workspace connections are removed.*
- *Saved queries that use it lose their connection.*
- *Data API endpoints (including trashed ones), alerts and datasets that use it block the delete — you will be shown where they are.*

Type the engine name and press **Delete**. You return to the Engines list. The dialog says *This destroys the engine's Kubernetes cluster. It cannot be undone.*, or on the Docker provisioner *This removes the engine's containers. It cannot be undone.* (measured: 7 seconds). The engine's policy profile is kept and appears under **Profiles without an engine** in Governance.

### Kubernetes-only features

**Logs** and **Exec** work only with the Kubernetes provisioner, and are not shown for an engine Docker runs:

| Action | Kubernetes |
|---|---|
| **Logs** | Container logs for the pod, with **Last 1000 lines**, **Previous container**, **Follow** and **Refresh**. |
| **Exec** | *Open shell into \<pod\>?* opens an interactive shell (bash) inside the running pod. |

With the Docker provisioner, read the log on the Docker host with `docker logs egret-engine-egret-engines-<name>-coordinator`. A failed engine's status message carries its last log lines.

## External engine

![The Overview tab of the external engine trino-demo-ext](/img/platform/admin/cp-engine-ext-overview.png)

The header shows the engine name, its type, an **External** badge and **Open in Engine & policy**, which opens the engine's page in Governance. A banner says *External engine: egret holds a record of it and does not monitor it, so there is no health status here.* A **More engine actions** menu holds the delete action. The tabs are **Overview**, **Catalogs**, **Plugin config** and **Settings**.

### Overview

| Field | Meaning |
|---|---|
| **Type** | Trino or StarRocks. |
| **Address** | `host:port`, for example `trino-demo:8080`. |
| **Ranger plugin version** | The version you declared. |
| **Policy profile** | The bound profile, or *None bound. Bind one on the Settings tab.* |

### Catalogs

*These catalogs are declared as served by this engine, so grants on them reach its policy profile. egret does not create these catalogs on your engine — create them there with the same names.*

1. Under **Catalog to declare**, choose a catalog (*Choose a catalog*).
2. Press **Declare attached**. A toast says *Declared attached.*

The table lists each catalog with **Kind**, **Status** (*declared*) and a **Detach** action. Detaching asks *Detach «\<catalog\>» from «\<engine\>»?*: egret stops treating the engine as serving the catalog and recompiles the bound profile. Nothing changes on your cluster, and the catalog itself is kept.

Declaring a catalog is what makes governance work: grants on a catalog reach only the profiles of engines that serve it. The Data page then shows the engine in the object header.

### Plugin config

![The Plugin config tab: service name, download URL, warnings and the two configuration files](/img/platform/admin/cp-engine-plugin.png)

The installation files and warnings for the Ranger plugin: **Ranger service name**, **Policy download URL**, **Authentication**, **Declared plugin version**, *You must supply*, *What egret assumes* and the files `access-control.properties` and `ranger-trino-security.xml` with **Copy** and **Download**. With no profile bound it says *No policy profile is bound to this engine yet. The plugin configuration names the profile's Ranger service, so bind a profile first.* with **Open Settings**, which switches to the **Settings** tab. Other errors show the server's message. See [Ranger plugin](../../data-governance/engines-and-policy/ranger-plugin.md).

### Settings

![The Settings tab of the external engine: address, Ranger plugin version and policy profile](/img/platform/admin/cp-engine-ext-settings.png)

| Field | Meaning |
|---|---|
| **Host** | A host name or IP address: no scheme, port or path. |
| **Port** | The engine's port. |
| **Plugin version** | The Ranger plugin version (**2.5.0**, **2.8.0** or **Other…**). |
| **Policy profile** | The profile the engine downloads, or **No profile**. Profiles bound elsewhere are marked, for example *docs-trino — bound to docs-trino*. |

Changing or removing the profile recompiles both the old and the new profile. If that would leave two mask or row-filter rules deciding one column differently, egret refuses and changes nothing. **Save changes** applies; before any edit the form says *Nothing has changed yet.*

A Trino profile without a tag service is refused: *policy profile … has no usable tag service … so every tag-based column mask and row filter would silently compile to nothing; give the profile a tag service, or bind one created by engine provisioning.* See [Engines and policy](../../data-governance/engines-and-policy/index.md#create-a-policy-profile).

### Remove the record

**More engine actions → Delete engine** opens *Delete «\<engine\>»?*, which says *egret removes its record; your cluster is not touched.* and lists what happens:

- The bound policy profile is unbound, not deleted.
- Declared catalog attachments are removed; the catalogs themselves are kept.
- The Ranger plugin you installed keeps running until you remove it from your engine.

Type the engine name and press **Delete**. If something still depends on the engine, egret refuses with *"\<engine\>" is still in use. Nothing was deleted. Remove or move these first, then delete the engine again.* and lists the dependents.

## Catalog apply states

A Trino apply rebuilds the engine's entire catalog configuration. When one catalog has a stored configuration egret cannot parse, **Retry** and **Detach** are refused on every catalog of that engine, and so is any save on the Settings tab, until you repair or detach the broken one. StarRocks applies each catalog separately, so only the broken catalogs are affected.

## Limits and known issues

- An external engine's page has no health status or restart. Egret cannot see the cluster.
- On the Docker provisioner, the status can read **Failed** for a few seconds while the old containers stop during a save (KI-273).
- In the save request, the steps after the engine is re-provisioned (updating the connections of the workspaces the engine is assigned to, or restoring the stored settings after a failed apply) still run only while the request is connected (KI-272).
- The Ingress section is offered on Docker engines, which refuse any ingress (KI-264).
- On an engine with impersonation and a Ranger policy, the monitor's `egret-monitor` account probably sees only its own queries (KI-265, not verified).
- Delete is permanent. After a delete the Engines list can keep the row until you reload.

## Further reading

- [Register an external engine](./register-external.md)
- [Provision an engine](./provision.md)
- [Catalogs](../catalogs/index.md)
