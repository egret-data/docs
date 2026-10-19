// Seeds the SQL Lab / dataset demo objects used by the sql-datasets docs screenshots (idempotent by name).
// Usage: STATE=<playwright storage state> BASE=http://localhost:5180 node scripts/seed-sql-datasets.mjs
import {api} from './api-helper.mjs';
const a = await api(process.env.STATE);
const WS = '/api/ws/default';
const must = (r, what) => { if (r.status >= 300) throw new Error(`${what}: ${r.status} ${JSON.stringify(r.body)}`); return r.body; };
const dbId = (await a.get(`${WS}/databases`)).body.find((d) => d.name === 'trino-demo').id;

// ---- saved queries + snippets
const saved = (await a.get(`${WS}/sqllab/queries`)).body;
const sq = [
  ['Revenue by order status', 'Total price and order count per order status (tpch tiny).',
   'SELECT orderstatus,\n       count(*) AS orders,\n       round(sum(totalprice), 2) AS revenue\nFROM tpch.tiny.orders\nGROUP BY 1\nORDER BY 3 DESC'],
  ['Top customers by spend', 'Ten customers with the highest total order value.',
   'SELECT c.name AS customer,\n       c.mktsegment,\n       round(sum(o.totalprice), 2) AS spend\nFROM tpch.tiny.orders o\nJOIN tpch.tiny.customer c ON o.custkey = c.custkey\nGROUP BY 1, 2\nORDER BY 3 DESC\nLIMIT 10'],
];
for (const [name, description, sql] of sq) {
  if (!saved.some((s) => s.name === name)) must(await a.post(`${WS}/sqllab/queries`, {database_id: dbId, name, description, sql}), 'saved query');
}
const snips = (await a.get(`${WS}/sqllab/snippets`)).body;
const sn = [
  ['Orders in 1997', 'Date filter for the tpch orders table.', "o.orderdate >= DATE '1997-01-01' AND o.orderdate < DATE '1998-01-01'"],
  ['Revenue expression', 'Net revenue after discount for lineitem.', 'sum(l.extendedprice * (1 - l.discount))'],
];
for (const [name, description, body] of sn) {
  if (!snips.some((s) => s.name === name)) must(await a.post(`${WS}/sqllab/snippets`, {name, description, body}), 'snippet');
}

// ---- datasets
const list = (await a.get(`${WS}/datasets`)).body;
async function ensure(name, description, source) {
  const hit = list.find((d) => d.name === name);
  if (hit) return (await a.get(`${WS}/datasets/${hit.id}`)).body;
  return must(await a.post(`${WS}/datasets`, {name, description, database_id: dbId, source}), `dataset ${name}`);
}
const owc = await ensure('Orders with customers', 'Every order joined to the customer who placed it, with the customer market segment.', {
  kind: 'virtual',
  sql: 'SELECT o.orderkey,\n       o.orderdate,\n       o.orderstatus,\n       o.orderpriority,\n       o.totalprice,\n       c.name AS customer_name,\n       c.mktsegment AS market_segment,\n       c.acctbal AS customer_balance\nFROM tpch.tiny.orders o\nJOIN tpch.tiny.customer c ON o.custkey = c.custkey',
});
const li = await ensure('Line items', 'One row per order line (tpch tiny lineitem).', {kind: 'physical', catalog: 'tpch', schema: 'tiny', table: 'lineitem'});
console.log(owc.id, li.id);

