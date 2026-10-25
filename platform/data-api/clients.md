---
sidebar_position: 3
---

# Clients

A consumer that calls your endpoints needs a credential. In the Data API that is an **OAuth2 client** owned by a **service account**. A service account is a machine identity: it is the "who" that endpoints grant access to and that the query engine sees. A client is one `client_id` and `client_secret` pair that lets a program prove it acts for that account.

![The Clients page with three service accounts and their clients: Active, Revoked and Expired](/img/platform/data-api/clients-list.png)

Open **Explore → Data API → Clients**. Each service account is a header row with its clients listed beneath it.

## Service accounts and clients

| Concept | What it is | Who holds it |
|---|---|---|
| **Service account** | A named machine principal with an email address of the form `svc.<name>@<workspace>.service.egret.local`. | Egret. It is granted invoke on endpoints and data access in the engine. |
| **Client** | A `client_id` plus a `client_secret`, issued for one service account. | The consuming program. |
| **Token** | A signed bearer token valid for 600 seconds, obtained by exchanging a client's credentials. | The consuming program, in memory. |

One service account can have several clients, for example one per consuming system, so you can revoke one without disturbing the others. Grants are made to the **service account**, so every client of that account has the same access.

## The list

| Column | What it shows |
|---|---|
| **Client** | The service account's name and email, with the number of clients and when it was created; under it, each client's name. |
| **ID** | A shortened `client_id` (`egret-da…805e`) with a copy button. |
| **Status** | **Active**, **Revoked** (with *revoked an hour ago*) or **Expired** (with *expired 9 months ago*); an active client with an expiry shows *expires in …*. |
| **Last used** | When the client last minted a token, or *Never*. |

**Search service accounts…** filters by name. The **⋯** menu on a service account offers **Issue client…** and **Delete**; on an active client it offers **Revoke…**. A client that is already revoked has no menu.

## Create a service account

1. Press **+ Service account**.
2. Enter a **Name**, for example `orders-reporting-bot`. The account's email address is derived from it and shown on its row.
3. Optionally add a **Description** of what the account is for and who owns it.
4. Press **Create service account** at the top right.

![The New service account page](/img/platform/data-api/service-account-new.png)

Names are unique in a workspace. Reusing one is refused: `service account already exists: partner-sandbox`. You return to the Clients list, where the new account has no clients yet.

## Issue a client

1. Open the **⋯** menu on the service account and choose **Issue client…**.
2. Enter a **Name** for the credential and, optionally, **Expires**. Name it after the consumer that will use it, so revoking the right one later is obvious. Leave **Expires** blank for a client that lives until revoked.
3. Press **Create client**.

![The New client page for orders-reporting-bot with the name weekly-export](/img/platform/data-api/client-new.png)

The next page shows three values:

| Field | Meaning |
|---|---|
| **Client ID** | Public identifier, `egret-dataapi-` followed by a UUID. |
| **Client secret** | The secret. **Shown only once.** Press **Copy** and store it in the consumer's secret manager now. |
| **Token endpoint** | Where the client exchanges its credentials, for example `http://egret.localtest.me:8080/oauth/token`. |

Reloading the page or returning to it later shows *Client secret no longer available*: the secret cannot be read back, by design. If it is lost, revoke the client and issue another.

:::warning A new client cannot call anything yet
Egret reminds you on the page: invoke is granted per endpoint, on that endpoint's **Access** tab. Until a grant exists every call the client makes is refused with `403 not_granted`. The client also needs data access to the underlying tables in the query engine. See [Access](./endpoints/access).
:::

## Use a client

The consumer exchanges the credentials for a token, then calls an endpoint with it. The full walk-through, with a real request and response, is in [Call an endpoint with curl](./calling-endpoints). In short:

```bash
curl -s -X POST "$BASE/oauth/token" \
  -d "grant_type=client_credentials" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET"
```

## Revoke a client

1. Open the **⋯** menu on the client and choose **Revoke…**.
2. Confirm. The dialog says *Any consumer using this client immediately loses the ability to mint new tokens. This cannot be undone.*

The status becomes **Revoked**. A request for a token with a revoked secret is answered `{"error":"invalid_client"}`, exactly as for a wrong secret or an unknown client, so the response does not tell an attacker which of them it was.

:::note Revoking does not cancel a token already issued
A token is a signed, stateless credential. Revoking a client stops it minting new tokens, but a token already issued keeps working until it expires, up to 10 minutes later. In the walk-through, a token minted shortly before revocation still returned `200` afterwards. To cut a consumer off at once, remove the **grant** on the endpoint: grants are read on every request and take effect on the next call.
:::

An **Expired** client (its **Expires** date has passed) behaves like a revoked one for new tokens: on the demo stack the expired client `partner-pilot` got `{"error":"invalid_client"}`.

## Delete a service account

Choose **Delete** from the account's menu. The dialog says *This takes its grants and every client it owns with it — any consumer using one of its clients loses access immediately. The backend hard-deletes; this cannot be undone.* Revoke individual clients instead when you only want to retire one credential.

## Who can do this

Viewing accounts and clients needs `service_account:read`. Creating and deleting accounts and issuing clients needs `service_account:manage`. Issuing is gated on manage, never on read, because a client is a bearer credential for the account's data access. The built-in **ws_admin** role holds both; **ws_editor** and **ws_viewer** do not.

A platform administrator can also stop a compromised account at the source by disabling its user (`PATCH /api/control-plane/users/{id}` with `{"status":"disabled"}`, see [Access control](../control-plane/access-control)): it can then mint no further tokens. Archiving the workspace has the same effect.

## Limits and known issues

- A secret is never retrievable after creation.
- There is no secret rotation; issue a new client, move the consumer, then revoke the old one.
- Tokens last 600 seconds and cannot be refreshed. A consumer requests a new one when it expires; there is no refresh token.

## Further reading

- [Access](./endpoints/access)
- [Call an endpoint with curl](./calling-endpoints)
- [Error reference](./errors)
