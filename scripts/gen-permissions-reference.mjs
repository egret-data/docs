// Generates the permission tables of platform/reference/permissions.md.
//
// Usage:
//   node scripts/gen-permissions-reference.mjs [rbac.rs] [permissions.json]
//
// rbac.rs is crates/egret-core/src/rbac.rs of the product (the catalog is defined there, with each
// permission's description and scope). permissions.json is optional: the output of
// GET /api/control-plane/permissions on a running instance, used to add the "Granted to" column
// (which built-in roles hold each permission on a fresh install). The tables are written between
// the <!-- perm-table:start --> and <!-- perm-table:end --> markers.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const rbac = process.argv[2] ?? resolve(here, '../../../egret-docs-run/crates/egret-core/src/rbac.rs');
const rolesJson = process.argv[3];
const src = readFileSync(rbac, 'utf8');

// perm!("key", "Group", "Description", Scope::X)  (strings may span lines)
const re = /perm!\(\s*"([^"]+)",\s*"([^"]+)",\s*"((?:[^"\\]|\\.)*)",\s*Scope::(\w+)\s*\)/g;
const perms = [];
for (const m of src.matchAll(re)) perms.push({key: m[1], group: m[2], desc: m[3].replace(/\\"/g, '"'), scope: m[4].toLowerCase()});

const roles = {};
if (rolesJson && existsSync(rolesJson)) {
  for (const g of JSON.parse(readFileSync(rolesJson, 'utf8'))) for (const p of g.permissions) roles[p.key] = p.roles;
}

const groups = [...new Set(perms.map((p) => p.group))];
const esc = (s) => s.replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/\{/g, '\\{');
let md = '<!-- perm-table:start -->\n';
for (const g of groups) {
  md += `### ${g}\n\n| Permission | Scope | What it allows | Built-in roles that hold it |\n|---|---|---|---|\n`;
  for (const p of perms.filter((x) => x.group === g)) {
    const r = roles[p.key];
    md += `| \`${p.key}\` | ${p.scope} | ${esc(p.desc)} | ${r ? (r.length ? r.map((x) => `\`${x}\``).join(', ') : 'none (only the `platform_admin` bypass)') : ''} |\n`;
  }
  md += '\n';
}
md += '<!-- perm-table:end -->';

const target = resolve(here, '../platform/reference/permissions.md');
const cur = readFileSync(target, 'utf8');
writeFileSync(target, cur.replace(/<!-- perm-table:start -->[\s\S]*<!-- perm-table:end -->/, () => md));
console.log(`${perms.length} permissions in ${groups.length} groups`);
