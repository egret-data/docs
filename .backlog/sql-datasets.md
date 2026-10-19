# Backlog: SQL Lab and Datasets & metrics (area `sql-datasets`)

Findings from writing the detailed pages. Recorded, not fixed. Severity: S1 blocks a task, S2 wrong or misleading with a workaround, S3 polish.

| Area | Type | Sev | Description | Evidence (page/URL/steps) |
|---|---|---|---|---|
| SQL Lab | UX | S2 | A cancelled run leaves the Results panel on "No results yet." with no badge or message; only History shows status *cancelled*. | Run `SELECT count(*) FROM tpch.sf1000.lineitem l JOIN tpch.sf1000.orders o ON l.orderkey = o.orderkey`, press **Cancel**. |
| SQL Lab | Bug | S2 | The command palette shortcut (Cmd/Ctrl K) does not open while the text cursor is in the editor: Monaco treats it as a chord prefix. It only works with focus outside the editor. The hint "⌘ K for commands" is therefore misleading. | Click in the editor, press Cmd+K: nothing opens. Click the results area, press it: opens. |
| SQL Lab | Gap | S2 | A saved query's SQL cannot be overwritten. **Save** always creates a new saved query; **Edit** changes only name and description. | Saved tab, hover a row, **Edit** shows Name and Description only. |
| SQL Lab | UX | S2 | A single SELECT/WITH is wrapped in `SELECT * FROM (...) LIMIT n`, so the engine returns exactly n rows with `truncated=false`. The "Results were limited" chip never appears for it, so a cut result looks complete. Only non-SELECT statements (`TABLE`, `SHOW`) show the chip. | `select * from tpch.sf1.orders` with limit 1,000: 1,000 rows, no chip; `TABLE tpch.sf1.orders`: chip shown. |
| SQL Lab | UX | S3 | Switching to another tab and back discards the result grid, status and parameter values (the tab body is remounted). | Run a query, press **+**, click the first tab: "No results yet." |
| SQL Lab | UX | S3 | Opening a saved query gives a tab titled "Saved" instead of the query's name. | Saved tab, click a row. |
| SQL Lab | UX | S3 | Clicking a table or column in the Explorer appends the name with no separator: `SELECT` becomes `SELECTtpch.tiny.nation`. | Type `SELECT`, click a table. |
| SQL Lab | UX | S3 | A zero-row result shows the filter message `No rows match “”.` | Run a query with an empty-string parameter: 0 rows. |
| SQL Lab | UX | S3 | Errors found before the query starts (bad parameter, forbidden) appear as a toast with raw JSON: `Error: {"error":"invalid input: parameter 'n' is not a number: abc"}`. | Parameter type **num**, value `abc`, **Run**. |
| SQL Lab | UX | S3 | Engine error positions are one line too high for wrapped queries (a typo on line 1 is reported on line 2); some messages carry a doubled prefix `engine: engine:` (dataset create, refresh, metric and column validation). | `SELECT ... FROM tpch.tiny.ordres` shows `line 2:35`. `POST /datasets` with bad SQL returns `engine: engine: line 2:14`. |
| SQL Lab | Bug | S3 | Previewing a table from the Explorer submits the query twice (two identical History rows). Probably React StrictMode on the dev server; not checked in a production build. | History after one **Preview**. |
| SQL Lab | UX | S3 | Download JSON and Copy export only the rows loaded in the grid (first 1,000, after filter), while Download CSV exports the full result. Nothing says so except the small "interactive over first 1,000 rows" note. | Run a query returning 5,000 rows; Download JSON. |
| SQL Lab | Gap | S3 | Autocomplete does not resolve table aliases (`o.` suggests tables) and only knows Explorer nodes that were expanded. | Expand `orders`, type `SELECT orders.` (works) vs `FROM orders o ... o.` (does not). |
| SQL Lab | UX | S3 | Deleting a snippet has no confirmation (saved queries do). | Snippets tab, hover, bin. |
| SQL Lab | UX | S3 | History cannot be cleared and is capped at 50 per user, so test runs push useful entries out. | History tab. |
| SQL Lab | UX | S3 | Saved-query folders can only be created from a row's "Move to new folder…"; there is no New folder button as on the Datasets list. | Saved tab. |
| SQL Lab | UX | S3 | The tab rename box does not select the existing text, so typing appends to it. | Double-click a tab title and type. |
| SQL Lab | Bug | S2 | **Save as dataset** fails for SQL ending in a semicolon (works in SQL Lab) and returns HTTP 500 "internal error" for duplicate column names. | `select 1 as x;`; `select 1 as x, 2 as x`. |
| Datasets | Bug | S2 | The **Dimension** and **Filter** switches are stored but not read by the chart builder or the backend: a column with Dimension off still appears in the X-axis picker. | Dataset "Orders with customers": `orderkey` has Dimension off and is offered as X-axis in a new Bar chart. |
| Datasets | Gap | S3 | The roles **Category** and **Country** have no consumer in the frontend (only Currency, Email, URL, Image, Latitude, Longitude do). | Source search for `semantic_type`. |
| Datasets | Bug | S2 | Deleting a dataset (header trash button or **Delete permanently**) also deletes every chart built on it. The confirmation says only that the table is not affected. | Create a dataset and a chart on it, delete the dataset: the chart returns 404. |
| Datasets | Bug | S2 | Renaming a metric that charts use breaks those charts (`unknown metric: old_name`); deleting a used metric is allowed without warning. | Edit a metric's name; run a chart that uses it. |
| Datasets | Bug | S3 | A metric whose expression is not an aggregate (for example `totalprice`) is accepted and only fails inside a chart: `'totalprice' must be an aggregate expression or appear in GROUP BY clause`. | Add metric `plain` = `totalprice`. |
| Datasets | Bug | S3 | `POST /datasets/{id}/columns` accepts an empty column name (the UI blocks it). I could not delete the resulting column through the API (empty path segment). | API call with `column_name: ""`. |
| Datasets | UX | S3 | **Refresh** silently resets the **Time** switch of every column to what the engine type says. | Turn Time on for a varchar column, **Refresh**. |
| Datasets | UX | S3 | Table chart headers and the Preview tab show the column name, not the **Display name**, while the chart editor field lists show the Display name. | "Orders by size band" chart: header `order_size`, Display name "Order size". |
| Datasets | Gap | S3 | Calculated columns and metrics cannot reference calculated columns (the check probes the source columns only), and the dialog does not say so. | Formula `net_price * 2` fails with `Column 'net_price' cannot be resolved`. |
| Datasets | UX | S3 | **Delete** on a calculated column and on a metric acts with no confirmation. | Columns and Metrics tabs. |
| Datasets | Gap | S3 | **Preview** omits calculated columns. | Preview of "Orders with customers" has 8 columns; the dataset has 10. |
| Datasets | Gap | S3 | Metric certification details cannot be entered in the UI (the switch reuses the stored details). | Metrics tab, Certified switch. |
| Datasets | Gap | S3 | **Usage** lists charts only, not the dashboards that contain them. | Usage tab. |
| Datasets | Docs | S3 | OpenAPI says the update/refresh/delete endpoints return 403 "or not the dataset owner", but the handlers only check `dataset:manage` on the object. | `crates/egret-bi/src/routes.rs`, `ds_remove`. |
| Datasets | UX | S3 | **Duplicate** is only offered for virtual datasets; there is no way to copy a physical dataset's column settings and metrics. | Row menu. |
| Datasets | UX | S3 | Trashing a dataset hides it but its charts keep running; nothing tells the owner of those charts. | Trash a dataset with a chart; the chart still returns rows. |
| Platform | Infra | S3 | Worktrees that symlink the shared `node_modules` share one webpack cache, so a build in one worktree compiled another worktree's pages and failed. A per-worktree `node_modules` directory of symlinks fixes it. | `npm run build` in a worktree with a symlinked `node_modules`. |
