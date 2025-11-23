# Excel-Format Spezifikation für Standort-Scoring

## 📋 Übersicht

Die Excel-Datei muss **separate Sheets für jeden Produkttyp** enthalten:
- Sheet 1: **PV** (Photovoltaik)
- Sheet 2: **Storage** (Energiespeicher)
- Sheet 3: **Charging** (Ladeinfrastruktur)

Jedes Sheet wird unabhängig verarbeitet und nach Score sortiert zurückgegeben.

---

## 🌟 Sheet 1: PV (Photovoltaik)

### Erforderliche Spalten

| Spaltenname | Typ | Pflicht | Beschreibung | Einheit | Beispiel | Bereich |
|-------------|-----|---------|--------------|---------|----------|---------|
| `location_id` | Integer | Ja | Eindeutige Standort-ID | - | 1 | 1-999999 |
| `location_name` | Text | Ja | Name des Standorts | - | "Bürogebäude München" | - |
| `product` | Text | Ja | Muss "pv" sein | - | pv | pv |
| `roof_area_sqm` | Float | Ja | Verfügbare Dachfläche | m² | 450 | 50-5000 |
| `solar_irradiation` | Float | Ja | Jährliche Sonneneinstrahlung | kWh/m²/Jahr | 1150 | 800-1300 |
| `building_age_years` | Integer | Ja | Alter des Gebäudes | Jahre | 12 | 0-100 |
| `roof_orientation_degrees` | Float | Ja | Dachausrichtung (0=Nord, 180=Süd) | Grad | 180 | 0-360 |
| `roof_tilt_degrees` | Float | Ja | Dachneigung | Grad | 32 | 0-90 |
| `electricity_price_eur` | Float | Ja | Lokaler Strompreis | €/kWh | 0.38 | 0.20-0.50 |
| `competitors_nearby` | Integer | Ja | Anzahl Wettbewerber | Anzahl | 2 | 0-20 |

### Optionale Spalten (für Ihre Information)

| Spaltenname | Typ | Beschreibung | Beispiel |
|-------------|-----|--------------|----------|
| `address` | Text | Vollständige Adresse | "Maximilianstr. 1, 80539 München" |
| `region` | Text | Region/Bundesland | "Bayern" |
| `postal_code` | Text | Postleitzahl | "80539" |
| `lat` | Float | Breitengrad | 48.1351 |
| `lng` | Float | Längengrad | 11.5820 |
| `notes` | Text | Notizen | "Prüfung Q2 2024" |

### Beispiel-Daten (PV Sheet)

```
location_id | location_name              | product | roof_area_sqm | solar_irradiation | building_age_years | roof_orientation_degrees | roof_tilt_degrees | electricity_price_eur | competitors_nearby | address                        | region
1           | Bürogebäude München        | pv      | 450           | 1150              | 12                 | 180                      | 32                | 0.38                  | 2                  | Maximilianstr. 1, München      | Bayern
2           | Lagerhalle Berlin          | pv      | 2500          | 980               | 5                  | 170                      | 25                | 0.35                  | 1                  | Industriestr. 42, Berlin       | Berlin
3           | Wohngebäude Hamburg        | pv      | 180           | 920               | 35                 | 190                      | 40                | 0.42                  | 5                  | Elbchaussee 123, Hamburg       | Hamburg
```

### Optimale Werte für hohen Score (PV)

- **Dachfläche**: > 500 m² (größer = besser)
- **Sonneneinstrahlung**: > 1100 kWh/m²/Jahr (höher = besser)
- **Gebäudealter**: < 20 Jahre (jünger = besser)
- **Dachausrichtung**: 170-190° (Süd ist optimal bei 180°)
- **Dachneigung**: 25-40° (optimal)
- **Strompreis**: > 0.35 €/kWh (höher = mehr Einsparung)
- **Wettbewerber**: < 3 (weniger = besser)

---

## 🔋 Sheet 2: Storage (Energiespeicher)

### Erforderliche Spalten

| Spaltenname | Typ | Pflicht | Beschreibung | Einheit | Beispiel | Bereich |
|-------------|-----|---------|--------------|---------|----------|---------|
| `location_id` | Integer | Ja | Eindeutige Standort-ID | - | 10 | 1-999999 |
| `location_name` | Text | Ja | Name des Standorts | - | "Krankenhaus Frankfurt" | - |
| `product` | Text | Ja | Muss "storage" sein | - | storage | storage |
| `existing_pv_kwp` | Float | Ja | Installierte PV-Leistung | kWp | 75 | 0-500 |
| `annual_consumption_kwh` | Float | Ja | Jährlicher Stromverbrauch | kWh/Jahr | 120000 | 1000-500000 |
| `peak_load_kw` | Float | Ja | Maximale Spitzenlast | kW | 180 | 10-500 |
| `grid_connection_kw` | Float | Ja | Netzanschlusskapazität | kW | 200 | 10-500 |
| `electricity_price_eur` | Float | Ja | Lokaler Strompreis | €/kWh | 0.35 | 0.20-0.50 |
| `power_outages_per_year` | Integer | Ja | Stromausfälle pro Jahr | Anzahl | 1 | 0-50 |
| `competitors_nearby` | Integer | Ja | Anzahl Wettbewerber | Anzahl | 3 | 0-20 |

