"""
FastAPI MVP für die Berechnung der Erfolgswahrscheinlichkeit
von PV-, Speicher- und Ladeinfrastruktur-Standorten.
Version 2.0 - Mit realistischen Metriken und produktspezifischen Faktoren
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd
import io
import math
from typing import Dict, List, Optional
from pydantic import BaseModel

app = FastAPI(title="Standort-Scoring API")

# CORS Middleware für Frontend-Zugriff
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",  # Alle Vercel Deployments
        "https://vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Produktspezifische Faktordefinitionen (Reduziert auf Top 5 pro Produkt)
PRODUCT_FACTORS = {
    "pv": {
        "roof_area_sqm": {
            "label": "Dachfläche",
            "unit": "m²",
            "description": "Verfügbare Dachfläche für PV-Module",
            "min": 50,
            "max": 5000,
            "optimal": "higher",
            "weight": 0.30
        },
        "solar_irradiation": {
            "label": "Sonneneinstrahlung",
            "unit": "kWh/m²/Jahr",
            "description": "Jährliche Globalstrahlung am Standort",
            "min": 800,
            "max": 1300,
            "optimal": "higher",
            "weight": 0.25
        },
        "roof_orientation_degrees": {
            "label": "Dachausrichtung",
            "unit": "Grad (0=Nord, 180=Süd)",
            "description": "Ausrichtung des Dachs (Süd ist optimal)",
            "min": 0,
            "max": 360,
            "optimal": "target",
            "optimal_value": 180,
            "weight": 0.20
        },
        "roof_tilt_degrees": {
            "label": "Dachneigung",
            "unit": "Grad",
            "description": "Neigung des Dachs (30-35° optimal)",
            "min": 0,
            "max": 90,
            "optimal": "range",
            "optimal_min": 25,
            "optimal_max": 40,
            "weight": 0.10
        },
        "electricity_price_eur": {
            "label": "Strompreis",
            "unit": "€/kWh",
            "description": "Lokaler Strompreis (höher = mehr Einsparung)",
            "min": 0.20,
            "max": 0.50,
            "optimal": "higher",
            "weight": 0.15
        }
    },
    "storage": {
        "existing_pv_kwp": {
            "label": "Vorhandene PV-Leistung",
            "unit": "kWp",
            "description": "Installierte PV-Leistung am Standort",
            "min": 0,
            "max": 500,
            "optimal": "higher",
            "weight": 0.25
        },
        "annual_consumption_kwh": {
            "label": "Jährlicher Stromverbrauch",
            "unit": "kWh/Jahr",
            "description": "Jährlicher Gesamtstromverbrauch",
            "min": 1000,
            "max": 500000,
            "optimal": "higher",
            "weight": 0.25
        },
        "peak_load_kw": {
            "label": "Spitzenlast",
            "unit": "kW",
            "description": "Maximale gleichzeitige Leistungsaufnahme",
            "min": 10,
            "max": 500,
            "optimal": "higher",
            "weight": 0.20
        },
        "grid_connection_kw": {
            "label": "Netzanschlussleistung",
            "unit": "kW",
            "description": "Verfügbare Netzanschlusskapazität",
            "min": 10,
            "max": 500,
            "optimal": "higher",
            "weight": 0.15
        },
        "electricity_price_eur": {
            "label": "Strompreis",
            "unit": "€/kWh",
            "description": "Lokaler Strompreis (höher = mehr Einsparung)",
            "min": 0.20,
            "max": 0.50,
            "optimal": "higher",
            "weight": 0.15
        }
    },
    "charging": {
        "parking_spaces": {
            "label": "Anzahl Parkplätze",
            "unit": "Stück",
            "description": "Verfügbare Parkplätze für Ladestationen",
            "min": 5,
            "max": 500,
            "optimal": "higher",
            "weight": 0.30
        },
        "daily_traffic_volume": {
            "label": "Tägliches Verkehrsaufkommen",
            "unit": "Fahrzeuge/Tag",
            "description": "Durchschnittliche Anzahl Fahrzeuge pro Tag",
            "min": 50,
            "max": 10000,
            "optimal": "higher",
            "weight": 0.25
        },
        "avg_parking_duration_min": {
            "label": "Durchschnittliche Parkdauer",
            "unit": "Minuten",
            "description": "Mittlere Verweildauer (länger = mehr Ladezeit)",
            "min": 15,
            "max": 480,
            "optimal": "higher",
            "weight": 0.15
        },
        "grid_connection_kw": {
            "label": "Netzanschlussleistung",
            "unit": "kW",
            "description": "Verfügbare Netzanschlusskapazität",
            "min": 20,
            "max": 1000,
            "optimal": "higher",
            "weight": 0.15
        },
        "ev_density_percent": {
            "label": "E-Auto-Dichte",
            "unit": "%",
            "description": "Anteil E-Fahrzeuge in der Region",
            "min": 0,
            "max": 30,
            "optimal": "higher",
            "weight": 0.15
        }
    }
}


def normalize_factor_value(value: float, factor_config: dict) -> float:
    """
    Normalisiert einen Faktorwert basierend auf seiner Konfiguration.
    
    Args:
        value: Der zu normalisierende Wert
        factor_config: Konfiguration des Faktors mit min, max, optimal, etc.
        
    Returns:
        Normalisierter Wert zwischen 0 und 1
    """
    min_val = factor_config["min"]
    max_val = factor_config["max"]
    optimal_type = factor_config["optimal"]
    
    # Begrenze Wert auf min/max
    value = max(min_val, min(max_val, value))
    
    if optimal_type == "higher":
        # Je höher desto besser (linear)
        return (value - min_val) / (max_val - min_val)
    
    elif optimal_type == "lower":
        # Je niedriger desto besser (invers linear)
        if "optimal_max" in factor_config:
            # Alles unter optimal_max ist gut (1.0), darüber wird schlechter
            optimal_max = factor_config["optimal_max"]
            if value <= optimal_max:
                return 1.0
            else:
                return max(0, 1.0 - (value - optimal_max) / (max_val - optimal_max))
        else:
            return 1.0 - (value - min_val) / (max_val - min_val)
    
    elif optimal_type == "target":
        # Zielwert optimal (z.B. 180° für Süd-Ausrichtung)
        optimal_value = factor_config["optimal_value"]
        max_deviation = max(abs(optimal_value - min_val), abs(max_val - optimal_value))
        deviation = abs(value - optimal_value)
        return max(0, 1.0 - (deviation / max_deviation))
    
    elif optimal_type == "range":
        # Bereich ist optimal
        optimal_min = factor_config["optimal_min"]
        optimal_max = factor_config["optimal_max"]
        
        if optimal_min <= value <= optimal_max:
            return 1.0
        elif value < optimal_min:
            return (value - min_val) / (optimal_min - min_val) if optimal_min > min_val else 0
        else:  # value > optimal_max
            return 1.0 - (value - optimal_max) / (max_val - optimal_max) if max_val > optimal_max else 0
    
    return 0.5  # Fallback


def calculate_product_score(factors: Dict[str, float], product: str) -> float:
    """
    Berechnet den Score für ein Produkt basierend auf gewichteten Faktoren.
    
    Args:
        factors: Dictionary mit Faktorwerten (echte Metriken)
        product: Produkttyp ("pv", "storage", "charging")
        
    Returns:
        Score als Prozentsatz (0-100)
    """
    if product not in PRODUCT_FACTORS:
        raise ValueError(f"Unbekanntes Produkt: {product}")
    
    product_config = PRODUCT_FACTORS[product]
    score = 0.0
    
    for factor_name, factor_config in product_config.items():
        if factor_name not in factors:
            # Faktor fehlt, neutral bewerten
            normalized_value = 0.5
        else:
            normalized_value = normalize_factor_value(factors[factor_name], factor_config)
        
        weight = factor_config["weight"]
        score += weight * normalized_value
    
    # Skaliere auf 0-100
    return round(score * 100, 1)


# Pydantic Models für API-Requests
class ManualScoreRequest(BaseModel):
    """Request Model für manuelle Faktoreingabe"""
    location_name: str
    product: str  # "pv", "storage", or "charging"
    factors: Dict[str, float]


class ScoreResponse(BaseModel):
    """Response Model für Score-Berechnungen"""
    location_id: Optional[int] = None
    location_name: str
    product: str
    score: float
    factors_used: Dict[str, float]


@app.get("/", response_class=HTMLResponse)
async def read_root():
    """
    Liefert eine einfache Info-Seite.
    """
    html_content = """
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <title>Standort-Scoring API</title>
    </head>
    <body>
        <h1>Standort-Scoring API</h1>
        <p>Bitte verwenden Sie das Frontend unter <a href="http://localhost:3000">http://localhost:3000</a></p>
        <p>API-Dokumentation: <a href="/docs">/docs</a></p>
    </body>
    </html>
    """
    return html_content


@app.get("/api/product-factors/{product}")
async def get_product_factors(product: str):
    """
    Liefert die Faktordefinitionen für ein bestimmtes Produkt.
    
    Args:
        product: "pv", "storage", or "charging"
        
    Returns:
        Dictionary mit Faktordefinitionen
    """
    if product not in PRODUCT_FACTORS:
        raise HTTPException(status_code=404, detail=f"Produkt '{product}' nicht gefunden")
    
    return PRODUCT_FACTORS[product]


@app.post("/score/manual", response_model=ScoreResponse)
async def score_manual(request: ManualScoreRequest):
    """
    Berechnet Score für einen manuell eingegebenen Standort.
    
    Args:
        request: ManualScoreRequest mit location_name, product und factors
        
    Returns:
        ScoreResponse mit berechneten Score
    """
    try:
        if request.product not in PRODUCT_FACTORS:
            raise HTTPException(
                status_code=400,
                detail=f"Ungültiges Produkt: {request.product}"
            )
        
        # Berechne Score
        score = calculate_product_score(request.factors, request.product)
        
        return ScoreResponse(
            location_name=request.location_name,
            product=request.product,
            score=score,
            factors_used=request.factors
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler bei Score-Berechnung: {str(e)}")


@app.post("/score/csv")
async def score_csv(file: UploadFile = File(...)):
    """
    Verarbeitet eine CSV- oder Excel-Datei und berechnet Scores für alle Standorte.
    
    Excel-Dateien können mehrere Sheets enthalten (eines pro Produkt).
    CSV-Dateien müssen eine 'product' Spalte haben.
    
    Returns:
        JSON-Liste mit location_id, location_name, product und score,
        sortiert nach Score (höchster zuerst)
    """
    try:
        # Lese Datei
        contents = await file.read()
        filename = file.filename.lower()
        
        results = []
        
        if filename.endswith('.csv'):
            # CSV: Eine Datei mit product-Spalte
            df = pd.read_csv(io.BytesIO(contents))
            results = process_dataframe(df, "CSV")
            
        elif filename.endswith(('.xlsx', '.xls')):
            # Excel: Mehrere Sheets möglich
            excel_file = pd.ExcelFile(io.BytesIO(contents))
            
            # Verarbeite jedes Sheet
            for sheet_name in excel_file.sheet_names:
                # Überspringe Info-Sheets
                if sheet_name.lower() in ['info', 'anleitung', 'instructions', 'readme']:
                    continue
                
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                
                # Versuche Produkt aus Sheet-Namen zu ermitteln
                sheet_product = None
                if 'pv' in sheet_name.lower() or 'photovoltaik' in sheet_name.lower():
                    sheet_product = 'pv'
                elif 'storage' in sheet_name.lower() or 'speicher' in sheet_name.lower():
                    sheet_product = 'storage'
                elif 'charging' in sheet_name.lower() or 'laden' in sheet_name.lower() or 'ladeinfrastruktur' in sheet_name.lower():
                    sheet_product = 'charging'
                
                sheet_results = process_dataframe(df, sheet_name, default_product=sheet_product)
                results.extend(sheet_results)
        else:
            raise HTTPException(
                status_code=400,
                detail="Ungültiges Dateiformat. Bitte CSV oder Excel (.xlsx, .xls) hochladen."
            )
        
        if not results:
            raise HTTPException(
                status_code=400,
                detail="Keine gültigen Daten gefunden. Bitte überprüfen Sie das Dateiformat."
            )
        
        # Sortiere nach Score (höchster zuerst)
        results.sort(key=lambda x: x["score"], reverse=True)
        
        return JSONResponse(content=results)
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Die Datei ist leer")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")


def process_dataframe(df: pd.DataFrame, source_name: str, default_product: str = None) -> List[dict]:
    """
    Verarbeitet ein DataFrame und berechnet Scores.
    
    Args:
        df: Pandas DataFrame mit Standortdaten
        source_name: Name der Quelle (für Fehlermeldungen)
        default_product: Standard-Produkt wenn keine product-Spalte vorhanden
        
    Returns:
        Liste mit Score-Ergebnissen
    """
    results = []
    
    # Überspringe leere DataFrames
    if df.empty:
        return results
    
    # Validiere erforderliche Spalten
    required_columns = ["location_id", "location_name"]
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Fehlende Spalten in {source_name}: {', '.join(missing_columns)}"
        )
    
    # Prüfe ob product-Spalte vorhanden ist
    has_product_column = "product" in df.columns
    
    if not has_product_column and not default_product:
        raise HTTPException(
            status_code=400,
            detail=f"Keine 'product' Spalte in {source_name} gefunden und kein Standard-Produkt erkannt"
        )
    
    # Berechne Scores für jede Zeile
    for idx, row in df.iterrows():
        try:
            # Bestimme Produkt
            if has_product_column and pd.notna(row["product"]):
                product = str(row["product"]).lower().strip()
            elif default_product:
                product = default_product
            else:
                continue
            
            if product not in PRODUCT_FACTORS:
                # Ungültiges Produkt, überspringe Zeile
                continue
            
            # Extrahiere Faktoren für dieses Produkt
            factors = {}
            product_config = PRODUCT_FACTORS[product]
            
            for factor_name in product_config.keys():
                if factor_name in row and pd.notna(row[factor_name]):
                    try:
                        factors[factor_name] = float(row[factor_name])
                    except (ValueError, TypeError):
                        # Ungültiger Wert, überspringe diesen Faktor
                        pass
            
            # Überspringe wenn zu wenig Faktoren vorhanden
            if len(factors) < 3:
                continue
            
            # Berechne Score
            score = calculate_product_score(factors, product)
            
            results.append({
                "location_id": int(row["location_id"]),
                "location_name": str(row["location_name"]),
                "product": product,
                "score": score,
                "factors_used": factors
            })
            
        except Exception as e:
            # Einzelne fehlerhafte Zeilen überspringen
            continue
    
    return results


@app.get("/template/csv")
async def download_csv_template():
    """
    Lädt eine CSV-Vorlagendatei mit Beispieldaten für alle Produkte herunter.
    """
    # Erstelle Template-Daten für alle Produkte (Reduziert auf Top 5)
    pv_data = {
        "location_id": 1,
        "location_name": "Beispiel PV-Standort",
        "product": "pv",
        "roof_area_sqm": 250,
        "solar_irradiation": 1100,
        "roof_orientation_degrees": 180,
        "roof_tilt_degrees": 32,
        "electricity_price_eur": 0.35
    }
    
    storage_data = {
        "location_id": 2,
        "location_name": "Beispiel Speicher-Standort",
        "product": "storage",
        "existing_pv_kwp": 50,
        "annual_consumption_kwh": 80000,
        "peak_load_kw": 120,
        "grid_connection_kw": 150,
        "electricity_price_eur": 0.35
    }
    
    charging_data = {
        "location_id": 3,
        "location_name": "Beispiel Ladeinfrastruktur-Standort",
        "product": "charging",
        "parking_spaces": 50,
        "daily_traffic_volume": 1500,
        "avg_parking_duration_min": 120,
        "grid_connection_kw": 200,
        "ev_density_percent": 12
    }
    
    # Kombiniere alle Daten
    all_data = [pv_data, storage_data, charging_data]
    df = pd.DataFrame(all_data)
    
    # Konvertiere zu CSV
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    return StreamingResponse(
        io.BytesIO(stream.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=standort_template.csv"}
    )


@app.get("/template/excel")
async def download_excel_template():
    """
    Lädt eine Excel-Vorlagendatei mit Beispieldaten für alle Produkte herunter.
    Enthält separate Sheets für PV, Storage und Charging mit realistischen Beispieldaten.
    """
    stream = io.BytesIO()
    
    with pd.ExcelWriter(stream, engine='openpyxl') as writer:
        # PV Sheet - Photovoltaik
        pv_data = pd.DataFrame([
            {
                "location_id": 1,
                "location_name": "Bürogebäude München Zentrum",
                "product": "pv",
                "roof_area_sqm": 450,
                "solar_irradiation": 1150,
                "building_age_years": 12,
                "roof_orientation_degrees": 180,
                "roof_tilt_degrees": 32,
                "electricity_price_eur": 0.38,
                "competitors_nearby": 2,
                "address": "Maximilianstraße 1, 80539 München",
                "region": "Bayern"
            },
            {
                "location_id": 2,
                "location_name": "Lagerhalle Berlin Nord",
                "product": "pv",
                "roof_area_sqm": 2500,
                "solar_irradiation": 980,
                "building_age_years": 5,
                "roof_orientation_degrees": 170,
                "roof_tilt_degrees": 25,
                "electricity_price_eur": 0.35,
                "competitors_nearby": 1,
                "address": "Industriestraße 42, 13189 Berlin",
                "region": "Berlin"
            },
            {
                "location_id": 3,
                "location_name": "Wohnkomplex Hamburg Elbchaussee",
                "product": "pv",
                "roof_area_sqm": 180,
                "solar_irradiation": 920,
                "building_age_years": 35,
                "roof_orientation_degrees": 190,
                "roof_tilt_degrees": 40,
                "electricity_price_eur": 0.42,
                "competitors_nearby": 5,
                "address": "Elbchaussee 123, 22765 Hamburg",
                "region": "Hamburg"
            }
        ])
        pv_data.to_excel(writer, sheet_name='PV', index=False)
        
        # Storage Sheet - Energiespeicher
        storage_data = pd.DataFrame([
            {
                "location_id": 10,
                "location_name": "Krankenhaus Frankfurt Uniklinik",
                "product": "storage",
                "existing_pv_kwp": 200,
                "annual_consumption_kwh": 450000,
                "peak_load_kw": 350,
                "grid_connection_kw": 400,
                "electricity_price_eur": 0.35,
                "power_outages_per_year": 5,
                "competitors_nearby": 1,
                "address": "Universitätsstraße 1, 60323 Frankfurt",
                "region": "Hessen"
            },
            {
                "location_id": 11,
                "location_name": "Rechenzentrum Köln Mediapark",
                "product": "storage",
                "existing_pv_kwp": 150,
                "annual_consumption_kwh": 380000,
                "peak_load_kw": 320,
                "grid_connection_kw": 350,
                "electricity_price_eur": 0.32,
                "power_outages_per_year": 8,
                "competitors_nearby": 2,
                "address": "Mediapark 5, 50670 Köln",
                "region": "Nordrhein-Westfalen"
            },
            {
                "location_id": 12,
                "location_name": "Produktionshalle Stuttgart Daimler",
                "product": "storage",
                "existing_pv_kwp": 100,
                "annual_consumption_kwh": 280000,
                "peak_load_kw": 250,
                "grid_connection_kw": 300,
                "electricity_price_eur": 0.33,
                "power_outages_per_year": 2,
                "competitors_nearby": 1,
                "address": "Mercedesstraße 88, 70372 Stuttgart",
                "region": "Baden-Württemberg"
            }
        ])
        storage_data.to_excel(writer, sheet_name='Storage', index=False)
        
        # Charging Sheet - Ladeinfrastruktur
        charging_data = pd.DataFrame([
            {
                "location_id": 20,
                "location_name": "Einkaufszentrum Köln Neumarkt",
                "product": "charging",
                "parking_spaces": 80,
                "daily_traffic_volume": 3500,
                "avg_parking_duration_min": 180,
                "grid_connection_kw": 150,
                "nearest_charger_km": 3.5,
                "ev_density_percent": 15,
                "competitors_nearby": 2,
                "address": "Neumarkt 1, 50667 Köln",
                "region": "Nordrhein-Westfalen"
            },
            {
                "location_id": 21,
                "location_name": "Autobahnraststätte A9 Nord",
                "product": "charging",
                "parking_spaces": 150,
                "daily_traffic_volume": 8000,
                "avg_parking_duration_min": 45,
                "grid_connection_kw": 350,
                "nearest_charger_km": 15,
                "ev_density_percent": 8,
                "competitors_nearby": 1,
                "address": "A9 Raststätte Fürholzen Nord",
                "region": "Bayern"
            },
            {
                "location_id": 22,
                "location_name": "Parkhaus München Stadtzentrum",
                "product": "charging",
                "parking_spaces": 200,
                "daily_traffic_volume": 2500,
                "avg_parking_duration_min": 240,
                "grid_connection_kw": 200,
                "nearest_charger_km": 1.2,
                "ev_density_percent": 18,
                "competitors_nearby": 4,
                "address": "Karlsplatz 5, 80335 München",
                "region": "Bayern"
            },
            {
                "location_id": 23,
                "location_name": "SAP Firmenparkplatz Walldorf",
                "product": "charging",
                "parking_spaces": 300,
                "daily_traffic_volume": 1200,
                "avg_parking_duration_min": 480,
                "grid_connection_kw": 250,
                "nearest_charger_km": 2.8,
                "ev_density_percent": 22,
                "competitors_nearby": 1,
                "address": "SAP-Allee 1, 69190 Walldorf",
                "region": "Baden-Württemberg"
            }
        ])
        charging_data.to_excel(writer, sheet_name='Charging', index=False)
        
        # Info Sheet mit Anleitung
        info_data = pd.DataFrame([
            {"Information": "Standort-Scoring Tool - Excel Template"},
            {"Information": ""},
            {"Information": "Diese Datei enthält drei Sheets:"},
            {"Information": "1. PV - Photovoltaik-Standorte"},
            {"Information": "2. Storage - Energiespeicher-Standorte"},
            {"Information": "3. Charging - Ladeinfrastruktur-Standorte"},
            {"Information": ""},
            {"Information": "Anleitung:"},
            {"Information": "1. Ersetzen Sie die Beispieldaten mit Ihren Standortdaten"},
            {"Information": "2. Alle Spalten mit Werten füllen (keine Leerzeilen lassen)"},
            {"Information": "3. Die 'product' Spalte muss 'pv', 'storage' oder 'charging' sein"},
            {"Information": "4. Datei hochladen über das Frontend"},
            {"Information": "5. Ergebnisse werden nach Score sortiert angezeigt"},
            {"Information": ""},
            {"Information": "Wichtig:"},
            {"Information": "- Spaltennamen dürfen NICHT geändert werden"},
            {"Information": "- Werte müssen im angegebenen Bereich liegen"},
            {"Information": "- Sheets können auch einzeln verwendet werden"},
            {"Information": ""},
            {"Information": "Weitere Details: siehe EXCEL_FORMAT_SPECIFICATION.md"}
        ])
        info_data.to_excel(writer, sheet_name='Info', index=False)
        
        # Formatiere die Sheets
        workbook = writer.book
        
        # Formatiere PV Sheet
        if 'PV' in writer.sheets:
            ws = writer.sheets['PV']
            ws.column_dimensions['A'].width = 12
            ws.column_dimensions['B'].width = 35
            ws.column_dimensions['C'].width = 12
            ws.column_dimensions['D'].width = 18
            ws.column_dimensions['E'].width = 22
            ws.column_dimensions['F'].width = 22
            ws.column_dimensions['G'].width = 28
            ws.column_dimensions['H'].width = 22
            ws.column_dimensions['I'].width = 25
            ws.column_dimensions['J'].width = 22
            ws.column_dimensions['K'].width = 40
            ws.column_dimensions['L'].width = 20
        
        # Formatiere Storage Sheet
        if 'Storage' in writer.sheets:
            ws = writer.sheets['Storage']
            ws.column_dimensions['A'].width = 12
            ws.column_dimensions['B'].width = 35
            ws.column_dimensions['C'].width = 12
            ws.column_dimensions['D'].width = 20
            ws.column_dimensions['E'].width = 28
            ws.column_dimensions['F'].width = 18
            ws.column_dimensions['G'].width = 24
            ws.column_dimensions['H'].width = 25
            ws.column_dimensions['I'].width = 28
            ws.column_dimensions['J'].width = 22
            ws.column_dimensions['K'].width = 40
            ws.column_dimensions['L'].width = 20
        
        # Formatiere Charging Sheet
        if 'Charging' in writer.sheets:
            ws = writer.sheets['Charging']
            ws.column_dimensions['A'].width = 12
            ws.column_dimensions['B'].width = 35
            ws.column_dimensions['C'].width = 12
            ws.column_dimensions['D'].width = 18
            ws.column_dimensions['E'].width = 24
            ws.column_dimensions['F'].width = 30
            ws.column_dimensions['G'].width = 24
            ws.column_dimensions['H'].width = 24
            ws.column_dimensions['I'].width = 22
            ws.column_dimensions['J'].width = 22
            ws.column_dimensions['K'].width = 40
            ws.column_dimensions['L'].width = 20
        
        # Formatiere Info Sheet
        if 'Info' in writer.sheets:
            ws = writer.sheets['Info']
            ws.column_dimensions['A'].width = 60
    
    stream.seek(0)
    
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Standort_Scoring_Template.xlsx"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
