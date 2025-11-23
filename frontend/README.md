# Standort-Scoring Tool - Frontend

Modernes Next.js Frontend für das Standort-Scoring Tool.

## Features

- 🎨 Schönes, minimalistisches Design mit Schwarz/Weiß und hellblauen Akzenten
- 📊 Zwei Modi: Manuelle Eingabe oder CSV/Excel-Upload
- 📈 Interaktive Score-Visualisierung mit Fortschrittsbalken
- 🔄 Sortierbare Ergebnistabelle
- 📱 Responsive Design für alle Geräte

## Installation

1. Installieren Sie die Abhängigkeiten:

```bash
npm install
```

2. Stellen Sie sicher, dass das Backend läuft (siehe Hauptverzeichnis README)

## Entwicklung

Starten Sie den Entwicklungsserver:

```bash
npm run dev
```

Die Anwendung läuft unter: `http://localhost:3000`

## Produktion

Erstellen Sie einen Production Build:

```bash
npm run build
npm start
```

## Verwendung

### Manuelle Eingabe

1. Wählen Sie den Tab "Manuelle Eingabe"
2. Geben Sie einen Standortnamen ein
3. Stellen Sie die Faktoren mit den Schiebereglern ein (0-10)
4. Klicken Sie auf "Score berechnen"
5. Sehen Sie sich die Ergebnisse an

### Datei-Upload

1. Wählen Sie den Tab "Datei Upload"
2. Ziehen Sie eine CSV/Excel-Datei in den Upload-Bereich oder klicken Sie, um eine auszuwählen
3. Klicken Sie auf "Scores berechnen"
4. Sehen Sie sich die Ergebnisse für alle Standorte an

## Technologie-Stack

- **Framework**: Next.js 16 mit App Router
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)

## Struktur

```
frontend/
├── app/
│   ├── page.tsx          # Hauptseite mit Mode-Toggle
│   ├── layout.tsx        # Root Layout
│   └── globals.css       # Globale Styles
├── components/
│   ├── ManualInput.tsx   # Manuelle Eingabe-Formular
│   ├── FileUpload.tsx    # Datei-Upload Component
│   └── ScoreDisplay.tsx  # Ergebnis-Tabelle
└── package.json
```
