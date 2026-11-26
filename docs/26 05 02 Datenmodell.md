# Datenmodell

> Beschreibt die Struktur des Spielzustands so, wie sie im Code steht (`src/shared/models`, `src/shared/engine`). Bei Abweichungen gilt der Code.
> Werte und Spielregeln stehen ausschließlich in [Spielregeln Ist-Stand](26%2011%2022%20Spielregeln%20Ist-Stand.md). Betriebsarten und Technik: [SW-Architektur](26%2005%2002%20SW-Architektur.md), Abschnitt 2.0.

---

## 1. Grundprinzipien

- **Ein Aggregat:** Der gesamte Spielzustand ist ein `GameState`. Er wird als Ganzes geladen, von der Engine verarbeitet und als Ganzes gespeichert (Begründung: [Architekturentscheidung Domänenmodell statt ECS](26%2011%2023%20Architekturentscheidung%20Dom%C3%A4nenmodell%20statt%20ECS.md)).
- **Reine Funktionen:** Jede Aktion nimmt einen `GameState` und gibt einen neuen zurück. Es gibt keinen Zwischen- oder Kommando-Zustand außerhalb des `GameState`.
- **Gespeichert wird nur der Zustand:** Typdefinitionen (Gebäudewerte, Forschungskosten) und alle abgeleiteten Werte gehören nicht zum `GameState` und werden bei Bedarf berechnet.
- **UI ist Projektion:** Die Oberfläche bekommt einen `UiState`, den `project(state)` aus dem `GameState` ableitet. Sie enthält keine Spiellogik.
- **Deterministisch:** keine Zufallselemente, gleiche Eingaben ergeben gleiche Ergebnisse.

---

## 2. GameState (`@aethon/models`)

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | string | Spiel-ID. Singleplayer: im Browser erzeugte UUID. Multiplayer: Primärschlüssel der Datenbank. |
| `round` | number | Rundenzähler, startet bei 1 |
| `population` | number | Bevölkerung, ganzzahlig |
| `consumerGoods` | number | Bestand Konsumgüter, nie negativ |
| `industry` | number | Bestand Industrie, kann negativ werden (Niederlage) |
| `energy` | number | Bestand Energie, kann negativ werden (Niederlage) |
| `buildings` | `Building[]` | alle Gebäude auf dem Grid |
| `researchFocus` | `ResearchBranch` oder `null` | gewählter Forschungszweig, `null` = kein Fokus |
| `researchProgress` | je `ResearchBranch` ein `ResearchBranchProgress` | Forschungsstand aller vier Zweige, hier liegen die gesammelten Forschungspunkte |

Wohnraum und Forschungspunkte pro Runde sind keine Felder, sondern werden aus den Gebäuden abgeleitet (Abschnitt 5). Startwerte: Spielregeln §8.

### Building

| Feld | Typ | Bedeutung |
|---|---|---|
| `x`, `y` | number | Position im Grid, jeweils 0 bis `GRID_SIZE` − 1 |
| `type` | `BuildingType` | Gebäudetyp |
| `isNewlyBuilt` | boolean | in der laufenden Runde gebaut, wird zu Beginn der nächsten Rundensimulation zurückgesetzt |

### ResearchBranchProgress

| Feld | Typ | Bedeutung |
|---|---|---|
| `level` | 1 bis 5 | aktuelle Forschungsstufe des Zweigs (Spielregeln §6) |
| `investedPoints` | number | gesammelte Punkte auf dem Weg zur nächsten Stufe, auf Stufe 5 immer 0 |

### Aufzählungen

| Name | Werte |
|---|---|
| `BuildingType` | 26 Typen in `BUILDING_TYPES`: Basis plus je fünf Stufen von Wohnen, Konsumgütern, Industrie, Kraftwerk und Forschung (Liste in Spielregeln §2) |
| `ResearchBranch` | `Housing`, `Consumer`, `Industry`, `Energy` |
| `GameResult` | `None`, `Win`, `Loss` |

---

## 3. Grid

- Das Grid ist quadratisch mit fester Größe `GRID_SIZE` × `GRID_SIZE` (20 × 20). Isometrisch ist nur die Darstellung.
- Im Zustand gibt es kein 2D-Array. Das Grid ist die Liste `buildings`, jedes Gebäude trägt seine Koordinaten, leere Felder werden nicht gespeichert.
- Jedes Gebäude belegt genau ein Feld.

---

## 4. Typdefinitionen (`@aethon/engine`, nicht gespeichert)

