// Captures admin/gov-clearance-409: the Clearance tab's alert when the set of policy profiles a clearance write
// recompiles grew while the write ran (409 `profile_set_changed`, platform #813).
// The refusal needs a race, so this script stages it the way the platform's own live check did:
//   1. a psql session holds the classification's clearance row, so the write from the UI parks at its insert, after it
//      took its profile and compile-mint locks;
//   2. meanwhile an external StarRocks engine that declares demo_warehouse is bound to a second StarRocks profile (rows
//      written straight into the demo database, committed at once);
//   3. the psql session lets go, the write re-reads its profiles, finds the new one and is refused. Nothing is stored.
// Demo stack only. Usage:
//   BASE=http://egret.localtest.me:18080 STATE=<admin state> PG_CONTAINER=egret-demo-postgres-1 \
//     node scripts/capture-clearance-409.mjs
// Needs: classification Confidential with a clearance, role finance_reporter not in it, and at least one StarRocks profile bound to an engine
// (scripts/shots/admin-demo-data.md). Leaves the extra profile docs-409 and engine docs-409-engine behind: delete the
// engine in the Control Plane and the profile under Engine & policy afterwards.
import {chromium} from 'playwright';
import {spawn, execFileSync} from 'node:child_process';
import {api} from './api-helper.mjs';

const BASE = process.env.BASE ?? 'http://egret.localtest.me:18080';
const STATE = process.env.STATE;
const PG = process.env.PG_CONTAINER ?? 'egret-demo-postgres-1';
const OUT = new URL('../static/img/platform/admin/gov-clearance-409.png', import.meta.url).pathname;
const psql = (sql) =>
  execFileSync('docker', ['exec', '-i', PG, 'sh', '-c', 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At'], {input: sql})
    .toString()
    .trim();

const a = await api(STATE, BASE);
const tags = (await a.get('/api/control-plane/tags')).body;
const tag = (Array.isArray(tags) ? tags : tags.items).find((t) => t.key === 'confidential');
const prof = await a.post('/api/control-plane/policies/services', {name: 'docs-409', type: 'starrocks'});
if (prof.status >= 300 && prof.status !== 409) throw new Error(`profile docs-409: ${prof.status}`);

const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, colorScheme: 'light', storageState: STATE});
const page = await ctx.newPage();
await page.goto(`${BASE}/governance/classifications/${tag.id}?tab=clearance`, {waitUntil: 'networkidle'});
await page.waitForTimeout(1500);

const holder = spawn('docker', ['exec', '-i', PG, 'sh', '-c', 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At'], {stdio: ['pipe', 'inherit', 'inherit']});
holder.stdin.write(`BEGIN; SELECT 'holding' FROM classification_policies WHERE tag_id='${tag.id}' FOR UPDATE; SELECT pg_sleep(12); ROLLBACK;\n`);
holder.stdin.end();
await page.waitForTimeout(1500);

await page.getByRole('combobox', {name: 'Role to add'}).click();
await page.waitForTimeout(500);
await page.locator('[data-radix-popper-content-wrapper]').getByRole('button', {name: /finance_reporter/}).first().click();
await page.getByRole('button', {name: 'Add clearance'}).click();

// Wait until the write is parked on the held row (it then holds its profile and compile-mint locks).
for (let i = 0; i < 40; i++) {
  const parked = psql(
    "SELECT count(*) FROM pg_stat_activity WHERE wait_event_type='Lock' AND query LIKE 'INSERT INTO classification_policies%';",
  );
  if (parked !== '0') { console.log('the clearance write is parked'); break; }
  await page.waitForTimeout(250);
}
psql(`WITH e AS (
  INSERT INTO engine_mgmt.engines (name,type,namespace,spec,status,authz_service_id,origin,external_host,external_port,ranger_plugin_version)
  SELECT 'docs-409-engine','starrocks','','{}','running',id,'external','starrocks-409.invalid',9030,'2.8.0'
  FROM policy.authz_services WHERE name='docs-409' RETURNING id)
INSERT INTO registry.engine_catalog_attachments (engine_id, catalog_id, minted_client, apply_status)
  SELECT e.id, c.id, false, 'declared' FROM e, registry.catalogs c WHERE c.name='demo_warehouse';`);

await page.locator('[role=alert]').filter({hasText: /changed while it ran/}).first().waitFor({timeout: 30000});
await page.waitForTimeout(1500);
await page.screenshot({path: OUT});
console.log('admin/gov-clearance-409');
await browser.close();
