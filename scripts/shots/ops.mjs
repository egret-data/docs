// Screenshots for the `ops` area: Get started (first-login tour, first-dashboard tutorial, the demo stack).
// The tutorial objects (dataset "Order priority summary" with metric total_revenue, chart
// "Revenue per order priority", dashboard "My first dashboard" with that chart and "Orders by priority")
// are created by following the tutorial itself on the Docker demo stack (`just demo-up`); these shots
// re-capture the screens. The report mail shot needs one report delivered to Mailpit first
// (MAILPIT, default http://localhost:8025).
const ws = '/explore/default';
const MAILPIT = process.env.MAILPIT ?? 'http://localhost:8025';
const lines = [
  'SELECT orderpriority,',
  '       count(*) AS orders,',
  '       round(sum(totalprice), 2) AS revenue',
  'FROM tpch.tiny.orders',
  'GROUP BY 1',
  'ORDER BY 3 DESC',
];

// Monaco auto-indents after Enter, so each line is typed after clearing the indent it inserted.
const typeSql = async (page) => {
  await page.getByText('tpch', {exact: true}).first().waitFor({timeout: 60000});
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Delete');
  for (const [i, line] of lines.entries()) {
    await page.keyboard.insertText(line);
    if (i < lines.length - 1) {
      await page.keyboard.press('Enter');
      await page.keyboard.press('Shift+Home');
      await page.keyboard.press('Shift+Home');
      await page.keyboard.press('Delete');
    }
  }
};
const runSql = async (page) => {
  await typeSql(page);
  await page.getByRole('button', {name: /^run/i}).click();
  await page.getByText('1-URGENT').first().waitFor({timeout: 60000});
};
const openDataset = async (page) => {
  await page.getByText('Order priority summary', {exact: true}).first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
};
const openDashboard = async (page, name) => {
  await page.getByText(name, {exact: true}).first().click();
  await page.waitForLoadState('networkidle');
  await page.getByText('Showing 5 rows').first().waitFor({timeout: 60000}).catch(() => {});
};

export const shots = [
  {
    id: 'ops/get-started/explorer-home',
    path: `${ws}/sql-lab`,
    prepare: async (page) => {
      await page.getByText('tpch', {exact: true}).first().waitFor({timeout: 60000});
    },
    settle: 1000,
  },
  {
    id: 'ops/get-started/engines-page',
    path: `${ws}/settings/engines`,
    // Test the seeded connection first so the Status column shows a result instead of Unknown.
    prepare: async (page) => {
      await page.getByText('Test', {exact: true}).first().click();
      await page.waitForTimeout(3000);
    },
    settle: 1500,
    clip: {x: 0, y: 0, width: 1440, height: 620},
  },
  {
    id: 'ops/get-started/add-connection',
    path: `${ws}/settings/engines`,
    prepare: async (page) => {
      await page.getByRole('button', {name: /add connection/i}).click();
      const dlg = page.getByRole('dialog');
      await dlg.waitFor();
      await dlg.getByPlaceholder('e.g. prod-trino').fill('analytics-trino');
      await dlg.getByPlaceholder('e.g. trino.corp.local').fill('trino-demo');
      await dlg.getByPlaceholder('e.g. 8080').fill('8080');
      await dlg.getByPlaceholder('Optional').first().fill('egret');
      await dlg.getByPlaceholder('http / https').fill('http');
      await dlg.getByPlaceholder('Optional').nth(1).fill('tpch');
      await dlg.getByPlaceholder('Optional').nth(2).fill('tiny');
    },
    settle: 1000,
  },
  {id: 'ops/get-started/sql-lab-run', path: `${ws}/sql-lab`, prepare: runSql, settle: 800},
  {
    id: 'ops/get-started/save-as-dataset',
    path: `${ws}/sql-lab`,
    prepare: async (page) => {
      await runSql(page);
      await page.getByRole('button', {name: 'Save as dataset'}).click();
      await page.getByPlaceholder('Dataset name').fill('Order priority summary');
      await page.getByPlaceholder("What it's for").fill('Orders and revenue per order priority (tpch tiny)');
    },
    settle: 800,
  },
  {
    id: 'ops/get-started/add-metric',
    path: `${ws}/datasets`,
    prepare: async (page) => {
      await openDataset(page);
      await page.getByText(/^Metrics \(/).first().click();
      await page.getByText('+ Metric', {exact: true}).first().click();
      await page.getByPlaceholder('e.g. total_sales').fill('total_revenue');
      await page.getByPlaceholder('e.g. SUM(amount)').fill('SUM(revenue)');
      await page.getByPlaceholder('e.g. Total Sales').fill('Total revenue');
    },
    settle: 800,
  },
  {
    id: 'ops/get-started/bar-chart',
    path: `${ws}/datasets`,
    prepare: async (page) => {
      await openDataset(page);
      await page.getByText('Create chart').first().click();
      await page.waitForLoadState('networkidle');
      await page.getByText('Bar', {exact: true}).first().click();
      await page.waitForTimeout(2000);
      await page.getByText('Pick a dimension…').click();
      await page.getByText('orderpriority', {exact: true}).last().click();
      await page.getByText('add y-axis').click();
      await page.getByText('Total revenue').last().click();
    },
    settle: 3500,
  },
  {
    id: 'ops/get-started/dashboard-add-chart',
    path: `${ws}/dashboards`,
    prepare: async (page) => {
      await openDashboard(page, 'My first dashboard');
      await page.getByRole('button', {name: 'Edit', exact: true}).click();
      await page.getByRole('button', {name: 'add chart'}).click();
      await page.waitForTimeout(1200);
      await page.getByPlaceholder('search charts').fill('priority');
    },
    settle: 1500,
  },
  {
    id: 'ops/get-started/dashboard-done',
    path: `${ws}/dashboards`,
    prepare: async (page) => openDashboard(page, 'My first dashboard'),
    settle: 2500,
    clip: {x: 0, y: 0, width: 1440, height: 600},
  },
  // The seeded content of the Docker demo stack.
  {
    id: 'ops/get-started/demo-sales-overview',
    path: `${ws}/dashboards`,
    prepare: async (page) => openDashboard(page, 'Sales overview'),
    settle: 3000,
    clip: {x: 0, y: 0, width: 1440, height: 620},
  },
  // Mailpit (outside Egret): the inbox with a report mail opened.
  {
    id: 'ops/get-started/demo-mailpit',
    path: `${ws}/dashboards`,
    prepare: async (page) => {
      await page.goto(MAILPIT, {waitUntil: 'networkidle'});
      await page.getByText('start: My first dashboard report').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    },
    settle: 1000,
  },
];
