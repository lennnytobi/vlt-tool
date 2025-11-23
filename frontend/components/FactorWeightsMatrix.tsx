'use client';

import { useState } from 'react';

interface FactorWeight {
  factor: string;
  label: string;
  weight: number;
  weightPercent: number;
}

interface ProductWeights {
  product: string;
  name: string;
  icon: string;
  description: string;
  factors: FactorWeight[];
}

const PRODUCT_WEIGHTS: ProductWeights[] = [
  {
    product: 'pv',
    name: 'Photovoltaik',
    icon: '☀️',
    description: 'Die Gewichtung für PV-Anlagen priorisiert Dachfläche und Sonneneinstrahlung, da diese direkt den Energieertrag bestimmen. Die Dachausrichtung (Süd optimal) und Dachneigung (25-40° optimal) haben ebenfalls hohe Bedeutung. Gemeinsame Faktoren wie Eigentümer, Umsatz, Mitarbeiterzahl und Branche werden für alle Produkte gleich gewichtet.',
    factors: [
      { factor: 'eigentuemer', label: 'Eigentümer', weight: 0.10, weightPercent: 10 },
      { factor: 'umsatz', label: 'Umsatz', weight: 0.10, weightPercent: 10 },
      { factor: 'mitarbeiterzahl', label: 'Mitarbeiterzahl', weight: 0.10, weightPercent: 10 },
      { factor: 'branche', label: 'Branche', weight: 0.10, weightPercent: 10 },
      { factor: 'roof_area_sqm', label: 'Dachfläche', weight: 0.20, weightPercent: 20 },
      { factor: 'solar_irradiation', label: 'Sonneneinstrahlung', weight: 0.15, weightPercent: 15 },
      { factor: 'roof_orientation_degrees', label: 'Dachausrichtung', weight: 0.15, weightPercent: 15 },
      { factor: 'roof_tilt_degrees', label: 'Dachneigung', weight: 0.10, weightPercent: 10 },
    ]
  },
  {
    product: 'storage',
    name: 'Energiespeicher',
    icon: '🔋',
    description: 'Bei Energiespeichern sind vorhandene PV-Leistung und Jahresverbrauch am wichtigsten, da sie den Speicherbedarf bestimmen. Spitzenlast und Netzanschluss sind kritisch für die Dimensionierung. Gemeinsame Faktoren wie Eigentümer, Umsatz, Mitarbeiterzahl und Branche werden für alle Produkte gleich gewichtet.',
    factors: [
      { factor: 'eigentuemer', label: 'Eigentümer', weight: 0.10, weightPercent: 10 },
      { factor: 'umsatz', label: 'Umsatz', weight: 0.10, weightPercent: 10 },
      { factor: 'mitarbeiterzahl', label: 'Mitarbeiterzahl', weight: 0.10, weightPercent: 10 },
      { factor: 'branche', label: 'Branche', weight: 0.10, weightPercent: 10 },
      { factor: 'existing_pv_kwp', label: 'Vorhandene PV-Leistung', weight: 0.20, weightPercent: 20 },
      { factor: 'annual_consumption_kwh', label: 'Jährlicher Stromverbrauch', weight: 0.20, weightPercent: 20 },
      { factor: 'peak_load_kw', label: 'Spitzenlast', weight: 0.15, weightPercent: 15 },
      { factor: 'grid_connection_kw', label: 'Netzanschlussleistung', weight: 0.10, weightPercent: 10 },
    ]
  },
  {
    product: 'charging',
    name: 'Ladeinfrastruktur',
    icon: '🔌',
    description: 'Für Ladeinfrastruktur sind Parkplätze und Verkehrsaufkommen entscheidend, da sie das Potenzial für Nutzung bestimmen. Die E-Auto-Dichte zeigt die aktuelle Nachfrage. Gemeinsame Faktoren wie Eigentümer, Umsatz, Mitarbeiterzahl und Branche werden für alle Produkte gleich gewichtet.',
    factors: [
      { factor: 'eigentuemer', label: 'Eigentümer', weight: 0.10, weightPercent: 10 },
      { factor: 'umsatz', label: 'Umsatz', weight: 0.10, weightPercent: 10 },
      { factor: 'mitarbeiterzahl', label: 'Mitarbeiterzahl', weight: 0.10, weightPercent: 10 },
      { factor: 'branche', label: 'Branche', weight: 0.10, weightPercent: 10 },
      { factor: 'parking_spaces', label: 'Anzahl Parkplätze', weight: 0.20, weightPercent: 20 },
      { factor: 'daily_traffic_volume', label: 'Tägliches Verkehrsaufkommen', weight: 0.20, weightPercent: 20 },
      { factor: 'avg_parking_duration_min', label: 'Durchschnittliche Parkdauer', weight: 0.10, weightPercent: 10 },
      { factor: 'grid_connection_kw', label: 'Netzanschlussleistung', weight: 0.10, weightPercent: 10 },
    ]
  }
];

export default function FactorWeightsMatrix() {
  const [selectedProduct, setSelectedProduct] = useState<string>('pv');

  const currentProduct = PRODUCT_WEIGHTS.find(p => p.product === selectedProduct) || PRODUCT_WEIGHTS[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mt-6 sm:mt-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Erfolgsfaktoren-Matrix
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 italic">
          zu Zwecken der Veranschaulichung
        </p>
        <p className="mt-2 text-xs sm:text-sm text-gray-600">
          Übersicht der Gewichtung einzelner Faktoren für die Score-Berechnung
        </p>
      </div>

      {/* Product Selector */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {PRODUCT_WEIGHTS.map((product) => (
          <button
            key={product.product}
            onClick={() => setSelectedProduct(product.product)}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 flex items-center space-x-2 ${
              selectedProduct === product.product
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-lg sm:text-xl">{product.icon}</span>
            <span className="hidden xs:inline">{product.name}</span>
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          {currentProduct.description}
        </p>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-900">
                Faktor
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-900">
                Gewicht
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProduct.factors.map((factor, index) => {
              return (
                <tr key={factor.factor} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <span className="text-base sm:text-lg font-bold text-gray-400 w-5 sm:w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm sm:text-base font-medium text-gray-900">
                        {factor.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <span className="text-lg sm:text-xl font-bold text-gray-900">
                      {factor.weightPercent}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Wie funktioniert die Gewichtung?</p>
            <p className="leading-relaxed">
              Jeder Faktor wird auf einer Skala von 0-1 normalisiert und dann mit seinem Gewicht multipliziert. 
              Die Summe aller gewichteten Faktoren ergibt den finalen Score (0-100). 
              Höhere Gewichte bedeuten, dass dieser Faktor stärker in die Bewertung einfließt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

