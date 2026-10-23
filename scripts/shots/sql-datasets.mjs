// Screenshots for the SQL Lab and Datasets & metrics pages (area: sql-datasets).
// Objects used here are created by scripts/seed-sql-datasets.mjs (datasets "Orders with customers" and
// "Line items", saved queries, snippets, charts, query history).
// DOCS_WS picks the workspace the Explore objects live in (default: `default`).
const ws = `/explore/${process.env.DOCS_WS ?? 'default'}`;

// ---------------------------------------------------------------- SQL Lab helpers
// Replace the editor text.
const typeSql = async (page, sql) => {
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(sql);
};
const run = async (page, wait = 4000) => {
  await page.getByRole('button', {name: /^run/i}).first().click();
  await page.waitForSelector('text=/Done in|Failed in/', {timeout: 60000}).catch(() => {});
  await page.waitForTimeout(Math.min(wait, 1500));
};
// Start from a clean SQL Lab (tabs live in localStorage and would leak between shots).
const fresh = async (page) => {
  await page.evaluate(() => localStorage.clear());
  await page.reload({waitUntil: 'networkidle'});
  await page.waitForTimeout(800);
};
const REVENUE =
  'SELECT orderstatus, count(*) AS orders, round(sum(totalprice), 2) AS revenue FROM tpch.tiny.orders GROUP BY 1 ORDER BY 3 DESC';
// Typed on one line, then laid out by the real Format button.
const typeFormatted = async (page, sql) => {
  await typeSql(page, sql);
  await page.getByRole('button', {name: 'Format'}).click();
  await page.waitForTimeout(400);
};
const expandOrders = async (page) => {
  await page.getByRole('button', {name: 'Expand tpch'}).click();
  await page.getByRole('button', {name: 'Expand tiny'}).click();
  await page.getByRole('button', {name: 'Expand orders', exact: true}).click();
  await page.waitForTimeout(2000);
};
// Drag the bar between the editor and the lower panel up, so a list (History, Saved, Snippets) has room.
const growLower = async (page) => {
  await page.mouse.move(960, 517);
  await page.mouse.down();
  await page.mouse.move(960, 400, {steps: 5});
  await page.mouse.move(960, 330, {steps: 5});
  await page.mouse.up();
  await page.mouse.move(1300, 120);
  await page.waitForTimeout(300);
};
const sqlShot = (id, fn, extra = {}) => ({
  id: `sql-datasets/${id}`,
  path: `${ws}/sql-lab`,
  settle: 800,
  ...extra,
  prepare: async (page) => {
    await fresh(page);
    await fn(page);
  },
});

// ---------------------------------------------------------------- dataset helpers
const openDs = (name, tab) => async (page) => {
  await page.getByPlaceholder('Search name, schema, table…').fill(name);
  await page.getByRole('link', {name, exact: true}).first().click();
  await page.waitForLoadState('networkidle');
  if (tab) await page.getByRole('tab', {name: new RegExp(`^${tab}`)}).click();
  await page.waitForTimeout(800);
};
const dsShot = (id, name, tab, fn, extra = {}) => ({
  id: `sql-datasets/${id}`,
  path: `${ws}/datasets`,
  settle: 1200,
  ...extra,
  prepare: async (page) => {
    await openDs(name, tab)(page);
    if (fn) await fn(page);
  },
});

