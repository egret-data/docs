// Captures the "Request access" dialog as the SSO user member-sso (needs a Playwright storage state for that user).
// Usage: MEMBER_STATE=/path/member.json BASE=http://localhost:5180 node scripts/capture-member-request-dialog.mjs
import {chromium} from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:5180';
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, storageState: process.env.MEMBER_STATE});
const page = await ctx.newPage();
await page.goto(`${BASE}/explore/docs-sandbox/sql-lab`, {waitUntil: 'networkidle'});
await page.getByText('Docs sandbox').first().click();
await page.getByText(/Request access/i).first().click();
await page.waitForTimeout(1000);
const d = page.getByRole('dialog');
await d.getByRole('combobox', {name: 'Workspace'}).click();
await page.getByRole('option', {name: 'Default'}).click();
await d.getByLabel('Reason').fill('I need to build dashboards on the orders dataset for the sales review.');
await page.screenshot({path: new URL('../static/img/platform/admin/ws-request-dialog.png', import.meta.url).pathname});
await browser.close();
