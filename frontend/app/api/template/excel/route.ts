import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Create PV sheet with template structure
    const pvSheet = workbook.addWorksheet('PV');
    pvSheet.addRow(['location_id', 'location_name', 'address', 'product', 'roof_area_sqm', 'solar_irradiation', 'roof_orientation_degrees', 'roof_tilt_degrees', 'electricity_price_eur']);
    pvSheet.addRow([1, 'Beispiel PV-Standort', 'Musterstraße 1, 12345 Musterstadt', 'pv', 250, 1100, 180, 32, 0.35]);
    
    // Create Storage sheet with template structure
    const storageSheet = workbook.addWorksheet('Storage');
    storageSheet.addRow(['location_id', 'location_name', 'address', 'product', 'existing_pv_kwp', 'annual_consumption_kwh', 'peak_load_kw', 'grid_connection_kw', 'electricity_price_eur']);
    storageSheet.addRow([1, 'Beispiel Speicher-Standort', 'Musterstraße 2, 12345 Musterstadt', 'storage', 100, 50000, 80, 150, 0.35]);
    
    // Create Charging sheet with template structure
    const chargingSheet = workbook.addWorksheet('Charging');
    chargingSheet.addRow(['location_id', 'location_name', 'address', 'product', 'parking_spaces', 'daily_traffic_volume', 'avg_parking_duration_min', 'grid_connection_kw', 'ev_density_percent']);
    chargingSheet.addRow([1, 'Beispiel Ladeinfrastruktur-Standort', 'Musterstraße 3, 12345 Musterstadt', 'charging', 50, 1500, 120, 200, 12]);
    
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
