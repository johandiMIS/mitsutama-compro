# GitHub Actions — Deploy

Reference notes for a push-to-deploy GitHub Actions workflow: on every push to `main`, it SSHes
into the VPS, pulls the new code, rebuilds, and restarts the app under PM2. Written to be reused
across projects — replace the placeholders below with the real values for the app being deployed.
Assumes the one-time VPS setup in [`deployment.md`](./deployment.md) (PM2 process names, ports,
nginx) is already done; this workflow only handles ongoing deploys after that.

**Placeholders used throughout** (same meanings as `deployment.md`, reuse the same values):

| Placeholder | Meaning                             | Example (this repo) |
| ------------ | ------------------------------------ | --------------------- |
| `<app>`       | Short app/client slug, matches the pm2 process names from `deployment.md` §1 | `compro`          |
| `<app-root>`  | Repo path on the server              | `/var/www/compro`     |

## 1. How the workflow works

- **Trigger**: push to `main`, plus `workflow_dispatch` for a manual re-run from the Actions tab.
- **Concurrency**: `group: deploy-production` with `cancel-in-progress: false` — if a deploy is
  already running when a new push lands, the new run queues behind it instead of cancelling it
  mid-`git reset`/`pm2 restart`, which could leave the VPS in a half-updated state.
- **Deploy step**: [`appleboy/ssh-action`](https://github.com/appleboy/ssh-action) opens an SSH
  session to the VPS and runs a plain shell script there — `git reset --hard` to the latest
  `main`, reinstall, rebuild, then `pm2 restart` the already-running processes.

## 2. Required GitHub secrets

The workflow authenticates over SSH using a dedicated deploy key, not your personal key.

1. Generate a key pair (don't password-protect it — GitHub Actions can't answer a passphrase
   prompt):
   ```bash
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N ""
   ```
2. Append `deploy_key.pub` to `~/.ssh/authorized_keys` for the deploy user on the VPS.
3. In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**,
   add:
   - `SSH_HOST` — the VPS's IP or hostname
   - `SSH_USER` — the deploy user (e.g. `ubuntu`)
   - `SSH_KEY` — the contents of `deploy_key` (the *private* key)
   - `SSH_PORT` — only needed if SSH isn't on port 22 (the workflow defaults to `22`)
4. Delete the local `deploy_key`/`deploy_key.pub` files once both halves are stored — don't
   commit them.

## 3. The workflow file

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: SSH deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host:     ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key:      ${{ secrets.SSH_KEY }}
          port:     ${{ secrets.SSH_PORT || 22 }}
          script_stop: true
          script: |
            set -euo pipefail
            export PATH="$HOME/.local/share/pnpm:$HOME/.npm-global/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
            cd <app-root>
            git fetch --all --prune
            git reset --hard origin/main
            pnpm install --frozen-lockfile
            pnpm build
            pm2 restart <app>-api <app>-web --update-env
            pm2 save
```

Notes:

- `pnpm build` here runs on the VPS (Linux), so it's the plain turbo pipeline — the Windows/WDAC
  `pnpm build:wsl` workaround noted in the repo's `CLAUDE.md` is a local-dev-machine issue only
  and doesn't apply on the runner or the VPS.
- The exported `PATH` is a guess at where `pnpm`/`pm2`/`node` live for a non-login SSH shell —
  verify with `which pnpm pm2 node` (as `${{ secrets.SSH_USER }}`, over SSH) rather than assuming;
  corepack-managed pnpm typically lands under `~/.local/share/pnpm`, nvm-managed installs under
  `~/.nvm/versions/node/<version>/bin`.
- `pm2 restart <app>-api <app>-web` targets the exact process names created in `deployment.md`
  §1.2 (`pm2 start ... --name <app>-api`) — restart will fail with "process not found" if those
  names don't match or the processes were never started once by hand first.
- `--update-env` makes pm2 re-read environment changes (e.g. a `.env` edit from `deployment.md`
  §2) on restart instead of keeping the environment captured at the original `pm2 start`.
- `git reset --hard` discards any uncommitted changes on the VPS checkout — the VPS checkout
  should only ever be written to by this workflow, never edited by hand.

## 4. How to use this guide with an AI assistant

Ask an AI assistant (Claude Code or similar, with this file in context) to do the substitution:

> Read `docs/github-actions.md`. Ask me for `<app>` and `<app-root>` (or read them from
> `deployment.md` if I've already filled that in for this deploy). Then write
> `.github/workflows/deploy.yml` with those placeholders substituted into the template in
> section 3, unchanged otherwise.

The assistant can only generate the workflow file — it cannot create the SSH key pair or add
repository secrets on your behalf (secret values shouldn't pass through an AI conversation
anyway). Do section 2 yourself, once per repo/VPS pair.
