#!/usr/bin/env bash
# Idempotentes Setup-Skript für Claude Code Web-Sitzungen.
# Wird automatisch via SessionStart-Hook ausgeführt.
#
# HINWEIS: .NET ist in der Claude Code Web-Sandbox nicht verfügbar.
# Alle Microsoft-/dotnet-Download-Quellen (ci.dot.net, dotnetcli.azureedge.net,
# dot.net/v1/dotnet-install.sh) sind auf Netzwerkebene blockiert (403).
# Backend-Build und OpenAPI-Spec-Generierung sind daher hier nicht möglich –
# das übernimmt der CI (GitHub Actions).
# Frontend-TypeScript-Checks und -Builds funktionieren vollständig.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[setup] Starting dev environment setup..."

# npm dependencies installieren (falls node_modules fehlt)
if [ ! -d "$REPO_ROOT/src/frontend/node_modules" ]; then
  echo "[setup] Installing npm dependencies..."
  npm ci --prefix "$REPO_ROOT/src/frontend" --silent
  echo "[setup] npm dependencies installed."
else
  echo "[setup] npm dependencies already installed."
fi

echo "[setup] Dev environment ready. Frontend dependencies are set (tsc + vite build available)."
