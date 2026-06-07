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
cd /home/user/aethon-e3 && bun --filter @aethon/frontend build
```

Erst danach committen und pushen.

### 3. main-Branch synchron halten
**Vor jeder Aufgabe** – als allererste Aktion, noch vor dem ersten Datei-Lesen, vor
jeder Suche, vor jedem sonstigen Tool-Call. Es laufen parallel andere Entwicklungen auf
weiteren Branches, die jederzeit nach main gemergt werden können.

**Wann der Fetch entfällt** – nur in diesen drei Fällen:
- **Session-Start:** Claude Code Web legt für jede neue Session automatisch einen
  frischen Branch von main an. Die allererste Aufgabe einer Session braucht daher
  keinen Fetch.
- **Soeben selbst gemergt:** Wenn ich main im unmittelbar vorherigen Schritt dieser
  Session bereits gefetcht und gemergt habe (z.B. nach einem „main"-Kurzbefehl oder
  am Anfang der aktuellen Aufgabe), ist ein erneuter Fetch überflüssig. Im Zweifel
  immer fetchen.
- **Reine Frage oder Beratung:** Nachrichten, die **ausschließlich** eine Frage oder
  Beratung sind und **keinerlei** Änderungs-, Ergänzungs- oder Umsetzungsanteil
  enthalten. Im Zweifel – also wenn auch nur ein Teil der Nachricht eine Änderung
  impliziert – immer fetchen. „Finde X und ergänze Y" ist ein Umsetzungsauftrag,
  auch wenn er mit Recherche beginnt.

Ablauf zu Beginn jeder Aufgabe (sofern Fetch nicht entfällt):
1. `git fetch origin main` ausführen – **das ist der erste Tool-Call**
2. Prüfen ob main ahead ist: `git log HEAD..origin/main --oneline`
3. Wenn ja: `origin/main` in den aktuellen Branch mergen
4. Merge-Konflikte analysieren, lösen – bei Unklarheiten erst rückfragen
5. **Versionskonflikt prüfen**: Zuerst beide Versionen per grep lesen –
   **Pflicht, niemals aus dem Gedächtnis:**
   ```bash
   grep "APP_VERSION" src/frontend/app/src/components/VersionDisplay.tsx
   grep "APP_VERSION" src/backend/app/src/version.ts
   ```
   Dann mit den Werten aus `origin/main` vergleichen (Dateipfade siehe Regel 4).
   Beide Versionen müssen **immer identisch** sein. Maßgeblich ist die höchste der
   vier verglichenen Werte (je Branch und main für Frontend und Backend):
   - Höchste der vier Versionen **strikt größer** als alle main-Versionen → kein Handlungsbedarf.
   - Andernfalls → **sofort** per `AskUserQuestion` fragen, ob Patch oder Minor
     (Mindest-Zielversion nennen, Option „Nein" entfällt).
     Beispiele: Branch `0.0.17`, main `0.1.0` → Minimum `0.1.1`;
     Branch `0.0.16`, main `0.0.16` → Minimum `0.0.17`.
     Nach der Antwort: beide Dateien setzen, Frontend-Build, Commit, Push.
     **Hinweis:** Hat dieser Schritt einen Bump ausgelöst, ist Branch strikt > main –
     Regel 4 am Aufgabenende entfällt dann automatisch.
6. Erst dann mit der eigentlichen Aufgabe beginnen

**Kurzbefehl „main":** Schreibt der User nur das Wort `main` (allein in einer Nachricht),
bedeutet das: sofort Regel 3 vollständig ausführen (fetch → merge → Konflikte lösen →
Versionskonflikt per Pflicht-grep prüfen und ggf. sofort beheben → push) – ohne weitere
Aufgabe danach.

### 4. Versionsnummern inkrementieren (am Aufgabenende aktiv fragen)
Frontend- und Backend-Version werden **immer im Gleichtakt** auf dieselbe Versionsnummer
gesetzt. Die maßgeblichen Stellen:
- Frontend: `APP_VERSION` in `src/frontend/app/src/components/VersionDisplay.tsx`
- Backend: `APP_VERSION` in `src/backend/app/src/version.ts`

**Nie eigenständig** erhöhen – immer per `AskUserQuestion` fragen. Claude stellt die
Frage proaktiv am Aufgabenende; die Entscheidung Patch oder Minor liegt ausnahmslos
beim User.

**Am Ende einer Aufgabe die Versionsfrage stellen – aber nur wenn nötig:**
Pro Branch reicht ein einziges Increment über main hinaus.

**PFLICHT – immer zuerst ausführen, kein Überspringen:**
```bash
grep "APP_VERSION" src/frontend/app/src/components/VersionDisplay.tsx
```
Diesen Tool-Call **immer** ausführen – auch wenn die Version „bekannt" zu sein scheint.
Den Ausgabewert direkt in den Fragetext übernehmen. Die Version im Fragetext **muss**
aus diesem Tool-Call stammen – **niemals** aus dem Gedächtnis oder aus früheren
Nachrichten im Chat. Kein `AskUserQuestion` zur Version ohne diesen grep davor.

Dann Branch-Version mit `origin/main` vergleichen:
- Branch-Version **strikt größer** als main → **Frage entfällt**, kein weiteres Increment nötig.
- Branch-Version **gleich** main → Frage stellen mit Optionen **Patch** / **Minor**
  (Option „Nein" entfällt, da Increment technisch notwendig ist; Mindest-Zielversion nennen).
- **Major** niemals als Option anbieten – nur wenn der User es explizit von sich aus nennt.

Wenn der User Patch oder Minor wählt:
1. `origin/main` frisch fetchen, falls noch nicht in dieser Aufgabe geschehen
2. Alle vier Versionen lesen: Frontend und Backend jeweils im eigenen Branch und in
   `origin/main`
3. Als Basis die **höchste** der vier Versionen nehmen (eigene Versionen
   müssen immer strikt größer als alle main-Versionen sein)
4. Patch erhöht die letzte Stelle, Minor setzt Patch auf 0 und erhöht
   die mittlere Stelle
5. **Beide** Dateien auf die neue Version setzen und gemeinsam als eigenen
   Commit einchecken und pushen

Regel für semantische Versionierung (`MAJOR.MINOR.PATCH`):
- **Patch** (`0.0.x`): Jede Korrektur oder Verbesserung ohne neue Funktion –
  egal ob visuell (Farben, Layout, Abstände), Logik, Performance, Text oder sonstiges.
- **Minor** (`0.x.0`): Ausschließlich bei echter neuer Funktionalität, die aus
  Nutzersicht vorher nicht existiert hat. Patch-Teil auf 0 zurücksetzen.
- **Major** (`x.0.0`): **Nur nach expliziter Absprache mit dem User**, niemals
  eigenständig hochzählen.

### 5. Cloudflare Pages Preview-URL nach jedem Push ausgeben
Das Frontend wird automatisch auf Cloudflare Pages deployed. Projekt: **`aethon-e3`**

- Produktion (main): `https://aethon-e3.pages.dev`
- Branch-Preview: `https://<sanitized-branch>.aethon-e3.pages.dev`

