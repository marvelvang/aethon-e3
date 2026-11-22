# V1 Arbeitsplan – Spezifikation & Operationalisierung

Achtstufiger Fahrplan (themenweise abgearbeitet) von der Vision bis zur implementierbaren Spezifikation für den Prototyp.

> Historisches Dokument (Stand 02.05.2026). Die V1 ist inzwischen umgesetzt, siehe „Realisierungsstand V1“ in [Vision](26%2005%2001%20Vision.md).

## Schritte

1. **Scope & Kernlogik:** Finalisierung der Planet-Simulation (V1-Kernloop, Ressourcen, Gebäude, Bau-Regeln, Tick-Reihenfolge). *[Abgeschlossen]*
2. **Domainobjekte & Datenmodell:** Definition der Backend-Entities (Planet, Tile, Building, ResourceStock etc.) als Basis für das DDD-Modell.
3. **Tick-Logik & Simulation:** Formalisierung des Rundenwechsels, der Produktions- und Verbrauchsformeln sowie der Zustandsübergänge (Wachstum/Verlust).
4. **Regelspezifikation:** Detaillierte Definition der Domänenfunktionen (was genau prüft/ändert eine Funktion, wenn ein Gebäude gebaut wird oder ein Tick läuft?).
5. **Operationalisierung:** Manuelle Durchläufe mit konkreten Werten (an 2–4 Szenarien), um Logiklücken oder Ressourcen-Deadlocks im Regelwerk zu finden.
6. **UI-Scope & Darstellungs-Logik (Ergänzung):** Festlegung von Responsiveness, Zoom-Konzept, Asset-Strategie (KI-generiert vs. Platzhalter) und Rendering-Ansatz für V1.
7. **Tech-Stack & Architektur:** Belastbare Architekturentscheidung für den vertikalen Schnitt (API-Design, State-Management, Persistenz).
8. **Konsolidierung & Prototyp-Backlog:** Zusammenführung aller Ergebnisse in das finale Markdown-Dokument als Implementierungsgrundlage und Erstellung eines Backlogs für den Code-Assist.

## Warum dieses Vorgehen?

Themenweise Arbeit bändigt die Komplexität. Jeder Schritt produziert ein klares Artefakt (z. B. das Scope-Markdown für Thema 1), das als „Quelle der Wahrheit“ dient.

Die Operationalisierung (Schritt 5) ist entscheidend: Erst wenn die Regeln „trocken“ durchgerechnet sind, ist klar, ob Architektur (Schritt 7) und UI-Logik (Schritt 6) wirklich funktionieren, ohne beim Implementieren in Sackgassen zu laufen.

Das UI-Thema (Schritt 6) wurde ergänzt, weil die visuelle Darstellung bei einer Simulation eine fundamentale Komponente des Spielgefühls ist. Selbst beim Prototyp muss feststehen, ob ein statisches Raster oder eine zoombare Welt gebaut wird, bevor die ersten Domain-Entities fixiert sind.
