# V1 – Simulation Rules (MVP)

---

## 1. Einordnung

Dieses Dokument beschreibt die konkrete Ausprägung der Simulation für Version 1.

Es definiert bewusst einen stark reduzierten Funktionsumfang.

---

## 2. Simulationsraum

- Genau 1 Planet  
- Grid: 10x10  
- Jedes Feld enthält maximal 1 Gebäude  
- Keine Geländetypen oder Boni  

---

## 3. Gebäude

Typen:

- Base (Startgebäude)  
- Housing  
- Consumer  
- Industry  

---

## 4. Ressourcen

- Population  
- ConsumerGoods  
- Industry  
- Housing  

---

## 5. Startzustand

Population = 100  
ConsumerGoods = 0  
Industry = 200  
Housing = 150  

Base vorhanden.

---

## 6. Basisproduktion

Pro Runde:

ConsumerGoods: +100  
Industry: +200  
Housing: +150  

---

## 7. Bausystem

Voraussetzungen:

- ausreichende Industry  
- ausreichende freie Population  

Beim Bau:

- Industry wird sofort verbraucht  
- Population wird für die Runde gebunden  
- Gebäude wird platziert (inaktiv)  

Beim Rundenwechsel:

- Gebäude wird aktiv  
- Population wird wieder frei  

---

## 8. Tick-Reihenfolge

1. Gebäude fertigstellen  
2. Produktion berechnen  
3. Verbrauch berechnen  
4. Bevölkerungsänderung anwenden  
5. Housing-Begrenzung anwenden  

---

## 9. Verbrauch

ConsumerGoods -= Population  
Minimum = 0  

Verbrauch basiert auf der Population der vorherigen Runde.

---

## 10. Bevölkerungslogik

Versorgung = ConsumerGoods / Population  

- > 1 → Wachstum  
- = 1 → Stagnation  
- < 1 → Verlust  

Verlust ist möglich, tritt in V1 praktisch nicht auf.

---

## 11. Gebäudewerte

Housing:

Cost: 60 Industry  
Housing: +20  

Consumer:

Cost: 15 Industry  
Production: +30 ConsumerGoods  

Industry:

Cost: 70 Industry  
Production:  
+50 Industry  
+10 ConsumerGoods  

---

## 12. UI (minimal)

Anzeige:

- Population  
- ConsumerGoods  
- Industry  
- Housing  

Aktionen:

- Gebäude platzieren  
- Runde beenden  

---

## 13. Endzustände

Erfolg:
- Grid vollständig belegt  

Deadlock:
- keine sinnvollen Aktionen mehr möglich  

---

## 14. Technische Eigenschaften

- deterministisch  
- keine Zufallselemente  
- vollständige State-Berechnung pro Runde  

---

## 15. Nicht im Scope

- mehrere Planeten  
- Kampf  
- Forschung  
- Wartung  
- Effizienz  
- Arbeitszuweisung  
- Gebäudeabriss  

---