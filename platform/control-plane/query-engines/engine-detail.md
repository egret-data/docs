---
sidebar_position: 3
---

# Engine detail

Select an engine in **Control Plane → Engines** to open its page. The tabs depend on whether egret runs the engine (a provisioned engine) or you do (an external engine).

## Provisioned engine

![The Overview tab of a provisioned engine on the Docker demo stack: phase running, one container, its catalogs and workspaces](/img/platform/admin/cp-engine-overview.png)

The header shows the engine name, its namespace (`egret-engines`), the image, the endpoint, the authentication (*JWT auth*) and the Ranger plugin version, with the type and status badges. The endpoint is the `host:port` a workspace connection to the engine dials, for example `docs-trino-trino.egret-engines.svc:8443` (port 8443 is the HTTPS listener of an engine with JWT delegation). **Open in Engine & policy** opens the engine in Governance, **Restart** restarts the engine, and the **More engine actions** menu (**⋯**) holds **Delete engine**. The tabs are **Overview**, **Catalogs**, **Workspaces**, **Settings** and **Monitor**. A provisioned StarRocks engine has one more tab after Monitor, [**Query log**](#query-log).

A provisioned StarRocks engine that a policy profile names shows, above the tabs, the warning that unless the engine runs `egret-starrocks-fe` `4.1.7-egret.4` or later its StarRocks lets users past the profile: official images serve the Iceberg metadata tables without asking Ranger and apply no mask or row filter to prepared statements, and official and earlier patched images apply none through the HTTP SQL API or Arrow Flight SQL, let anyone read object storage through `FILES()` and let a masked or filtered user store a table's rows in the clear in a materialized view, and images before `4.1.7-egret.4` show a filtered user the statistics of hidden rows through `EXPLAIN COSTS` and let anyone reach object storage with the cluster's own identity through `BROKER LOAD`, `EXPORT` and `SELECT INTO OUTFILE` without keys (since platform #822, widened in #826, #827 and #832; see [External engine](#overview-1), KI-340, KI-345 to KI-348, KI-350, KI-351). It is not shown while the profile list loads, or to a viewer who cannot read it. It is not shown for a provisioned engine on Egret's patched image `ghcr.io/egret-data/egret-starrocks-fe` `4.1.7-egret.4` or later (the default for new engines since platform #832), which fixes all of them; it is shown for an engine still on `4.1.7-egret.1` or `4.1.7-egret.3`; an external engine always shows it, because Egret does not know its image.

### Security warnings on a StarRocks engine

Two warnings can appear above the tabs of a StarRocks engine (since platform #847).

#### Not governed

With Ranger on, a StarRocks engine that is bound to no policy profile shows:

*Not governed: this engine is bound to no policy profile, so egret's grants, masks and row filters do not reach it. Bind it to a StarRocks profile in its settings.*

The engine list shows the same engine with a **Not governed** badge. To fix it, bind a StarRocks profile in the engine's settings (`authzServiceId` on `PUT /api/control-plane/engines/{id}`). With Ranger off no engine is governed, so the warning is not shown. Add engine now offers a profile for StarRocks (see [Provision an engine](./provision.md#create-an-engine)), so a new engine is bound from the start.

#### Security upgrade needed

A provisioned StarRocks engine that lacks egret's security fixes shows the warning *This engine needs a security upgrade* with one sentence per reason, and an **Upgrade security** button. The older warning about metadata tables is not shown while this one is.

![The engine page of a StarRocks engine with the security upgrade warning and the Upgrade security button](/img/platform/admin/cp-engine-security-upgrade-warning.png)

| Reason | API value | What it means |
|---|---|---|
| Image | `unpatchedImage` | The FE image is not `egret-starrocks-fe` `4.1.7-egret.4` or later (or a mirror of one). StarRocks then lets users past the engine's profile: Iceberg metadata tables, prepared statements, the HTTP SQL API, `FILES()` and more (KI-340, KI-345). |
| Root password | `noRootPassword` | The FE `root` account has no password: anyone who reaches port 9030 can log in as `root`. Engines created before the root-password change have none. |
| Not applied | `notApplied` | The last security upgrade stored its changes but did not finish applying them, for example because the apply failed. |

The warning needs the `engine:update` permission to act on; without it the page says *Upgrading it needs the engine:update permission.* An external engine never shows it: egret does not change an external engine's image.

**Upgrade security** opens a confirmation dialog, *Upgrade this engine's security?*, that lists what will change:

- `FE image: <current> → <new>`, and *The CN image moves to the same release.* When egret has no FE image recorded for the engine, `<current>` reads *the current image (not recorded)*;
- *root password will be set*, when the engine has none;
- *The stored changes are applied again.*, for `notApplied`.

![The Upgrade this engine's security dialog listing the FE image change and the root password](/img/platform/admin/cp-engine-security-upgrade-dialog.png)

It also warns that the FE and CN pods restart, and that a client outside egret that logs in as `root` with no password is refused afterwards. When a root password will be set, it adds *egret's own admin statements on this engine fail until the FE takes the new password, usually within a minute.* Press **Upgrade security** in the dialog to run it. The engine is applied on every run, so running it again is safe.

If the FE image is of a newer release than egret's default fork image (an official 4.1.8, for example), egret does not change the image, because StarRocks FE metadata cannot be downgraded. The root password is still set, and the dialog and the result say:

*No patched image for release* `<x>` *yet: the image was not changed.*

The `unpatchedImage` reason then stays. If the apply fails, the page shows the error, the engine keeps the **Security upgrade needed** badge with the reason *Not applied*, and you run **Upgrade security** again. Any later successful apply of the engine, a settings save for example, also clears that reason.

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

![The Settings tab with the configuration sections; Server, Coordinator, Worker and Security & Exposure carry values](/img/platform/admin/cp-engine-settings.png)

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

The node list comes from Trino's `GET /v1/node` where the coordinator serves it. Trino 483 does not by default, and then Egret reads `system.runtime.nodes` instead. That query runs as the same sign-in, so on a JWT engine it appears in the **Queries** table under your name (on the demo stack: `SELECT http_uri FROM system.runtime.nodes`, user `admin`, **FINISHED**). If it is refused too, **nodes** shows `—`: the count is unknown, not zero, and the query counts are still shown.

### Query log

A provisioned StarRocks engine shows a **Query log** tab after Monitor (`?tab=query-log`). It lists the statements the engine ran, from every way in: the MySQL protocol, prepared statements, the HTTP SQL API, Arrow Flight SQL and materialized view refreshes. A Trino engine and an external StarRocks engine have no such tab: egret does not install anything on an engine it does not run, and Trino's **Monitor** shows live queries only. Anyone with `engine:read` sees the tab; the statement text and the error text need `engine:audit` (see [Who sees the statement](#who-sees-the-statement)).

![The Query log tab of a StarRocks engine: the status line, the filters and the statements, newest first](/img/platform/admin/cp-engine-query-log.png)
<!-- PLACEHOLDER SCREENSHOT: cp-engine-query-log.png (the tab with rows). Added later by the controller. -->

Above the table a status line says what state the log is in.

| State | API value | What the tab shows |
|---|---|---|
| Ready | `ready` | *Kept 30 days. Latest event: \<time\>.* When nothing has been logged yet: *No events yet. Events reach the log about a minute after a statement runs.* |
| Not set up | `notSetUp` | A warning: *The query log is not set up on this engine: its audit plugin or its log table is missing.* with a **Set up query log** button. |
| Plugin not shipped | `pluginNotShipped` | A warning that the engine's image has no audit plugin (see [Engines on an older image](#engines-on-an-older-image)). |
| Unreachable | `unreachable` | The engine's message, with a **Retry** button. |

The state is read from the engine each time the tab opens. Nothing about it is stored in egret.

#### Filters and columns

The filters sit above the table and stay in the page address, so a link shares them:

- **Time range**: **Last hour**, **Last 24 hours** (the default), **Last 7 days**, **Last 30 days** or **Custom** with **From** and **To**. A range is at most 31 days.
- **User**: the person's name, exact and case-insensitive. It matches either of the two user columns below.
- **State**: **All**, **Succeeded** or **Failed**.

The table is newest first, 50 rows at a time; **Load more** fetches the next page. The columns are **Time** (your local time; hover for the UTC instant), **User**, **Connected as**, **State**, **Command**, **Duration**, **Rows returned** and **Statement**, which shows the first line of the statement.

**User** and **Connected as** differ for a delegated query. egret's engine queries on behalf of a person log in to StarRocks as a service user and then run `EXECUTE AS <person>`. StarRocks records both. **User** is the person the statement ran for, so you read who asked first. **Connected as** is the session user and appears only when it differs, for example the service user behind a Data API endpoint or a workspace query. For a person who connects to StarRocks directly there is one name, and **Connected as** is empty.

**State** is **Succeeded** or **Failed**. A statement StarRocks or its policies refused, such as an *Access denied* from Ranger, is **Failed**.

Select a row to open a side panel with the whole statement (up to 1 MiB; the table cuts it at 2,000 characters), the error and the counters: catalog, database, client address, query source, rows and bytes scanned, rows returned, CPU time and memory.

![The side panel of a statement with its error, counters and the full text](/img/platform/admin/cp-engine-query-log-panel.png)
<!-- PLACEHOLDER SCREENSHOT: cp-engine-query-log-panel.png (the side panel). Added later by the controller. -->

egret's own reads of the log are left out. Every other statement of the `root` user, egret's own set-up statements included, is shown.

#### Who sees the statement

The statement text can contain the values a person filtered on and the mask and row filter expressions of the policies that applied, and StarRocks error messages quote the statement they reject. So **both the statement and the error text need the `engine:audit` permission** ("Read statement text in engine query logs"). Without it the tab shows every other column, the state included, so a failed statement still reads as failed, and the statement and the error show *Hidden: needs engine:audit*. Migration 0218 grants `engine:audit` to every platform role that already holds `engine:update`. Grant it to other roles under **Control Plane → Roles**; see [Permissions](../../reference/permissions.md). What the log redacts is listed under [Security of a StarRocks engine](../../deploy-operate/engines-and-ranger.md#the-query-log-of-a-starrocks-engine).

#### Set-up and retention

The log is kept for **30 days**. StarRocks drops older partitions of the log table by itself.

The set-up runs on its own, so most engines never need the button:

- when a StarRocks engine is created and has become ready;
- after each apply or upgrade that may restart the engine, including **Upgrade security**;
- once when egret starts, for every reachable provisioned StarRocks engine, so engines that existed before the Query log get it.

**Set up query log** (needs `engine:update`) runs the same steps once, now. Use it to recover from a failed or lost set-up, or after an FE restart on its own shows **Not set up**. Without the permission the button is disabled and says *Setting it up needs the engine:update permission.* The steps are safe to repeat. An error is shown as a message and logged; a failed set-up never fails a create, an apply or an upgrade.

:::note Events before the first refresh
StarRocks hands events to its audit plugins only about a minute after the plugin is installed, and again about once a minute. Statements that ran before the plugin's first refresh are not recorded, and after that a statement shows in the log about a minute after it ran.
:::

![The Query log tab of an engine whose log is not set up, with the warning and the Set up query log button](/img/platform/admin/cp-engine-query-log-not-set-up.png)
<!-- PLACEHOLDER SCREENSHOT: cp-engine-query-log-not-set-up.png (the notSetUp state). Added later by the controller. -->

#### Engines on an older image

Only egret's patched StarRocks image ships the audit plugin, from `ghcr.io/egret-data/egret-starrocks-fe` `4.1.7-egret.4`. An engine on an official image or on `4.1.7-egret.1` to `4.1.7-egret.3` shows `pluginNotShipped`. egret still creates the log table and the loader user, and does not fail the apply. When the engine carries the **Security upgrade needed** warning, the tab says: *This engine's image has no audit plugin. **Upgrade security**, in the security warning on this page, moves it to egret's image, and the Query log starts after that.* Press [**Upgrade security**](#security-upgrade-needed); the set-up then runs again by itself and installs the plugin. Without that warning the tab says *The Query log starts once the engine runs egret's image.*

![The Query log tab of an engine on an older image, with the warning that its image has no audit plugin](/img/platform/admin/cp-engine-query-log-plugin-not-shipped.png)
<!-- PLACEHOLDER SCREENSHOT: cp-engine-query-log-plugin-not-shipped.png (the pluginNotShipped state). Added later by the controller. -->

The tab is also served by the [Engines API](../../reference/rest-api/control-plane-engines.md#get-apicontrol-planeenginesidquery-log).

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

For a StarRocks engine with a bound profile the tab also shows a warning (since platform #822; widened in platform #826, #827 and #832): official StarRocks images serve the metadata tables of Iceberg tables (`$files`, `$partitions`, `$snapshots` and the others) without asking Ranger, so anyone who can log in to the engine can read row counts, partition values, data file paths and each column's lowest and highest values for every table of an attached Iceberg catalog, whatever the profile's grants, masks, row filters and classifications say, and apply no mask or row filter to prepared statements such as Data API endpoints with parameters; official images and Egret's earlier patched images also apply none through the HTTP SQL API or Arrow Flight SQL, let anyone read object storage through `FILES()` and let a masked or filtered user store a table's rows in the clear in a materialized view; images before `4.1.7-egret.4` also show a filtered user the statistics of hidden rows through `EXPLAIN COSTS` and let anyone reach object storage with the cluster's own identity through loads, exports and `SELECT INTO OUTFILE` without keys (KI-340, KI-345 to KI-348, KI-350, KI-351). Egret's patched image `ghcr.io/egret-data/egret-starrocks-fe` `4.1.7-egret.4` or later fixes all of them; run the engine on it. Give StarRocks logins only to people who may see these values, and serve masked or filtered data through Trino. A Trino engine shows no such warning.

![The Overview tab of the external StarRocks engine docs-starrocks with the StarRocks security warning](/img/platform/admin/cp-engine-ext-sr-overview.png)

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
| **Policy profile** | The profile the engine downloads, or **No profile**. Profiles bound elsewhere are marked, for example *docs-trino — bound to docs-trino*, and a Trino profile with no tag service is listed disabled, with *— no tag service: give it one on its Advanced tab*. |

For a StarRocks engine, the same warning appears under **Policy profile** as soon as a profile is picked, before you save.

![The Settings tab of docs-starrocks with the profile starrocks-prod picked and the StarRocks security warning under it](/img/platform/admin/cp-engine-ext-sr-settings.png)

Changing or removing the profile recompiles both the old and the new profile. If that would leave two mask or row-filter rules deciding one column differently, egret refuses and changes nothing. **Save changes** applies; before any edit the form says *Nothing has changed yet.*

A Trino profile without a tag service cannot be chosen; through the API the bind is refused with *policy profile … has no usable tag service … so every tag-based column mask and row filter would silently compile to nothing; give the profile a tag service, or bind one created by engine provisioning.* Give the profile a tag service on its **Advanced** tab first (see [Hand-written policies](../../data-governance/engines-and-policy/policy-editor.md#tag-service)). While the engine downloads the profile, its tag service cannot be changed: unbind, change it, and bind again.

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
