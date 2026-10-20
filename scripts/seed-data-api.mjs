// Seeds the Data API objects behind the data-api pages and screenshots (scripts/shots/data-api.mjs) on the
// Docker demo stack. Idempotent: every object is looked up by name or path first, and each step only runs
// when its result is missing, so a second run changes nothing (it prints "exists" per object).
//
//   BASE=http://egret.localtest.me:18080 STATE=<storage-state.json> node scripts/seed-data-api.mjs
//   ... TRAFFIC=1 node scripts/seed-data-api.mjs     # also makes real calls so Activity has data
//
// STATE is a Playwright storage state of a signed-in workspace admin (the login endpoint is rate limited, so
// sign in once and reuse it). Client secrets are shown only once; the ones this script issues are kept in
// SECRETS (default: a file in the system temp dir, never the repo) so TRAFFIC can mint tokens on a later run.
// The names are the ones the pages use; nothing else on the demo stack creates Data API objects.
import {api} from './api-helper.mjs';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const BASE = process.env.BASE ?? 'http://egret.localtest.me:18080';
const WS = process.env.WS ?? 'default';
const SECRETS = process.env.SECRETS ?? join(tmpdir(), 'egret-docs-data-api-secrets.json');
const a = await api(process.env.STATE, BASE);
const ws = (p) => `/api/ws/${WS}/data-api/${p}`;
const must = (r, what) => {
  if (r.status >= 300) throw new Error(`${what}: ${r.status} ${JSON.stringify(r.body).slice(0, 400)}`);
  return r.body;
};
const secrets = existsSync(SECRETS) ? JSON.parse(readFileSync(SECRETS, 'utf8')) : {};

const db = (await a.get(`/api/ws/${WS}/databases`)).body.find((d) => d.name === 'trino-demo');
if (!db) throw new Error('database trino-demo not found (run the demo seed first)');

// ---- Service accounts and clients -------------------------------------------------------------------
const accounts = {};
for (const [name, description] of [
  ['orders-reporting-bot', 'Nightly orders report for the finance team'],
  ['partner-sandbox', 'External partner, read access to nothing yet'],
  ['finance-dashboard', 'Read-only reporting for the finance team'],
]) {
  const list = must(await a.get(ws('service-accounts')), 'list service accounts');
  let sa = list.find((s) => s.name === name);
  if (!sa) sa = must(await a.post(ws('service-accounts'), {name, description}), `create ${name}`);
  else console.log(`exists service account ${name}`);
  accounts[name] = sa;
}

async function client(account, name, {revoke = false, expires_at} = {}) {
  const sa = accounts[account];
  const list = must(await a.get(ws(`service-accounts/${sa.id}/clients`)), 'list clients');
  let c = list.find((x) => x.name === name);
  if (!c) {
    c = must(await a.post(ws(`service-accounts/${sa.id}/clients`), {name, ...(expires_at ? {expires_at} : {})}), `issue ${name}`);
    const id = c.client_id ?? c.client?.client_id;
    const secret = c.client_secret ?? c.secret;
    if (secret) secrets[name] = {client_id: id, client_secret: secret};
    writeFileSync(SECRETS, JSON.stringify(secrets, null, 2), {mode: 0o600});
    if (revoke) must(await a.del(ws(`clients/${c.id ?? c.client?.id}`)), `revoke ${name}`);
  } else console.log(`exists client ${name}`);
  return c;
}
await client('orders-reporting-bot', 'nightly-orders-etl');
await client('orders-reporting-bot', 'weekly-export');
await client('orders-reporting-bot', 'old-laptop-test', {revoke: true});
await client('partner-sandbox', 'partner-trial');
await client('partner-sandbox', 'partner-pilot', {expires_at: '2026-01-31T00:00:00Z'}); // already expired
await client('finance-dashboard', 'finance-sheet');

// ---- Endpoints --------------------------------------------------------------------------------------
const endpoints = async () => must(await a.get(ws('endpoints')), 'list endpoints');
const versions = async (id) => must(await a.get(ws(`endpoints/${id}/versions`)), 'versions');

