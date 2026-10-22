// POSTs the landing pages ("landing": true) in pages/*.json; the other files are card sources only.
// Originally: every pages/*.json to /admin/pages/import (replaces each page's DRAFT only; nothing is published).
//   node docs/content/product/chroma/import_pages.mjs        (landing pages only)
//   ALL=1 node docs/content/product/chroma/import_pages.mjs   (also the per-product pages)
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const only = process.argv.slice(2); // optional: page slugs to import (any page, not just landings)
const API = process.env.API_URL ?? 'http://localhost:3007';
const env = Object.fromEntries(
  readFileSync(join(here, '../../../../apps/api/.env'), 'utf8').split(/\r?\n/)
    .map((l) => l.match(/^(\w+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^"|"$/g, '')]),
);
const login = await fetch(`${API}/admin/session`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ password: env.ADMIN_PASSWORD }),
});
if (!login.ok) throw new Error(`login failed: ${login.status}`);
const cookie = login.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');

let ok = 0;
for (const f of readdirSync(join(here, 'pages')).filter((f) => f.endsWith('.json')).sort().filter((f) => only.length ? only.includes(f.replace(/\.json$/, '')) : process.env.ALL || JSON.parse(readFileSync(join(here, 'pages', f), 'utf8')).landing)) {
  const r = await fetch(`${API}/admin/pages/import`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify((({ landing, ...page }) => page)(JSON.parse(readFileSync(join(here, 'pages', f), 'utf8')))),
  });
  if (r.ok) ok++; else console.log('FAIL', f, r.status, (await r.text()).slice(0, 400));
}
console.log(`${ok} pages imported`);
