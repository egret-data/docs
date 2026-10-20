// Fills the Datasets, Charts and SQL Lab lists so their screenshots show a realistic workspace: folders,
// bookmarks, one item in each Trash, extra saved queries (one in a folder) and snippets. Idempotent by name.
// Run after scripts/seed-sql-datasets.mjs and scripts/seed-charts-deep.mjs.
// Usage: STATE=<playwright storage state> BASE=http://egret.localtest.me:18080 node scripts/seed-sql-charts-lists.mjs
import {api} from './api-helper.mjs';
const a = await api(process.env.STATE);
const WS = '/api/ws/default';
const must = (r, what) => { if (r.status >= 300) throw new Error(`${what}: ${r.status} ${JSON.stringify(r.body)}`); return r.body; };
const db = (await a.get(`${WS}/databases`)).body.find((d) => d.name === 'trino-demo');

async function folder(kind, name) {
  const list = must(await a.get(`${WS}/folders/${kind}`), `folders ${kind}`);
  return list.find((f) => f.name === name) ?? must(await a.post(`${WS}/folders/${kind}`, {name}), `folder ${name}`);
}
const byName = (list, name) => list.find((x) => x.name === name);

// ---- datasets: two folders, bookmarks, one trashed virtual dataset
let datasets = must(await a.get(`${WS}/datasets`), 'datasets');
const sales = await folder('datasets', 'Sales analytics');
const samples = await folder('datasets', 'Sample data');
for (const n of ['Orders with customers', 'Line items', 'Order lines']) {
  const d = byName(datasets, n);
  if (d && d.folder_id !== sales.id) must(await a.patch(`${WS}/datasets/${d.id}/folder`, {folder_id: sales.id}), `move ${n}`);
}
for (const n of ['Checkout funnel', 'Traffic flows', 'Monthly profit change', 'Sales by country', 'Sales by province']) {
  const d = byName(datasets, n);
  if (d && d.folder_id !== samples.id) must(await a.patch(`${WS}/datasets/${d.id}/folder`, {folder_id: samples.id}), `move ${n}`);
}
for (const n of ['Orders with customers', 'Customers by nation']) {
  const d = byName(datasets, n);
  if (d && !d.bookmarked) must(await a.post(`${WS}/datasets/${d.id}/bookmark`), `bookmark ${n}`);
}
const trashedDs = 'Old order extract';
const trashedList = must(await a.get(`${WS}/datasets?trashed=true`), 'trashed datasets');
if (!byName(trashedList, trashedDs)) {
  const d = byName(datasets, trashedDs) ?? must(await a.post(`${WS}/datasets`, {
    name: trashedDs, description: 'Superseded by Orders with customers.', database_id: db.id,
    source: {kind: 'virtual', sql: 'SELECT orderkey, orderdate, totalprice FROM tpch.tiny.orders'},
  }), 'dataset old');
  must(await a.post(`${WS}/datasets/${d.id}/trash`), 'trash dataset');
}

// ---- charts: two folders, bookmarks, one trashed chart
const charts = must(await a.get(`${WS}/charts`), 'charts');
const kpis = await folder('charts', 'KPIs');
const sample = await folder('charts', 'Chart gallery');
const moves = {
  [kpis.id]: ['Total revenue', 'Orders against target', 'Average discount', 'Revenue vs last month'],
  [sample.id]: ['Checkout conversion', 'Profit bridge', 'Visitor flow', 'Revenue by country', 'Revenue by province', 'Store locations'],
};
for (const [fid, names] of Object.entries(moves)) {
  for (const n of names) {
    const c = byName(charts, n);
    if (c && c.folder_id !== fid) must(await a.patch(`${WS}/charts/${c.id}/folder`, {folder_id: fid}), `move ${n}`);
  }
}
for (const n of ['Monthly revenue trend', 'Revenue by priority and status', 'Total revenue']) {
  const c = byName(charts, n);
  if (c && !c.bookmarked) must(await a.post(`${WS}/charts/${c.id}/bookmark`), `bookmark ${n}`);
}
const trashedChart = 'Revenue by clerk (old)';
const trashedCharts = must(await a.get(`${WS}/charts?trashed=true`), 'trashed charts');
if (!byName(trashedCharts, trashedChart)) {
  const orders = byName(datasets, 'orders');
  const c = byName(charts, trashedChart) ?? must(await a.post(`${WS}/charts`, {
    dataset_id: orders.id, name: trashedChart, viz_type: 'bar',
    params: {version: 2, settings: {'cartesian.xAxis': 'clerk', 'cartesian.yMetrics': ['revenue']},
      spec: {metrics: ['revenue'], dimensions: ['clerk'], columns: [], filters: [], orderby: [], row_limit: 20, rollup_groups: []}},
  }), 'chart old');
  must(await a.post(`${WS}/charts/${c.id}/trash`), 'trash chart');
}

// ---- SQL Lab: more saved queries (two in a folder) and snippets
const saved = must(await a.get(`${WS}/sqllab/queries`), 'saved');
const more = [
  ['Orders per year', 'Order count and revenue per calendar year.',
    'SELECT year(orderdate) AS order_year,\n       count(*) AS orders,\n       round(sum(totalprice), 2) AS revenue\nFROM tpch.tiny.orders\nGROUP BY 1\nORDER BY 1'],
  ['Late shipments by ship mode', 'Line items received after the commit date, per ship mode.',
    'SELECT shipmode,\n       count(*) AS late_lines\nFROM tpch.tiny.lineitem\nWHERE receiptdate > commitdate\nGROUP BY 1\nORDER BY 2 DESC'],
  ['Customers per nation', 'Customer count per nation and region.',
    'SELECT r.name AS region,\n       n.name AS nation,\n       count(*) AS customers\nFROM tpch.tiny.customer c\nJOIN tpch.tiny.nation n ON c.nationkey = n.nationkey\nJOIN tpch.tiny.region r ON n.regionkey = r.regionkey\nGROUP BY 1, 2\nORDER BY 1, 2'],
  ['Orders above a minimum', 'Parametrised: orders of one status above a minimum total. Usual values: F, 300000.',
    'SELECT orderkey, orderstatus, totalprice\nFROM tpch.tiny.orders\nWHERE orderstatus = {{status}}\n  AND totalprice > {{min_total}}'],
];
for (const [name, description, sql] of more) {
  if (!byName(saved, name)) must(await a.post(`${WS}/sqllab/queries`, {database_id: db.id, name, description, sql}), `saved ${name}`);
}
const finance = await folder('saved_queries', 'Finance');
const savedNow = must(await a.get(`${WS}/sqllab/queries`), 'saved');
for (const n of ['Revenue by order status', 'Orders per year']) {
  const q = byName(savedNow, n);
  if (q && q.folder_id !== finance.id) must(await a.patch(`${WS}/sqllab/queries/${q.id}/folder`, {folder_id: finance.id}), `move ${n}`);
}
const snips = must(await a.get(`${WS}/sqllab/snippets`), 'snippets');
for (const [name, description, body] of [
  ['Customer join', 'Join orders to their customer.', 'JOIN tpch.tiny.customer c ON o.custkey = c.custkey'],
  ['Nation and region join', 'Add nation and region names to customers.', 'JOIN tpch.tiny.nation n ON c.nationkey = n.nationkey\nJOIN tpch.tiny.region r ON n.regionkey = r.regionkey'],
]) {
  if (!byName(snips, name)) must(await a.post(`${WS}/sqllab/snippets`, {name, description, body}), `snippet ${name}`);
}
console.log('lists seeded');
