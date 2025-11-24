import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

// Sample addresses in Germany
const ADDRESSES = [
  "Münchner Straße 15, 80331 München",
  "Hauptstraße 42, 10115 Berlin",
  "Königsallee 1, 40212 Düsseldorf",
  "Neuer Wall 10, 20354 Hamburg",
  "Zeil 5, 60313 Frankfurt am Main",
  "Königstraße 30, 70173 Stuttgart",
  "Breite Straße 8, 50667 Köln",
  "Marktplatz 2, 04109 Leipzig",
  "Bahnhofstraße 20, 01099 Dresden",
  "Lange Straße 1, 30159 Hannover",
  "Kaiserstraße 50, 76133 Karlsruhe",
  "Friedrichstraße 123, 10117 Berlin",
  "Schadowstraße 11, 40212 Düsseldorf",
  "Ballindamm 1, 20095 Hamburg",
  "Goethestraße 7, 60313 Frankfurt am Main",
  "Calwer Straße 45, 70173 Stuttgart",
  "Hohe Straße 100, 50667 Köln",
  "Grimmaische Straße 1, 04109 Leipzig",
  "Prager Straße 1, 01069 Dresden",
  "Georgstraße 50, 30159 Hannover",
];

// Sample location names
const PV_NAMES = [
  "Gewerbegebiet Nord - Lagerhalle A",
  "Industriezentrum Süd - Produktionshalle",
  "Einkaufszentrum City - Dachfläche",
  "Bürokomplex Mitte - Hauptgebäude",
  "Logistikzentrum West - Halle 3",
  "Produktionsstätte Ost - Werk 1",
  "Verwaltungsgebäude Zentrum - Hauptsitz",
  "Einzelhandelszentrum - Filiale Nord",
  "Gewerbehof - Gebäude B",
  "Industriepark - Halle 5",
  "Büropark - Gebäude 2",
  "Einkaufszentrum - Erweiterung",
  "Lagerhalle - Standort 3",
  "Produktionshalle - Linie 2",
  "Verwaltungsgebäude - Nebengebäude",
  "Gewerbegebiet - Standort 4",
  "Industriezentrum - Halle 6",
  "Bürokomplex - Gebäude 3",
  "Logistikzentrum - Standort 5",
  "Produktionsstätte - Werk 2",
];

const STORAGE_NAMES = [
  "Bürokomplex Hauptstraße - Hauptgebäude",
  "Produktionsstätte Industriegebiet - Werk 2",
  "Einkaufszentrum City - Hauptgebäude",
  "Verwaltungszentrum - Gebäude A",
  "Gewerbegebiet - Halle 1",
  "Industriezentrum - Produktionshalle B",
  "Büropark - Hauptgebäude",
  "Logistikzentrum - Verwaltungsgebäude",
  "Einzelhandelszentrum - Hauptgebäude",
  "Produktionsstätte - Verwaltungsgebäude",
  "Gewerbehof - Hauptgebäude",
  "Industriepark - Verwaltungsgebäude",
  "Bürokomplex - Nebengebäude",
  "Einkaufszentrum - Verwaltungsgebäude",
  "Lagerhalle - Bürogebäude",
  "Verwaltungszentrum - Gebäude B",
  "Produktionsstätte - Werk 3",
  "Gewerbegebiet - Halle 2",
  "Industriezentrum - Produktionshalle C",
  "Büropark - Nebengebäude",
];

