---
sidebar_position: 2
---

# Concepts

Egret is built around a few ideas. This page defines them in the order you meet them. Each links to the page that covers
it in depth.

## How the pieces fit

```text
                +-------------------- Control plane ---------------------+
                |  workspaces | engines | catalogs | storage | secrets    |
                |  users, groups, roles | audit log                       |
                +--------------------------+------------------------------+
                                           |
        +----------------+   +-------------+--------------+
        |  Workspace A   |   |        Workspace B          |   isolated: own datasets,
        |  datasets      |   |  datasets, charts, flows    |   charts, dashboards, flows,
        |  charts        |   |  dashboards, Data API       |   members and connections
        +-------+--------+   +-------------+--------------+
                |  database connections    |
                v                          v
        +---------------------------------------------+
        |  Query engines: Trino, StarRocks             |<-- policies (Ranger-compatible)
        +----------------------+----------------------+    downloaded from Egret
                               |
                               v
        +---------------------------------------------+
        |  Iceberg tables on S3-compatible storage     |  (embedded Iceberg REST catalog)
        +---------------------------------------------+
```

## Workspace

A workspace is an isolated area for one team. Datasets, charts, dashboards, flows, Data API endpoints, database
connections and members all live inside one workspace, and a person only sees the workspaces they belong to. The
workspace picker is at the top left of the app. A fresh install has one workspace, `default`.

People get a **workspace role** in a workspace: `ws_admin`, `ws_editor` or `ws_viewer`. Roles are sets of
[permissions](../reference/permissions). See [Members](../workspace-settings/members) and
[Roles and permissions](../workspace-settings/roles-and-permissions).

## Query engine and database connection

A query engine runs your SQL. Egret connects to **Trino** and **StarRocks**. A *database connection* (**Manage →
Workspace settings → Engines**) points a workspace at one engine: host, port, catalog and credentials. Egret can connect
to an engine you already run (an *external* engine), or provision Trino and StarRocks through the control plane: on
Kubernetes, or, for Trino only, as Docker containers (the [demo stack](./run-the-demo-stack) does this). See [Databases](../workspace-settings/databases) and [Query engines](../control-plane/query-engines).

## Iceberg catalog and storage

The embedded catalog is an Apache Iceberg REST catalog that runs inside the Egret server and keeps table metadata in the
Egret PostgreSQL database and table data in S3-compatible object storage (RustFS in the dev stack). Engines read and
write Iceberg tables through it, with credentials Egret issues. See [Catalogs](../control-plane/catalogs) and
[Storage](../control-plane/storage).

## Dataset and metric

A dataset is a table or a SQL query registered in a workspace, with typed columns and reusable **metrics** such as
`revenue = SUM(totalprice)`. Charts are built on datasets, so a metric is defined once and used everywhere. See
[Datasets and metrics](../explore/datasets-and-metrics).

## Chart and dashboard

A chart is one visualization of a dataset (bar, line, table, map and 15 more). A dashboard arranges charts, text and
filters on a grid. See [Charts](../explore/charts) and [Dashboards](../explore/dashboards).

## Governance

Governance is policy that controls who sees which data. It has three layers that you can tell apart in the product:

| Layer | What it decides | Enforced by |
|---|---|---|
| Role-based access (RBAC) | What actions a person can take: create a dataset, run a query, manage engines | The Egret server |
| Object grants | Who can open one dataset, chart or dashboard, beyond their role | The Egret server (Cedar policy decision point) |
| Data plane policy | Which catalogs, tables and columns a person can read, with row filters and column masks driven by tags | The query engine, through the Ranger plugin that polls Egret |

Every authorization decision and every governance change is written to the audit log. See [Data
governance](../data-governance/overview) and [Access control](../control-plane/access-control).

## Control plane

The control plane is platform-level administration: workspaces, engines, catalogs, storage connections, secrets, users,
groups, platform roles and the audit log. It is reached from **Control Plane** in the top bar and needs platform
permissions, which the `platform_admin` role holds. See [Control plane](../control-plane/workspaces).

## Data API and workflows

A **Data API** endpoint publishes a parameterized SELECT as a REST endpoint with its own clients and rate limits ([Data
API](../data-api/overview)). A **workflow** is a flow of tasks written in YAML, started manually or by a trigger
([Flows](../workflows/flows)).

## The three areas of the app

The top bar switches between **Explorer** (everyday work inside the current workspace), **Governance** (data access
policy and classification) and **Control Plane** (administration). See the [First login tour](./first-login-tour).

Terms are collected in the [Glossary](../reference/glossary).
