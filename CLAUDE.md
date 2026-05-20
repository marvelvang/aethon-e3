# CLAUDE.md – aethon-e3

## Workflow-Regeln (immer einhalten)

### 1. Direkt implementieren – Plan nur bei echtem Bedarf
Standardmäßig direkt implementieren, kurz erklären, Diff spricht für sich.

**Plan erforderlich (erst zeigen, auf Bestätigung warten) nur wenn:**
- Architekturentscheidung mit mehreren validen Wegen, die der User mitentscheiden soll
- Änderung ist schwer umkehrbar (DB-Schema, API-Verträge, großer Refactor)
- Explizite Unsicherheit: Anforderung unklar oder meine Interpretation könnte abweichen

In allen anderen Fällen: direkt implementieren.

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
5. **Nach dem Merge**: `APP_VERSION` in `VersionDisplay.tsx` lesen und als neue Basis
   für das Versionsinkrement dieser Aufgabe verwenden (siehe Regel 4)
6. Erst dann mit der eigentlichen Aufgabe beginnen

### 4. Versionsnummer inkrementieren (letzter Commit jeder Aufgabe)
Am Ende jeder Aufgabe die Versionsnummer in
`src/frontend/src/components/VersionDisplay.tsx` (Konstante `APP_VERSION`)
als letzten Commit oder als Teil des letzten Commits aktualisieren.

**Wichtig – Basis der Versionsnummer:**  
Die korrekte Ausgangsbasis ist immer die Version, die nach dem letzten `origin/main`-Merge
in `VersionDisplay.tsx` steht. Wurde main erst nach dem eigenen Versionsinkrement gemergt
(oder hat main inzwischen denselben oder einen höheren Stand), muss die Versionsnummer
erneut angepasst werden, bevor committet wird. Die eigene Version muss immer **strikt
größer** sein als die aktuelle main-Version.

Regel für semantische Versionierung (`MAJOR.MINOR.PATCH`):
- **Patch** (`0.0.x`): Jede Korrektur oder Verbesserung ohne neue Funktion –
  egal ob visuell (Farben, Layout, Abstände), Logik, Performance, Text oder sonstiges.
  Immer nur die letzte Stelle erhöhen.
- **Minor** (`0.x.0`): Ausschließlich bei echter neuer Funktionalität, die aus
  Nutzersicht vorher nicht existiert hat. Patch-Teil auf 0 zurücksetzen.
- **Major** (`x.0.0`): **Nur nach expliziter Absprache mit dem User**, niemals
  eigenständig hochzählen.

## Umgebungs-Setup (SessionStart-Hook)

Bei jeder neuen Claude Code Web-Sitzung läuft automatisch `.claude/settings.json` →
`scripts/dev-setup.sh`. Das Skript führt idempotent aus:
1. npm dependencies in `src/frontend` installieren (via `npm ci`, falls `node_modules` fehlt)
2. TypeScript-Typen generieren (via `npm run generate`, falls `aethon-e3.api.json` vorhanden)

**Hinweis:** .NET ist in der Claude Code Web-Sandbox nicht verfügbar. Backend-Build und
OpenAPI-Spec-Generierung übernimmt der CI-Workflow (GitHub Actions), der die Spec
automatisch in den Branch zurück-committed.

**Manuell ausführen** (z.B. nach Checkout in neuer Shell):
```bash
bash scripts/dev-setup.sh
```

Nach dem Setup kann Claude direkt `tsc` und `npm run build` aufrufen und Fehler
lokal erkennen, bevor sie im CI landen.

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
