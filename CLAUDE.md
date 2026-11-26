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
5. **Versionscheck** gemäß Regel 4 ausführen. Hat dieser Schritt einen Bump ausgelöst,
   ist Branch strikt > main – der Versionscheck am Aufgabenende entfällt automatisch.
6. Erst dann mit der eigentlichen Aufgabe beginnen

**Kurzbefehl „main":** Schreibt der User nur das Wort `main` (allein in einer Nachricht),
bedeutet das: sofort Regel 3 vollständig ausführen (fetch → merge → Konflikte lösen →
Versionskonflikt per Pflicht-grep prüfen und ggf. sofort beheben → push) – ohne weitere
Aufgabe danach.

**Kurzbefehl „fbuild":** Schreibt der User nur das Wort `fbuild` (allein in einer Nachricht),
bedeutet das: sofort einen vollständigen Frontend-Build ausführen (`bun --filter @aethon/frontend build`),
alle Fehler analysieren und beheben, erneut bauen bis der Build fehlerfrei durchläuft,
dann committen und pushen. Falls für den aktuellen Branch ein offener PR existiert, zusätzlich
die CI-Fehler dort auslesen (via `gh api`), analysieren und ebenfalls beheben –
alles in einem Durchgang, ohne weitere Aufgabe danach.

**Kurzbefehl „zbild":** Schreibt der User `zbild` gefolgt von einem Hinweis, welches Bild
er sehen möchte (z.B. `zbild industry_t2` oder `zbild housing alt`), das passende SVG aus
`src/frontend/app/src/assets/buildings/` ermitteln, mit cairosvg in ein PNG konvertieren
(scale=2) und direkt per `SendUserFile` in den Chat schicken. Kein Download-Link, sondern
die PNG-Datei selbst. Ablauf:
```bash
python3 -c "import cairosvg; cairosvg.svg2png(url='<pfad>.svg', write_to='/tmp/zbild.png', scale=2)"
```
Dann `SendUserFile(["/tmp/zbild.png"])`. Mehrere Bilder gleichzeitig sind möglich.

### 4. Versionsverwaltung

**Versionsdateien** – beide immer im Gleichtakt auf dieselbe Nummer setzen:
- `src/frontend/app/src/version.ts`
- `src/backend/app/src/version.ts`

**Nur bei funktionalen Codeänderungen** (SemVer: Major/Minor/Patch). Reine Doku-/Konzeptänderungen ändern die Version nie und lösen keinen Versionscheck aus.

**Invariante:** Branch-Version muss immer **strikt größer** als die Version in `origin/main` sein.

**Wann prüfen:** nach dem Mergen von main (Schritt 5 in Regel 3) und nach commit + push am Aufgabenende. Pro Branch reicht ein einziges Increment über main hinaus – ist die Branch-Version bereits größer, entfällt die Prüfung am Aufgabenende.

**Prüfablauf – Pflicht, niemals aus dem Gedächtnis:**
```bash
grep "APP_VERSION" src/frontend/app/src/version.ts
grep "APP_VERSION" src/backend/app/src/version.ts
```
- Branch **strikt größer** als main → kein Handlungsbedarf.
- Branch **gleich** main → sofort per `AskUserQuestion` fragen: **Patch** oder **Minor**?
  Option „Nein" entfällt. Mindest-Zielversion im Fragetext nennen
  (Beispiele: Branch `0.0.16`, main `0.0.16` → Minimum `0.0.17`;
  Branch `0.0.17`, main `0.1.0` → Minimum `0.1.1`).

**Nie eigenständig** erhöhen – Entscheidung liegt ausnahmslos beim User.
Den grep-Ausgabewert direkt in den Fragetext übernehmen – **niemals** aus dem Gedächtnis.

