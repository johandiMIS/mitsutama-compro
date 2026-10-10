// Prepares the hand-built "Power Electronic Test and Equipment" landing page (draft only):
// makes sure it has a tab for every product group used by its child pages, and removes the cards
// that were copied in earlier for products that are now listed automatically from their own pages.
// Cards you made by hand (names that are not a product page's title) are kept.
//   node docs/content/product/chroma/fill_power_landing.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const API = process.env.API_URL ?? 'http://localhost:3007';
const SLUG = 'power-electronic-test-and-equipment';
const env = Object.fromEntries(
  readFileSync(join(here, '../../../../apps/api/.env'), 'utf8').split(/\r?\n/)
    .map((l) => l.match(/^(\w+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^"|"$/g, '')]),
);
const login = await fetch(`${API}/admin/session`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ password: env.ADMIN_PASSWORD }),
});
const cookie = login.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
const api = async (path, opt = {}) => {
  const r = await fetch(`${API}${path}`, { ...opt, headers: { 'content-type': 'application/json', cookie } });
  if (!r.ok) throw new Error(`${path} ${r.status} ${await r.text()}`);
  return r.json();
};

const children = readdirSync(join(here, 'pages')).map((f) => JSON.parse(readFileSync(join(here, 'pages', f), 'utf8')))
  .filter((p) => p.parent === SLUG);
const childTitles = new Set(children.map((p) => p.title));
const groups = [...new Set(children.map((p) => p.productGroup).filter(Boolean))];

const page = (await api('/admin/pages')).find((p) => p.slug === SLUG);
const full = await api(`/admin/pages/${page.id}`);
const doc = structuredClone(full.draftData);
const block = doc.content.find((b) => b.type === 'CategorizedProducts');
for (const c of block.props.categories) c.products = c.products.filter((p) => !childTitles.has(p.name)).map(({ href, ...p }) => p);
for (const name of groups) if (!block.props.categories.some((c) => c.name === name)) block.props.categories.push({ name, products: [] });

await api('/admin/pages/import', {
  method: 'POST',
  body: JSON.stringify({ section: 'products', slug: SLUG, title: full.title, data: doc }),
});
for (const c of block.props.categories) console.log(c.name.padEnd(42), c.products.length, 'hand-made card(s)');
