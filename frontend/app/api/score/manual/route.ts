import { NextResponse } from 'next/server';

// Gemeinsame Faktoren für alle Produkte
const COMMON_FACTORS = {
  eigentuemer: { type: "boolean", weight: 0.10 },
  umsatz: { min: 10, max: 10000, optimal: "higher", weight: 0.10, step: 10, scale: 10000 },
  mitarbeiterzahl: { min: 1, max: 10000, optimal: "higher", weight: 0.10 },
  branche: { type: "dropdown", weight: 0.10 }
};

// Produktspezifische Faktordefinitionen
const PRODUCT_FACTORS = {
  pv: {
    ...COMMON_FACTORS,
    roof_area_sqm: { min: 50, max: 5000, optimal: "higher", weight: 0.20 },
    solar_irradiation: { min: 800, max: 1300, optimal: "higher", weight: 0.15 },
    roof_orientation_degrees: { min: 0, max: 360, optimal: "target", optimal_value: 180, weight: 0.15 },
    roof_tilt_degrees: { min: 0, max: 90, optimal: "range", optimal_min: 25, optimal_max: 40, weight: 0.10 },
    electricity_price_eur: { min: 0.20, max: 0.50, optimal: "higher", weight: 0.10 }
  },
  storage: {
    ...COMMON_FACTORS,
    existing_pv_kwp: { min: 0, max: 500, optimal: "higher", weight: 0.20 },
    annual_consumption_kwh: { min: 1000, max: 500000, optimal: "higher", weight: 0.20 },
    peak_load_kw: { min: 10, max: 500, optimal: "higher", weight: 0.15 },
    grid_connection_kw: { min: 10, max: 500, optimal: "higher", weight: 0.10 },
    electricity_price_eur: { min: 0.20, max: 0.50, optimal: "higher", weight: 0.10 }
  },
  charging: {
    ...COMMON_FACTORS,
    parking_spaces: { min: 5, max: 500, optimal: "higher", weight: 0.20 },
    daily_traffic_volume: { min: 50, max: 10000, optimal: "higher", weight: 0.20 },
    avg_parking_duration_min: { min: 15, max: 480, optimal: "higher", weight: 0.10 },
    grid_connection_kw: { min: 20, max: 1000, optimal: "higher", weight: 0.10 },
    ev_density_percent: { min: 0, max: 30, optimal: "higher", weight: 0.10 }
  }
};

function normalizeFactorValue(value: any, factorConfig: any): number {
  // Handle boolean type (Eigentümer: Ja=1, Nein=0)
  if (factorConfig.type === "boolean") {
    if (typeof value === "boolean") return value ? 1.0 : 0.0;
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower === "ja" || lower === "yes" || lower === "true" || lower === "1") return 1.0;
      return 0.0;
    }
    if (typeof value === "number") return value > 0 ? 1.0 : 0.0;
    return 0.0;
  }
  
  // Handle dropdown type (Branche: all industries get same score for now, can be customized)
  if (factorConfig.type === "dropdown") {
    // For now, all industries get a neutral score of 0.7
    // This can be customized later with industry-specific scores
    return 0.7;
  }
  
  // Handle numeric types
  if (typeof value !== "number" || isNaN(value)) {
    return 0.0;
  }
  
  const minVal = factorConfig.min;
  const maxVal = factorConfig.max;
  const optimalType = factorConfig.optimal;
  
  if (minVal === undefined || maxVal === undefined) {
    return 0.5;
  }
  
  value = Math.max(minVal, Math.min(maxVal, value));
  
  if (optimalType === "higher") {
    return (value - minVal) / (maxVal - minVal);
  } else if (optimalType === "lower") {
    if (factorConfig.optimal_max !== undefined) {
      const optimalMax = factorConfig.optimal_max;
      if (value <= optimalMax) return 1.0;
      return Math.max(0, 1.0 - (value - optimalMax) / (maxVal - optimalMax));
    }
    return 1.0 - (value - minVal) / (maxVal - minVal);
  } else if (optimalType === "target") {
    const optimalValue = factorConfig.optimal_value;
    const maxDeviation = Math.max(Math.abs(optimalValue - minVal), Math.abs(maxVal - optimalValue));
    const deviation = Math.abs(value - optimalValue);
    return Math.max(0, 1.0 - (deviation / maxDeviation));
  } else if (optimalType === "range") {
    const optimalMin = factorConfig.optimal_min;
    const optimalMax = factorConfig.optimal_max;
    
    if (optimalMin <= value && value <= optimalMax) {
      return 1.0;
    } else if (value < optimalMin) {
      return optimalMin > minVal ? (value - minVal) / (optimalMin - minVal) : 0;
    } else {
      return maxVal > optimalMax ? 1.0 - (value - optimalMax) / (maxVal - optimalMax) : 0;
    }
  }
  
  return 0.5;
}

function calculateProductScore(factors: Record<string, number>, product: string): number {
  const productConfig = PRODUCT_FACTORS[product as keyof typeof PRODUCT_FACTORS];
  if (!productConfig) {
    throw new Error(`Unbekanntes Produkt: ${product}`);
  }
  
  let score = 0.0;
  
  for (const [factorName, factorConfig] of Object.entries(productConfig)) {
    const factorValue = factors[factorName] ?? 0;
    const normalizedValue = normalizeFactorValue(factorValue, factorConfig);
    score += factorConfig.weight * normalizedValue;
  }
  
  return Math.round(score * 100 * 10) / 10;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location_name, product, factors } = body;
    
    if (!location_name || !product || !factors) {
      return NextResponse.json(
        { detail: "location_name, product und factors sind erforderlich" },
        { status: 400 }
      );
    }
    
    if (!(product in PRODUCT_FACTORS)) {
      return NextResponse.json(
        { detail: `Ungültiges Produkt: ${product}` },
        { status: 400 }
      );
    }
    
    const score = calculateProductScore(factors, product);
    
    return NextResponse.json({
      location_name,
      product,
      score,
      factors_used: factors
    });
  } catch (error) {
    console.error('Error calculating score:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Fehler bei Score-Berechnung' },
      { status: 500 }
    );
  }
}


