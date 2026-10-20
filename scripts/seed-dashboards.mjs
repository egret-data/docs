// Seeds the demo charts and three dashboards used by the Dashboards docs (scripts/shots/dashboards.mjs).
// Usage: BASE=http://egret.localtest.me:18080 STATE=<playwright storage-state json with a logged-in admin session> node scripts/seed-dashboards.mjs
// Idempotent by name: existing objects with the same name are updated, never duplicated.
// Requires the `orders` dataset (metrics `revenue`, `order_count`) from scripts/seed-demo.sh.
import {readFileSync} from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5180';
const WS = process.env.WS ?? 'default';
const st = JSON.parse(readFileSync(process.env.STATE, 'utf8'));
const host = new URL(BASE).hostname;
const jar = st.cookies.filter((c) => c.domain.replace(/^\./, '') === host);
const cookie = jar.map((c) => `${c.name}=${c.value}`).join('; ');
const csrf = jar.find((c) => c.name === 'egret_csrf')?.value;

async function api(method, path, body) {
  const r = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {cookie, 'X-Egret-CSRF': csrf, 'content-type': 'application/json'},
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} ${r.status} ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
}

const datasets = await api('GET', `/ws/${WS}/datasets`);
const orders = datasets.find((d) => d.name === 'orders');
if (!orders) throw new Error('dataset "orders" not found');

const spec = (o) => ({columns: [], filters: [], metrics: [], orderby: [], row_limit: 1000, dimensions: [], rollup_groups: [], ...o});
const defs = [
  {name: 'Revenue KPI', viz_type: 'scalar', params: {version: 2, spec: spec({metrics: ['revenue'], row_limit: 1}), settings: {'scalar.metric': 'revenue'}}},
  {name: 'Orders KPI', viz_type: 'scalar', params: {version: 2, spec: spec({metrics: ['order_count'], row_limit: 1}), settings: {'scalar.metric': 'order_count'}}},
  {name: 'Revenue trend', viz_type: 'line', params: {version: 2,
    spec: spec({metrics: ['revenue'], dimensions: ['orderdate', 'orderstatus'], orderby: [{field: 'orderdate', desc: false}], temporal_units: {orderdate: 'month'}}),
    settings: {'cartesian.xAxis': 'orderdate', 'cartesian.series': 'orderstatus', 'cartesian.yMetrics': ['revenue'], 'cartesian.showLegend': true}}},
  {name: 'Revenue by priority', viz_type: 'bar', params: {version: 2,
    spec: spec({metrics: ['revenue'], dimensions: ['orderpriority', 'orderstatus']}),
    settings: {'cartesian.xAxis': 'orderpriority', 'cartesian.series': 'orderstatus', 'cartesian.stacked': true, 'cartesian.yMetrics': ['revenue'], 'cartesian.showLegend': true}}},
  {name: 'Revenue by status', viz_type: 'bar', params: {version: 2,
    spec: spec({metrics: ['revenue'], dimensions: ['orderstatus'], orderby: [{field: 'orderstatus', desc: false}]}),
    settings: {'cartesian.xAxis': 'orderstatus', 'cartesian.yMetrics': ['revenue']}}},
  {name: 'Priority mix', viz_type: 'pie', params: {version: 2,
    spec: spec({metrics: ['order_count'], dimensions: ['orderpriority']}),
    settings: {'pie.donut': true, 'pie.metric': 'order_count', 'pie.dimensions': ['orderpriority']}}},
  {name: 'Top clerks', viz_type: 'row', params: {version: 2,
    spec: spec({metrics: ['revenue'], dimensions: ['clerk'], orderby: [{field: 'revenue', desc: true}], row_limit: 10}),
    settings: {'cartesian.xAxis': 'clerk', 'cartesian.yMetrics': ['revenue']}}},
  {name: 'Largest orders', viz_type: 'table', params: {version: 2,
    spec: spec({columns: ['orderkey', 'orderdate', 'orderstatus', 'orderpriority', 'totalprice'], orderby: [{field: 'totalprice', desc: true}], row_limit: 50}),
    settings: {}}},
];
const existing = await api('GET', `/ws/${WS}/charts`);
const chart = {};
for (const d of defs) {
  const body = {dataset_id: orders.id, name: d.name, viz_type: d.viz_type, params: d.params};
  const hit = existing.find((c) => c.name === d.name);
  chart[d.name] = hit
    ? (await api('PUT', `/ws/${WS}/charts/${hit.id}`, body)).id ?? hit.id
    : (await api('POST', `/ws/${WS}/charts`, body)).id;
}
console.log('charts', chart);

