// Screenshots for the Workflows area (platform/workflows/**). Ids are prefixed `workflows/`.
//
// The demo objects they show are created by `scripts/seed-workflows.mjs` (namespace `docs.demo`).
// Flows and executions are found by name at capture time, so no uuid is hard-coded here.
const ws = '/explore/default';
const BASE = process.env.BASE ?? 'http://localhost:5180';
const API = `${BASE}/api/ws/default/workflows`;

const getJson = async (page, path) => (await page.request.get(`${API}${path}`)).json();
const flowUuid = async (page, flowKey) => {
  const flows = await getJson(page, '/flows');
  const f = flows.find((x) => x.flow_id === flowKey && x.namespace === 'docs.demo');
  if (!f) throw new Error(`flow ${flowKey} not found; run scripts/seed-workflows.mjs`);
  return f.id;
};
// The newest execution of a flow, optionally in a given state, that is not a child iteration.
const executionId = async (page, flowKey, state) => {
  const list = await getJson(page, '/executions?limit=200');
  const hit = list.rows.find((e) => e.flow_key === flowKey && !e.parent_execution_id && (!state || e.state === state));
  if (!hit) throw new Error(`no ${state ?? ''} execution of ${flowKey}`);
  return hit.id;
};
const backfillExecutionId = async (page) => {
  const list = await getJson(page, '/executions?limit=200');
  const hit = list.rows.find((e) => e.flow_key === 'nightly-heartbeat' && e.backfill_id);
  if (!hit) throw new Error('no backfill execution; run the backfill in scripts/seed-workflows.mjs');
  return hit.id;
};
const go = async (page, path, settle = 1500) => {
  await page.goto(`${BASE}${path}`, {waitUntil: 'domcontentloaded'});
  await page.waitForTimeout(settle);
};
const flowTab = (flowKey, tab, settle = 6000) => async (page) => {
  await go(page, `${ws}/workflows/flows/${await flowUuid(page, flowKey)}/${tab}`, settle);
};
const execTab = (flowKey, tab, state, settle = 3500) => async (page) => {
  await go(page, `${ws}/workflows/executions/${await executionId(page, flowKey, state)}/${tab}`, settle);
};
const nsTab = (tab, settle = 7000) => async (page) => {
  await go(page, `${ws}/workflows/namespaces/docs.demo/${tab}`, settle);
};
// The flow editor remembers its panel layout per flow in localStorage.
const withLayout = (flowKey, panels) => async (page) => {
  const id = await flowUuid(page, flowKey);
  await go(page, `${ws}/workflows/flows`, 500);
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [`egret.wf.layout.${id}`, JSON.stringify({panels})]);
  await go(page, `${ws}/workflows/flows/${id}/edit`, 7000);
};

