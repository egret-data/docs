// Generates the REST API reference pages from Egret's openapi.json.
//
// Usage:
//   node scripts/gen-api-reference.mjs [path/to/openapi.json]
//
// The default input is the product checkout used for the docs
// (a sibling checkout named egret-docs-run, i.e. `egret openapi > openapi.json`).
// Output: platform/reference/rest-api/index.md plus one page per OpenAPI tag
// (platform/reference/rest-api/<tag>.md). The output is committed, so a
// reader of the docs does not need to run this; re-run it when the API changes.
import {readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const input = process.argv[2] ?? resolve(here, '../../../egret-docs-run/openapi.json');
const outDir = resolve(here, '../platform/reference/rest-api');
const spec = JSON.parse(readFileSync(input, 'utf8'));

// Sections of the index, in reading order. Tags not listed fall into "Other".
const sections = [
  ['Authentication and identity', ['auth', 'oidc', 'idp', 'me']],
  ['Workspaces and members', ['admin-workspaces', 'admin-users', 'workspace-members', 'access-requests', 'shares']],
  ['Explore (BI)', ['databases', 'queries', 'sqllab', 'datasets', 'charts', 'dashboards', 'folders', 'alerts', 'apps']],
  ['Data API', ['data-api', 'data-api-serving']],
  ['Workflows', ['workflow']],
  ['Data governance', ['perm', 'policy-admin', 'ranger', 'control-plane-governance', 'control-plane-tags']],
  ['Control plane', ['control-plane-access', 'control-plane-engines', 'control-plane-catalog-registry', 'control-plane-catalog', 'control-plane-storage', 'control-plane-secrets', 'control-plane-audit']],
];
const pageTitle = {
  auth: 'Authentication', oidc: 'OIDC single sign-on', idp: 'Machine identity provider', me: 'Current user',
  'admin-workspaces': 'Workspace administration', 'admin-users': 'User administration',
  'workspace-members': 'Workspace members', 'access-requests': 'Access requests', shares: 'Sharing',
  databases: 'Databases', queries: 'Queries', sqllab: 'SQL Lab', datasets: 'Datasets', charts: 'Charts',
  dashboards: 'Dashboards', folders: 'Folders', alerts: 'Alerts and reports', apps: 'Data Apps',
  'data-api': 'Data API management', 'data-api-serving': 'Data API serving', workflow: 'Workflows',
  perm: 'Permission model', 'policy-admin': 'Policy administration', ranger: 'Ranger-compatible policy service',
  'control-plane-governance': 'Governance data browser', 'control-plane-tags': 'Classification tags',
  'control-plane-access': 'Access control', 'control-plane-engines': 'Engines',
  'control-plane-catalog-registry': 'Catalog registry', 'control-plane-catalog': 'Egret warehouses',
  'control-plane-storage': 'Storage connections', 'control-plane-secrets': 'Secrets', 'control-plane-audit': 'Audit log',
};

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const publicPaths = new Set([
  '/.well-known/jwks.json', '/.well-known/openid-configuration', '/api/auth/config', '/api/auth/login',
  '/api/auth/logout', '/api/auth/oidc/login', '/api/auth/oidc/callback', '/api/auth/oidc/backchannel-logout',
]);

// Escape text for MDX table cells and paragraphs.
const esc = (s) =>
  String(s ?? '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\|/g, '\\|')
    .replace(/</g, '&lt;')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .trim();

// Doc comments in the Rust source become OpenAPI descriptions and can run to pages. Keep the first
// paragraph, cut at a markdown heading, and cap the length.
const brief = (d, max = 240) => {
  if (!d) return '';
  let t = String(d).split(/\n\s*\n/)[0].split(/ # /)[0].replace(/\s+/g, ' ').trim();
  if (t.length > max) t = `${t.slice(0, t.lastIndexOf(' ', max))}...`;
  return t;
};

const deref = (s) => {
  if (s && s.$ref) return spec.components.schemas[s.$ref.split('/').pop()] ?? {};
  return s ?? {};
};
const refName = (s) => (s && s.$ref ? s.$ref.split('/').pop() : null);

function typeOf(s) {
  if (!s) return 'any';
  if (s.$ref) return refName(s);
  if (s.oneOf || s.anyOf) {
    const alts = (s.oneOf ?? s.anyOf).map(typeOf).filter((t) => t !== 'null');
    return alts.join(' or ');
  }
  if (s.allOf) return s.allOf.map(typeOf).join(' + ');
  if (s.enum) return s.enum.map((v) => JSON.stringify(v)).join(' / ');
  let t = Array.isArray(s.type) ? s.type.filter((x) => x !== 'null').join(' or ') : s.type;
  if (t === 'array') return `${typeOf(s.items)}[]`;
  if (s.format) t = `${t} (${s.format})`;
  return t ?? 'object';
}

// Flattened property table for a schema (one level; nested objects are named, not expanded).
function propRows(schema) {
  let s = deref(schema);
  if (s.allOf) {
    const merged = {properties: {}, required: []};
    for (const part of s.allOf) {
      const d = deref(part);
      Object.assign(merged.properties, d.properties ?? {});
      merged.required.push(...(d.required ?? []));
    }
    s = merged;
  }
  if (s.type === 'array') return {array: typeOf(s.items), rows: propRows(s.items).rows};
  const req = new Set(s.required ?? []);
  const rows = Object.entries(s.properties ?? {}).map(([name, p]) => {
    const d = p.$ref ? deref(p) : p;
    const nullable = Array.isArray(p.type) && p.type.includes('null');
    return {name, type: typeOf(p), required: req.has(name), nullable, desc: brief(p.description ?? d.description ?? '')};
  });
  return {array: null, rows, oneOf: s.oneOf ?? s.anyOf ?? null};
}

function schemaBlock(schema, label) {
  if (!schema) return '';
  const name = refName(schema);
  const {array, rows, oneOf} = propRows(schema);
  const head = `**${label}**: ${array ? `array of \`${array}\`` : name ? `\`${name}\`` : `\`${typeOf(schema)}\``}`;
  if (!rows.length) {
    if (oneOf) return `${head}, one of ${oneOf.map((x) => `\`${typeOf(x)}\``).join(', ')}.\n\n`;
    return `${head}\n\n`;
  }
  const shown = rows.slice(0, 60);
  let out = `${head}\n\n| Field | Type | Required | Description |\n|---|---|---|---|\n`;
  for (const r of shown) {
    out += `| \`${r.name}\` | ${esc(r.type)}${r.nullable ? ', nullable' : ''} | ${r.required ? 'yes' : 'no'} | ${esc(r.desc)} |\n`;
  }
  if (rows.length > shown.length) out += `\n${rows.length - shown.length} more fields; see \`openapi.json\`.\n`;
  return out + '\n';
}

function authOf(path, method, op) {
  if (op.security?.length) return 'Bearer token (a `data-api` JWT from `POST /oauth/token`)';
  if (publicPaths.has(path)) return 'None (public)';
  if (path === '/oauth/token') return 'None (client credentials in the body)';
  if (path.startsWith('/service/')) return 'Bearer token equal to `ranger.auth_token` (open when the token is empty)';
  return method === 'get' ? 'Session cookie' : 'Session cookie and `X-Egret-CSRF` header';
}

// Collect operations by tag, in document order.
const byTag = new Map();
for (const [path, item] of Object.entries(spec.paths)) {
  for (const method of METHODS) {
    const op = item[method];
    if (!op) continue;
    const tag = (op.tags ?? ['untagged'])[0];
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag).push({path, method, op, shared: item.parameters ?? []});
  }
}
const tagDesc = Object.fromEntries((spec.tags ?? []).map((t) => [t.name, t.description]));

