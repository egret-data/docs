// Screenshots for the admin areas: Governance, Control plane, Workspace settings. Ids are prefixed `admin/`.
// The shots assume the objects listed in scripts/shots/admin-demo-data.md: the seed (scripts/seed-admin.mjs), the provisioned
// engine docs-trino with its tables in demo_warehouse, the external engine trino-demo-ext, the grants, rules, tags and
// clearance written through the Governance UI. Run on the Docker demo stack:
//   BASE=http://egret.localtest.me:18080 STATE=<admin state> node scripts/screenshots.mjs admin/cp-users ...
const gov = '/governance';
const cp = '/control-plane';
const T = `${gov}/data/demo_warehouse/analytics/sessions`;

const click = (text, opts = {}) => async (page) => {
  await page.getByText(text, {exact: true, ...opts}).first().click();
  await page.waitForLoadState('networkidle');
};
const link = (name) => async (page) => {
  await page.locator('main').getByRole('link', {name, exact: true}).first().click();
  await page.waitForLoadState('networkidle');
};
const tab = (name) => async (page) => {
  await page.getByRole('tab', {name, exact: true}).first().click();
  await page.waitForTimeout(1200);
};
const seq = (...fns) => async (page) => {
  for (const f of fns) await f(page);
};
// Open an engine of the Control Plane list by name (the list links each name).
const engine = (name) => seq(link(name), async (page) => page.waitForTimeout(1500));
// Who can read this column? for a user (picked by a search) or a group (searched by name), then Explain.
const whoCanReadColumn = (subject, search) => async (page) => {
  await page.getByRole('button', {name: 'Who can read this column?'}).click();
  const d = page.getByRole('dialog');
  if (subject === 'group') {
    await d.getByRole('combobox').nth(0).click();
    await page.getByRole('option', {name: 'Group', exact: true}).click();
  }
  await d.getByRole('combobox').nth(1).click();
  await page.keyboard.type(search);
  await page.waitForTimeout(1500);
  await page.getByRole('option').first().click();
  await d.getByRole('button', {name: 'Explain'}).click();
  await page.waitForTimeout(4000);
};
// The provisioned engine the cp-engine-* shots open (DOCS_ENGINE overrides it for a pass that adds its own).
const DOCS_ENGINE = process.env.DOCS_ENGINE ?? 'docs-trino';

