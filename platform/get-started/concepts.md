---
sidebar_position: 2
---

# Concepts

Egret is built around a few ideas. Knowing them makes the rest of the docs easier to follow.

| Concept | What it is |
|---|---|
| **Workspace** | An isolated area for one team. Datasets, charts, dashboards, flows and members live inside a workspace. The workspace picker is at the top left of the app. |
| **Query engine** | The SQL engine that runs your queries. Egret connects to **Trino** and **StarRocks**. A *database connection* in a workspace points at one engine. |
| **Iceberg catalog** | A shared Apache Iceberg REST catalog (embedded) that holds the platform's primary tables on object storage. |
| **Dataset** | A table or SQL query registered in a workspace, with typed columns and reusable **metrics** (for example `revenue = sum(totalprice)`). Charts are built on datasets. |
| **Governance** | Policy that controls who sees which data: roles, grants, row filters, column masks and classifications, enforced at the engine and audited. |
| **Control plane** | Platform-level administration: workspaces, engines, secrets, storage, catalogs, access control and the audit log. |

The top bar switches between three areas: **Explorer** (everyday work inside a workspace),
**Governance** and **Control Plane** (administration).