**Sanitierung des Branch-Namens für die URL:**
1. Alles Kleinschreiben
2. Jeden Zeichen, der nicht `[a-z0-9]` ist (also auch `/`, `.`, `_`), durch `-` ersetzen
3. Mehrfache aufeinanderfolgende `-` zu einem `-` zusammenfassen
4. Führende und abschließende `-` entfernen

Beispiel: `claude/mobile-dev-workflow-YUkAt` → `claude-mobile-dev-workflow-yukat`
→ `https://claude-mobile-dev-workflow-yukat.aethon-e3.pages.dev`

**Pflicht nach jedem Push:** Die fertige Preview-URL als klickbaren Markdown-Link ausgeben:
```
Preview: [https://claude-mobile-dev-workflow-yukat.aethon-e3.pages.dev](https://claude-mobile-dev-workflow-yukat.aethon-e3.pages.dev)
```
Der Deploy dauert ca. 1–2 Minuten – die URL ist kurz danach aktiv.

## Umgebungs-Setup (SessionStart-Hook)

Bei jeder neuen Claude Code Web-Sitzung läuft automatisch `.claude/settings.json` →
`scripts/dev-setup.sh`. Das Skript führt idempotent `bun install` auf Workspace-Root
aus (falls `node_modules` fehlt).

