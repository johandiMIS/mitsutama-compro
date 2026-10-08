// Dumps the API database (DATABASE_URL from apps/api/.env) to the repo root.
// Usage: pnpm db:backup   (needs pg_dump on PATH, or set PG_DUMP to its full path)
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = join(root, 'apps/api/.env');

function readDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (!existsSync(envFile)) throw new Error(`Missing ${envFile} and no DATABASE_URL set`);
  const line = readFileSync(envFile, 'utf8')
    .split(/\r?\n/)
    .find((l) => /^\s*DATABASE_URL\s*=/.test(l));
  if (!line) throw new Error('DATABASE_URL not found in apps/api/.env');
  return line.replace(/^[^=]*=/, '').trim().replace(/^["']|["']$/g, '');
}

function findPgDump() {
  if (process.env.PG_DUMP) return process.env.PG_DUMP;
  if (process.platform === 'win32') {
    const base = 'C:\Program Files\PostgreSQL';
    for (const v of [18, 17, 16, 15, 14, 13]) {
      const p = join(base, String(v), 'bin', 'pg_dump.exe');
      if (existsSync(p)) return p;
    }
  }
  return 'pg_dump';
}

const url = new URL(readDatabaseUrl());
const db = decodeURIComponent(url.pathname.slice(1));
const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
const out = join(root, `backup-${db}-${stamp}.sql`);

const args = [
  '--host', url.hostname,
  '--port', url.port || '5432',
  '--username', decodeURIComponent(url.username),
  '--dbname', db,
  '--clean', '--if-exists', '--no-owner', '--no-privileges',
  '--file', out,
];

const res = spawnSync(findPgDump(), args, {
  stdio: 'inherit',
  env: { ...process.env, PGPASSWORD: decodeURIComponent(url.password) },
});

if (res.error || res.status !== 0) {
  console.error(res.error ? `Failed to run pg_dump: ${res.error.message}` : `pg_dump exited with ${res.status}`);
  process.exit(res.status || 1);
}
console.log(`Backup written: ${out} (${(statSync(out).size / 1024).toFixed(1)} KB)`);
console.log(`Restore with: psql "<DATABASE_URL without ?schema>" -f "${out}"`);