### Beispiel-Daten (Storage Sheet)

```
location_id | location_name              | product | existing_pv_kwp | annual_consumption_kwh | peak_load_kw | grid_connection_kw | electricity_price_eur | power_outages_per_year | competitors_nearby | address
10          | Krankenhaus Frankfurt      | storage | 200             | 450000                 | 350          | 400                | 0.35                  | 5                      | 1                  | Universitätsstr. 1, Frankfurt
11          | Rechenzentrum Köln         | storage | 150             | 380000                 | 320          | 350                | 0.32                  | 8                      | 2                  | Mediapark 5, Köln
12          | Produktionshalle Stuttgart | storage | 100             | 280000                 | 250          | 300                | 0.33                  | 2                      | 1                  | Industriestr. 88, Stuttgart
```

### Optimale Werte für hohen Score (Storage)

- **Vorhandene PV**: > 50 kWp (mehr = besser)
- **Jahresverbrauch**: > 100000 kWh/Jahr (höher = besser)
- **Spitzenlast**: > 150 kW (höher = besser)
- **Netzanschluss**: > Spitzenlast (ausreichend dimensioniert)
- **Strompreis**: > 0.35 €/kWh (höher = mehr Einsparung)
- **Stromausfälle**: > 3/Jahr (mehr = höherer USV-Bedarf)
- **Wettbewerber**: < 3 (weniger = besser)

---

## 🔌 Sheet 3: Charging (Ladeinfrastruktur)

### Erforderliche Spalten

| Spaltenname | Typ | Pflicht | Beschreibung | Einheit | Beispiel | Bereich |
|-------------|-----|---------|--------------|---------|----------|---------|
| `location_id` | Integer | Ja | Eindeutige Standort-ID | - | 20 | 1-999999 |
| `location_name` | Text | Ja | Name des Standorts | - | "Einkaufszentrum Köln" | - |
| `product` | Text | Ja | Muss "charging" sein | - | charging | charging |
| `parking_spaces` | Integer | Ja | Anzahl Parkplätze | Stück | 80 | 5-500 |
| `daily_traffic_volume` | Integer | Ja | Tägliches Verkehrsaufkommen | Fahrzeuge/Tag | 3500 | 50-10000 |
| `avg_parking_duration_min` | Integer | Ja | Durchschnittliche Parkdauer | Minuten | 180 | 15-480 |
| `grid_connection_kw` | Float | Ja | Netzanschlusskapazität | kW | 150 | 20-1000 |
| `nearest_charger_km` | Float | Ja | Entfernung nächste Ladestation | km | 3.5 | 0-50 |
| `ev_density_percent` | Float | Ja | E-Auto-Dichte in Region | % | 15 | 0-30 |
| `competitors_nearby` | Integer | Ja | Anzahl Wettbewerber | Anzahl | 2 | 0-20 |

### Beispiel-Daten (Charging Sheet)

```
location_id | location_name              | product  | parking_spaces | daily_traffic_volume | avg_parking_duration_min | grid_connection_kw | nearest_charger_km | ev_density_percent | competitors_nearby | address
20          | Einkaufszentrum Köln       | charging | 80             | 3500                 | 180                      | 150                | 3.5                | 15                 | 2                  | Shoppingstr. 1, Köln
21          | Autobahnraststätte A9      | charging | 150            | 8000                 | 45                       | 350                | 15                 | 8                  | 1                  | A9 Rastplatz Nord
22          | Parkhaus Stadtzentrum      | charging | 200            | 2500                 | 240                      | 200                | 1.2                | 18                 | 4                  | Zentrumsplatz 5, München
23          | Firmenparkplatz SAP        | charging | 300            | 1200                 | 480                      | 250                | 2.8                | 22                 | 1                  | SAP-Allee 1, Walldorf
```

### Optimale Werte für hohen Score (Charging)

- **Parkplätze**: > 50 (mehr = mehr Lademöglichkeiten)
- **Verkehrsaufkommen**: > 1500 Fz/Tag (mehr Potenzial)
- **Parkdauer**: > 90 Min (mehr Ladezeit)
- **Netzanschluss**: > 150 kW (ausreichend für mehrere Schnelllader)
- **Nächste Ladestation**: > 3 km (weniger Konkurrenz)
- **E-Auto-Dichte**: > 12% (höhere Nachfrage)
- **Wettbewerber**: < 3 (weniger = besser)

---

## 📊 Upload-Prozess & Rückgabe

### 1. Upload
- **Eine Excel-Datei** mit allen drei Sheets
- System erkennt automatisch die Sheets anhand des Sheet-Namens
- Sheets können in beliebiger Reihenfolge sein
- Sheets können auch fehlen (z.B. nur PV-Sheet hochladen)

