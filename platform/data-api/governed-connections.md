---
sidebar_position: 6
---

# Governed connections and running as the caller

An endpoint answers with whatever the query engine returns to the identity that ran the query. If the engine filters rows or masks columns **per user** (row filters and column masks in Ranger, for example), the endpoint must run the query as the right user, or every consumer would read what the shared credential can read. This page explains who "the caller" is for the Data API, and the rule Egret enforces for governed data.

:::warning Not run in the demo
The demo connection, `trino-demo`, is neither governed nor per-user, and shared settings could not be changed for this page. The rule is described from the product's messages and source, and the messages shown below appear in the endpoint editor when the condition holds. The refusal on publish and the `503 governance_stale` response were not provoked on the instance.
:::

## Who is "the caller"

A Data API call is made by a **service account**, so the caller the engine sees is the service account, not the person who wrote the endpoint and not the consuming program's own user. A call goes through these steps:

1. The consumer presents a token for a service account.
2. Egret checks the invoke grant.
3. Egret runs the query on the endpoint's database connection **as that service account**, where the connection allows it.
4. The engine applies its own policies to that identity.

What step 3 means depends on three flags on the database connection, set under **Workspace settings → Engines** (see [Databases](../workspace-settings/databases)).

| Connection setting | Effect on Data API calls |
|---|---|
| **Per-user delegation** | Egret mints an engine token for the service account, and the engine evaluates policies for it. |
| **Run queries as the logged-in user** (impersonation) | Egret tells the engine to run as the service account: `X-Trino-User` for Trino, `EXECUTE AS` for StarRocks. |
| **Governed data** | A label: the engine applies row filters and column masks per user on this data. |

Delegation and impersonation are independent switches. **Either one** makes the connection run queries as the caller; Egret treats a connection as "per-user" if either is on.

A connection with neither switch on runs every query under the connection's own credential (for example the `egret` user in `trino-demo`). Every consumer then sees the same rows, whatever grants the service account holds in the engine.

## The rule for governed data

Marking a connection **Governed data** says that the data behind it is filtered per user. Egret then refuses to serve it under a shared credential.

| Situation | What Egret does |
|---|---|
| A **Governed** database that is **not** per-user | **Publishing is refused**, **Preview** is refused, and a published endpoint that was valid before the connection changed answers `503 governance_stale`. |
| A governed database that **is** per-user | Allowed. Each call runs as its service account, so the engine's row filters and masks apply to that account. |
| An ungoverned database | Allowed whether or not it is per-user. |

You see this in the editor before you reach Publish. On the **New endpoint** page and in the **Database** picker of the **Query** tab, governed databases are labelled *Governed*, and picking one that is not per-user shows:

> This database is governed: its row filters and column masks are applied per user at the engine. A query here would run on the shared service credential, so every consumer would read what that account can read. Running and publishing are both refused until the connection has per-user delegation (or impersonation) turned on.

The option is still offered in the picker rather than hidden, because the same database becomes publishable the moment an administrator turns delegation on.

### Why Preview is refused too

Preview runs through the same path as a served request, so on a governed connection that is not per-user the engine would see the service credential and the author would read unmasked rows. Egret refuses the preview for that reason.

### `governance_stale`

An endpoint that was published while its connection was per-user keeps its frozen version. If an administrator later turns delegation and impersonation off, or marks the database governed, the endpoint does not silently start serving unmasked data. It answers `503 governance_stale` with `Retry-After: 300` until the connection is restored or the governed flag is removed. A republish does not clear it: the connection is the cause.

## Caching on per-user connections

A cached answer is keyed on the caller by default. **Per caller** (the default **Scope**) keeps a separate copy per service account, so Ranger-filtered rows never cross accounts. **Shared** caches one copy for everyone and is refused when the endpoint's connection runs queries as the caller. If the connection becomes per-user after a **Shared** version was published, calls answer `503 cache_scope_stale` until you republish with **Per caller**. See [Cache, limits and rate limits](./endpoints/config#cache).

## Setting it up

1. An administrator enables **Per-user delegation** or **Run queries as the logged-in user** on the connection, and marks it **Governed data** when row filters or masks apply.
2. In the query engine, grant the **service account** access to the tables. The account is the one shown on the [Clients](./clients) page by name and email.
3. Create the endpoint on that database and grant the service account **invoke** on its [Access](./endpoints/access) tab.
4. Use **Try it** as the service account to confirm what it can read. A missing data permission answers `403 data_access_denied`.

## Limits and known issues

- The rule is checked at publish, at preview, and on every served call, so changes to a connection take effect on live endpoints at once.
- For data apps and notebooks the same engine-side policy applies per person; see [Apps](../explore/apps/access-and-data).

## Further reading

- [Databases](../workspace-settings/databases)
- [Access](./endpoints/access)
- [Error reference](./errors)
