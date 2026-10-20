// Register the demo Trino as an external engine (a record only: egret does not provision or monitor it).
// Usage: BASE=http://egret.localtest.me:18080 STATE=<admin storage state> node scripts/seed-governance-ui.mjs
import {chromium} from 'playwright';

const BASE = process.env.BASE ?? 'http://egret.localtest.me:18080';
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, storageState: process.env.STATE});
const page = await ctx.newPage();

await page.goto(`${BASE}/control-plane/engines/register`, {waitUntil: 'networkidle'});
await page.getByLabel('Name').fill('trino-demo-ext');
await page.getByLabel('Host').fill('trino-demo');
await page.getByLabel('Port').fill('8080');
await page.getByRole('combobox').filter({hasText: /choose a version/i}).click();
console.log('versions:', await page.getByRole('option').allTextContents());
await page.getByRole('option', {name: '2.8.0'}).click();
await page.getByText('tpch_bench', {exact: true}).click();
await page.getByRole('button', {name: 'Register engine'}).click();
await page.waitForTimeout(3000);
console.log('after register:', page.url());
console.log('buttons:', (await page.getByRole('button').allTextContents()).filter(Boolean).join(' | '));
if (process.env.OUT) await page.screenshot({path: process.env.OUT, fullPage: true});
await browser.close();