async function publish(id, note) {
  const v = must(await a.post(ws(`endpoints/${id}/validate`), {}), `validate ${id}`);
  return must(await a.post(ws(`endpoints/${id}/publish`), {note, ...(v.acknowledge_breaking ? {acknowledge_breaking: v.acknowledge_breaking} : {})}), `publish ${id}`);
}
async function grant(id, account) {
  const grants = must(await a.get(ws(`endpoints/${id}/grants`)), 'grants');
  const sa = accounts[account].id;
  if (JSON.stringify(grants).includes(sa)) return;
  must(await a.post(ws(`endpoints/${id}/grants`), {service_account_id: sa}), `grant ${account}`);
}
/** Create the endpoint if its path is free, then run `after(ep)` once (publish steps). */
async function endpoint(spec, after) {
  const found = (await endpoints()).find((e) => e.path === `/${spec.path}` || e.name === spec.name);
  if (found) {
    console.log(`exists endpoint ${spec.name}`);
    return found;
  }
  const ep = must(await a.post(ws('endpoints'), {database_id: db.id, ...spec, description: spec.description ?? ''}), `create ${spec.name}`);
  if (after) await after(ep);
  console.log(`created endpoint ${spec.name}`);
  return ep;
}

const PRIORITIES = ['1-URGENT', '2-HIGH', '3-MEDIUM', '4-NOT SPECIFIED', '5-LOW'];
const byStatusV1 =
  'SELECT orderstatus AS status, count(*) AS orders, round(sum(totalprice), 2) AS revenue\nFROM tpch.tiny.orders\nWHERE totalprice >= {{ min_total }}\n{% if priority %}  AND orderpriority = {{ priority }}\n{% endif %}GROUP BY orderstatus\nORDER BY revenue DESC';
const byStatusV2 =
  'SELECT orderstatus AS status,\n       round(sum(totalprice), 2) AS revenue,\n       count(*) AS order_count\nFROM tpch.tiny.orders\nWHERE totalprice >= {{ min_total }}\n{% if priority %}  AND orderpriority = {{ priority }}\n{% endif %}GROUP BY orderstatus\nORDER BY revenue DESC';

await endpoint(
  {
    name: 'Orders by status',
    path: 'orders/by-status',
    description: 'Order count and revenue per order status, optionally for one priority',
    statements: [{name: 'main', sql: byStatusV1}],
    params: [
      {name: 'priority', type: 'enum', location: 'query', allowed: PRIORITIES, description: 'Only orders with this priority'},
      {name: 'min_total', type: 'number', location: 'query', default: '0', minimum: '0', maximum: '1000000', description: 'Smallest order total to count'},
    ],
    cache: {enabled: true, ttl_seconds: 60, scope: 'per_principal'},
    limits: {max_rows: 100, timeout_seconds: 30},
    rate_limit: {per_key_qps: 5, burst: 10, per_endpoint_qps: 0},
  },
  async (ep) => {
    await publish(ep.id, 'First version');
    must(await a.patch(ws(`endpoints/${ep.id}`), {statements: [{name: 'main', sql: byStatusV2}]}), 'by-status v2 draft');
    await publish(ep.id, 'Rename orders to order_count');
    await grant(ep.id, 'orders-reporting-bot');
    await grant(ep.id, 'finance-dashboard');
  },
);

await endpoint(
  {
    name: 'Orders page',
    path: 'orders/page',
    description: 'One page of orders since a date, keyed on orderkey, with the total for a pager',
    statements: [
      {name: 'rows', sql: 'SELECT orderkey, custkey, orderstatus, totalprice, orderdate\nFROM tpch.tiny.orders\nWHERE orderdate >= {{ since }}\n  AND orderkey > {{ after }}\nORDER BY orderkey\nLIMIT 25'},
      {name: 'total', sql: 'SELECT count(*) AS total\nFROM tpch.tiny.orders\nWHERE orderdate >= {{ since }}'},
    ],
    params: [
      {name: 'since', type: 'date', location: 'query', required: true, description: 'First order date to include'},
      {name: 'after', type: 'number', location: 'query', default: '0', minimum: '0', description: 'Last orderkey of the previous page'},
    ],
  },
  async (ep) => {
    await publish(ep.id, 'Rows and total for a pager');
    await grant(ep.id, 'orders-reporting-bot');
  },
);

