# Kapitel 2 – Softwarearchitektur (Backend)

---

## 2.0 Ist-Stand (Nov. 2026)

Die Kapitel 2.1–2.11 sind der ursprüngliche Entwurf für ein C#/.NET-Backend mit Entity Framework. Dieses Backend wurde gebaut und am 29.05.2026 nach TypeScript portiert (Commit `e542e62`); der C#-Code existiert nicht mehr. Die Prinzipien (Intents rein, UI-State raus, deterministische Simulation, GameState als Aggregate) gelten weiter, die EF-spezifischen Teile nicht.

**Zwei Betriebsarten, eine Engine**

| | Singleplayer (aktiv) | Multiplayer (vorbereitet, nicht aktiv) |
|---|---|---|
| Spiellogik | `@aethon/engine` läuft im Browser | dieselbe `@aethon/engine` läuft im Backend |
| Spielstand | `localStorage` im Browser | PostgreSQL (Neon), Tabelle `games`, GameState als `jsonb` |
| Zugriff im Frontend | `LocalGameGateway` | `RemoteGameGateway` (noch nicht gebaut) über `@aethon/api-client` |
| Backend | keins | Hono auf Bun (`src/backend/app`), Drizzle (`src/backend/persistence`), Railway |

Das Frontend spricht nur gegen das Interface `GameGateway` (`load`, `build`, `endRound`, `setResearchFocus`, `reset`). Beim Wechsel auf Multiplayer wird nur die Implementierung getauscht: Browser-Speicher raus, API-Aufrufe ans Backend rein. Die Typsicherheit kommt über Hono-RPC (`hc<AppType>`), nicht über OpenAPI.

**Architekturentscheidung: kein ECS**

Ein Entity Component System wurde geprüft und verworfen. Gründe: Performancevorteile spielen bei einem rundenbasierten, deterministischen Spiel keine Rolle, und die Spielobjekte unterscheiden sich vor allem in Datenwerten, nicht in frei kombinierbaren Fähigkeiten. Stattdessen: datengetriebene Typdefinitionen (z. B. `BUILDING_DEFINITIONS` in `src/shared/engine`) und leichte Komposition über Interfaces für querschnittliche Fähigkeiten (z. B. ein späteres `Combatant` für Kampf).

**Abweichungen vom Entwurf unten**

- Statt Entities mit Change Tracking: reine Funktionen (`placeBuilding`, `simulateRound`, `project`), die einen GameState nehmen und einen neuen zurückgeben.
- Statt relationaler Abbildung (3NF): der ganze GameState als ein JSON-Dokument.
- Statt Controller/Application Services: Hono-Routen laden den State, rufen die Engine auf, speichern und liefern `project(state)` als UI-State.


---

## 2.1 Ziel dieses Kapitels

Dieses Kapitel beschreibt die technische Architektur des Backends für Version 1.

Es definiert:

- Schichtenmodell  
- Verantwortlichkeiten  
- Umgang mit dem GameState  
- Zusammenspiel von Domain, Persistenz und API  

Es beschreibt **keine konkrete Datenstruktur**, sondern ausschließlich konzeptionelle Regeln.

---

## 2.2 Technologie-Stack

Das Backend basierte im Entwurf auf (heute siehe 2.0):

- C# / .NET (ASP.NET)  
- Entity Framework (ORM)  
- relationale Datenbank  

Das System ist **request-basiert und zustandslos auf API-Ebene**, der Zustand liegt vollständig in der Datenbank.

---

## 2.3 Schichtenmodell

Das Backend folgt einem Vier-Schichten-Modell:

### 1. Presentation Layer (Web / Controller)

- Einstiegspunkt für alle Requests  
- Nimmt UI-Requests entgegen  
- Validiert Eingaben (formal, nicht fachlich)  
- Übergibt Aufrufe an Application Services  
- Gibt Ergebnisse zurück  

Enthält:
- keine Spiellogik  
- keinen State  
- keine Persistenzlogik  

---

### 2. Application Layer (Application Services)

- Orchestriert Anwendungsfälle  
- Lädt den GameState aus der Datenbank  
- Ruft Domain-Logik auf  
- Persistiert Änderungen  

Enthält:
- keine Spiellogik  
- keine Berechnungen  
- keine Spielregeln  

---

### 3. Domain Layer (Domain Services)

- Enthält übergreifende Spiellogik  
- Implementiert Regeln, die mehrere Entities betreffen  

Beispiele:
- Tick-/Simulationslogik  
- Bauvalidierung  
- Ressourcenverarbeitung  

**Definition:**
Domain Services arbeiten **immer auf mehreren Entities**.  
Logik, die nur eine einzelne Entity betrifft, gehört in die Entity selbst.

---

### 4. Domain + Persistence Layer (Entities)

Diese Schicht vereint:

- Domain-Daten  
- lokale Domain-Logik  
- Persistenz (Entity Framework)

Alle Klassen dieser Schicht sind:

- Entities  
- persistiert  
- Teil des GameState  

Entities enthalten:

- Zustand  
- lokale Logik, die keine anderen Entities benötigt  

---

## 2.4 GameState als zentrales Aggregate

Der gesamte Spielzustand wird durch ein zentrales Objekt repräsentiert:

**GameState**

Eigenschaften:

- ist eine Entity  
- ist Aggregate Root  
- wird vollständig persistiert  
- besteht aus weiteren Entities (Objektgraph)  

Der GameState enthält:

- alle relevanten Spielobjekte  
- alle Ressourcenwerte  
- den vollständigen Zustand der aktuellen Runde  

Alle enthaltenen Objekte:

- sind ebenfalls Entities  
- werden über Navigationseigenschaften referenziert  
- werden durch Entity Framework gemeinsam verwaltet  

---

## 2.5 Umgang mit Entities

### Grundprinzip

Das Backend arbeitet ausschließlich mit Entities.

- keine separaten Domain-Modelle  
- keine Kopien des Zustands  
- keine parallelen Objektstrukturen  

---

### Zugriffsmuster

Application Services und Domain Services:

- arbeiten mit Referenzen auf benötigte Entities  
- erhalten gezielt Teilbereiche des GameState  

Wichtig:

- alle übergebenen Objekte gehören zum selben geladenen GameState  
- alle Änderungen werden durch Entity Framework getrackt  

---

## 2.6 Persistenz und Change Tracking

Entity Framework wird vollständig genutzt:

- GameState wird geladen (inkl. Navigationen)  
- Änderungen werden an Entities durchgeführt  
- Change Tracking erkennt Modifikationen  
- SaveChanges() persistiert den gesamten Zustand  

Es erfolgt:

- kein manuelles Tracking  
- kein selektives Speichern einzelner Teilobjekte  

---

## 2.7 Backend-Loop

Jeder Anwendungsfall folgt dem gleichen Muster:

1. GameState aus der Datenbank laden  
2. Domain-Logik ausführen  
3. GameState speichern  
4. Antwort erzeugen  

Dieser Ablauf ist:

- deterministisch  
- vollständig zustandsbasiert  

---

## 2.8 API-Prinzip

Die API arbeitet strikt intent-basiert.

Es gibt zwei Arten von Kommunikation:

### 1. Spieler-Intents (vom UI zum Backend)

Das UI sendet ausschließlich Aktionen des Spielers:

- Spiel starten  
- Gebäude bauen (Position + Typ)  
- Runde beenden  

Diese Requests enthalten:

- keine Spiellogik  
- keinen State  
- nur die notwendige Eingabe  

---

### Spiel starten

Das Backend stellt eine Funktion bereit, die ein neues Spiel erzeugt:

- Legt einen neuen `GameState` in der Datenbank an  
- Befüllt den Startzustand vollständig (Ressourcen + Base-Gebäude)  
- Gibt die ID des neuen `GameState` zurück  

Der `GameState` ist von Anfang an vollständig persistiert.  

---

### 2. UI-State (vom Backend zum UI)

Das Backend liefert kein direktes Abbild des GameState, sondern ein speziell auf das UI zugeschnittenes Objekt:

**UI-State**

Eigenschaften:

- enthält alle für die Darstellung benötigten Daten  
- basiert auf dem GameState  
- ist angereichert mit berechneten Informationen  

Beispiele für zusätzliche Informationen:

- „Gebäude X ist aktuell baubar“  
- „Aktion möglich / nicht möglich“  
- UI-spezifische Aggregationen  

Diese Informationen werden:

- im Backend berechnet  
- nicht persistiert  
- pro Request neu erzeugt  

---

## 2.9 UI-State und Interaktion

Das UI:

- rendert ausschließlich den erhaltenen UI-State  
- enthält keine Spiellogik  
- trifft keine fachlichen Entscheidungen  

Das UI:

- sendet nur Spieler-Intents  
- erhält nach jeder Aktion einen neuen UI-State  

Wichtig:

- Der UI-State kann sich mehrfach innerhalb einer Runde ändern  
- Der GameState verändert sich nur bei definierten Backend-Operationen  

---

## 2.10 Verantwortlichkeiten im Überblick

| Schicht | Verantwortung |
|--------|--------------|
| Presentation | Request/Response |
| Application | Orchestrierung |
| Domain Services | übergreifende Spiellogik |
| Entities | Zustand + lokale Logik |

---

## 2.11 Leitprinzipien

1. Der komplette Spielzustand ist in Entities gespeichert  
2. Der GameState ist das zentrale Aggregate  
3. Alle Entities sind persistiert und Teil des GameState  
4. Entity Framework verwaltet Persistenz und Change Tracking  
5. Spiellogik existiert ausschließlich in Domain Services und Entities  
6. Domain Services enthalten nur übergreifende Logik  
7. Entities enthalten nur lokale Logik  
8. UI ist strikt passiv (Render + Input)  
9. Kommunikation erfolgt über Spieler-Intents und UI-State  
10. UI-State wird pro Request aus dem GameState abgeleitet  
11. Simulation ist deterministisch und zustandsbasiert  

---