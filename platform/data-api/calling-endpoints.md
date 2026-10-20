---
sidebar_position: 4
---

# Call an endpoint with curl

This page walks through a complete call from a terminal: get a token, call an endpoint with parameters, read the response, and recognise what each failure looks like. Every request and response below was captured from the demo workspace.

## Before you start

You need:

- a **published** endpoint (here, `GET /orders/by-status`);
- a [service account with an OAuth2 client](./clients), and its `client_id` and `client_secret`;
- an invoke [grant](./endpoints/access) for that service account on the endpoint;
- the base URL of your deployment. On the Docker demo stack it is `http://egret.localtest.me:8080` (or the port set in `DEMO_PORT`).

Set them as shell variables:

```bash
export BASE=http://egret.localtest.me:8080
export WS=default
export CLIENT_ID=egret-dataapi-cf9e7fe8-f970-45af-901d-66a9a24b9ab7
export CLIENT_SECRET='…the secret shown once when the client was issued…'
```

:::tip
The **Try it** tab prints the exact `curl` command for a call, with a `$TOKEN` placeholder. Copy it from there. See [Try it](./endpoints/try-it).
:::

## Get a token

Egret uses the OAuth2 `client_credentials` grant. Post the credentials as a **form** to `/oauth/token`.

```bash
curl -s -X POST "$BASE/oauth/token" \
  -d "grant_type=client_credentials" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET"
```

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs…",
  "token_type": "Bearer",
  "expires_in": 600
}
```

The token is valid for **600 seconds**. There is no refresh token: when it expires, request another with the same credentials. A client library should cache the token and renew it a little before `expires_in`.

Keep the token in a variable:

```bash
TOKEN=$(curl -s -X POST "$BASE/oauth/token" \
  -d grant_type=client_credentials -d client_id=$CLIENT_ID -d client_secret=$CLIENT_SECRET \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["access_token"])')
```

The token endpoint accepts a form body with `client_id` and `client_secret` fields. It does not accept HTTP Basic authentication or a JSON body: `client_credentials requires client_id and client_secret` and `Form requests must have Content-Type: application/x-www-form-urlencoded` are the respective answers. A wrong secret, an unknown client, a revoked or expired client all answer `401 {"error":"invalid_client"}`.

## Call an endpoint

The URL is `{base}/data-api/v1/{workspace}/{path}`, where `{path}` is the endpoint's **Path** without the leading slash.

```bash
curl -s "$BASE/data-api/v1/$WS/orders/by-status" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "status": "ok",
  "message": null,
  "data": [
    { "status": "F", "revenue": 1.03568102349e+9, "order_count": 7304 },
    { "status": "O", "revenue": 1.02837633121e+9, "order_count": 7333 },
    { "status": "P", "revenue": 6.333947532e+7, "order_count": 363 }
  ],
  "meta": {
    "version": 2,
    "cached": false,
    "request_id": "2fcb3aad-5c85-4d10-a4cb-03a675ccd6ad",
    "row_count": 3,
    "columns": [
      { "name": "status", "ty": "varchar(1)", "required": true },
      { "name": "revenue", "ty": "double", "required": true },
      { "name": "order_count", "ty": "bigint", "required": true }
    ]
  }
}
```

The same call a second time within the endpoint's cache TTL returns `"cached": true`.

### Pass parameters

Parameters go in the query string, for `GET` and `POST` endpoints alike. A request body is not read.

```bash
curl -s "$BASE/data-api/v1/$WS/orders/by-status?priority=2-HIGH&min_total=100000" \
  -H "Authorization: Bearer $TOKEN"
