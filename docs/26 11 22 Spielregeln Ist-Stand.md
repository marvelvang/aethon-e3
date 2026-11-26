# Spielregeln – Ist-Stand im Code

> Stand 22.11.2026, abgeleitet aus `src/shared/engine` und `src/shared/models`.
> Dieses Dokument ist die **maßgebliche Referenz** für Ressourcen, Gebäude und Rundenablauf.
> Die Struktur des Spielzustands beschreibt das [Datenmodell](26%2005%2002%20Datenmodell.md).
> Das ältere Dokument [V1 Simulation Rules](26%2005%2002%20V1%20Simulation%20Rules.md) beschreibt den ersten Prototyp (4 Gebäudetypen, ohne Energie und Forschung) und gilt nur noch als Herleitung.
> Bei Abweichungen gilt der Code bzw. dieses Dokument.

---

## 1. Ressourcen

| Ressource | Code | Art | Woher | Wofür |
|---|---|---|---|---|
| Bevölkerung | `population` | Bestand | Wachstum über Versorgung | Baukosten (gebunden), Wartung (gebunden), verbraucht Konsumgüter |
| Wohnraum | `housing` | Kapazität (kein Bestand) | Basis, Wohngebäude | Obergrenze der Bevölkerung |
| Konsumgüter | `consumerGoods` | Bestand | Basis, Güterwerk, Industriewerk T1 | Versorgung der Bevölkerung (1 pro Einwohner und Runde) |
| Industrie | `industry` | Bestand | Basis, Industriewerk | Baukosten, laufende Wartung |
| Energie | `energy` | Bestand | Basis, Kraftwerk | Baukosten, laufende Wartung |
| Forschung | `researchProgress` | Punkte pro Runde (aus den Gebäuden berechnet), gesammelt je Forschungszweig | Forschungsgebäude | Schaltet die Stufen T2–T5 der Gebäude frei |
| Militär | – | **geplant für die Raumebene, noch nicht im Code** | – | – |

Militär gehört zur späteren **Raumebene** (Raumschiffe, Raumkampf, Angriffe auf Planeten aus dem Orbit, siehe [Vision](26%2005%2001%20Vision.md)). Alle Regeln in diesem Dokument betreffen die **Planetenebene**.

## 2. Gebäude

Sechs Gebäudefamilien, jede (außer der Basis) in fünf Stufen T1–T5. Stufen ab T2 werden über Forschung freigeschaltet.

| Familie | Code | Anzeigename |
|---|---|---|
| Basis | `Base` | Basis (nur Startgebäude, nicht baubar) |
| Wohnen | `Housing` … `HousingT5` | Wohngebäude I–V |
| Konsumgüter | `Consumer` … `ConsumerT5` | Güterwerk I–V |
| Industrie | `Industry` … `IndustryT5` | Industriewerk I–V |
| Energie | `PowerPlant` … `PowerPlantT5` | Kraftwerk I–V |
| Forschung | `Research` … `ResearchT5` | Forschung I–V |

### Werte (aus `definitions.ts`)

Kosten und Wartung jeweils als Bevölkerung / Industrie / Energie.

