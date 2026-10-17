# Pushing content pages to production

`pnpm db:push-content` copies the content-page tables (`NavGroup`, `Page`) from the local
database to the VPS, **replacing** what is there. `HeroImage` and `User` are never touched
(hero rows point at production S3 keys and are managed in the production admin).

## One-time setup
1. `cp scripts/push-content.env.example scripts/push-content.env` and fill it in (gitignored).
2. Key-based SSH to the VPS must work non-interactively; `psql`/`pg_dump` must be on the VPS PATH.
3. The production DB URL is read from `<REMOTE_APP_ROOT>/apps/api/.env` on the server; the DB user
   must own the tables (the script briefly toggles FK deferrability).

## Use
```bash
pnpm db:push-content --dry-run   # compare local vs server, write the dump, change nothing
pnpm db:push-content             # asks for confirmation, then pushes
pnpm db:push-content --yes       # no prompt
```

Steps: read both states -> abort if the last applied Prisma migration differs (run
`prisma migrate deploy` on the server first) -> dump local -> back up the server tables to
`~/backups/compro-content-<stamp>.sql` -> `scp` -> restore with `psql -1` (one transaction, a
failure rolls back) -> verify counts -> POST `/api/revalidate` for `nav` + every published page.

## Rollback
```bash
psql "$URL" -1 -c 'TRUNCATE "Page","NavGroup"' -f ~/backups/compro-content-<stamp>.sql
```
(`$URL` = the server's DATABASE_URL without `?schema=...`. Do the `Page` FK caveat: if the
restore trips on child-before-parent rows, wrap it like the generated push file does.)

## Caveats
- Full replace: edits made directly in the production admin are overwritten. An upsert
  by `section + slug` mode is a possible later addition.
- Images referenced by pages must already exist in the production S3/CDN.
