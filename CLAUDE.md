# CLAUDE.md – aethon-e3

## Workflow-Regeln (immer einhalten)

### 1. Erst planen, dann umsetzen (bei nicht-trivialen Änderungen)
Unabhängig davon ob der Code- oder Plan-Modus aktiv ist: Bei allen nicht-trivialen
Änderungen (alles außer offensichtliche Tippfehler oder single-line renames) erst
einen Plan erstellen und explizit Zustimmung einholen. Niemals direkt mit der
Umsetzung beginnen ohne Bestätigung.

### 2. main-Branch synchron halten
Vor Beginn jeder Aufgabe:
1. `git fetch origin main` ausführen
2. Prüfen ob main ahead ist: `git log HEAD..origin/main --oneline`
3. Wenn ja: `origin/main` in den aktuellen Branch mergen
4. Merge-Konflikte analysieren, lösen – bei Unklarheiten erst rückfragen
5. Erst dann mit der eigentlichen Aufgabe beginnen

## Umgebungs-Setup (SessionStart-Hook)

Bei jeder neuen Claude Code Web-Sitzung läuft automatisch `.claude/settings.json` →
`scripts/dev-setup.sh`. Das Skript installiert idempotent:
1. .NET 10 SDK (via `dotnet-install.sh`, falls fehlt)
2. npm dependencies in `src/frontend` (via `npm ci`, falls `node_modules` fehlt)
3. Backend-Build → erzeugt `aethon-e3.api.json` (OpenAPI-Spec)
4. TypeScript-Typen aus der Spec → `src/frontend/src/api/generated.ts`

**Manuell ausführen** (z.B. nach Checkout in neuer Shell):
```bash
bash scripts/dev-setup.sh
```

Nach dem Setup kann Claude direkt `dotnet build`, `tsc` und `npm run build`
aufrufen und Fehler lokal erkennen, bevor sie im CI landen.

## Projekt-Überblick

Monorepo: C#/.NET 10 Backend + React 18 / TypeScript / Vite Frontend.
Pixi.js (WebGL) für das Rendering. OpenAPI-Spec wird beim Backend-Build auto-generiert,
daraus werden TypeScript-Typen für das Frontend erzeugt.

## Build & Setup

```bash
# Alles: Backend bauen + TS-Typen generieren + Frontend bauen
cd src/frontend && npm run setup

# Nur Backend
dotnet build src/backend/aethon-e3.api/aethon-e3.api.csproj

# Frontend-Dev-Server
cd src/frontend && npm run dev

# TS-Typen aus OpenAPI-Spec regenerieren
cd src/frontend && npm run generate
```

## Git

- Main-Branch: `main`
- Feature-Branches: `claude/<beschreibung>` oder ähnlich
- Niemals direkt auf `main` pushen
