---
sidebar_position: 3
---

# Roadmap

The engine is delivered in five sub-projects. Each gets its own specification, implementation plan and implementation
cycle. As of this writing the project is in the design phase: the architecture and P0 specifications exist, and the
implementation plan for the first P0 milestone (M0 Foundation) is written. No phase has shipped.

## Phases

| Phase | Scope | Outcome | Depends on |
|---|---|---|---|
| P0 | Distributed Iceberg reads, Iceberg caching, pgwire, authentication, RBAC with row-level security, masking and OPA, `QUERY` retry | Fast distributed `SELECT` on Iceberg from any PostgreSQL client | None |
| P1 | Iceberg writes (CTAS, INSERT, DELETE, UPDATE, MERGE), table maintenance, fault-tolerant `TASK` execution | A full lakehouse with fault-tolerant ETL | P0 |
| P2 | Federation (PostgreSQL, MySQL, ClickHouse and others) through `CREATE CATALOG ... USING <kind>` | Trino-style cross-source queries | P0 |
| P3 | Materialized views stored as Iceberg tables, with query rewrite | StarRocks-style materialized views | P1 |
| P4 | Change data capture from PostgreSQL and MySQL into Iceberg upsert tables | RisingWave-style CDC | P1 |

## P0 milestones

| Milestone | Deliverable | Exit criteria |
|---|---|---|
| M0 Foundation | Cargo workspace, CI, configuration loading, the `egret-engine` binary with `--role all`, a pgwire simple-query frontend over in-memory DataFusion | `psql -c "SELECT 1"` works against the binary |
| M1 Iceberg single-node | `CREATE CATALOG ... USING iceberg_rest`, the PostgreSQL metadata store, Iceberg scans with delete files, table and manifest caches | Fixture tables with equality deletes, deletion vectors and schema evolution return the same results as Spark |
| M2 Distribution | The `datafusion-distributed` fork, the worker role, worker resolution (static and Kubernetes) | TPC-H SF1 distributed results equal single-node results |
| M3 Caching | Block cache, cache-affinity scheduling, `CACHE SELECT`, cache metrics | A warm-cache rerun reads at least 90% of bytes from cache |
| M4 Security | Authentication (JWT, OAUTHBEARER, SCRAM, TLS), roles and grants, row-level security, masking, OPA, audit log | Row-level security and masking differential tests match PostgreSQL |
| M5 Lifecycle and compatibility | Extended query protocol, cancel, admission control, `QUERY` retry, `pg_catalog` and `information_schema`, job framework | Client smoke tests (psql, psycopg, pgjdbc, SQLAlchemy, DBeaver, Metabase) pass |
| M6 Packaging | Helm chart, distroless image, Docker Compose file, operations docs, TPC-H benchmarks | The P0 definition of done is met |

:::note
The milestone table is the plan, not a progress report. Follow the [engine repository](https://github.com/egret-data/engine)
for the current state.
:::

## Further reading

- [Architecture](./architecture)
