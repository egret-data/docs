// Screenshots for the `ops` area: Get started (first-login tour, first-dashboard tutorial).
// The tutorial objects (dataset "Order priority summary" with metric total_revenue, chart
// "Revenue per order priority", dashboard "My first dashboard") are created by following the
// tutorial itself on the seeded instance; these shots re-capture the screens.
const ws = '/explore/default';
const sql =
  'SELECT orderpriority,\n       count(*) AS orders,\n       round(sum(totalprice), 2) AS revenue\nFROM tpch.tiny.orders\nGROUP BY 1\nORDER BY 3 DESC';

const typeSql = async (page) => {
  await page.locator('.monaco-editor').first().click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(sql);
  await page.getByRole('button', {name: /^run/i}).click();
  await page.waitForTimeout(3500);
};
const openDataset = async (page) => {
  await page.getByText('Order priority summary', {exact: true}).first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
};

export const shots = [
  {id: 'ops/get-started/explorer-home', path: `${ws}/sql-lab`, settle: 1500},
  {id: 'ops/get-started/engines-page', path: `${ws}/settings/engines`, settle: 1500},
  {
    id: 'ops/get-started/add-connection',
    path: `${ws}/settings/engines`,
    prepare: async (page) => {
      await page.getByRole('button', {name: /add connection/i}).click();
    },
    settle: 1000,
  },
  {id: 'ops/get-started/sql-lab-run', path: `${ws}/sql-lab`, prepare: typeSql, settle: 800},
  {
    id: 'ops/get-started/save-as-dataset',
    path: `${ws}/sql-lab`,
    prepare: async (page) => {
      await typeSql(page);
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
      await page.getByText('My first dashboard', {exact: true}).first().click();
      await page.waitForLoadState('networkidle');
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
    prepare: async (page) => {
      await page.getByText('My first dashboard', {exact: true}).first().click();
      await page.waitForLoadState('networkidle');
    },
    settle: 4500,
  },
];
