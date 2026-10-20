// Seeds the Data Apps behind the apps pages and screenshots (scripts/shots/apps.mjs) on the Docker demo stack.
// Idempotent: apps are looked up by name, and an app that exists is left alone (prints "exists").
//
//   BASE=http://egret.localtest.me:18080 STATE=<storage-state.json> node scripts/seed-apps.mjs
//
// STATE is a Playwright storage state of a signed-in workspace admin. The apps query the demo database
// `trino-demo` (TPC-H `tpch.tiny`). The demo Data Apps image has altair and plotly but no numpy or pandas,
// so the charts use altair (plotly.express needs numpy).
import {request} from 'playwright';
import {readFileSync} from 'node:fs';

const BASE = process.env.BASE ?? 'http://egret.localtest.me:18080';
const WS = process.env.WS ?? 'default';
const state = JSON.parse(readFileSync(process.env.STATE, 'utf8'));
const csrf = state.cookies.find((c) => c.name === 'egret_csrf')?.value ?? '';
const ctx = await request.newContext({baseURL: BASE, storageState: process.env.STATE, extraHTTPHeaders: {'X-Egret-CSRF': csrf}});
const A = `/api/ws/${WS}/apps`;
async function call(method, url, data, headers = {}) {
  const r = await ctx.fetch(url, {method, headers, ...(data === undefined ? {} : {data})});
  const t = await r.text();
  if (r.status() >= 300) throw new Error(`${method} ${url}: ${r.status()} ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
}

const HEADER = `import marimo

__generated_with = "0.25.0"
app = marimo.App(width="medium")
`;
const FOOTER = `

if __name__ == "__main__":
    app.run()
`;
const cell = (args, body, ret = '') => `\n\n@app.cell\ndef _(${args}):\n${body.replace(/^/gm, '    ')}\n    return${ret ? ` ${ret}` : ''}\n`;
const app = (...cells) => HEADER + cells.join('') + FOOTER;

const imports = cell('', 'import marimo as mo\nimport egret_marimo as egret\nimport altair as alt', '(alt, egret, mo)');
const statusPicker = cell(
  'mo',
  'status = mo.ui.dropdown(\n    {"Open": "O", "Fulfilled": "F", "Partly shipped": "P"},\n    value="Open",\n    label="Order status",\n)\nstatus',
  '(status,)',
);
const byPriority = cell(
  'egret, status',
  'df = egret.sql(\n    "SELECT orderpriority AS priority, count(*) AS orders, "\n    "round(sum(totalprice), 2) AS revenue "\n    "FROM tpch.tiny.orders WHERE orderstatus = ? GROUP BY 1 ORDER BY 1",\n    database="trino-demo",\n    params=[status.value],\n)',
  '(df,)',
);
const revenueV1 = app(
  imports,
  cell('mo', 'mo.md(r"""\n# Revenue explorer\n""")'),
  statusPicker,
  byPriority,
  cell('df, mo', 'mo.ui.table(df, selection=None)'),
);
const revenueV2 = app(
  imports,
  cell('mo', 'mo.md(r"""\n# Revenue explorer\n\nRevenue by order priority for one order status. Every query runs as the person viewing the app.\n""")'),
  statusPicker,
  byPriority,
  cell(
    'alt, df, mo',
    'chart = (\n    alt.Chart(df)\n    .mark_bar()\n    .encode(x=alt.X("priority:N", title="Priority"), y=alt.Y("revenue:Q", title="Revenue"), tooltip=["priority", "orders", "revenue"])\n    .properties(height=260, width=440)\n)\nmo.hstack([mo.ui.table(df, selection=None), mo.ui.altair_chart(chart)], widths=[2, 3])',
  ),
);

const trends = app(
  imports,
  cell('mo', 'mo.md(r"""\n# Order trends\n\nOrders and revenue per month for one year.\n""")'),
  cell('mo', 'year = mo.ui.dropdown([str(y) for y in range(1992, 1999)], value="1995", label="Year")\nyear', '(year,)'),
  cell(
    'egret, year',
    'monthly = egret.sql(\n    "SELECT month(orderdate) AS month, count(*) AS orders, "\n    "round(sum(totalprice) / 1e6, 2) AS revenue_m "\n    "FROM tpch.tiny.orders WHERE year(orderdate) = ? GROUP BY 1 ORDER BY 1",\n    database="trino-demo",\n    params=[int(year.value)],\n)',
    '(monthly,)',
  ),
  cell(
    'mo, monthly, year',
    'mo.hstack(\n    [\n        mo.stat(value=f"{monthly[\'orders\'].sum():,}", label=f"Orders in {year.value}"),\n        mo.stat(value=f"{monthly[\'revenue_m\'].sum():,.1f} M", label="Revenue"),\n        mo.stat(value=f"{monthly[\'orders\'].max():,}", label="Most orders in one month"),\n    ],\n    justify="start",\n)',
  ),
  cell(
    'alt, mo, monthly',
    'line = (\n    alt.Chart(monthly)\n    .mark_line(point=True)\n    .encode(x=alt.X("month:O", title="Month"), y=alt.Y("orders:Q", title="Orders"), tooltip=["month", "orders", "revenue_m"])\n    .properties(height=240, width=560)\n)\nmo.ui.altair_chart(line)',
  ),
);

const lookup = app(
  imports,
  cell('mo', 'mo.md(r"""\n# Customer lookup\n\nEvery order of one customer, newest first.\n""")'),
  cell('mo', 'customer = mo.ui.number(start=1, stop=1500, value=370, label="Customer key")\ncustomer', '(customer,)'),
  cell(
    'customer, egret',
    'orders = egret.sql(\n    "SELECT orderkey, orderdate, orderstatus, orderpriority, totalprice "\n    "FROM tpch.tiny.orders WHERE custkey = ? ORDER BY orderdate DESC",\n    database="trino-demo",\n    params=[int(customer.value)],\n)',
    '(orders,)',
  ),
  cell('mo, orders', 'mo.vstack([mo.md(f"**{orders.height} orders**"), mo.ui.table(orders, selection=None, page_size=10)])'),
);

const draftOnly = app(
  imports,
  cell('mo', 'mo.md(r"""\n# Shipping modes\n\nWork in progress: not published yet.\n""")'),
);

const existing = await call('GET', A);
async function ensure(name, description, steps) {
  if (existing.find((x) => x.name === name)) {
    console.log(`exists app ${name}`);
    return;
  }
  const created = await call('POST', A, {name, description});
  for (const s of steps) await s(created.id);
  console.log(`created app ${name}`);
}
const save = (source) => async (id) => {
  const d = await call('GET', `${A}/${id}/draft`);
  await call('PUT', `${A}/${id}/draft`, {source}, {'If-Match': String(d.revision)});
};
const publish = async (id) => {
  const d = await call('GET', `${A}/${id}/draft`);
  await call('POST', `${A}/${id}/publish`, {expected_revision: d.revision});
};
const restore = (n) => async (id) => {
  const v = (await call('GET', `${A}/${id}/versions`)).find((x) => x.version_no === n);
  await call('POST', `${A}/${id}/versions/${v.id}/restore`, {});
};
const share = (principal_type, principal_id, role, extra = {}) => async (id) =>
  call('PUT', `/api/ws/${WS}/objects/app/${id}/grants`, {principal_type, principal_id, role, ...extra});

// A folder for the two sales apps, so the list shows grouping.
async function folder(name) {
  const list = await call('GET', `/api/ws/${WS}/folders/apps`);
  return list.find((f) => f.name === name) ?? (await call('POST', `/api/ws/${WS}/folders/apps`, {name}));
}
const sales = await folder('Sales analysis');
const intoSales = async (id) => call('PATCH', `${A}/${id}/folder`, {folder_id: sales.id});
const bookmark = async (id) => call('POST', `${A}/${id}/bookmark`, {});

await ensure('Revenue explorer', 'Revenue by order priority for one order status', [
  save(revenueV1),
  publish,
  save(revenueV2),
  publish,
  restore(1),
  restore(2),
  share('group', 'finance-analysts', 'ws_viewer'),
  share('user', 'carla.mendes@egret.local', 'ws_editor'),
  share('group', 'marketing', 'ws_editor', {effect: 'deny', expires_at: '2027-03-31T00:00:00Z'}),
  intoSales,
  bookmark,
]);
await ensure('Order trends', 'Orders and revenue per month for a chosen year', [save(trends), publish, intoSales]);
await ensure('Customer lookup', 'Every order of one customer', [save(lookup), publish]);
await ensure('Shipping modes', 'Work in progress', [save(draftOnly)]);
console.log('seeded apps');
