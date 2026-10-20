// Seeds the alerts, Data API alerts and reports used by the Alerts & Reports docs (scripts/shots/alerts.mjs).
// Usage: BASE=http://egret.localtest.me:18080 STATE=<playwright storage-state json with a logged-in admin session> node scripts/seed-alerts.mjs [--run]
// Idempotent by name: an existing item with the same name is updated in place, never duplicated.
// Requires scripts/seed-dashboards.mjs (charts and dashboards), the `trino-demo` database, the Data API
// endpoint "Orders by status" (Data API docs seed) and workspace SMTP (the demo stack points it at Mailpit).
// --run presses "Run now" on every item once, so the run logs and the Mailpit inbox have something to show.
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
const list = (rows) => (Array.isArray(rows) ? rows : rows.items ?? []);
const byName = (rows, name, what) => {
  const hit = list(rows).find((x) => x.name === name);
  if (!hit) throw new Error(`${what} "${name}" not found`);
  return hit.id;
};

const db = byName(await api('GET', `/ws/${WS}/databases`), 'trino-demo', 'database');
const charts = await api('GET', `/ws/${WS}/charts`);
const dashboards = await api('GET', `/ws/${WS}/dashboards`);
const endpoints = await api('GET', `/ws/${WS}/data-api/endpoints`);
const endpoint = list(endpoints).find((e) => e.name === 'Orders by status')?.id ?? null;

const email = (...addresses) => ({kind: 'email', config: {addresses}});
const webhook = (url) => ({kind: 'webhook', config: {url}});
const slack = (channel) => ({kind: 'slack', config: {channel}});
const base = {active: true, timezone: 'Asia/Ho_Chi_Minh', owners: [], targets: [], skip_if_empty: false,
  grace_period_s: 14400, working_timeout_s: 3600, log_retention_days: 90};
const count = (where) => `SELECT count(*) AS n FROM tpch.tiny.orders WHERE ${where}`;

