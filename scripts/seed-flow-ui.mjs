// Make sure the sample `hello` flow exists (created through the editor) and run it once, so the
// Flows/Executions screenshots have data. Safe to re-run: an existing flow is reported as a conflict and reused.
// Usage: BASE=http://localhost:5180 STATE=/tmp/egret-state.json node scripts/seed-flow-ui.mjs
import {chromium} from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:5180';
const WF = `${BASE}/explore/default/workflows`;
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, storageState: process.env.STATE});
const page = await ctx.newPage();

await page.goto(`${WF}/flows/new`, {waitUntil: 'networkidle'});
await page.waitForTimeout(2000);
await page.getByRole('button', {name: /^save$/i}).click();
await page.waitForTimeout(2500);

await page.goto(`${WF}/flows`, {waitUntil: 'networkidle'});
await page.getByText('hello', {exact: true}).first().click();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);
console.log('flow page:', page.url());
console.log('buttons:', (await page.getByRole('button').allTextContents()).filter(Boolean).join(' | '));
await page.getByRole('button', {name: /^run$/i}).click();
await page.waitForTimeout(1500);
// The confirm modal repeats the Run button; the last one in DOM order is the modal's.
await page.getByRole('button', {name: /^run$/i}).last().click();
await page.waitForTimeout(5000);
console.log('after run:', page.url());
if (process.env.OUT) await page.screenshot({path: process.env.OUT});
await browser.close();
