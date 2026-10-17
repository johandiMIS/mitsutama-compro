// Pushes the content-page tables (NavGroup, Page) from the local DB to the production VPS,
// REPLACING what is there. Other tables (HeroImage, User) are never touched.
//
// Usage: pnpm db:push-content [--dry-run] [--yes]
//   --dry-run  dump + compare with the server, change nothing
//   --yes      skip the confirmation prompt
// Config: scripts/push-content.env (see push-content.env.example). Docs: docs/content-push.md
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { connectionOf, findPgBin, readDatabaseUrl, root, timestamp } from './lib/db.mjs';

const dryRun = process.argv.includes('--dry-run');
const assumeYes = process.argv.includes('--yes');

// ---- config ---------------------------------------------------------------
function loadConfig() {
  const file = join(root, 'scripts/push-content.env');
  const fromFile = {};
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (m && !line.trim().startsWith('#')) fromFile[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  const get = (k) => process.env[k] ?? fromFile[k];
  const cfg = {
    ssh: get('DEPLOY_SSH'),
    sshKey: get('DEPLOY_SSH_KEY'),
    appRoot: get('REMOTE_APP_ROOT') || '/var/www/compro',
    webUrl: get('WEB_URL'),
    secret: get('REVALIDATE_SECRET'),
  };
  if (!cfg.ssh) throw new Error('DEPLOY_SSH is not set (scripts/push-content.env), e.g. ubuntu@1.2.3.4');
  return cfg;
}

// ---- process helpers ------------------------------------------------------
function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (res.error) throw new Error(`${cmd}: ${res.error.message}`);
  if (res.status !== 0) {
    throw new Error(`${basename(cmd)} exited with ${res.status}\n${res.stderr ?? ''}${res.stdout ?? ''}`.trim());
  }
  return res.stdout ?? '';
}

/** Runs a bash script on the VPS (script goes over stdin, so no shell-quoting layers). */
function remote(cfg, script, args = []) {
  return run('ssh', [...sshOpts(cfg), cfg.ssh, 'bash', '-s', '--', ...args], { input: script });
}

// BatchMode: fail fast instead of hanging on a password/host-key prompt (nothing can type here).
// accept-new: trust a host on first sight, still refuse if its key later changes.
function sshOpts(cfg) {
  const opts = ['-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=accept-new'];
  if (cfg.sshKey) opts.push('-i', cfg.sshKey, '-o', 'IdentitiesOnly=yes');
  return opts;
}

// Reads DATABASE_URL from the server's API .env, dropping Prisma's ?schema=... suffix for psql.
const REMOTE_PRELUDE = `
set -euo pipefail
APP_ROOT="$1"
URL=$(grep -E '^[[:space:]]*DATABASE_URL[[:space:]]*=' "$APP_ROOT/apps/api/.env" | head -1 \\
  | sed -E "s/^[^=]*=//; s/^[\\"']//; s/[\\"']\\s*$//; s/\\?.*$//")
[ -n "$URL" ] || { echo "DATABASE_URL not found in $APP_ROOT/apps/api/.env" >&2; exit 1; }
mkdir -p "$HOME/backups"
`;

const STATE_QUERY = `select
  (select count(*) from "NavGroup") || ' groups, ' || (select count(*) from "Page") || ' pages, ' ||
  (select count(*) from "Page" where status = 'published') || ' published | last migration: ' ||
  (select coalesce(max(migration_name), '-') from _prisma_migrations where finished_at is not null)`;

function localState(conn) {
  return run(findPgBin('psql'), [...conn.args, '--no-psqlrc', '-Atc', STATE_QUERY], { env: conn.env }).trim();
}

function lastMigration(state) {
  return state.split('last migration: ')[1];
}

// ---- steps ----------------------------------------------------------------
async function confirm(question) {
  if (assumeYes) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`${question} [y/N] `)).trim().toLowerCase();
  rl.close();
  return answer === 'y' || answer === 'yes';
}

function dumpLocal(conn, stamp) {
  const dumpFile = join(root, `backup-content-${stamp}.sql`);
  run(
    findPgBin('pg_dump'),
    [
      ...conn.args,
      '--data-only', '--inserts', '--no-owner', '--no-privileges',
      '--table="NavGroup"', '--table="Page"', // quoted: Prisma tables are case-sensitive
      '--file', dumpFile,
    ],
    { env: conn.env },
  );
  // Wrap the dump into a self-contained restore script. psql runs it with -1 (one
  // transaction): any error rolls everything back. Page.parentId/groupId FKs aren't
  // deferrable and INSERT order may put a child before its parent, so make them
  // deferred for the load and put them back afterwards.
  // The local pg_dump may be newer than the server's Postgres: drop what older servers/psql
  // reject (`SET transaction_timeout` is PG17+; `\restrict` guards are a newer-psql feature).
  const body = readFileSync(dumpFile, 'utf8')
    .split('\n')
    .filter((l) => !/^SET transaction_timeout\b/.test(l) && !/^\\(un)?restrict\b/.test(l))
    .join('\n');
  const script = `-- content push ${stamp}: replaces "NavGroup" and "Page" only
ALTER TABLE public."Page" ALTER CONSTRAINT "Page_parentId_fkey" DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public."Page" ALTER CONSTRAINT "Page_groupId_fkey" DEFERRABLE INITIALLY DEFERRED;
TRUNCATE public."Page", public."NavGroup";
${body}
SET CONSTRAINTS ALL IMMEDIATE;
ALTER TABLE public."Page" ALTER CONSTRAINT "Page_parentId_fkey" NOT DEFERRABLE;
ALTER TABLE public."Page" ALTER CONSTRAINT "Page_groupId_fkey" NOT DEFERRABLE;
`;
  writeFileSync(dumpFile, script);
  return dumpFile;
}

