---
sidebar_position: 7
---

# Activity

**Activity** is the access log of the Data API: every call to one of the workspace's endpoints, with its status, duration and whether the cache answered. Use it to see who is calling what, find the call behind an error report, and spot an endpoint that has started to fail.

![The Activity page for 24h: 282 calls, a 20.2% error rate shown as Failing, latency and cache-hit tiles, the per-endpoint table with No matching endpoint last, and the newest calls including 429 rate_limited](/img/platform/data-api/activity.png)

Open **Explore → Data API → Activity**.

## Choose a range

The range buttons **1h**, **24h**, **7d** and **30d** set the period every figure on the page covers. The default is **24h**.

Call data is kept for a retention window, **90 days** by default. The line under the buttons reads *Data is kept for 90 days*. A range longer than the retention is disabled so a thinning tail of old data is never mistaken for falling traffic.

## Summary tiles

| Tile | What it shows |
|---|---|
| **Calls** | The number of calls in the range. |
| **Error rate** | The share of calls with an error status. Shown in red with a **Failing** label at 5% or more, with an **Elevated** label below that when there is any error, and in green when there are none. |
| **Latency** | The median and 95th percentile response time, `p50 / p95`, across **successful** calls, in milliseconds. A burst of failures cannot pull it down. |
| **Cache-hit rate** | Cache hits as a share of the calls the cache could serve (calls to endpoints that have the cache on). `—` when no call was cacheable. |

## Per endpoint

The **Per endpoint** table repeats the figures for each endpoint: **Calls**, **Error rate**, **p50 / p95** and **Cache-hit rate**. Press an endpoint's name to filter the calls list below to that endpoint.

The last row, **No matching endpoint**, groups every request that matched no endpoint: a wrong path, a disabled endpoint, a caller with the wrong method. Those calls are in the total but in no endpoint's row, so rows can add up to less than the total. In the walk-through, the `404 not_found` calls to a path that was not yet published all landed here.

## Calls

The **Calls** list shows individual requests, newest first, fifty at a time. Press **Load more** for the next page.

| Column | What it shows |
|---|---|
| **Time** | When the call arrived, as a relative time. |
| **Endpoint** | The endpoint's name, or `METHOD path` for a call that matched none. |
| **Status** | The HTTP status as a badge, with the `error_code` beside it, for example `403 not_granted`. |
| **Duration** | How long the call took. |
| **Cache** | **Hit** or **Miss**. |
| **Client** | The `client_id` that made the call, with a copy button. |
| **Request ID** | The call's request id, with a copy button. It is the `meta.request_id` or `error.request_id` the consumer received. |

### Filters

| Filter | What it does |
|---|---|
| **Endpoint** | Limit to one endpoint, or **All endpoints**. |
| **Status code** | Limit to one HTTP status, for example `404`. |
| **Error code** | Limit to one `error_code`, for example `rate_limited`. |
| **Request ID** | Look up one call from an error body. Paste the `request_id` a consumer gives you. |
| **Include trial runs** | Also show calls made from the endpoint editor's **Try it** tab. Off by default, so the page shows real consumer traffic. A trial is marked with a **Trial** badge and the email of the person who ran it (a shortened user id for a viewer who may not list the platform's users, KI-296). |

When the filters match nothing the page says so; with no calls at all it offers **View endpoints**.

## Find the call behind an error

1. Ask the consumer for the `request_id` in the error body.
2. Open **Activity**, choose a range that covers it, and paste it into **Request ID**.
3. The row shows the endpoint, the status and error code, the duration and which client made it.
4. Open the endpoint to check its **Config**, or use **Try it** to reproduce the call as the same service account.

## Alert on what you see

The same measurements are available to alerts: error rate, error count, call count, p50 and p95 latency, and the count of a specific error code. Create one with **+ Data API alert** under **Explore → Alerts & Reports**; see [Data API alerts](../explore/alerts-and-reports/data-api-alerts). Alerts exclude trial runs, as this page does by default.

## Limits and known issues

- The page shows aggregates for the whole range you chose. It does not draw a graph over time.
- Rows older than the retention window are deleted. If retention is set to `0`, nothing is pruned.
- Latency is of successful calls only, so an endpoint that fails fast can show a healthy latency next to a high error rate.

## Further reading

- [Data API alerts](../explore/alerts-and-reports/data-api-alerts)
- [Error reference](./errors)
- [Try it](./endpoints/try-it)
