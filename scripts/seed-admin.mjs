// Seed the admin-area demo data (Control Plane, Workspace settings, Governance) on a running demo stack.
// Idempotent: every object is looked up by name first and only created when missing.
// Usage: BASE=http://egret.localtest.me:18080 STATE=<admin storage state> [MEMBER_STATE=<member-sso storage state>] node scripts/seed-admin.mjs
// The objects are listed in scripts/shots/admin-demo-data.md. Passwords below are demo values for a throwaway stack.
import {request} from 'playwright';
import {api} from './api-helper.mjs';

const BASE = process.env.BASE ?? 'http://egret.localtest.me:18080';
const a = await api(process.env.STATE, BASE);
const DEMO_PASSWORD = 'Docs12345!';

const must = (r, what) => {
  if (r.status >= 300) throw new Error(`${what}: ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);
  return r.body;
};
const list = async (url) => {
  const b = must(await a.get(url), `GET ${url}`);
  return Array.isArray(b) ? b : (b.items ?? b.entries ?? b.data ?? []);
};

// ---- Users (local accounts)
const people = [
  ['alice.nguyen@egret.local', 'Alice Nguyen'],
  ['bao.tran@egret.local', 'Bao Tran'],
  ['carla.mendes@egret.local', 'Carla Mendes'],
  ['david.kim@egret.local', 'David Kim'],
  ['emma.schmidt@egret.local', 'Emma Schmidt'],
  ['farid.haddad@egret.local', 'Farid Haddad'],
  ['grace.lee@egret.local', 'Grace Lee'],
  ['hiro.tanaka@egret.local', 'Hiro Tanaka'],
];
let users = await list('/api/control-plane/users');
for (const [email, name] of people) {
  if (!users.find((u) => u.email === email)) {
    must(await a.post('/api/control-plane/users', {email, name, password: DEMO_PASSWORD}), `create user ${email}`);
    console.log('user', email);
  }
}
users = await list('/api/control-plane/users');
const uid = (email) => users.find((u) => u.email === email)?.id;
// Grace Lee left the company: disabled, kept for the audit trail.
const grace = users.find((u) => u.email === 'grace.lee@egret.local');
if (grace && grace.status !== 'disabled') must(await a.patch(`/api/control-plane/users/${grace.id}`, {status: 'disabled'}), 'disable grace');

// ---- Roles
let roles = await list('/api/control-plane/access/roles');
const roleId = (n) => roles.find((r) => r.name === n)?.id;
const wantRoles = [
  {scope: 'workspace', name: 'finance_reporter', description: 'Reads finance data and builds charts and dashboards', parent: 'ws_viewer', perms: ['chart:manage', 'dashboard:manage']},
  {scope: 'workspace', name: 'marketing_analyst', description: 'Runs SQL and builds charts on marketing data', parent: 'ws_viewer', perms: ['chart:manage', 'query:run']},
  {scope: 'platform', name: 'security_auditor', description: 'Reviews users, groups, roles and engines', parent: null, perms: ['user:read', 'group:read', 'role:read', 'engine:read']},
];
for (const r of wantRoles) {
  if (!roleId(r.name)) {
    const body = {scope: r.scope, name: r.name, description: r.description};
    if (r.parent) body.parentRoleId = roleId(r.parent);
    const created = must(await a.post('/api/control-plane/access/roles', body), `create role ${r.name}`);
    const res = await a.put(`/api/control-plane/access/roles/${created.id}/permissions`, {permissions: r.perms});
    if (res.status >= 300) console.log(`  permissions for ${r.name}: ${res.status} ${JSON.stringify(res.body).slice(0, 200)}`);
    console.log('role', r.name);
    roles = await list('/api/control-plane/access/roles');
  }
}

// ---- Groups (local)
const wantGroups = {
  'finance-analysts': ['alice.nguyen@egret.local', 'bao.tran@egret.local', 'carla.mendes@egret.local'],
  marketing: ['david.kim@egret.local', 'emma.schmidt@egret.local'],
  'data-stewards': ['farid.haddad@egret.local', 'grace.lee@egret.local'],
  executives: ['hiro.tanaka@egret.local'],
};
let groups = await list('/api/control-plane/groups');
for (const [name, members] of Object.entries(wantGroups)) {
  let g = groups.find((x) => x.name === name);
  if (!g) {
    g = must(await a.post('/api/control-plane/groups', {name}), `create group ${name}`);
    console.log('group', name);
  }
  const current = (await list(`/api/control-plane/groups/${g.id}/members`)).map((m) => m.id ?? m.userId);
  for (const email of members) {
    if (!current.includes(uid(email))) must(await a.post(`/api/control-plane/groups/${g.id}/members`, {userId: uid(email)}), `add ${email} to ${name}`);
  }
}
groups = await list('/api/control-plane/groups');
const gid = (n) => groups.find((g) => g.name === n)?.id;
const stewards = groups.find((g) => g.name === 'data-stewards');
if (stewards && !stewards.roles?.includes('data_steward')) await a.post(`/api/control-plane/groups/${stewards.id}/roles`, {roleId: roleId('data_steward')});
const farid = users.find((u) => u.email === 'farid.haddad@egret.local');
if (farid && !farid.roles?.includes('security_auditor')) await a.post(`/api/control-plane/users/${farid.id}/roles`, {roleId: roleId('security_auditor')});

// ---- Workspaces
const wantWs = [
  ['docs-sandbox', 'Docs sandbox'],
  ['finance-analytics', 'Finance analytics'],
  ['sales-operations', 'Sales operations'],
  ['data-science-lab', 'Data science lab'],
  ['legacy-reporting', 'Legacy reporting'],
];
let wss = await list('/api/admin/workspaces');
for (const [slug, name] of wantWs) {
  if (!wss.find((w) => w.slug === slug)) {
    must(await a.post('/api/admin/workspaces', {slug, name}), `create workspace ${slug}`);
    console.log('workspace', slug);
  }
}
wss = await list('/api/admin/workspaces');
const wsId = (slug) => wss.find((w) => w.slug === slug)?.id;

// ---- Workspace members
const members = {
  'docs-sandbox': [
    ['group', 'data-team', 'ws_editor'],
    ['user', 'member-sso@egret.local', 'ws_viewer'],
    ['user', 'alice.nguyen@egret.local', 'ws_admin'],
    ['user', 'david.kim@egret.local', 'marketing_analyst'],
    ['user', 'hiro.tanaka@egret.local', 'ws_viewer'],
    ['group', 'finance-analysts', 'finance_reporter'],
  ],
  'finance-analytics': [
    ['group', 'finance-analysts', 'ws_editor'],
    ['user', 'alice.nguyen@egret.local', 'ws_admin'],
    ['user', 'hiro.tanaka@egret.local', 'ws_viewer'],
    ['user', 'farid.haddad@egret.local', 'ws_viewer'],
  ],
  'sales-operations': [
    ['group', 'marketing', 'ws_editor'],
    ['user', 'carla.mendes@egret.local', 'ws_viewer'],
  ],
  'data-science-lab': [
    ['group', 'data-team', 'ws_editor'],
    ['user', 'emma.schmidt@egret.local', 'ws_admin'],
  ],
};
for (const [ws, rows] of Object.entries(members)) {
  const current = must(await a.get(`/api/ws/${ws}/members`), `members ${ws}`);
  const have = JSON.stringify(current);
  for (const [ptype, who, role] of rows) {
    const pid = ptype === 'group' ? gid(who) : uid(who);
    if (!pid) { console.log(`  skip ${who}: not known yet`); continue; }
    if (have.includes(pid)) continue;
    const r = await a.post(`/api/ws/${ws}/members`, {principal_type: ptype, principal_id: pid, role});
    if (r.status >= 300) console.log(`  member ${who} in ${ws}: ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);
  }
}

