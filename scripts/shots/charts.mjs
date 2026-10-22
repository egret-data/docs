// Screenshots for platform/explore/charts/*. Charts and datasets come from scripts/seed-charts-deep.mjs;
// folders, bookmarks and the trashed chart from scripts/seed-sql-charts-lists.mjs.
// Every prepare() starts on the Charts list, finds the chart by its exact name, and opens the wanted tab.
// DOCS_WS picks the workspace the Explore objects live in (default: `default`).
const ws = `/explore/${process.env.DOCS_WS ?? 'default'}`;
const PANEL = 'div[class*="w-[400px]"]';

const open = (name, tab, then) => async (page) => {
  await page.getByPlaceholder('Search charts…').fill(name);
  await page.locator('a').filter({hasText: new RegExp(`^\\s*${name}\\s*$`)}).first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);
  if (tab) await page.getByRole('tab', {name: tab, exact: true}).click();
  await page.waitForTimeout(500);
  if (then) await then(page);
};
const scroll = (y) => (page) => page.locator(PANEL).evaluate((el, top) => { el.scrollTop = top; }, y);
const shot = (id, name, tab, then, settle = 800) => ({id: `charts/${id}`, path: `${ws}/charts`, prepare: open(name, tab, then), settle});

const hover = (x, y) => async (page) => { await page.waitForTimeout(3500); await page.mouse.move(x, y); await page.mouse.move(x + 4, y + 2); await page.waitForTimeout(900); };
const click = (label, wait = 700) => async (page) => { await page.getByText(label, {exact: true}).first().click(); await page.waitForTimeout(wait); };
const clickRole = (role, name, wait = 700) => async (page) => { await page.getByRole(role, {name}).first().click(); await page.waitForTimeout(wait); };
const seq = (...fns) => async (page) => { for (const f of fns) await f(page); };

