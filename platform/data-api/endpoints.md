---
sidebar_position: 2
---

# Endpoints

![The endpoints list](/img/platform/data-api-endpoints.png)

The list shows every endpoint in the workspace. **Download OpenAPI** exports an OpenAPI description of the published endpoints, and **+ Endpoint** creates one.

## Create an endpoint

![New endpoint](/img/platform/data-api-endpoint-new.png)

A new endpoint needs only a few fields. Everything else (parameters, output shape, cache, limits) is configured on the endpoint once it exists.

| Field | Meaning |
|---|---|
| **Name** | A label, for example *Daily report*. |
| **Path** | The URL path, for example `reports/daily`. |
| **Description** | Optional: what it returns and who it is for. |
| **Method** | The HTTP method, `GET` by default. |
| **Database** | The [database connection](../workspace-settings/databases) the query runs on. |
| **SQL** | The query to publish. |

Press **Create endpoint** when the form is complete.
