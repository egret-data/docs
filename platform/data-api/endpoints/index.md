---
sidebar_position: 1
---

# Endpoints

An endpoint is one query published at one URL. This page covers the list of endpoints, how to create an endpoint, and how the editor is organised. Each editor tab has its own page.

![The endpoints list with eight endpoints: six live, one draft and one disabled](/img/platform/data-api/endpoints-list.png)

## The endpoints list

Open **Explore → Data API → Endpoints**. The list shows every endpoint in the workspace.

| Column | What it shows |
|---|---|
| **Name** | The endpoint's name, with a star to bookmark it. |
| **Method & path** | The HTTP method and the path callers append to the workspace's base URL, for example `GET /orders/by-status`. |
| **State** | **Live**, **Draft**, or **Disabled · was live** (see [lifecycle](./overview#endpoint-lifecycle)). |
| **Engine** | The engine of the endpoint's database connection, for example Trino. |
| **Last edited** | When the draft last changed. |

Above the table:

- **Search endpoints…** filters by name.
- **State** and **Engine** narrow the list. The counters under the filters (`8 endpoints total · 6 live · 1 draft · 1 disabled`) are clickable shortcuts for the State filter.
- The toolbar buttons are **Bookmarks** (show only starred endpoints), **Bulk select** (select several rows and press **Move N to Trash**), **New folder**, and **Trash**.
- **Download OpenAPI** exports an OpenAPI document; see [OpenAPI export](./openapi).
- **+ Endpoint** opens the create page.

Folders only organise the list. They are not part of the URL.

### Row actions

The **⋯** menu on a row offers:

| Action | What it does |
|---|---|
| **Open** | Opens the editor. |
| **Disable** | Takes a live endpoint out of service. Calls get `404 not_found`. Its live version and grants are kept. |
| **Enable** | Puts a disabled endpoint back, serving the version it had. Not available for an endpoint that was never published. |
| **Move to new folder…** | Creates a folder and moves the endpoint into it. With folders in the workspace the menu also offers **Move to "folder"** for each one, and **Remove from folder** for an endpoint in a folder. |
| **Move to Trash** | Soft-deletes the endpoint. Greyed out for a **Live** endpoint, with the hint *Disable it first*. |

![The row menu of the live endpoint Top customers: Open, Disable, Move to new folder and a greyed-out Move to Trash with Disable it first](/img/platform/data-api/endpoint-actions-menu.png)

In **Trash**, a row offers **Restore** (the endpoint returns **disabled**, never straight to serving) and **Delete permanently**, which cannot be undone.

## Create an endpoint

1. Go to **Explore → Data API → Endpoints** and press **+ Endpoint**.
2. Fill in **Name**, **Path**, an optional **Description**, **Method**, **Database** and **SQL**.
3. Press **Create endpoint**.

![The New endpoint page filled in for Customer spend on trino-demo](/img/platform/data-api/endpoint-new.png)

The create page collects only what an endpoint cannot exist without. Parameters, response shape, cache and limits are configured in the editor you land in next. Nothing is served yet: a new endpoint is a **Draft**.

| Field | What it does | Notes |
|---|---|---|
| **Name** | The label shown in lists, and the operation summary in the OpenAPI document. | Required. |
| **Path** | The URL path, appended to the workspace base URL. | Required. See the path rules below. |
| **Description** | What the endpoint returns and who it is for. Becomes the operation description in OpenAPI. | Optional. |
| **Method** | `GET` or `POST`. | Default `GET`. |
| **Database** | The [database connection](../workspace-settings/databases) the query runs on. | Required. Governed databases are labelled *Governed*; see [Governed connections](./governed-connections). |
| **SQL** | The query to publish. | Required. One `SELECT` (or `WITH … SELECT`). |

The page also shows a warning under **Database** when you pick a governed connection that does not run queries as the caller. Both running and publishing are refused until that is fixed.

### Path rules

Paths are validated, not rewritten. A leading slash is optional and one trailing slash is dropped, so `orders/by-status` is stored as `/orders/by-status`. Anything else out of shape is refused with a message that names the reason:

- empty segments (`a//b`) and `.` or `..` segments;
- whitespace or control characters;
- percent-encoding, query strings and fragments;
- characters outside `A-Z a-z 0-9 . _ ~ -` and `/`;
- more than 512 bytes.

A workspace can hold only one endpoint per **method and path** pair. Creating a second `GET /orders/by-status` returns `conflict: an endpoint already exists at GET /orders/by-status in this workspace`. The same path with a different method is allowed.

### What the SQL may contain

Only a single read-only statement can be published: `SELECT`, or a leading `WITH … SELECT`. These are refused when you validate or publish:

| SQL | Refusal |
|---|---|
| `DROP TABLE …`, `INSERT`, `DELETE` and any other statement | `only SELECT (or a leading WITH … SELECT) may be published; found DROP` |
| `SELECT 1; SELECT 2` | `only one statement may be published: a ; may appear only at the very end` |
| `{{ name }}` with no declared parameter `name` | `the query references {{name}} but no parameter named name is declared` |

An endpoint can run several named statements. That is configured in the editor: see [Several statements and scripted SQL](./endpoints/statements).

## The editor

Opening an endpoint shows its editor. The header carries the name, a state badge such as **Live · v2**, and **Save**. **Save** is enabled only when there are unsaved changes, and leaving with unsaved changes asks for confirmation.

| Tab | What you do there | Page |
|---|---|---|
| **Query** | Write the SQL, declare parameters, preview. | [Query with parameters](./endpoints/parameters), [Statements](./endpoints/statements) |
| **Config** | Name, method, path, cache, limits, rate limits, validate. | [Cache, limits and rate limits](./endpoints/config) |
| **Response** | See the frozen columns, set shape, naming, envelope and transform. | [Response shape](./endpoints/response) |
| **Access** | Grant service accounts permission to call it. | [Access](./endpoints/access) |
| **Try it** | Make a real call as a service account. | [Try it](./endpoints/try-it) |
| **Versions** | Publish, review history, roll back. | [Publishing](./endpoints/publishing) |

The header badge reads **Draft · never published**, **Live · v2**, **Live · v1 · unpublished changes** (the saved draft differs from what is served, as on **Top customers** in the walk-through) or **Disabled · was live**. Pressing the badge opens **Versions**.

:::caution Changing the path moves the live URL
Saving a new **Path** in **Config** changes the URL that is served immediately, before you publish. A call to the old path returns `404 not_found` while the new path answers with the live version's data. Publishing then reports the change as breaking. Treat a path change as a breaking change to make deliberately. See [Publishing](./endpoints/publishing#breaking-changes).
:::

## Limits and known issues

- An endpoint has one method and one path, and one database.
- At most 16 statements per endpoint.
- Body parameters cannot be published: every parameter is read from the query string, for both `GET` and `POST` endpoints.

## Further reading

- [Query with parameters](./endpoints/parameters)
- [Publishing, versions and rollback](./endpoints/publishing)
- [Call an endpoint with curl](./calling-endpoints)