- **`BUILDING_DEFINITIONS`** (`definitions.ts`): je Gebäudetyp eine `BuildingDefinition` mit Baukosten (Bevölkerung, Industrie, Energie), Produktion pro Runde (Konsumgüter, Industrie, Energie, Forschung), Wohnraumbeitrag, Wartung pro Runde (Bevölkerung, Industrie, Energie) und Forschungsvoraussetzung (Liste aus Zweig und Stufe oder keine).
- **`RESEARCH_COSTS`** (`research-definitions.ts`): Punkte je Stufenaufstieg, je Zweig.

Ein neuer Gebäudetyp oder eine neue Stufe ist eine neue Zeile in diesen Tabellen, keine neue Klasse. Die Werte selbst stehen in Spielregeln §2 und §6.

---

## 5. Abgeleitete Werte (nicht gespeichert)

Berechnet in `aggregateBuildings`, `calculateGains` und `project`:

| Wert | Ableitung |
|---|---|
| Wohnraum | Summe der Wohnraumbeiträge aller Gebäude |
| Gebundene Bevölkerung | Baukosten-Bevölkerung aller neu gebauten Gebäude plus Wartungs-Bevölkerung aller übrigen Gebäude |
| Freie Bevölkerung | Bevölkerung minus gebundene Bevölkerung. Kann negativ werden, wenn die Bevölkerung schrumpft. |
| Forschung pro Runde | Summe der Forschungsproduktion aller Gebäude |
| Prognose | voraussichtliche Änderung von Konsumgütern, Industrie, Energie und Bevölkerung in der nächsten Runde |
| Spielergebnis | `Loss` bei Industrie oder Energie unter 0, `Win`, wenn alle Felder bebaut sind, sonst `None` |
| Baubarkeit je Typ | Forschung freigeschaltet, grundsätzlich baubar (nicht die Basis) und bezahlbar |

---

## 6. Zustandsänderungen

| Aktion | Umsetzung | Wirkung |
|---|---|---|
| Neues Spiel | `genesis()` | Startzustand ohne ID, die ID vergibt der Speicherort |
| Bauen | `placeBuilding(state, x, y, type)` | prüft Feld, freie Bevölkerung, Industrie und Energie, zieht Industrie und Energie ab und fügt das Gebäude mit `isNewlyBuilt = true` hinzu (Spielregeln §4). Die Forschungsvoraussetzung prüft heute nur die Projektion, nicht `placeBuilding`. |
| Runde beenden | `simulateRound(state)` | Rundenablauf nach Spielregeln §5 |
| Forschungsfokus setzen | `GameGateway.setResearchFocus` | setzt `researchFocus` direkt, eine eigene Engine-Funktion gibt es nicht |
| Spiel neu starten | `GameGateway.reset` | neuer Startzustand mit neuer ID |
| Anzeige | `project(state)` | erzeugt den `UiState` |

---

## 7. UiState (Projektion)

Der `UiState` enthält die angezeigten Felder des `GameState` (Runde, Ressourcen, Gebäude, Forschungsfokus und -stand), dazu alle abgeleiteten Werte aus Abschnitt 5 und je Gebäudetyp eine `UiBuildingTypeInfo` mit Kosten, Produktion, Wartung, Forschungsvoraussetzung, `researchUnlocked`, `isBuildable` und `canAfford`. Im Multiplayer ergänzt das Backend `backendVersion`. Der `UiState` wird nie gespeichert und nach jeder Aktion neu erzeugt.

---

## 8. Persistenz

Jede Aktion folgt demselben Ablauf: Zustand laden, Engine aufrufen, Zustand speichern, `UiState` erzeugen.

| | Singleplayer (aktiv) | Multiplayer (vorbereitet) |
|---|---|---|
| Ort | `localStorage` des Browsers, Schlüssel `aethon.gameState` | PostgreSQL, Tabelle `games` |
| Form | der ganze `GameState` als JSON | der ganze `GameState` als `jsonb`-Spalte `state`, dazu `id` (UUID), `created_at`, `updated_at` |
| Zugriff | `LocalGameGateway` | `GameRepository` (`src/backend/persistence`) |

„Ein Gebäude pro Feld“ sichert die Engine beim Bauen, nicht die Datenbank.

---

## 9. Invarianten

- Pro Feld höchstens ein Gebäude, nur innerhalb des Grids.
- Genau eine Basis, auf Position (0,0). Sie entsteht mit dem Spiel und ist nicht baubar.
- Konsumgüter sind nie negativ. Die Bevölkerung ist ganzzahlig und nach jeder Runde höchstens so groß wie der Wohnraum.
- Industrie und Energie dürfen negativ werden. Das ist kein ungültiger Zustand, sondern die Niederlage.
- Alles, was nicht gespeichert wird, lässt sich deterministisch aus `GameState` und Typdefinitionen ableiten.