export const shots = [
  {id: 'charts/list', path: `${ws}/charts`, settle: 1500},
  // List states. Folders, bookmarks and the trashed chart come from scripts/seed-sql-charts-lists.mjs.
  {id: 'charts/list-folders', path: `${ws}/charts`, settle: 800, prepare: async (page) => {
    await page.waitForTimeout(800);
    await page.locator('tr', {hasText: 'Visitor flow'}).locator('button').last().click();
    await page.waitForTimeout(400);
  }},
  {id: 'charts/list-bulk', path: `${ws}/charts`, settle: 800, prepare: async (page) => {
    await page.waitForTimeout(800);
    await page.getByRole('button', {name: 'Bulk select'}).click();
    await page.getByLabel('Select Total revenue').check();
    await page.getByLabel('Select Orders against target').check();
    await page.waitForTimeout(400);
  }},
  {id: 'charts/list-trash', path: `${ws}/charts`, settle: 800, clip: {x: 224, y: 56, width: 1216, height: 400}, prepare: async (page) => {
    await page.waitForTimeout(800);
    await page.getByRole('button', {name: 'Trash'}).click();
    await page.waitForTimeout(1000);
    await page.locator('tr', {hasText: 'Revenue by clerk (old)'}).locator('button').last().click();
    await page.waitForTimeout(400);
  }},
  {id: 'charts/list-delete-confirm', path: `${ws}/charts`, settle: 800, prepare: async (page) => {
    await page.waitForTimeout(800);
    await page.getByRole('button', {name: 'Trash'}).click();
    await page.waitForTimeout(1000);
    await page.locator('tr', {hasText: 'Revenue by clerk (old)'}).locator('button').last().click();
    await page.getByRole('menuitem', {name: 'Delete permanently'}).click();
    await page.waitForTimeout(600);
  }},
  {id: 'charts/type-gallery', path: `${ws}/charts/new`, settle: 1200},
  {id: 'charts/new-empty', path: `${ws}/charts/new?type=bar`, prepare: async (page) => { await page.getByText('Set up your Bar').waitFor(); }, settle: 800},
  // Editor basics
  shot('editor-tooltip', 'Revenue by order priority', 'Data', hover(940, 520)),
  shot('editor-drill-menu', 'Revenue by order priority', 'Data', async (page) => { await page.waitForTimeout(3500); await page.mouse.click(940, 500); await page.waitForTimeout(700); }),
  shot('editor-export', 'Revenue by order priority', 'Data', async (page) => { await page.waitForTimeout(3000); await page.getByLabel('Export chart').click(); await page.waitForTimeout(500); }),
  shot('editor-view-sql', 'Revenue by order priority', 'Data', async (page) => { await page.waitForTimeout(3000); await click('View SQL', 1500)(page); }),
  shot('editor-save-dialog', 'Revenue by order priority', 'Data', async (page) => { await page.waitForTimeout(3000); await page.getByRole('button', {name: 'Update'}).first().click(); await page.waitForTimeout(600); }),
  shot('editor-change-viz', 'Revenue by order priority', 'Data', async (page) => { await page.waitForTimeout(2500); await page.getByRole('button', {name: 'Change'}).click(); await page.waitForTimeout(700); }),
  shot('editor-add-metric', 'Revenue by order priority', 'Data', async (page) => { await page.waitForTimeout(2500); await page.getByRole('button', {name: 'add y-axis'}).click(); await page.waitForTimeout(600); }),
  shot('editor-sort', 'Revenue by order priority', 'Data', seq(scroll(1000), async (page) => { await page.waitForTimeout(2500); await page.getByRole('combobox', {name: 'add a sort'}).click(); await page.waitForTimeout(500); })),
  shot('editor-temporal', 'Monthly revenue trend', 'Data', async (page) => { await page.waitForTimeout(2500); await page.getByRole('combobox', {name: /Group orderdate by/}).click(); await page.waitForTimeout(500); }),
  // Cartesian family
  shot('bar-data', 'Revenue by priority and status', 'Data'),
  shot('bar-display', 'Revenue by priority and status', 'Display'),
  shot('bar-axes', 'Revenue by priority and status', 'Axes'),
  shot('row-data', 'Top clerks by revenue', 'Data', async (page) => { await page.waitForTimeout(3000); }),
  shot('line-display', 'Monthly revenue trend', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('line-axes', 'Monthly revenue trend', 'Axes', async (page) => { await page.waitForTimeout(3000); }),
  shot('area-display', 'Orders by quarter and priority', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('scatter-data', 'Customer balance vs size by nation', 'Data', async (page) => { await page.waitForTimeout(3000); }),
  shot('scatter-axes', 'Customer balance vs size by nation', 'Axes', async (page) => { await page.waitForTimeout(3000); }),
  shot('combo-display', 'Revenue and orders by year', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('combo-series-settings', 'Revenue and orders by year', 'Display', async (page) => { await page.waitForTimeout(3000); await page.getByRole('button', {name: 'settings order_count'}).click(); await page.waitForTimeout(600); }),
  shot('combo-axes', 'Revenue and orders by year', 'Axes', async (page) => { await page.waitForTimeout(3000); }),
  // Pie and single value charts
  shot('pie-display', 'Order mix by priority', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('pie-slices', 'Order mix by priority', 'Display', seq(async (page) => { await page.waitForTimeout(3000); }, scroll(2000))),
  shot('pie-rings', 'Orders by priority and status', 'Display', async (page) => { await page.waitForTimeout(3500); }),
  shot('scalar-display', 'Total revenue', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('progress-display', 'Orders against target', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('progress-data', 'Orders against target', 'Data', async (page) => { await page.waitForTimeout(3000); }),
  shot('gauge-display', 'Average discount', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('trend-data', 'Revenue vs last month', 'Data', async (page) => { await page.waitForTimeout(3000); }),
  shot('trend-display', 'Revenue vs last month', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  // Flow and distribution charts
  shot('funnel-data', 'Checkout conversion', 'Data', async (page) => { await page.waitForTimeout(3000); }),
  shot('funnel-display', 'Checkout conversion', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('funnel-bar', 'Checkout conversion', 'Display', async (page) => {
    await page.waitForTimeout(3000);
    await page.getByRole('combobox', {name: 'Funnel type'}).click();
    await page.getByRole('option', {name: /^Bar/}).click();
    await page.waitForTimeout(2500);
  }),
  shot('waterfall-display', 'Profit bridge', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('waterfall-labels', 'Profit bridge', 'Display', async (page) => {
    await page.waitForTimeout(3000);
    await page.getByRole('switch', {name: 'Show values on data points'}).click();
    await page.waitForTimeout(2000);
  }),
  shot('waterfall-axes', 'Profit bridge', 'Axes', async (page) => { await page.waitForTimeout(3000); }),
  shot('boxplot-display', 'Line price spread by ship mode', 'Display', async (page) => { await page.waitForTimeout(4000); }),
  shot('boxplot-points', 'Line price spread by ship mode', 'Display', async (page) => {
    await page.waitForTimeout(4000);
    await page.getByRole('radio', {name: 'All points'}).click();
    await page.getByRole('switch', {name: 'Show values on data points'}).click();
    await page.waitForTimeout(2500);
  }),
  shot('sankey-labels', 'Visitor flow', 'Display', async (page) => {
    await page.waitForTimeout(3000);
    await page.getByRole('switch', {name: 'Show edge labels'}).click();
    await page.waitForTimeout(2000);
  }),
  shot('sankey-display', 'Visitor flow', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  // Maps
  shot('map-region-data', 'Revenue by country', 'Data', async (page) => { await page.waitForTimeout(3000); }),
  shot('map-vietnam', 'Revenue by province', 'Data', async (page) => { await page.waitForTimeout(3500); }),
  shot('map-pin-data', 'Store locations', 'Data', async (page) => { await page.waitForTimeout(3500); }),
  // Tables
  shot('table-data', 'Customers by region', 'Data', async (page) => { await page.waitForTimeout(3000); }),
  shot('table-display', 'Customers by region', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('table-rules', 'Customers by region', 'Conditional formatting', async (page) => { await page.waitForTimeout(3000); }),
  shot('table-rule-editor', 'Customers by region', 'Conditional formatting', async (page) => { await page.waitForTimeout(3000); await page.getByRole('button', {name: 'edit rule 1'}).click(); await page.waitForTimeout(600); }),
  shot('table-column-settings', 'Customers by region', 'Data', async (page) => { await page.waitForTimeout(3000); await page.getByRole('button', {name: 'settings avg_balance'}).click(); await page.waitForTimeout(700); }),
  shot('pivot-data', 'Customers by region and segment', 'Data', async (page) => { await page.waitForTimeout(3000); }),
  shot('pivot-display', 'Customers by region and segment', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('object-display', 'Order record', 'Display', async (page) => { await page.waitForTimeout(3000); }),
  shot('object-data', 'Order record', 'Data', async (page) => { await page.waitForTimeout(3000); }),
];
