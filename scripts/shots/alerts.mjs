// Screenshots for the Alerts & reports docs (platform/explore/alerts-and-reports/*).
// Run scripts/seed-dashboards.mjs and then `scripts/seed-alerts.mjs --run` first, so the lists, run logs
// and the Mailpit inbox have content. Mail shots read Mailpit (MAILPIT, default http://localhost:8025):
// the demo stack delivers every mail there.
// DOCS_WS picks the workspace the Explore objects live in (default: `default`).
const ws = `/explore/${process.env.DOCS_WS ?? 'default'}`;
// The alert whose run log alerts/run-log shows (RUN_LOG_ALERT overrides it).
const RUN_LOG_ALERT = process.env.RUN_LOG_ALERT ?? 'Pending orders above 100';
const MAILPIT = process.env.MAILPIT ?? 'http://localhost:8025';
// Every shot sets its own height, so a tall shot never leaks its viewport into the next one.
const vp = (page, h = 900) => page.setViewportSize({width: 1440, height: h});
const tall = (h) => (page) => vp(page, h);

// Open the newest mail whose subject contains `subject` in Mailpit's own viewer.
const mail = (subject, h = 900) => async (page) => {
  await vp(page, h);
  const r = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`subject:"${subject}"`)}&limit=1`);
  const id = (await r.json()).messages?.[0]?.ID;
  if (!id) throw new Error(`no mail with subject "${subject}" in Mailpit; run scripts/seed-alerts.mjs --run`);
  await page.goto(`${MAILPIT}/view/${id}`, {waitUntil: 'networkidle'});
  await page.waitForTimeout(1500);
};
const openItem = (name, h = 1000) => async (page) => {
  await vp(page, h);
  await page.getByText(name, {exact: true}).first().click();
  await page.waitForLoadState('networkidle');
};
const reportsTab = async (page) => {
  await page.getByRole('tab', {name: 'Reports'}).click();
  await page.waitForTimeout(1200);
};

export const shots = [
  {id: 'alerts/alerts-list', path: `${ws}/alerts`, prepare: tall(900), settle: 2000},
  {id: 'alerts/reports-list', path: `${ws}/alerts`, prepare: async (page) => { await vp(page); await reportsTab(page); }, settle: 1500},
  {
    id: 'alerts/editor-general',
    path: `${ws}/alerts/new`,
    prepare: async (page) => {
      await vp(page, 1000);
      await page.getByLabel('Name', {exact: true}).fill('Open orders above 1 000');
      await page.getByLabel('Description').fill('Tell the ops channel when the open backlog grows');
    },
    settle: 1500,
  },
  {
    id: 'alerts/editor-condition',
    path: `${ws}/alerts/new?section=what`,
    prepare: async (page) => {
      await vp(page, 1000);
      await page.getByPlaceholder(/SELECT count/).fill("SELECT count(*) FROM tpch.tiny.orders WHERE orderstatus = 'O'");
    },
    settle: 1500,
  },
  {id: 'alerts/editor-schedule', path: `${ws}/alerts/new?section=schedule`, prepare: tall(1100), settle: 1500},
  {id: 'alerts/editor-notification', path: `${ws}/alerts/new?section=notification`, prepare: tall(1300), settle: 1500},
  {id: 'alerts/editor-dataapi', path: `${ws}/alerts/new?type=dataapi_alert&section=what`, prepare: tall(1000), settle: 2000},
  {id: 'alerts/editor-report', path: `${ws}/alerts/new?type=report&section=what`, prepare: tall(1000), settle: 2000},
  {
    id: 'alerts/run-log',
    path: `${ws}/alerts`,
    prepare: async (page) => {
      await vp(page);
      await page.getByRole('button', {name: `Run log for ${RUN_LOG_ALERT}`}).click();
      await page.waitForTimeout(1500);
    },
    settle: 500,
  },
  {
    id: 'alerts/run-log-report-error',
    path: `${ws}/alerts`,
    prepare: async (page) => {
      await vp(page);
      await reportsTab(page);
      await page.getByRole('button', {name: 'Run log for Sales performance weekly digest'}).click();
      await page.waitForTimeout(1500);
    },
    settle: 500,
  },
  {
    id: 'alerts/row-menu',
    path: `${ws}/alerts`,
    prepare: async (page) => {
      await vp(page);
      await page.getByRole('button', {name: 'Actions for Pending orders above 100'}).click();
    },
    settle: 600,
  },
  {
    id: 'alerts/editor-destinations',
    path: `${ws}/alerts/new?section=notification`,
    prepare: async (page) => {
      await vp(page, 1100);
      const add = async (kind) => {
        await page.getByRole('button', {name: 'Add delivery method'}).click();
        await page.getByRole('menuitem', {name: kind}).click();
      };
      await add('Email');
      await page.getByPlaceholder('on-call@example.com, team@example.com').fill('ops@example.com, data-team@example.com');
      await add('Webhook');
      await page.getByPlaceholder('https://hooks.example.com/egret').fill('https://hooks.example.com/egret');
      await add('Slack');
      await page.getByPlaceholder('#data-alerts').fill('#data-alerts');
    },
    settle: 800,
  },
  {id: 'alerts/detail', path: `${ws}/alerts`, prepare: openItem('Pending orders above 100'), settle: 1500},
  {
    id: 'alerts/editor-attachment',
    path: `${ws}/alerts`,
    prepare: async (page) => {
      await openItem('Pending orders above 100', 1300)(page);
      await page.getByRole('tab', {name: 'Notification'}).click();
      await page.waitForTimeout(1200);
    },
    settle: 800,
  },
  // ---- what arrives: the demo stack's Mailpit inbox ----
  // Clipped to the message pane: the inbox column lists every mail on the shared demo stack.
  {id: 'alerts/mail-alert', path: `${ws}/alerts`, prepare: mail('Pending orders above 100', 1250), clip: {x: 360, y: 60, width: 1080, height: 1190}, settle: 800},
  {id: 'alerts/mail-report-png', path: `${ws}/alerts`, prepare: mail('Executive summary', 1100), clip: {x: 360, y: 60, width: 1080, height: 1040}, settle: 800},
  {id: 'alerts/mail-report-pdf', path: `${ws}/alerts`, prepare: mail('Leadership pack'), clip: {x: 360, y: 60, width: 1080, height: 730}, settle: 800},
  {id: 'alerts/mail-report-text', path: `${ws}/alerts`, prepare: mail('Revenue by status (text)'), clip: {x: 360, y: 60, width: 1080, height: 560}, settle: 800},
];
