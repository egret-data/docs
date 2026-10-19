---
sidebar_position: 3
---

# Engine detail

Select **Details** on an engine in **Control Plane → Engines** to open its page. The tabs depend on whether egret runs the engine (a provisioned engine) or you do (an external engine).

## External engine

![The Overview tab of the external engine docs-trino](/img/platform/admin/cp-engine-overview.png)

The header shows the engine name, its type, an **External** badge and **Open in Engine & policy**, which opens the engine's page in Governance. A banner says *External engine: egret holds a record of it and does not monitor it, so there is no health status here.* A **More engine actions** menu holds the delete action. The tabs are **Overview**, **Catalogs**, **Plugin config** and **Settings**.

### Overview

| Field | Meaning |
|---|---|
| **Type** | Trino or StarRocks. |
| **Address** | `host:port`. |
| **Ranger plugin version** | The version you declared. |
| **Policy profile** | The bound profile, or *None bound. Bind one on the Settings tab.* |

### Catalogs

*These catalogs are declared as served by this engine, so grants on them reach its policy profile. egret does not create these catalogs on your engine — create them there with the same names.*

1. Under **Catalog to declare**, choose a catalog. With none left the field reads *No catalogs left to declare*.
2. Press **Declare attached**. A toast says *Declared attached.*

![The Catalogs tab with demo_catalog declared on docs-trino](/img/platform/admin/cp-engine-catalogs.png)

The table lists each catalog with **Kind**, **Status** (*declared*) and a **Detach** action. A tooltip on the badge says *Recorded by egret; nothing was applied to the engine.* Detaching asks *Detach "\<catalog\>" from "\<engine\>"?* and explains that egret stops treating the engine as serving the catalog and recompiles the bound profile. Nothing changes on your cluster, and the catalog itself is kept.

Declaring a catalog is what makes governance work: grants on a catalog reach only the profiles of engines that serve it. The Data page then shows the engine in the object header.

### Plugin config

The installation files and warnings for the Ranger plugin. With no profile bound it says *engine … is bound to no policy profile: bind a profile first. Bind a policy profile on the Settings tab, then come back.* See [Ranger plugin](../../data-governance/engines-and-policy/ranger-plugin.md), which describes the same content.

### Settings

![The Settings tab with address, Ranger plugin version and policy profile](/img/platform/admin/cp-engine-settings.png)

| Field | Meaning |
|---|---|
| **Host** | A host name or IP address: no scheme, port or path. |
| **Port** | The engine's port. |
| **Plugin version** | The Ranger plugin version (**2.5.0**, **2.8.0** or **Other…**). |
| **Policy profile** | The profile the engine downloads, or **No profile**. |

Changing or removing the profile recompiles both the old and the new profile. If that would leave two mask or row-filter rules deciding one column differently, egret refuses and changes nothing. **Save changes** applies; before any edit the form says *Nothing has changed yet.*

A Trino profile without a tag service is refused: *policy profile … has no usable tag service … so every tag-based column mask and row filter would silently compile to nothing; give the profile a tag service, or bind one created by engine provisioning.* See [Engines and policy](../../data-governance/engines-and-policy/index.md#create-a-policy-profile).

### Remove the record

The **More engine actions** menu has **Delete**. The dialog says *egret removes its record; your cluster is not touched.* and lists what happens:

- The bound policy profile is unbound, not deleted.
- Declared catalog attachments are removed; the catalogs themselves are kept.
- The Ranger plugin you installed keeps running until you remove it from your engine.

If something still depends on the engine, egret refuses with *"\<engine\>" is still in use. Nothing was deleted. Remove or move these first, then delete the engine again.* and lists the dependents.

## Provisioned engine

This section is from the product source; the demo instance has no Kubernetes to provision one.

The header shows the engine name, type and phase, with a primary **Restart** button (rolls the pods) and a **More engine actions** menu with **Delete** (*This destroys the engine's Kubernetes cluster. It cannot be undone.*). Tabs: **Overview**, **Catalogs**, **Workspaces**, **Settings** and **Monitor**.

| Tab | What it shows |
|---|---|
| **Overview** | A strip with **phase**, **pods** (ready/total), **replicas**, **catalogs**, **workspaces** and **auth** (*JWT delegation*, *Impersonation*, *Password auth* or *No delegation*). For StarRocks, **FE replicas** and **CN replicas** replace *replicas*. |
| **Catalogs** | Attach and detach registry catalogs, with an **Apply** state per catalog and **Retry**. Attaching or detaching on Trino applies the catalog config and restarts the coordinator, so queries in flight are lost. On StarRocks it creates or drops the catalog on the FE in place. |
| **Workspaces** | Assign the engine to workspaces. It says *Enable JWT authentication on the Security & Exposure tab before assigning* until JWT is on, and offers a search (*Search workspaces…*). |
| **Settings** | The configuration form used when you [provision](./provision.md) the engine, with a **Save changes** footer and a review of the diff. |
| **Monitor** | Live health: pods, status and logs. |

If the engine cannot start the page shows *The engine failed to start.* with the reason. While starting it reads *Starting up — the engine isn't reachable yet.*

### Catalog apply states

A Trino apply rebuilds the engine's entire catalog ConfigMap. When one catalog has a stored configuration egret cannot parse, **Retry** and **Detach** are refused on every catalog of that engine, and so is any save on the Settings tab, until you repair or detach the broken one. StarRocks applies each catalog separately, so only the broken catalogs are affected.

## Limits and known issues

- An external engine's page has no health status or restart. Egret cannot see the cluster.
- The Delete action on a provisioned engine is permanent.

## Further reading

- [Register an external engine](./register-external.md)
- [Provision an engine](./provision.md)
- [Catalogs](../catalogs/index.md)
