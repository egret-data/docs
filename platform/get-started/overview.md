---
sidebar_position: 1
---

# Overview

Egret is an enterprise data platform that lets many teams work on one shared data foundation. A single deployment gives
the organization one source of truth, gives each team an isolated **workspace**, and governs and audits every access to
data.

It is written in Rust as a modular monolith (one server binary) and brings together tools you would otherwise assemble
from separate products:

| You need | Egret provides | Docs |
|---|---|---|
| Exploring data and BI | SQL Lab, datasets with metrics, 19 chart types, dashboards, alerts and reports, Data Apps | [Explore (BI)](../explore/sql-lab) |
| A table catalog | An embedded Apache Iceberg REST catalog on S3-compatible storage | [Catalogs](../control-plane/catalogs) |
| Query engines | Connections to Trino and StarRocks, and provisioning of both on Kubernetes | [Query engines](../control-plane/query-engines) |
| Access policy | Roles, per-object grants, row filters, column masks, tag-based classification, enforced in the engine | [Data governance](../data-governance/overview) |
| Serving data as an API | SELECT statements with parameters published as REST endpoints | [Data API](../data-api/overview) |
| Automation | A workflow engine compatible with Kestra's flow syntax, with schedules and triggers | [Workflows](../workflows/flows) |

## Where to start

1. **Run it.** The [Quick start](./quick-start) brings up the dependencies and the server on your machine and was run end
   to end for these docs.
2. **Learn the vocabulary.** [Concepts](./concepts) defines workspace, engine, catalog, dataset, governance and control
   plane in one page.
3. **Sign in and look around.** The [First login tour](./first-login-tour) covers single sign-on, the break-glass
   administrator and the layout of the app.
4. **Build something.** [Your first dashboard](./first-dashboard) takes a SQL query to a dashboard in six steps.

If you operate Egret rather than use it, go to [Deploy and operate](../deploy-operate/local).

## What is and is not production-ready

The Docker Compose stack and the Helm chart in the repository are development tooling. The chart's own README says it is
for a single-developer local cluster and is not a production chart. The [security hardening
checklist](../deploy-operate/security-hardening) lists what you must change before exposing a deployment.

Egret Engine, a Rust query engine on the roadmap, is a separate project in an early design phase; see the
[Engine section](/engine/introduction). Today the platform runs queries on Trino and StarRocks.

:::note Known issues
Defects and rough edges found while writing these docs are tracked on [Known issues](../known-issues).
:::
