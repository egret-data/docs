---
slug: /introduction
sidebar_position: 1
---

# Egret Engine

A distributed SQL engine for the lakehouse, written entirely in Rust. It is built on
[Apache DataFusion](https://github.com/apache/datafusion) and
[datafusion-distributed](https://github.com/datafusion-contrib/datafusion-distributed), uses
[Apache Iceberg](https://iceberg.apache.org/) as its native table format and speaks the PostgreSQL
wire protocol.

- **Trino-style federation and fault-tolerant execution**: query many sources; run long ETL with task-level retry.
- **StarRocks-style Iceberg caching and materialized views**: multi-layer caching with cache-affinity scheduling, async materialized views with query rewrite.
- **RisingWave-style CDC**: continuous ingestion from PostgreSQL and MySQL into Iceberg.

:::caution Status
The engine is in an early design phase. Nothing is usable yet.
:::
