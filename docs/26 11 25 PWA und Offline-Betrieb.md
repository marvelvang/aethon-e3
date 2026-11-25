# PWA und Offline-Betrieb

Aethon E3 wird als Progressive Web App (PWA) ausgeliefert. Ziel: Das Spiel lässt sich auf dem Handy wie eine App installieren, läuft im Singleplayer komplett offline und bekommt neue Versionen ohne App-Store.

Grundlage ist `vite-plugin-pwa` (Workbox `generateSW`). Speicherung und Betriebsarten beschreibt die [Softwarearchitektur](26%2005%2002%20SW-Architektur.md) (Abschnitt 2.0).

## Bausteine

| Baustein | Zweck |
|---|---|
| Web-App-Manifest | Name, Icons, `display: standalone`, Querformat, Theme-Farbe `#080812` |
| Service Worker | legt alle Build-Assets (JS, CSS, HTML, Bilder, Fonts) im Precache ab, dadurch Offline-Start |
| Install-Button (`PwaInstall`) | eigener Button „App installieren“, erscheint nur, wenn der Browser `beforeinstallprompt` auslöst (Chrome, Edge, Android) |
| Update-Hinweis (`PwaUpdate`) | Toast „Neue Version verfügbar“, Reload löst der Spieler aus |

Beide UI-Elemente folgen dem Glass-Design-System (`src/styles/tokens.css`).

## Entscheidungen

### Update per Hinweis statt automatisch

`registerType: 'prompt'` statt `autoUpdate`. Der Service Worker erkennt eine neue Version beim App-Start und zusätzlich stündlich im Hintergrund. Der Spieler bestätigt den Reload selbst.

**Begründung:** Eine laufende Spielsitzung wird nie ungefragt neu geladen. Ein Wechsel auf `autoUpdate` (stilles Neuladen beim Start) ist jederzeit möglich, wenn das gewünscht wird.

### Spielstand bleibt in `localStorage`, kein IndexedDB

**Begründung:**

- Workbox verwaltet die Cache API, also HTTP-Assets, nicht App-Daten. Das sind getrennte Schichten; die PWA ändert an der Speicherung des Spielstands nichts.
- `localStorage` verhält sich im installierten Standalone-Modus genauso wie im Browser-Tab.
- IndexedDB lohnt sich erst, wenn einer dieser Fälle eintritt: GameState über etwa 5 MB, mehrere Spielstände mit Abfragen, Binärdaten oder Zugriff des Service Workers auf den Spielstand. Dann wird die Entscheidung neu getroffen.

### PNG-Icons sind Pflicht

Chrome bietet die Installation nur an, wenn das Manifest PNG-Icons in 192 × 192 und 512 × 512 enthält (512 zusätzlich `maskable`). Dazu kommt ein `apple-touch-icon` mit 180 × 180. Die PNGs liegen unter `src/frontend/app/public/icons/` und werden aus `icon.svg` erzeugt. Ein Build-Schritt dafür existiert nicht: Bei einem neuen Icon müssen die PNGs neu generiert werden (z. B. mit `@vite-pwa/assets-generator`).

### iOS

Safari kennt kein `beforeinstallprompt`, der eigene Install-Button erscheint dort nicht. Installiert wird über „Teilen → Zum Home-Bildschirm“. Dafür setzt `index.html` die Apple-Meta-Tags (`apple-mobile-web-app-*`) und das `apple-touch-icon`.

### Pfade

Manifest-Icons, `scope` und `start_url` sind absolut auf `/` gesetzt, obwohl Vite mit `base: './'` baut. Das passt, solange die App im Root einer Domain liegt (Cloudflare Pages). Bei einem Deployment unter einem Unterpfad müssen diese Werte angepasst werden.