**Bei Patch/Minor-Wahl:**
1. `origin/main` fetchen (falls noch nicht in dieser Aufgabe geschehen)
2. Alle vier Versionen lesen (Frontend + Backend je Branch und main)
3. Höchste der vier als Basis nehmen; Patch = letzte Stelle +1, Minor = mittlere +1 und Patch → 0
4. Beide Dateien setzen, Frontend-Build, gemeinsam committen und pushen

**Semantische Versionierung:**
- **Patch** (`0.0.x`): Korrekturen und Verbesserungen ohne neue Funktion (visuell, Logik, Text…)
- **Minor** (`0.x.0`): Echte neue Nutzerfunktionalität; Patch-Teil → 0
- **Major** (`x.0.0`): Nur nach expliziter Absprache mit dem User, niemals eigenständig

### 5. Cloudflare Pages Preview-URL und Build-Nummer nach jedem Push ausgeben
Das Frontend wird automatisch auf Cloudflare Pages deployed. Projekt: **`aethon-e3`**

- Produktion (main): `https://aethon-e3.pages.dev`
- Branch-Previews: stabile Branch-Alias-URL — **ändert sich pro Push NICHT**, ist für den
  gesamten Branch immer dieselbe. Der Alias ist der Branchname in Kleinbuchstaben,
  `/` und andere Sonderzeichen werden zu `-`, gekürzt auf 28 Zeichen. Beispiel:
  `claude/space-game-roadmap-4mz3sw` → `https://claude-space-game-roadmap-4m.aethon-e3.pages.dev`

**Build-Nummer:** Das Frontend zeigt neben der Versionsnummer eine Build-Nummer an
(`v0.3.8 #142`). Sie entspricht `git rev-list --count HEAD` und steigt mit jedem Commit.

**Ablauf nach jedem Push auf einen `claude/**`-Branch — PFLICHT, immer beide Infos sofort ausgeben:**
```bash
git rev-list --count HEAD
```
Direkt danach im Chat ausgeben:
```
Build #<n>
Preview: [https://<branch-alias>.aethon-e3.pages.dev](https://<branch-alias>.aethon-e3.pages.dev)
```
Die URL ist stabil und sofort bekannt — **kein Warten auf den Workflow nötig**.

**Branch-Alias-URL ermitteln (nur beim ersten Push auf einen neuen Branch):**
Der GitHub Actions Workflow „Cloudflare Deploy“ (`.github/workflows/cloudflare-preview-url.yml`)
läuft nach jedem Push auf `claude/**`-Branches und `main` automatisch. Er baut das Frontend,
deployt es per `wrangler pages deploy` und gibt die URL als
`CLOUDFLARE_PREVIEW_URL=https://...` in den Job-Log aus. Nur beim allerersten Deployment
eines neuen Branches per `gh api` (REST) lesen:
```
gh api "repos/marvelvang/aethon-e3/actions/runs?branch=<branch>&per_page=1" → neuesten Run finden
gh api repos/marvelvang/aethon-e3/actions/runs/<run_id>/jobs → Job-ID ermitteln
gh api repos/marvelvang/aethon-e3/actions/jobs/<job_id>/logs → Log auf "CLOUDFLARE_PREVIEW_URL=" oder "Deployment alias URL:" prüfen
```
Danach ist die URL bekannt und wird für alle weiteren Pushes direkt ausgegeben.

**Kurzbefehl "url":** Workflow-Log des letzten Runs per `gh api` lesen und die Preview-URL ausgeben.

**Voraussetzung (einmalig durch den User im GitHub Repo einzurichten):**
Repository Settings → Secrets → Actions → zwei Secrets:
- `CLOUDFLARE_API_TOKEN` – API Token mit Schreibrecht (Account / Cloudflare Pages / Edit),
  weil der Workflow selbst deployt. Ein read-only Token reicht nicht.
- `CLOUDFLARE_ACCOUNT_ID` – Cloudflare Account ID

## Dokumentation

