import { NextResponse } from 'next/server';

// Produktspezifische Faktordefinitionen (Reduziert auf Top 5 pro Produkt)
const PRODUCT_FACTORS = {
  pv: {
    roof_area_sqm: {
      label: "Dachfläche",
      unit: "m²",
      description: "Verfügbare Dachfläche für PV-Module",
      min: 50,
      max: 5000,
      optimal: "higher",
      weight: 0.30
    },
    solar_irradiation: {
      label: "Sonneneinstrahlung",
      unit: "kWh/m²/Jahr",
      description: "Jährliche Globalstrahlung am Standort",
      min: 800,
      max: 1300,
      optimal: "higher",
      weight: 0.25
    },
    roof_orientation_degrees: {
      label: "Dachausrichtung",
      unit: "Grad (0=Nord, 180=Süd)",
      description: "Ausrichtung des Dachs (Süd ist optimal)",
      min: 0,
      max: 360,
      optimal: "target",
      optimal_value: 180,
      weight: 0.20
    },
    roof_tilt_degrees: {
      label: "Dachneigung",
      unit: "Grad",
      description: "Neigung des Dachs (30-35° optimal)",
      min: 0,
      max: 90,
      optimal: "range",
      optimal_min: 25,
      optimal_max: 40,
      weight: 0.10
    },
    electricity_price_eur: {
      label: "Strompreis",
      unit: "€/kWh",
      description: "Lokaler Strompreis (höher = mehr Einsparung)",
      min: 0.20,
      max: 0.50,
      optimal: "higher",
      weight: 0.15
    }
  },
  storage: {
    existing_pv_kwp: {
      label: "Vorhandene PV-Leistung",
      unit: "kWp",
      description: "Installierte PV-Leistung am Standort",
      min: 0,
      max: 500,
      optimal: "higher",
      weight: 0.25
    },
    annual_consumption_kwh: {
      label: "Jährlicher Stromverbrauch",
      unit: "kWh/Jahr",
      description: "Jährlicher Gesamtstromverbrauch",
      min: 1000,
      max: 500000,
      optimal: "higher",
      weight: 0.25
    },
    peak_load_kw: {
      label: "Spitzenlast",
      unit: "kW",
      description: "Maximale gleichzeitige Leistungsaufnahme",
      min: 10,
      max: 500,
      optimal: "higher",
      weight: 0.20
    },
    grid_connection_kw: {
      label: "Netzanschlussleistung",
      unit: "kW",
      description: "Verfügbare Netzanschlusskapazität",
      min: 10,
      max: 500,
      optimal: "higher",
      weight: 0.15
    },
    electricity_price_eur: {
      label: "Strompreis",
      unit: "€/kWh",
      description: "Lokaler Strompreis (höher = mehr Einsparung)",
      min: 0.20,
      max: 0.50,
      optimal: "higher",
      weight: 0.15
    }
  },
  charging: {
    parking_spaces: {
      label: "Anzahl Parkplätze",
      unit: "Stück",
      description: "Verfügbare Parkplätze für Ladestationen",
      min: 5,
      max: 500,
      optimal: "higher",
      weight: 0.30
    },
    daily_traffic_volume: {
      label: "Tägliches Verkehrsaufkommen",
      unit: "Fahrzeuge/Tag",
      description: "Durchschnittliche Anzahl Fahrzeuge pro Tag",
      min: 50,
      max: 10000,
      optimal: "higher",
      weight: 0.25
    },
    avg_parking_duration_min: {
      label: "Durchschnittliche Parkdauer",
      unit: "Minuten",
      description: "Mittlere Verweildauer (länger = mehr Ladezeit)",
      min: 15,
      max: 480,
      optimal: "higher",
      weight: 0.15
    },
    grid_connection_kw: {
      label: "Netzanschlussleistung",
      unit: "kW",
      description: "Verfügbare Netzanschlusskapazität",
      min: 20,
      max: 1000,
      optimal: "higher",
      weight: 0.15
    },
    ev_density_percent: {
      label: "E-Auto-Dichte",
      unit: "%",
      description: "Anteil E-Fahrzeuge in der Region",
      min: 0,
      max: 30,
      optimal: "higher",
      weight: 0.15
    }
  }
};

export async function GET(
  request: Request,
  { params }: { params: { product: string } }
) {
  const product = params.product.toLowerCase();
  
  if (!(product in PRODUCT_FACTORS)) {
    return NextResponse.json(
      { detail: `Produkt '${product}' nicht gefunden` },
      { status: 404 }
    );
  }
  
  return NextResponse.json(PRODUCT_FACTORS[product as keyof typeof PRODUCT_FACTORS]);
}

