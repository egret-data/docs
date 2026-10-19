---
sidebar_position: 1
---

# SQL Lab

SQL Lab is the interactive query editor. It is the default page when you open a workspace.

![SQL Lab with results](/img/platform/explore-sql-lab-results.png)

## Run a query

1. Pick a database in the schema browser (the left panel). It lists the engine's catalogs; expand one to browse schemas and tables, or use **Search tables…**.
2. Type SQL in the editor.
3. Choose a **Limit** (default 1,000 rows) and press **Run**.

Results appear below the editor in a table with column types, a **Filter rows…** box, and **Copy** and **Export** actions. The status badge shows duration and row count, for example *Done in 1.2 s · 3 rows*. Switch the results between **Table** and **Chart**.

If a query fails, the error from the engine is shown in full with a **Copy** button.

## Tabs, history and saved queries

Each tab (**Query 1**, **+**) is an independent editor. Below the editor, **History** lists past runs, **Saved** lists saved queries and **Snippets** holds reusable fragments.

## Format and save

- **Format** reformats the SQL.
- **Save** stores the query.
- **Save as dataset** turns the query into a [virtual dataset](./datasets-and-metrics) you can build charts on.

:::note Running as the signed-in user
Whether queries run as the platform or as you depends on the [database connection](../workspace-settings/databases) settings (*Run queries as the logged-in user*, *Per-user delegation*).
:::
