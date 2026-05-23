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
**Vor jeder Aufgabe** – als allererste Aktion, noch vor dem ersten Datei-Lesen, vor
jeder Suche, vor jedem sonstigen Tool-Call. Es laufen parallel andere Entwicklungen auf
weiteren Branches, die jederzeit nach main gemergt werden können.

**Wann der Fetch entfällt** – nur in diesen beiden Fällen:
- **Session-Start:** Claude Code Web legt für jede neue Session automatisch einen
  frischen Branch von main an. Die allererste Aufgabe einer Session braucht daher
  keinen Fetch.
- **Soeben selbst gemergt:** Wenn ich main im unmittelbar vorherigen Schritt dieser
  Session bereits gefetcht und gemergt habe (z.B. nach einem „main"-Kurzbefehl oder
  am Anfang der aktuellen Aufgabe), ist ein erneuter Fetch überflüssig. Im Zweifel
  immer fetchen.

Ablauf zu Beginn jeder Aufgabe (sofern Fetch nicht entfällt):
1. `git fetch origin main` ausführen – **das ist der erste Tool-Call**
2. Prüfen ob main ahead ist: `git log HEAD..origin/main --oneline`
3. Wenn ja: `origin/main` in den aktuellen Branch mergen
4. Merge-Konflikte analysieren, lösen – bei Unklarheiten erst rückfragen
5. **TypeScript-Typen neu generieren**, falls der Merge die OpenAPI-Spec verändert hat:
   ```bash
   git diff ORIG_HEAD HEAD --name-only | grep -q "aethon-e3.api.json" \
     && npm run generate --prefix src/frontend
   ```
   Der Session-Start-Hook generiert die Typen nur einmalig – ein Merge, der die Spec
   aktualisiert, macht sie sofort wieder veraltet. Dieser Schritt stellt sicher, dass
   `src/frontend/src/api/generated.ts` immer mit der aktuellen Spec übereinstimmt.
6. **Versionskonflikt prüfen**: Beide Versionsnummern im eigenen Branch mit denen aus
   `origin/main` vergleichen (semantischer Vergleich: MAJOR, dann MINOR, dann PATCH).
   Zu prüfende Dateien:
   - Frontend: `APP_VERSION` in `src/frontend/src/components/VersionDisplay.tsx`
   - Backend: `APP_VERSION` in `src/backend/aethon-e3.core/Projections/UiState.cs`
   Beide Versionen müssen **immer identisch** sein. Maßgeblich ist die höhere der
   vier verglichenen Werte (je Branch und main für Frontend und Backend):
   - Höchste der vier Versionen **strikt größer** als alle main-Versionen → kein Handlungsbedarf.
   - Andernfalls → **sofort** per `AskUserQuestion` fragen, ob Patch oder Minor
     (Mindest-Zielversion nennen, Option „Nein" entfällt).
     Beispiele: Branch `0.0.17`, main `0.1.0` → Minimum `0.1.1`;
     Branch `0.0.16`, main `0.0.16` → Minimum `0.0.17`.
     Nach der Antwort: beide Dateien setzen, Frontend-Build, Commit, Push.
7. Erst dann mit der eigentlichen Aufgabe beginnen

**Kurzbefehl „main":** Schreibt der User nur das Wort `main` (allein in einer Nachricht),
bedeutet das: sofort Regel 3 vollständig ausführen (fetch → merge → Konflikte lösen →
Versionskonflikt prüfen und ggf. sofort beheben → push) – ohne weitere Aufgabe danach.

Ausnahme: Nachrichten, die **ausschließlich** eine Frage oder Beratung sind und
**keinerlei** Änderungs-, Ergänzungs- oder Umsetzungsanteil enthalten, brauchen
keinen Fetch. Im Zweifel – also wenn auch nur ein Teil der Nachricht eine Änderung
impliziert – immer fetchen. „Finde X und ergänze Y" ist ein Umsetzungsauftrag,
auch wenn er mit Recherche beginnt.

### 4. Versionsnummern inkrementieren (nur auf Nachfrage am Aufgabenende)
Frontend- und Backend-Version werden **immer im Gleichtakt** auf dieselbe Versionsnummer
gesetzt. Die maßgeblichen Stellen:
- Frontend: `APP_VERSION` in `src/frontend/src/components/VersionDisplay.tsx`
- Backend: `APP_VERSION` in `src/backend/aethon-e3.core/Projections/UiState.cs`

**Nie automatisch** erhöhen – immer den User fragen. Die Entscheidung Patch oder Minor
liegt ausnahmslos beim User.

**Am Ende einer Aufgabe die Versionsfrage stellen – aber nur wenn nötig:**
Pro Branch reicht ein einziges Increment über main hinaus.

**PFLICHT – immer zuerst ausführen, kein Überspringen:**
```bash
grep "APP_VERSION" src/frontend/src/components/VersionDisplay.tsx
```
Diesen Tool-Call **immer** ausführen – auch wenn die Version „bekannt" zu sein scheint.
Den Ausgabewert direkt in den Fragetext übernehmen. Die Version im Fragetext **muss**
aus diesem Tool-Call stammen – **niemals** aus dem Gedächtnis oder aus früheren
Nachrichten im Chat. Kein `AskUserQuestion` zur Version ohne diesen grep davor.

Dann Branch-Version mit `origin/main` vergleichen:
- Branch-Version **strikt größer** als main → **Frage entfällt**, kein weiteres Increment nötig.
- Branch-Version **gleich** main → Frage stellen (Option „Nein" entfällt, da Increment
  technisch notwendig ist; Mindest-Zielversion nennen).

- Normalfall (branch > main nicht erreichbar ohne Increment): Optionen **Patch** /
  **Minor**.
- Wenn branch bereits > main: Frage entfällt (s.o.).
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
5. **Erst** `grep "APP_VERSION" src/frontend/src/components/VersionDisplay.tsx`
   ausführen, **dann** per `AskUserQuestion` fragen (siehe Regel 4 – Pflichtgrep).
   Falls ja: Frontend `APP_VERSION` + Backend `<Version>` gemeinsam als eigener
   Commit + push.
