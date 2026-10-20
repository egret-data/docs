// Screenshots for the admin areas: Governance, Control plane, Workspace settings.
// Ids are prefixed `admin/`. The shots assume the objects created by the steps listed in scripts/shots/admin-demo-data.md
// (see scripts/shots/admin-demo-data.md): profile docs-trino-policy bound to engine docs-trino, grant/rules/tag on
// demo_catalog.analytics.sessions, workspaces "Docs sandbox" and "Finance analytics", role finance_reporter,
// a pending access request in Finance analytics, secret docs-warehouse-password.
const gov = '/governance';
const cp = '/control-plane';
const T = `${gov}/data/demo_catalog/analytics/sessions`;

const click = (text, opts = {}) => async (page) => {
  await page.getByText(text, {exact: true, ...opts}).first().click();
  await page.waitForLoadState('networkidle');
};
const tab = (name) => async (page) => {
  await page.getByRole('tab', {name}).first().click();
  await page.waitForTimeout(1200);
};
const seq = (...fns) => async (page) => {
  for (const f of fns) await f(page);
};

export const shots = [
  // ---- Governance
  {id: 'admin/gov-overview', path: gov, settle: 2500},
  {id: 'admin/gov-data-schema', path: `${gov}/data/demo_catalog/analytics`, settle: 2500},
  {id: 'admin/gov-table-overview', path: T, settle: 2500},
  {id: 'admin/gov-table-permissions', path: `${T}?tab=permissions`, settle: 2500},
  {id: 'admin/gov-table-masks', path: `${T}?tab=masks`, settle: 2500},
  {id: 'admin/gov-table-lineage', path: `${T}?tab=lineage`, settle: 2000},
  {id: 'admin/gov-table-details', path: `${T}?tab=details`, settle: 2000},
  {id: 'admin/gov-column-panel', path: `${T}?column=user_id`, settle: 2500},
  {
    id: 'admin/gov-grant-dialog',
    path: T,
    settle: 800,
    prepare: async (page) => {
      await page.setViewportSize({width: 1440, height: 1250});
      await page.getByRole('button', {name: /Grant access/}).click();
      const d = page.getByRole('dialog');
      const inp = d.getByLabel('Include user search');
      await inp.click();
      await inp.fill('member');
      await page.waitForTimeout(1500);
      await page.getByRole('option').first().click();
      await page.waitForTimeout(600);
      await d.getByRole('button', {name: 'Preview', exact: true}).click();
      await page.waitForTimeout(2500);
      await page.waitForTimeout(300);
    },
  },
  {
    id: 'admin/gov-rule-dialog',
    path: `${T}?tab=masks`,
    settle: 800,
    prepare: async (page) => {
      await page.setViewportSize({width: 1440, height: 1250});
      await page.getByRole('button', {name: 'Add rule'}).click();
      const d = page.getByRole('dialog');
      await d.getByRole('combobox', {name: 'Kind', exact: true}).click();
      await page.getByRole('option', {name: 'Mask a column'}).click();
      await d.getByLabel('Name').fill('Hash visitor ids');
      await d.getByRole('combobox', {name: 'Mask type'}).click();
      await page.getByRole('option', {name: 'Hash'}).click();
      await d.getByPlaceholder('e.g. ssn').fill('user_id');
      await d.getByRole('button', {name: 'Preview', exact: true}).click();
      await page.waitForTimeout(2500);
      await page.waitForTimeout(300);
    },
  },
  {
    id: 'admin/gov-who-can-read',
    path: T,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Who can read?'}).click();
      const d = page.getByRole('dialog');
      await d.getByRole('combobox').nth(1).click();
      await page.keyboard.type('member');
      await page.waitForTimeout(1500);
      await page.getByRole('option').first().click();
      await d.getByRole('button', {name: 'Explain'}).click();
      await page.waitForTimeout(4000);
    },
  },
  {id: 'admin/gov-people-users', path: `${gov}/people`, settle: 2000},
  {id: 'admin/gov-people-groups', path: `${gov}/people?kind=group`, settle: 2000},
  {id: 'admin/gov-people-roles', path: `${gov}/people?kind=role`, settle: 2000},
  {id: 'admin/gov-people-unmatched', path: `${gov}/people?kind=unmatched`, settle: 1500},
  {
    id: 'admin/gov-person-overview',
    path: `${gov}/people`,
    settle: 1500,
    prepare: click('Member SSO'),
  },
  {
    id: 'admin/gov-person-permissions',
    path: `${gov}/people`,
    settle: 1500,
    prepare: seq(click('Member SSO'), tab('Permissions')),
  },
  {
    id: 'admin/gov-person-check',
    path: `${gov}/people`,
    settle: 1500,
    prepare: seq(click('Member SSO'), tab('Check access')),
  },
  {id: 'admin/gov-engines-index', path: `${gov}/engines`, settle: 2500},
  {id: 'admin/gov-engine-permissions', path: `${gov}/engines`, settle: 2000, prepare: click('docs-trino')},
  {
    id: 'admin/gov-engine-grant-dialog',
    path: `${gov}/engines`,
    settle: 800,
    prepare: async (page) => {
      await click('docs-trino')(page);
      await page.getByRole('button', {name: 'Grant', exact: true}).click();
      const d = page.getByRole('dialog');
      await d.getByRole('combobox').first().click();
      await page.getByRole('option', {name: /Set a catalog session property/}).click();
      await page.waitForTimeout(600);
    },
  },
  {id: 'admin/gov-engine-policies', path: `${gov}/engines`, settle: 2000, prepare: seq(click('docs-trino'), tab('Policies'))},
  {id: 'admin/gov-engine-plugin', path: `${gov}/engines`, settle: 2000, prepare: seq(click('docs-trino'), tab('Plugin'))},
  {id: 'admin/gov-engine-advanced', path: `${gov}/engines`, settle: 2000, prepare: seq(click('docs-trino'), tab('Advanced'))},
  {id: 'admin/gov-profile', path: `${gov}/engines/profiles/docs-trino-profile`, settle: 2000},
  {id: 'admin/gov-policy-editor', path: `${gov}/engines/profiles/docs-trino-profile/advanced/policies/access/new`, settle: 2000},
  {id: 'admin/gov-classifications', path: `${gov}/classifications`, settle: 2000},
  {
    id: 'admin/gov-tag-detail',
    path: `${gov}/classifications`,
    settle: 2500,
    prepare: click('Personal data (PII)'),
    fullPage: true,
  },
  {id: 'admin/gov-tag-clearance', path: `${gov}/classifications`, settle: 2500, prepare: click('Personal data (PII)')},
  {
    id: 'admin/gov-add-tag',
    path: `${T}?column=started_at`,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Add tag'}).last().click();
      await page.waitForTimeout(800);
    },
  },

  // ---- Control plane
  {id: 'admin/cp-workspaces', path: `${cp}/workspaces`, settle: 1500},
  {
    id: 'admin/cp-workspace-new',
    path: `${cp}/workspaces`,
    settle: 600,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'New workspace'}).click();
      await page.getByRole('dialog').getByLabel('Name').fill('Marketing analytics');
    },
  },
  {id: 'admin/cp-workspace-members', path: `${cp}/workspaces`, settle: 1500, prepare: seq(click('Docs sandbox'), tab('Members'))},
  {id: 'admin/cp-workspace-resources', path: `${cp}/workspaces`, settle: 1500, prepare: seq(click('Default'), tab('Resources'))},
  {id: 'admin/cp-workspace-features', path: `${cp}/workspaces`, settle: 1500, prepare: seq(click('Default'), tab('Features')), fullPage: true},
  {id: 'admin/cp-users', path: `${cp}/users`, settle: 1500},
  {id: 'admin/cp-user-detail', path: `${cp}/users`, settle: 2000, prepare: click('Member SSO'), fullPage: true},
  {id: 'admin/cp-groups', path: `${cp}/groups`, settle: 1500},
  {id: 'admin/cp-group-detail', path: `${cp}/groups`, settle: 2000, prepare: click('data-team'), fullPage: true},
  {id: 'admin/cp-roles', path: `${cp}/roles`, settle: 1500},
  {
    id: 'admin/cp-role-new',
    path: `${cp}/roles`,
    settle: 600,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'New role'}).click();
      const d = page.getByRole('dialog');
      await d.getByRole('combobox').click();
      await page.getByRole('option', {name: 'Workspace'}).click();
      await d.locator('#new-role-name').fill('marketing_analyst');
      await d.locator('#new-role-description').fill('Reads datasets and builds charts');
    },
  },
  {id: 'admin/cp-role-detail', path: `${cp}/roles`, settle: 2000, prepare: click('finance_reporter'), fullPage: true},
  {id: 'admin/cp-permissions', path: `${cp}/permissions`, settle: 1500},
  {
    id: 'admin/cp-explorer-user',
    path: `${cp}/access-explorer`,
    settle: 2500,
    prepare: async (page) => {
      await page.getByText('Select a user…').click();
      await page.getByText('Member SSO', {exact: false}).last().click();
    },
    fullPage: true,
  },
  {
    id: 'admin/cp-explorer-object',
    path: `${cp}/access-explorer?dir=object`,
    settle: 2500,
    prepare: async (page) => {
      await page.getByText('Select a workspace…').click();
      await page.getByText('Docs sandbox', {exact: true}).last().click();
      await page.waitForTimeout(800);
      await page.getByText('Select an object…').click();
      await page.waitForTimeout(800);
      await page.getByText('Finance KPIs').last().click();
    },
    fullPage: true,
  },
  {
    id: 'admin/cp-roles-tree',
    path: `${cp}/roles`,
    settle: 1200,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Tree view'}).click();
    },
  },
  {
    id: 'admin/cp-users-bulk',
    path: `${cp}/users`,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Bulk select'}).click();
      await page.getByRole('checkbox').nth(1).check();
    },
  },
  {id: 'admin/cp-engines', path: `${cp}/engines`, settle: 1500},
  {id: 'admin/cp-engine-register', path: `${cp}/engines/register`, settle: 1500, fullPage: true},
  {id: 'admin/cp-engine-new', path: `${cp}/engines/new`, settle: 1500},
  {id: 'admin/cp-engine-overview', path: `${cp}/engines`, settle: 1500, prepare: click('docs-trino')},
  {id: 'admin/cp-engine-catalogs', path: `${cp}/engines`, settle: 1500, prepare: seq(click('docs-trino'), tab('Catalogs'))},
  {id: 'admin/cp-engine-settings', path: `${cp}/engines`, settle: 1500, prepare: seq(click('docs-trino'), tab('Settings'))},
  {id: 'admin/cp-engine-plugin', path: `${cp}/engines`, settle: 1500, prepare: seq(click('docs-trino'), tab('Plugin config')), fullPage: true},
  {id: 'admin/cp-catalogs', path: `${cp}/catalogs`, settle: 1500},
  {
    id: 'admin/cp-catalog-new',
    path: `${cp}/catalogs/new`,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('combobox').click();
      await page.getByRole('option', {name: 'Iceberg', exact: true}).click();
    },
    fullPage: true,
  },
  {id: 'admin/cp-catalog-config', path: `${cp}/catalogs`, settle: 1500, prepare: click('tpch_bench')},
  {id: 'admin/cp-catalog-engines', path: `${cp}/catalogs`, settle: 1500, prepare: seq(click('tpch_bench'), tab('Engines'))},
  {id: 'admin/cp-catalog-workspaces', path: `${cp}/catalogs`, settle: 1500, prepare: seq(click('tpch_bench'), tab('Workspaces')), fullPage: true},
  {id: 'admin/cp-catalog-roles', path: `${cp}/catalogs`, settle: 1500, prepare: seq(click('demo_catalog'), tab('Roles & grants'))},
  {id: 'admin/cp-catalog-browse', path: `${cp}/catalogs`, settle: 1500, prepare: seq(click('demo_catalog'), tab('Browse'), click('analytics'), click('sessions'))},
  {id: 'admin/cp-catalog-connect', path: `${cp}/catalogs`, settle: 1500, prepare: seq(click('demo_catalog'), tab('Connect')), fullPage: true},
  {id: 'admin/cp-catalog-settings', path: `${cp}/catalogs`, settle: 1500, prepare: seq(click('demo_catalog'), tab('Settings'))},
  {id: 'admin/cp-storage', path: `${cp}/storage`, settle: 1500},
  {
    id: 'admin/cp-storage-add',
    path: `${cp}/storage`,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Add connection'}).click();
    },
  },
  {id: 'admin/cp-storage-detail', path: `${cp}/storage`, settle: 1500, prepare: click('demo-rustfs')},
  {id: 'admin/cp-storage-browse', path: `${cp}/storage`, settle: 2500, prepare: seq(click('sandbox-lake'), tab('Browse'))},
  {id: 'admin/cp-secrets', path: `${cp}/secrets`, settle: 1500},
  {
    id: 'admin/cp-secret-add',
    path: `${cp}/secrets`,
    settle: 600,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Add secret'}).click();
      const d = page.getByRole('dialog');
      await d.locator('#cp-secret-name').fill('docs-api-token');
      await d.getByRole('button', {name: 'Add key'}).click();
      await d.getByLabel('Key 1').fill('token');
    },
  },
  {id: 'admin/cp-secret-detail', path: `${cp}/secrets`, settle: 1500, prepare: click('docs-warehouse-password')},
  {
    id: 'admin/cp-secret-rotate',
    path: `${cp}/secrets`,
    settle: 600,
    prepare: async (page) => {
      await click('docs-warehouse-password')(page);
      await page.getByRole('button', {name: 'Rotate value'}).click();
    },
  },
  {id: 'admin/cp-audit-log', path: `${cp}/audit-log`, settle: 2000},

  // ---- Workspace settings (Docs sandbox / Finance analytics are created for these pages)
  {id: 'admin/ws-general', path: '/explore/docs-sandbox/settings/general', settle: 1500},
  {id: 'admin/ws-members', path: '/explore/docs-sandbox/settings/members', settle: 1500},
  {
    id: 'admin/ws-add-member',
    path: '/explore/docs-sandbox/settings/members',
    settle: 600,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Add member'}).click();
      await page.getByRole('dialog').getByLabel('User email').fill('tester@egret.local');
    },
  },
  {
    id: 'admin/ws-members-bulk',
    path: '/explore/docs-sandbox/settings/members',
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Bulk select'}).click();
    },
  },
  {id: 'admin/ws-roles', path: '/explore/docs-sandbox/settings/roles', settle: 1500},
  {
    id: 'admin/ws-roles-expanded',
    path: '/explore/docs-sandbox/settings/roles',
    settle: 1000,
    prepare: click('finance_reporter'),
    fullPage: true,
  },
  {id: 'admin/ws-requests', path: '/explore/finance-analytics/settings/requests', settle: 1500},
  {
    id: 'admin/ws-request-approve',
    path: '/explore/finance-analytics/settings/requests',
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: /Approve/}).first().click();
    },
  },
  {id: 'admin/ws-members-finance', path: '/explore/finance-analytics/settings/members', settle: 1500},
  {id: 'admin/ws-shares', path: '/explore/docs-sandbox/settings/shares', settle: 1500},
  {id: 'admin/ws-notifications', path: '/explore/docs-sandbox/settings/notifications', settle: 1500, fullPage: true},
  {id: 'admin/ws-engines', path: '/explore/docs-sandbox/settings/engines', settle: 1500},
  {
    id: 'admin/ws-add-connection',
    path: '/explore/docs-sandbox/settings/engines',
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: /Add connection/}).first().click();
    },
  },
];
