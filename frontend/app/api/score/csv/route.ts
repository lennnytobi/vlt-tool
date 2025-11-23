import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

// Gemeinsame Faktoren für alle Produkte
const COMMON_FACTORS = {
  eigentuemer: { type: "boolean", weight: 0.10 },
  umsatz: { min: 100000, max: 100000000, optimal: "higher", weight: 0.10 },
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

function getScoreColor(score: number): string {
  if (score >= 80) return 'FF4CAF50'; // Green
  if (score >= 60) return 'FF2196F3'; // Blue
  if (score >= 40) return 'FFFFC107'; // Yellow
  return 'FFF44336'; // Red
}

async function createFormattedExcel(workbook: XLSX.WorkBook, resultsBySheet: Record<string, any[]>): Promise<ArrayBuffer> {
  const excelWorkbook = new ExcelJS.Workbook();
  
  // Process each sheet
  for (const [sheetName, results] of Object.entries(resultsBySheet)) {
    if (results.length === 0) continue;
    
    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    // Get original sheet to preserve structure
    const originalSheet = workbook.Sheets[sheetName];
    if (!originalSheet) continue;
    
    // Convert to JSON to get headers
    const originalData = XLSX.utils.sheet_to_json(originalSheet, { defval: null }) as Record<string, any>[];
    if (originalData.length === 0) continue;
    
    // Create new data with scores
    const headers = Object.keys(originalData[0] || {});
    const newData = results.map((result, idx) => {
      const originalRow = originalData.find((row: Record<string, any>) => 
        row.location_id === result.location_id && 
        String(row.location_name || '').trim() === String(result.location_name || '').trim()
      ) || originalData[idx] || {};
      
      return {
        ...originalRow,
        Score: result.score
      };
    });
    
    // Add Score column to headers if not present
    const allHeaders = headers.includes('Score') ? headers : [...headers, 'Score'];
    
    // Create worksheet
    const worksheet = excelWorkbook.addWorksheet(sheetName);
    
    // Add header row
    worksheet.addRow(allHeaders);
    
    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;
    
    // Add data rows
    for (const rowData of newData) {
      const row = worksheet.addRow(allHeaders.map(header => (rowData as Record<string, any>)[header] ?? ''));
      row.alignment = { vertical: 'middle' };
    }
    
    // Style score column
    const scoreColIndex = allHeaders.indexOf('Score') + 1;
    if (scoreColIndex > 0) {
      const scoreColumn = worksheet.getColumn(scoreColIndex);
      scoreColumn.width = 12;
      scoreColumn.numFmt = '0.0';
      
      // Style score cells with colors
      for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
        const cell = worksheet.getCell(rowNum, scoreColIndex);
        const score = cell.value as number;
        if (typeof score === 'number') {
          const color = getScoreColor(score);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
          };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      }
    }
    
    // Set column widths
    allHeaders.forEach((header, idx) => {
      const column = worksheet.getColumn(idx + 1);
      if (header !== 'Score') {
        const maxLength = Math.max(
          header.length,
          ...newData.map((row: Record<string, any>) => String(row[header] || '').length)
        );
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      }
    });
    
    // Freeze first row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    
    // Add auto filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: worksheet.rowCount, column: allHeaders.length }
    };
  }
  
  // Convert to buffer
  const buffer = await excelWorkbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
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
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name.toLowerCase();
    
    // Check if Excel file
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      // Read Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const resultsBySheet: Record<string, any[]> = {};
      
      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        // Skip info sheets
        if (['info', 'anleitung', 'instructions', 'readme'].includes(sheetName.toLowerCase())) {
          continue;
        }
        
        // Determine product from sheet name
        let product = '';
        const sheetNameLower = sheetName.toLowerCase();
        if (sheetNameLower.includes('pv') || sheetNameLower.includes('photovoltaik')) {
          product = 'pv';
        } else if (sheetNameLower.includes('storage') || sheetNameLower.includes('speicher')) {
          product = 'storage';
        } else if (sheetNameLower.includes('charging') || sheetNameLower.includes('laden') || sheetNameLower.includes('ladeinfrastruktur')) {
          product = 'charging';
        }
        
        if (!product) continue;
        
        // Read sheet data
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
        
        if (data.length === 0) continue;
        
        const sheetResults: any[] = [];
        
        // Process each row
        for (const row of data as any[]) {
          const factors: Record<string, number> = {};
          const productConfig = PRODUCT_FACTORS[product as keyof typeof PRODUCT_FACTORS];
          
          if (!productConfig) continue;
          
          // Extract factors
          for (const factorName of Object.keys(productConfig)) {
            if (row[factorName] !== undefined && row[factorName] !== null && row[factorName] !== '') {
              const factorConfig = productConfig[factorName];
              const rawValue = row[factorName];
              
              // Handle boolean type
              if (factorConfig.type === "boolean") {
                const strValue = String(rawValue).toLowerCase();
                factors[factorName] = (strValue === "ja" || strValue === "yes" || strValue === "true" || strValue === "1") ? 1 : 0;
              }
              // Handle dropdown type (store as string)
              else if (factorConfig.type === "dropdown") {
                factors[factorName] = String(rawValue);
              }
              // Handle numeric types
              else {
                const value = parseFloat(String(rawValue));
                if (!isNaN(value)) {
                  factors[factorName] = value;
                }
              }
            }
          }
          
          if (Object.keys(factors).length < 3) continue;
          
          const score = calculateProductScore(factors, product);
          
          sheetResults.push({
            location_id: parseInt(String(row.location_id || 0)) || 0,
            location_name: String(row.location_name || ''),
            address: String(row.address || ''),
            product,
            score,
            factors_used: factors
          });
        }
        
        if (sheetResults.length > 0) {
          resultsBySheet[sheetName] = sheetResults;
        }
      }
      
      if (Object.keys(resultsBySheet).length === 0) {
        return NextResponse.json(
          { detail: "Keine gültigen Daten gefunden" },
          { status: 400 }
        );
      }
      
      // Create formatted Excel file
      const excelBuffer = await createFormattedExcel(workbook, resultsBySheet);
      
      // Return Excel file
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="standorte_mit_scores_${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }
    
    // CSV handling (keep existing behavior for JSON response)
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) {
      return NextResponse.json(
        { detail: "Keine gültigen Daten in CSV gefunden" },
        { status: 400 }
      );
    }
    
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
    const rows: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
      if (values.length !== headers.length) continue;
      
      const row: any = {};
      headers.forEach((header, idx) => {
        const value = values[idx];
        if (value === '' || value === null || value === undefined) {
          row[header] = null;
        } else {
          const numValue = parseFloat(value);
          row[header] = isNaN(numValue) ? value : numValue;
        }
      });
      rows.push(row);
    }
    
    const results: any[] = [];
    
    for (const row of rows) {
      const product = String(row.product || '').toLowerCase().trim();
      
      if (!product || !(product in PRODUCT_FACTORS)) {
        continue;
      }
      
      const factors: Record<string, number> = {};
      const productConfig = PRODUCT_FACTORS[product as keyof typeof PRODUCT_FACTORS];
      
      for (const factorName of Object.keys(productConfig)) {
        if (row[factorName] !== undefined && row[factorName] !== null && row[factorName] !== '') {
          const factorConfig = productConfig[factorName];
          const rawValue = row[factorName];
          
          // Handle boolean type
          if (factorConfig.type === "boolean") {
            const strValue = String(rawValue).toLowerCase();
            factors[factorName] = (strValue === "ja" || strValue === "yes" || strValue === "true" || strValue === "1") ? 1 : 0;
          }
          // Handle dropdown type (store as string)
          else if (factorConfig.type === "dropdown") {
            factors[factorName] = String(rawValue);
          }
          // Handle numeric types
          else {
            const value = parseFloat(String(rawValue));
            if (!isNaN(value)) {
              factors[factorName] = value;
            }
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
    
    results.sort((a, b) => b.score - a.score);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Fehler beim Verarbeiten der Datei' },
      { status: 500 }
    );
  }
}
