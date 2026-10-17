// Dumps the API database (DATABASE_URL from apps/api/.env) to the repo root.
// Usage: pnpm db:backup   (needs pg_dump on PATH, or set PG_DUMP to its full path)
import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { connectionOf, findPgBin, readDatabaseUrl, root, timestamp } from './lib/db.mjs';

const conn = connectionOf(readDatabaseUrl());
const out = join(root, `backup-${conn.db}-${timestamp()}.sql`);

const res = spawnSync(
  findPgBin('pg_dump'),
  [...conn.args, '--clean', '--if-exists', '--no-owner', '--no-privileges', '--file', out],
  { stdio: 'inherit', env: conn.env },
);

if (res.error || res.status !== 0) {
  console.error(res.error ? `Failed to run pg_dump: ${res.error.message}` : `pg_dump exited with ${res.status}`);
  process.exit(res.status || 1);
}
console.log(`Backup written: ${out} (${(statSync(out).size / 1024).toFixed(1)} KB)`);
console.log(`Restore with: psql "<DATABASE_URL without ?schema>" -f "${out}"`);
