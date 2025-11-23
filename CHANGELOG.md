# Changelog - Standort-Scoring Tool

## Version 2.0 - Produktspezifische Faktoren mit echten Metriken

### 🎯 Hauptänderungen

#### Backend
- **Realistische Faktoren**: Jedes Produkt hat jetzt spezifische, messbare Faktoren
  - **PV**: Dachfläche (m²), Sonneneinstrahlung (kWh/m²/Jahr), Gebäudealter, Dachausrichtung, Dachneigung, Strompreis, Wettbewerber
  - **Storage**: PV-Leistung (kWp), Jahresverbrauch, Spitzenlast, Netzanschluss, Strompreis, Stromausfälle, Wettbewerber
  - **Charging**: Parkplätze, Verkehrsaufkommen, Parkdauer, Netzanschluss, Entfernung Konkurrenz, E-Auto-Dichte, Wettbewerber

- **Intelligente Normalisierung**: Verschiedene Normalisierungsstrategien
  - `higher`: Je höher desto besser (z.B. Dachfläche)
  - `lower`: Je niedriger desto besser (z.B. Gebäudealter)
  - `target`: Zielwert optimal (z.B. 180° = Süd-Ausrichtung)
  - `range`: Bereich optimal (z.B. 25-40° Dachneigung)

- **Neue API-Endpunkte**:
  - `GET /api/product-factors/{product}`: Liefert Faktordefinitionen für ein Produkt
  - `POST /score/manual`: Produktspezifisches Scoring
  - Aktualisierte Templates mit produktspezifischen Spalten

#### Frontend
- **Produkt-Auswahl zuerst**: Nutzer wählt Produkt bevor Faktoren eingegeben werden
- **Produktspezifische Faktoreingabe**: Nur relevante Faktoren werden angezeigt
- **Echte Einheiten**: Inputs mit tatsächlichen Metriken (m², kWh, €, etc.)
- **Einzelner Score**: Zeigt nur den Score für das gewählte Produkt
- **Verbesserte UX**: 
  - Farbcodierte Produkt-Karten bei Auswahl
  - Faktorbeschreibungen mit Einheiten
  - Dynamische Bereiche basierend auf min/max Werten
  - Interpretationstext für Score

### 📊 Neue Faktoren im Detail

#### PV (Photovoltaik)
| Faktor | Einheit | Bereich | Beschreibung |
|--------|---------|---------|--------------|
| Dachfläche | m² | 50-5000 | Verfügbare Fläche für PV-Module |
| Sonneneinstrahlung | kWh/m²/Jahr | 800-1300 | Jährliche Globalstrahlung |
| Gebäudealter | Jahre | 0-100 | Alter des Gebäudes (Statik) |
| Dachausrichtung | Grad | 0-360 | 180° = Süd (optimal) |
| Dachneigung | Grad | 0-90 | 25-40° optimal |
| Strompreis | €/kWh | 0.20-0.50 | Lokaler Strompreis |
| Wettbewerber | Anzahl | 0-20 | Konkurrierende Anlagen |

#### Storage (Energiespeicher)
| Faktor | Einheit | Bereich | Beschreibung |
|--------|---------|---------|--------------|
| Vorhandene PV | kWp | 0-500 | Installierte PV-Leistung |
| Jahresverbrauch | kWh/Jahr | 1000-500000 | Gesamtstromverbrauch |
| Spitzenlast | kW | 10-500 | Max. Leistungsaufnahme |
| Netzanschluss | kW | 10-500 | Verfügbare Kapazität |
| Strompreis | €/kWh | 0.20-0.50 | Lokaler Strompreis |
| Stromausfälle | Anzahl/Jahr | 0-50 | Häufigkeit (USV-Bedarf) |
| Wettbewerber | Anzahl | 0-20 | Konkurrierende Speicher |

#### Charging (Ladeinfrastruktur)
| Faktor | Einheit | Bereich | Beschreibung |
|--------|---------|---------|--------------|
| Parkplätze | Stück | 5-500 | Verfügbare Parkplätze |
| Verkehrsaufkommen | Fz/Tag | 50-10000 | Tägliche Fahrzeuge |
| Parkdauer | Minuten | 15-480 | Mittlere Verweildauer |
| Netzanschluss | kW | 20-1000 | Verfügbare Kapazität |
| Nächste Ladestation | km | 0-50 | Entfernung Konkurrenz |
| E-Auto-Dichte | % | 0-30 | Anteil E-Fahrzeuge |
| Wettbewerber | Anzahl | 0-20 | Konkurrierende Ladestationen |

### 🔧 Migration von v1.0

**Achtung**: Version 2.0 ist nicht rückwärtskompatibel mit v1.0!

**Alte CSV-Dateien** mit `factor_roof_area` (0-10) funktionieren nicht mehr.
**Neue CSV-Dateien** müssen produktspezifische Spalten und echte Metriken enthalten.

**Lösung**: Laden Sie die neuen Templates herunter und verwenden Sie diese als Basis.

### 🚀 Breaking Changes

- ❌ Entfernt: `factor_*` Spalten mit 0-10 Werten
- ✅ Neu: Produktspezifische Spalten mit echten Einheiten
- ❌ Entfernt: Alle drei Scores in einem Request
- ✅ Neu: Ein Score pro Produkt pro Request
- API Response-Format geändert (siehe Dokumentation)

### 📝 Beispiel-Requests

**Alt (v1.0)**:
```json
{
  "location_name": "Standort A",
  "factor_roof_area": 8.5,
  "factor_solar_irradiation": 7.2,
  ...
}
```

**Neu (v2.0)**:
```json
{
  "location_name": "Standort A",
  "product": "pv",
  "factors": {
    "roof_area_sqm": 450,
    "solar_irradiation": 1150,
    "building_age_years": 12,
    ...
  }
}
```

---

## Version 1.0 - Initial Release

- Basis-Scoring mit 0-10 Faktoren
- Drei Scores gleichzeitig (PV, Storage, Charging)
- CSV-Upload
- Einfache Tabelle für Ergebnisse