export const shots = [
  // ---- SQL Lab
  sqlShot('sqllab-empty', async () => {}, {settle: 1500}),
  sqlShot('sqllab-results', async (page) => {
    await typeFormatted(page, REVENUE);
    await run(page);
  }),
  sqlShot('sqllab-autocomplete', async (page) => {
    await expandOrders(page);
    await typeSql(page, 'SELECT orders.');
    await page.keyboard.press('Control+Space');
    await page.waitForTimeout(1200);
  }),
  sqlShot('sqllab-run-selection', async (page) => {
    await typeSql(page, 'SELECT 1 AS first_query;\nSELECT count(*) AS orders FROM tpch.tiny.orders');
    // select the second line only
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.press('Shift+Home');
    await page.waitForTimeout(300);
    await run(page);
  }),
  sqlShot('sqllab-limit', async (page) => {
    await page.getByRole('combobox').filter({hasText: 'rows'}).click();
  }),
  sqlShot('sqllab-palette', async (page) => {
    await page.keyboard.press('ControlOrMeta+k');
  }),
  sqlShot('sqllab-shortcuts', async (page) => {
    await page.getByRole('button', {name: 'More actions'}).click();
    await page.getByRole('menuitem', {name: 'Keyboard shortcuts'}).click();
  }),
  sqlShot('sqllab-more-menu', async (page) => {
    await typeFormatted(page, REVENUE);
    await run(page);
    await page.getByRole('button', {name: 'More actions'}).click();
  }),
  sqlShot('sqllab-params', async (page) => {
    await typeSql(page, 'SELECT orderkey, orderstatus, totalprice FROM tpch.tiny.orders WHERE orderstatus = {{status}} AND totalprice > {{min_total}}');
    await page.getByRole('button', {name: 'Format'}).click();
    await page.getByLabel('Value of status').fill('F');
    await page.getByRole('combobox', {name: 'Type of min_total'}).click();
    await page.getByRole('option', {name: 'num', exact: true}).click();
    await page.getByLabel('Value of min_total').fill('300000');
    await run(page, 3500);
  }),
  sqlShot('sqllab-explain', async (page) => {
    await typeSql(page, 'SELECT * FROM tpch.tiny.nation');
    await page.getByRole('button', {name: 'More actions'}).click();
    await page.getByRole('menuitem', {name: 'Explain query'}).click();
    await page.waitForTimeout(4000);
  }),
  // ---- schema browser
  sqlShot('sqllab-explorer', async (page) => {
    await expandOrders(page);
  }),
  sqlShot('sqllab-explorer-search', async (page) => {
    await page.getByPlaceholder('Search tables…').fill('customer');
    await page.waitForSelector('text=/tpch|tpcds/', {timeout: 15000}).catch(() => {});
    await page.waitForTimeout(2500);
  }),
  sqlShot('sqllab-preview', async (page) => {
    await page.getByRole('button', {name: 'Expand tpch'}).click();
    await page.getByRole('button', {name: 'Expand tiny'}).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', {name: 'Preview orders'}).first().click({force: true});
    await page.waitForTimeout(4500);
  }),
  // ---- results
  sqlShot('sqllab-chart', async (page) => {
    await typeFormatted(page, REVENUE);
    await run(page);
    await page.getByRole('button', {name: 'Chart'}).click();
  }),
  sqlShot('sqllab-export-menu', async (page) => {
    await typeFormatted(page, REVENUE);
    await run(page);
    await page.getByRole('button', {name: 'Export'}).click();
  }),
  sqlShot('sqllab-filter-rows', async (page) => {
    await typeSql(page, 'SELECT nationkey, name, regionkey, comment FROM tpch.tiny.nation ORDER BY name');
    await run(page, 3500);
    await page.getByPlaceholder('Filter rows…').fill('an');
    await page.getByRole('button', {name: /^name/}).click();
    await page.waitForTimeout(400);
  }),
  sqlShot('sqllab-cell', async (page) => {
    await typeSql(page, 'SELECT nationkey, name, comment FROM tpch.tiny.nation ORDER BY name');
    await run(page, 3500);
    await page.locator('td').nth(3).click();
    await page.waitForTimeout(600);
  }),
  sqlShot('sqllab-truncated', async (page) => {
    await typeSql(page, 'TABLE tpch.sf1.orders');
    await run(page, 6000);
  }),
  // ---- history, saved, snippets
  sqlShot('sqllab-history', async (page) => {
    await typeFormatted(page, REVENUE);
    await run(page);
    await page.getByRole('tab', {name: 'History'}).click();
    await growLower(page);
    await page.waitForTimeout(1200);
  }),
  sqlShot('sqllab-saved', async (page) => {
    await page.getByRole('tab', {name: 'Saved'}).click();
    await growLower(page);
    await page.waitForTimeout(800);
    await page.getByText('Top customers by spend').first().hover();
  }),
  sqlShot('sqllab-snippets', async (page) => {
    await page.getByRole('tab', {name: 'Snippets'}).click();
    await growLower(page);
  }),
  sqlShot('sqllab-save-dialog', async (page) => {
    await typeFormatted(page, REVENUE);
    await page.getByRole('button', {name: 'Save', exact: true}).click();
    await page.getByLabel('Name').fill('Revenue by order status');
    await page.getByLabel('Description').fill('Total price and order count per order status.');
  }),
  sqlShot('sqllab-save-dataset', async (page) => {
    await typeFormatted(page, REVENUE);
    await page.getByRole('button', {name: 'Save as dataset'}).click();
    await page.getByPlaceholder('Dataset name').fill('Orders by status');
    await page.getByPlaceholder("What it's for").fill('Order count and revenue per order status.');
  }),
  // Full flow: save the query as a dataset and land on the new dataset page (removes a previous copy first).
  sqlShot('sqllab-dataset-created', async (page) => {
    await page.evaluate(async () => {
      const csrf = document.cookie.split('; ').find((c) => c.startsWith('egret_csrf='))?.split('=')[1] ?? '';
      const list = await (await fetch('/api/ws/default/datasets')).json();
      for (const d of list.filter((x) => x.name === 'Orders by status')) {
        await fetch(`/api/ws/default/datasets/${d.id}`, {method: 'DELETE', headers: {'X-Egret-CSRF': csrf}});
      }
    });
    await typeFormatted(page, REVENUE);
    await page.getByRole('button', {name: 'Save as dataset'}).click();
    await page.getByPlaceholder('Dataset name').fill('Orders by status');
    await page.getByPlaceholder("What it's for").fill('Order count and revenue per order status.');
    await page.getByRole('button', {name: 'Create dataset'}).click();
    await page.waitForURL(/\/datasets\/[0-9a-f-]{36}/, {timeout: 20000});
    await page.waitForTimeout(2500);
  }),
  sqlShot('sqllab-error', async (page) => {
    await typeSql(page, 'SELECT orderstatus, count(*) FROM tpch.tiny.ordres GROUP BY 1');
    await run(page);
  }),

  // ---- Datasets & metrics
  {id: 'sql-datasets/datasets-list', path: `${ws}/datasets`, settle: 1200},
  {
    id: 'sql-datasets/datasets-row-menu',
    path: `${ws}/datasets`,
    prepare: async (page) => {
      await page.locator('tr', {hasText: 'Orders with customers'}).getByTitle('Actions', {exact: true}).click();
    },
  },
  {
    id: 'sql-datasets/datasets-create',
    path: `${ws}/datasets`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Create', exact: true}).click();
      await page.getByRole('combobox').first().click();
      await page.getByRole('option').first().click();
      await page.getByPlaceholder('Dataset name').fill('Customers');
      await page.getByPlaceholder("What it's for").fill('One row per customer (tpch tiny).');
      await page.getByRole('combobox').nth(1).click();
      await page.getByRole('option', {name: 'tpch'}).click();
      await page.getByRole('combobox').nth(2).click();
      await page.getByRole('option', {name: 'tiny'}).click();
      await page.getByRole('combobox').nth(3).click();
      await page.getByRole('option', {name: 'customer'}).click();
    },
  },
  dsShot('ds-columns', 'Orders with customers'),
  dsShot('ds-format-number', 'Orders with customers', undefined, async (page) => {
    await page.getByRole('button', {name: 'Format'}).nth(4).click();
    await page.waitForTimeout(500);
  }),
  dsShot('ds-format-text', 'Orders with customers', undefined, async (page) => {
    await page.getByRole('button', {name: 'Format'}).nth(2).click();
    await page.waitForTimeout(500);
  }),
  dsShot('ds-format-date', 'Orders with customers', undefined, async (page) => {
    await page.getByRole('button', {name: 'Format'}).nth(1).click();
    await page.waitForTimeout(500);
  }),
  dsShot('ds-calc-dialog', 'Line items', undefined, async (page) => {
    await page.getByRole('button', {name: '+ Calculated column'}).click();
    await page.getByLabel('Column name').fill('discount_amount');
    await page.getByLabel('Formula').fill('extendedprice * discount');
    await page.getByLabel(/Display name/).fill('Discount amount');
    await page.getByLabel(/Description/).fill('Money taken off the line by the discount.');
  }),
  dsShot('ds-metrics', 'Orders with customers', 'Metrics'),
  dsShot('ds-metric-dialog', 'Line items', 'Metrics', async (page) => {
    await page.getByRole('button', {name: '+ Metric'}).click();
    await page.getByLabel('Metric name').fill('avg_discount');
    await page.getByLabel('Expression').fill('AVG(discount)');
    await page.getByLabel(/Display name/).fill('Average discount');
    await page.getByLabel(/Description/).fill('Mean discount rate across lines.');
  }),
  dsShot('ds-usage', 'orders', 'Usage'),
  dsShot('ds-preview', 'Orders with customers', 'Preview', undefined, {settle: 3000}),
  dsShot('ds-certify', 'Orders with customers', undefined, async (page) => {
    await page.getByRole('button', {name: 'Certification'}).click();
    await page.waitForTimeout(500);
  }),
  dsShot('ds-edit', 'Orders with customers', undefined, async (page) => {
    await page.getByTitle('Edit', {exact: true}).click();
    await page.waitForTimeout(1500);
  }),
  {
    id: 'sql-datasets/ds-chart-metrics',
    path: `${ws}/charts`,
    prepare: async (page) => {
      await page.getByText('Orders by size band', {exact: true}).first().click();
      await page.waitForLoadState('networkidle');
    },
    settle: 4000,
  },
  {
    id: 'sql-datasets/datasets-share',
    path: `${ws}/datasets`,
    prepare: async (page) => {
      await page.locator('tr', {hasText: 'Line items'}).getByTitle('Actions', {exact: true}).click();
      await page.getByRole('menuitem', {name: 'Share…'}).click();
      await page.waitForTimeout(1500);
    },
  },
  {
    id: 'sql-datasets/datasets-tags',
    path: `${ws}/datasets`,
    prepare: async (page) => {
      await page.locator('tr', {hasText: 'Line items'}).getByTitle('Actions', {exact: true}).click();
      await page.getByRole('menuitem', {name: 'Tags…'}).click();
      await page.waitForTimeout(1500);
      // Open the Add tag… list to show the organisation's tag catalog.
      await page.getByRole('dialog').getByRole('combobox').click();
      await page.waitForTimeout(500);
    },
  },
  {
    id: 'sql-datasets/datasets-trash',
    path: `${ws}/datasets`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Trash'}).click();
      await page.waitForTimeout(800);
      await page.locator('tr', {hasText: 'Old order extract'}).getByTitle('Actions', {exact: true}).click();
    },
    // The trash holds one dataset (scripts/seed-sql-charts-lists.mjs); crop to the list and its open menu.
    clip: {x: 224, y: 56, width: 1216, height: 400},
  },
];