- Doku liegt ausschließlich in `docs/`. Konzeption und Dokumentation auf Deutsch.
- Ins Repo gehört nur Dauerhaftes (Konzepte, Vision, Spielregeln, Architektur). Verlaufsinformationen wie To-Dos, Arbeitspläne oder Zwischenstände gehören nicht ins Repo.
- Jedes Dokument ist alleinige Quelle für sein Thema; andere Dokumente verweisen darauf, statt Inhalte zu duplizieren.
- Maßgeblich für Ressourcen, Gebäude und Regeln: `docs/26 11 22 Spielregeln Ist-Stand.md`. Bei Regeländerungen im Code dieses Dokument mitziehen.
- Doku, die zu einer Codeänderung auf einem Feature-Branch gehört (vor allem Werte und Regeln im Spielregeln-Dokument), kommt **in denselben PR** wie der Code. So landen Werte und Regeln gemeinsam mit dem Code auf `main`. Reine Konzepte für Kommendes gehen weiterhin direkt auf `main`.
- Dokumente gezielt patchen statt komplett neu schreiben, damit keine Inhalte verloren gehen.
- Doku-/Konzeptarbeit geht direkt auf `main`, ohne PR und ohne Versionserhöhung. PRs nur für Codeänderungen (siehe Git). Ausnahme: Doku zu Code auf einem Feature-Branch (siehe oben).

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

# Frontend-Build (braucht cairosvg für die Gebäude-PNGs; fehlt es: pip3 install cairosvg)
bun --filter @aethon/frontend build

# Frontend-Dev-Server
bun --filter @aethon/frontend dev

# Backend-Dev-Server (braucht DATABASE_URL)
DATABASE_URL=... bun --filter @aethon/backend dev

# Engine-Tests (aus dem Paketordner, `bun test --filter` findet keine Tests)
cd src/shared/engine && bun test
```

**Neuen Gebäudetyp anlegen – Checkliste:**
1. `BUILDING_TYPES` in `src/shared/models/src/index.ts` (das Zod-Schema in `api-contract` zieht automatisch mit)
2. `BUILDING_DEFINITIONS` in `src/shared/engine/src/definitions.ts`
3. SVG in `src/frontend/app/src/assets/buildings/`, dazu in `presentation/buildingTypes.ts`: PNG-Import, `BUILDING_META`, ggf. Icon, `BUILDING_FAMILIES`
4. Hart kodierte Gebäudeanzahl in `src/shared/engine/tests/projection.test.ts` anpassen
5. `docs/26 11 22 Spielregeln Ist-Stand.md` nachziehen

## Git

- Main-Branch: `main`
- Feature-Branches: `claude/<beschreibung>` oder ähnlich
- Codeänderungen: niemals direkt auf `main` pushen, immer über Feature-Branch und PR
- Reine Doku-/Konzeptarbeit (nur `docs/`, `CLAUDE.md`, keine Softwareänderung): direkt auf `main` committen und pushen, kein PR, keine Versionserhöhung
- Doku zu Code auf einem Feature-Branch: im selben PR wie der Code (siehe Abschnitt Dokumentation)

### Committen und Pushen nach Implementierung
Nach Abschluss jeder Implementierungsaufgabe direkt committen und pushen –
**ohne vorher den Nutzer zu fragen**. Das ist ausdrücklich erwünscht.

Reihenfolge am Aufgabenende:
1. Frontend-Build (falls Frontend-Code geändert, siehe Regel 2)
2. `git add` der geänderten Dateien
3. `git commit` mit aussagekräftiger Message
4. `git push -u origin <branch>`
5. Versionscheck gemäß Regel 4 ausführen.
6. **SVG-Vorschau:** Falls die Aufgabe eine oder mehrere SVG-Dateien unter
   `src/frontend/app/src/assets/buildings/` verändert hat, jede geänderte SVG
   automatisch mit cairosvg (scale=2) in PNG umwandeln und per `SendUserFile` in den
   Chat schicken – ohne dass der User danach fragen muss.
