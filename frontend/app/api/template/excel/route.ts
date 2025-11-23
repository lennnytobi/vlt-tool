import { NextResponse } from 'next/server';

export async function GET() {
  // Excel Template als CSV (Excel kann CSV importieren)
  // Für echte Excel-Dateien würde man eine Bibliothek wie 'xlsx' benötigen
  const csvContent = `location_id,location_name,product,roof_area_sqm,solar_irradiation,roof_orientation_degrees,roof_tilt_degrees,electricity_price_eur,existing_pv_kwp,annual_consumption_kwh,peak_load_kw,grid_connection_kw,parking_spaces,daily_traffic_volume,avg_parking_duration_min,ev_density_percent
1,Bürogebäude München Zentrum,pv,450,1150,180,32,0.38,,,,,,,
2,Lagerhalle Berlin Nord,pv,2500,980,170,25,0.35,,,,,,,
10,Krankenhaus Frankfurt Uniklinik,storage,,,,,0.35,200,450000,350,400,,,
11,Rechenzentrum Köln Mediapark,storage,,,,,0.32,150,380000,320,350,,,
20,Einkaufszentrum Köln Neumarkt,charging,,,,,,,150,80,3500,180,15
21,Autobahnraststätte A9 Nord,charging,,,,,,,350,150,8000,45,8`;

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=standort_template.csv',
    },
  });
}

