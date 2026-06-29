# Room Booker

Platz-Buchungssystem für Büroräume im KiWi Tower Kiel.

## Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 18 oder neuer)

## Einrichtung (einmalig)

```bash
npm run setup
```

Dieser Befehl installiert alle Abhängigkeiten und richtet die Datenbank ein.

## Starten

```bash
npm run dev
```

Danach ist die App unter **http://localhost:5173** erreichbar.

## Projektstruktur

```
room-booker/
  frontend/   # React + Vite (läuft auf Port 5173)
  backend/    # Express + Prisma + SQLite (läuft auf Port 3001)
```