```

Rules to remember (see [Query with parameters](./endpoints/parameters) for the full list):

- Percent-encode values. `+` decodes to a space; send a literal plus as `%2B`.
- Repeat a key to send a list: `?statuses=O&statuses=P`.
- Keys the endpoint does not declare are ignored. An empty value (`?priority=`) is not "absent" and is usually refused.
- A `POST` endpoint is called with `curl -X POST` and the same query string. A `GET` request to a `POST` endpoint is `404 not_found`.

### Several statements

An endpoint with several statements answers with an object keyed by statement name:

```bash
curl -s "$BASE/data-api/v1/$WS/orders/page?since=1998-06-01&after=5000000" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{ "status": "ok", "message": null,
  "data": { "rows": [], "total": [{ "total": 386 }] },
  "meta": { "version": 1, "cached": false, "request_id": "d64e5b95-…", "statements": { "rows": { "row_count": 0 }, "total": { "row_count": 1 } } } }
```

### Pin a version

Add `-H "X-Egret-Version: 1"` to keep calling an older frozen contract. See [Publishing](./endpoints/publishing#pin-a-consumer-to-a-version).

## Read the service account's own contract

Without a path, the base URL returns an OpenAPI document listing exactly the endpoints this token's service account may invoke:

```bash
curl -s "$BASE/data-api/v1/$WS" -H "Authorization: Bearer $TOKEN"
```

See [OpenAPI export](./openapi).

## Errors

Every failure has the same body: `status` is `"error"`, `message` is a sentence for people, and `error.code` is the stable value to branch on. The HTTP status mirrors it. Quote `error.request_id` in a support request: it matches a row in [Activity](./activity).

**Missing or bad token: `401 key_invalid`**

```bash
curl -s -i "$BASE/data-api/v1/$WS/orders/by-status"
```

```json
{"status":"error","message":"authentication failed","error":{"code":"key_invalid","message":"authentication failed","request_id":"dc510e52-d59c-4209-8437-92c32778d96d"}}
```

**No grant: `403 not_granted`.** A service account `partner-sandbox` with a valid token but no grant:

```json
{"status":"error","message":"this service account is not granted access to this endpoint; ask the endpoint's owner to grant it","error":{"code":"not_granted","message":"this service account is not granted access to this endpoint; ask the endpoint's owner to grant it","request_id":"d8e6bbd3-4acb-4fb8-b69e-1aa3a88cd9cc"}}
```

**Bad parameter: `400 param_invalid`.** `?priority=9-X` where `priority` is an enum:

```json
{"status":"error","message":"a parameter value is not valid for this endpoint","error":{"code":"param_invalid","message":"a parameter value is not valid for this endpoint","request_id":"6a534646-c135-4720-a469-319ab4d65dad"}}
```

The message does not name the parameter, on purpose.

**Missing required parameter: `400 param_missing`**, **unknown path: `404 not_found`**, **version not available: `409 version_unavailable`** (`X-Egret-Version: 7` when only versions 1 and 2 exist).

The complete list is in the [error reference](./errors).

## Rate limits

When an endpoint has a rate limit and a caller exceeds it, Egret answers `429 rate_limited` with a `Retry-After` header in seconds:

```text
HTTP/1.1 429 Too Many Requests
content-type: application/json
retry-after: 1
```

On the walk-through endpoint (**Per caller (qps)** 5, **Burst** 10), thirty simultaneous requests from one client produced 10 to 12 `200` answers and the rest `429`. A client should wait the `Retry-After` interval and retry, with a little jitter:

```bash
for i in 1 2 3; do
  code=$(curl -s -o /tmp/out.json -D /tmp/headers -w '%{http_code}' \
    "$BASE/data-api/v1/$WS/orders/by-status" -H "Authorization: Bearer $TOKEN")
  [ "$code" != 429 ] && break
  sleep "$(grep -i '^retry-after:' /tmp/headers | tr -dc '0-9')"
done
```

`503 overloaded` also carries `Retry-After`: Egret shed the request because it was at its concurrency limit. It clears by itself.

## Limits and known issues

- Tokens last 600 seconds and cannot be refreshed.
- The token endpoint takes form-encoded credentials only.
- A request body larger than the serving surface accepts answers `413 payload_too_large`.

## Further reading

- [Clients](./clients)
- [Error reference](./errors)
- [OpenAPI export](./openapi)
