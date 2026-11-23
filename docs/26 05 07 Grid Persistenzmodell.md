# Grid-Persistenzmodell

> **Ist-Stand (Nov. 2026):** Das Entity-Framework-Modell unten stammt aus dem C#/.NET-Backend, das am 29.05.2026 nach TypeScript portiert wurde.
> Heute gilt:
> - `GameState.buildings` ist eine Liste von Gebäuden mit `x`/`y` (siehe `src/shared/models`). Ein Runtime-2D-Array gibt es nicht mehr.
> - Singleplayer: der ganze `GameState` liegt als JSON im `localStorage` des Browsers.
> - Multiplayer (vorbereitet): Tabelle `games` mit dem `GameState` als `jsonb`-Spalte (Drizzle, `src/backend/persistence`).
> - „Ein Gebäude pro Zelle“ prüft die Engine beim Bauen (`placeBuilding`), nicht die Datenbank.
>
> Der Rest dieses Dokuments ist der historische Entwurf.

## Fachliches Modell
Der `GameState` enthält fachlich ein zweidimensionales Grid:

    Building?[,] Grid

Die Simulation arbeitet ausschließlich auf diesem Runtime-Grid.

---

## Persistenzmodell (Entity Framework)

Da Entity Framework keine echten 2D-Arrays als Navigation Properties unterstützt, wird das Grid relational gespeichert.

### GameState
Enthält:

    ICollection<Building> Buildings

### Building
Enthält zusätzlich persistierte Koordinaten:

    int X
    int Y

---

## Datenbankregel

Auf Datenbankebene wird garantiert:

    Unique(GameStateId, X, Y)

Dadurch kann pro Grid-Zelle maximal ein Gebäude existieren.

---

## Runtime-Rekonstruktion

Nach dem Laden des `GameState` wird aus der `Buildings`-Liste ein Runtime-Grid erzeugt:

    Building?[,] RuntimeGrid

Dieses Grid wird verwendet für:

- Simulation
- Validierung
- UI-Projektion

---

## Architekturprinzip

### Persistenzrepräsentation

    GameState
     └── Buildings (mit X/Y)

### Runtimerepräsentation

    2D-Array Building?[,]

Die Runtime-Struktur wird deterministisch aus der Persistenz erzeugt.