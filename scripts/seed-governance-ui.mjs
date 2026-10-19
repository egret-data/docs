// Register the demo Trino as an external engine (a record only: egret does not provision or monitor it).
// Usage: BASE=http://localhost:5180 STATE=/tmp/egret-state.json node scripts/seed-governance-ui.mjs
import {chromium} from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:5180';
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, storageState: process.env.STATE});
const page = await ctx.newPage();

await page.goto(`${BASE}/control-plane/engines/register`, {waitUntil: 'networkidle'});
await page.getByLabel('Name').fill('docs-trino');
await page.getByLabel('Host').fill('localhost');
await page.getByLabel('Port').fill('8091');
await page.getByRole('combobox').filter({hasText: /choose a version/i}).click();
console.log('versions:', await page.getByRole('option').allTextContents());
await page.getByRole('option').first().click();
await page.getByRole('button', {name: 'Register engine'}).click();
await page.waitForTimeout(3000);
console.log('after register:', page.url());
console.log('buttons:', (await page.getByRole('button').allTextContents()).filter(Boolean).join(' | '));
if (process.env.OUT) await page.screenshot({path: process.env.OUT, fullPage: true});
await browser.close();
