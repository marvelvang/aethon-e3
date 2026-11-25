# Gebäudedesign: Design-Sprache, Größen-Struktur, Werft und Raumhafen

> Dieses Dokument ist die Referenz für das **visuelle Konzept** der Gebäude (Formensprache, Farben, Größen) und für das Zielkonzept von **Werft** und **Raumhafen**.
> Werte, Kosten und Spielregeln der Gebäude stehen ausschließlich in [Spielregeln Ist-Stand](26%2011%2022%20Spielregeln%20Ist-Stand.md).

## 1. Design-Sprache der Gebäude

### 1.1 Technische Basis

- **SVG-Master** 256 × 308 px, das entspricht der 4-fachen Auflösung einer Iso-Kachel (64 × 32).
- Darstellung in Pixi mit Anker `(0.5, 178/308)` und Skalierung `64/256` (siehe `buildingTypes.ts`).
- Die SVGs liegen in `src/frontend/app/src/assets/buildings/`. Die PNGs für Pixi werden beim Build per `scripts/render-building-pngs.py` (cairosvg) erzeugt.

### 1.2 Aufbau

- **Gemeinsame Basisplatte:** Fundament ±128 (Höhe 0 → 24), darüber je nach Gebäude ein Sockel (±88) oder Blöcke.
- **Dreiflächen-Beleuchtung:** rechte Fläche hell, linke dunkel, Oberseite mittel, jeweils mit linearen Gradienten.
- **Bauprinzipien:**
  - *Turm:* schlanke Säule (z. B. Forschung, Konsumgüter).
  - *Block:* gestaffelte Quader (z. B. Wohnen, Industrie).
  - Dazu Dekoration obenauf: Schüsseln, Spitzen, Ringe, Empfangskugeln.
- **Energie-Ring im SVG:** horizontale Ellipse mittig am Turm (Basis, Konsumgüter, Industrie-Emitter).
- **Vom Code erzeugte Elemente:**
  - *Eck-Spheres* (`renderCornerSpheres.ts`): drei weiße Glühpunkte an den sichtbaren Kachelecken. Sie leuchten, wenn ein Nachbargebäude die Ecke teilt.
  - *Basisplatten-Linien* (`renderBaseplateLines.ts`): weiße Linien auf der Basisplatte.

### 1.3 Farbkodierung

| Familie | Farben |
|---|---|
| Basis | Cyan `#00d4ff` |
| Wohnen | Orange/Amber `#E07030` / `#ffaa00` |
| Konsumgüter | Violett `#cc44ff` + Grün |
| Industrie | Silber + Violett `#cc44ff` |
| Kraftwerk | Stahlblau + Weiß |
| Forschung | Gold/Braun `#f0b030` / `#b07810` |

Noch frei für neue Familien: Rot-Orange (Plasma, Schweißen), Teal-Grün, Elektrisch-Blau, Warmweiß/Silber.

### 1.4 Formenvokabular

Jede neue Silhouette soll eine Grundform tragen, die sich von den anderen unterscheidet. Das Vokabular umfasst bisher: **Turm, Block, Diagonale, Kuppel, Stelzen, Tor, offener Rahmen**.

## 2. Größen- und Stufenstruktur

- Es gibt **fünf Forschungslevel (RL1–RL5)**. Auf jedem Level gibt es ein **1-Feld-Gebäude** je Familie (Stufe T1–T5).
- Ab **RL3, RL4 und RL5** kommen zusätzlich **4-Feld-Gebäude** (2 × 2) mit deutlich mehr Gestaltungsraum dazu.
- Auf **RL5** kommen zusätzlich **9-Feld-Gebäude** (3 × 3) dazu.
- Leitgedanke ist Realismus: Auch Riesenanlagen brauchen kleine Zulieferer. Deshalb bleiben die kleinen Gebäude auch auf hohen Leveln sinnvoll.

> Mehrfeld-Gebäude setzen eine Mehrfeld-Mechanik im Grid voraus, die es im Code noch nicht gibt. Ein erster Versuch (HousingT3 2 × 2, HousingT5 3 × 3) wurde eingebaut und wieder zurückgenommen (Commits `4d3f9e1`, `eb1122d`).

## 3. Werft und Raumhafen

### 3.1 Rolle im Spiel

- **Werft** (`Shipyard`): baut später Raumschiffe. Schiffe sind der Enabler für Exploration, Raumkampf und Diplomatie (siehe [Vision](26%2005%2001%20Vision.md)).
- **Raumhafen** (`Spaceport`): steht für Orbitalverkehr und Handel. Seine genaue Spielmechanik wird mit dem Schiffssystem festgelegt.
- Bis das Schiffssystem steht, produzieren beide nichts und sind reine Kostengebäude.

