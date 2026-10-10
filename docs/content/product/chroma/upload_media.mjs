// Uploads docs/content/product/chroma/media/*.webp through the admin media API and writes
// media-urls.json (name -> public URL) for build_pages.py to read.
//
// Run (API must be up on :3007, apps/api/.env must hold ADMIN_PASSWORD and the S3 settings):
//   node docs/content/product/chroma/upload_media.mjs
// Re-running uploads everything again under new keys; only do it after prepare_media.py changed.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const API = process.env.API_URL ?? 'http://localhost:3007';
const env = Object.fromEntries(
  readFileSync(join(here, '../../../../apps/api/.env'), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.match(/^(\w+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^"|"$/g, '')]),
);

const login = await fetch(`${API}/admin/session`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ password: env.ADMIN_PASSWORD }),
});
if (!login.ok) throw new Error(`login failed: ${login.status}`);
const cookie = login.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');

const call = async (path, body) => {
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${path} ${r.status} ${await r.text()}`);
  return r.json();
};

const dir = join(here, 'media');
// Optional: node upload_media.mjs <name> [<name>...] uploads only those images and keeps the rest of
// media-urls.json as it is.
const only = process.argv.slice(2);
let urls = {};
try { urls = JSON.parse(readFileSync(join(here, 'media-urls.json'), 'utf8')); } catch {}
for (const file of readdirSync(dir).filter((f) => f.endsWith('.webp') && (only.length === 0 || only.includes(f.replace(/\.webp$/, '')))).sort()) {
  const bytes = readFileSync(join(dir, file));
  const presigned = await call('/admin/media/presign', {
    filename: file,
    contentType: 'image/webp',
    sizeBytes: bytes.length,
  });
  const form = new FormData(); // policy fields first: S3 ignores anything after `file`
  for (const [k, v] of Object.entries(presigned.fields)) form.append(k, v);
  form.append('file', new Blob([bytes], { type: 'image/webp' }), file);
  const put = await fetch(presigned.url, { method: 'POST', body: form });
  if (!put.ok) throw new Error(`S3 upload of ${file} failed: ${put.status} ${await put.text()}`);
  const done = await call('/admin/media', { key: presigned.key });
  urls[file.replace(/\.webp$/, '')] = done.url;
  console.log(file, '->', done.url);
}
writeFileSync(join(here, 'media-urls.json'), JSON.stringify(urls, null, 2));
console.log(`media-urls.json now lists ${Object.keys(urls).length} images`);
