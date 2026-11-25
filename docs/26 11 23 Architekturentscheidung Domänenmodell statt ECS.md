# Architekturentscheidung: Domänenmodell statt Entity Component System

- **Status:** entschieden
- **Datum:** 23.11.2026
- **Thema:** Datenhaltung und Objektmodell. Lohnt sich ein Entity Component System (ECS)?

---

## 1. Entscheidung

**AETHON verwendet kein ECS.** Der Spielzustand bleibt ein Domänenmodell: ein `GameState` als Aggregat, der als zusammenhängender Objektgraph gehalten, berechnet und gespeichert wird.

| Fall | Lösung |
|---|---|
| Objekte unterscheiden sich in **Werten** (Gebäude, Tech-Stufen, später Raumschiffe) | datengetriebene Typdefinitionen: Typ = Datensatz in einer Tabelle, keine eigene Klasse |
| Verschiedene Objektarten teilen eine **Fähigkeit** (heute absehbar nur Kampf) | leichte Komposition: ein gemeinsamer Baustein, den mehrere Domänenobjekte besitzen |
| Vererbung | keine tiefen Hierarchien |

Die gute Idee von ECS wird übernommen (Fähigkeiten über Komposition statt über Vererbung), die ECS-Maschinerie selbst nicht.

---

## 2. Ausgangsfrage

Für Simulationsspiele wird oft eine Datenhaltung empfohlen, bei der zählt, welche **Fähigkeiten** ein Objekt hat, und nicht, was es in einer Vererbungshierarchie **ist**. Beispiel: Raumschiff und Fabrik verbrauchen Energie, nur das Raumschiff fliegt, Kampfjäger fliegen auch. Für „Fliegen" will man alle Objekte mit dieser Fähigkeit bekommen, ohne sich durch Klassenhierarchien zu kämpfen.

Das gesuchte Muster ist das **Entity Component System**:

| Baustein | Bedeutung |
|---|---|
| **Entity** | nur eine ID, das „Ding" (Raumschiff, Fabrik, Jäger) |
| **Component** | reines Datenpaket, frei kombinierbar (`EnergyConsumer`, `Flyable`, `Position`, `Producer`) |
| **System** | Logik, die über alle Entities mit bestimmten Components iteriert |

```
Raumschiff = Entity + EnergyConsumer + Flyable
Fabrik     = Entity + EnergyConsumer + Producer
Kampfjäger = Entity + Flyable

FlightSystem: für jede Entity mit Flyable → bewegen
EnergySystem: für jede Entity mit EnergyConsumer → Energie verbrauchen
```

ECS ist zugleich Architekturmuster und Datenhaltung (Components meist spaltenweise in flachen Arrays) und in Game-Engines verbreitet (Unity DOTS, Bevy, EnTT).

### Verwandte Muster

| Muster | Kernidee | Verhältnis zu ECS |
|---|---|---|
| **Composition over Inheritance / Component Pattern** | Objekte bleiben Objekte, bekommen Fähigkeiten aber über eingehängte Komponenten (Robert Nystrom, *Game Programming Patterns*) | die weichere Variante; ECS ist die radikale, datenzentrierte Zuspitzung |
| **Type Object** | Typen sind Daten, nicht Klassen (ebenfalls Nystrom) | löst Wertvariation ganz ohne ECS |
| **Data-Oriented Design** | Daten so anordnen, wie die CPU sie verarbeitet | oft mit ECS kombiniert, Fokus ist Performance |
| **Interface-/Trait-Polymorphie** | „Erfüllt es `Combatant`, kann es kämpfen." | deckt die Fähigkeit ab, nicht die Datenhaltung |

---

## 3. Kernkriterium: Variation in Daten oder in Fähigkeiten?

**Variation in Daten.** Gleiche Fähigkeit, andere Zahlen. Consumer und Industry produzieren beide etwas pro Runde, nur mit anderen Werten. Lösung: datengetriebene Typdefinitionen. Weder ECS noch Vererbung nötig.

**Variation in Fähigkeiten.** Unterschiedliche Objektarten teilen einzelne, frei kombinierbare Fähigkeiten. Erst hier beginnt ECS sich zu lohnen.

### Anwendung auf AETHON

| Objekt | Art der Variation | Lösung |
|---|---|---|
| Gebäude (Housing, Consumer, Industry, PowerPlant, Research, Base) | Werte | Eintrag in der Typtabelle |
| Tech-Stufen eines Gebäudes (T2–T5) | Werte, Freischaltung, Asset | ebenfalls Einträge in der Typtabelle |
| Raumschiffe (später) | Werte | eigene Typtabelle nach demselben Muster |
| Kampf: Raumschiff **und** Planet (später) | geteilte Fähigkeit über verschiedene Objektarten | leichte Komposition, siehe Abschnitt 5 |