// ---- dashboards ----
const P = {
  date: {id: 'p-date', name: 'Order date', slug: 'order_date', type: 'date', operator: 'range',
    default: ['1995-01-01', '1996-12-31']},
  status: {id: 'p-status', name: 'Status', slug: 'status', type: 'category', operator: 'is', widget: 'dropdown', isMultiSelect: true},
  priority: {id: 'p-priority', name: 'Priority', slug: 'priority', type: 'category', operator: 'is', widget: 'dropdown',
    filteringParameters: ['p-status']},
  grain: {id: 'p-grain', name: 'Time grouping', slug: 'grain', type: 'temporal_unit', operator: 'is', default: 'month'},
};
const card = (name, x, y, w, h, options = {}, tab = null) => ({chart_id: chart[name], card_type: 'chart', grid_col: x, grid_row: y, size_x: w, size_y: h, options, tab_index: tab});
const virt = (type, x, y, w, h, options, tab = null) => ({chart_id: null, card_type: type, grid_col: x, grid_row: y, size_x: w, size_y: h, options, tab_index: tab});

const dashboards = [
  {
    name: 'Sales performance', description: 'Revenue and order volume by status, priority and month.',
    width: 'full', parameters: [P.date, P.status, P.priority, P.grain],
    tabs: [{name: 'Overview', position: 0}, {name: 'Orders', position: 1}],
    cards: [
      virt('heading', 0, 0, 24, 1, {text: 'Revenue'}, 0),
      card('Revenue trend', 0, 1, 15, 7, {description: 'Revenue per period and order status. Change **Time grouping** to re-bucket.',
        paramMappings: {'p-date': 'orderdate', 'p-status': 'orderstatus', 'p-grain': 'orderdate'}}, 0),
      virt('text', 15, 1, 9, 7, {text: '## How to read this\n\nSelected status: {{status}}\n\nUse the filters above to slice the cards. Click a bar in *Revenue by priority* to cross-filter **Priority**.'}, 0),
      card('Revenue by priority', 0, 8, 12, 7, {paramMappings: {'p-date': 'orderdate', 'p-status': 'orderstatus', 'p-priority': 'orderpriority'},
        clickBehavior: {type: 'crossfilter', parameterMapping: {'p-priority': 'orderpriority'}}}, 0),
      card('Priority mix', 12, 8, 6, 7, {paramMappings: {'p-priority': 'orderpriority'}, hideEmpty: true}, 0),
      card('Top clerks', 18, 8, 6, 7, {title: 'Top 10 clerks'}, 0),
      virt('heading', 0, 0, 24, 1, {text: 'Order detail'}, 1),
      card('Largest orders', 0, 1, 24, 10, {title: 'Largest orders', paramMappings: {'p-date': 'orderdate', 'p-status': 'orderstatus', 'p-priority': 'orderpriority'}}, 1),
    ],
  },
  {
    name: 'Executive summary', description: 'Headline numbers on a fixed-width canvas.',
    width: 'fixed', parameters: [],
    tabs: [],
    cards: [
      virt('heading', 0, 0, 24, 1, {text: 'Executive summary'}),
      card('Revenue KPI', 0, 1, 12, 3, {title: 'Total revenue'}),
      card('Orders KPI', 12, 1, 12, 3, {title: 'Total orders'}),
      card('Revenue trend', 0, 4, 24, 7, {title: 'Monthly revenue by status'}),
      virt('link', 0, 11, 8, 1, {url: 'https://docs.example.com/finance/definitions', label: 'How revenue is defined'}),
    ],
  },
  {
    name: 'Order operations', description: 'Working view for the order desk, with a filter placed on the card it affects.',
    width: 'full', parameters: [P.status, P.priority],
    tabs: [],
    cards: [
      virt('heading', 0, 0, 24, 1, {text: 'Order operations'}),
      card('Revenue by priority', 0, 1, 12, 7, {paramMappings: {'p-status': 'orderstatus', 'p-priority': 'orderpriority'}, inlineParameters: ['p-priority']}),
      card('Priority mix', 12, 1, 12, 7, {paramMappings: {'p-priority': 'orderpriority'},
        clickBehavior: {type: 'url', template: 'https://tickets.example.com/search?priority={{value}}'}}),
      card('Largest orders', 0, 8, 24, 9, {paramMappings: {'p-status': 'orderstatus', 'p-priority': 'orderpriority'}}),
    ],
  },
  {
    name: 'Weekly sales review', description: 'What changed in sales since last week.',
    width: 'fixed', parameters: [], tabs: [],
    cards: [
      virt('heading', 0, 0, 24, 1, {text: 'Weekly sales review'}),
      card('Revenue KPI', 0, 1, 12, 3, {title: 'Revenue'}),
      card('Orders KPI', 12, 1, 12, 3, {title: 'Orders'}),
      card('Revenue trend', 0, 4, 16, 7),
      virt('text', 16, 4, 8, 7, {text: '### This week\n\n- Revenue is **up** on urgent orders\n- Partial shipments are still above 100\n- Next review: Monday 09:00\n\nSee the [order desk](./) for detail.'}),
      virt('iframe', 0, 11, 12, 6, {iframe: 'https://www.youtube.com/embed/dQw4w9WgXcQ'}),
      card('Revenue by status', 12, 11, 12, 6, {title: 'Revenue by status'}),
    ],
  },
  {name: 'Regional review (draft)', description: '', width: 'fixed', parameters: [], tabs: [], cards: []},
];
const existingD = await api('GET', `/ws/${WS}/dashboards`);
for (const d of dashboards) {
  const hit = existingD.find((x) => x.name === d.name);
  const id = hit ? hit.id : (await api('POST', `/ws/${WS}/dashboards`, {name: d.name, description: d.description})).id;
  await api('PUT', `/ws/${WS}/dashboards/${id}`, d);
  console.log('dashboard', d.name, id);
}

