---
sidebar_position: 6
---

# Your first dashboard

This tutorial takes you from a database connection to a dashboard with two charts. You will connect to a query engine, run
a query, save it as a dataset, add a metric, build a bar chart and place it on a dashboard. It takes about 15 minutes.

The fastest way to follow it is the [demo stack](./run-the-demo-stack): after `just demo-up`, sign in as `admin@egret.local`
and every step below works as written, in the workspace **Default**, on the bundled Trino connection `trino-demo` with its
`tpch` sample catalog. The screenshots come from that stack.

On another installation you need a workspace where you can create content (the `ws_editor` role or higher) and a Trino or
StarRocks engine you can reach. Any table works; the steps name the places where you substitute your own.

## 1. Connect a database

On the demo stack the connection `trino-demo` is already there: skip to [step 2](#2-run-a-query). On another installation,
skip this step if your workspace already lists a connection under **Manage → Workspace settings → Engines**.

1. Go to **Manage → Workspace settings → Engines**.

   ![The Engines page lists the workspace's engine connections](/img/platform/ops/get-started/engines-page.png)

2. Press **Add connection**.
3. Fill in **Name** (for example `analytics-trino`), **Engine** (**Trino** or **StarRocks**), **Host** and **Port**. For Trino
   you can also set **User**, **HTTP scheme** (`http` or `https`), **Catalog** and **Schema**. **Add connection** stays disabled,
   with the hint *Fill in name, host, port*, until those three are set.
4. Leave **Run queries as the logged-in user**, **Per-user delegation** and **Governed data** off for now. They are covered
   in [Databases](../workspace-settings/databases).
5. If the engine needs a password, choose it under **Secret**. Saving a secret needs `EGRET_SECRETS__MASTER_KEY` to be set on
   the server.
6. Press **Add connection**. Egret checks that the engine is reachable when you save. **Test** on the connection's row
   repeats the check and shows **OK** next to the button. A new connection's **Status** says **Unknown** until it has
   been tested, and turns to **Healthy** only when you reload the page.

![The Add engine connection dialog](/img/platform/ops/get-started/add-connection.png)

:::warning An HTTP 406 or 502 when you save or test
A Trino that answers *406 Not Acceptable* needs `http-server.process-forwarded=true`. See [Engine 406 and 502
errors](../deploy-operate/troubleshooting/engine-406-502).
:::

## 2. Run a query

1. Go to **Explore → SQL Lab**. The left panel lists the connection's catalogs; pick the connection above the tree if you
   have several.
2. Type a query in the editor. This one groups the TPC-H sample orders by priority:

   ```sql
   SELECT orderpriority,
          count(*) AS orders,
          round(sum(totalprice), 2) AS revenue
   FROM tpch.tiny.orders
   GROUP BY 1
   ORDER BY 3 DESC
   ```

3. Press **Run**. The results appear under **Results**, sorted by revenue, with the run time and row count in the toolbar.

![SQL Lab with the query results](/img/platform/ops/get-started/sql-lab-run.png)

## 3. Save the query as a dataset

A dataset makes the query reusable: charts are built on datasets, not on loose queries.

1. Press **Save as dataset** in the toolbar.
2. Enter a **Name**, here `Order priority summary`, and an optional **Description**.
3. Press **Create dataset**. Egret opens the new dataset, with its three columns (`orderpriority`, `orders`, `revenue`).

![The Save as dataset dialog](/img/platform/ops/get-started/save-as-dataset.png)

## 4. Add a metric

A bar chart needs a measure for its y-axis, and a new SQL dataset has none: the chart editor says *Nothing available for
y-axis* until you add one.

1. On the dataset page open the **Metrics** tab and press **+ Metric**.
2. Enter **Metric name** `total_revenue`, **Expression** `SUM(revenue)` and **Display name** `Total revenue`.
3. Press **Save**.

![The Add metric dialog](/img/platform/ops/get-started/add-metric.png)

## 5. Build a chart

1. On the dataset page press **Create chart**.
2. On **Choose a visualization**, choose **Bar**. The editor opens with your dataset already selected.
3. On the **Data** tab, set **X-axis** to `orderpriority`, press **add y-axis** and choose **Total revenue**. With **Auto**
   on, the chart updates as you go.
4. Press **Save**. Enter a **Name** (`Revenue per order priority`) and an optional **Description**, then press **Save**.

![The bar chart editor](/img/platform/ops/get-started/bar-chart.png)

Chart names are unique within a workspace; a duplicate is rejected with *conflict: a chart with that name already exists*.
The other tabs (**Display**, **Axes**) are covered in [Charts](../explore/charts).

## 6. Build a dashboard

1. Go to **Explore → Dashboards** and press **+ Dashboard**.
2. In **New dashboard**, enter a name (`My first dashboard`) and an optional **Description**, then press **Create**. The empty
   dashboard opens.
3. Press **Edit**, then the **+** in the toolbar (**add chart**). The **Add cards** panel lists the workspace's charts; type
   in **search charts** to narrow it.
4. Select `Revenue per order priority`, then another chart (the demo has **Orders by priority**). Each click adds a card.
5. Close the panel (**×**) and drag or resize the cards, then press **Save**. While the panel is open the cards stack in one
   column and cannot be moved (KI-068).

![The dashboard editor with the Add cards panel open](/img/platform/ops/get-started/dashboard-add-chart.png)

The dashboard now shows both charts:

![The finished dashboard](/img/platform/ops/get-started/dashboard-done.png)

## What you built

| Object | Where it lives | Reuse it by |
|---|---|---|
| Database connection | **Manage → Workspace settings → Engines** | Choosing it in SQL Lab, datasets and Data API endpoints |
| Dataset with a metric | **Explore → Datasets** | Building more charts on it |
| Chart | **Explore → Charts** | Adding it to any dashboard |
| Dashboard | **Explore → Dashboards** | Sharing it, scheduling it as a report |

## Next

- Add filters and tabs: [Dashboards](../explore/dashboards)
- Email the dashboard on a schedule: [Alerts and reports](../explore/alerts-and-reports). On the demo stack the mail lands in
  Mailpit at `http://localhost:8025`.
- Control who sees it: [Shared objects](../workspace-settings/shared-objects)
