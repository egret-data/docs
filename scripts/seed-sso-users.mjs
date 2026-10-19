// Sign in once as each demo SSO user so the platform learns them (and their groups) from the identity provider.
// Users come from deploy/keycloak/egret-realm.json in the platform repo. Usage: BASE=http://localhost:5180 node scripts/seed-sso-users.mjs
import {chromium} from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:5180';
const users = [
  ['admin-sso', 'Admin12345!'],
  ['member-sso', 'Member12345!'],
  ['tester', 'pw'],
];
const browser = await chromium.launch();
for (const [user, password] of users) {
  const ctx = await browser.newContext({viewport: {width: 1440, height: 900}});
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`, {waitUntil: 'networkidle'});
  await page.getByRole('button', {name: /sign in with sso/i}).click();
  await page.waitForSelector('#username', {timeout: 30000});
  await page.fill('#username', user);
  await page.fill('#password', password);
  await page.click('#kc-login');
  await page.waitForURL((u) => u.origin === new URL(BASE).origin && !u.pathname.startsWith('/login'), {timeout: 30000});
  console.log('signed in', user, page.url());
  await ctx.close();
}
await browser.close();
