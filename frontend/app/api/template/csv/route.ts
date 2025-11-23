import { NextResponse } from 'next/server';

export async function GET() {
  // CSV Template mit reduzierten Faktoren (Top 5)
  const csvContent = `location_id,location_name,product,roof_area_sqm,solar_irradiation,roof_orientation_degrees,roof_tilt_degrees,electricity_price_eur
1,Beispiel PV-Standort,pv,250,1100,180,32,0.35
2,Beispiel Speicher-Standort,storage,50,80000,120,150,0.35
3,Beispiel Ladeinfrastruktur-Standort,charging,50,1500,120,200,12`;

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=standort_template.csv',
    },
  });
}


