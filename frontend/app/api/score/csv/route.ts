import { NextResponse } from 'next/server';

// Importiere die gleichen Funktionen wie in manual
const PRODUCT_FACTORS = {
  pv: {
    roof_area_sqm: { min: 50, max: 5000, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.30 },
    solar_irradiation: { min: 800, max: 1300, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.25 },
    roof_orientation_degrees: { min: 0, max: 360, optimal: "target", optimal_value: 180, optimal_min: undefined, optimal_max: undefined, weight: 0.20 },
    roof_tilt_degrees: { min: 0, max: 90, optimal: "range", optimal_value: undefined, optimal_min: 25, optimal_max: 40, weight: 0.10 },
    electricity_price_eur: { min: 0.20, max: 0.50, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.15 }
  },
  storage: {
    existing_pv_kwp: { min: 0, max: 500, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.25 },
    annual_consumption_kwh: { min: 1000, max: 500000, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.25 },
    peak_load_kw: { min: 10, max: 500, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.20 },
    grid_connection_kw: { min: 10, max: 500, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.15 },
    electricity_price_eur: { min: 0.20, max: 0.50, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.15 }
  },
  charging: {
    parking_spaces: { min: 5, max: 500, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.30 },
    daily_traffic_volume: { min: 50, max: 10000, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.25 },
    avg_parking_duration_min: { min: 15, max: 480, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.15 },
    grid_connection_kw: { min: 20, max: 1000, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.15 },
    ev_density_percent: { min: 0, max: 30, optimal: "higher", optimal_value: undefined, optimal_min: undefined, optimal_max: undefined, weight: 0.15 }
  }
};

function normalizeFactorValue(value: number, factorConfig: any): number {
  const minVal = factorConfig.min;
  const maxVal = factorConfig.max;
  const optimalType = factorConfig.optimal;
  
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

function parseCSV(csvText: string): any[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];
  
  // Einfacher CSV-Parser (handhabt auch Anführungszeichen)
  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }
  
  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
    if (values.length !== headers.length) continue;
    
    const row: any = {};
    headers.forEach((header, idx) => {
      const value = values[idx];
      if (value === '' || value === null || value === undefined) {
        row[header] = null;
      } else {
        // Versuche als Zahl zu parsen, sonst als String
        const numValue = parseFloat(value);
        row[header] = isNaN(numValue) ? value : numValue;
      }
    });
    rows.push(row);
  }
  
  return rows;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { detail: "Keine Datei hochgeladen" },
        { status: 400 }
      );
    }
    
    const text = await file.text();
    const rows = parseCSV(text);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { detail: "Keine gültigen Daten in CSV gefunden" },
        { status: 400 }
      );
    }
    
    const results = [];
    
    for (const row of rows) {
      const product = String(row.product || '').toLowerCase().trim();
      
      if (!product || !(product in PRODUCT_FACTORS)) {
        continue;
      }
      
      const factors: Record<string, number> = {};
      const productConfig = PRODUCT_FACTORS[product as keyof typeof PRODUCT_FACTORS];
      
      for (const factorName of Object.keys(productConfig)) {
        if (row[factorName] !== undefined && row[factorName] !== null && row[factorName] !== '') {
          const value = parseFloat(String(row[factorName]));
          if (!isNaN(value)) {
            factors[factorName] = value;
          }
        }
      }
      
      if (Object.keys(factors).length < 3) {
        continue;
      }
      
      const score = calculateProductScore(factors, product);
      
      results.push({
        location_id: parseInt(String(row.location_id || 0)) || 0,
        location_name: String(row.location_name || ''),
        product,
        score,
        factors_used: factors
      });
    }
    
    if (results.length === 0) {
      return NextResponse.json(
        { detail: "Keine gültigen Standorte gefunden" },
        { status: 400 }
      );
    }
    
    // Sortiere nach Score (höchster zuerst)
    results.sort((a, b) => b.score - a.score);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing CSV:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Fehler beim Verarbeiten der CSV' },
      { status: 500 }
    );
  }
}