export const shots = [
  // ---- Governance
  {id: 'admin/gov-overview', path: gov, settle: 2500},
  {id: 'admin/gov-data-schema', path: `${gov}/data/demo_warehouse/analytics`, settle: 2500},
  {id: 'admin/gov-table-overview', path: T, settle: 2500},
  {id: 'admin/gov-table-permissions', path: `${T}?tab=permissions`, settle: 2500},
  {id: 'admin/gov-table-masks', path: `${T}?tab=masks`, settle: 2500},
  {id: 'admin/gov-table-lineage', path: `${gov}/data/demo_warehouse/analytics/sessions?tab=lineage`, settle: 2500},
  {id: 'admin/gov-table-details', path: `${T}?tab=details`, settle: 2000},
  {id: 'admin/gov-column-panel', path: `${T}?column=user_id`, settle: 2500},
  {
    id: 'admin/gov-grant-dialog',
    path: T,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: /Grant access/}).click();
      const d = page.getByRole('dialog');
      await d.getByRole('checkbox', {name: 'Write'}).check();
      const inp = d.getByLabel('Include user search');
      await inp.click();
      await inp.pressSequentially('alice', {delay: 80});
      await page.waitForTimeout(1500);
      await page.getByRole('option').first().click();
      await d.getByText('Principals', {exact: true}).click();
      await d.getByRole('button', {name: 'Preview', exact: true}).click();
      await page.waitForTimeout(3000);
      await d.getByText(/Would recompile/).scrollIntoViewIfNeeded();
    },
  },
  {
    id: 'admin/gov-rule-dialog',
    path: `${T}?tab=masks`,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Add rule'}).click();
      const d = page.getByRole('dialog');
      await d.getByRole('combobox', {name: 'Kind', exact: true}).click();
      await page.getByRole('option', {name: 'Mask a column'}).click();
      await d.getByLabel('Name').fill('Hash session ids');
      await d.getByRole('combobox', {name: 'Mask type'}).click();
      await page.getByRole('option', {name: 'Hash', exact: true}).click();
      await d.getByPlaceholder('e.g. ssn').fill('session_id');
      await d.getByRole('button', {name: 'Preview', exact: true}).click();
      await page.waitForTimeout(3000);
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
  // Platform #744 (verify a mask per user): the answer's sentences on a column, for a user and for a group's members,
  // at 1440 and 390 px; the rule dialog's row-filter gap warning; the Add tag dialog's whole-table note.
  // Not referenced by a page until captured; the prepare steps were written without a running stack.
  {id: 'admin/gov-who-can-read-column', path: `${T}?column=user_id`, settle: 800, prepare: whoCanReadColumn('user', 'member')},
  {id: 'admin/gov-who-can-read-group', path: `${T}?column=user_id`, settle: 800, prepare: whoCanReadColumn('group', 'data-stewards')},
  {
    id: 'admin/gov-who-can-read-column-390',
    path: `${T}?column=user_id`,
    settle: 800,
    prepare: seq(async (page) => page.setViewportSize({width: 390, height: 844}), whoCanReadColumn('user', 'member')),
  },
  {
    id: 'admin/gov-who-can-read-group-390',
    path: `${T}?column=user_id`,
    settle: 800,
    prepare: seq(async (page) => page.setViewportSize({width: 390, height: 844}), whoCanReadColumn('group', 'data-stewards')),
  },
  {
    id: 'admin/gov-rule-row-filter-warning',
    path: `${T}?tab=masks`,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Add rule'}).click();
      const d = page.getByRole('dialog');
      await d.getByRole('combobox', {name: 'Kind', exact: true}).click();
      await page.getByRole('option', {name: 'Filter rows'}).click();
      await d.getByRole('combobox', {name: 'Applies to', exact: true}).click();
      await page.getByRole('option', {name: 'Classification', exact: true}).click();
      await d.getByRole('combobox', {name: 'Classification'}).click();
      await page.getByRole('option', {name: /Personal data \(PII\)/}).first().click();
      await d.getByLabel('Filter expression').fill("country = 'FRANCE'");
      await d.getByRole('button', {name: 'Preview', exact: true}).click();
      await page.waitForTimeout(3000);
      await d.getByText(/filters nothing on/).first().scrollIntoViewIfNeeded();
    },
  },
  {
    id: 'admin/gov-add-tag-table-note',
    path: T,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Add tag'}).first().click();
      await page.waitForTimeout(600);
      await page.getByRole('dialog').getByRole('combobox').first().click();
      await page.getByRole('option', {name: /Finance/}).first().click();
      await page.getByRole('dialog').getByText(/On a whole table, this classification/).waitFor();
    },
  },
  {id: 'admin/gov-people-users', path: `${gov}/people`, settle: 2000},
  {id: 'admin/gov-people-groups', path: `${gov}/people?kind=group`, settle: 2000},
  {id: 'admin/gov-people-roles', path: `${gov}/people?kind=role`, settle: 2000},
  {id: 'admin/gov-people-unmatched', path: `${gov}/people?kind=unmatched`, settle: 1500},
  // Platform admins only (platform #741). Not referenced by a page until captured.
  {id: 'admin/gov-people-reused', path: `${gov}/people?kind=reused`, settle: 2000},
  {id: 'admin/gov-person-overview', path: `${gov}/people`, settle: 2000, prepare: click('Member SSO')},
  {id: 'admin/gov-person-permissions', path: `${gov}/people`, settle: 2000, prepare: seq(click('Member SSO'), tab('Permissions'))},
  {id: 'admin/gov-person-clearances', path: `${gov}/people`, settle: 2000, prepare: seq(click('Farid Haddad'), tab('Clearances'))},
  {
    id: 'admin/gov-person-check',
    path: `${gov}/people`,
    settle: 1000,
    prepare: async (page) => {
      await click('Member SSO')(page);
      await tab('Check access')(page);
      const main = page.locator('main');
      await main.getByRole('combobox').filter({hasText: /Select a catalog/}).click();
      await page.getByRole('option', {name: 'demo_warehouse'}).click();
      await main.getByRole('textbox').nth(0).fill('analytics');
      await main.getByRole('textbox').nth(1).fill('customers');
      await main.getByRole('button', {name: 'Explain'}).click();
      await page.waitForTimeout(4000);
      await main.getByText('No policy matched').first().scrollIntoViewIfNeeded();
    },
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
      await page.waitForTimeout(800);
    },
  },
  {id: 'admin/gov-engine-policies', path: `${gov}/engines`, settle: 2000, prepare: seq(click('docs-trino'), tab('Policies'))},
  {id: 'admin/gov-engine-plugin', path: `${gov}/engines`, settle: 2000, prepare: seq(click('docs-trino'), tab('Plugin'))},
  {id: 'admin/gov-engine-advanced', path: `${gov}/engines`, settle: 2000, prepare: seq(click('docs-trino'), tab('Advanced'))},
  {
    id: 'admin/gov-engine-migrate',
    path: `${gov}/engines`,
    settle: 1000,
    prepare: async (page) => {
      await click('trino-demo-ext')(page);
      await tab('Migrate')(page);
      await page.locator('main').getByRole('checkbox').last().check();
      await page.getByRole('button', {name: 'Preview migration'}).click();
      await page.waitForTimeout(5000);
    },
  },
  {id: 'admin/gov-profile', path: `${gov}/engines`, settle: 2000, prepare: link('docs-external-policy')},
  {
    id: 'admin/gov-policy-editor',
    path: `${gov}/engines`,
    settle: 2000,
    prepare: async (page) => {
      await click('trino-demo-ext')(page);
      await tab('Advanced')(page);
      await click('legacy: analysts read finance_pg')(page);
    },
  },
  {
    id: 'admin/gov-policy-editor-permissions',
    path: `${gov}/engines`,
    settle: 2000,
    prepare: async (page) => {
      await click('trino-demo-ext')(page);
      await tab('Advanced')(page);
      await click('legacy: analysts read finance_pg')(page);
      await page.getByRole('button', {name: /^Permissions/}).click();
    },
  },
  {id: 'admin/gov-classifications', path: `${gov}/classifications`, settle: 2000},
  {
    id: 'admin/gov-tag-detail',
    path: `${gov}/classifications`,
    settle: 2500,
    prepare: click('Personal data (PII)'),
  },
  {
    id: 'admin/gov-tag-rules',
    path: `${gov}/classifications`,
    settle: 2500,
    prepare: seq(click('Personal data (PII)'), tab('Mask & filter')),
  },
  {
    id: 'admin/gov-tag-exposure',
    path: `${gov}/classifications`,
    settle: 3000,
    prepare: seq(click('Personal data (PII)'), tab('View exposure')),
  },
  {id: 'admin/gov-tag-clearance', path: `${gov}/classifications`, settle: 2500, prepare: seq(click('Confidential'), tab('Clearance'))},
  {
    id: 'admin/gov-add-tag',
    path: `${T}?column=started_at`,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Add tag'}).last().click();
      await page.waitForTimeout(600);
      await page.getByRole('dialog').getByRole('combobox').first().click();
      await page.waitForTimeout(600);
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
  {id: 'admin/cp-workspace-resources', path: `${cp}/workspaces`, settle: 1500, prepare: seq(click('Docs sandbox'), tab('Resources'))},
  {id: 'admin/cp-workspace-features', path: `${cp}/workspaces`, settle: 1500, prepare: seq(click('Docs sandbox'), tab('Features'))},
  {id: 'admin/cp-workspace-requests', path: `${cp}/workspaces`, settle: 1500, prepare: seq(click('Finance analytics'), tab('Access requests'))},
  {id: 'admin/cp-users', path: `${cp}/users`, settle: 1500},
  {id: 'admin/cp-user-detail', path: `${cp}/users`, settle: 2000, prepare: seq(click('Farid Haddad'))},
  // The delete dialog with the retired username and Disable instead (platform #741); opening it deletes nothing.
  // Not referenced by a page until captured.
  {
    id: 'admin/cp-user-delete',
    path: `${cp}/users`,
    settle: 800,
    prepare: async (page) => {
      await click('Farid Haddad')(page);
      await page.getByRole('button', {name: 'Delete'}).first().click();
    },
  },
  {id: 'admin/cp-groups', path: `${cp}/groups`, settle: 1500},
  {id: 'admin/cp-group-detail', path: `${cp}/groups`, settle: 2000, prepare: seq(click('finance-analysts'))},
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
      await d.locator('#new-role-name').fill('report_viewer');
      await d.locator('#new-role-description').fill('Views dashboards and receives reports');
    },
  },
  {id: 'admin/cp-role-detail', path: `${cp}/roles`, settle: 2000, prepare: seq(click('finance_reporter'))},
  {id: 'admin/cp-permissions', path: `${cp}/permissions`, settle: 1500},
  {
    id: 'admin/cp-explorer-user',
    path: `${cp}/access-explorer`,
    settle: 2500,
    prepare: async (page) => {
      await page.getByText('Select a user…').click();
      await page.keyboard.type('alice');
      await page.waitForTimeout(800);
      await page.getByText('Alice Nguyen', {exact: false}).last().click();
    },
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
      await page.getByRole('checkbox').nth(2).check();
      await page.getByRole('checkbox').nth(3).check();
    },
  },
  {id: 'admin/cp-engines', path: `${cp}/engines`, settle: 2000},
  {id: 'admin/cp-engine-register', path: `${cp}/engines/register`, settle: 1500},
  {
    id: 'admin/cp-engine-new',
    path: `${cp}/engines/new`,
    settle: 1000,
    prepare: async (page) => {
      await page.locator('#ec-name').fill('analytics');
      await page.getByRole('radio', {name: 'Make demo_warehouse primary'}).click();
      await page.getByRole('checkbox').nth(1).check();
      await page.getByRole('button', {name: 'Worker', exact: true}).click();
      await page.locator('#ced-worker-replicas').fill('0');
    },
  },
  {
    id: 'admin/cp-engine-security',
    path: `${cp}/engines/new`,
    settle: 1000,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Security & Exposure', exact: true}).click();
      await page.waitForTimeout(500);
      await page.getByText('Ingress exposure', {exact: true}).scrollIntoViewIfNeeded();
    },
  },
  {id: 'admin/cp-engine-overview', path: `${cp}/engines`, settle: 2000, prepare: engine(DOCS_ENGINE)},
  {id: 'admin/cp-engine-catalogs', path: `${cp}/engines`, settle: 2000, prepare: seq(engine(DOCS_ENGINE), tab('Catalogs'))},
  {id: 'admin/cp-engine-workspaces', path: `${cp}/engines`, settle: 2000, prepare: seq(engine(DOCS_ENGINE), tab('Workspaces'))},
  {id: 'admin/cp-engine-settings', path: `${cp}/engines`, settle: 2000, prepare: seq(engine(DOCS_ENGINE), tab('Settings'))},
  {id: 'admin/cp-engine-monitor', path: `${cp}/engines`, settle: 4000, prepare: seq(engine(DOCS_ENGINE), tab('Monitor'))},
  {
    id: 'admin/cp-engine-logs',
    path: `${cp}/engines`,
    settle: 2500,
    prepare: async (page) => {
      await engine(DOCS_ENGINE)(page);
      await page.getByRole('button', {name: 'Logs'}).first().click();
    },
  },
  {
    id: 'admin/cp-engine-delete',
    path: `${cp}/engines`,
    settle: 800,
    prepare: async (page) => {
      await engine(DOCS_ENGINE)(page);
      await page.getByRole('button', {name: 'More engine actions'}).click();
      await page.getByRole('menuitem', {name: 'Delete engine'}).click();
    },
  },
  {id: 'admin/cp-engine-ext-overview', path: `${cp}/engines`, settle: 2000, prepare: engine('trino-demo-ext')},
  {id: 'admin/cp-engine-plugin', path: `${cp}/engines`, settle: 2000, prepare: seq(engine('trino-demo-ext'), tab('Plugin config'))},
  {id: 'admin/cp-engine-ext-settings', path: `${cp}/engines`, settle: 2000, prepare: seq(engine('trino-demo-ext'), tab('Settings'))},
  {id: 'admin/cp-catalogs', path: `${cp}/catalogs`, settle: 1500},
  {
    id: 'admin/cp-catalog-new',
    path: `${cp}/catalogs/new`,
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('combobox').first().click();
      await page.getByRole('option', {name: 'TPC-H', exact: true}).click();
      await page.getByRole('textbox', {name: 'Name', exact: true}).fill('tpch_large');
    },
  },
  {id: 'admin/cp-catalog-config', path: `${cp}/catalogs`, settle: 1500, prepare: link('tpch_bench')},
  {id: 'admin/cp-catalog-engines', path: `${cp}/catalogs`, settle: 1500, prepare: seq(link('tpch_bench'), tab('Engines'))},
  {id: 'admin/cp-catalog-workspaces', path: `${cp}/catalogs`, settle: 1500, prepare: seq(link('demo_warehouse'), tab('Workspaces'))},
  {id: 'admin/cp-catalog-roles', path: `${cp}/catalogs`, settle: 1500, prepare: seq(link('demo_warehouse'), tab('Roles & grants'))},
  {id: 'admin/cp-catalog-browse', path: `${cp}/catalogs`, settle: 2000, prepare: seq(link('demo_warehouse'), tab('Browse'), click('analytics'), click('sessions'))},
  {id: 'admin/cp-catalog-connect', path: `${cp}/catalogs`, settle: 1500, prepare: seq(link('demo_warehouse'), tab('Connect'))},
  {id: 'admin/cp-catalog-settings', path: `${cp}/catalogs`, settle: 1500, prepare: seq(link('demo_warehouse'), tab('Settings'))},
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
  {id: 'admin/cp-storage-browse', path: `${cp}/storage`, settle: 2500, prepare: seq(click('demo-rustfs'), tab('Browse'))},
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
      await click('marketing-api-token')(page);
      await page.getByRole('button', {name: 'Rotate value'}).click();
    },
  },
  {id: 'admin/cp-audit-log', path: `${cp}/audit-log`, settle: 2000},

  // ---- Workspace settings (Docs sandbox / Finance analytics are created by scripts/seed-admin.mjs)
  {id: 'admin/ws-general', path: '/explore/docs-sandbox/settings/general', settle: 1500},
  {id: 'admin/ws-members', path: '/explore/docs-sandbox/settings/members', settle: 1500},
  {
    id: 'admin/ws-add-member',
    path: '/explore/docs-sandbox/settings/members',
    settle: 600,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Add member'}).click();
      await page.getByRole('dialog').getByLabel('User email').fill('emma.schmidt@egret.local');
    },
  },
  {
    id: 'admin/ws-members-bulk',
    path: '/explore/docs-sandbox/settings/members',
    settle: 800,
    prepare: async (page) => {
      await page.getByRole('button', {name: 'Bulk select'}).click();
      await page.getByRole('checkbox').nth(3).check();
      await page.getByRole('checkbox').nth(4).check();
    },
  },
  {id: 'admin/ws-roles', path: '/explore/docs-sandbox/settings/roles', settle: 1500},
  {
    id: 'admin/ws-roles-expanded',
    path: '/explore/docs-sandbox/settings/roles',
    settle: 1000,
    prepare: seq(click('finance_reporter')),
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
  {id: 'admin/ws-notifications', path: '/explore/docs-sandbox/settings/notifications', settle: 1500},
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
