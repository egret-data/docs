// Creates the demo flows the Workflows docs use (namespace docs.demo) from scripts/workflows-demo/*.yml.
// Each file is saved as a draft through the API and run once, except nightly.yml, listener.yml, webhook.yml
// (published, so their triggers are listed) and b.yml (a deliberately broken draft for the Problems tab).
// Usage: BASE=http://localhost:5180 STATE=<playwright state file> node scripts/seed-workflows.mjs
import {chromium} from 'playwright';
import {readdirSync, readFileSync} from 'node:fs';
const BASE = process.env.BASE ?? 'http://localhost:5180';
const dir = new URL('./workflows-demo/', import.meta.url);
const browser = await chromium.launch();
const ctx = await browser.newContext({storageState: process.env.STATE});
const csrf = (await ctx.cookies()).find((c) => c.name === 'egret_csrf')?.value ?? '';
const api = (m, p, body) => ctx.request.fetch(`${BASE}/api/ws/default/workflows${p}`, {method: m, headers: {'X-Egret-CSRF': csrf, 'content-type': 'application/json'}, data: body});
for (const f of readdirSync(dir).filter((n) => n.endsWith('.yml'))) {
  const created = await api('POST', '/flows', {source: readFileSync(new URL(f, dir), 'utf8')});
  if (!created.ok()) { console.log(f, created.status(), 'skipped'); continue; }
  const {id} = await created.json();
  if (['nightly.yml', 'listener.yml', 'webhook.yml'].includes(f)) await api('POST', `/flows/${id}/publish`, {note: 'First version'});
  else if (f !== 'b.yml' && f !== 'child.yml') await api('POST', `/flows/${id}/executions`, {});
  console.log(f, 'ok');
}
await browser.close();