const items = [
  {...base, type: 'alert', name: 'Pending orders above 100',
    description: 'Partially shipped orders are piling up.',
    crontab: '0 8 * * *', database_id: db, sql: count("orderstatus = 'P'"),
    validator_type: 'operator', validator_config: {op: '>', threshold: 100}, grace_period_s: 3600,
    email_subject: '[egret] {{name}} on {{date}}',
    message: 'More than 100 orders are partially shipped. The order desk owns this alert.',
    message_footer: 'Check the Order operations dashboard and chase the oldest orders first.',
    targets: [{kind: 'dashboard', object_id: byName(dashboards, 'Order operations', 'dashboard')}], report_format: 'png',
    recipients: [email('ops@example.com'), webhook('https://example.com/egret-hook')]},
  {...base, type: 'alert', name: 'Cancelled orders spike', description: 'Any order with status X.',
    crontab: '0 * * * *', database_id: db, sql: count("orderstatus = 'X'"),
    validator_type: 'operator', validator_config: {op: '>', threshold: 0},
    recipients: [email('ops@example.com')]},
  {...base, type: 'alert', name: 'Urgent open orders exist', description: 'Open orders with priority 1-URGENT.',
    crontab: '*/15 * * * *', database_id: db, sql: count("orderstatus = 'O' AND orderpriority = '1-URGENT'"),
    validator_type: 'not_null', validator_config: {},
    recipients: [email('ops@example.com', 'data-team@example.com')]},
  {...base, type: 'alert', name: 'Late orders to Slack', description: 'Posts to #data-alerts.',
    crontab: '30 8 * * 1-5', database_id: db, sql: count("orderstatus = 'P' AND orderpriority = '1-URGENT'"),
    validator_type: 'not_null', validator_config: {},
    recipients: [slack('#data-alerts')]},
  {...base, type: 'alert', name: 'Webhook to an internal host', description: 'Shows the private-address guard.',
    crontab: '0 9 * * *', database_id: db, sql: count("orderstatus = 'F'"),
    validator_type: 'not_null', validator_config: {},
    recipients: [webhook('http://mailpit:8025/hook')]},
  ...(endpoint ? [{...base, type: 'dataapi_alert', name: 'Orders by status error rate',
    description: 'More than 5% of calls fail.', crontab: '*/5 * * * *',
    dataapi_endpoint_id: endpoint, dataapi_metric: 'error_rate', dataapi_window_s: 3600,
    validator_type: 'operator', validator_config: {op: '>', threshold: 0.05},
    recipients: [email('api-owners@example.com')]}] : []),
  {...base, type: 'dataapi_alert', name: 'Throttled calls in the last hour',
    description: 'Any 429 rate_limited answer in the workspace.', crontab: '0 * * * *',
    dataapi_endpoint_id: null, dataapi_metric: 'error_code_count', dataapi_error_code: 'rate_limited', dataapi_window_s: 3600,
    validator_type: 'operator', validator_config: {op: '>', threshold: 0},
    recipients: [email('api-owners@example.com')]},
  {...base, type: 'report', name: 'Revenue by status CSV', description: 'Daily CSV for finance.',
    timezone: 'UTC', crontab: '30 6 * * *', report_format: 'csv',
    targets: [{kind: 'chart', object_id: byName(charts, 'Revenue by status', 'chart')}],
    email_subject: 'Revenue by status {{date}}', recipients: [email('finance@example.com')]},
  {...base, type: 'report', name: 'Sales performance weekly digest', description: 'Monday PDF for the sales team.',
    crontab: '0 8 * * 1', report_format: 'pdf',
    targets: [{kind: 'dashboard', object_id: byName(dashboards, 'Sales performance', 'dashboard')},
      {kind: 'dashboard', object_id: byName(dashboards, 'Executive summary', 'dashboard')}],
    email_subject: 'Weekly sales overview - {{date}}',
    message: 'Good morning. Here is last week in numbers.', message_footer: 'Questions: #sales-analytics.',
    recipients: [email('sales@example.com')]},
  {...base, type: 'report', name: 'Leadership weekly pack', description: 'Two dashboards in one PDF.',
    crontab: '0 7 * * 1', report_format: 'pdf',
    targets: [{kind: 'dashboard', object_id: byName(dashboards, 'Executive summary', 'dashboard')},
      {kind: 'dashboard', object_id: byName(dashboards, 'Weekly sales review', 'dashboard')}],
    email_subject: 'Leadership pack - week of {{date}}', recipients: [email('leadership@example.com')]},
  {...base, type: 'report', name: 'Executive summary snapshot', description: 'Daily PNG of the headline numbers.',
    crontab: '0 7 * * *', report_format: 'png',
    targets: [{kind: 'dashboard', object_id: byName(dashboards, 'Executive summary', 'dashboard')}],
    email_subject: 'Executive summary {{date}}', recipients: [email('leadership@example.com')]},
  {...base, type: 'report', name: 'Revenue by status (text)', description: 'The numbers in the mail body.',
    crontab: '0 18 * * 5', report_format: 'text',
    targets: [{kind: 'chart', object_id: byName(charts, 'Revenue by status', 'chart')}],
    recipients: [email('finance@example.com')]},
];

// The first object also goes in chart_id / dashboard_id (a report's main object, an alert's attachment).
// A report sends every object, primary first, in `targets` (as the editor does): when `targets` is not
// empty the runner renders exactly that list. An alert's attachment is chart_id / dashboard_id only.
for (const it of items) {
  const [first] = it.targets;
  if (first) it[first.kind === 'chart' ? 'chart_id' : 'dashboard_id'] = first.object_id;
  if (it.type !== 'report') it.targets = [];
}

const existing = await api('GET', `/ws/${WS}/alerts`);
const ids = {};
for (const it of items) {
  const hit = list(existing).find((x) => x.name === it.name && x.type === it.type);
  ids[it.name] = hit
    ? (await api('PUT', `/ws/${WS}/alerts/${hit.id}`, it), hit.id)
    : (await api('POST', `/ws/${WS}/alerts`, it)).id;
  console.log(it.type, it.name, ids[it.name]);
}

if (process.argv.includes('--run')) {
  for (const [name, id] of Object.entries(ids)) {
    const r = await api('POST', `/ws/${WS}/alerts/${id}/run`);
    console.log('run', name, JSON.stringify(r).slice(0, 200));
  }
}
