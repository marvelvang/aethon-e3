#!/usr/bin/env bash
# Idempotentes Setup-Skript für Claude Code Web-Sitzungen.
# Wird automatisch via SessionStart-Hook ausgeführt.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[setup] Starting dev environment setup..."

# 1. .NET 10 SDK installieren (falls nicht vorhanden)
if ! command -v dotnet &>/dev/null || [[ "$(dotnet --version 2>/dev/null | cut -d. -f1)" -lt 10 ]]; then
  echo "[setup] .NET 10 SDK not found – installing..."
  curl -fsSL https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 10.0 --install-dir "$HOME/.dotnet"
  export PATH="$HOME/.dotnet:$PATH"
  # Pfad persistent in .bashrc eintragen (falls noch nicht vorhanden)
  if ! grep -q 'HOME/.dotnet' ~/.bashrc 2>/dev/null; then
    echo 'export PATH="$HOME/.dotnet:$PATH"' >> ~/.bashrc
  fi
  echo "[setup] .NET $(dotnet --version) installed."
else
  export PATH="$HOME/.dotnet:$PATH"
  echo "[setup] .NET $(dotnet --version) already available."
fi

# 2. npm dependencies installieren (falls node_modules fehlt)
if [ ! -d "$REPO_ROOT/src/frontend/node_modules" ]; then
  echo "[setup] Installing npm dependencies..."
  npm ci --prefix "$REPO_ROOT/src/frontend" --silent
  echo "[setup] npm dependencies installed."
else
  echo "[setup] npm dependencies already installed."
fi

# 3. Backend bauen → erzeugt aethon-e3.api.json (OpenAPI-Spec)
echo "[setup] Building backend (generates OpenAPI spec)..."
dotnet build "$REPO_ROOT/src/backend/aethon-e3.api/aethon-e3.api.csproj" \
  -c Release --nologo -v q
echo "[setup] Backend build complete."

# 4. TypeScript-Typen aus OpenAPI-Spec generieren
echo "[setup] Generating TypeScript types from OpenAPI spec..."
npm run generate --prefix "$REPO_ROOT/src/frontend" --silent
echo "[setup] TypeScript types generated."

echo "[setup] Dev environment ready. Backend, frontend types and dependencies are all set."