**Manuell ausführen** (z.B. nach Checkout in neuer Shell):
```bash
bash scripts/dev-setup.sh
```

Nach dem Setup kann Claude `bun run`-Skripte und `bun --filter`-Befehle nutzen und
Fehler lokal erkennen, bevor sie im CI landen.

## Projekt-Überblick

Monorepo (Bun-Workspaces), reine TypeScript-Codebase. Aller Quellcode liegt unter `src/`,
aufgeteilt in drei disjunkte Bereiche mit strikter Dependency-Richtung
`shared ← frontend, backend`:

```
src/
  shared/    pakete, die von beiden Seiten benutzt werden
    models/        Domain-Types (GameState, Building, UiState, Enums)
    engine/        Reine Game-Logik (genesis, build, round, projection)
    api-contract/  Zod-Schemas für API-Wire-Format

  frontend/  alles, was im Browser läuft
    app/           React + Vite + Pixi.js
    api-client/    Type-safe Hono-RPC-Client (`hc<AppType>`, type-only Backend-Import)
    Dockerfile     Build- + Serve-Setup für Railway
    railway.toml   Railway-Service-Config

  backend/   alles, was nur serverseitig läuft
    app/           Hono-App + Bun-Entry-Point
    persistence/   Drizzle-Schema + Repository (Postgres / Neon)

docs/        Design-Dokumente
scripts/     Helfer (dev-setup, asset-rendering)
```

| Paket | Rolle | Abhängigkeiten |
|---|---|---|
| `@aethon/models`      | Domain-Types                                                | – |
| `@aethon/engine`      | Game-Logik                                                  | models |
| `@aethon/api-contract`| Wire-Format-Schemas                                         | models |
| `@aethon/frontend`    | React-SPA                                                   | models, engine, api-client |
| `@aethon/api-client`  | RPC-Client                                                  | api-contract (+ type-only backend) |
| `@aethon/backend`     | Hono-Server                                                 | engine, api-contract, persistence |
| `@aethon/persistence` | DB-Zugriff                                                  | models |

**Single-Player-Lokal-Modus:** Frontend importiert `engine` direkt und hält den GameState
in `localStorage`. Backend & DB werden nicht angesprochen.

**MP-Modus (Vorbereitung, noch nicht aktiv):** dieselbe Engine läuft serverseitig im
`backend/app`-Paket. Frontend ruft sie via `api-client` → Hono-RPC auf.

Frontend↔Backend werden **nicht** über OpenAPI verbunden. Typsicherheit kommt direkt aus
den Workspace-Paketen (Models, api-client mit Hono-RPC-Inferenz via type-only Import).

## Build & Setup

```bash
# Installation (Workspace-Root)
bun install

# Frontend-Build
bun --filter @aethon/frontend build

# Frontend-Dev-Server
bun --filter @aethon/frontend dev

# Backend-Dev-Server (braucht DATABASE_URL)
DATABASE_URL=... bun --filter @aethon/backend dev

# Engine-Tests
bun test --filter @aethon/engine
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
5. **Erst** `grep "APP_VERSION" src/frontend/app/src/components/VersionDisplay.tsx`
   ausführen, Branch-Version mit `origin/main` vergleichen – **dann** nur bei
   Branch = main per `AskUserQuestion` fragen (siehe Regel 4 – Pflichtgrep).
   Falls ja: Frontend `APP_VERSION` + Backend `APP_VERSION` gemeinsam als eigener
   Commit + push.
