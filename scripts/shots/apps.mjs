// Screenshots for the Apps pages (area: apps). Objects used (created by scripts/seed-apps.mjs): the apps
// "Revenue explorer" (v1 to v4, three shares, folder "Sales analysis"), "Order trends", "Customer lookup" and
// the draft-only "Shipping modes". The editor and the viewer are marimo, served from the apps origin
// (apps.localtest.me on the demo stack) inside an iframe; a cold start can take a minute.
const ws = '/explore/default';
const START_MS = 180_000;

const appHref = async (page, name) =>
  new URL((await page.getByRole('link', {name, exact: true}).getAttribute('href')).replace(/\/edit$/, ''), page.url()).href;
const rowActions = (name) => async (page) => {
  await page.getByRole('row').filter({hasText: name}).getByRole('button', {name: 'Actions'}).click();
};
/** The marimo frame: the iframe whose document is on the apps origin. */
async function appsFrame(page, selector) {
  const handle = await page.locator(selector).elementHandle({timeout: 60_000});
  const frame = await handle.contentFrame();
  await frame.waitForURL((u) => u.host.startsWith('apps.'), {timeout: START_MS});
  return frame;
}
const openEditor = async (page, name) => {
  await page.goto(`${await appHref(page, name)}/edit`);
  return appsFrame(page, "iframe[title$=' editor']");
};
const openViewer = async (page, name, text) => {
  await page.goto(await appHref(page, name));
  const frame = await appsFrame(page, `iframe[title='${name}']`);
  await frame.getByText(text).first().waitFor({timeout: START_MS});
  return frame;
};

const list = [
  {
    id: 'apps/apps-list',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.getByText('Customer lookup').waitFor();
      await page.setViewportSize({width: 1440, height: 600});
    },
    settle: 1000,
  },
  {
    id: 'apps/create-dialog',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.getByRole('button', {name: '+ App'}).click();
      await page.getByLabel('Name', {exact: true}).fill('Shipping costs');
    },
    settle: 800,
  },
  {id: 'apps/row-menu', path: `${ws}/apps`, prepare: rowActions('Revenue explorer'), settle: 600},
  {
    id: 'apps/editor',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.setViewportSize({width: 1440, height: 1100});
      const frame = await openEditor(page, 'Revenue explorer');
      await frame.getByText('import egret_marimo').first().waitFor({timeout: START_MS});
      // Run every cell (the global run button is the last one), then scroll to the query and its output.
      await frame.locator('[data-testid="run-button"]').last().click();
      await frame.getByText('1-URGENT').first().waitFor({timeout: 90_000});
      // A reused session shows a "Reconnected" banner over the first cell: close it.
      const reconnected = frame.getByText('Reconnected', {exact: true});
      if (await reconnected.isVisible()) await reconnected.locator('xpath=ancestor::div[.//button][1]').getByRole('button').last().click().catch(() => {});
      await frame.getByText('egret.sql(').first().evaluate((el) => el.scrollIntoView({block: 'start'}));
      await page.waitForTimeout(3000);
    },
    settle: 1000,
  },
  {
    id: 'apps/viewer',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await openViewer(page, 'Revenue explorer', '1-URGENT');
      await page.waitForTimeout(3000);
    },
    settle: 1000,
  },
  {
    id: 'apps/viewer-trends',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await openViewer(page, 'Order trends', 'Most orders in one month');
      await page.waitForTimeout(3000);
    },
    settle: 1000,
  },
  {
    id: 'apps/not-published',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.goto(await appHref(page, 'Shipping modes'));
      await page.getByText('Nobody has published this app yet').waitFor();
      await page.setViewportSize({width: 1440, height: 400});
    },
    settle: 500,
  },
  {
    id: 'apps/versions-dialog',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.goto(`${await appHref(page, 'Revenue explorer')}/edit`);
      await page.getByRole('button', {name: 'Versions'}).click();
      await page.getByRole('dialog').getByText('v4', {exact: true}).waitFor();
    },
    settle: 800,
  },
  {
    id: 'apps/restore-dialog',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.goto(`${await appHref(page, 'Revenue explorer')}/edit`);
      await page.getByRole('button', {name: 'Versions'}).click();
      await page.getByRole('dialog').getByRole('button', {name: 'Restore'}).nth(2).click();
    },
    settle: 800,
  },
  {
    id: 'apps/share-dialog',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await rowActions('Revenue explorer')(page);
      await page.getByRole('menuitem', {name: 'Share…'}).click();
      await page.getByText('carla.mendes@egret.local').waitFor();
    },
    settle: 800,
  },
];

// screenshots.mjs reuses one page, so a viewport set by one shot would leak into the next: each shot starts at
// 1440x900 unless its own prepare changes it.
export const shots = list.map((s) => ({
  ...s,
  prepare: async (page) => {
    await page.setViewportSize({width: 1440, height: 900});
    if (s.prepare) await s.prepare(page);
  },
}));
