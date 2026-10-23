---
sidebar_position: 4
---

# Databases

A **database connection** (shown in the UI as an *engine connection*) tells the workspace how to reach a query engine. SQL Lab, datasets, charts and dashboards run their queries through these connections. They are configured under **Manage → Workspace settings → Connections → Engines**.

![The Engines page of the Docs sandbox workspace: the provisioned engine docs-trino and the connection trino-sandbox](/img/platform/admin/ws-engines.png)

*Query engine connections this workspace can use in SQL Lab and charts.* The page needs workspace-admin rights; without them it says *Requires workspace-admin to manage engines.* A new workspace says *No engines connected yet.*

A member who is not a workspace admin but holds `query:run` or `dataset:read` still gets the list of granted connections through the API, cut down to id, name, engine and delegation, so that SQL Lab and the dataset pickers can offer them (see [SQL Lab permissions](../explore/sql-lab/permissions.md#which-databases-you-can-use)). This page shows such a member the *Requires workspace-admin to manage engines.* notice instead of the rows.

## The connection list

A summary strip counts the **connections**, how many are **ok** and how many are in **error**. **Search connections…** filters by name. If the workspace has engines assigned by the platform admins, they appear in a **Provisioned by egret** section above **Your connections**; those are read-only (*Provisioned by egret — read-only*).

| Column | Meaning |
|---|---|
| **Name** | The connection name, for example `trino-sandbox`. |
| **Engine** | `trino` or `starrocks`. |
| **Host:Port** | Where it listens. |
| **Status** | The last known state: **Unknown** for a new connection, then **Healthy** or **Error** after a test. |
| **Secret** | **Configured** when a password is stored, **Not set** otherwise. |
| **Actions** | **Test**, **Edit** and **Delete** (each icon is labelled with the connection name). |

Two icons next to a name flag how queries run: *Queries run as the signed-in user (per-user delegation)* and *Row filters and column masks are applied per user at the engine*.

A provisioned engine shows as a card with its name, type and a delegation badge (for example **Per-user**), its status, *Provisioned by egret · read-only*, and **Show catalogs**: the catalogs of the engine, with their **Catalog**, **Kind**, **Storage** and **Secret**. It is added by assigning the engine to the workspace in the Control Plane (see [Engine detail](../control-plane/query-engines/engine-detail.md#workspaces)), not here.

## Add a connection

1. Press **Add connection**.
2. Fill the fields below.
3. Press **Add connection**. Until **Name**, **Host** and **Port** are filled the button is disabled with *Fill in name, host, port*.

![The Add engine connection dialog](/img/platform/admin/ws-add-connection.png)

The dialog is *Connect a Trino or StarRocks query engine. Egret validates reachability on save.*

### Connection fields

| Field | Meaning | Default |
|---|---|---|
| **Name** | A label, for example `prod-trino`. Required. | |
| **Engine** | **Trino** or **StarRocks**. | Trino |
| **Host** | The host, for example `trino.corp.local`. Required. | |
| **Port** | The port, for example `8080`. Required. | |
| **User** | Optional user name sent to the engine. | |
| **HTTP scheme** | `http` or `https` (Trino). | |
| **Catalog** | Optional default catalog. | |
| **Schema** | Optional default schema. | |

### How queries run as people

Three switches decide whose identity the engine sees. They interact: read them together.

| Switch | What it does | Requires |
|---|---|---|
| **Run queries as the logged-in user** (impersonation) | The engine runs each query as the person who started it, so the engine's own grants and policies apply to them. | Trino impersonation and Ranger. For StarRocks: *a StarRocks service user configured for EXECUTE AS + Ranger*. Shown for Trino and StarRocks only. |
| **Per-user delegation** | *Run queries as the signed-in user (requires SSO).* Egret presents a per-user engine JWT, so the engine knows the person. | An SSO sign-in. |
| **Governed data** | Declares that the engine filters rows and masks columns per user. *Row filters and column masks are applied per user at the engine. Data API endpoints on this connection must run queries as the caller.* | |

If **Governed data** is on while neither delegation nor impersonation is, the text changes to *Data API endpoints on this connection cannot be run or published until per-user delegation or impersonation is on, and any already published stop serving.* Turning it on is how you make sure a published Data API endpoint never answers with a service account's wider view of governed data.

:::warning
Without impersonation or delegation, egret sends the connection's own identity to the engine, not the person's, so per-user row filters and column masks cannot tell people apart. Turn on one of the two for governed data.
:::

### Secret

Choose how the password is held:

| Option | Does |
|---|---|
| **Select a secret** | Leaves the connection without a password (**Not set**). |
| **＋ New secret** | Creates a secret inline and references it. |
| An existing secret (for example `demo-rustfs-secret`) | References a platform [secret](../control-plane/secrets.md). |

## Test a connection

Press the **Test connection for \<name\>** icon. Egret runs a probe and shows **OK** next to the row or an error. The **Status** column shows *Unknown* until the page is reloaded after a test.

## Edit a connection

Press **Edit**. The dialog is *Update the connection details. Leave password blank to keep the current secret.* It carries all the fields, including **Governed data**, because saving replaces the whole connection. Closing a changed form asks *Discard unsaved changes?*

## Delete a connection

Press **Delete**. The dialog says *This engine connection will be removed. Any SQL Lab tabs or charts that reference it may break.* A toast says *Connection deleted*.

:::warning Trino setup
Trino must accept forwarded headers (`http-server.process-forwarded=true`). Without it Trino returns HTTP 406 and Egret shows *502 Bad Gateway*.
:::

## Example

On the Docker demo stack, the workspace `default` connects to the demo Trino as `trino-demo`. The workspace *Docs sandbox* connects to the same Trino as `trino-sandbox`: Host `trino-demo` (the container name on the demo network), Port `8080`, **User** `egret`, **HTTP scheme** `http`, **Catalog** `tpch`, the three switches off. It also has the provisioned engine `docs-trino` under **Provisioned by egret**.

## Limits and known issues

- Egret validates reachability on save, but a new connection shows **Unknown** until you press **Test**.
- **Engines** is hidden from a non-admin's settings menu, and a non-admin who opens it by its address gets *You don't have access to this section.* with *Only a workspace admin can manage engine connections.* When the workspace has no connection at all, though, that reader sees the same *No engines connected yet.* empty state as an admin, and its **Add connection** button then answers 403 (KI-243).
- Only Trino and StarRocks connections can be added here. External engines for Governance are registered in the Control Plane (see [Register an external engine](../control-plane/query-engines/register-external.md)).

## Further reading

- [Secrets](../control-plane/secrets.md)
- [Query engines](../control-plane/query-engines/index.md)
- [How permissions work](../data-governance/concepts.md)