export const shots = [
  // --- Flows
  {id: 'workflows/flows-list', path: `${ws}/workflows/flows`, settle: 1500},
  {id: 'workflows/flow-new', path: `${ws}/workflows/flows/new`, settle: 6000},
  {id: 'workflows/flow-editor', path: `${ws}/workflows/flows`, prepare: flowTab('greet-customer', 'edit'), settle: 500},
  {
    id: 'workflows/flow-editor-problems',
    path: `${ws}/workflows/flows`,
    prepare: async (page) => {
      await flowTab('broken-draft', 'edit')(page);
      await page.getByRole('tab', {name: /^Problems/}).click();
    },
    settle: 1500,
  },
  {
    id: 'workflows/flow-editor-topology',
    path: `${ws}/workflows/flows`,
    prepare: withLayout('order-routing', [
      {id: 'p1', size: 38, tabs: ['code'], active: 'code'},
      {id: 'p2', size: 62, tabs: ['topology', 'docs', 'problems'], active: 'topology'},
    ]),
    settle: 2500,
  },
  {
    id: 'workflows/flow-run-dialog',
    path: `${ws}/workflows/flows`,
    prepare: async (page) => {
      await flowTab('greet-customer', 'edit')(page);
      await page.getByRole('button', {name: /^run$/i}).first().click();
    },
    settle: 1500,
  },
  {id: 'workflows/flow-revisions', path: `${ws}/workflows/flows`, prepare: flowTab('greet-customer', 'revisions', 4000), settle: 1500},
  {id: 'workflows/flow-executions', path: `${ws}/workflows/flows`, prepare: flowTab('fan-out-regions', 'executions', 4000), settle: 1500},
  {id: 'workflows/flow-triggers', path: `${ws}/workflows/flows`, prepare: flowTab('nightly-heartbeat', 'triggers', 4000), settle: 1500},

  // --- Executions
  {id: 'workflows/executions-list', path: `${ws}/workflows/executions`, settle: 2500},
  {id: 'workflows/execution-overview', path: `${ws}/workflows/executions`, prepare: execTab('greet-customer', 'overview', 'SUCCESS'), settle: 500},
  {id: 'workflows/execution-failed', path: `${ws}/workflows/executions`, prepare: execTab('flaky-import', 'overview', 'FAILED'), settle: 500},
  {id: 'workflows/execution-topology', path: `${ws}/workflows/executions`, prepare: execTab('order-routing', 'topology', 'SUCCESS', 5000), settle: 1000},
  {id: 'workflows/execution-topology-failed', path: `${ws}/workflows/executions`, prepare: execTab('flaky-import', 'topology', 'FAILED', 5000), settle: 1000},
  {id: 'workflows/execution-gantt', path: `${ws}/workflows/executions`, prepare: execTab('flaky-import', 'gantt', 'FAILED', 4000), settle: 1000},
  {id: 'workflows/execution-logs', path: `${ws}/workflows/executions`, prepare: execTab('flaky-import', 'logs', 'FAILED', 4000), settle: 1000},
  {id: 'workflows/execution-outputs', path: `${ws}/workflows/executions`, prepare: execTab('greet-customer', 'outputs', 'SUCCESS', 4000), settle: 500},
  {id: 'workflows/execution-children', path: `${ws}/workflows/executions`, prepare: execTab('fan-out-regions', 'overview', 'SUCCESS'), settle: 500},
  {id: 'workflows/execution-paused', path: `${ws}/workflows/executions`, prepare: execTab('approval-gate', 'overview', 'PAUSED'), settle: 500},
  {
    id: 'workflows/execution-scheduled',
    path: `${ws}/workflows/executions`,
    prepare: async (page) => {
      await go(page, `${ws}/workflows/executions/${await backfillExecutionId(page)}/overview`, 3500);
    },
    settle: 500,
  },
  {
    id: 'workflows/execution-resume',
    path: `${ws}/workflows/executions`,
    prepare: async (page) => {
      await execTab('approval-gate', 'overview', 'PAUSED')(page);
      await page.getByRole('button', {name: 'Resume'}).first().click();
    },
    settle: 1000,
  },
  {
    id: 'workflows/execution-replay',
    path: `${ws}/workflows/executions`,
    prepare: async (page) => {
      await execTab('flaky-import', 'overview', 'FAILED')(page);
      await page.getByRole('button', {name: 'Replay'}).first().click();
    },
    settle: 1000,
  },
  {
    id: 'workflows/execution-kill',
    path: `${ws}/workflows/executions`,
    prepare: async (page) => {
      await execTab('approval-gate', 'overview', 'PAUSED')(page);
      await page.getByRole('button', {name: 'Kill'}).first().click();
    },
    settle: 1000,
  },

  // --- Namespaces
  {id: 'workflows/namespaces-list', path: `${ws}/workflows/namespaces`, settle: 2500},
  {id: 'workflows/namespace-overview', path: `${ws}/workflows/namespaces`, prepare: nsTab('overview', 5000), settle: 500},
  {
    id: 'workflows/namespace-files',
    path: `${ws}/workflows/namespaces`,
    prepare: async (page) => {
      await nsTab('files')(page);
      await page.getByText('scripts', {exact: true}).first().click().catch(() => {});
      await page.waitForTimeout(800);
      await page.getByText('greet.py', {exact: true}).first().click().catch(() => {});
    },
    settle: 3000,
  },
  {id: 'workflows/namespace-kv', path: `${ws}/workflows/namespaces`, prepare: nsTab('kv'), settle: 1000},
  {
    id: 'workflows/namespace-kv-add',
    path: `${ws}/workflows/namespaces`,
    prepare: async (page) => {
      await nsTab('kv')(page);
      await page.getByRole('button', {name: 'Add a key'}).first().click();
    },
    settle: 1500,
  },
  {id: 'workflows/namespace-dependencies', path: `${ws}/workflows/namespaces`, prepare: nsTab('dependencies', 9000), settle: 1000},

  // --- Triggers
  {id: 'workflows/triggers-list', path: `${ws}/workflows/triggers`, settle: 3500},
  {
    id: 'workflows/trigger-enable',
    path: `${ws}/workflows/triggers`,
    prepare: async (page) => {
      await page.waitForTimeout(3500);
      await page.getByRole('row').filter({hasText: 'every_minute'}).getByRole('switch').click();
    },
    settle: 1500,
  },
  {
    id: 'workflows/trigger-details',
    path: `${ws}/workflows/triggers`,
    prepare: async (page) => {
      await page.waitForTimeout(3500);
      await page.getByRole('row').filter({hasText: 'every_minute'}).getByText('Details').first().click();
    },
    settle: 2500,
  },
  {
    id: 'workflows/trigger-backfill',
    path: `${ws}/workflows/triggers`,
    prepare: async (page) => {
      await page.waitForTimeout(3500);
      await page.getByRole('row').filter({hasText: 'every_minute'}).getByRole('button', {name: 'Backfill'}).click();
    },
    settle: 1500,
  },
];
