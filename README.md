# Standort-Scoring Tool

Ein modernes MVP mit FastAPI (Backend) und Next.js (Frontend) zur Berechnung der Erfolgswahrscheinlichkeit von PV-, Speicher- und Ladeinfrastruktur-Standorten.

## Features

- **Scoring-Engine**: Berechnet gewichtete Scores für drei Produkttypen:
  - PV (Photovoltaik) ☀️
  - Storage (Speicher) 🔋
  - Charging (Ladeinfrastruktur) 🔌
- **Zwei Modi**: 
  - **Manuelle Eingabe**: Faktoren mit Schiebereglern einstellen, inkl. Beschreibungen
  - **Datei-Upload**: CSV/Excel-Dateien hochladen (Drag & Drop)
- **Template-Download**: Vorgefertigte CSV/Excel-Vorlagen zum einfachen Ausfüllen
- **Modernes Frontend**: React/Next.js mit professionellem, minimalistischem Design
- **Schöne Visualisierung**: 
  - Score-Karten für manuelle Eingabe mit Farbverläufen
  - Sortierbare Tabelle für Upload-Ergebnisse
  - Farbcodierte Badges und Fortschrittsbalken

## Installation

### Backend

1. Erstellen Sie eine virtuelle Umgebung (empfohlen):
```bash
python -m venv venv
```

2. Aktivieren Sie die virtuelle Umgebung:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

3. Installieren Sie die Abhängigkeiten:
```bash
pip install -r requirements.txt
```

### Frontend

1. Navigieren Sie zum Frontend-Verzeichnis:
```bash
cd frontend
```

2. Installieren Sie die Node.js-Abhängigkeiten:
```bash
npm install
```

## Starten der Anwendung

### Backend starten

```bash
uvicorn main:app --reload
```

Das Backend läuft unter: `http://localhost:8000`
- **API-Dokumentation**: `http://localhost:8000/docs`

### Frontend starten

In einem neuen Terminal:

```bash
cd frontend
npm run dev
```

Das Frontend läuft unter: `http://localhost:3000`

**Öffnen Sie im Browser: `http://localhost:3000`**

## CSV-Format

Die CSV-Datei muss folgende Spalten enthalten:

**Erforderliche Spalten:**
- `location_id`: Eindeutige ID des Standorts
- `location_name`: Name des Standorts
- `factor_roof_area`: Dachfläche (0-10)
- `factor_solar_irradiation`: Sonneneinstrahlung (0-10)
- `factor_grid_capacity`: Netzkapazität (0-10)
- `factor_traffic_volume`: Verkehrsaufkommen (0-10)
- `factor_energy_price`: Energiepreis (0-10)
- `factor_competition_density`: Wettbewerbsdichte (0-10, wird invertiert)

**Optionale Spalten:**
- `address`, `region`, `lat`, `lng` (werden nicht für die Berechnung verwendet)

Eine Beispiel-Datei finden Sie in `sample_locations.csv`.

## Scoring-Logik

### Gewichtete Faktoren

Jedes Produkt verwendet unterschiedliche Gewichte für die Faktoren:

**PV:**
- Dachfläche: 30%
- Sonneneinstrahlung: 25%
- Netzkapazität: 10%
- Verkehrsaufkommen: 0%
- Energiepreis: 20%
- Wettbewerbsdichte: 15% (invertiert)

**Storage:**
- Dachfläche: 5%
- Sonneneinstrahlung: 10%
- Netzkapazität: 25%
- Verkehrsaufkommen: 0%
- Energiepreis: 30%
- Wettbewerbsdichte: 30% (invertiert)

**Charging:**
- Dachfläche: 0%
- Sonneneinstrahlung: 0%
- Netzkapazität: 30%
- Verkehrsaufkommen: 30%
- Energiepreis: 25%
- Wettbewerbsdichte: 15% (invertiert)

### Berechnung

1. Alle Faktoren werden von 0-10 auf 0-1 normiert
2. `competition_density` wird invertiert: `1 - (value/10)`
3. Jeder Faktor wird mit seinem Gewicht multipliziert
4. Die Summe wird auf 0-100 skaliert (Prozent)

## API-Verwendung

### POST /score/manual

Berechnet Scores für manuell eingegebene Faktoren.

**Request:**
```json
{
  "location_name": "Mein Standort",
  "roof_area": 8.5,
  "solar_irradiation": 7.2,
  "grid_capacity": 6.8,
  "traffic_volume": 9.1,
  "energy_price": 7.5,
  "competition_density": 3.2
}
```

**Response:**
```json
{
  "location_name": "Mein Standort",
  "scores": {
    "pv": 82.3,
    "storage": 61.5,
    "charging": 74.2
  }
}
```

### POST /score/csv

Lädt eine CSV- oder Excel-Datei hoch und berechnet Scores für alle Standorte.

**Request:**
- Content-Type: `multipart/form-data`
- Body: CSV- oder Excel-Datei als `file`
- Unterstützte Formate: `.csv`, `.xlsx`, `.xls`

**Response:**
```json
[
  {
    "location_id": 1,
    "location_name": "Parkhaus Innenstadt A",
    "scores": {
      "pv": 82.3,
      "storage": 61.5,
      "charging": 74.2
    }
  },
  ...
]
```

## Projektstruktur

```
vlt-tool/
├── backend/
│   ├── main.py                 # FastAPI-Anwendung mit Scoring-Logik
│   └── requirements.txt        # Python-Abhängigkeiten
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Hauptseite mit Mode-Toggle
│   │   ├── layout.tsx         # Root Layout
│   │   └── globals.css        # Globale Styles
│   ├── components/
│   │   ├── ManualInput.tsx    # Manuelle Eingabe
│   │   ├── FileUpload.tsx     # Datei-Upload
│   │   └── ScoreDisplay.tsx   # Ergebnis-Tabelle
│   └── package.json
├── sample_locations.csv        # Beispiel-CSV-Datei
└── README.md                   # Diese Datei
```

## Entwicklung

### Backend
Der Code ist strukturiert in:
- **Scoring-Funktionen**: `calculate_product_score()`, `normalize_factor()`, etc.
- **API-Endpunkte**: `POST /score/manual`, `POST /score/csv`
- **Pydantic Models**: Request/Response-Validierung

### Frontend
- **Next.js App Router**: Moderne React-Architektur
- **TypeScript**: Typsicherheit
- **Tailwind CSS**: Utility-First-Styling
- **Komponenten**: Wiederverwendbare React-Komponenten

## Lizenz

Dieses Projekt ist ein MVP für Demonstrationszwecke.


