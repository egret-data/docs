---
slug: /introduction
sidebar_position: 1
---

# Egret Engine

Egret Engine is a distributed SQL engine for the lakehouse, written entirely in Rust. It is a separate product from the
Egret platform: the platform is one client among several, and the two are never linked into one binary.

:::caution Status: early design phase
Nothing in Egret Engine is usable yet. The repository contains the research notes, the architecture and P0 design
specifications, and the implementation plans for the first milestones (M0 Foundation and the P0 roadmap). There is no
release, no container image and no Helm chart. This section describes the design as it is written down; it is not a
user guide for running software. The Egret platform today runs queries on [Trino and StarRocks](../platform/control-plane/query-engines).
:::

## What it aims to be

The engine is built on [Apache DataFusion](https://github.com/apache/datafusion) and
[datafusion-distributed](https://github.com/datafusion-contrib/datafusion-distributed), uses
[Apache Iceberg](https://iceberg.apache.org/) as its native table format through an Iceberg REST catalog, and speaks the
PostgreSQL wire protocol. It sets out to combine three ideas:

| Inspiration | What the engine takes from it |
|---|---|
| Trino | Federation across many data sources, and fault-tolerant execution: long ETL queries retry individual tasks instead of failing as a whole. |
| StarRocks | Multi-layer caching of Iceberg metadata and data with cache-affinity scheduling, and asynchronous materialized views with transparent query rewrite. |
| RisingWave | Continuous change data capture from PostgreSQL and MySQL into Iceberg tables. |

The target workload is both interactive BI (low latency) and heavy ETL (CTAS, INSERT, MERGE and compaction jobs that run
for hours).

## How it relates to the platform

The platform treats an engine as something it connects to, provisions and governs. Egret Engine is intended to become one
more engine type next to Trino and StarRocks, reached over the PostgreSQL wire protocol. Integration happens only over
protocols (pgwire, the Iceberg REST catalog, JWT authentication), never by sharing crates: the platform and the engine pin
different versions of Arrow, DataFusion and Iceberg, so a shared build is ruled out by design.

## Read next

- [Architecture](./architecture): the decisions, the topology and the two execution modes.
- [Roadmap](./roadmap): phases P0 to P4 and the P0 milestones.

The design documents live in the [engine repository](https://github.com/egret-data/engine) under `docs/`.
