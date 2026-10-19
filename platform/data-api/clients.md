---
sidebar_position: 3
---

# Clients

A **service account** is a machine identity for the Data API. It holds the **OAuth2 clients** that call your endpoints. Each client is one credential: revoke it and the consumer using it stops minting tokens.

![Clients](/img/platform/data-api-clients.png)

## Create a service account

Press **+ Service account**.

![New service account](/img/platform/data-api-client-new.png)

Give it a **Name** (its email address is derived from the name by the backend and shown on its row) and an optional **Description**. After it exists, issue OAuth2 clients from the Clients list, then grant the account permission to invoke each endpoint on that endpoint's **Access** tab.
