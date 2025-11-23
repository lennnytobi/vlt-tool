# Quick Start Guide

## 🚀 So starten Sie die Anwendung:

### 1. Backend starten

Öffnen Sie ein Terminal und führen Sie aus:

```bash
cd C:\Users\tobia\Desktop\vlt-tool
uvicorn main:app --reload
```

Das Backend läuft dann unter: **http://localhost:8000**

### 2. Frontend starten

Öffnen Sie ein **neues** Terminal und führen Sie aus:

```bash
cd C:\Users\tobia\Desktop\vlt-tool\frontend
npm run dev
```

Das Frontend läuft dann unter: **http://localhost:3000**

### 3. Anwendung öffnen

Öffnen Sie in Ihrem Browser: **http://localhost:3000**

---

## ✨ Neue Features

### Verbessertes Design
- ✅ Professionelles, modernes UI mit React/Next.js
- ✅ Schöne Farbpalette: Schwarz/Weiß + hellblaue Akzente
- ✅ Kleinere, angemessene Icon-Größen
- ✅ Smooth Animationen und Übergänge

### Manuelle Eingabe
- ✅ **Beschreibungen für jeden Faktor** - Erklärt, was jeder Faktor bedeutet
- ✅ **Score Cards statt Tabelle** - Schöne Kartenansicht mit:
  - Großen Score-Zahlen
  - Farbcodierten Fortschrittsbalken
  - Visuellen Score-Breakdowns
  - Erfolgswahrscheinlichkeits-Labels

### Datei Upload
- ✅ **Template-Download** statt "erforderliches Format" Text
  - CSV-Template herunterladen
  - Excel-Template herunterladen
  - Bereits ausgefüllt mit Beispieldaten
  - Einfach anpassen und hochladen!
- ✅ Drag & Drop Unterstützung
- ✅ CSV und Excel Support (.csv, .xlsx, .xls)

### API-Erweiterungen
- ✅ **GET /template/csv** - Lädt CSV-Vorlage herunter
- ✅ **GET /template/excel** - Lädt Excel-Vorlage herunter
- ✅ **POST /score/manual** - Für manuelle Eingaben
- ✅ **POST /score/csv** - Für Datei-Uploads

---

## 🎯 Verwendung

### Manuelle Eingabe:
1. Klicken Sie auf "Manuelle Eingabe"
2. Geben Sie einen Standortnamen ein
3. Stellen Sie alle 6 Faktoren mit den Schiebereglern ein (0-10)
4. Klicken Sie auf "Score berechnen"
5. Sehen Sie die Ergebnisse in schönen Score-Karten

### Datei Upload:
1. Klicken Sie auf "Datei Upload"
2. Laden Sie eine Vorlage herunter (CSV oder Excel)
3. Füllen Sie die Vorlage mit Ihren Daten aus
4. Laden Sie die Datei hoch (Drag & Drop oder Auswahl)
5. Klicken Sie auf "Scores berechnen"
6. Sehen Sie alle Ergebnisse in einer sortierbaren Tabelle

---

## 🎨 Design-Highlights

- **Gradient-Buttons** - Moderne Farbverläufe für aktive Tabs
- **Score-Visualisierung** - Farbcodierte Badges und Balken
- **Responsive** - Funktioniert auf allen Bildschirmgrößen
- **Smooth Transitions** - Animierte Übergänge für bessere UX
- **Accessibility** - Fokus-Styles und semantisches HTML

Viel Erfolg! 🎉


