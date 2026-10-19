// Captures the Charts list states that need set-up data: a folder with a bookmarked chart, bulk select,
// the Trash view and the "Delete permanently" confirmation. It duplicates one chart and creates a folder,
// takes the screenshots, then deletes both again, so it leaves the instance as it found it.
// Usage: STATE=/path/state.json BASE=http://localhost:5180 node scripts/charts-list-states.mjs
// Prerequisite: the chart "Revenue by order priority" (scripts/seed-charts-deep.mjs).
import {chromium} from 'playwright';
import fs from 'node:fs';
const BASE = process.env.BASE ?? 'http://localhost:5180';
const STATE = process.env.STATE;
const OUT = new URL('../static/img/platform/charts/', import.meta.url).pathname;
const st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
const cookie = st.cookies.map((c) => `${c.name}=${c.value}`).join('; ');
const csrf = st.cookies.find((c) => c.name === 'egret_csrf')?.value;
const api = async (method, path) => {
  const r = await fetch(`${BASE}/api${path}`, {method, headers: {cookie, 'X-Egret-CSRF': csrf}});
  if (!r.ok && r.status !== 404) throw new Error(`${method} ${path} ${r.status}`);
};
const COPY = 'Revenue by order priority (copy)';
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, storageState: STATE});
const p = await ctx.newPage();
const go = async () => { await p.goto(`${BASE}/explore/default/charts`, {waitUntil: 'networkidle'}); await p.waitForTimeout(1000); };
const rowMenu = async (name) => { await p.locator('tr', {hasText: name}).first().locator('button').last().click(); await p.waitForTimeout(300); };

await go();
await p.getByPlaceholder('Search charts…').fill('Revenue by order priority');
await rowMenu('Revenue by order priority');
await p.getByRole('menuitem', {name: 'Duplicate'}).click();
await p.waitForTimeout(1500);
await p.getByRole('button', {name: 'New folder'}).click();
await p.getByRole('dialog').getByRole('textbox').fill('Q4 reporting');
await p.getByRole('dialog').getByRole('button', {name: 'Create'}).click();
await p.waitForTimeout(1500);
await go();
await rowMenu(COPY);
await p.getByRole('menuitem', {name: 'Move to "Q4 reporting"'}).click();
await p.waitForTimeout(1200);
await p.getByRole('button', {name: `bookmark ${COPY}`}).click();
await p.waitForTimeout(1000);
await p.screenshot({path: `${OUT}list-folders.png`});

await p.getByRole('button', {name: 'Bulk select'}).click();
await p.getByLabel(`Select ${COPY}`).check();
await p.waitForTimeout(500);
await p.screenshot({path: `${OUT}list-bulk.png`});
await p.getByRole('button', {name: /Move 1 to Trash/}).click();
await p.waitForTimeout(1500);
await p.getByRole('button', {name: 'Trash'}).click();
await p.waitForTimeout(1000);
await p.screenshot({path: `${OUT}list-trash.png`});
await rowMenu(COPY);
await p.getByRole('menuitem', {name: 'Delete permanently'}).click();
await p.waitForTimeout(600);
await p.screenshot({path: `${OUT}list-delete-confirm.png`});
await p.getByRole('textbox').last().fill('delete');
await p.getByRole('button', {name: 'Delete', exact: true}).last().click();
await p.waitForTimeout(1500);

// Clean up the demo folder.
const folders = await (await fetch(`${BASE}/api/ws/default/folders/charts`, {headers: {cookie}})).json();
for (const f of folders.filter((x) => x.name === 'Q4 reporting')) await api('DELETE', `/ws/default/folders/charts/${f.id}`);
await browser.close();
