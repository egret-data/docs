// Seeds the Workflows docs data: flows from scripts/workflows-demo/*.yml in the namespaces docs.demo,
// docs.demo.sales and docs.ops, namespace files, KV keys, and executions in every state the pages show
// (success, failed, warning, paused, killed, replayed, scheduled, backfilled, flow-triggered, children).
//
// Idempotent: a flow that exists is updated in place, files and keys that exist are left alone, and the
// executions of a flow are started only when that flow has none yet. Only objects under the `docs.` namespaces
// are touched, so it is safe on a shared instance.
//
// Usage: BASE=http://egret.localtest.me:18080 STATE=<playwright storage state> node scripts/seed-workflows.mjs
// Run it again a few minutes later: the second pass switches the every-minute heartbeat off once it has fired
// (so it stops filling the list and the Triggers page has a schedule with missed ticks).
import {request} from 'playwright';
import {readdirSync, readFileSync} from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5180';
const WS = process.env.WS ?? 'default';
const STATE = process.env.STATE;
if (!STATE) throw new Error('set STATE to a signed-in Playwright storage state file');
const csrf = JSON.parse(readFileSync(STATE, 'utf8')).cookies.find((c) => c.name === 'egret_csrf')?.value ?? '';
const ctx = await request.newContext({baseURL: BASE, storageState: STATE, extraHTTPHeaders: {'X-Egret-CSRF': csrf}});
const W = `/api/ws/${WS}/workflows`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(method, path, data, opts = {}) {
  const r = await ctx.fetch(`${W}${path}`, {method, ...(data === undefined ? {} : {data}), ...opts});
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!r.ok() && !opts.allow?.includes(r.status())) throw new Error(`${method} ${path}: ${r.status()} ${text.slice(0, 300)}`);
  return {status: r.status(), body};
}

// --- 1. Namespace files and KV keys (the flows below read them)
const files = {
  'docs.demo': {
    '/scripts/greet.py': 'import sys\n\nname = sys.argv[1] if len(sys.argv) > 1 else "world"\nprint(f"Hello, {name}!")\n',
    '/scripts/export.sh': '#!/bin/sh\nset -eu\necho "exporting $1"\n',
    '/data/targets.csv': 'region,target\nemea,180000\napac,150000\namer,220000\n',
    '/sql/orders_by_status.sql': 'SELECT orderstatus, count(*) AS orders\nFROM tpch.tiny.orders\nGROUP BY orderstatus\n',
    '/README.md': '# docs.demo\n\nScripts and data files the docs.demo flows read.\n',
  },
  'docs.ops': {'/runbooks/lag.md': '# Lag runbook\n\nWhen health-check fails, check the max_lag_minutes key first.\n'},
};
for (const [ns, map] of Object.entries(files)) {
  for (const [path, content] of Object.entries(map)) {
    const r = await call('POST', `/namespaces/${ns}/files?path=${encodeURIComponent(path)}&if_revision=0`, undefined, {
      multipart: {fileContent: {name: path.split('/').pop(), mimeType: 'application/octet-stream', buffer: Buffer.from(content)}},
      allow: [409],
    });
    console.log('file', ns, path, r.status === 409 ? 'exists' : 'created');
  }
}
const keys = [
  ['docs', 'company_name', 'Egret Demo Ltd', 'Shown in report headers'],
  ['docs.demo', 'support_email', 'support@example.com', 'Where escalations go'],
  ['docs.demo', 'max_retries', '3', 'Retries for the import flows'],
  ['docs.demo', 'report_window', 'P7D', 'How far back reports look'],
  ['docs.demo', 'feature_flags', '{"beta_dashboards": true, "new_export": false}', 'Switches read by the flows'],
  ['docs.ops', 'max_lag_minutes', '30', 'health-check fails above this lag'],
];
for (const [ns, key, value, description] of keys) {
  const got = await call('GET', `/namespaces/${ns}/kv/${key}`, undefined, {allow: [404]});
  if (got.status === 200) { console.log('kv', ns, key, 'exists'); continue; }
  await call('PUT', `/namespaces/${ns}/kv/${key}`, value, {headers: {'content-type': 'text/plain', description}});
  console.log('kv', ns, key, 'created');
}

// --- 2. Flows
const dir = new URL('./workflows-demo/', import.meta.url);
const published = new Set(['nightly.yml', 'listener.yml', 'webhook.yml', 'sales-daily.yml', 'ops-health.yml', 'ops-purge.yml']);
const existing = (await call('GET', '/flows')).body;
const flowIds = {};
for (const f of readdirSync(dir).filter((n) => n.endsWith('.yml')).sort()) {
  const source = readFileSync(new URL(f, dir), 'utf8');
  const ns = source.match(/^namespace: (.+)$/m)[1].trim();
  const key = source.match(/^id: (.+)$/m)[1].trim();
  const hit = existing.find((x) => x.namespace === ns && x.flow_id === key);
  let id;
  if (hit) {
    id = hit.id;
    const cur = (await call('GET', `/flows/${id}`)).body;
    if (cur.source !== source) await call('PUT', `/flows/${id}`, {source});
    console.log('flow', `${ns}/${key}`, cur.source === source ? 'unchanged' : 'updated');
  } else if (f === 'greet.yml') {
    // Two versions, so the Revisions tab has something to compare.
    id = (await call('POST', '/flows', {source: source.replace('greeting: Hello', 'greeting: Hi')})).body.id;
    await call('POST', `/flows/${id}/publish`, {note: 'First version'});
    await call('PUT', `/flows/${id}`, {source});
    await call('POST', `/flows/${id}/publish`, {note: 'Greeting changed to Hello'});
    console.log('flow', `${ns}/${key}`, 'created with 2 versions');
  } else {
    id = (await call('POST', '/flows', {source})).body.id;
    if (published.has(f)) await call('POST', `/flows/${id}/publish`, {note: 'First version'});
    console.log('flow', `${ns}/${key}`, 'created');
  }
  flowIds[key] = id;
}

