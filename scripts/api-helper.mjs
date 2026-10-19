// Tiny API helper for seeding scripts: loads a Playwright storage state, adds the CSRF header.
// Usage (as module): import {api} from './api-helper.mjs'; const a = await api(process.env.STATE); await a.get('/api/...').
import {request} from 'playwright';
import {readFileSync} from 'node:fs';
export async function api(statePath, base = process.env.BASE ?? 'http://localhost:5180') {
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  const csrf = state.cookies.find((c) => c.name === 'egret_csrf')?.value ?? '';
  const ctx = await request.newContext({baseURL: base, storageState: statePath, extraHTTPHeaders: {'X-Egret-CSRF': csrf}});
  const wrap = (m) => async (url, data) => {
    const r = await ctx[m](url, data === undefined ? {} : {data});
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch { j = t; }
    return {status: r.status(), body: j};
  };
  return {get: wrap('get'), post: wrap('post'), put: wrap('put'), patch: wrap('patch'), del: wrap('delete')};
}
