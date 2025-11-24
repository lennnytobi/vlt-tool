import { NextResponse } from 'next/server';

// Gemeinsame Faktoren für alle Produkte
const COMMON_FACTORS = {
  eigentuemer: {
    label: "Eigentümer",
    unit: "",
    description: "Ist der Standort im Eigentum des Unternehmens?",
    type: "boolean",
    options: ["Ja", "Nein"],
    weight: 0.10
  },
  umsatz: {
    label: "Umsatz",
    unit: "×10k €/Jahr",
    description: "Jährlicher Umsatz des Unternehmens (in 10.000 € Schritten)",
    min: 10,
    max: 10000,
    optimal: "higher",
    weight: 0.10,
    step: 10
  },
  mitarbeiterzahl: {
    label: "Mitarbeiterzahl",
    unit: "Personen",
    description: "Anzahl der Mitarbeiter am Standort",
    min: 1,
    max: 10000,
    optimal: "higher",
    weight: 0.10
  },
  branche: {
    label: "Branche",
    unit: "",
    description: "Branche des Unternehmens",
    type: "dropdown",
    options: [
      "Energie & Versorgung",
      "Produktion & Fertigung",
      "Logistik & Transport",
      "Einzelhandel & Handel",
      "Gastronomie & Hotellerie",
      "Büro & Verwaltung",
      "Gesundheitswesen",
      "Bildung & Forschung",
      "Immobilien & Bau",
      "IT & Telekommunikation",
      "Automobil & Mobilität",
      "Chemie & Pharma",
      "Lebensmittel & Getränke",
      "Textil & Mode",
      "Maschinenbau",
      "Elektronik & Elektrotechnik",
      "Landwirtschaft",
      "Sonstige"
    ],
    weight: 0.10
  }
};

// Produktspezifische Faktordefinitionen
const PRODUCT_FACTORS = {
  pv: {
    ...COMMON_FACTORS,
    roof_area_sqm: {
      label: "Dachfläche",
      unit: "m²",
      description: "Verfügbare Dachfläche für PV-Module",
      min: 50,
      max: 5000,
      optimal: "higher",
      weight: 0.20
    },
    solar_irradiation: {
      label: "Sonneneinstrahlung",
      unit: "kWh/m²/Jahr",
      description: "Jährliche Globalstrahlung am Standort",
      min: 800,
      max: 1300,
      optimal: "higher",
      weight: 0.15
    },
    roof_orientation_degrees: {
      label: "Dachausrichtung",
      unit: "Grad (0=Nord, 180=Süd)",
      description: "Ausrichtung des Dachs (Süd ist optimal)",
      min: 0,
      max: 360,
      optimal: "target",
      optimal_value: 180,
      weight: 0.15
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
      weight: 0.10
    }
  },
  storage: {
    ...COMMON_FACTORS,
    existing_pv_kwp: {
      label: "Vorhandene PV-Leistung",
      unit: "kWp",
      description: "Installierte PV-Leistung am Standort",
      min: 0,
      max: 500,
      optimal: "higher",
      weight: 0.20
    },
    annual_consumption_kwh: {
      label: "Jährlicher Stromverbrauch",
      unit: "kWh/Jahr",
      description: "Jährlicher Gesamtstromverbrauch",
      min: 1000,
      max: 500000,
      optimal: "higher",
      weight: 0.20
    },
    peak_load_kw: {
      label: "Spitzenlast",
      unit: "kW",
      description: "Maximale gleichzeitige Leistungsaufnahme",
      min: 10,
      max: 500,
      optimal: "higher",
      weight: 0.15
    },
    grid_connection_kw: {
      label: "Netzanschlussleistung",
      unit: "kW",
      description: "Verfügbare Netzanschlusskapazität",
      min: 10,
      max: 500,
      optimal: "higher",
      weight: 0.10
    },
    electricity_price_eur: {
      label: "Strompreis",
      unit: "€/kWh",
      description: "Lokaler Strompreis (höher = mehr Einsparung)",
      min: 0.20,
      max: 0.50,
      optimal: "higher",
      weight: 0.10
    }
  },
  charging: {
    ...COMMON_FACTORS,
    parking_spaces: {
      label: "Anzahl Parkplätze",
      unit: "Stück",
      description: "Verfügbare Parkplätze für Ladestationen",
      min: 5,
      max: 500,
      optimal: "higher",
      weight: 0.20
    },
    daily_traffic_volume: {
      label: "Tägliches Verkehrsaufkommen",
      unit: "Fahrzeuge/Tag",
      description: "Durchschnittliche Anzahl Fahrzeuge pro Tag",
      min: 50,
      max: 10000,
      optimal: "higher",
      weight: 0.20
    },
    avg_parking_duration_min: {
      label: "Durchschnittliche Parkdauer",
      unit: "Minuten",
      description: "Mittlere Verweildauer (länger = mehr Ladezeit)",
      min: 15,
      max: 480,
      optimal: "higher",
      weight: 0.10
    },
    grid_connection_kw: {
      label: "Netzanschlussleistung",
      unit: "kW",
      description: "Verfügbare Netzanschlusskapazität",
      min: 20,
      max: 1000,
      optimal: "higher",
      weight: 0.10
    },
    ev_density_percent: {
      label: "E-Auto-Dichte",
      unit: "%",
      description: "Anteil E-Fahrzeuge in der Region",
      min: 0,
      max: 30,
      optimal: "higher",
      weight: 0.10
    }
  }
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ product: string }> }
) {
  const { product: productParam } = await params;
  const product = productParam.toLowerCase();
  
  if (!(product in PRODUCT_FACTORS)) {
    return NextResponse.json(
      { detail: `Produkt '${product}' nicht gefunden` },
      { status: 404 }
    );
  }
  
  return NextResponse.json(PRODUCT_FACTORS[product as keyof typeof PRODUCT_FACTORS]);
}

