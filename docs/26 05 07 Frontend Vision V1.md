Frontend Vision V1

**Status: ✅ V1 vollständig implementiert (Mai 2026)**

Ziel

Ein minimalistisches React-Frontend für die Simulation mit:

•	isometrischer Planetenansicht

•	scrollbarer Kamera

•	transparenten Overlay-UIs

•	kontextsensitivem Baumodus

•	klarer Trennung zwischen Welt und HUD

V1 dient primär dazu:

•	die Simulation sichtbar zu machen

•	UI/UX zu testen

•	die technische Architektur zu validieren

Noch keine:

•	komplexen Animationen

•	Effekte

•	finalen Texturen

•	echten 3D-Modelle

•	erweiterten Produktionsvisualisierungen

 

Renderingstil

Weltansicht

2.5D/isometrische Perspektive wie:

•	Imperium Galactica II

•	Anno 1602

•	klassische Iso-RTS

Kein echtes 3D notwendig.

Für V1 reicht:

•	flaches einfarbiges Terrain

•	sichtbare Rasterlinien

•	einfache isometrische Kacheln

Das logische Grid bleibt quadratisch.

Die Darstellung erfolgt isometrisch als Rhombus/Grid.

 

Kameramodell

Implementiert: Mausdrag, Zoom (3 Stufen, kamerabasiert, LOD).

Noch nicht: Rotation, vollständiger Planet, Kugelprojektion.

Details zu Zoom-Architektur, LOD-Stufen und Rendering → `26_05_01_V1_UI_Zoom.md`

 

Technologiestack

React + PixiJS. Technische Begründung, Asset-Strategie und Performance-Details → `26_05_01_V1_UI_Zoom.md`

Stack:

React

└── UI / HUD



PixiJS

└── Welt-Rendering



Zustand

└── UI- und Render-State

 

Layer-System

3 Layer: Welt (PixiJS) / Welt-Overlays (teiltransparent) / HUD (React DOM).

Details → `26_05_01_V1_UI_Zoom.md`

 

HUD Layout

Oben links

Ressourcenübersicht:

•	Energie

•	Bevölkerung

•	Industrie

•	Forschung

•	Militär

Transparentes Overlay.

 

Unten links

Aktuelle Selektion:

•	Gebäude

•	Einheit

•	Planetendetails

 

Rechtsklick-Menü

Kontextsensitives Build-Overlay.

Nicht als feste Seitenleiste.

Erscheint direkt am Mauszeiger.

Beispiel:

[ Mine ]

[ Solar ]

[ Habitat ]

[ Factory ]

Optional später:

•	radial

•	kategorisiert

•	Quick-Hotkeys

 

Interaktionsmodell

Linksklick

•	Objekt auswählen

•	Tile auswählen

Rechtsklick

Auf leerem Feld:

•	Baumenu öffnen

Auf Objekt:

•	Kontextaktion

 

Grid-Spezifikation

Datenmodell

type Tile = {

  x: number

  y: number

}

 

Isometrische Projektion

Transformation von Grid → Bildschirm:

screenX = (x - y) * tileWidth / 2

screenY = (x + y) * tileHeight / 2

Das logische Spielfeld bleibt intern rechteckig.

Nur die Darstellung ist isometrisch.

 

V1 Scope

Muss funktionieren

•	Planetendarstellung

•	isometrisches Grid

•	Kamerabewegung

•	Tile Hover

•	Tile Selection

•	Rechtsklick Build-Overlay

•	Platzierung eines Dummy-Gebäudes

•	transparentes HUD

 

Noch nicht nötig

•	Pathfinding

•	Animationen

•	Beleuchtung

•	Multiplayer

•	Partikeleffekte

•	finale Assets

•	komplexe Produktionsdarstellung

 

Architekturprinzip

Frontend ist primär Darstellungsschicht.

Die Spiellogik lebt getrennt in der Simulation.

Datenfluss:

Simulation State

    ↓

Render State

    ↓

PixiJS / React

Die UI enthält keine Kernsimulation.

Das Frontend liest und visualisiert nur den aktuellen Zustand.

 

Praktischer Implementierungsplan

✅ Abgeschlossen (Mai 2026)

1.	React + Vite Projekt
2.	PixiJS integrieren
3.	Isometrisches Grid rendern
4.	Mausprojektion Grid ↔ Screen
5.	Overlay-HUD in React
6.	Zustand Store integrieren
7.	Dummy-Gebäude platzieren
8.	Kontextuelles Build-Menü per Rechtsklick

Das reicht bereits für einen ersten vollständigen Vertical Slice der Benutzeroberfläche.



