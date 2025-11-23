# Quick Start Guide - Version 2.0

## 🎉 Was ist neu?

### ✨ Realistische Faktoren
Keine 0-10 Werte mehr! Jetzt mit echten Metriken:
- **PV**: m², kWh/m²/Jahr, Grad, €/kWh
- **Storage**: kWp, kWh/Jahr, kW
- **Charging**: Anzahl Parkplätze, Fahrzeuge/Tag, Minuten

### 🎯 Produktspezifische Eingabe
1. Wählen Sie **zuerst** das Produkt (PV, Storage, Charging)
2. Geben Sie **nur** die relevanten Faktoren für dieses Produkt ein
3. Sehen Sie einen fokussierten Score für Ihr gewähltes Produkt

### 📊 Intelligente Normalisierung
- **Higher is better**: Dachfläche, Sonneneinstrahlung
- **Lower is better**: Gebäudealter, Wettbewerber
- **Target value**: Dachausrichtung (180° = Süd)
- **Optimal range**: Dachneigung (25-40°)

---

## 🚀 Starten

### 1. Backend starten

```bash
cd C:\Users\tobia\Desktop\vlt-tool
uvicorn main:app --reload
```

Backend läuft unter: **http://localhost:8000**

### 2. Frontend starten

**Neues Terminal öffnen:**

```bash
cd C:\Users\tobia\Desktop\vlt-tool\frontend
npm run dev
```

Frontend läuft unter: **http://localhost:3000**

### 3. Anwendung öffnen

**http://localhost:3000**

---

## 🎯 Verwendung

### Manuelle Eingabe

1. **Produkt wählen**
   - Klicken Sie auf PV ☀️, Storage 🔋 oder Charging 🔌
   
2. **Standortname eingeben**
   - z.B. "Bürogebäude München"
   
3. **Faktoren eingeben**
   - Jeder Faktor zeigt:
     - ✅ Einheit (m², kWh, €, etc.)
     - ✅ Beschreibung
     - ✅ Gültiger Bereich (min-max)
   - Beispiel PV:
     - Dachfläche: `450` m²
     - Sonneneinstrahlung: `1150` kWh/m²/Jahr
     - Gebäudealter: `12` Jahre
     - Dachausrichtung: `180` Grad (Süd)
     - Dachneigung: `32` Grad
     - Strompreis: `0.38` €/kWh
     - Wettbewerber: `2` Anzahl

4. **Score berechnen**
   - Sehen Sie:
     - 📊 Großer Score (0-100)
     - 🎨 Farbcodierte Bewertung
     - 📈 Fortschrittsbalken
     - 💡 Interpretationstext

5. **Produkt wechseln**
   - Klicken Sie "Produkt wechseln" für anderes Produkt

### Datei-Upload

1. **Template herunterladen**
   - CSV oder Excel
   - Bereits mit Beispieldaten gefüllt!
   
2. **Template ausfüllen**
   - Jedes Produkt hat eigene Spalten
   - Verwenden Sie echte Metriken
   - Excel hat separate Sheets für jedes Produkt
   
3. **Datei hochladen**
   - Drag & Drop oder Auswahl
   - CSV und Excel (.xlsx, .xls) unterstützt
   
4. **Ergebnisse ansehen**
   - Sortierbare Tabelle
   - Nach Standort, Produkt oder Score sortieren

---

## 📋 Faktoren-Übersicht

### ☀️ PV (Photovoltaik)

| Faktor | Einheit | Beispiel | Bereich |
|--------|---------|----------|---------|
| Dachfläche | m² | 450 | 50-5000 |
| Sonneneinstrahlung | kWh/m²/Jahr | 1150 | 800-1300 |
| Gebäudealter | Jahre | 12 | 0-100 |
| Dachausrichtung | Grad | 180 (Süd) | 0-360 |
| Dachneigung | Grad | 32 | 0-90 |
| Strompreis | €/kWh | 0.38 | 0.20-0.50 |
| Wettbewerber | Anzahl | 2 | 0-20 |

**Optimal für PV:**
- Große Dachfläche (>500 m²)
- Hohe Sonneneinstrahlung (>1100 kWh/m²/Jahr)
- Neues Gebäude (<20 Jahre)
- Süd-Ausrichtung (170-190°)
- Optimale Neigung (25-40°)
- Hoher Strompreis (>0.35 €/kWh)
- Wenig Wettbewerb (<5)

### 🔋 Storage (Energiespeicher)