mkdirSync(outDir, {recursive: true});
for (const f of readdirSync(outDir)) if (f.endsWith('.md') && f !== 'index.md') rmSync(resolve(outDir, f));

const listed = new Set(sections.flatMap(([, tags]) => tags));
const other = [...byTag.keys()].filter((t) => !listed.has(t));
if (other.length) sections.push(['Other', other]);

let position = 2;
for (const [, tags] of sections) {
  for (const tag of tags) {
    const ops = byTag.get(tag);
    if (!ops) continue;
    const title = pageTitle[tag] ?? tag;
    let md = `---\nsidebar_position: ${position++}\nsidebar_label: ${title}\ndescription: REST endpoints in the ${tag} group.\n---\n\n`;
    md += `# ${title} API\n\n`;
    md += `${esc(tagDesc[tag] ?? '')}.\n\n`.replace('..', '.');
    md += `This page lists ${ops.length} endpoint${ops.length === 1 ? '' : 's'} (OpenAPI tag \`${tag}\`). It is generated from \`openapi.json\`; see the [REST API overview](../rest-api) for authentication, CSRF and error conventions.\n\n`;
    md += '| Method | Path | Operation id | Notes |\n|---|---|---|---|\n';
    for (const {path, method, op} of ops) {
      md += `| ${method.toUpperCase()} | \`${path}\` | \`${op.operationId}\` | ${esc(short(op))} |\n`;
    }
    md += '\n';
    for (const {path, method, op, shared} of ops) {
      md += `## ${method.toUpperCase()} \`${path}\`\n\n`;
      const need = op.responses?.['403']?.description;
      md += `Operation id: \`${op.operationId}\`. Auth: ${authOf(path, method, op)}.${need ? ` Forbidden (403): ${esc(need).replace(/\\.$/, '')}.` : ''}\n\n`;
      if (op.summary && op.summary !== firstLine(op.description)) md += `${esc(op.summary)}\n\n`;
      if (op.description) md += `${esc(brief(op.description, 700))}\n\n`;
      const params = [...shared, ...(op.parameters ?? [])].map((p) => (p.$ref ? spec.components.parameters?.[p.$ref.split('/').pop()] ?? p : p));
      if (params.length) {
        md += '| Parameter | In | Type | Required | Description |\n|---|---|---|---|---|\n';
        for (const p of params) md += `| \`${p.name}\` | ${p.in} | ${esc(typeOf(p.schema))} | ${p.required ? 'yes' : 'no'} | ${esc(brief(p.description))} |\n`;
        md += '\n';
      }
      const body = op.requestBody?.content;
      if (body) {
        const [ct, v] = Object.entries(body)[0];
        md += schemaBlock(v.schema, `Request body (${ct})`);
      }
      const codes = Object.entries(op.responses ?? {});
      const ok = codes.find(([c]) => c.startsWith('2'));
      if (ok?.[1].content) {
        const [ct, v] = Object.entries(ok[1].content)[0];
        md += schemaBlock(v.schema, `Response ${ok[0]} (${ct})`);
      }
      md += '| Status | Meaning |\n|---|---|\n';
      for (const [code, r] of codes) md += `| ${code} | ${esc(brief(r.description))} |\n`;
      md += '\n';
    }
    writeFileSync(resolve(outDir, `${tag}.md`), md);
  }
}

// One short line for the summary table: the summary, else the first sentence of the description.
function short(op) {
  const t = op.summary ?? brief(op.description, 200) ?? op.responses?.['403']?.description ?? '';
  const sentence = t.split(/(?<=\.)\s/)[0];
  return sentence.length > 160 ? `${sentence.slice(0, 157)}...` : sentence;
}
function firstLine(s) {
  return s ? s.split('\n')[0] : undefined;
}

// The index table; the hand-written overview in index.md has a marker where it goes.
const rows = sections.flatMap(([sec, tags]) =>
  tags.filter((t) => byTag.has(t)).map((t) => `| ${sec} | [${pageTitle[t] ?? t}](rest-api/${t}) | ${byTag.get(t).length} |`),
);
const table = `<!-- api-index:start -->\n| Area | Page | Endpoints |\n|---|---|---|\n${rows.join('\n')}\n<!-- api-index:end -->`;
const indexPath = resolve(outDir, 'index.md');
const cur = readFileSync(indexPath, 'utf8');
writeFileSync(indexPath, cur.replace(/<!-- api-index:start -->[\s\S]*<!-- api-index:end -->/, table));
console.log(`${[...byTag.values()].reduce((n, o) => n + o.length, 0)} operations in ${byTag.size} tags`);
