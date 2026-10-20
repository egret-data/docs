---
sidebar_position: 3
---

# Secrets

A **secret** is a named, stored credential that other settings reference by name instead of holding the value themselves: the secret access key of a storage connection, the password of a JDBC catalog, the password of a database connection. **Control Plane → Infrastructure → Secrets** manages them. **Values are never displayed** after you save them.

![The Secrets list: the secrets you created and the ones egret creates for engines and catalog clients](/img/platform/admin/cp-secrets.png)

You need **secret:read** to open the page; creating, rotating and deleting need the matching permissions.

## The secret list

A strip counts the **secrets**.

The list also shows the secrets egret creates and manages itself: `engine-internal-<engine id>-…` (the Trino internal-communication secret), `engine-monitor-…` (the egret-monitor password for the native Trino monitor), `engine-tls-…` (the coordinator keystore) for every provisioned engine, and `catalog-client-…` (a Catalog Client credential an engine presents to egret's catalog). Leave them alone: rotating or deleting one breaks the engine or client that uses it. On a 1440-pixel-wide screen the **Used by** and **Created** columns are cut off at the right; scroll the table sideways.

| Column | Meaning |
|---|---|
| **Name** | The secret name, with its keys underneath (for example `password`, `username`). Select it to open the secret. |
| **Type** | The secret type, for example `Opaque` or `kubernetes.io/basic-auth`. |
| **Description** | Free text, or a dash. |
| **Used by** | How many connections reference it. |
| **Created** | The creation date. |

## Add a secret

1. Press **Add secret**. The dialog is *Create a global named secret that storage and database connections can reference.*
2. Type the **Name**, for example `prod-s3-secret`, and an optional **Description**.
3. Choose the **Type**.
4. Under **Data**, press **Add key** and fill a key and a value for each entry. The value field hides what you type.
5. Press **Add secret**.

![The Add secret dialog with a key and a hidden value](/img/platform/admin/cp-secret-add.png)

### Types

| Type | Use it for |
|---|---|
| **Opaque** | Any set of keys you define, for example `password` or `token`. |
| **kubernetes.io/basic-auth** | A `username` and `password` pair, for example S3 access credentials. |
| **kubernetes.io/tls** | A TLS certificate and key. |
| **kubernetes.io/dockerconfigjson** | Registry credentials. |
| **kubernetes.io/ssh-auth** | An SSH private key. |

## The secret page

![A secret's details: name, description, type and keys; no values](/img/platform/admin/cp-secret-detail.png)

The header shows the name, type and *USED BY n connection(s)*, with **Rotate value** and **Delete**. Tabs:

| Tab | What it shows |
|---|---|
| **Overview** | The **Details** table, with metadata only: **Name**, **Description**, **Type**, **Keys**, **Used by** and **Created**. *Metadata for this secret. Values are never shown — use Rotate value to replace them.* **Edit** changes the editable metadata. |
| **Used by** | *Storage connections that reference this secret for their credentials.* With none: *No storage connections reference this secret.* |

## Rotate a secret

Rotate when a credential changes, or on a schedule. Everything that references the secret picks the new value up.

1. Open the secret and press **Rotate value**.
2. In **Rotate «\<name\>»**, write the new values for each key. The dialog says *Write new values for this \<type\> secret. Connections referencing it pick up the new credentials immediately.*
3. Press **Rotate value**.

![The Rotate dialog for an opaque secret](/img/platform/admin/cp-secret-rotate.png)

## Delete a secret

Press **Delete** on the list or the secret page. A secret that is in use cannot be deleted: the **Used by** count must be zero. Detach it from every connection first.

:::warning
A secret is a platform-wide object. Rotating it changes the credential for every connection that references it.
:::

## Use a secret

- In a **storage connection**: the **Secret** field.
- In a **catalog** (JDBC, Elasticsearch): **Password secret**.
- In a **database connection** of a workspace: the **Secret** selector (see [Databases](../workspace-settings/databases.md)).

## Limits and known issues

- Values cannot be read back, only replaced.
- Names are global across the platform.

## Further reading

- [Storage](./storage/index.md)
- [Create a catalog](./catalogs/create-catalog.md)
- [Databases](../workspace-settings/databases.md)