// --- 3. Executions
const allExecutions = async () => (await call('GET', '/executions?limit=500')).body.rows;
let executions = await allExecutions();
const runsOf = (key) => executions.filter((e) => e.flow_key === key && !e.parent_execution_id);
const start = async (key, inputs = {}) => (await call('POST', `/flows/${flowIds[key]}/executions`, {inputs})).body;
const waitFor = async (id, states, ms = 60000) => {
  for (let t = 0; t < ms; t += 1000) {
    const e = (await call('GET', `/executions/${id}`)).body;
    const state = e.execution?.state ?? e.state;
    if (states.includes(state)) return state;
    await sleep(1000);
  }
  throw new Error(`execution ${id} did not reach ${states}`);
};

const runOnce = [
  'allow-failure-block', 'assert-and-vars', 'order-routing', 'core-tasks-tour', 'dag-example', 'error-blocks',
  'fan-out-regions', 'kv-roundtrip', 'namespace-file-download', 'storage-files', 'call-subflow', 'timeout-and-runif',
  'loop-until-example', 'region-rollup',
];
for (const key of runOnce) {
  if (runsOf(key).length) continue;
  await start(key);
  console.log('run', key);
}
if (!runsOf('greet-customer').length) {
  await start('greet-customer');
  await start('greet-customer', {customer: 'Grace Hopper', orders: 7, vip: true, channel: 'sms'});
  console.log('run greet-customer x2');
}
if (!runsOf('daily-revenue').length) {
  await start('daily-revenue', {region: 'emea'});
  console.log('run daily-revenue');
}
if (!runsOf('flaky-import').length) {
  const failed = await start('flaky-import');
  await waitFor(failed.id, ['FAILED']);
  await call('POST', `/executions/${failed.id}/replay`, {});
  console.log('run flaky-import, failed, replayed');
}
if (!runsOf('approval-gate').length) {
  // Three runs: one resumed (ends SUCCESS), one killed while paused, one left PAUSED.
  for (const action of ['resume', 'kill', 'leave']) {
    const e = await start('approval-gate');
    await waitFor(e.id, ['PAUSED']);
    if (action !== 'leave') await call('POST', `/executions/${e.id}/${action}`, {});
    console.log('run approval-gate', action);
  }
}
// slow-export: one killed mid-sleep. None is left running: the worker runs the task runs it claimed one after
// another, so a sleeping task holds up every other execution until it ends (see the Executions docs). The
// screenshot script starts a fresh one just before it captures the running state.
if (!runsOf('slow-export').some((e) => e.state === 'KILLED')) {
  const e = await start('slow-export');
  await sleep(4000);
  await call('POST', `/executions/${e.id}/kill`, {});
  console.log('run slow-export, killed');
}

// --- 4. Triggers
const triggers = (await call('GET', '/triggers?limit=200')).body.rows;
const trig = (key, tid) => triggers.find((t) => t.flow_uuid === flowIds[key] && t.trigger_id === tid);
// A backfill of the morning schedule over the last five days.
executions = await allExecutions();
if (!executions.some((e) => e.flow_key === 'daily-revenue' && e.backfill_id && e.state === 'SUCCESS')) {
  const end = new Date(Date.now() - 60_000);
  const startAt = new Date(end.getTime() - 5 * 86_400_000);
  await call('POST', `/flows/${flowIds['daily-revenue']}/triggers/every_morning/backfill`, {
    start: startAt.toISOString(), end: end.toISOString(), labels: [{key: 'reason', value: 'docs-demo-backfill'}],
  });
  console.log('backfill daily-revenue every_morning, 5 days');
}
// The every-minute heartbeat: switched off once it has fired a few times.
const beats = executions.filter((e) => e.flow_key === 'nightly-heartbeat' && !e.backfill_id).length;
const hb = trig('nightly-heartbeat', 'every_minute');
const hbOn = hb && !hb.effective_disabled;
if (beats >= 3 && hbOn) {
  await call('PUT', `/flows/${flowIds['nightly-heartbeat']}/triggers/every_minute/disabled`, {disabled: true});
  console.log('heartbeat switched off after', beats, 'runs');
} else if (hbOn) {
  console.log(`heartbeat has fired ${beats} times; run this script again in a few minutes to switch it off`);
}
await ctx.dispose();
