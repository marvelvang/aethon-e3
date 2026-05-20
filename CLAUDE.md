# CLAUDE.md – aethon-e3

## Workflow-Regeln (immer einhalten)

### 1. Erst planen, dann umsetzen
Vor jeder Implementierung einen Plan erstellen und explizit auf Bestätigung warten.
Erst nach Bestätigung mit der Umsetzung beginnen.

**Wann Plan erforderlich:** Immer – außer bei exakt einem der folgenden Fälle:
- Korrektur eines einzelnen Tippfehlers (1 Wort, eindeutig falsch)
- Single-line rename einer Variablen/Funktion ohne Logikänderung

**Was NICHT als Planfreigabe zählt:**
- Der Nutzer sagt „bau X" oder „implementiere Y"
- Der Nutzer schickt einen Connection-String, eine URL oder Konfigurationswerte mit
- Der Nutzer beschreibt das gewünschte Ergebnis noch so detailliert

→ In allen diesen Fällen: erst Plan zeigen, warten, dann umsetzen.

### 2. Frontend-Build bei Aufgabenabschluss
Nach jeder Aufgabe, die Frontend-Code verändert hat, einen vollständigen Frontend-Build
ausführen und sicherstellen, dass er fehlerfrei durchläuft:

```bash
cd /home/user/aethon-e3/src/frontend && npm run build
```

Erst danach committen und pushen.

### 3. main-Branch synchron halten
Vor Beginn jeder Aufgabe:
1. `git fetch origin main` ausführen
2. Prüfen ob main ahead ist: `git log HEAD..origin/main --oneline`
3. Wenn ja: `origin/main` in den aktuellen Branch mergen
4. Merge-Konflikte analysieren, lösen – bei Unklarheiten erst rückfragen
5. Erst dann mit der eigentlichen Aufgabe beginnen

### 4. Versionsnummer inkrementieren (letzter Commit jeder Aufgabe)
Am Ende jeder Aufgabe die Versionsnummer in
`src/frontend/src/components/VersionDisplay.tsx` (Konstante `APP_VERSION`)
als letzten Commit oder als Teil des letzten Commits aktualisieren.

Regel für semantische Versionierung (`MAJOR.MINOR.PATCH`):
- **Patch** (`0.0.x`): Bugfix oder Hotfix – bei jeder Fehlerkorrektur ohne neue Funktion
- **Minor** (`0.x.0`): Neues Feature / sichtbare Funktionserweiterung – Patch-Teil auf 0 zurücksetzen
- **Major** (`x.0.0`): Breaking Change oder grundlegende Umstrukturierung –
  **nur nach expliziter Absprache mit dem User**, niemals eigenständig hochzählen

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

### Committen und Pushen nach Implementierung
Nach Abschluss jeder Implementierungsaufgabe direkt committen und pushen –
**ohne vorher den Nutzer zu fragen**. Das ist ausdrücklich erwünscht.

Reihenfolge am Aufgabenende:
1. Frontend-Build (falls Frontend-Code geändert, siehe Regel 2)
2. Versionsnummer inkrementieren (siehe Regel 4)
3. `git add` der geänderten Dateien
4. `git commit` mit aussagekräftiger Message
5. `git push -u origin <branch>`