### 2. Verarbeitung
- Jedes Sheet wird separat verarbeitet
- Für jede Zeile in jedem Sheet:
  - Score wird berechnet (0-100)
  - Ergebnis wird der Zeile zugeordnet

### 3. Rückgabe
Die API gibt eine Liste zurück, **sortiert nach Score (höchster zuerst)**:

```json
[
  {
    "location_id": 2,
    "location_name": "Lagerhalle Berlin",
    "product": "pv",
    "score": 92.5,
    "factors_used": {
      "roof_area_sqm": 2500,
      "solar_irradiation": 980,
      ...
    }
  },
  {
    "location_id": 1,
    "location_name": "Bürogebäude München",
    "product": "pv",
    "score": 87.3,
    "factors_used": { ... }
  },
  {
    "location_id": 10,
    "location_name": "Krankenhaus Frankfurt",
    "product": "storage",
    "score": 85.1,
    "factors_used": { ... }
  },
  ...
]
```

### Frontend-Darstellung
Die Ergebnisse werden in einer **sortierbaren Tabelle** angezeigt:
- Spalte 1: Standortname
- Spalte 2: Produkt (mit Icon ☀️🔋🔌)
- Spalte 3: Score mit farbcodiertem Badge und Fortschrittsbalken

User kann sortieren nach:
- Standortname (alphabetisch)
- Produkt (pv → storage → charging)
- Score (höchster → niedrigster oder umgekehrt)

---

## ✅ Validierung

### Das System prüft:
1. ✅ Spalte `product` existiert und hat gültige Werte (`pv`, `storage`, `charging`)
2. ✅ Alle erforderlichen Spalten für das jeweilige Produkt sind vorhanden
3. ✅ Werte sind im gültigen Bereich (min-max)
4. ✅ Datentypen sind korrekt (Integer, Float, Text)

### Fehlerbehandlung:
- Fehlende Spalten → **400 Error** mit Liste der fehlenden Spalten
- Ungültige Werte → Werden automatisch auf min/max begrenzt
- Leere Zeilen → Werden übersprungen
- Ungültiger `product`-Wert → Zeile wird übersprungen

---

## 📁 Dateistruktur Übersicht

```
Standort_Scoring_Template.xlsx
│
├── Sheet: "PV"
│   ├── Spalten: location_id, location_name, product, roof_area_sqm, ...
│   └── Beispielzeilen: 3-5 Standorte
│
├── Sheet: "Storage"
│   ├── Spalten: location_id, location_name, product, existing_pv_kwp, ...
│   └── Beispielzeilen: 3-5 Standorte
│
└── Sheet: "Charging"
    ├── Spalten: location_id, location_name, product, parking_spaces, ...
    └── Beispielzeilen: 3-5 Standorte
```

---

## 💡 Best Practices

### Location IDs
- Verwenden Sie fortlaufende IDs: 1, 2, 3, ...
- Oder kategorisierte IDs:
  - PV: 100-199
  - Storage: 200-299
  - Charging: 300-399

### Standortnamen
- Aussagekräftig und eindeutig
- Inkludieren Sie Stadt/Region
- Beispiel: "Bürogebäude München Zentrum" statt "Gebäude 1"

### Datenqualität
- Realistische Werte verwenden
- Bei Unsicherheit: Durchschnittswerte für Region recherchieren
- Leere Zellen vermeiden (alle Pflichtfelder ausfüllen)

### Performance
- Bis zu **1000 Zeilen pro Sheet** werden unterstützt
- Größere Dateien können langsam werden
- Bei sehr vielen Standorten: Aufteilen in mehrere Dateien

---

## 🔗 Nützliche Referenzen

### Deutsche Durchschnittswerte

**Sonneneinstrahlung (kWh/m²/Jahr):**
- Norddeutschland: 900-1000
- Mitteldeutschland: 1000-1100
- Süddeutschland: 1100-1300

**Strompreise (€/kWh, Stand 2024):**
- Privathaushalt: 0.35-0.45
- Gewerbe: 0.25-0.35
- Industrie: 0.20-0.30

**E-Auto-Dichte (%, Stand 2024):**
- Deutschland Durchschnitt: 3-5%
- Großstädte (München, Berlin, Hamburg): 8-15%
- Ländliche Gebiete: 1-3%

**Dachausrichtung:**
- 0° = Nord
- 90° = Ost
- 180° = Süd (optimal!)
- 270° = West

**Optimale Dachneigung:**
- Deutschland: 25-40° (je nach Breitengrad)
- München (Süd): 30-35°
- Hamburg (Nord): 35-40°

---

## 📞 Support

Bei Fragen zur Excel-Struktur:
1. Laden Sie das Template herunter: http://localhost:3000
2. Verwenden Sie die Beispieldaten als Referenz
3. Überprüfen Sie die Spaltennamen (case-sensitive!)
4. Stellen Sie sicher, dass `product` korrekt gesetzt ist

**Tipp:** Beginnen Sie mit dem Template und passen Sie die Beispieldaten an!