const transform = `def transform(params, statements):
    total = statements["total"]
    return {
        "year": params["year"],
        "orders": total[0]["orders"] if len(total) > 0 else 0,
        "breakdown": statements["by_status"],
    }
`;
await endpoint(
  {
    name: 'Yearly revenue summary',
    path: 'reports/yearly',
    description: 'Orders and revenue for one calendar year, as a single document',
    statements: [
      {name: 'total', sql: 'SELECT count(*) AS orders, round(sum(totalprice), 2) AS revenue\nFROM tpch.tiny.orders\nWHERE year(orderdate) = {{ year }}'},
      {name: 'by_status', sql: 'SELECT orderstatus AS status, count(*) AS orders\nFROM tpch.tiny.orders\nWHERE year(orderdate) = {{ year }}\nGROUP BY orderstatus\nORDER BY orderstatus'},
    ],
    params: [{name: 'year', type: 'number', location: 'query', required: true, minimum: '1992', maximum: '1998', description: 'Calendar year (1992-1998)'}],
    output: {
      shape: 'objects',
      naming: 'as_is',
      envelope: 'wrapped',
      transform: {
        script: transform,
        returns: [
          {name: 'year', ty: 'bigint', required: true},
          {name: 'orders', ty: 'bigint', required: true},
          {name: 'breakdown', ty: 'array', required: true},
        ],
      },
    },
    cache: {enabled: true, ttl_seconds: 300, scope: 'per_principal'},
  },
  async (ep) => {
    await publish(ep.id, 'Summary document');
    await grant(ep.id, 'orders-reporting-bot');
    await grant(ep.id, 'finance-dashboard');
  },
);

await endpoint(
  {
    name: 'Top customers',
    path: 'customers/top',
    description: 'The twenty customers with the highest total spend',
    statements: [{name: 'main', sql: 'SELECT custkey, count(*) AS orders, round(sum(totalprice), 2) AS spend\nFROM tpch.tiny.orders\nGROUP BY custkey\nORDER BY spend DESC\nLIMIT 20'}],
  },
  async (ep) => {
    await publish(ep.id, 'First version');
    await grant(ep.id, 'orders-reporting-bot');
    // A saved draft that drops a column: publishing it is a breaking change (Publish dialog screenshot).
    must(
      await a.patch(ws(`endpoints/${ep.id}`), {
        statements: [{name: 'main', sql: 'SELECT custkey, count(*) AS orders\nFROM tpch.tiny.orders\nGROUP BY custkey\nORDER BY orders DESC\nLIMIT 20'}],
      }),
      'top customers breaking draft',
    );
  },
);

await endpoint(
  {
    name: 'Status totals',
    path: 'orders/status-totals',
    description: 'Orders per status; add revenue with with_revenue=true',
    statements: [{name: 'main', sql: 'SELECT orderstatus AS status, count(*) AS orders\n{% if with_revenue %}, round(sum(totalprice), 2) AS revenue\n{% endif %}FROM tpch.tiny.orders\nGROUP BY orderstatus\nORDER BY orderstatus'}],
    params: [{name: 'with_revenue', type: 'boolean', location: 'query', description: 'Also return revenue'}],
    output: {shape: 'objects', naming: 'camel', envelope: 'wrapped'},
  },
  async (ep) => {
    await publish(ep.id, 'Optional revenue column');
    await grant(ep.id, 'finance-dashboard');
    await grant(ep.id, 'orders-reporting-bot');
  },
);

const lookupScript = `def build_sql(params):
    cols = "orderkey, orderstatus, orderdate"
    if params.get("detail"):
        cols = cols + ", totalprice, orderpriority, clerk"
    return "SELECT " + cols + " FROM tpch.tiny.orders WHERE orderkey = {{ orderkey }}"
`;
await endpoint(
  {
    name: 'Order lookup',
    path: 'orders/lookup',
    method: 'POST',
    description: 'One order by key; detail=true adds price, priority and clerk',
    statements: [{name: 'main', script: lookupScript}],
    params: [
      {name: 'orderkey', type: 'number', location: 'query', required: true, minimum: '1', description: 'The order key'},
      {name: 'detail', type: 'boolean', location: 'query', description: 'Include price, priority and clerk'},
    ],
    rate_limit: {per_key_qps: 2, burst: 4, per_endpoint_qps: 20},
  },
  async (ep) => {
    await publish(ep.id, 'Scripted lookup');
    await grant(ep.id, 'orders-reporting-bot');
  },
);