async function revalidate(cfg, tags) {
  if (!cfg.webUrl || !cfg.secret) {
    console.log('WEB_URL / REVALIDATE_SECRET not set: skipping cache revalidation (site refreshes within minutes).');
    return;
  }
  // The endpoint rejects the whole request if any tag is malformed, so send them in chunks
  // and filter to what it accepts.
  const valid = tags.filter((t) => t === 'nav' || /^page:(products|services|solutions)\/[a-z0-9-]+$/.test(t));
  for (let i = 0; i < valid.length; i += 50) {
    const res = await fetch(`${cfg.webUrl.replace(/\/$/, '')}/api/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': cfg.secret },
      body: JSON.stringify({ tags: valid.slice(i, i + 50) }),
    });
    if (!res.ok) throw new Error(`revalidate responded ${res.status}`);
  }
  console.log(`Revalidated ${valid.length} cache tags.`);
}

// ---- main -----------------------------------------------------------------
const cfg = loadConfig();
const conn = connectionOf(readDatabaseUrl());
const stamp = timestamp();

console.log('1/5 Reading local + server state...');
const local = localState(conn);
const server = remote(
  cfg,
  `${REMOTE_PRELUDE}psql "$URL" --no-psqlrc -Atc '${STATE_QUERY.replace(/'/g, `'\\''`)}'`,
  [cfg.appRoot],
).trim();
console.log(`  local : ${local}\n  server: ${server}`);

if (lastMigration(local) !== lastMigration(server)) {
  throw new Error(
    'Schema mismatch: server is on a different migration than local.\n' +
      'Run `prisma migrate deploy` on the server first (then re-run), or migrate local to match.',
  );
}

console.log('2/5 Dumping local content tables...');
const dumpFile = dumpLocal(conn, stamp);
console.log(`  ${dumpFile} (${(statSync(dumpFile).size / 1024).toFixed(1)} KB)`);

if (dryRun) {
  console.log('Dry run: nothing sent or changed.');
  process.exit(0);
}

if (!(await confirm('Replace ALL content pages and nav groups on the server with the local ones?'))) {
  console.log('Aborted.');
  process.exit(1);
}

console.log('3/5 Backing up server content tables...');
const remoteBackup = `$HOME/backups/compro-content-${stamp}.sql`;
remote(
  cfg,
  `${REMOTE_PRELUDE}pg_dump "$URL" --data-only --inserts --no-owner --no-privileges --table='"NavGroup"' --table='"Page"' --file="${remoteBackup}"`,
  [cfg.appRoot],
);
console.log(`  server:${remoteBackup.replace('$HOME', '~')}`);

console.log('4/5 Uploading and restoring (single transaction)...');
const remoteFile = `compro-content-push-${stamp}.sql`;
// cwd + bare filename: scp would read "C:\..." as host:path.
run('scp', ['-q', ...sshOpts(cfg), basename(dumpFile), `${cfg.ssh}:backups/${remoteFile}`], { cwd: root });
remote(
  cfg,
  `${REMOTE_PRELUDE}psql "$URL" --no-psqlrc -q -1 -v ON_ERROR_STOP=1 -f "$HOME/backups/${remoteFile}" >/dev/null`,
  [cfg.appRoot],
);

console.log('5/5 Verifying and refreshing the site cache...');
const after = remote(
  cfg,
  `${REMOTE_PRELUDE}psql "$URL" --no-psqlrc -Atc '${STATE_QUERY.replace(/'/g, `'\\''`)}'`,
  [cfg.appRoot],
).trim();
console.log(`  server now: ${after}`);

const tagLines = remote(
  cfg,
  `${REMOTE_PRELUDE}psql "$URL" --no-psqlrc -Atc "select 'page:' || section || '/' || slug from \\"Page\\" where status = 'published'"`,
  [cfg.appRoot],
);
await revalidate(cfg, ['nav', ...tagLines.split('\n').map((l) => l.trim()).filter(Boolean)]);

console.log(`Done. Rollback file on server: ${remoteBackup.replace('$HOME', '~')}`);
