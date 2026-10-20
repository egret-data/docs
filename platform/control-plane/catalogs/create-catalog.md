---
sidebar_position: 1
---

# Create a catalog

Press **New catalog** on **Control Plane → Catalogs** to register a catalog. You choose what the catalog reads, name it, and fill the fields that kind needs. The catalog is stored in the registry; attach it to an engine afterwards.

![The New catalog form for the TPC-H kind, with the name tpch_large](/img/platform/admin/cp-catalog-new.png)

You need **catalog_registry:create**. A name is required: the button stays disabled and the form says *A name is required.*

## Create the catalog

1. Press **New catalog**.
2. Choose the **Kind**. The description under it says what the kind reads.
3. Type the **Name**. *The name is how the catalog is addressed in SQL on every engine.*
4. Optionally type a **Description**.
5. Fill the fields the kind shows (below).
6. Press **Create catalog**.

The catalog's page opens. Continue with [Catalog detail](./catalog-detail.md) to attach it to an engine and assign it to workspaces.

## Kinds

*What this catalog reads. It cannot be changed afterwards — the engines read a different set of properties for each.*

| Kind | Reads | Fields |
|---|---|---|
| **egret warehouse** | An Iceberg warehouse egret manages itself, over a storage connection. Creates the warehouse as well as the catalog. | **Warehouse** (egret provisions a lakekeeper warehouse and records its catalog): **Workspace** that owns it, **Storage connection**. |
| **Iceberg** | An existing Iceberg catalog: REST, Hive Metastore or AWS Glue. Its metastore is the source of truth for table metadata; egret only tells the engines how to reach it. | **Metastore** (**Iceberg REST**, **Hive Metastore** or **AWS Glue**), **REST URI**, **Warehouse**, **Authentication** (**None** or **OAuth 2**), **Storage connection**. |
| **Hive** | Hive tables. Both the metastore and storage are required. | **Metastore** (**Hive Metastore** or **AWS Glue**), **Metastore URI**, **Storage connection**. |
| **Delta Lake** | Delta tables. Both required. | **Metastore** (**Hive Metastore** or **AWS Glue**), **Metastore URI**, **Storage connection**. |
| **Hudi** | Hudi tables. Both required. | **Metastore** (**Hive Metastore**), **Metastore URI**, **Storage connection**. |
| **JDBC** | A relational database: PostgreSQL, MySQL, MariaDB, Oracle, SQL Server or ClickHouse. | **Dialect** (`postgresql`, `mysql`, `mariadb`, `oracle`, `sqlserver`, `clickhouse`), **Host**, **Port**, **Database** (shown for the dialects that need one, such as `postgresql`; required there), **User**, **Password secret**, **TLS** (`disable`, `require`, `verify_full`; default `require`). |
| **Elasticsearch** | Indices exposed as tables. The engines connect directly to the hosts. | **Hosts**, **Port**, **TLS**, **User**, **Password secret**. |
| **TPC-H** | Generated benchmark data. No external system. | **Scale**. |
| **TPC-DS** | Generated benchmark data. | **Scale**. |
| **Generic** | Whatever properties you write in **Advanced properties**. | The engines it is valid for (**trino** needs `connector.name`; **starrocks** needs `type`) and the property pairs. |

The **Storage connection** list is the platform's [storage connections](../storage/index.md). **Password secret** lists [secrets](../secrets.md), so a credential is never typed into the catalog. The list shows every secret, including the ones egret creates for engines and catalog clients (`engine-internal-…`, `engine-monitor-…`, `engine-tls-…`, `catalog-client-…`); pick one of your own.

## Advanced properties

Every kind has **Advanced properties**: extra engine properties, written after the ones the form sets. A key the form already sets is refused, and a value that looks like a credential is refused. Store it as a secret and reference its id.

For **Generic** catalogs, Advanced is the whole configuration, per engine: for Trino a `connector.name` is required (*connector.name is required for this kind*), with more properties added one by one under *trino property name*; for StarRocks the `type`.

## Example: a TPC-H catalog for benchmarks

1. **New catalog**, **Kind** = **TPC-H**.
2. **Name** `tpch_bench`, **Description** *Generated TPC-H data for benchmarks*.
3. Leave **Scale** as it is and press **Create catalog**.

The catalog page opens with its **Configuration** tab. Egret says *Nothing here fails the rules this build checks — but it checks only the rules it knows, and egret validates the whole configuration when you save.*

## Example: a JDBC catalog for a Postgres replica

1. **New catalog**, **Kind** = **JDBC**.
2. **Name** `finance_pg`, **Description** *Finance Postgres read replica*.
3. **Dialect** `postgresql`, **Host** `finance-db.internal`, **Port** `5432`, **Database** `finance`, **User** `finance_ro`, **Password secret** `finance-postgres`. Leave **TLS** at `require`.
4. Press **Create catalog**. **Create catalog** stays disabled until the database is filled in.

The catalog page opens. Before you attach it, **Engines → Test** only checks that egret can open a TCP connection to the host; on the demo stack, where the host does not exist, it says *Could not reach finance-db.internal:5432: failed to lookup address information: Name or service not known.*

## Limits and known issues

- The form checks the rules egret knows; the engine validates the rest when the catalog is applied.
- Creating an egret warehouse needs a workspace and a storage connection that egret can reach. Two warehouses cannot share a storage location: on the demo stack a second warehouse on the seeded bucket was refused with *Storage profile overlaps with existing warehouse demo-warehouse*, also with another key prefix.

## Further reading

- [Catalog detail](./catalog-detail.md)
- [Storage](../storage/index.md)
- [Secrets](../secrets.md)
