---
sidebar_position: 1
---

# Overview

The Data API turns a query into a REST endpoint. You write SQL, publish it, and consumers call it over HTTP with an OAuth2 token.

The pieces, all under **Data API** in the sidebar:

| Page | Purpose |
|---|---|
| [Endpoints](./endpoints) | Publish a query as a REST endpoint. |
| [Clients](./clients) | Service accounts and the OAuth2 clients that call endpoints. |
| [Activity](./activity) | Call history for the workspace's endpoints. |

Access is granted per endpoint: create a service account, issue it a client, then grant that account permission to invoke each endpoint.