Kampf ist damit die **einzige** absehbare Querschnittsfähigkeit. Raumschiff und Planet sind völlig verschiedene Dinge (das eine bewegt sich im Raum, das andere ist ortsfest und hat ein Oberflächen-Grid), teilen aber „kann schießen, hat Schilde, hat Panzerung". Eine einzelne geteilte Fähigkeit rechtfertigt kein ECS.

---

## 4. Wie es im Code umgesetzt ist

Die Wertvariation ist bereits datengetrieben gelöst:

- `src/shared/models/src/index.ts`: `BUILDING_TYPES` ist eine Liste von Typnamen, ein `Building` im `GameState` speichert nur Position und `type`. Der `GameState` ist ein schlichter Objektgraph (Ressourcen, `buildings[]`, Forschungsstand).
- `src/shared/engine/src/definitions.ts`: `BUILDING_DEFINITIONS` ordnet jedem Typ einen Datensatz `BuildingDefinition` zu (Baukosten, Produktion, Wartung, benötigte Forschungsstufe). Tech-Stufen sind eigene Zeilen derselben Tabelle (`IndustryT2` …), keine Unterklassen.
- `src/shared/engine/src/research-definitions.ts`: Forschungskosten ebenfalls als Daten.
- Die Spiellogik (`placeBuilding`, `simulateRound`, `project`) liest die Definitionen nach Typ nach und iteriert über den Objektgraphen. Typdefinitionen sind nicht Teil des `GameState` und werden nicht gespeichert.

Ein neues Gebäude oder eine neue Stufe ist damit eine neue Zeile in der Tabelle, keine neue Klasse und kein neues System. Raumschiffe folgen später demselben Muster.

---

## 5. Querschnittsfähigkeiten: Komposition im Kleinen

Für Kampf gibt es zwei Varianten innerhalb des Domänenmodells:

1. **Kampfwerte als gemeinsamer Baustein** (Wertobjekt), den sowohl Schiff als auch Planet als Feld besitzen:

   ```
   Ship
    └── combat: CombatStats (Schilde, Panzerung, Kampfstärke)

   Planet
    └── combat: CombatStats (Schilde, Panzerung, Kampfstärke)
   ```

2. **Gemeinsame Schnittstelle** (`Combatant`), die beide erfüllen.

Im heutigen TypeScript-Modell sind beide Wege leichtgewichtig, weil der Zustand aus reinen Datentypen besteht und die Logik in Funktionen der Engine liegt: ein gemeinsamer Typ als Feld oder ein strukturelles Interface, gegen das die Kampflogik geschrieben wird.

**Offener Punkt:** Welche der beiden Varianten genutzt wird, wird entschieden, wenn Militär und Kampf konkret ausgearbeitet werden.

---

## 6. Begründung gegen ECS

1. **Performance ist kein Thema.** Der Hauptvorteil von ECS ist cache-freundliches Iterieren über zehntausende Entities pro Frame. AETHON ist rundenbasiert und deterministisch, mit einem Planetengrid von wenigen hundert Feldern. Das ist irrelevant.
2. **ECS passt nicht zum Zustandsmodell.** Der `GameState` ist ein Aggregat, das als Ganzes von der Engine verarbeitet, im Browser gespeichert und im Mehrspielermodus als ein Dokument in der Datenbank abgelegt wird. Engine, Frontend und Backend teilen sich diese Typen. ECS will stattdessen flache Component-Arrays mit IDs. Beides zu mischen ist aufwendig und würde eine funktionierende Architektur gegen ein Paradigma tauschen, das sich bei dieser Projektgröße nicht auszahlt.
3. **Zu wenige Querschnittsfähigkeiten.** Mit Kampf gibt es nur eine Fähigkeit, die sich verschiedene Objektarten teilen.

*Hinweis:* Die Abwägung wurde ursprünglich gegen das damals geplante C#/Entity-Framework-Backend (Objektgraph mit Change Tracking, relationale Persistenz) geführt. Sie gilt unverändert für den heutigen TypeScript-Stack, siehe Abschnitt 2.0 in `26 05 02 SW-Architektur.md`.

---

## 7. Wann neu bewerten

Auslöser für ECS ist **nicht**: mehr Gebäude-, Stufen- oder Schiffstypen. Das bleibt Wertvariation.

Auslöser **ist**: viele unabhängige, frei kombinierbare Fähigkeiten, die gestapelt werden. Beispiel: Ein Schiff kann zusätzlich minen, tarnen, Fracht tragen und weiteres, und jede Kombination soll möglich sein. Dann explodiert die Kombinatorik, und ECS verdient sich seinen Aufwand.

Solange Fähigkeiten an wenigen, klar abgegrenzten Objektarten hängen: kein ECS.
