---
sidebar_position: 1
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

# Overview

Egret is an enterprise data platform that lets many teams work on one shared data foundation. A single deployment gives
the organization one source of truth, gives each team an isolated **workspace**, and governs and audits every access to
data.

<ThemedImage
  alt="Egret architecture: teams work in isolated workspaces on one governed platform; governed queries run on Trino and StarRocks over an Iceberg lakehouse and external sources."
  sources={{light: useBaseUrl('/img/architecture-light.svg'), dark: useBaseUrl('/img/architecture-dark.svg')}}
/>

It is written in Rust as a modular monolith (one server binary) and brings together tools you would otherwise assemble
from separate products:

| You need | Egret provides | Docs |
|---|---|---|
| Exploring data and BI | SQL Lab, datasets with metrics, 19 chart types, dashboards, alerts and reports, Data Apps | [Explore (BI)](../explore/sql-lab) |
| A table catalog | An embedded Apache Iceberg REST catalog on S3-compatible storage | [Catalogs](../control-plane/catalogs) |
| Query engines | Connections to Trino and StarRocks, and provisioning of both on Kubernetes (Trino also on Docker) | [Query engines](../control-plane/query-engines) |
| Access policy | Roles, per-object grants, row filters, column masks, tag-based classification, enforced in the engine | [Data governance](../data-governance/overview) |
| Serving data as an API | SELECT statements with parameters published as REST endpoints | [Data API](../data-api/overview) |
| Automation | A workflow engine compatible with Kestra's flow syntax, with schedules and triggers | [Workflows](../workflows/flows) |

![The E-commerce Insights dashboard of the demo stack: revenue and orders per quarter, a goal, a combined chart over time and a breakdown by product category](/img/platform/ops/get-started/demo-ecommerce-overview.png)

*A dashboard in a workspace: the demo stack seeds this one, with 22 charts over sample data.*

## Where to start

1. **Run it.** [Run the demo stack](./run-the-demo-stack) starts the whole platform on Docker with one command (`just demo-up`),
   seeded with sample data. It needs Docker and `just`, and no Rust toolchain. To build and run the server from source instead,
   follow the [Quick start](./quick-start).
2. **Learn the vocabulary.** [Concepts](./concepts) defines workspace, engine, catalog, dataset, governance and control
   plane in one page.
3. **Sign in and look around.** The [First login tour](./first-login-tour) covers single sign-on, the break-glass
   administrator and the layout of the app.
4. **Build something.** [Your first dashboard](./first-dashboard) takes a SQL query to a dashboard in six steps.

If you operate Egret rather than use it, go to [Deploy and operate](../deploy-operate/local).

## What is and is not production-ready

The Docker Compose stacks (the demo stack and the development stack) and the Helm chart in the repository are development
tooling; the demo stack in particular uses public secrets and must never be exposed to a network. The chart's own README says it is
for a single-developer local cluster and is not a production chart. The [security hardening
checklist](../deploy-operate/security-hardening) lists what you must change before exposing a deployment.

Egret Engine, a Rust query engine on the roadmap, is a separate project in an early design phase; see the
[Engine section](/engine/introduction). Today the platform runs queries on Trino and StarRocks.

:::note Known issues
Defects and rough edges found while writing these docs are tracked on [Known issues](../known-issues).
:::
