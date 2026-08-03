#!/usr/bin/env bash
# Runs a turbo task inside WSL, where turbo.exe isn't blocked by the
# Windows Code Integrity policy that blocks it on the Windows side.
# Mirrors this repo into WSL's native filesystem (faster + avoids sharing
# node_modules, whose native binaries differ per-OS) and runs pnpm there.
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$HOME/projects/compro"

mkdir -p "$DEST"
rsync -a --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude '.turbo' \
  --exclude '.git' \
  "$REPO_ROOT/" "$DEST/"

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

cd "$DEST"
pnpm install
pnpm "$@"
