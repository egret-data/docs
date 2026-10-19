// One entry per screenshot: id (file name), path (app route), optional prepare(page), settle ms, fullPage.
export const shots = [
  {id: 'login', path: '/login'},
  {id: 'home', path: '/'},
  {id: 'explore-databases', path: '/explore/default/databases'},
  {id: 'explore-datasets', path: '/explore/default/datasets'},
  {id: 'explore-sql-lab', path: '/explore/default/sql-lab'},
  {id: 'explore-charts', path: '/explore/default/charts'},
  {id: 'explore-dashboards', path: '/explore/default/dashboards'},
  {id: 'control-plane-workspaces', path: '/control-plane/workspaces'},
  {id: 'control-plane-engines', path: '/control-plane/engines'},
  {id: 'control-plane-secrets', path: '/control-plane/secrets'},
  {id: 'control-plane-storage', path: '/control-plane/storage'},
  {id: 'control-plane-audit-log', path: '/control-plane/audit-log'},
];
