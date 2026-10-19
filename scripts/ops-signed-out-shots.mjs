// Signed-out screenshots for the `ops` docs area: the sign-in page, the break-glass form and the
// identity provider's login form. These cannot go through scripts/screenshots.mjs because that
// harness reuses a signed-in session. Nothing is submitted, so no sign-in attempt is counted
// against the rate limit.
// Usage: BASE=http://localhost:5180 node scripts/ops-signed-out-shots.mjs
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5180';
const OUT = new URL('../static/img/platform/ops/get-started/', import.meta.url).pathname;
mkdirSync(OUT, {recursive: true});

const browser = await chromium.launch();
const fresh = async () => {
  const ctx = await browser.newContext({viewport: {width: 1440, height: 900}});
  return {ctx, page: await ctx.newPage()};
};
const clip = {x: 420, y: 150, width: 600, height: 600};

let {ctx, page} = await fresh();
await page.goto(`${BASE}/login`, {waitUntil: 'networkidle'});
await page.screenshot({path: `${OUT}sign-in.png`, clip});
await page.getByRole('button', {name: /break-glass/i}).click();
await page.waitForTimeout(500);
await page.screenshot({path: `${OUT}sign-in-break-glass.png`, clip});
await ctx.close();

({ctx, page} = await fresh());
await page.goto(`${BASE}/login`, {waitUntil: 'networkidle'});
await page.getByRole('button', {name: /sign in with sso/i}).click();
await page.waitForSelector('#username', {timeout: 30000});
await page.waitForTimeout(800);
await page.screenshot({path: `${OUT}sso-keycloak.png`});
await ctx.close();
await browser.close();
console.log('done');
