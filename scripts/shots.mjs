// One entry per screenshot: id (file name), path (app route), optional prepare(page), settle ms, fullPage.
// Routes are workspace-scoped under /explore/default/; the sidebar order is the doc order.
const ws = '/explore/default';
export const baseShots = [
  {id: 'login', path: '/login'},
  {id: 'explore-sql-lab', path: `${ws}/sql-lab`},
  {id: 'explore-datasets', path: `${ws}/datasets`},
  {id: 'explore-charts', path: `${ws}/charts`},
  {id: 'explore-dashboards', path: `${ws}/dashboards`},
  {id: 'explore-apps', path: `${ws}/apps`},
  {id: 'explore-alerts', path: `${ws}/alerts`},
  {id: 'settings-general', path: `${ws}/settings/general`},
  {id: 'settings-members', path: `${ws}/settings/members`},
  {id: 'settings-roles', path: `${ws}/settings/roles`},
  {id: 'settings-databases', path: `${ws}/settings/engines`},
  {id: 'settings-shares', path: `${ws}/settings/shares`},
  {id: 'settings-requests', path: `${ws}/settings/requests`},
  {id: 'settings-notifications', path: `${ws}/settings/notifications`},
  {id: 'data-api-endpoints', path: `${ws}/data-api/endpoints`},
  {id: 'data-api-clients', path: `${ws}/data-api/clients`},
  {id: 'data-api-activity', path: `${ws}/data-api/activity`},
  {id: 'workflows-flows', path: '/explore/default/workflows/flows'},
  {id: 'data-api-endpoint-new', path: `${ws}/data-api/endpoints/new`, settle: 1500},
  {id: 'data-api-client-new', path: `${ws}/data-api/clients/new`, settle: 1200},
  {id: 'workflows-flow-new', path: `${ws}/workflows/flows/new`, settle: 2500},
  {id: 'workflows-executions', path: `${ws}/workflows/executions`},
  {id: 'workflows-namespaces', path: `${ws}/workflows/namespaces`},
  {id: 'workflows-triggers', path: `${ws}/workflows/triggers`},
  {id: 'governance-overview', path: '/governance', settle: 2500},
  {id: 'governance-data', path: '/governance/data', settle: 2500},
  {id: 'governance-people', path: '/governance/people', settle: 2000},
  {id: 'governance-engines', path: '/governance/engines', settle: 2000},
  {id: 'governance-classifications', path: '/governance/classifications', settle: 1500},
  {id: 'governance-lineage', path: '/governance/data-lineage'},
  {id: 'control-plane-access-overview', path: '/control-plane/access-overview', settle: 2000},
  {id: 'control-plane-users', path: '/control-plane/users', settle: 1500},
  {id: 'control-plane-groups', path: '/control-plane/groups', settle: 1500},
  {id: 'control-plane-roles', path: '/control-plane/roles', settle: 1500},
  {id: 'control-plane-access-explorer', path: '/control-plane/access-explorer', settle: 1500},
  {id: 'control-plane-permissions', path: '/control-plane/permissions', settle: 1500},
  {id: 'control-plane-workspaces', path: '/control-plane/workspaces'},
  {id: 'control-plane-engines', path: '/control-plane/engines'},
  {id: 'control-plane-secrets', path: '/control-plane/secrets'},
  {id: 'control-plane-storage', path: '/control-plane/storage'},
  {id: 'control-plane-catalogs', path: '/control-plane/catalogs'},
  {id: 'control-plane-engine-register', path: '/control-plane/engines/register', settle: 1500},
  {id: 'control-plane-audit-log', path: '/control-plane/audit-log'},
];

// Detail pages and interactions. Each prepare() works from the list page, so ids never leak into the config.
const openRow = (name) => async (page) => {
  await page.getByText(name, {exact: true}).first().click();
  await page.waitForLoadState('networkidle');
};
export const detailShots = [
  {id: 'workflows-flow-detail', path: `${ws}/workflows/flows`, prepare: openRow('hello'), settle: 2000},
  {
    id: 'workflows-execution-overview',
    path: `${ws}/workflows/executions`,
    prepare: async (page) => {
      await page.getByText(/^[0-9a-f]{8}$/).first().click();
      await page.waitForLoadState('networkidle');
    },
    settle: 2000,
  },
  {
    id: 'workflows-execution-logs',
    path: `${ws}/workflows/executions`,
    prepare: async (page) => {
      await page.getByText(/^[0-9a-f]{8}$/).first().click();
      await page.waitForLoadState('networkidle');
      await page.getByRole('tab', {name: 'Logs'}).click();
    },
    settle: 2500,
  },
  {id: 'explore-dataset-detail', path: `${ws}/datasets`, prepare: openRow('orders'), settle: 1500},
  {id: 'explore-chart-editor', path: `${ws}/charts`, prepare: openRow('Revenue by order status'), settle: 4000},
  {id: 'explore-dashboard-view', path: `${ws}/dashboards`, prepare: openRow('Sales overview'), settle: 5000},
  {
    id: 'explore-sql-lab-results',
    path: `${ws}/sql-lab`,
    prepare: async (page) => {
      await page.locator('.monaco-editor').first().click();
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.insertText('SELECT orderstatus,\n       count(*) AS orders,\n       round(sum(totalprice), 2) AS revenue\nFROM tpch.tiny.orders\nGROUP BY 1\nORDER BY 3 DESC');
      await page.getByRole('button', {name: /^run/i}).click();
      await page.waitForTimeout(4000);
    },
  },
  {
    id: 'settings-add-connection',
    path: `${ws}/settings/engines`,
    prepare: async (page) => {
      await page.getByRole('button', {name: /add connection/i}).click();
    },
  },
];

export const shots = [...baseShots, ...detailShots];