| Gebäude | Baukosten | Produktion pro Runde | Wartung pro Runde | Voraussetzung (Forschung) |
|---|---|---|---|---|
| Base | 0 / 0 / 0 | +100 Konsumgüter, +100 Industrie, +100 Energie, +150 Wohnraum | 10 / 15 / 15 | – |
| Housing | 50 / 60 / 60 | +20 Wohnraum | 0 / 0 / 0 | – |
| HousingT2 | 75 / 90 / 90 | +40 Wohnraum | 0 / 0 / 0 | Housing 2 |
| HousingT3 | 115 / 135 / 135 | +60 Wohnraum | 0 / 0 / 0 | Housing 3 |
| HousingT4 | 170 / 205 / 205 | +90 Wohnraum | 0 / 0 / 0 | Housing 4 |
| HousingT5 | 255 / 305 / 305 | +135 Wohnraum | 0 / 0 / 0 | Housing 5 |
| Consumer | 25 / 15 / 15 | +40 Konsumgüter | 7 / 5 / 5 | – |
| ConsumerT2 | 38 / 23 / 23 | +80 Konsumgüter | 11 / 8 / 8 | Consumer 2 |
| ConsumerT3 | 57 / 35 / 35 | +120 Konsumgüter | 17 / 12 / 12 | Consumer 3 |
| ConsumerT4 | 85 / 50 / 50 | +180 Konsumgüter | 25 / 18 / 18 | Consumer 4 |
| ConsumerT5 | 130 / 75 / 75 | +270 Konsumgüter | 38 / 27 / 27 | Consumer 5 |
| Industry | 40 / 70 / 70 | +10 Konsumgüter, +50 Industrie | 10 / 7 / 7 | – |
| IndustryT2 | 60 / 105 / 105 | +100 Industrie | 15 / 11 / 11 | Industry 2 |
| IndustryT3 | 90 / 160 / 160 | +150 Industrie | 23 / 17 / 17 | Industry 3 |
| IndustryT4 | 135 / 240 / 240 | +225 Industrie | 34 / 25 / 25 | Industry 4 |
| IndustryT5 | 205 / 360 / 360 | +340 Industrie | 51 / 38 / 38 | Industry 5 |
| PowerPlant | 40 / 70 / 70 | +50 Energie | 10 / 7 / 7 | – |
| PowerPlantT2 | 60 / 105 / 105 | +100 Energie | 15 / 11 / 11 | Energy 2 |
| PowerPlantT3 | 90 / 160 / 160 | +150 Energie | 23 / 17 / 17 | Energy 3 |
| PowerPlantT4 | 135 / 240 / 240 | +225 Energie | 34 / 25 / 25 | Energy 4 |
| PowerPlantT5 | 205 / 360 / 360 | +340 Energie | 51 / 38 / 38 | Energy 5 |
| Research | 30 / 60 / 50 | +20 Forschung | 8 / 5 / 15 | – |
| ResearchT2 | 45 / 90 / 75 | +45 Forschung | 12 / 8 / 23 | Industry 2 + Energy 2 |
| ResearchT3 | 70 / 135 / 115 | +70 Forschung | 18 / 12 / 35 | Industry 3 + Energy 3 |
| ResearchT4 | 105 / 205 / 170 | +105 Forschung | 27 / 18 / 52 | Industry 4 + Energy 4 |
| ResearchT5 | 155 / 305 / 255 | +155 Forschung | 40 / 27 / 78 | Industry 5 + Energy 5 |

Faustregel: Ab T2 steigen Kosten, Produktion und Wartung pro Stufe um etwa Faktor 1,5.

## 3. Bevölkerung: frei und gebunden

- **Gebundene Bevölkerung** = Baukosten (Bevölkerung) aller Gebäude im Zustand „neu gebaut“ + Wartungs-Bevölkerung aller übrigen Gebäude.
- **Freie Bevölkerung** = Bevölkerung − gebundene Bevölkerung.
- Bevölkerung wird durch Bau und Wartung **gebunden, nicht verbraucht**.

## 4. Bauen

Ein Gebäude kann gebaut werden, wenn:

- die Zelle innerhalb des Grids liegt und frei ist,
- es nicht die Basis ist,
- die Forschungsvoraussetzung erfüllt ist,
- freie Bevölkerung ≥ Bevölkerungskosten,
- Industrie ≥ Industriekosten und Energie ≥ Energiekosten.

Beim Bau werden Industrie und Energie sofort abgezogen. Das Gebäude erhält den Zustand „neu gebaut“ und bindet seine Bevölkerungskosten bis zum Rundenende.

## 5. Rundenablauf (`simulateRound`)