| Faktor | Einheit | Beispiel | Bereich |
|--------|---------|----------|---------|
| Vorhandene PV | kWp | 75 | 0-500 |
| Jahresverbrauch | kWh/Jahr | 120000 | 1000-500000 |
| Spitzenlast | kW | 180 | 10-500 |
| Netzanschluss | kW | 200 | 10-500 |
| Strompreis | €/kWh | 0.35 | 0.20-0.50 |
| Stromausfälle | Anzahl/Jahr | 1 | 0-50 |
| Wettbewerber | Anzahl | 3 | 0-20 |

**Optimal für Storage:**
- Große PV-Anlage vorhanden (>50 kWp)
- Hoher Verbrauch (>50000 kWh/Jahr)
- Hohe Spitzenlast (>100 kW)
- Ausreichend Netzanschluss (>Spitzenlast)
- Hoher Strompreis (>0.35 €/kWh)
- Häufige Ausfälle (>2/Jahr)
- Wenig Wettbewerb (<5)

### 🔌 Charging (Ladeinfrastruktur)

| Faktor | Einheit | Beispiel | Bereich |
|--------|---------|----------|---------|
| Parkplätze | Stück | 80 | 5-500 |
| Verkehrsaufkommen | Fz/Tag | 3500 | 50-10000 |
| Parkdauer | Minuten | 180 | 15-480 |
| Netzanschluss | kW | 150 | 20-1000 |
| Nächste Ladestation | km | 3.5 | 0-50 |
| E-Auto-Dichte | % | 15 | 0-30 |
| Wettbewerber | Anzahl | 2 | 0-20 |

**Optimal für Charging:**
- Viele Parkplätze (>50)
- Hohes Verkehrsaufkommen (>1000 Fz/Tag)
- Lange Parkdauer (>60 Min)
- Starker Netzanschluss (>100 kW)
- Nächste Station weit weg (>3 km)
- Hohe E-Auto-Dichte (>10%)
- Wenig Wettbewerb (<5)

---

## 🆕 API-Änderungen (v2.0)

### Neue Endpunkte

```http
GET /api/product-factors/pv
GET /api/product-factors/storage
GET /api/product-factors/charging
```

Liefert Faktordefinitionen mit min, max, optimal, weight, etc.

### Geänderter Request-Format

**POST /score/manual**

```json
{
  "location_name": "Bürogebäude München",
  "product": "pv",
  "factors": {
    "roof_area_sqm": 450,
    "solar_irradiation": 1150,
    "building_age_years": 12,
    "roof_orientation_degrees": 180,
    "roof_tilt_degrees": 32,
    "electricity_price_eur": 0.38,
    "competitors_nearby": 2
  }
}
```

**Response:**

```json
{
  "location_name": "Bürogebäude München",
  "product": "pv",
  "score": 87.3,
  "factors_used": {
    "roof_area_sqm": 450,
    ...
  }
}
```

---

## 💡 Tipps

### Realistische Werte finden

**Sonneneinstrahlung Deutschland:**
- Nord: ~900-1000 kWh/m²/Jahr
- Mitte: ~1000-1100 kWh/m²/Jahr
- Süd: ~1100-1300 kWh/m²/Jahr

**Strompreise Deutschland 2024:**
- Privat: ~0.35-0.45 €/kWh
- Gewerbe: ~0.25-0.35 €/kWh
- Industrie: ~0.20-0.30 €/kWh

**E-Auto-Dichte Deutschland:**
- Durchschnitt: ~3-5%
- Großstädte: ~8-15%
- Ländlich: ~1-3%

**Dachausrichtung:**
- 0° = Nord
- 90° = Ost
- 180° = Süd (optimal!)
- 270° = West

### CSV-Format

Die CSV muss eine `product` Spalte haben:
- Wert: `pv`, `storage` oder `charging`
- Nur relevante Spalten für jedes Produkt ausfüllen
- Leere Spalten werden ignoriert

**Beispiel CSV:**

```csv
location_id,location_name,product,roof_area_sqm,solar_irradiation,...
1,Standort A,pv,450,1150,...
2,Standort B,storage,,,50,120000,...
3,Standort C,charging,,,,,,,80,3500,...
```

---

## 🐛 Troubleshooting

**Frontend zeigt alte Version:**
```bash
cd frontend
rm -rf .next
npm run dev
```

**Backend-Fehler "module not found":**
```bash
pip install -r requirements.txt
```

**Scores scheinen unrealistisch:**
- Prüfen Sie die Faktorbereiche (min-max)
- Verwenden Sie realistische Werte
- Siehe "Realistische Werte finden"

**CSV-Upload schlägt fehl:**
- Prüfen Sie, ob `product` Spalte vorhanden ist
- Werte müssen `pv`, `storage` oder `charging` sein
- Laden Sie Template herunter als Beispiel

---

Viel Erfolg mit Version 2.0! 🎉


