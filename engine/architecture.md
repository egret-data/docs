---
sidebar_position: 2
---

# Architecture

This page summarizes the architecture design of Egret Engine (specification dated 2026-10-17, status *design approved,
under review*). Nothing described here is implemented yet; see [Egret Engine](./introduction) for the project status.
The full text is in the [engine repository](https://github.com/egret-data/engine) under `docs/superpowers/specs/`.

## Decisions

| # | Decision | Main reason |
|---|---|---|
| D1 | Client protocol is the PostgreSQL wire protocol, PostgreSQL dialect. Arrow Flight SQL later. | The widest client ecosystem (psql, JDBC, psycopg, BI tools); DataFusion's SQL is closest to PostgreSQL. |
| D2 | Authentication by JWT in the password field over TLS, OAUTHBEARER, SCRAM, and impersonation with an explicit privilege. | Works with every client. |
| D3 | One engine, two execution modes: `retry_policy = NONE`, `QUERY` or `TASK`. | Keep streaming latency for BI and give ETL fault tolerance. |
| D4 | A dedicated PostgreSQL metadata store. | Transactions, leases with `SKIP LOCKED`, familiar operations. |
| D5 | A standalone product with pluggable authentication, policy and catalog, PostgreSQL-style RBAC and its own Helm chart. | Not locked to one platform. |
| D6 | StarRocks-style Iceberg caching from P0. | The decisive performance factor on object storage. |
| D7 | Authorization with a full internal model (roles, grants, row-level security by `CREATE POLICY`, masking) plus OPA. No Ranger in P0. | A self-sufficient engine that also fits cloud-native stacks. |
| D8 | A separate Rust workspace, never linked into the platform. | Dependency conflicts between the two. |
| D9 | A small patch series on a fork of `datafusion-distributed`, rebased regularly. | Needed for per-query memory pools, attempt ids and spooled boundaries. |
| D10 | Iceberg is the source of truth for data, CDC offsets and materialized view lineage; PostgreSQL holds coordination state only. | Avoid two diverging sources of truth. |

## Topology

```text
clients (pgwire, TLS)
        |
Coordinator xN   parse -> authorize -> [MV rewrite, P3] -> plan -> schedule
        |  gRPC
Worker xM (query execution, NVMe cache)      Job runtime (role=maintenance)
        |                                      compaction, MV refresh, CACHE SELECT
        v
Object storage (S3)   Iceberg REST catalog   PostgreSQL metadata
                                              (roles, grants, policies, catalogs, jobs, leases)
```

Design principles:

1. One binary with several roles: `--role coordinator | worker | maintenance | ingest | all`.
2. Stateless coordinators; a session is bound to one connection, and several coordinators sit behind an L4 load balancer.
3. Workers run as a StatefulSet with stable identities and NVMe volumes, so caches survive restarts and cache-affinity hashing stays stable.
4. One shared job framework backed by a `jobs` table in PostgreSQL.
5. One idempotent Iceberg commit layer, shared by DML, materialized view refresh and CDC.
6. Heavy maintenance jobs run as `TASK`-mode queries on the same cluster.
7. Authorization is checked on the coordinator before planning. This is mandatory because the data caches are keyed by file path, not by credentials.

## Execution modes

| `retry_policy` | Shuffle | On failure | Default for |
|---|---|---|---|
| `NONE` | Streaming, in memory | The query fails. | Explicit opt-in |
| `QUERY` | Streaming, in memory | Re-run the whole query while the result still fits the 32 MB buffer. | `SELECT` and BI (P0) |
| `TASK` (P1) | Spooled to object storage, with barriers between stages | Retry individual tasks and select exactly one attempt per task. | CTAS, INSERT, MERGE, compaction, large inputs |

## Known risks

The specification lists the risks the project carries: API churn in `datafusion-distributed`, missing overwrite and
row-delta support in `iceberg-rust` (so the engine needs its own commit layer), equality-delete bugs upstream, vended
credentials expiring during long queries, the size of `TASK` mode, and the coordinator being a single point of failure for
running queries. Each has a stated mitigation in the specification.

## Further reading

- [Roadmap](./roadmap)
