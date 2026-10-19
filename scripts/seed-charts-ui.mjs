// Finish the demo charts through the UI: pick the X-axis dimension and save. The chart API stores the
// axis mapping in viz settings; driving the editor is the supported way to produce a valid one.
// Usage: BASE=http://localhost:5180 STATE=/tmp/egret-state.json node scripts/seed-charts-ui.mjs
import {chromium} from 'playwright';
import {existsSync} from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5180';
const STATE = process.env.STATE;
const EMAIL = process.env.EGRET_ADMIN_EMAIL ?? 'admin@egret.local';
const PASSWORD = process.env.EGRET_ADMIN_PASSWORD ?? 'Admin12345!';
const WS = '/explore/default';
const charts = [
  {name: 'Revenue by order status', x: 'orderstatus'},
  {name: 'Revenue by month', x: 'orderdate'},
];

const browser = await chromium.launch();
const reuse = STATE && existsSync(STATE);
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, ...(reuse ? {storageState: STATE} : {})});
const page = await ctx.newPage();
if (!reuse) {
  await page.goto(`${BASE}/login`, {waitUntil: 'networkidle'});
  await page.getByPlaceholder('Email').fill(EMAIL);
  await page.getByPlaceholder('Password').fill(PASSWORD);
  await page.getByRole('button', {name: /sign in|log in/i}).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), {timeout: 30000});
  if (STATE) await ctx.storageState({path: STATE});
}

for (const c of charts) {
  await page.goto(`${BASE}${WS}/charts`, {waitUntil: 'networkidle'});
  await page.getByText(c.name, {exact: true}).first().click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('combobox').filter({hasText: /pick a dimension/i}).first().click();
  await page.getByRole('option', {name: c.x, exact: true}).click();
  await page.getByRole('button', {name: 'Update'}).first().click();
  await page.getByRole('dialog').getByRole('button', {name: 'Update'}).click();
  await page.waitForTimeout(2500);
  console.log('configured', c.name);
}
await browser.close();
