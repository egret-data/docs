---
sidebar_position: 2
---

# Write an app

You write an app in marimo's own editor, opened inside Egret. This page covers the Egret side of authoring: how the draft is saved, the `egret_marimo` Python module that queries data as the viewer, and what the apps runtime allows.

:::warning Not run locally
The marimo editor needs an edit pod, which needs Kubernetes (or a local launcher). The demo instance has neither, so the editor never loaded and this page is written from the source code (`egret_marimo` in `apps-image/`, the apps crate and the editor page), plus the draft REST API, which was run. Behaviour inside marimo itself is marimo's, documented at [marimo.io](https://docs.marimo.io).
:::

![The editor page header with Versions, Reload editor and Publish draft rev 2, and the apps-origin error shown when no pod is available](/img/platform/apps/edit-unavailable.png)

## Open the editor

Open **Explore → Apps**, open the **⋯** menu of an app and choose **Edit**, or press **+ App** to create one and land in its editor.

The page has a header and an iframe below it.

| Header element | What it shows or does |
|---|---|
| Back arrow | Returns to the Apps list. |
| App name and badge | **Draft only** until the first publish, then **Published vN**. |
| **Draft revision N** | The draft's revision number. It increases every time the draft is saved. |
| *Save in the editor (Ctrl/⌘+S) before publishing.* | A reminder: publishing freezes the **saved** draft. |
| **Versions** | Opens the version history. See [Publish and version an app](./publishing). |
| **Reload editor** | Reloads the iframe with a fresh session. Use it if the editor stops responding. |
| **Publish draft rev N** | Publishes the saved draft as a new version. |

While the editor starts you see *Starting your editor…* and *The first open after a while can take up to a minute.* The editor is marimo's own interface, not Egret's, so it does not use Egret's theme beyond light or dark.

The first time an author opens an edit session Egret starts one pod for that author in that workspace. It is stopped after 30 minutes of inactivity by default, and the next open starts it again.

If the editor cannot open, the page shows one of these messages instead:

| Message | Meaning |
|---|---|
| *You can't edit this app* | You lack permission to write this app, or to run queries in this workspace. Ask a workspace admin. |
| *App not found* | The app was deleted or belongs to another workspace. |
| *This app can't be opened right now* | The app is in the trash. |
| *Apps are not set up on this deployment* | The apps origin is not configured. An operator needs to set `apps.origin`. |

## The draft

The source of an app is one Python file, stored as the **draft** in the database. Saving in marimo updates the draft and increases its revision. Two rules protect it:

- **One author at a time per revision.** A save names the revision it started from. If someone else saved in between, Egret answers `409` with `the draft changed since it was read` and the current revision, instead of overwriting. Reload the editor and merge by hand. There is no real-time collaboration and no locking.
- **1 MiB of source at most.** A larger save is refused with `413`.

The draft can also carry the grid layout marimo keeps beside the source.

## Query data with `egret_marimo`

Apps import the `egret_marimo` module, already installed in the pod image, which is a fixed set of packages. You cannot install packages at runtime; the image is curated so that egress can be closed to Egret only.

```python
import egret_marimo as egret
```

| Function | What it does |
|---|---|
| `egret.connect(database, dialect="sql")` | Returns a DB-API 2.0 connection for the database named `database` (its name in **Workspace settings → Engines**). marimo SQL cells list it and can use it. |
| `egret.sql(query, database, params=())` | Runs `query` and returns a Polars `DataFrame`. `params` is a list of values bound to `?` markers in order. |
| `egret.databases()` | Returns `(name, engine)` pairs for pickers. **Edit mode only**: a viewer's session gets a `403`, because listing a workspace's databases is an admin act. An app that needs the names when viewed carries them in its source. |

For example:

```python
import marimo as mo
import egret_marimo as egret

status = mo.ui.dropdown(["O", "F", "P"], value="O", label="Order status")
df = egret.sql(
    "SELECT orderpriority, count(*) AS orders FROM tpch.tiny.orders "
    "WHERE orderstatus = ? GROUP BY 1 ORDER BY 1",
    database="trino-demo",
    params=[status.value],
)
mo.vstack([mo.md("# Revenue explorer"), status, df])
```

This is the source of the **Revenue explorer** app in the walk-through. It was saved to the draft and published through the REST API; the rows it returns could not be viewed because the app could not be opened.

### Errors

A failed query raises `GatewayError` with a `status` and a `detail`. `SessionExpired` is raised when the viewer's session token has expired; the viewer reloads the app. A network failure raises `GatewayError` with status `0`.

### What the gateway allows

Every `egret.sql` call goes to Egret's query gateway with the viewer's token. The gateway checks, in order:

1. The token is valid and unexpired, otherwise `401`.
2. The caller's rate limit: 20 calls per token per 2 seconds by default, otherwise `429`.
3. The viewer is still an active user, the app is not deleted and the workspace has **Apps** enabled.
4. The viewer may read the app (run mode), or may write it and run queries (edit mode).
5. The database name exists in the token's workspace. An unknown name and a name in another workspace give the same `404`.
6. The SQL is **read-only**.

The read-only rule is strict. The SQL must be exactly one statement that is positively known to read. These are refused, with a message that starts `data apps may only read data:`:

- anything other than `SELECT` or `WITH … SELECT`, such as `INSERT`, `DELETE` or DDL;
- more than one statement;
- table functions (Trino's `TABLE(catalog.system.query(...))` can pass arbitrary SQL to the underlying database);
- MySQL executable comments (`/*! … */`), `#` comments, comments with a nested `/*`, and quoting forms the engine may read differently.

SQL that cannot be parsed is refused too, because it cannot be shown to be read-only: *rewrite it in standard SQL*.

| Gateway limit | Default |
|---|---|
| Rows returned per query | 10,000 |
| Engine timeout per query | 60 seconds |
| Calls per token | 20 per 2 seconds |
| Token idle lifetime | 30 minutes (sliding) |
| Token absolute lifetime | 8 hours |

These are operator settings under `[apps]` (`max_rows`, `timeout_secs`, `rate_max`, `rate_window_secs`, `session_idle_secs`, `session_absolute_secs`). Only Trino and StarRocks connections can be queried.

## Limits and known issues

- The editor and the running app could not be opened in the demo environment, so none of the marimo-side behaviour on this page was observed.
- No packages can be installed from an app; the image is fixed.
- There is no real-time co-editing; the second author to save gets a `409`.

## Further reading

- [Publish and version an app](./publishing)
- [Access and data](./access-and-data)
- [marimo documentation](https://docs.marimo.io)
