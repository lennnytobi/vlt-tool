import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Create PV sheet with template structure
    const pvSheet = workbook.addWorksheet('PV');
    pvSheet.addRow(['location_id', 'location_name', 'address', 'product', 'eigentuemer', 'umsatz', 'mitarbeiterzahl', 'branche', 'roof_area_sqm', 'solar_irradiation', 'roof_orientation_degrees', 'roof_tilt_degrees', 'electricity_price_eur']);
    pvSheet.addRow([1, 'Beispiel PV-Standort', 'Musterstraße 1, 12345 Musterstadt', 'pv', 'Ja', 5000, 50, 'Produktion & Fertigung', 250, 1100, 180, 32, 0.35]); // umsatz: 5000 = 5000 × 1k = 5M
    
    // Create Storage sheet with template structure
    const storageSheet = workbook.addWorksheet('Storage');
    storageSheet.addRow(['location_id', 'location_name', 'address', 'product', 'eigentuemer', 'umsatz', 'mitarbeiterzahl', 'branche', 'existing_pv_kwp', 'annual_consumption_kwh', 'peak_load_kw', 'grid_connection_kw', 'electricity_price_eur']);
    storageSheet.addRow([1, 'Beispiel Speicher-Standort', 'Musterstraße 2, 12345 Musterstadt', 'storage', 'Nein', 3000, 30, 'Energie & Versorgung', 100, 50000, 80, 150, 0.35]); // umsatz: 3000 = 3000 × 1k = 3M
    
    // Create Charging sheet with template structure
    const chargingSheet = workbook.addWorksheet('Charging');
    chargingSheet.addRow(['location_id', 'location_name', 'address', 'product', 'eigentuemer', 'umsatz', 'mitarbeiterzahl', 'branche', 'parking_spaces', 'daily_traffic_volume', 'avg_parking_duration_min', 'grid_connection_kw', 'ev_density_percent']);
    chargingSheet.addRow([1, 'Beispiel Ladeinfrastruktur-Standort', 'Musterstraße 3, 12345 Musterstadt', 'charging', 'Ja', 2000, 20, 'Einzelhandel & Handel', 50, 1500, 120, 200, 12]); // umsatz: 2000 = 2000 × 1k = 2M
    
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
        'Content-Disposition': 'attachment; filename="standort_template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Fehler beim Generieren der Vorlage' },
      { status: 500 }
    );
  }
}
