# Excel Template Guide - Kurzübersicht

## 📊 Quick Summary

### Excel-Struktur
```
Standort_Scoring_Template.xlsx
├── Sheet "PV" (3-4 Beispielstandorte)
├── Sheet "Storage" (3-4 Beispielstandorte)  
├── Sheet "Charging" (4-5 Beispielstandorte)
└── Sheet "Info" (Anleitung)
```

### Upload & Verarbeitung
1. **Upload**: Eine Excel-Datei mit allen Sheets
2. **Verarbeitung**: Jedes Sheet wird separat ausgewertet
3. **Rückgabe**: Alle Standorte kombiniert, **sortiert nach Score (höchster zuerst)**

---

## 🎯 Spalten pro Sheet

### ☀️ PV Sheet (11 Spalten)

**Erforderlich:**
```
location_id | location_name | product | roof_area_sqm | solar_irradiation | 
building_age_years | roof_orientation_degrees | roof_tilt_degrees | 
electricity_price_eur | competitors_nearby
```

**Optional:**
```
address | region | postal_code | lat | lng | notes
```

**Beispielzeile:**
```
1 | Bürogebäude München | pv | 450 | 1150 | 12 | 180 | 32 | 0.38 | 2
```

### 🔋 Storage Sheet (10 Spalten)

**Erforderlich:**
```
location_id | location_name | product | existing_pv_kwp | annual_consumption_kwh | 
peak_load_kw | grid_connection_kw | electricity_price_eur | 
power_outages_per_year | competitors_nearby
```

**Beispielzeile:**
```
10 | Krankenhaus Frankfurt | storage | 200 | 450000 | 350 | 400 | 0.35 | 5 | 1
```

### 🔌 Charging Sheet (10 Spalten)

**Erforderlich:**
```
location_id | location_name | product | parking_spaces | daily_traffic_volume | 
avg_parking_duration_min | grid_connection_kw | nearest_charger_km | 
ev_density_percent | competitors_nearby
```

**Beispielzeile:**
```
20 | Einkaufszentrum Köln | charging | 80 | 3500 | 180 | 150 | 3.5 | 15 | 2
```

---

## 💡 Best Practice Werte

### PV - Top Score Faktoren
- ✅ Dachfläche: **> 500 m²**
- ✅ Sonneneinstrahlung: **> 1100 kWh/m²/Jahr**
- ✅ Gebäudealter: **< 20 Jahre**
- ✅ Ausrichtung: **170-190° (Süd = 180°)**
- ✅ Neigung: **25-40°**
- ✅ Strompreis: **> 0.35 €/kWh**
- ✅ Wettbewerber: **< 3**

### Storage - Top Score Faktoren
- ✅ PV vorhanden: **> 50 kWp**
- ✅ Jahresverbrauch: **> 100000 kWh**
- ✅ Spitzenlast: **> 150 kW**
- ✅ Netzanschluss: **> Spitzenlast**
- ✅ Strompreis: **> 0.35 €/kWh**
- ✅ Ausfälle: **> 3/Jahr**
- ✅ Wettbewerber: **< 3**

### Charging - Top Score Faktoren
- ✅ Parkplätze: **> 50**
- ✅ Verkehr: **> 1500 Fz/Tag**
- ✅ Parkdauer: **> 90 Min**
- ✅ Netzanschluss: **> 150 kW**
- ✅ Nächster Lader: **> 3 km**
- ✅ E-Auto-Dichte: **> 12%**
- ✅ Wettbewerber: **< 3**

---

## 📥 Download & Upload

### 1. Template herunterladen
**Frontend:** http://localhost:3000 → "Datei Upload" → "Excel Template"  
**Direct:** http://localhost:8000/template/excel

### 2. Template ausfüllen
- Beispieldaten durch eigene ersetzen
- **Alle Pflichtfelder** ausfüllen (keine leeren Zellen)
- **Spaltennamen nicht ändern** (case-sensitive!)
- Werte im angegebenen Bereich halten

### 3. Datei hochladen
- Im Frontend: Drag & Drop oder Datei auswählen
- System verarbeitet automatisch alle Sheets
- Ergebnisse erscheinen in sortierter Tabelle

### 4. Ergebnisse
**Automatische Sortierung:** Höchster Score zuerst  
**Anzeige:** Standortname | Produkt-Icon | Score mit Balken  
**Sortierbar:** Nach Name, Produkt oder Score

---

## 🔍 Beispiel Response

**Upload:** Excel mit 3 PV, 3 Storage, 4 Charging = 10 Standorte

**Response (sortiert):**
```json
[
  {
    "location_id": 2,
    "location_name": "Lagerhalle Berlin",
    "product": "pv",
    "score": 92.5
  },
  {
    "location_id": 10,
    "location_name": "Krankenhaus Frankfurt",
    "product": "storage",
    "score": 89.3
  },
  {
    "location_id": 23,
    "location_name": "SAP Parkplatz Walldorf",
    "product": "charging",
    "score": 87.8
  },
  ...
]
```

---

## ⚠️ Häufige Fehler

### ❌ Fehler: "Fehlende Spalten"
**Ursache:** Spaltennamen falsch geschrieben  
**Lösung:** Exakt wie im Template verwenden (z.B. `roof_area_sqm`, nicht `roof_area`)

### ❌ Fehler: "Keine gültigen Daten"
**Ursache:** `product` Spalte fehlt oder falsche Werte  
**Lösung:** Werte müssen exakt `pv`, `storage` oder `charging` sein

### ❌ Fehler: Scores wirken unrealistisch
**Ursache:** Werte außerhalb sinnvoller Bereiche  
**Lösung:** Siehe "Best Practice Werte" oben

### ❌ Fehler: Sheet wird nicht erkannt
**Ursache:** Sheet-Name unverständlich  
**Lösung:** Sheet benennen mit "PV", "Storage" oder "Charging" im Namen

---

## 🎓 Detaillierte Dokumentation

Für vollständige Details siehe:
- **`EXCEL_FORMAT_SPECIFICATION.md`** - Komplette Spezifikation
- **`QUICK_START_V2.md`** - Schritt-für-Schritt Anleitung
- **`CHANGELOG.md`** - Was ist neu in v2.0

---

## 📞 Quick Help

**Template funktioniert nicht?**
1. Laden Sie frisches Template herunter
2. Prüfen Sie Spaltennamen (exakt wie im Template)
3. Prüfen Sie `product` Spalte (lowercase: pv/storage/charging)
4. Stellen Sie sicher, dass alle Pflichtfelder ausgefüllt sind

**Scores zu niedrig?**
- Prüfen Sie, ob Werte realistisch sind
- Vergleichen Sie mit "Best Practice Werten" oben
- Hohe Scores brauchen mehrere gute Faktoren

**Upload schlägt fehl?**
- Datei muss .xlsx oder .xls sein
- Mindestens ein Sheet mit gültigen Daten
- Mindestens 3 Faktoren pro Standort ausgefüllt

---

**Viel Erfolg!** 🚀


