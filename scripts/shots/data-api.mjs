// Screenshots for the Data API, Alerts & reports and Apps pages (area: data-api).
// Objects used (created by scripts/seed-data-api.sh): service accounts "orders-reporting-bot" and
// "partner-sandbox"; endpoints "Orders by status", "Orders page", "Yearly revenue summary", "Top customers".
const ws = '/explore/default';
const A = 'data-api';
const tall = (h) => (page) => page.setViewportSize({width: 1440, height: h});

const openEndpoint = (name, tab, height) => async (page) => {
  if (height) await page.setViewportSize({width: 1440, height});
  await page.getByText(name, {exact: true}).first().click();
  await page.waitForLoadState('networkidle');
  if (tab) {
    await page.getByRole('link', {name: tab, exact: true}).click();
    await page.waitForLoadState('networkidle');
  }
};

export const shots = [
  {id: `${A}/endpoints-list`, path: `${ws}/data-api/endpoints`, settle: 1500},
  {
    id: `${A}/endpoint-actions-menu`,
    path: `${ws}/data-api/endpoints`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Actions for Top customers'}).click();
    },
    settle: 800,
  },
  {
    id: `${A}/endpoint-new`,
    path: `${ws}/data-api/endpoints/new`,
    prepare: async (page) => {
      await page.setViewportSize({width: 1440, height: 1000});
      await page.getByLabel('Name', {exact: true}).fill('Customer spend');
      await page.getByLabel('Path', {exact: true}).fill('customers/spend');
      await page.getByLabel('Description (optional)').fill('Total spend per customer, highest first');
      await page.getByRole('combobox', {name: 'Database'}).click();
      await page.getByRole('option', {name: /trino-demo/}).click();
      await page.locator('.monaco-editor').first().click();
      await page.keyboard.insertText('SELECT custkey, round(sum(totalprice), 2) AS spend\nFROM tpch.tiny.orders\nGROUP BY custkey\nORDER BY spend DESC\nLIMIT 20');
    },
    settle: 1200,
  },
  {
    id: `${A}/endpoint-query`,
    path: `${ws}/data-api/endpoints`,
    prepare: async (page) => {
      await openEndpoint('Orders by status', null, 1100)(page);
      await page.getByLabel('priority', {exact: true}).fill('2-HIGH');
      await page.getByRole('button', {name: 'Preview unsaved draft'}).click();
      await page.waitForTimeout(4000);
    },
    settle: 500,
  },
  {
    id: `${A}/endpoint-params`,
    path: `${ws}/data-api/endpoints`,
    prepare: async (page) => {
      await openEndpoint('Orders by status', null, 1500)(page);
      await page.getByText('Database and parameters').click();
      await page.waitForTimeout(500);
    },
    settle: 800,
  },
  {
    id: `${A}/endpoint-statements`,
    path: `${ws}/data-api/endpoints`,
    prepare: async (page) => {
      await openEndpoint('Orders page', null, 1000)(page);
      await page.locator('.monaco-editor .view-line').first().waitFor({timeout: 20000});
      await page.waitForTimeout(1500);
    },
    settle: 1500,
  },
  {id: `${A}/endpoint-config`, path: `${ws}/data-api/endpoints`, prepare: openEndpoint('Orders by status', 'Config', 1450), settle: 1500},
  {id: `${A}/endpoint-response`, path: `${ws}/data-api/endpoints`, prepare: openEndpoint('Orders by status', 'Response', 1150), settle: 1500},
  {id: `${A}/endpoint-response-transform`, path: `${ws}/data-api/endpoints`, prepare: openEndpoint('Yearly revenue summary', 'Response', 1500), settle: 2500},
  {id: `${A}/endpoint-access`, path: `${ws}/data-api/endpoints`, prepare: openEndpoint('Orders by status', 'Access'), settle: 2000},
  {
    id: `${A}/endpoint-try`,
    path: `${ws}/data-api/endpoints`,
    prepare: async (page) => {
      await openEndpoint('Orders by status', 'Try it', 1250)(page);
      await page.getByRole('combobox', {name: 'Service account'}).click();
      await page.getByRole('option', {name: 'orders-reporting-bot'}).click();
      await page.getByLabel('priority', {exact: true}).fill('2-HIGH');
      await page.getByRole('button', {name: 'Run', exact: true}).click();
      await page.waitForTimeout(3000);
    },
    settle: 500,
  },
  {
    id: `${A}/endpoint-try-refused`,
    path: `${ws}/data-api/endpoints`,
    prepare: async (page) => {
      await openEndpoint('Orders by status', 'Try it', 1100)(page);
      await page.getByRole('combobox', {name: 'Service account'}).click();
      await page.getByRole('option', {name: 'partner-sandbox'}).click();
      await page.getByRole('button', {name: 'Run', exact: true}).click();
      await page.waitForTimeout(3000);
    },
    settle: 500,
  },
  {id: `${A}/endpoint-versions`, path: `${ws}/data-api/endpoints`, prepare: openEndpoint('Orders by status', 'Versions'), settle: 2000},
  {
    id: `${A}/publish-dialog-breaking`,
    path: `${ws}/data-api/endpoints`,
    prepare: async (page) => {
      await openEndpoint('Top customers', 'Versions', 1000)(page);
      await page.getByRole('button', {name: 'Publish saved draft'}).click();
      await page.waitForTimeout(2500);
    },
    settle: 500,
  },
  {
    id: `${A}/rollback-dialog`,
    path: `${ws}/data-api/endpoints`,
    prepare: async (page) => {
      await openEndpoint('Orders by status', 'Versions')(page);
      await page.getByRole('button', {name: 'Roll back'}).click();
      await page.waitForTimeout(800);
    },
    settle: 500,
  },
  {
    id: `${A}/openapi-dialog`,
    path: `${ws}/data-api/endpoints`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Download OpenAPI'}).click();
      await page.getByRole('combobox', {name: 'Service account'}).click();
      await page.getByRole('option', {name: 'orders-reporting-bot'}).click();
    },
    settle: 800,
  },
  {id: `${A}/clients-list`, path: `${ws}/data-api/clients`, settle: 1500},
  {
    id: `${A}/service-account-new`,
    path: `${ws}/data-api/clients/new`,
    prepare: async (page) => {
      await page.getByLabel('Name', {exact: true}).fill('finance-dashboard');
      await page.getByLabel('Description (optional)').fill('Read-only reporting for the finance team');
    },
    settle: 800,
  },
  {
    id: `${A}/client-new`,
    path: `${ws}/data-api/clients`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Actions for orders-reporting-bot'}).click();
      await page.getByRole('menuitem', {name: /Issue client/}).click();
      await page.waitForLoadState('networkidle');
      await page.getByLabel('Name', {exact: true}).fill('weekly-export');
    },
    settle: 800,
  },
  {id: `${A}/activity`, path: `${ws}/data-api/activity`, prepare: tall(1250), settle: 2500},

  // ---- Alerts & reports -------------------------------------------------------------------------
  {id: 'alerts/alerts-list', path: `${ws}/alerts`, settle: 2000},
  {
    id: 'alerts/reports-list',
    path: `${ws}/alerts`,
    prepare: async (page) => {
      await page.getByRole('tab', {name: 'Reports'}).click();
    },
    settle: 1500,
  },
  {
    id: 'alerts/editor-general',
    path: `${ws}/alerts/new`,
    prepare: async (page) => {
      await page.setViewportSize({width: 1440, height: 1000});
      await page.getByLabel('Name', {exact: true}).fill('Open orders above 1 000');
      await page.getByLabel('Description').fill('Tell the ops channel when the open backlog grows');
    },
    settle: 1500,
  },
  {
    id: 'alerts/editor-condition',
    path: `${ws}/alerts/new?section=what`,
    prepare: async (page) => {
      await page.setViewportSize({width: 1440, height: 1000});
      await page.getByPlaceholder(/SELECT count/).fill("SELECT count(*) FROM tpch.tiny.orders WHERE orderstatus = 'O'");
    },
    settle: 1500,
  },
  {
    id: 'alerts/editor-schedule',
    path: `${ws}/alerts/new?section=schedule`,
    prepare: tall(1100),
    settle: 1500,
  },
  {
    id: 'alerts/editor-notification',
    path: `${ws}/alerts/new?section=notification`,
    prepare: async (page) => {
      await page.setViewportSize({width: 1440, height: 1300});
    },
    settle: 1500,
  },
  {
    id: 'alerts/editor-dataapi',
    path: `${ws}/alerts/new?type=dataapi_alert&section=what`,
    prepare: tall(1000),
    settle: 2000,
  },
  {
    id: 'alerts/editor-report',
    path: `${ws}/alerts/new?type=report&section=what`,
    prepare: tall(1000),
    settle: 2000,
  },
  {
    id: 'alerts/run-log',
    path: `${ws}/alerts`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Run log for Pending orders above 100'}).click();
      await page.waitForTimeout(1500);
    },
    settle: 500,
  },
  {
    id: 'alerts/row-menu',
    path: `${ws}/alerts`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Actions for Pending orders above 100'}).click();
    },
    settle: 600,
  },
  {
    id: 'alerts/editor-destinations',
    path: `${ws}/alerts/new?section=notification`,
    prepare: async (page) => {
      await page.setViewportSize({width: 1440, height: 1100});
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
  {
    id: 'alerts/detail',
    path: `${ws}/alerts`,
    prepare: async (page) => {
      await page.setViewportSize({width: 1440, height: 1000});
      await page.getByText('Pending orders above 100', {exact: true}).first().click();
      await page.waitForLoadState('networkidle');
    },
    settle: 1500,
  },
  // ---- Apps -------------------------------------------------------------------------------------
  {id: 'apps/apps-list', path: `${ws}/apps`, settle: 2000},
  {
    id: 'apps/create-dialog',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.getByRole('button', {name: '+ App'}).click();
      await page.getByLabel('Name', {exact: true}).fill('Revenue explorer');
    },
    settle: 800,
  },
  {
    id: 'apps/row-menu',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Actions', exact: true}).click();
    },
    settle: 600,
  },
  {
    id: 'apps/edit-unavailable',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Actions', exact: true}).click();
      await page.getByRole('menuitem', {name: 'Edit'}).click();
      await page.waitForTimeout(2500);
    },
    settle: 500,
  },
  {
    id: 'apps/view-unavailable',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.getByText('Revenue explorer', {exact: true}).first().click();
      await page.waitForTimeout(2500);
    },
    settle: 500,
  },
  {
    id: 'apps/versions-dialog',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Actions', exact: true}).click();
      await page.getByRole('menuitem', {name: 'Edit'}).click();
      await page.getByRole('button', {name: 'Versions'}).click();
      await page.waitForTimeout(1500);
    },
    settle: 500,
  },
  {
    id: 'apps/share-dialog',
    path: `${ws}/apps`,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Actions', exact: true}).click();
      await page.getByRole('menuitem', {name: 'Share…'}).click();
      await page.waitForTimeout(1500);
    },
    settle: 500,
  },
];
