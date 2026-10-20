// Screenshots for the Dashboards docs (platform/explore/dashboards/*). Run scripts/seed-dashboards.mjs first.
// Every prepare() starts from the Dashboards list, opens a dashboard by name and drives the UI from there.
const ws = '/explore/default';
const link = (page, name) => page.getByRole('link', {name, exact: true}).first();
const open = (name) => async (page) => {
  // The auto-apply switch is a per-dashboard browser preference; start every shot from the default (on).
  await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('egret:dash-auto-apply:')).forEach((k) => localStorage.removeItem(k)));
  await link(page, name).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);
};
const edit = (name, then) => async (page) => {
  await open(name)(page);
  await page.getByRole('button', {name: 'Edit', exact: true}).click();
  await page.waitForTimeout(2500);
  if (then) await then(page);
};
const settle = (page, ms = 800) => page.waitForTimeout(ms);
const SP = 'Sales performance';

export const shots = [
  {id: 'dashboards/list', path: `${ws}/dashboards`, settle: 1500},
  {
    id: 'dashboards/new-dialog', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await page.getByRole('button', {name: '+ Dashboard'}).click();
      await page.getByPlaceholder('Name').fill('Weekly sales review');
      await page.getByLabel('Description').fill('What changed in sales since last week.');
    },
  },
  {
    id: 'dashboards/tab-orders', path: `${ws}/dashboards`,
    prepare: async (page) => { await open(SP)(page); await page.getByRole('tab', {name: 'Orders'}).click(); await settle(page, 2500); },
  },
  {
    id: 'dashboards/edit-mode', path: `${ws}/dashboards`, prepare: edit(SP), settle: 1500,
  },
  {
    id: 'dashboards/edit-add-chart', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => { await page.getByRole('button', {name: 'add chart'}).click(); await page.getByLabel('search charts').fill('revenue'); await settle(page); }),
  },
  {
    id: 'dashboards/edit-add-sections', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => { await page.getByRole('button', {name: 'add section'}).click(); await settle(page); }),
  },
  {
    id: 'dashboards/edit-add-text-menu', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => { await page.getByRole('button', {name: 'add text or heading'}).click(); await settle(page); }),
  },
  {
    id: 'dashboards/edit-more-menu', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => { await page.getByRole('button', {name: 'dashboard actions'}).click(); await settle(page); }),
  },
  {
    id: 'dashboards/edit-card-settings', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => {
      await page.getByTestId('dashcard-body').nth(3).click({position: {x: 200, y: 120}});
      await settle(page, 1200);
    }),
  },
  {
    id: 'dashboards/edit-card-toolbar', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => {
      await page.getByTestId('dashcard-body').nth(1).hover();
      await settle(page, 600);
    }),
  },
  {
    id: 'dashboards/edit-filter-settings', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => { await page.getByText('Status', {exact: true}).first().click(); await settle(page, 1500); }),
  },
  {
    id: 'dashboards/edit-filter-mapping', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => { await page.getByText('Priority', {exact: true}).first().click(); await settle(page, 1500); }),
  },
  {
    id: 'dashboards/edit-tab-menu', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => { await page.getByRole('button', {name: 'tab menu Overview'}).click({force: true}); await settle(page); }),
  },

  // ---- view mode: filters, refresh, info, menus ----
  {
    id: 'dashboards/filter-status', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await open(SP)(page);
      await page.getByRole('button', {name: 'Status', exact: true}).click();
      await page.getByLabel('option O').click();
      await page.getByLabel('option P').click();
      await settle(page, 2500);
    },
  },
  {
    id: 'dashboards/filter-date', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await open(SP)(page);
      await page.getByRole('button', {name: 'Order date', exact: true}).click();
      await settle(page, 800);
    },
  },
  {
    id: 'dashboards/filter-grouping', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await open(SP)(page);
      await page.getByRole('button', {name: 'Time grouping', exact: true}).click();
      await page.getByLabel('Time grouping value').selectOption('quarter');
      await settle(page, 2500);
    },
  },
  {
    id: 'dashboards/filter-apply-bar', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await open(SP)(page);
      await page.getByRole('switch', {name: 'auto-apply filters'}).click();
      await page.getByRole('button', {name: 'Priority', exact: true}).click();
      await page.getByLabel('option 1-URGENT').click();
      await page.keyboard.press('Escape');
      await settle(page, 1000);
    },
  },
  {
    id: 'dashboards/refresh-menu', path: `${ws}/dashboards`,
    prepare: async (page) => { await open(SP)(page); await page.getByRole('button', {name: 'Auto Refresh'}).click(); await settle(page); },
  },
  {
    id: 'dashboards/info-overview', path: `${ws}/dashboards`,
    prepare: async (page) => { await open('Executive summary')(page); await page.getByRole('button', {name: 'dashboard info'}).click(); await settle(page, 1200); },
  },
  {
    id: 'dashboards/info-history', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await open(SP)(page);
      await page.getByRole('button', {name: 'dashboard info'}).click();
      await page.getByRole('tab', {name: 'History'}).click();
      await settle(page, 1500);
    },
  },
  {
    id: 'dashboards/view-more-menu', path: `${ws}/dashboards`,
    prepare: async (page) => { await open(SP)(page); await page.getByRole('button', {name: 'dashboard actions'}).click(); await settle(page); },
  },
  {
    id: 'dashboards/card-export', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await open(SP)(page);
      await page.getByTestId('dashcard-body').nth(2).hover();
      await page.getByRole('button', {name: 'Export chart'}).first().click();
      await settle(page, 800);
    },
  },
  {
    id: 'dashboards/drill-menu', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await open(SP)(page);
      await page.getByTestId('dashcard-body').nth(4).click({position: {x: 174, y: 95}});
      await settle(page, 800);
    },
  },
  {
    id: 'dashboards/fullscreen', path: `${ws}/dashboards`,
    prepare: async (page) => { await open('Order operations')(page); await page.getByRole('button', {name: 'fullscreen'}).click(); await settle(page, 5000); },
  },
  {id: 'dashboards/inline-filter', path: `${ws}/dashboards`, prepare: open('Order operations'), settle: 5000},
  {id: 'dashboards/fixed-width', path: `${ws}/dashboards`, prepare: open('Executive summary'), settle: 1500},
  // ---- list page ----
  {
    id: 'dashboards/row-menu', path: `${ws}/dashboards`,
    prepare: async (page) => { await page.getByRole('row', {name: /Sales performance/}).getByRole('button').last().click(); await settle(page); },
  },
  {
    id: 'dashboards/share-dialog', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await page.getByRole('row', {name: /Sales performance/}).getByRole('button').last().click();
      await page.getByRole('menuitem', {name: /Share/}).click();
      await settle(page, 1500);
    },
  },
  {
    id: 'dashboards/share-inherited', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await page.getByRole('row', {name: /Executive summary/}).getByRole('button').last().click();
      await page.getByRole('menuitem', {name: /Share/}).click();
      await settle(page, 1500);
    },
  },
  {
    id: 'dashboards/drill-records', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await open(SP)(page);
      await page.getByTestId('dashcard-body').nth(4).click({position: {x: 174, y: 95}});
      await page.getByText('See these records').click();
      await settle(page, 4000);
    },
  },
  {
    id: 'dashboards/bulk-select', path: `${ws}/dashboards`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Bulk select'}).click();
      await page.getByLabel('Select Order operations').check();
      await settle(page, 600);
    },
  },

  // ---- more edit-mode states ----
  {
    id: 'dashboards/edit-empty', path: `${ws}/dashboards`,
    prepare: edit('Regional review (draft)'),
  },
  {
    id: 'dashboards/edit-viz-panel', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => {
      await page.getByTestId('dashcard-body').nth(3).hover();
      await page.getByRole('button', {name: 'card visualization'}).nth(0).click({force: true});
      await settle(page, 1500);
      // The forced click scrolls the edit banner out of view; bring it back.
      await page.evaluate(() => document.querySelectorAll('*').forEach((el) => { if (el.scrollTop > 0) el.scrollTop = 0; }));
      await settle(page, 500);
    }),
  },
  {
    id: 'dashboards/edit-link-settings', path: `${ws}/dashboards`,
    prepare: edit('Executive summary', async (page) => {
      await page.getByTestId('dashcard-body').nth(4).click();
      await settle(page, 1000);
    }),
  },
  {
    id: 'dashboards/edit-iframe-settings', path: `${ws}/dashboards`,
    prepare: edit('Executive summary', async (page) => {
      await page.getByRole('button', {name: 'add a link or iframe'}).click();
      await page.getByRole('menuitem', {name: 'Iframe'}).click();
      await page.getByLabel('iframe url or embed code').fill('https://www.youtube.com/embed/dQw4w9WgXcQ');
      await settle(page, 1200);
    }),
  },
  {
    id: 'dashboards/edit-discard', path: `${ws}/dashboards`,
    prepare: edit(SP, async (page) => {
      await page.getByLabel('dashboard name').fill('Sales performance (draft)');
      await page.getByRole('button', {name: 'Cancel'}).click();
      await settle(page, 800);
    }),
  },
  // ---- trash ----
  {
    id: 'dashboards/trash', path: `${ws}/dashboards`,
    prepare: async (page) => { await page.getByRole('button', {name: 'Trash'}).click(); await settle(page, 1200); },
    // One trashed dashboard: crop the empty lower half.
    clip: {x: 0, y: 0, width: 1440, height: 330},
  },
  {
    id: 'dashboards/view', path: `${ws}/dashboards`,
    prepare: async (page) => { await page.setViewportSize({width: 1440, height: 1000}); await open(SP)(page); },
    settle: 2500,
  },
];