### 3.2 Grundkonzepte

**Werft**

| Konzept | Grundform | Farben |
|---|---|---|
| **ScaffoldYard** | offener Gitterturm, Transparenz und negative Flächen, Montage-Ausleger oben | Dunkelstahl `#2A2E36` + Schweißfunken-Orange `#FF5500` |
| **MagRail Slip** | Diagonale: schräge Startschiene, Energiekoppler unten, Magnetring oben | Carbon-Schwarz `#1A1C22` + Elektrisch-Blau `#2255FF` |
| **HeavyFab Dock** | breite Blöcke, symmetrische Ausleger mit Energieleitung | Gunmetal `#3A3840` + Plasma-Rot `#CC2200` |

**Raumhafen**

| Konzept | Grundform | Farben |
|---|---|---|
| **DominalPort** | große Kuppel als Hauptkörper, Beacon-Kranz am Kuppelrand | Hellsilber `#C8D8E8` + Amber `#FFAA00` |
| **ElevatedPad** | aufgeständerte Plattform auf Pfeilern, negativer Raum darunter | Beton-Grau `#70808A` + Lande-Amber `#FFCC00` |
| **TwinPylon Gate** | zwei Pylone mit Energiefeld dazwischen, Tor-Form mit bilateraler Symmetrie | Tiefseeblau `#182040` + Violett-Blau `#7744FF` |

### 3.3 Zuordnung zu Forschungslevel und Größe

**Werft**

| Level | Felder | Konzept | Beschreibung |
|---|---|---|---|
| RL1 | 1 | ScaffoldYard | Gittergerüst-Turm, manuell, Orange-Akzente |
| RL2 | 1 | AssemblyBot Hub | Block-Stil, ein mechanischer Arm auf dem Dach |
| RL3 | 1 | MicroDock | zwei Mini-Türme mit Querträger, Vorgeschmack auf das Tor |
| RL4 | 1 | PrecisionForge | schlanker Hochturm mit rotierendem Ring-Array |
| RL5 | 1 | NanoAssembler | kompakt, überraschend viele Emitter und Ringe |
| RL3 | 4 | OrbitSlipway | offener Trockendock-Rahmen (Dock-Ring), Teal-Grün |
| RL4 | 4 | MagRail Slip | Diagonale über vier Felder, Elektrisch-Blau |
| RL5 | 4 | CraneArray | drei parallele Ausleger mit Obertraverse |
| RL5 | 9 | HeavyFab-Komplex | drei Trockendocks nebeneinander mit übergreifendem Kranträgersystem, Plasma-Rot + Schwerstahl |

**Raumhafen**

| Level | Felder | Konzept | Beschreibung |
|---|---|---|---|
| RL1 | 1 | ElevatedPad | Stelzenplattform, Amber-Baken |
| RL2 | 1 | TransitBeacon | Turm mit rotierendem Leuchtring (Leuchtturm) |
| RL3 | 1 | FreightHub | breiter flacher Block mit Ladebuchten |
| RL4 | 1 | ApproachControl | Turm mit breitem Panoramakopf |
| RL5 | 1 | NavSpire | schlanke Nadel mit Ringen |
| RL3 | 4 | FreightTerminal | flacher breiter Komplex mit Andockschächten |
| RL4 | 4 | DominalPort | große Kuppel |
| RL5 | 4 | StarBazaar | Kuppel mit äußerem Kolonnadenring |
| RL5 | 9 | TwinPylon Gate | das ikonische Tor |

### 3.4 Begründungen

- **ScaffoldYard als erste Werft:** klein und improvisiert, passt zum Einstieg. Auch große Werften brauchen später solche Zulieferer.
- **MagRail Slip als 4-Feld-Gebäude auf RL4:** Die Startschiene braucht Platz und ist Mittel- bis Hochtechnologie.
- **HeavyFab als 9-Feld-Gebäude erweitert:** „Zwei Blöcke und zwei Ausleger“ wären für neun Felder zu dünn. Daher drei Trockendocks mit gemeinsamem Kranträgersystem.
- **TwinPylon Gate als 9-Feld-Gebäude:** die stärkste, ikonischste Silhouette, sie braucht Platz.
- **OrbitSlipway (offener Rahmen):** schließt eine Lücke im Formenvokabular. Turm, Block, Diagonale, Kuppel, Stelzen und Tor waren vergeben, ein offener Rahmen fehlte.
