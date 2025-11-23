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
    description: 'Die Gewichtung für PV-Anlagen priorisiert Dachfläche und Sonneneinstrahlung, da diese direkt den Energieertrag bestimmen. Die Dachausrichtung (Süd optimal) und Dachneigung (25-40° optimal) haben ebenfalls hohe Bedeutung.',
    factors: [
      { factor: 'roof_area_sqm', label: 'Dachfläche', weight: 0.30, weightPercent: 30 },
      { factor: 'solar_irradiation', label: 'Sonneneinstrahlung', weight: 0.25, weightPercent: 25 },
      { factor: 'roof_orientation_degrees', label: 'Dachausrichtung', weight: 0.20, weightPercent: 20 },
      { factor: 'electricity_price_eur', label: 'Strompreis', weight: 0.15, weightPercent: 15 },
      { factor: 'roof_tilt_degrees', label: 'Dachneigung', weight: 0.10, weightPercent: 10 },
    ]
  },
  {
    product: 'storage',
    name: 'Energiespeicher',
    icon: '🔋',
    description: 'Bei Energiespeichern sind vorhandene PV-Leistung und Jahresverbrauch am wichtigsten, da sie den Speicherbedarf bestimmen. Spitzenlast und Netzanschluss sind kritisch für die Dimensionierung.',
    factors: [
      { factor: 'existing_pv_kwp', label: 'Vorhandene PV-Leistung', weight: 0.25, weightPercent: 25 },
      { factor: 'annual_consumption_kwh', label: 'Jährlicher Stromverbrauch', weight: 0.25, weightPercent: 25 },
      { factor: 'peak_load_kw', label: 'Spitzenlast', weight: 0.20, weightPercent: 20 },
      { factor: 'grid_connection_kw', label: 'Netzanschlussleistung', weight: 0.15, weightPercent: 15 },
      { factor: 'electricity_price_eur', label: 'Strompreis', weight: 0.15, weightPercent: 15 },
    ]
  },
  {
    product: 'charging',
    name: 'Ladeinfrastruktur',
    icon: '🔌',
    description: 'Für Ladeinfrastruktur sind Parkplätze und Verkehrsaufkommen entscheidend, da sie das Potenzial für Nutzung bestimmen. Die E-Auto-Dichte zeigt die aktuelle Nachfrage.',
    factors: [
      { factor: 'parking_spaces', label: 'Anzahl Parkplätze', weight: 0.30, weightPercent: 30 },
      { factor: 'daily_traffic_volume', label: 'Tägliches Verkehrsaufkommen', weight: 0.25, weightPercent: 25 },
      { factor: 'avg_parking_duration_min', label: 'Durchschnittliche Parkdauer', weight: 0.15, weightPercent: 15 },
      { factor: 'grid_connection_kw', label: 'Netzanschlussleistung', weight: 0.15, weightPercent: 15 },
      { factor: 'ev_density_percent', label: 'E-Auto-Dichte', weight: 0.15, weightPercent: 15 },
    ]
  }
];

export default function FactorWeightsMatrix() {
  const [selectedProduct, setSelectedProduct] = useState<string>('pv');

  const currentProduct = PRODUCT_WEIGHTS.find(p => p.product === selectedProduct) || PRODUCT_WEIGHTS[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Faktor-Gewichtungsmatrix
        </h2>
        <p className="text-sm text-gray-600">
          Übersicht der Gewichtung einzelner Faktoren für die Score-Berechnung
        </p>
      </div>

      {/* Product Selector */}
      <div className="flex space-x-2 mb-6">
        {PRODUCT_WEIGHTS.map((product) => (
          <button
            key={product.product}
            onClick={() => setSelectedProduct(product.product)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
              selectedProduct === product.product
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl">{product.icon}</span>
            <span>{product.name}</span>
          </button>
        ))}
      </div>

      {/* Description */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
        <p className="text-sm text-gray-700 leading-relaxed">
          {currentProduct.description}
        </p>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                Faktor
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                Gewicht
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 w-64">
                Anteil
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProduct.factors.map((factor, index) => {
              const colorIntensity = Math.min(100, factor.weightPercent * 2);
              return (
                <tr key={factor.factor} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {factor.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-bold text-gray-900">
                      {factor.weight.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${factor.weightPercent}%` }}
                        >
                          {factor.weightPercent >= 15 && (
                            <span className="text-xs font-bold text-white">
                              {factor.weightPercent}%
                            </span>
                          )}
                        </div>
                      </div>
                      {factor.weightPercent < 15 && (
                        <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                          {factor.weightPercent}%
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-300">
              <td className="px-6 py-4 font-bold text-gray-900">
                Gesamt
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-lg font-bold text-gray-900">
                  1.00
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="text-lg font-bold text-gray-900">
                  100%
                </span>
              </td>
            </tr>
          </tfoot>
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

