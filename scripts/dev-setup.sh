#!/usr/bin/env bash
# Idempotentes Setup-Skript für Claude Code Web-Sitzungen.
# Wird automatisch via SessionStart-Hook ausgeführt.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[setup] Starting dev environment setup..."

if ! command -v bun >/dev/null 2>&1; then
  echo "[setup] WARNING: bun is not on PATH – skipping install."
  exit 0
fi

if [ ! -d "$REPO_ROOT/node_modules" ] \
  || [ ! -d "$REPO_ROOT/src/frontend/node_modules" ]; then
  echo "[setup] Installing workspace dependencies via bun..."
  (cd "$REPO_ROOT" && bun install --silent)
  echo "[setup] Dependencies installed."
else
  echo "[setup] Dependencies already installed."
fi

echo "[setup] Dev environment ready."
