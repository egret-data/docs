---
sidebar_position: 4
---

# Storage and catalog setup

Egret needs S3-compatible object storage for its own files, and can run an Apache Iceberg REST catalog inside the server
process. This page covers the server settings for both. Managing storage connections and catalogs in the app is covered in
[Storage](../control-plane/storage) and [Catalogs](../control-plane/catalogs).

## Object storage

The `[storage]` section is the object store the server itself uses. One bucket holds:

| What | Key prefix (setting) | Default |
|---|---|---|
| Stored query results | `engine.results_prefix` | `query-results` |
| Workflow execution files and namespace files | `workflow.storage.prefix` | `workflow/` |
| Data Apps drafts and versions | `apps.storage.prefix` | `apps/` |
| The default catalog warehouse | `catalog.warehouse` (`s3://<bucket>`) | `s3://warehouse` |

The first three prefixes hold other users' data, so **Control Plane → Storage → Browse** and its download close them to everyone except a platform admin ([Storage](../control-plane/storage/index.md#folders-only-a-platform-admin-can-open)).

```bash
EGRET_STORAGE__ENDPOINT=http://localhost:9000   # omit for AWS S3
EGRET_STORAGE__REGION=us-east-1
EGRET_STORAGE__BUCKET=warehouse
EGRET_STORAGE__ACCESS_KEY=egret
EGRET_STORAGE__SECRET_KEY=egretsecret
EGRET_STORAGE__PATH_STYLE=true                  # true for RustFS and most self-hosted S3
```

Three rules to know:

- **The credentials are mandatory.** The server will not start with an empty `bucket`, `access_key` or `secret_key`, because
  the Data Apps API stores its content there whatever else is enabled. `egret migrate` and `egret init` run the same check.
- **The bucket must already exist.** Egret does not create it, and neither does the dev compose file. Create it with your
  S3 tooling or the RustFS console ([http://localhost:9001](http://localhost:9001)). The Helm chart creates the bucket for its bundled RustFS with a
  one-off job.
- **The store must support STS `AssumeRole`** if you use the embedded catalog: the catalog hands engines short-lived
  credentials scoped to one table by calling `AssumeRole` on this endpoint. RustFS does; MinIO's current public images are
  no longer available.

Execution retention is also on this bucket: files of ended workflow executions are deleted after
`workflow.storage_retention_days` (30) and stored query results are bounded by `engine.max_rows`.

## The embedded Iceberg catalog

Egret embeds the lakekeeper Iceberg REST catalog in the server. The catalog's metadata lives in the Egret PostgreSQL
database and its data files in the storage bucket. Engines and Python clients reach it at `/catalog` on the Egret address.

```bash
EGRET_CATALOG__ENABLED=true
EGRET_CATALOG__AUTH_TOKEN=<a long random string>
EGRET_CATALOG__WAREHOUSE=s3://warehouse
EGRET_CATALOG__PUBLIC_URL=http://egret.example.internal:8080
```

| Key | Notes |
|---|---|
| `catalog.enabled` | Off by default. When on, `warehouse`, `auth_token` and the storage credentials are required. The server logs lakekeeper's own migrations on first start, in the same database. |
| `catalog.auth_token` | A static token for catalog administration. Treat it as a secret. |
| `catalog.warehouse` | The default catalog's location. |
| `catalog.public_url` | The address clients and engines use to reach this server, without `/catalog`. Unset, it is `http://localhost:<server.port>`: change it when the server is reachable under another name or scheme. It is also where the machine identity provider's issuer falls back to. |
| `catalog.system_user` | The stable name (`egret-system`) of the principal that bootstraps the catalog's default project. Keep it stable across deploys. |

### What an engine sees

The catalog accepts only tokens that Egret's own identity provider issued: a request without one answers
`401 missing bearer token`, and a token that does not verify answers `401 invalid token`. Engines authenticate with a
**Catalog Client** (client id and secret) created in the app under the catalog, and exchange it at `/oauth/token`. Both the
catalog URI and the OAuth2 `server-uri` point at Egret. A Trino catalog file looks like this (the repository keeps the
canonical version in `deploy/embedded-catalog/engine-wiring.md`):

```properties
connector.name=iceberg
iceberg.catalog.type=rest
iceberg.rest-catalog.uri=http://egret.example.internal:8080/catalog
iceberg.rest-catalog.warehouse=lakehouse
iceberg.rest-catalog.security=OAUTH2
iceberg.rest-catalog.oauth2.credential=<clientId>:<clientSecret>
iceberg.rest-catalog.oauth2.server-uri=http://egret.example.internal:8080/oauth/token
iceberg.rest-catalog.oauth2.scope=catalog
iceberg.rest-catalog.vended-credentials-enabled=true
fs.native-s3.enabled=true
s3.endpoint=http://rustfs:9000
s3.region=us-east-1
s3.path-style-access=true
```

With `vended-credentials-enabled`, engines get credentials scoped to the table they load and the static `s3.aws-*` keys are
not needed. A warehouse is provisioned with STS enabled and remote signing off, and egret refuses every S3 signer request
(`…/aws/s3/sign`) with 403, whatever the client's grants.

### Setting it up in the app

1. **Control Plane → Storage → Add connection**: register the S3 store (endpoint, bucket, access key and secret).
2. **Control Plane → Catalogs → New catalog**: create an *egret warehouse* over that storage connection. This creates the
   warehouse in the embedded catalog.
3. Open the catalog. On **Roles & grants**, add a role and give it a `write` grant (`write` and `manage` permit writes; any
   grant permits reads). Creating a table, renaming into a namespace and dropping a namespace recursively need more than a
   table grant; see [What each operation needs](../control-plane/catalogs/catalog-detail#what-each-operation-needs).
4. On **Catalog Clients**, add a client bound to that role and copy the client id and secret. The secret is shown once.
5. The **Connect** tab shows the catalog URI, warehouse name and OAuth token URL for this deployment, with ready-made
   snippets for PyIceberg, Trino and StarRocks.
6. On **Engines**, attach the catalog to an engine, and on **Workspaces** assign it to the workspaces that should see it.

:::caution One warehouse, one prefix
A warehouse without a `key_prefix` claims the whole bucket, and the catalog rejects a warehouse whose location overlaps an
existing one. Give each warehouse its own bucket or key prefix.
:::

### Check it

```bash
curl -i http://localhost:8080/catalog/v1/config
# HTTP/1.1 401 ... missing bearer token  (the catalog is mounted and enforces authentication)

curl -s http://localhost:8080/.well-known/openid-configuration
# {"issuer":"http://localhost:8080","jwks_uri":...,"token_endpoint":"http://localhost:8080/oauth/token",...}
```

If `issuer` is not an address your clients can reach, set `idp.issuer`; see [Configuration](./configuration#address-settings-that-people-confuse).

## Demo data

With a running server and the catalog on, `just seed-demo` creates a storage connection, a warehouse in the `demo`
workspace, an engine role and client, five Iceberg tables in two namespaces, and a reader role that can read only two of them.

## StarRocks JDBC drivers

A StarRocks `jdbc` catalog makes the front end download a driver jar. Egret compiles in a pinned driver per dialect
(`postgresql`, `mysql`, `mariadb`, `oracle`, `sqlserver`, `clickhouse`); the `[starrocks.jdbc_drivers.<dialect>]` section
repoints one at an internal mirror or a `file:///` path in the image. See the [configuration
keys](../reference/configuration-keys#starrocks).

## Troubleshooting

See [Catalog and storage errors](./troubleshooting/catalog-storage-errors).
