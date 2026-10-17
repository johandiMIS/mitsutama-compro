// Shared helpers for the db scripts: read DATABASE_URL, locate PostgreSQL client binaries.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function readDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envFile = join(root, 'apps/api/.env');
  if (!existsSync(envFile)) throw new Error(`Missing ${envFile} and no DATABASE_URL set`);
  const line = readFileSync(envFile, 'utf8')
    .split(/\r?\n/)
    .find((l) => /^\s*DATABASE_URL\s*=/.test(l));
  if (!line) throw new Error('DATABASE_URL not found in apps/api/.env');
  return line.replace(/^[^=]*=/, '').trim().replace(/^["']|["']$/g, '');
}

/** `name` is a client binary: 'pg_dump' | 'psql'. Env override: PG_DUMP / PSQL. */
export function findPgBin(name) {
  const override = process.env[name.toUpperCase()];
  if (override) return override;
  if (process.platform === 'win32') {
    const base = 'C:\\Program Files\\PostgreSQL';
    for (const v of [18, 17, 16, 15, 14, 13]) {
      const p = join(base, String(v), 'bin', `${name}.exe`);
      if (existsSync(p)) return p;
    }
  }
  return name;
}

/** Connection flags + PGPASSWORD env for a postgres URL. */
export function connectionOf(urlString) {
  const url = new URL(urlString);
  const db = decodeURIComponent(url.pathname.slice(1));
  return {
    db,
    args: [
      '--host', url.hostname,
      '--port', url.port || '5432',
      '--username', decodeURIComponent(url.username),
      '--dbname', db,
    ],
    env: { ...process.env, PGPASSWORD: decodeURIComponent(url.password) },
  };
}

export function timestamp() {
  return new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
}