1. **Normalisierung:** alle Gebäude „neu gebaut“ → normal (gibt die Bau-Bevölkerung frei).
2. **Produktion und Wartung:** Industrie += Produktion − Wartung, Energie += Produktion − Wartung.
3. **Verbrauch:** Konsumgüter = max(0, Konsumgüter + Produktion − Bevölkerung).
4. **Versorgungsgrad:** Konsumgüter (nach Verbrauch) / Bevölkerung.
5. **Bevölkerungsänderung:**
   - Versorgung > 1: Wachstum = Bevölkerung × 0,0025 × (Versorgung − 1)^1,2
   - Versorgung < 1: Verlust = Bevölkerung × 0,005 × (1 − Versorgung)
6. **Wohnraum-Grenze:** Bevölkerung = min(neue Bevölkerung, Wohnraum), abgeschnitten auf ganze Zahl.
7. **Forschung:** Forschungspunkte der Runde werden verteilt (siehe 6.).
8. **Rundenzähler** +1.

## 6. Forschung

- Vier Zweige: `Housing`, `Consumer`, `Industry`, `Energy`, jeder mit einer eigenen **Forschungsstufe** 1–5 (im Code `level`, in der Oberfläche „Lvl“).
- Kosten pro Stufenaufstieg: 500 → 1.000 → 2.000 → 4.000 Punkte (1→2, 2→3, 3→4, 4→5).
- Mit Forschungsfokus fließen alle Punkte in den gewählten Zweig, ohne Fokus werden sie gleichmäßig auf alle vier verteilt.
- Ohne Fokus erhält jeder Zweig ein Viertel der Punkte, abgerundet. Der Rest verfällt (z. B. 45 Punkte → je 11, 1 Punkt verfällt).
- Punkte für einen Zweig auf Stufe 5 verfallen, auch wenn der Fokus auf ihm liegt. Sie gehen nicht an andere Zweige.
- Überschüssige Punkte zählen für die nächste Stufe, ein Zweig kann in einer Runde auch mehrere Stufen aufsteigen. Beim Erreichen von Stufe 5 verfällt der Überschuss.
- Forschungsstufe und Gebäudestufe hängen 1:1 zusammen: Stufe *n* eines Zweigs schaltet alle Gebäude der Stufe T*n* frei, die an diesem Zweig hängen (Housing → Wohnen, Consumer → Konsumgüter, Industry → Industrie, Energy → Energie mit den Kraftwerken). Eine Stufe kann also mehrere Gebäude freischalten. Jeder Zweig startet auf Stufe 1, deshalb ist T1 ohne Forschung baubar.
- Forschungsgebäude T*n* hängen an zwei Zweigen und brauchen Industry **und** Energy auf Stufe *n*.

## 7. Spielende

- **Niederlage:** Industrie < 0 oder Energie < 0.
- **Sieg:** alle Zellen des Grids sind bebaut.

## 8. Startzustand (`genesis`)

- Runde 1, Bevölkerung 100, Konsumgüter 0, Industrie 200, Energie 200
- Basis auf Position (0,0)
- alle Forschungszweige auf Stufe 1, kein Fokus
- Grid-Größe: `GRID_SIZE` in `src/shared/models` (aktuell 20×20)

## 9. Geplant (noch nicht im Code)

Konzepte für die Planetenebene, die bewusst zurückgestellt wurden:

- **Planetenqualität:** Planeten unterscheiden sich in der Stabilität bzw. Nutzbarkeit ihres Realitätszustands; das skaliert die Produktion (z. B. 100 % auf stabilen, deutlich weniger auf instabilen Planeten). Lore-Hintergrund siehe [Kernspielidee](26%2005%2002%20Kernspielidee.md), Abschnitt 7.
- **Effizienzregler / Drosselung:** Produktion eines Gebäudes abhängig von Versorgung und Unterhalt bzw. vom Spieler drosselbar, statt nur „läuft voll“ oder Spielende bei negativer Industrie/Energie.
- **Abriss:** Gebäude wieder entfernen können.

Raumebene mit Militär: siehe Abschnitt 1 und [Vision](26%2005%2001%20Vision.md).