// ---- Docs sandbox content: a Trino connection, a dataset, two charts and the dashboard "Finance KPIs" with shares
const dbs = await list('/api/ws/docs-sandbox/databases');
let db = dbs.find((d) => d.name === 'trino-sandbox');
if (!db) {
  db = must(await a.post('/api/ws/docs-sandbox/databases', {name: 'trino-sandbox', engine: 'trino', host: 'trino-demo', port: 8080, options: {user: 'egret', http_scheme: 'http', catalog: 'tpch'}}), 'database trino-sandbox');
  console.log('database trino-sandbox');
}
const datasets = await list('/api/ws/docs-sandbox/datasets');
let ds = datasets.find((d) => d.name === 'orders');
if (!ds) {
  ds = must(await a.post('/api/ws/docs-sandbox/datasets', {name: 'orders', database_id: db.id, description: 'TPC-H sample orders', source: {kind: 'physical', catalog: 'tpch', schema: 'tiny', table: 'orders'}}), 'dataset orders');
  await a.post(`/api/ws/docs-sandbox/datasets/${ds.id}/metrics`, {metric_name: 'revenue', verbose_name: 'Revenue', expression: 'sum(totalprice)'});
  await a.post(`/api/ws/docs-sandbox/datasets/${ds.id}/metrics`, {metric_name: 'order_count', verbose_name: 'Orders', expression: 'count(*)'});
  console.log('dataset orders');
}
const spec = (metrics, dims, extra = {}) => ({metrics, dimensions: dims, columns: [], filters: [], orderby: [], row_limit: 1000, rollup_groups: [], ...extra});
const charts = await list('/api/ws/docs-sandbox/charts');
const chartByName = async (name, viz, s) => {
  const c = charts.find((x) => x.name === name);
  if (c) return c;
  console.log('chart', name);
  return must(await a.post('/api/ws/docs-sandbox/charts', {dataset_id: ds.id, name, viz_type: viz, params: {version: 2, settings: {}, spec: s}}), `chart ${name}`);
};
const c1 = await chartByName('Revenue by order status', 'bar', spec(['revenue'], ['orderstatus']));
const c2 = await chartByName('Orders by priority', 'table', spec(['order_count'], ['orderpriority']));
const dashes = await list('/api/ws/docs-sandbox/dashboards');
let dash = dashes.find((d) => d.name === 'Finance KPIs');
if (!dash) {
  dash = must(await a.post('/api/ws/docs-sandbox/dashboards', {name: 'Finance KPIs', description: 'Revenue and order volume'}), 'dashboard');
  await a.put(`/api/ws/docs-sandbox/dashboards/${dash.id}`, {name: 'Finance KPIs', description: 'Revenue and order volume', parameters: [], width: 'full', tabs: [], cards: [
    {chart_id: c1.id, card_type: 'chart', grid_col: 0, grid_row: 0, size_x: 12, size_y: 5, options: {}},
    {chart_id: c2.id, card_type: 'chart', grid_col: 12, grid_row: 0, size_x: 12, size_y: 5, options: {}},
  ]});
  console.log('dashboard Finance KPIs');
}
const shares = [
  ['dashboard', dash.id, 'group', 'executives', 'ws_viewer', 'allow'],
  ['dashboard', dash.id, 'user', 'farid.haddad@egret.local', 'ws_viewer', 'allow'],
  ['dashboard', dash.id, 'user', 'carla.mendes@egret.local', 'ws_editor', 'allow'],
  ['chart', c1.id, 'user', 'bao.tran@egret.local', 'ws_editor', 'allow'],
  ['dataset', ds.id, 'user', 'hiro.tanaka@egret.local', 'ws_editor', 'deny'],
];
for (const [kind, id, ptype, who, role, effect] of shares) {
  const have = JSON.stringify(must(await a.get(`/api/ws/docs-sandbox/objects/${kind}/${id}/grants`), 'grants'));
  if (have.includes(who)) continue;
  const r = await a.put(`/api/ws/docs-sandbox/objects/${kind}/${id}/grants`, {principal_type: ptype, principal_id: who, role, effect});
  if (r.status >= 300) console.log(`  share ${kind} ${who}: ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);
}

// ---- Secrets (demo values only)
const wantSecrets = [
  {name: 'docs-warehouse-password', description: 'Password of the reporting warehouse user', type: 'kubernetes.io/basic-auth', data: {username: 'reporting', password: 'demo-only-not-secret'}},
  {name: 'finance-postgres', description: 'Finance Postgres read replica', type: 'kubernetes.io/basic-auth', data: {username: 'finance_ro', password: 'demo-only-not-secret'}},
  {name: 'marketing-api-token', description: 'Token for the marketing events API', type: 'Opaque', data: {token: 'demo-only-not-secret'}},
  {name: 'sandbox-lake-keys', description: 'Object-store keys for the sandbox lake', type: 'Opaque', data: {secret_key: 'demo-only-not-secret'}},
  {name: 'partner-sftp', description: 'SFTP drop for partner exports', type: 'kubernetes.io/basic-auth', data: {username: 'partner', password: 'demo-only-not-secret'}},
];
const secrets = await list('/api/control-plane/secrets');
for (const s of wantSecrets) {
  if (!secrets.find((x) => x.name === s.name)) {
    must(await a.post('/api/control-plane/secrets', s), `secret ${s.name}`);
    console.log('secret', s.name);
  }
}

// ---- Storage connection sandbox-lake (same demo object store, its own prefix; reuses the seeded demo-rustfs secret)
const storage = await list('/api/control-plane/storage');
const rustfs = storage.find((s) => s.name === 'demo-rustfs');
if (!storage.find((s) => s.name === 'sandbox-lake') && rustfs) {
  must(await a.post('/api/control-plane/storage', {name: 'sandbox-lake', purpose: 'Scratch space for the docs sandbox', provider: 's3', endpoint: rustfs.endpoint, region: rustfs.region, bucket: rustfs.bucket, key_prefix: 'sandbox/', access_key: rustfs.access_key, secret_ref: rustfs.secret_ref, path_style: true}), 'storage sandbox-lake');
  console.log('storage sandbox-lake');
}

// ---- Catalogs: TPC-H for benchmarks (tpch_bench)
let catalogs = await list('/api/control-plane/catalogs');
if (!catalogs.find((c) => c.name === 'tpch_bench')) {
  must(await a.post('/api/control-plane/catalogs', {name: 'tpch_bench', kind: 'tpch', config: {}, description: 'Generated TPC-H data for benchmarks'}), 'catalog tpch_bench');
  console.log('catalog tpch_bench');
}
// Governance uses the seeded warehouse catalog demo_warehouse: a second egret warehouse on the same bucket is refused
// ("Storage profile overlaps with existing warehouse demo-warehouse").

// ---- Classifications
const wantTags = [
  {key: 'personal-data-pii', name: 'Personal data (PII)', description: 'Columns that identify a person', color: '#e5484d'},
  {key: 'financial', name: 'Financial', description: 'Revenue, prices and payment data', color: '#f5a524'},
  {key: 'confidential', name: 'Confidential', description: 'Internal only, never shared outside the company', color: '#8e4ec6'},
  {key: 'public', name: 'Public', description: 'Safe to publish', color: '#30a46c'},
];
const tags = await list('/api/control-plane/tags');
for (const t of wantTags) {
  if (!tags.find((x) => x.key === t.key)) {
    const r = await a.post('/api/control-plane/tags', t);
    if (r.status >= 300) console.log(`  tag ${t.key}: ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);
    else console.log('tag', t.key);
  }
}

