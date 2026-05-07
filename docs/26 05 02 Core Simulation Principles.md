# Core Simulation Principles

---

## 1. Ziel

Definition der grundlegenden Prinzipien der Simulation, unabhängig von konkreten Spielversionen.

Diese Prinzipien bilden das stabile Fundament des Systems und gelten über Versionen hinweg.

---

## 2. Grundstruktur der Simulation

Die Simulation basiert auf einem deterministischen, rundenbasierten Modell.

Grundprinzip:

State → Simulation → neuer State

Jeder Zustand ergibt sich eindeutig aus dem vorherigen Zustand.

---

## 3. Tick-/Rundenmodell

Das System arbeitet in diskreten Runden.

Ablauf:

1. Spieleraktionen werden gesammelt  
2. Simulation wird ausgeführt  
3. Neuer Zustand entsteht  
4. UI wird aktualisiert  

Dieser Ablauf ist strikt wiederholbar.

---

## 4. Determinismus

Die Simulation ist vollständig deterministisch:

- keine Zufallselemente  
- keine externen Einflüsse  
- gleiche Eingaben → gleiche Ergebnisse  

---

## 5. Zentrale State-Transformation

Die gesamte Spiellogik lässt sich auf eine zentrale Transformation reduzieren:

nextState = simulate(currentState)

Eigenschaften:

- vollständiger State wird verarbeitet  
- keine Teilupdates außerhalb dieser Transformation  
- klare, reproduzierbare Zustandsänderung  

---

## 6. Ressourcenmodell (abstrakt)

Das System basiert auf Ressourcen, die:

- produziert werden  
- verbraucht werden  
- Wachstum ermöglichen oder begrenzen  

Ressourcen interagieren über einfache, nachvollziehbare Regeln.

---

## 7. Produktions- und Verbrauchslogik

Allgemeines Prinzip:

- Systeme erzeugen Ressourcen  
- andere Systeme verbrauchen sie  
- daraus entsteht ein Kreislauf  

Dieser Kreislauf bildet den Kern der Simulation.

---

## 8. Wachstumsmodell

Wachstum basiert auf Versorgung:

- Überschuss → Wachstum  
- Gleichgewicht → Stagnation  
- Mangel → Verlust  

Die konkrete Formel ist variabel, das Prinzip bleibt stabil.

---

## 9. Zustandskonsistenz

Der State muss jederzeit gültig sein:

- keine negativen Ressourcen  
- klare Ober- und Untergrenzen  
- deterministische Übergänge  

---

## 10. Backend-Zentrierung

Alle Spiellogik liegt im Backend:

- keine Logik im UI  
- keine verteilte Berechnung  
- zentrale Regeldefinition  

---

## 11. Erweiterbarkeit

Das System ist darauf ausgelegt, erweitert zu werden:

- zusätzliche Ressourcen  
- zusätzliche Systeme  
- komplexere Abhängigkeiten  

ohne die Grundprinzipien zu verändern.

---