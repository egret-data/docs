// Captures the screenshots of platform/data-governance/engines-and-policy/trino-on-opa.md:
//   admin/gov-opa-access-control  the Advanced tab of trino-opa, Access control with OPA selected
//   admin/gov-opa-switch-dialog   the Switch to OPA? dialog on the Ranger profile docs-opa-refused
//   admin/gov-opa-switch-refused  the refusal listed after Switch (the profile holds the `all - …` defaults)
//   admin/gov-opa-trino-config    Plugin → Download Trino config of trino-opa, on OPA
//   admin/gov-opa-explain         Who can read? on lake.s1.t2 for bob, answered by the OPA profile
// The demo stack has no OPA profile, so these come from the platform's OPA end-to-end stack only
// (egret-data/platform scripts/opa-e2e/up.sh: egret on 127.0.0.1:28081, profile opa_e2e on OPA, provisioned
// engine trino-opa, catalog lake, users ann and bob). Serve the platform frontend in front of it (Vite, /api
// proxied to 28081), then:
//   BASE=http://localhost:5181 node scripts/capture-trino-on-opa.mjs
// It creates the Trino profile docs-opa-refused and seeds its default policies, so that its switch is refused.
// Delete the profile under Engine & policy afterwards, or run the stack's down.sh.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5181';
const EMAIL = process.env.EGRET_ADMIN_EMAIL ?? 'admin@egret.local';
const PASSWORD = process.env.EGRET_ADMIN_PASSWORD ?? 'Admin12345!';
const OUT = process.env.OUT_DIR ?? new URL('../static/img/platform/admin/', import.meta.url).pathname;
const REFUSED = 'docs-opa-refused';
mkdirSync(OUT, {recursive: true});

const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 1, colorScheme: 'light'});
const page = await ctx.newPage();
await page.goto(`${BASE}/login`, {waitUntil: 'networkidle'});
await page.getByPlaceholder('Email').fill(EMAIL);
await page.getByPlaceholder('Password').fill(PASSWORD);
await page.getByRole('button', {name: /sign in|log in/i}).click();
await page.waitForURL((u) => !u.pathname.startsWith('/login'), {timeout: 30000});

// The refused profile: a Trino profile with the `all - …` defaults (Ranger, no engine).
const csrf = (await ctx.cookies()).find((c) => c.name === 'egret_csrf')?.value ?? '';
const call = (method, url, data) =>
  ctx.request.fetch(`${BASE}${url}`, {method, headers: {'X-Egret-CSRF': csrf}, ...(data ? {data} : {})});
const made = await call('POST', '/api/control-plane/policies/services', {name: REFUSED, type: 'trino'});
if (!made.ok() && made.status() !== 409) throw new Error(`profile ${REFUSED}: ${made.status()}`);
const seeded = await call('POST', `/api/control-plane/policies/services/${REFUSED}/seed-defaults`);
if (!seeded.ok()) throw new Error(`seed-defaults: ${seeded.status()}`);

const shot = async (id, target = page) => {
  await page.waitForTimeout(800);
  await target.screenshot({path: `${OUT}${id}.png`});
  console.log(id);
};
const tab = async (name) => {
  await page.getByRole('tab', {name, exact: true}).first().click();
  await page.waitForTimeout(1200);
};
const openEngines = async () => {
  await page.goto(`${BASE}/governance/engines`, {waitUntil: 'networkidle'});
  await page.waitForTimeout(1500);
};

// 1. trino-opa → Advanced → Access control, OPA selected.
await openEngines();
await page.locator('main').getByText('trino-opa', {exact: true}).first().click();
await page.waitForLoadState('networkidle');
await tab('Advanced');
await page.getByText('How engines are asked').scrollIntoViewIfNeeded();
await shot('gov-opa-access-control');

// 4. trino-opa → Plugin → Download Trino config (the OPA files).
await tab('Plugin');
await page.getByRole('button', {name: 'Download Trino config'}).click();
await page.getByRole('dialog').getByText('access-control.properties').first().waitFor();
await shot('gov-opa-trino-config');
await page.keyboard.press('Escape');

// 2 and 3. docs-opa-refused → Advanced → OPA → Switch to OPA? → Switch → refused.
await openEngines();
await page.locator('main').getByRole('link', {name: REFUSED, exact: true}).first().click();
await page.waitForLoadState('networkidle');
await tab('Advanced');
await page.getByText('How engines are asked').scrollIntoViewIfNeeded();
await page.getByLabel('OPA', {exact: true}).click();
await page.getByRole('alertdialog').waitFor();
await shot('gov-opa-switch-dialog');
await page.getByRole('alertdialog').getByRole('button', {name: 'Switch'}).click();
await page.getByText(/delete them first/).first().waitFor();
await page.getByText('How engines are asked').scrollIntoViewIfNeeded();
await shot('gov-opa-switch-refused');

// 5. Who can read? on lake.s1.t2 for bob (up.sh's one grant): the OPA profile's answer.
await page.goto(`${BASE}/governance/data/lake/s1/t2`, {waitUntil: 'networkidle'});
await page.waitForTimeout(1500);
await page.getByRole('button', {name: 'Who can read?'}).click();
const d = page.getByRole('dialog');
await d.getByRole('combobox').nth(1).click();
await page.keyboard.type('bob');
await page.waitForTimeout(1500);
await page.getByRole('option').first().click();
await d.getByRole('button', {name: 'Explain'}).click();
await page.waitForTimeout(4000);
await shot('gov-opa-explain');

await browser.close();
