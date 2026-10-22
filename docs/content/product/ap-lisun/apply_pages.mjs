// Applies pages/*.json to the running API with ONE admin login (the login endpoint is rate limited):
//   1. a placeholder page named in "_oldSlug" is unpublished, then renamed (slug + title) in place,
//   2. the page content is imported as the draft (new pages are created in their menu group),
//   3. the menu position ("_order") is set, and the page is published.
// Re-running is safe. Then regenerate the status file: node docs/content/generate-content-status.mjs
//   node docs/content/product/ap-lisun/apply_pages.mjs [slug ...]     (no slugs = all pages)
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const API = process.env.API_URL ?? 'http://localhost:3007';
const only = process.argv.slice(2);
const env = Object.fromEntries(
  readFileSync(join(here, '../../../../apps/api/.env'), 'utf8').split(/\r?\n/)
    .map((l) => l.match(/^(\w+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^"|"$/g, '')]),
);
const login = await fetch(`${API}/admin/session`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ password: env.ADMIN_PASSWORD }),
});
if (!login.ok) throw new Error(`login failed: ${login.status}`);
const h = { 'content-type': 'application/json', cookie: login.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ') };
const call = async (method, path, body) => {
  const r = await fetch(`${API}${path}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!r.ok) throw new Error(`${method} ${path} ${r.status} ${(await r.text()).slice(0, 300)}`);
  return r.status === 204 ? null : r.json();
};

const files = readdirSync(join(here, 'pages')).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(here, 'pages', f), 'utf8')))
  .filter((p) => only.length === 0 || only.includes(p.slug));

let list = await call('GET', '/admin/pages');
for (const { _oldSlug, _order, ...envelope } of files) {
  const bySlug = (s) => list.find((p) => p.section === 'products' && p.slug === s);
  if (_oldSlug && bySlug(_oldSlug) && !bySlug(envelope.slug)) {
    const old = bySlug(_oldSlug);
    if (old.status === 'published') await call('POST', `/admin/pages/${old.id}/unpublish`);
    await call('PATCH', `/admin/pages/${old.id}`, { slug: envelope.slug, title: envelope.title });
    console.log(`renamed ${_oldSlug} -> ${envelope.slug}`);
  }
  const saved = await call('POST', '/admin/pages/import', envelope);
  await call('PATCH', `/admin/pages/${saved.id}`, { sortOrder: _order });
  await call('POST', `/admin/pages/${saved.id}/publish`);
  console.log(`published ${envelope.group} / ${envelope.slug}`);
  list = await call('GET', '/admin/pages');
}
