#!/usr/bin/env bash
# Idempotentes Setup-Skript für Claude Code Web-Sitzungen.
# Wird automatisch via SessionStart-Hook ausgeführt.
#
# HINWEIS: .NET ist in der Claude Code Web-Sandbox nicht verfügbar.
# Alle Microsoft-/dotnet-Download-Quellen (ci.dot.net, dotnetcli.azureedge.net,
# dot.net/v1/dotnet-install.sh) sind auf Netzwerkebene blockiert (403).
# Der CI (GitHub Actions) übernimmt Backend-Build und OpenAPI-Spec-Generierung
# und committed aethon-e3.api.json zurück in den Branch.
# Frontend-TypeScript-Checks und -Builds funktionieren vollständig.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPEC_FILE="$REPO_ROOT/src/backend/aethon-e3.api/aethon-e3.api.json"

echo "[setup] Starting dev environment setup..."

# 1. npm dependencies installieren (falls node_modules fehlt)
if [ ! -d "$REPO_ROOT/src/frontend/node_modules" ]; then
  echo "[setup] Installing npm dependencies..."
  npm ci --prefix "$REPO_ROOT/src/frontend" --silent
  echo "[setup] npm dependencies installed."
else
  echo "[setup] npm dependencies already installed."
fi

# 2. TypeScript-Typen generieren (nur wenn OpenAPI-Spec vorhanden)
if [ -f "$SPEC_FILE" ]; then
  echo "[setup] Generating TypeScript types from OpenAPI spec..."
  npm run generate --prefix "$REPO_ROOT/src/frontend" --silent
  echo "[setup] TypeScript types generated."
else
  echo "[setup] WARNING: OpenAPI spec not found ($SPEC_FILE)."
  echo "[setup]   Push your backend changes – CI will build and commit the spec automatically."
  echo "[setup]   TypeScript types cannot be generated until then."
fi

echo "[setup] Dev environment ready."
