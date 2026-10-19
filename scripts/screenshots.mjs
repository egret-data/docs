// Re-runnable screenshot capture for the docs.
// Usage: BASE=http://localhost:5180 node scripts/screenshots.mjs [shot-id ...]
// Logs in ONCE (the login endpoint is rate limited to 5 attempts / 5 min) and reuses the session.
// Output: static/img/platform/<id>.png at 1440x900. Only ever point this at a seeded demo instance.
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
import {shots} from './shots.mjs';

const BASE = process.env.BASE ?? 'http://localhost:5180';
const EMAIL = process.env.EGRET_ADMIN_EMAIL ?? 'admin@egret.local';
const PASSWORD = process.env.EGRET_ADMIN_PASSWORD ?? 'Admin12345!';
const OUT = new URL('../static/img/platform/', import.meta.url).pathname;
const only = new Set(process.argv.slice(2));

mkdirSync(OUT, {recursive: true});
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 1});
const page = await ctx.newPage();

// The login page itself is a screenshot, taken before signing in.
const wanted = (id) => only.size === 0 || only.has(id);
if (wanted('login')) {
  await page.goto(`${BASE}/login`, {waitUntil: 'networkidle'});
  await page.screenshot({path: `${OUT}login.png`});
  console.log('login');
}

await page.goto(`${BASE}/login`, {waitUntil: 'networkidle'});
await page.getByLabel(/email/i).fill(EMAIL);
await page.getByLabel(/password/i).fill(PASSWORD);
await page.getByRole('button', {name: /sign in|log in/i}).click();
await page.waitForURL((u) => !u.pathname.startsWith('/login'), {timeout: 30000});

for (const s of shots) {
  if (s.id === 'login' || !wanted(s.id)) continue;
  await page.goto(`${BASE}${s.path}`, {waitUntil: 'networkidle'});
  if (s.prepare) await s.prepare(page);
  await page.waitForTimeout(s.settle ?? 800);
  await page.screenshot({path: `${OUT}${s.id}.png`, fullPage: s.fullPage ?? false});
  console.log(s.id);
}
await browser.close();
