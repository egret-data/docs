// Signed-out screenshots for the `ops` docs area: the sign-in page, the break-glass form and the
// identity provider's login form. These cannot go through scripts/screenshots.mjs because that
// harness reuses a signed-in session. Nothing is submitted, so no sign-in attempt is counted
// against the rate limit.
// Usage: BASE=http://egret.localtest.me:8080 node scripts/ops-signed-out-shots.mjs
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
// The page renders nothing until /api/auth/config has answered, so wait for the SSO button, then
// crop to the sign-in card with a margin (the rest of the page is empty).
const card = async (page) => {
  const box = await page.getByText('Sign in to Egret').locator('xpath=ancestor::*[contains(@class,"border")][1]').boundingBox();
  const m = 48;
  return {x: box.x - m, y: box.y - m, width: box.width + 2 * m, height: box.height + 2 * m};
};

let {ctx, page} = await fresh();
await page.goto(`${BASE}/login`, {waitUntil: 'networkidle'});
const breakGlass = page.getByRole('button', {name: /break-glass/i});
await breakGlass.waitFor({timeout: 30000});
await page.screenshot({path: `${OUT}sign-in.png`, clip: await card(page)});
await breakGlass.click();
await page.getByPlaceholder('Email').waitFor();
await page.waitForTimeout(300);
await page.screenshot({path: `${OUT}sign-in-break-glass.png`, clip: await card(page)});
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