await endpoint({
  name: 'Customer spend',
  path: 'customers/spend',
  description: 'Total spend per customer, highest first (work in progress)',
  statements: [{name: 'main', sql: 'SELECT custkey, round(sum(totalprice), 2) AS spend\nFROM tpch.tiny.orders\nGROUP BY custkey\nORDER BY spend DESC\nLIMIT 20'}],
});

await endpoint(
  {
    name: 'Legacy order export',
    path: 'legacy/orders',
    description: 'Replaced by Orders page; kept disabled for one release',
    statements: [{name: 'main', sql: 'SELECT orderkey, orderstatus, totalprice FROM tpch.tiny.orders ORDER BY orderkey LIMIT 50'}],
  },
  async (ep) => {
    await publish(ep.id, 'Old export');
    await grant(ep.id, 'partner-sandbox');
    must(await a.post(ws(`endpoints/${ep.id}/disable`), {}), 'disable legacy');
  },
);

// ---- Traffic (TRAFFIC=1) -----------------------------------------------------------------------------
if (process.env.TRAFFIC) {
  const token = async (name) => {
    const s = secrets[name];
    if (!s) throw new Error(`no stored secret for ${name} in ${SECRETS}`);
    const r = await fetch(`${BASE}/oauth/token`, {
      method: 'POST',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({grant_type: 'client_credentials', ...s}),
    });
    const j = await r.json();
    if (!j.access_token) throw new Error(`token for ${name}: ${r.status} ${JSON.stringify(j)}`);
    return j.access_token;
  };
  const call = async (tok, path, {method = 'GET', headers = {}} = {}) => {
    const r = await fetch(`${BASE}/data-api/v1/${WS}/${path}`, {method, headers: {authorization: `Bearer ${tok}`, ...headers}});
    await r.arrayBuffer();
    return r.status;
  };
  const bot = await token('nightly-orders-etl');
  const fin = await token('finance-sheet');
  const partner = await token('partner-trial');
  const tally = {};
  const note = (s) => (tally[s] = (tally[s] ?? 0) + 1);
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 6; i++) {
    for (const p of ['', '?priority=2-HIGH', '?priority=1-URGENT&min_total=100000', '?min_total=250000']) {
      note(await call(bot, `orders/by-status${p}`));
      note(await call(fin, `orders/by-status${p}`));
      await pause(250);
    }
    for (const y of [1993, 1995, 1997]) note(await call(bot, `reports/yearly?year=${y}`));
    note(await call(fin, 'reports/yearly?year=1996'));
    note(await call(bot, `orders/page?since=1998-06-01&after=${i * 25000}`));
    note(await call(bot, 'customers/top'));
    note(await call(fin, `orders/status-totals${i % 2 ? '?with_revenue=true' : ''}`));
    note(await call(bot, `orders/lookup?orderkey=${1 + i * 32}&detail=${i % 2 ? 'true' : 'false'}`, {method: 'POST'}));
    await pause(400);
  }
  // Errors a consumer typically makes.
  note(await call(bot, 'orders/by-status?priority=9-X'));
  note(await call(bot, 'reports/yearly'));
  note(await call(bot, 'reports/yearly?year=2001'));
  note(await call(partner, 'orders/by-status'));
  note(await call(partner, 'customers/top'));
  note(await call(bot, 'orders/by-satus'));
  note(await call(bot, 'legacy/orders'));
  note(await call(bot, 'orders/lookup?orderkey=1'));
  note(await call(bot, 'orders/by-status', {headers: {'X-Egret-Version': '1'}}));
  note(await call(bot, 'orders/by-status', {headers: {'X-Egret-Version': '7'}}));
  note(await call('not-a-token', 'orders/by-status'));
  // A burst over the per-caller limit (5 qps, burst 10).
  const burst = await Promise.all(Array.from({length: 30}, (_, i) => call(bot, `orders/by-status?min_total=${1000 + i}`)));
  burst.forEach(note);
  console.log('traffic', JSON.stringify(tally));
}
console.log('seeded data-api');