// ---- folders, a bookmark and a certified dashboard ----
const folders = await api('GET', `/ws/${WS}/folders/dashboards`);
const folderId = async (name) =>
  (folders.find((f) => f.name === name) ?? (await api('POST', `/ws/${WS}/folders/dashboards`, {name}))).id;
const after = await api('GET', `/ws/${WS}/dashboards`);
const byName = (n) => after.find((x) => x.name === n);
await api('PATCH', `/ws/${WS}/dashboards/${byName('Executive summary').id}/folder`, {folder_id: await folderId('Finance')});
await api('PATCH', `/ws/${WS}/dashboards/${byName('Order operations').id}/folder`, {folder_id: await folderId('Operations')});
if (!byName('Sales performance').bookmarked) await api('POST', `/ws/${WS}/dashboards/${byName('Sales performance').id}/bookmark`);
const exec = byName('Executive summary');
if (!exec.certified) await api('PUT', `/ws/${WS}/dashboards/${exec.id}/certification`, {certified: true, details: 'Reviewed by Finance for the Q3 board pack.'});
console.log('folders, bookmark and certification done');

// ---- one trashed dashboard, for the Trash view ----
const trashedName = 'Retired pipeline report';
const trashedList = await api('GET', `/ws/${WS}/dashboards?trashed=true`);
if (!trashedList.some((x) => x.name === trashedName)) {
  const t = await api('POST', `/ws/${WS}/dashboards`, {name: trashedName, description: 'Replaced by Order operations.'});
  await api('POST', `/ws/${WS}/dashboards/${t.id}/trash`);
}
console.log('trash done');

// ---- object grants for the Sharing page ----
const grant = (kind, id, body) => api('PUT', `/ws/${WS}/objects/${kind}/${id}/grants`, body);
const folderList = await api('GET', `/ws/${WS}/folders/dashboards`);
const finance = folderList.find((f) => f.name === 'Finance');
await grant('dashboard', byName('Sales performance').id, {principal_type: 'group', principal_id: 'data-team', role: 'ws_viewer', effect: 'allow'});
await grant('dashboard', byName('Sales performance').id, {principal_type: 'user', principal_id: 'member-sso@egret.local', role: 'ws_editor', effect: 'allow', expires_at: '2027-12-31T23:59:59Z'});
await grant('folder', finance.id, {principal_type: 'group', principal_id: 'data-team', role: 'ws_viewer', effect: 'allow'});
await grant('dashboard', byName('Executive summary').id, {principal_type: 'user', principal_id: 'tester@egret.local', role: 'ws_editor', effect: 'deny'});
console.log('grants done');
