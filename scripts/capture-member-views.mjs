// Captures what a workspace viewer sees: the refusal inside the app shell, and Workspace settings with the
// admin-only sections hidden. Needs a Playwright storage state for a local user who is only `ws_viewer` in the
// Default workspace and a member of no other workspace.
// Usage: MEMBER_STATE=/path/member.json BASE=http://egret.localtest.me:18080 node scripts/capture-member-views.mjs
import {chromium} from 'playwright';
const BASE = process.env.BASE ?? 'http://egret.localtest.me:18080';
const OUT = new URL('../static/img/platform/admin/', import.meta.url).pathname;
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, colorScheme: 'light', storageState: process.env.MEMBER_STATE});
const page = await ctx.newPage();

// Control Plane, which the viewer may not open: the refusal sits under the header, with a link to their workspace.
// Opened by its address, so there is no in-app history and no **Go back**.
await page.goto(`${BASE}/control-plane`, {waitUntil: 'networkidle'});
await page.getByText('403 — Forbidden').waitFor();
await page.waitForTimeout(800);
await page.screenshot({path: `${OUT}no-access.png`});

// Workspace settings as a viewer: /settings opens General, the only section a viewer may open.
await page.goto(`${BASE}/explore/default/settings`, {waitUntil: 'networkidle'});
await page.waitForURL(/\/settings\/general/);
await page.waitForTimeout(1000);
await page.screenshot({path: `${OUT}ws-settings-viewer.png`});
await browser.close();