// ---- Access requests: filed by the requesters themselves (local users sign in once through the API)
const requestAs = async (email, ws, role, reason) => {
  const pending = must(await a.get(`/api/ws/${ws}/access-requests`), 'requests');
  const rows = Array.isArray(pending) ? pending : pending.items ?? [];
  if (rows.find((r) => r.requester_id === uid(email))) return;
  const ctx = await request.newContext({baseURL: BASE});
  const login = await ctx.post('/api/auth/login', {data: {email, password: DEMO_PASSWORD}});
  if (!login.ok()) { console.log(`  login ${email}: ${login.status()}`); return; }
  const csrf = (await ctx.storageState()).cookies.find((c) => c.name === 'egret_csrf')?.value ?? '';
  const r = await ctx.post('/api/access-requests', {headers: {'X-Egret-CSRF': csrf}, data: {workspace_id: wsId(ws), role, reason}});
  console.log('request', email, ws, r.status());
  await ctx.dispose();
};
await requestAs('bao.tran@egret.local', 'sales-operations', 'ws_viewer', 'Quarterly pipeline review with the sales leads.');
await requestAs('david.kim@egret.local', 'finance-analytics', 'ws_viewer', 'I need the revenue dashboards for the campaign ROI report.');
await requestAs('emma.schmidt@egret.local', 'finance-analytics', 'ws_editor', 'Building the marketing spend vs. revenue charts for Q4.');
await requestAs('carla.mendes@egret.local', 'data-science-lab', 'ws_viewer', 'Churn model notebooks.');
if (process.env.MEMBER_STATE) {
  const pending = JSON.stringify(must(await a.get('/api/ws/finance-analytics/access-requests'), 'requests'));
  if (!pending.includes(uid('member-sso@egret.local') ?? '-')) {
    const m = await api(process.env.MEMBER_STATE, BASE);
    const r = await m.post('/api/access-requests', {workspace_id: wsId('finance-analytics'), role: 'ws_viewer', reason: 'I need to build dashboards on the orders dataset for the sales review.'});
    console.log('request member-sso finance-analytics', r.status);
  }
}

// ---- Legacy reporting is archived
const legacy = wss.find((w) => w.slug === 'legacy-reporting');
if (legacy && legacy.status !== 'archived') {
  const r = await a.del(`/api/admin/workspaces/${legacy.id}`);
  console.log('archive legacy-reporting', r.status);
}
console.log('done');
