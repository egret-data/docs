// Creates the datasets and charts used by the Explore > Charts docs pages (platform/explore/charts/*).
// Uses the REST API with a saved Playwright storage state (no login).
// Usage: STATE=/path/state.json BASE=http://localhost:5180 node scripts/seed-charts-deep.mjs
import fs from 'node:fs';
const BASE = process.env.BASE ?? 'http://localhost:5180';
const st = JSON.parse(fs.readFileSync(process.env.STATE, 'utf8'));
const cookie = st.cookies.map((c) => `${c.name}=${c.value}`).join('; ');
const csrf = st.cookies.find((c) => c.name === 'egret_csrf')?.value;
async function api(method, path, body) {
  const r = await fetch(`${BASE}/api${path}`, {method, headers: {cookie, 'X-Egret-CSRF': csrf, 'content-type': 'application/json'}, body: body ? JSON.stringify(body) : undefined});
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} ${r.status} ${t}`);
  return t ? JSON.parse(t) : null;
}
const WS = '/ws/default';
const DB = (await api('GET', `${WS}/databases`)).find((d) => d.name === 'trino-demo').id;
const existing = await api('GET', `${WS}/datasets`);
async function dataset(name, description, sql, metrics) {
  let d = existing.find((x) => x.name === name);
  if (!d) {
    d = await api('POST', `${WS}/datasets`, {name, database_id: DB, description, source: {kind: 'virtual', sql}});
    for (const m of metrics) await api('POST', `${WS}/datasets/${d.id}/metrics`, m);
  }
  return d.id;
}
const m = (metric_name, verbose_name, expression) => ({metric_name, verbose_name, expression});
export const ids = {};
ids.orders = existing.find((x) => x.name === 'orders').id;
ids.customers = await dataset('Customers by nation', 'TPC-H customers with their nation and region', `SELECT c.custkey, c.name AS customer, n.name AS nation, r.name AS region, c.mktsegment AS segment, c.acctbal AS balance
FROM tpch.tiny.customer c JOIN tpch.tiny.nation n ON c.nationkey = n.nationkey JOIN tpch.tiny.region r ON n.regionkey = r.regionkey`,
  [m('customers', 'Customers', 'count(*)'), m('avg_balance', 'Average balance', 'avg(balance)'), m('total_balance', 'Total balance', 'sum(balance)')]);
ids.lines = await dataset('Order lines', 'TPC-H line items', `SELECT orderkey, shipmode, returnflag, linestatus, quantity, extendedprice, discount, shipdate FROM tpch.tiny.lineitem`,
  [m('line_revenue', 'Line revenue', 'sum(extendedprice * (1 - discount))'), m('items', 'Items sold', 'sum(quantity)'), m('avg_discount', 'Average discount', 'avg(discount)'), m('lines', 'Lines', 'count(*)')]);
ids.funnel = await dataset('Checkout funnel', 'Sample visitors per checkout stage (illustrative values)', `SELECT * FROM (VALUES (1,'Visited site',12400),(2,'Viewed product',8100),(3,'Added to cart',3900),(4,'Started checkout',2300),(5,'Paid',1650)) AS t(step, stage, visitors)`,
  [m('visitors', 'Visitors', 'sum(visitors)')]);
ids.flows = await dataset('Traffic flows', 'Sample visitor flows from channel to landing page (illustrative values)', `SELECT * FROM (VALUES ('Search','Home',4200),('Search','Pricing',1800),('Social','Home',2600),('Social','Blog',2100),('Email','Pricing',1900),('Email','Blog',700),('Home','Sign up',3100),('Pricing','Sign up',2400),('Blog','Sign up',650)) AS t(source, target, visits)`,
  [m('total_visits', 'Visits', 'sum(visits)')]);
ids.pnl = await dataset('Monthly profit change', 'Sample month-on-month profit movements (illustrative values)', `SELECT * FROM (VALUES ('2026-01',1200),('2026-02',640),('2026-03',410),('2026-04',-520),('2026-05',-230),('2026-06',300)) AS t(month, change)`,
  [m('profit_change', 'Profit change', 'sum(change)')]);
ids.countries = await dataset('Sales by country', 'Sample revenue and store locations per country (illustrative values)', `SELECT * FROM (VALUES ('US','United States',48200,37.09,-95.71),('CA','Canada',9100,56.13,-106.35),('BR','Brazil',7300,-14.24,-51.93),('DE','Germany',15800,51.17,10.45),('FR','France',12100,46.23,2.21),('GB','United Kingdom',13900,55.38,-3.44),('IN','India',8800,20.59,78.96),('JP','Japan',11700,36.2,138.25),('AU','Australia',6400,-25.27,133.78),('VN','Vietnam',3900,14.06,108.28),('ZA','South Africa',2100,-30.56,22.94)) AS t(code, country, revenue, lat, lon)`,
  [m('country_revenue', 'Revenue', 'sum(revenue)')]);
ids.provinces = await dataset('Sales by province', 'Sample revenue per Vietnamese province (illustrative values)', `SELECT * FROM (VALUES ('Hà Nội',9200),('TP. Hồ Chí Minh',11800),('Đà Nẵng',3100),('Hải Phòng',2700),('Cần Thơ',1900)) AS t(province, revenue)`,
  [m('province_revenue', 'Revenue', 'sum(revenue)')]);
console.log(JSON.stringify(ids, null, 1));

// ---- charts -------------------------------------------------------------------------------
const spec = (o) => ({metrics: [], dimensions: [], columns: [], filters: [], orderby: [], row_limit: 1000, rollup_groups: [], ...o});
const existingCharts = await api('GET', `${WS}/charts`);
async function chart(name, viz_type, dataset_id, specO, settings, description = '') {
  const body = {dataset_id, name, description, viz_type, params: {version: 2, spec: spec(specO), settings}};
  const found = existingCharts.find((c) => c.name === name);
  if (found) await api('PUT', `${WS}/charts/${found.id}`, body);
  else await api('POST', `${WS}/charts`, body);
  console.log(found ? 'updated chart' : 'chart', name);
}
const C = 'cartesian.';
const rev = {metrics: ['revenue'], dimensions: ['orderstatus']};
await chart('Revenue by order priority', 'bar', ids.orders, {metrics: ['revenue'], dimensions: ['orderpriority']}, {[C + 'xAxis']: 'orderpriority', [C + 'yMetrics']: ['revenue']});
await chart('Revenue by priority and status', 'bar', ids.orders, {metrics: ['revenue'], dimensions: ['orderpriority', 'orderstatus']}, {[C + 'xAxis']: 'orderpriority', [C + 'series']: 'orderstatus', [C + 'yMetrics']: ['revenue'], [C + 'stacked']: true, [C + 'showLegend']: true});
await chart('Top clerks by revenue', 'row', ids.orders, {metrics: ['revenue'], dimensions: ['clerk'], orderby: [{field: 'revenue', desc: true}], row_limit: 10}, {[C + 'xAxis']: 'clerk', [C + 'yMetrics']: ['revenue']});
await chart('Monthly revenue trend', 'line', ids.orders, {metrics: ['revenue'], dimensions: ['orderdate'], orderby: [{field: 'orderdate', desc: false}], temporal_units: {orderdate: 'month'}, row_limit: 79}, {[C + 'xAxis']: 'orderdate', [C + 'yMetrics']: ['revenue']});
await chart('Orders by quarter and priority', 'area', ids.orders, {metrics: ['order_count'], dimensions: ['orderdate', 'orderpriority'], orderby: [{field: 'orderdate', desc: false}], temporal_units: {orderdate: 'quarter'}, row_limit: 120}, {[C + 'xAxis']: 'orderdate', [C + 'series']: 'orderpriority', [C + 'yMetrics']: ['order_count'], [C + 'stacked']: true});
await chart('Customer balance vs size by nation', 'scatter', ids.customers, {metrics: ['avg_balance', 'customers', 'total_balance'], dimensions: ['nation']}, {[C + 'xAxis']: 'nation', [C + 'xMetric']: 'avg_balance', [C + 'yMetrics']: ['customers'], [C + 'bubbleMetric']: 'total_balance'});
await chart('Revenue and orders by month', 'combo', ids.orders, {metrics: ['revenue', 'order_count'], dimensions: ['orderdate'], orderby: [{field: 'orderdate', desc: false}], temporal_units: {orderdate: 'year'}}, {[C + 'xAxis']: 'orderdate', [C + 'yMetrics']: ['revenue', 'order_count'], [C + 'seriesTypes']: {revenue: 'bar', order_count: 'line'}, [C + 'rightAxisMetrics']: ['order_count']});
await chart('Order mix by priority', 'pie', ids.orders, {metrics: ['order_count'], dimensions: ['orderpriority']}, {'pie.dimensions': ['orderpriority'], 'pie.metric': 'order_count', 'pie.donut': true});
await chart('Orders by priority and status', 'pie', ids.orders, {metrics: ['order_count'], dimensions: ['orderpriority', 'orderstatus']}, {'pie.dimensions': ['orderpriority', 'orderstatus'], 'pie.metric': 'order_count'});
await chart('Total revenue', 'scalar', ids.orders, {metrics: ['revenue'], row_limit: 1}, {'scalar.metric': 'revenue', 'scalar.label': 'All-time revenue', 'scalar.segments': [{min: null, max: 2000000000, color: '#ef4444', label: 'Below plan'}, {min: 2000000000, max: null, color: '#16a34a', label: 'On plan'}]});
await chart('Orders against target', 'progress', ids.orders, {metrics: ['order_count'], row_limit: 1}, {'progress.metric': 'order_count', 'progress.goal': 20000});
await chart('Average discount', 'gauge', ids.lines, {metrics: ['avg_discount'], row_limit: 1}, {'gauge.metric': 'avg_discount', 'gauge.segments': [{min: 0, max: 0.03, color: '#ef4444', label: 'Low'}, {min: 0.03, max: 0.07, color: '#f59e0b', label: 'Target'}, {min: 0.07, max: 0.1, color: '#22c55e', label: 'High'}]});
await chart('Checkout conversion', 'funnel', ids.funnel, {metrics: ['visitors'], dimensions: ['stage'], orderby: [{field: 'visitors', desc: true}]}, {'funnel.dimension': 'stage', 'funnel.metric': 'visitors'});
await chart('Profit bridge', 'waterfall', ids.pnl, {metrics: ['profit_change'], dimensions: ['month'], orderby: [{field: 'month', desc: false}]}, {'waterfall.xAxis': 'month', 'waterfall.metric': 'profit_change'});
await chart('Revenue vs last month', 'smartscalar', ids.orders, {metrics: ['revenue'], dimensions: ['orderdate'], orderby: [{field: 'orderdate', desc: false}], temporal_units: {orderdate: 'month'}, row_limit: 79}, {'smartscalar.dimension': 'orderdate', 'smartscalar.metric': 'revenue', 'smartscalar.comparisons': [{id: 'c1', type: 'previousPeriod'}, {id: 'c2', type: 'staticNumber', value: 30000000, label: 'Monthly goal'}]});
await chart('Line price spread by ship mode', 'boxplot', ids.lines, {columns: ['shipmode', 'extendedprice'], row_limit: 5000}, {'boxplot.category': 'shipmode', 'boxplot.value': 'extendedprice'});
await chart('Visitor flow', 'sankey', ids.flows, {metrics: ['total_visits'], dimensions: ['source', 'target']}, {'sankey.source': 'source', 'sankey.target': 'target', 'sankey.metric': 'total_visits'});
await chart('Customers by region', 'table', ids.customers, {metrics: ['customers', 'avg_balance'], dimensions: ['region', 'segment']}, {'table.columns': ['region', 'segment'], 'table.metrics': ['customers', 'avg_balance'], column_settings: {avg_balance: {column_title: 'Average balance', number_style: 'currency', currency: 'USD', decimals: 0}}, conditional_formatting: [{columns: ['customers'], type: 'single', operator: '>', value: 65, color: '#f59e0b'}, {columns: ['avg_balance'], type: 'range', colors: ['#ffffff', '#3b82f6'], min_type: null, max_type: null}]});
await chart('Customers by region and segment', 'pivot_table', ids.customers, {metrics: ['customers'], dimensions: ['region', 'segment'], rollup_groups: [['region'], ['segment']]}, {'pivot.rows': ['region'], 'pivot.cols': ['segment'], 'pivot.metrics': ['customers']});
await chart('Order record', 'object', ids.orders, {columns: ['orderkey', 'custkey', 'orderstatus', 'totalprice', 'orderdate', 'orderpriority', 'clerk'], row_limit: 50}, {'object.columns': ['orderkey', 'custkey', 'orderstatus', 'totalprice', 'orderdate', 'orderpriority', 'clerk']});
await chart('Revenue by country', 'map', ids.countries, {metrics: ['country_revenue'], dimensions: ['code']}, {'map.key': 'world', 'map.type': 'region', 'map.region': 'code', 'map.metric': 'country_revenue'});
await chart('Revenue by province', 'map', ids.provinces, {metrics: ['province_revenue'], dimensions: ['province']}, {'map.key': 'vietnam', 'map.type': 'region', 'map.region': 'province', 'map.metric': 'province_revenue'});
await chart('Store locations', 'map', ids.countries, {columns: ['lat', 'lon', 'country']}, {'map.key': 'world', 'map.type': 'pin', 'map.latitude_column': 'lat', 'map.longitude_column': 'lon', 'map.label_column': 'country'});
