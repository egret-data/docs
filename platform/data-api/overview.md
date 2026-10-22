---
sidebar_position: 1
---

# Data API overview

The Data API turns a SQL query into a REST endpoint. You write the query, declare the parameters callers may pass, publish it, and any program that holds an OAuth2 token can call it over HTTP and receive JSON. You do not write a service, deploy anything or hand out database credentials.

Use it when a consumer that is not a person (a nightly job, a partner's backend, a mobile app, a spreadsheet macro) needs the answer to a query that you control. For a person who wants to look at data, use [Charts](../explore/charts) and [Dashboards](../explore/dashboards) instead.

![The endpoints list with eight endpoints: six live, Customer spend as a draft and Legacy order export disabled](/img/platform/data-api/endpoints-list.png)

## The pieces

Everything lives under **Data API** in the Explore sidebar. Each workspace has its own endpoints, service accounts and activity.

| Piece | What it is | Page |
|---|---|---|
| **Endpoint** | A query plus its URL, parameters, response shape, cache and limits. It has a draft you edit and numbered, frozen **versions** you publish. | [Endpoints](./endpoints) |
| **Service account** | A machine identity that owns credentials and is granted access to endpoints. | [Clients](./clients) |
| **Client** | An OAuth2 `client_id` and `client_secret` that belongs to a service account. A consumer exchanges them for a short-lived token. | [Clients](./clients) |
| **Grant** | Permission for one service account to call one endpoint. Without a grant every call is refused. | [Access](./endpoints/access) |
| **Activity** | The access log: every call, its status, duration and whether the cache answered. | [Activity](./activity) |

## How a call flows

A consumer first trades its client credentials for a token, then calls the endpoint with that token. Egret checks the token, finds the live version of the endpoint, checks the grant, applies the rate limit, looks in the cache, and only then runs the query.

```text
POST /oauth/token  (client_id + client_secret)        ->  access_token, valid 600 seconds
GET  /data-api/v1/{workspace}/{path}?param=value      ->  { "status": "ok", "data": [...], "meta": {...} }
```

The numbered steps behind that second request, in the order Egret applies them:

1. Verify the bearer token. A missing, expired or wrong-audience token is `401 key_invalid`.
2. Find the live endpoint by workspace, method and path. No match is `404 not_found`.
3. Check that the service account holds an invoke grant on the endpoint. No grant is `403 not_granted`.
4. Apply the endpoint's rate limits. Over the limit is `429 rate_limited` with a `Retry-After` header.
5. Resolve the parameters: decode, apply defaults, check type and constraints. A bad value is `400 param_invalid`; a missing required one is `400 param_missing`.
6. Serve from the cache when the endpoint caches and the entry is fresh.
7. Run the query on the endpoint's database, as the service account, with every parameter **bound** (never pasted into the SQL).
8. Shape the rows, enforce the row cap, store the response in the cache and write the access-log row.

Every error uses one body shape and a stable `error.code`; see the [error reference](./errors).

:::note
A client gives a service account the ability to *get a token*. Two separate things decide what that token can do: an invoke **grant** on each endpoint (managed in Egret), and **data access** to the underlying tables (managed by the query engine, for example in Ranger). Publishing an endpoint grants neither.
:::

## Endpoint lifecycle

An endpoint is never edited in place for its consumers. You edit the **draft**; consumers only ever see a **version**, which is a frozen copy of the draft taken when you press **Publish**. That includes the URL: a new method or path on the draft is served only from the next publish.

| State | Meaning | Serves calls |
|---|---|---|
| **Draft** | Created, never published. | No |
| **Live** | A version is published and serving. The header shows `Live · v2`, plus `unpublished changes` when the draft is ahead of it. | Yes |
| **Disabled** | Taken out of service. It keeps its live version and its grants, so **Enable** brings it back exactly as it was. | No (`404 not_found`) |
| **In the trash** | Soft-deleted. Cannot be edited, published or enabled until you restore it, and it comes back disabled. | No |

[Publishing, versions and rollback](./endpoints/publishing) explains breaking-change checks and how to move consumers back to an earlier version.

## What you need before you start

| To do this | You need |
|---|---|
| Create and publish endpoints | The `data_api_endpoint:manage` permission, which the built-in **ws_admin** role holds. |
| Create service accounts and issue clients | `service_account:manage` (also **ws_admin**). |
| Reach the endpoint's data | A database connection in [Workspace settings](../workspace-settings/databases), and data access for the service account on the engine. |

:::tip
The fastest way to learn the feature is the end-to-end walk-through in [Call an endpoint with curl](./calling-endpoints): it creates a service account, issues a client, grants access, mints a token and calls a published endpoint.
:::

## Where to go next

- [Endpoints](./endpoints): the list, creating an endpoint, and the editor's six tabs.
- [Write queries with parameters](./endpoints/parameters): the `{{ name }}` syntax, types and constraints.
- [Clients](./clients): service accounts and OAuth2 clients.
- [Call an endpoint with curl](./calling-endpoints): token, call, errors and rate limits.
- [Activity](./activity) and [Alerts on endpoints](../explore/alerts-and-reports/data-api-alerts): watch traffic and get told when it goes wrong.