const CHARGING_NAMES = [
  "Parkhaus Innenstadt - Ebene 1",
  "Einkaufszentrum - Parkplatz Nord",
  "Bürokomplex - Tiefgarage",
  "Bahnhof - Parkplatz P1",
  "Flughafen - Parkhaus Terminal 1",
  "Krankenhaus - Parkplatz Haupteingang",
  "Hotel City Center - Tiefgarage",
  "Restaurant Mile - Parkplatz",
  "Fitnessstudio - Parkplatz",
  "Supermarkt - Kundenparkplatz",
  "Kino - Parkplatz",
  "Museum - Parkplatz",
  "Stadion - Parkplatz A",
  "Universität - Parkplatz Campus",
  "Verwaltungsgebäude - Besucherparkplatz",
  "Parkhaus Zentrum - Ebene 2",
  "Einkaufszentrum - Parkplatz Süd",
  "Bürokomplex - Parkplatz",
  "Bahnhof - Parkplatz P2",
  "Flughafen - Parkhaus Terminal 2",
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

const INDUSTRIES = [
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
];

function generatePvData(numRows: number = 20): any[] {
  const data = [];
  for (let i = 1; i <= numRows; i++) {
    data.push({
      location_id: i,
      location_name: getRandomItem(PV_NAMES),
      address: getRandomItem(ADDRESSES),
      product: "pv",
      eigentuemer: getRandomItem(["Ja", "Nein"]),
      umsatz: Math.floor(Math.random() * 9990) + 10, // 10-10000 in 10k steps
      mitarbeiterzahl: Math.floor(Math.random() * 9999) + 1,
      branche: getRandomItem(INDUSTRIES),
      roof_area_sqm: Math.floor(Math.random() * 1900) + 100,
      solar_irradiation: Math.floor(Math.random() * 350) + 900,
      roof_orientation_degrees: getRandomItem([150, 160, 170, 180, 190, 200, 210]),
      roof_tilt_degrees: Math.floor(Math.random() * 25) + 20,
      electricity_price_eur: Number((Math.random() * 0.2 + 0.25).toFixed(2)),
    });
  }
  return data;
}

function generateStorageData(numRows: number = 20): any[] {
  const data = [];
  for (let i = 1; i <= numRows; i++) {
    data.push({
      location_id: i,
      location_name: getRandomItem(STORAGE_NAMES),
      address: getRandomItem(ADDRESSES),
      product: "storage",
      eigentuemer: getRandomItem(["Ja", "Nein"]),
      umsatz: Math.floor(Math.random() * 9990) + 10, // 10-10000 in 10k steps
      mitarbeiterzahl: Math.floor(Math.random() * 9999) + 1,
      branche: getRandomItem(INDUSTRIES),
      existing_pv_kwp: Math.floor(Math.random() * 250) + 50,
      annual_consumption_kwh: Math.floor(Math.random() * 350000) + 50000,
      peak_load_kw: Math.floor(Math.random() * 250) + 50,
      grid_connection_kw: Math.floor(Math.random() * 350) + 50,
      electricity_price_eur: Number((Math.random() * 0.2 + 0.25).toFixed(2)),
    });
  }
  return data;
}

function generateChargingData(numRows: number = 20): any[] {
  const data = [];
  for (let i = 1; i <= numRows; i++) {
    data.push({
      location_id: i,
      location_name: getRandomItem(CHARGING_NAMES),
      address: getRandomItem(ADDRESSES),
      product: "charging",
      eigentuemer: getRandomItem(["Ja", "Nein"]),
      umsatz: Math.floor(Math.random() * 9990) + 10, // 10-10000 in 10k steps
      mitarbeiterzahl: Math.floor(Math.random() * 9999) + 1,
      branche: getRandomItem(INDUSTRIES),
      parking_spaces: Math.floor(Math.random() * 280) + 20,
      daily_traffic_volume: Math.floor(Math.random() * 4800) + 200,
      avg_parking_duration_min: Math.floor(Math.random() * 210) + 30,
      grid_connection_kw: Math.floor(Math.random() * 450) + 50,
      ev_density_percent: Number((Math.random() * 18 + 2).toFixed(1)),
    });
  }
  return data;
}

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Generate data
    const pvData = generatePvData(20);
    const storageData = generateStorageData(20);
    const chargingData = generateChargingData(20);
    
    // Create PV sheet
    const pvSheet = workbook.addWorksheet('PV');
    pvSheet.addRow(['location_id', 'location_name', 'address', 'product', 'eigentuemer', 'umsatz', 'mitarbeiterzahl', 'branche', 'roof_area_sqm', 'solar_irradiation', 'roof_orientation_degrees', 'roof_tilt_degrees', 'electricity_price_eur']);
    pvData.forEach(row => {
      pvSheet.addRow([
        row.location_id,
        row.location_name,
        row.address,
        row.product,
        row.eigentuemer,
        row.umsatz,
        row.mitarbeiterzahl,
        row.branche,
        row.roof_area_sqm,
        row.solar_irradiation,
        row.roof_orientation_degrees,
        row.roof_tilt_degrees,
        row.electricity_price_eur,
      ]);
    });
    
    // Create Storage sheet
    const storageSheet = workbook.addWorksheet('Storage');
    storageSheet.addRow(['location_id', 'location_name', 'address', 'product', 'eigentuemer', 'umsatz', 'mitarbeiterzahl', 'branche', 'existing_pv_kwp', 'annual_consumption_kwh', 'peak_load_kw', 'grid_connection_kw', 'electricity_price_eur']);
    storageData.forEach(row => {
      storageSheet.addRow([
        row.location_id,
        row.location_name,
        row.address,
        row.product,
        row.eigentuemer,
        row.umsatz,
        row.mitarbeiterzahl,
        row.branche,
        row.existing_pv_kwp,
        row.annual_consumption_kwh,
        row.peak_load_kw,
        row.grid_connection_kw,
        row.electricity_price_eur,
      ]);
    });
    
    // Create Charging sheet
    const chargingSheet = workbook.addWorksheet('Charging');
    chargingSheet.addRow(['location_id', 'location_name', 'address', 'product', 'eigentuemer', 'umsatz', 'mitarbeiterzahl', 'branche', 'parking_spaces', 'daily_traffic_volume', 'avg_parking_duration_min', 'grid_connection_kw', 'ev_density_percent']);
    chargingData.forEach(row => {
      chargingSheet.addRow([
        row.location_id,
        row.location_name,
        row.address,
        row.product,
        row.eigentuemer,
        row.umsatz,
        row.mitarbeiterzahl,
        row.branche,
        row.parking_spaces,
        row.daily_traffic_volume,
        row.avg_parking_duration_min,
        row.grid_connection_kw,
        row.ev_density_percent,
      ]);
    });
    
    // Format all sheets
    [pvSheet, storageSheet, chargingSheet].forEach(sheet => {
      // Style header row
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      headerRow.height = 25;
      
      // Set column widths
      sheet.columns.forEach((column, index) => {
        if (column) {
          column.width = 20;
        }
      });
      
      // Freeze first row
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      
      // Add auto filter
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: sheet.rowCount, column: sheet.columnCount }
      };
    });
    
    // Convert to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="mock_standorte.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating mock data:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Fehler beim Generieren der Mock-Daten' },
      { status: 500 }
    );
  }
}


