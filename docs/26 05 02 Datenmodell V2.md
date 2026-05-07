**Schritt 3 – Datenmodell (V1)**

---

**1. Grundprinzipien**

**1.1 Single Source of Truth**

Der gesamte Spielzustand ist jederzeit vollständig persistent.  
Es existieren keine temporären Zustände außerhalb der Persistenz.

---

**1.2 Deterministischer Ablauf**

Jeder Request folgt exakt diesem Muster:

Load → Domain Logic → Save → UI Projection

Dies gilt für:

- Spielstart
- Gebäude bauen
- Rundenwechsel

---

**1.3 UI ist reine Projektion**

- UI enthält keine Spiellogik
- UI-State wird vollständig aus dem persistierten Zustand abgeleitet

---

**1.4 Kein separater Session-/Command-State**

- Es existieren keine Pending-States außerhalb des Domain-Zustands
- Alle Aktionen verändern direkt den persistierten Zustand

---

**2. Zeitmodell**

**2.1 Spielerphase**

- Aktionen werden sofort angewendet und gespeichert
- UI wird direkt neu berechnet

---

**2.2 Tick (Rundenwechsel)**

Der Tick ist ein normaler Domain-Aufruf:

1. Normalisierung
2. Simulation
3. Persistenz
4. UI-Projektion

---

**3. Domänenmodell**

**3.1 GameState (Aggregate Root)**

**Persistierte Ressourcen:**

- Population
- ConsumerGoods
- Industry

**Spielfeld:**

- Grid (2D-Struktur fester Größe)

---

**3.2 Grid**

- Zweidimensionales Array fester Größe (z. B. 10×10)
- Jede Zelle enthält:

- kein Gebäude oder
- genau ein Gebäude

**Eigenschaften:**

- Position ergibt sich ausschließlich aus dem Grid
- Gebäude kennen keine eigene Position

---

**3.3 Building**

Persistentes Objekt im Grid.

**Eigenschaften:**

- BuildingType
- Rundenzustand:

- Normal
- Neu gebaut (aktuelle Runde)

---

**3.4 BuildingType (Definition)**

Statisch definiert:

- Baukosten (Industry)
- Populationskosten
- Produktionswerte
- ggf. Housing-Beitrag

Nicht Teil des GameState.

---

**4. Gebäudetypen (V1)**

**Base (Startgebäude)**

- +100 ConsumerGoods / Runde
- +200 Industry / Runde
- +150 Housing
- einzigartig

---

**Consumer**

- Baukosten:

- 25 Population
- 15 Industry

- Produktion:

- +40 ConsumerGoods

---

**Industry**

- Baukosten:

- 40 Population
- 70 Industry

- Produktion:

- +50 Industry
- +10 ConsumerGoods

---

**Housing**

- Baukosten:

- 50 Population
- 60 Industry

- Effekt:

- +20 Housing

---

**5. Ressourcenmodell**

**5.1 Persistiert**

- Population
- ConsumerGoods
- Industry

---

**5.2 Abgeleitet**

**Housing**

Summe aller Housing-Beiträge aller Gebäude

**Gebundene Population**

Summe der Populationskosten aller Gebäude mit Zustand „neu gebaut“

**Freie Population**

Population - gebundene Population

---

**6. Bau- und Validierungsregeln**

Ein Gebäude darf gebaut werden, wenn:

- Grid-Zelle leer ist
- freie Population ≥ Populationskosten
- Industry ≥ Baukosten

---

**Beim Bau:**

- Gebäude wird im Grid platziert
- Zustand = „neu gebaut“
- Industry wird sofort reduziert

---

**7. Tick-Logik (final)**
Pipeline, deterministische Reihenfolge

**Schritt 1 – Normalisierung**

- alle Gebäude: Status „neu gebaut“ → „normal“ setzen
- Dadurch Freigabe der durch Bau gebundenen Population

---

**Schritt 2 – Produktion**

- alle Gebäude produzieren Ressourcen

---

**Schritt 3 – Verbrauch**

ConsumerGoods -= Population

---

**Schritt 4 – Versorgungsgrad**

Versorgungsgrad = ConsumerGoods / Population

---

**Schritt 5 – Population ändern**

**Wachstum (Versorgung > 100%)**

x = Versorgungsgrad - 1

GrowthRate = 0.0025 * x^1.2

PopulationChange = Population * GrowthRate

---

**Verlust (Versorgung < 100%)**

x = Versorgungsgrad - 1

LossRate = 0.005 * |x|

PopulationChange = - Population * LossRate

---

**Schritt 6 – Housing-Cap**

Population = min(Population + PopulationChange, Housing)

---

**Schritt 7 – Persistenz + UI**

- Zustand speichern
- UI-State daraus ableiten

---

**8. Invarianten**

- Pro Grid-Zelle max. ein Gebäude
- Gebundene Population ≤ Population
- Industry ≥ 0
- Alle nicht persistierten Werte sind deterministisch ableitbar
- Kein Zustand existiert außerhalb Persistenz + Ableitung

---

**9. Architektur-Zuordnung**

**Entity**

- enthält nur lokale Daten
- keine komplexe Logik

---

**Domain Services**

- Tick-Simulation
- Produktionsberechnung
- Populationsberechnung
- Bauvalidierung
- Bauausführung

---

**Application Layer**

- Orchestrierung:
- Load → Domain → Save
- UI-Projektion

---

**10. Persistenzmodell**

- relational (3NF)
- GameState als Aggregate Root
- Grid referenziert Buildings

---

**11. Vereinfachungen (V1)**

Nicht enthalten:

- Bauzeiten über mehrere Runden
- verzögerte Aktivierung
- komplexe Produktionsketten
- Multiplayer

---

**12. Startzustand**

- Population: 100
- ConsumerGoods: 0
- Industry: 200
- Base vorhanden
- Housing ergibt sich aus Base: 150

---

**Ergebnis**

Das Datenmodell ist vollständig definiert und implementierbar.