// ---- column settings, calculated columns and metrics (idempotent)
const money = JSON.stringify({currency: 'USD', decimals: 2, number_style: 'currency'});
const pct = JSON.stringify({decimals: 1, number_style: 'percent'});
const int0 = JSON.stringify({decimals: 0});
async function col(id, name, body) { must(await a.put(`${WS}/datasets/${id}/columns/${name}`, body), `column ${name}`); }
async function calc(id, d, column_name, expression, verbose_name, description) {
  if (d.columns.some((c) => c.column_name === column_name)) return;
  must(await a.post(`${WS}/datasets/${id}/columns`, {column_name, expression, verbose_name, description}), `calc ${column_name}`);
}
async function metric(id, d, metric_name, expression, verbose_name, description, format) {
  if (d.metrics.some((m) => m.metric_name === metric_name)) return;
  must(await a.post(`${WS}/datasets/${id}/metrics`, {metric_name, expression, verbose_name, description, format}), `metric ${metric_name}`);
}
let d = (await a.get(`${WS}/datasets/${owc.id}`)).body;
await calc(owc.id, d, 'order_year', 'year(orderdate)', 'Order year', 'Calendar year the order was placed.');
await calc(owc.id, d, 'order_size', "CASE WHEN totalprice >= 300000 THEN 'Large' WHEN totalprice >= 100000 THEN 'Medium' ELSE 'Small' END", 'Order size', 'Large from 300,000, medium from 100,000, otherwise small.');
await col(owc.id, 'totalprice', {verbose_name: 'Order total', description: 'Total price of the order, before tax.', format: money});
await col(owc.id, 'customer_name', {verbose_name: 'Customer', description: 'Name of the customer who placed the order.'});
await col(owc.id, 'market_segment', {verbose_name: 'Market segment', semantic_type: 'category', description: 'Customer market segment.'});
await col(owc.id, 'customer_balance', {verbose_name: 'Customer balance', semantic_type: 'currency', filterable: false, description: 'Account balance of the customer.'});
await col(owc.id, 'orderkey', {groupby: false, verbose_name: 'Order ID'});
await col(owc.id, 'orderdate', {verbose_name: 'Order date', format: JSON.stringify({date_style: 'MMM D, YYYY'})});
await metric(owc.id, d, 'revenue', 'SUM(totalprice)', 'Revenue', 'Sum of order totals.', money);
await metric(owc.id, d, 'order_count', 'COUNT(*)', 'Orders', 'Number of orders.', int0);
await metric(owc.id, d, 'customers', 'COUNT(DISTINCT customer_name)', 'Customers', 'Distinct customers with at least one order.', int0);
await metric(owc.id, d, 'avg_order_value', 'AVG(totalprice)', 'Average order value', 'Mean order total.', money);
await metric(owc.id, d, 'large_order_share', "AVG(CASE WHEN totalprice >= 300000 THEN 1.0 ELSE 0.0 END)", 'Large-order share', 'Share of orders that are large.', pct);
d = (await a.get(`${WS}/datasets/${li.id}`)).body;
await calc(li.id, d, 'net_price', 'extendedprice * (1 - discount)', 'Net price', 'Extended price after discount.');
await metric(li.id, d, 'net_revenue', 'SUM(extendedprice * (1 - discount))', 'Net revenue', 'Revenue after discount.', money);
await metric(li.id, d, 'quantity_sold', 'SUM(quantity)', 'Quantity sold', 'Units shipped.', int0);
await col(li.id, 'shipdate', {verbose_name: 'Ship date'});
console.log('seeded');

// ---- certification (platform_admin holds dataset:certify)
d = (await a.get(`${WS}/datasets/${owc.id}`)).body;
if (!d.certified) must(await a.put(`${WS}/datasets/${owc.id}/certification`, {certified: true, details: 'Reviewed by the data team; matches the finance revenue report.'}), 'certify');
const rev = d.metrics.find((m) => m.metric_name === 'revenue');
if (rev && !rev.certified) must(await a.put(`${WS}/datasets/${owc.id}/metrics/${rev.id}/certification`, {certified: true, details: 'Official revenue definition.'}), 'certify metric');

// ---- two charts on the virtual dataset, so its Usage tab has rows
const charts = (await a.get(`${WS}/charts`)).body;
const spec = (metrics, dimensions) => ({metrics, dimensions, columns: [], filters: [], orderby: [], row_limit: 1000, rollup_groups: []});
for (const [name, viz, m, dim] of [
  ['Revenue by market segment', 'bar', ['revenue'], ['market_segment']],
  ['Orders by size band', 'table', ['order_count', 'avg_order_value'], ['order_size']],
]) {
  if (!charts.some((c) => c.name === name)) {
    must(await a.post(`${WS}/charts`, {dataset_id: owc.id, name, viz_type: viz, params: {version: 2, settings: {}, spec: spec(m, dim)}}), `chart ${name}`);
  }
}
console.log('charts ok');

// ---- query history: a few realistic runs so the History tab does not show test noise (history keeps the last 50)
if (process.env.SEED_HISTORY) {
  const hist = [
    "SELECT nationkey, name, regionkey FROM tpch.tiny.nation ORDER BY name",
    "SELECT orderpriority, count(*) AS orders FROM tpch.tiny.orders GROUP BY 1 ORDER BY 2 DESC",
    "SELECT c.mktsegment, round(sum(o.totalprice), 2) AS revenue FROM tpch.tiny.orders o JOIN tpch.tiny.customer c ON o.custkey = c.custkey GROUP BY 1 ORDER BY 2 DESC",
    "SELECT orderstatus, count(*) FROM tpch.tiny.ordres GROUP BY 1",
    "SELECT year(orderdate) AS order_year, count(*) AS orders FROM tpch.tiny.orders GROUP BY 1 ORDER BY 1",
  ];
  for (const sql of hist) {
    const r = await a.post(`${WS}/queries`, {database_id: dbId, sql, limit: 1000, params: []});
    await new Promise((res) => setTimeout(res, 1200));
    console.log('history', r.status);
  }
}
