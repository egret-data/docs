---
sidebar_position: 5
---

# Catalog and storage errors

Problems with the object store, the embedded Iceberg catalog and stored secrets. The startup messages below were reproduced.

## The server will not start

`egret serve` (and `migrate`, `init`) validate the configuration first and print one line. The ones about storage and the
catalog:

| Message | Cause and fix |
|---|---|
| `Error: the apps API requires [storage] bucket, access_key, secret_key (it stores draft/version content there regardless of apps.pod.launcher)` | The object-store credentials are always required. `.env.example` sets them; check that they were not removed or misspelled (an unknown name logs a `WARN`). Set `EGRET_STORAGE__BUCKET`, `EGRET_STORAGE__ACCESS_KEY` and `EGRET_STORAGE__SECRET_KEY`. |
| `Error: catalog.enabled requires warehouse and auth_token` | Set `EGRET_CATALOG__AUTH_TOKEN` (and `EGRET_CATALOG__WAREHOUSE`). |
| `Error: catalog.enabled requires storage access_key/secret_key/bucket` | The catalog needs the same storage settings. |
| `Error: secrets.master_key must be base64 of >=32 bytes` | `EGRET_SECRETS__MASTER_KEY` is set but does not decode to 32 bytes or more. Generate one with `head -c 32 /dev/urandom \| base64`. |
| `Error: workflow.container_runner other than none requires [storage] ...` | Execution files live in the bucket. |

The full list is in [Startup checks](../../reference/configuration-keys#startup-checks).

## *secrets master_key is not configured*

Saving a database or storage connection **with a secret** answers `400` with this message (reproduced):

```text
{"error":"secrets master_key is not configured"}
```

`EGRET_SECRETS__MASTER_KEY` is empty, which disables credential encryption. Set it (base64 of at least 32 bytes), restart, and
keep it: a changed key makes stored secrets unreadable. Connections without a secret work without it.

## The catalog answers 401

```bash
curl -i http://<egret>/catalog/v1/config
# 401  missing bearer token
```

The catalog accepts only tokens issued by Egret's own identity provider, so a bare request is expected to answer
`401 missing bearer token`. A token that does not verify answers `401 invalid token`. The catalog is up when you get one of
these (reproduced); `404` means the catalog is off (`catalog.enabled`).

Engines and clients authenticate with a **Catalog Client** (client id and secret) exchanged at `/oauth/token`. Common causes
of a real failure:

| Symptom | Cause |
|---|---|
| 403 on a table that exists | The client's role has no grant, or a `read` grant where the call writes. `write` and `manage` permit writes; any grant permits reads. |
| 403 on a rename (*may not rename …* or *may not rename into …*) | A rename needs `write` covering the source table and a `catalog` or `namespace` grant on the destination namespace; a grant on the destination table name is not enough. |
| 403 on a commit (*may not commit to …*) | A commit needs `write` covering the table it changes, the table named in the body's `identifier` when there is one. A multi-table commit needs it on every table, and one uncovered table refuses the whole commit. |
| 403 on a recursive namespace drop | A recursive drop needs a `catalog`-level `write` or `manage` grant. |
| 403 *remote signing is not used by egret* | The client asked the S3 request signer. egret does not sign requests; configure the client for vended credentials. |
| 400 *malformed rename request*, *malformed multi-table commit* or *malformed table commit* | The request body is not the JSON the Iceberg REST API defines. |
| 413 *the body of a … is larger than … bytes* | A rename body is limited to 1 MiB, and a commit body to 16 MiB. |
| 403 on the warehouse | The token's warehouse differs from the one requested. |
| Warehouse creation refused | A warehouse without a `key_prefix` claims the whole bucket, and the catalog rejects a location that overlaps another warehouse. Give each its own bucket or prefix. |

egret's refusals use the Iceberg REST error format, `{"error": {"message", "type", "code"}}`, so the client shows the
message above in a typed error (PyIceberg raises `ForbiddenError` for a 403). The full list of what each operation needs is
in [What each operation needs](../../control-plane/catalogs/catalog-detail#what-each-operation-needs).

### The advertised address is wrong

```bash
curl -s http://<egret>/.well-known/openid-configuration
```

If `issuer` or `token_endpoint` names an address clients cannot reach (`http://localhost:<port>`, the default when
`catalog.public_url` is unset, on a server that is not reached as localhost), set `EGRET_CATALOG__PUBLIC_URL` to the address engines use, and
`EGRET_IDP__ISSUER` to the address of clients outside the cluster. **Changing the issuer strands StarRocks engines already
provisioned**, because their security integration compares the old issuer byte for byte; re-provision them. See
[Configuration](../configuration#address-settings-that-people-confuse).

Behind the demo stack's edge on a port other than 80, `GET /catalog/v1/config` advertises its `uri` without the port (for
example `http://egret.localtest.me/catalog` on port 18780). PyIceberg follows that address and fails with *connection
refused* (KI-314). A client that reaches egret directly on the stack's network is not affected.

## The bucket does not exist

Nothing creates the bucket: not Egret, and not the development compose file. The server starts anyway, because it does not
probe the bucket at boot, and the failure appears at the first use: creating a warehouse, writing a table, storing a query
result or workflow file, or creating a Data App. Reproduced with a bucket name that does not exist:

```text
POST /api/ws/default/apps    ->  500 {"error":"internal error"}
server log                   ->  ERROR egret_core::http: internal error error=s3 error: service error
```

The API answers a generic 500, so the log is where the S3 error is. If an operation that writes to object storage answers
`internal error` and the log says `s3 error`, check the bucket, the endpoint and the credentials first.

Create it, for example with the RustFS console at [http://localhost:9001](http://localhost:9001) or:

```bash
AWS_ACCESS_KEY_ID=egret AWS_SECRET_ACCESS_KEY=egretsecret AWS_DEFAULT_REGION=us-east-1 \
  aws --endpoint-url http://localhost:9000 s3 mb s3://warehouse
```

The Helm chart's `egret-rustfs-bucket` job does this for the bundled RustFS.

## Credentials vending fails

The catalog hands engines short-lived, table-scoped credentials by calling STS `AssumeRole` on the object store. A store
without STS support cannot serve them. RustFS supports it; MinIO's current public images are no longer available. Without
vended credentials, engines need static `s3.*` keys in their catalog configuration.

## Storage connections in the app

**Control Plane → Storage** lists registered connections. A connection whose secret cannot be read (a changed master key) or
whose endpoint or bucket is wrong fails when you browse it or attach a catalog to it. Check the endpoint, region, bucket,
`path_style` and the key pair first.

## Further reading

- [Storage and catalog setup](../storage-and-catalog)
- [Storage](../../control-plane/storage)
- [Catalogs](../../control-plane/catalogs)
