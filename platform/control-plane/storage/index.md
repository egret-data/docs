---
sidebar_position: 4
---

# Storage

A **storage connection** tells egret how to reach an S3-compatible object store: the endpoint, the bucket and the credential. Catalogs (Iceberg warehouses) and workspace features such as query results, apps and workflows keep their files there. **Control Plane → Infrastructure → Storage** manages the connections for the whole platform.

![The Storage list with two connections](/img/platform/admin/cp-storage.png)

You need **storage:read** to open the page; creating, editing and deleting need the matching permissions.

## The connection list

A strip counts the **connections**.

| Column | Meaning |
|---|---|
| **Name** | The connection name. Select it to open the connection. |
| **Purpose** | A free-text label, or a dash. |
| **Provider** | `s3`. |
| **Bucket** | The bucket. |
| **Endpoint** | The S3 endpoint URL. |
| **Secret** | **Configured** when a credential secret is attached. |
| Actions | **Delete**. |

## Add a connection

1. Press **Add connection**. The dialog is *Register a global S3-compatible object store for the platform.*
2. Choose the **Provider**. **S3 / RustFS** works for AWS S3 and any S3-compatible store; **Google Cloud Storage** and **Azure Blob** are listed as *coming soon*.
3. Fill the fields below.
4. Choose the **Secret** (the secret access key): an existing secret, **No secret**, or **＋ New secret**.
5. Press **Add connection**.

![The Add storage connection dialog](/img/platform/admin/cp-storage-add.png)

| Field | Meaning |
|---|---|
| **Name** | Required, for example `prod-lakehouse`. |
| **Purpose** | Optional label, for example *catalog, notebooks*. |
| **Endpoint** | Leave blank for AWS (for example `https://s3.corp.local`). |
| **Region** | For example `us-east-1`. |
| **Bucket** | The bucket, for example `my-data-lake`. |
| **Key prefix** | Optional path prefix that scopes objects inside the bucket, for example `workspaces/eng`. |
| **Access key** | The access key ID. |
| **Secret** | The stored secret holding the S3 secret access key (see [Secrets](../secrets.md)). **＋ New secret** creates one inline. |
| **Force path-style URL** | Address the bucket as `endpoint/bucket` instead of a subdomain (*s3.region.amazonaws.com/bucket*). Needed by most self-hosted stores. |

## The connection page

![The Overview and Configuration of the demo-rustfs connection](/img/platform/admin/cp-storage-detail.png)

The header shows the name, provider and the **BUCKET** and **ENDPOINT**, with **Edit** and **Delete**. Four tabs follow:

| Tab | What it shows |
|---|---|
| **Overview** | The connection's key facts. |
| **Warehouses** | *Iceberg warehouses whose data lives on this connection.* Empty: *No warehouses use this connection yet.* |
| **Browse** | A file browser for the bucket (see below). |
| **Configuration** | *Connection settings for this S3-compatible object store.* A table of **Provider**, **Bucket**, **Region**, **Endpoint**, **Key prefix**, **Access key**, **Path-style URL**, **Purpose** and **Secret** (*Configured*). **Edit** changes them. |

## Browse a connection

The **Browse** tab lists the connection's folders and files, so you can confirm a connection works and see what egret stored: for example folders such as `apps`, `query-results`, `workflow` and the warehouse folders named by id. Select a folder to open it; files show their size and can be downloaded. An empty folder says *This folder is empty.*

Browse and download start at the connection's **Key prefix**, not at the bucket root. Keys are relative to that prefix, and the first crumb of the path shows `bucket/prefix`: a connection on bucket `warehouse` with Key prefix `sandbox` opens at `warehouse/sandbox`. A connection without a Key prefix opens at the bucket root and its crumb shows the bucket name.

### Folders only a platform admin can open

In egret's own bucket (the `[storage] bucket` of the server configuration), egret writes other users' data under three prefixes: stored SQL Lab results (`engine.results_prefix`, `query-results` by default), Data App sources (`apps.storage.prefix`) and workflow files (`workflow.storage.prefix`). A stored SQL Lab result is what one person was allowed to see, after their masks and row filters. These prefixes are closed to everyone who is not a platform admin, whatever storage permission they hold:

- Browse leaves them out and says so under the list, for example *apps, query-results, workflow are not shown: egret stores its users' SQL Lab results, Data App sources and workflow files there. Only a platform admin can open them.*
- Listing or downloading a key under them answers 403 with the reason: *… holds data egret writes for its users (stored SQL Lab results, Data App sources, workflow files), so it cannot be browsed or downloaded with storage:read; only a platform admin can open it*. The match ignores case and also applies after percent-decoding the key.

A platform admin sees and downloads them as before.

Keys that try to leave the folder are refused with 400 for everyone, platform admins included: a `.` or `..` segment, an empty segment (a leading `/`, a trailing `/` on a file, or `//`), a backslash or a control character, also once percent-decoded.

![The Browse tab listing the top-level folders of the warehouse bucket](/img/platform/admin/cp-storage-browse.png)

## Delete a connection

Press **Delete**. The dialog *Delete «\<connection\>»?* says *This storage connection will be removed. Any catalogs or workspaces that reference it may break.* and asks you to type `delete`. A connection that warehouses or other resources still use should be left alone: check the **Warehouses** tab first (for `demo-rustfs` it lists `demo-warehouse`, workspace Default, **Provisioned**).

## Limits and known issues

- Only S3-compatible stores work; Google Cloud Storage and Azure Blob are not available yet.
- **storage:read** still lets a holder (for example the built-in `data_steward` role) download the raw Iceberg data files of every warehouse in the bucket, which bypasses column masks and row filters (KI-236). Keep **storage:read** for administrators.
- A key prefix does not keep two egret warehouses apart: a warehouse on `sandbox-lake` was refused with *Storage profile overlaps with existing warehouse demo-warehouse*. Use a separate bucket for each warehouse.

## Further reading

- [Secrets](../secrets.md)
- [Catalogs](../catalogs/index.md)
- [Create a catalog](../catalogs/create-catalog.md)
