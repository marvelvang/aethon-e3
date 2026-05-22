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
**Vor jeder einzelnen Aufgabe** (= jeder neuen User-Nachricht mit Umsetzungsauftrag),
**auch wenn in derselben Session schon andere Aufgaben erledigt wurden** und auch
wenn nur Minuten seit dem letzten Fetch vergangen sind. Es laufen parallel andere
Entwicklungen auf weiteren Branches, die jederzeit nach main gemergt werden können –
ein Fetch zu Session-Start reicht **nicht**.

Ablauf zu Beginn jeder Aufgabe:
1. `git fetch origin main` ausführen
2. Prüfen ob main ahead ist: `git log HEAD..origin/main --oneline`
3. Wenn ja: `origin/main` in den aktuellen Branch mergen
4. Merge-Konflikte analysieren, lösen – bei Unklarheiten erst rückfragen
5. **Versionskonflikt prüfen**: `APP_VERSION` im eigenen Branch mit `APP_VERSION` aus
   `origin/main` vergleichen (semantischer Vergleich: MAJOR, dann MINOR, dann PATCH).
   - Branch-Version **strikt größer** als main → kein Handlungsbedarf.
   - Branch-Version **gleich oder kleiner** als main → `APP_VERSION` auf
     `<main-MAJOR>.<main-MINOR>.<main-PATCH + 1>` setzen, committen und pushen –
     **ohne** den User zu fragen (technisches Korrektheitsproblem, keine inhaltliche
     Entscheidung). Beispiele: Branch `0.0.17`, main `0.1.0` → `0.1.1` setzen;
     Branch `0.0.16`, main `0.0.16` → `0.0.17` setzen.
6. Erst dann mit der eigentlichen Aufgabe beginnen

**Kurzbefehl „main":** Schreibt der User nur das Wort `main` (allein in einer Nachricht),
bedeutet das: sofort Regel 3 vollständig ausführen (fetch → merge → Konflikte lösen →
push) – ohne weitere Aufgabe danach. Kein Versionssprung fragen, sofern der User nicht
zusätzlich etwas anfordert.

Ausnahme: rein konversationale Nachrichten ohne Code-Änderung (Fragen, Beratung,
Workflow-Diskussion) brauchen keinen Fetch – nur Aufgaben, die in einem
Commit/Push münden sollen.

### 4. Versionsnummer inkrementieren (nur auf Nachfrage am Aufgabenende)
Die Versionsnummer in `src/frontend/src/components/VersionDisplay.tsx`
(Konstante `APP_VERSION`) **nicht automatisch** erhöhen. Stattdessen am
Ende jeder abgeschlossenen Aufgabe per `AskUserQuestion` fragen:

- "Soll ich `APP_VERSION` erhöhen?" – Optionen: **Nein** (Default) /
  **Patch** (Fix, kleine Änderung) / **Minor** (neue Funktionalität).
- **Major** niemals als Option anbieten – nur wenn der User es explizit
  von sich aus nennt.

Wenn der User Patch oder Minor wählt:
1. `origin/main` frisch fetchen, falls noch nicht in dieser Aufgabe geschehen
2. `APP_VERSION` in `VersionDisplay.tsx` lesen, mit `APP_VERSION` aus
   `origin/main` vergleichen
3. Als Basis die **höhere** der beiden Versionen nehmen (eigene Version
   muss immer strikt größer sein als main)
4. Patch erhöht die letzte Stelle, Minor setzt Patch auf 0 und erhöht
   die mittlere Stelle
5. Geänderte Datei als eigenen Commit (oder als Teil eines noch nicht
   gepushten Commits) einchecken und pushen

Regel für semantische Versionierung (`MAJOR.MINOR.PATCH`):
- **Patch** (`0.0.x`): Jede Korrektur oder Verbesserung ohne neue Funktion –
  egal ob visuell (Farben, Layout, Abstände), Logik, Performance, Text oder sonstiges.
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
2. `git add` der geänderten Dateien
3. `git commit` mit aussagekräftiger Message
4. `git push -u origin <branch>`
5. Per `AskUserQuestion` fragen, ob `APP_VERSION` erhöht werden soll
   (siehe Regel 4). Falls ja: Bump als eigener Commit + push.
