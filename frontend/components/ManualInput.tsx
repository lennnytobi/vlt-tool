'use client';

import { useState, useEffect } from 'react';
import SingleScoreCard from './SingleScoreCard';
import { API_URL } from '@/lib/api';

interface FactorConfig {
  label: string;
  unit: string;
  description: string;
  min: number;
  max: number;
  optimal: string;
  weight: number;
  optimal_value?: number;
  optimal_min?: number;
  optimal_max?: number;
}

interface ProductFactors {
  [key: string]: FactorConfig;
}

interface ScoreResult {
  location_name: string;
  product: string;
  score: number;
  factors_used: { [key: string]: number };
}

export default function ManualInput() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [locationName, setLocationName] = useState('');
  const [factors, setFactors] = useState<{ [key: string]: number }>({});
  const [productFactors, setProductFactors] = useState<ProductFactors | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const products = [
    {
      id: 'pv',
      name: 'Photovoltaik',
      icon: '☀️',
      description: 'Solarenergieanlage zur Stromerzeugung',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'storage',
      name: 'Energiespeicher',
      icon: '🔋',
      description: 'Batteriespeichersystem für Energie',
      color: 'from-blue-400 to-indigo-500'
    },
    {
      id: 'charging',
      name: 'Ladeinfrastruktur',
      icon: '🔌',
      description: 'E-Auto Ladestation',
      color: 'from-green-400 to-emerald-500'
    },
  ];

  // Lade Faktordefinitionen wenn Produkt gewählt wird
  useEffect(() => {
    if (selectedProduct) {
      setError(null);
      setLoading(true);
      
      // Timeout für API-Call (5 Sekunden für schnellere Fehlerbehandlung)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      fetch(`${API_URL}/api/product-factors/${selectedProduct}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(res => {
          clearTimeout(timeoutId);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          if (!data || typeof data !== 'object') {
            throw new Error('Ungültige Antwort vom Backend');
          }
          setProductFactors(data);
          // Initialisiere Faktoren mit realistischen Standardwerten
          const initialFactors: { [key: string]: number } = {};
          Object.keys(data).forEach(key => {
            const config = data[key];
            if (!config || typeof config !== 'object') return;
            // Verwende gültige Werte basierend auf dem optimal-Typ
            if (config.optimal === 'target' && config.optimal_value !== undefined) {
              // Für target: Verwende den optimalen Wert
              initialFactors[key] = config.optimal_value;
            } else if (config.optimal === 'range' && config.optimal_min !== undefined && config.optimal_max !== undefined) {
              // Für range: Verwende die Mitte des optimalen Bereichs
              initialFactors[key] = (config.optimal_min + config.optimal_max) / 2;
            } else {
              // Für higher/lower: Verwende 60% des Bereichs (guter Wert)
              const range = config.max - config.min;
              initialFactors[key] = config.min + (range * 0.6);
            }
          });
          setFactors(initialFactors);
          setResult(null);
          setLoading(false);
        })
        .catch(err => {
          clearTimeout(timeoutId);
          console.error('Fehler beim Laden der Faktoren:', err);
          
          let errorMessage = 'Backend-Verbindung fehlgeschlagen. ';
          
          if (err.name === 'AbortError') {
            errorMessage += 'Das Backend antwortet nicht (Timeout). ';
          } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            errorMessage += 'Netzwerkfehler - Backend ist nicht erreichbar. ';
          } else {
            errorMessage += err.message + '. ';
          }
          
          // Zusätzliche Hilfe basierend auf der Umgebung
          if (typeof window !== 'undefined') {
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isLocalhost) {
              errorMessage += 'Lokales Backend starten: `uvicorn main:app --reload`';
            } else {
              errorMessage += 'Bitte prüfen Sie NEXT_PUBLIC_API_URL in Vercel Environment Variables. Aktuell: ' + API_URL;
            }
          }
          
          setError(errorMessage);
          setLoading(false);
        });
    }
  }, [selectedProduct]);

  const handleFactorChange = (key: string, value: number) => {
    setFactors(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !locationName || !productFactors) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/score/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location_name: locationName,
          product: selectedProduct,
          factors: factors,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Fehler bei der Berechnung';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(
          `Backend nicht erreichbar. Bitte prüfen Sie:\n` +
          `1. Ist NEXT_PUBLIC_API_URL in Vercel Environment Variables gesetzt?\n` +
          `2. Läuft das Backend und ist es erreichbar?\n` +
          `Aktuelle API_URL: ${API_URL}`
        );
      } else {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="space-y-6">
        {/* Product Selection */}
        {!selectedProduct ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Produkttyp wählen
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Wählen Sie zunächst, welches Produkt Sie bewerten möchten
            </p>

            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product.id)}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${product.color} flex-shrink-0`}>
                      {product.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {product.description}
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Header with product and back button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">
                  {products.find(p => p.id === selectedProduct)?.icon}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {products.find(p => p.id === selectedProduct)?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Faktoren eingeben
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct('');
                  setResult(null);
                  setLocationName('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Produkt wechseln
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Backend-Verbindung fehlgeschlagen</h3>
                      <p className="text-sm">{error}</p>
                      <p className="text-xs mt-2 text-red-700">
                        <strong>Lösung:</strong> Stellen Sie sicher, dass NEXT_PUBLIC_API_URL in Vercel Environment Variables gesetzt ist und das Backend läuft.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && !productFactors && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-sm text-gray-600 mt-2">Lade Faktordefinitionen...</p>
                </div>
              )}

              {/* Location Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Standortname
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="z.B. Parkhaus Innenstadt"
                  required
                  disabled={!productFactors}
                />
              </div>

              {/* Factors */}
              {productFactors && Object.entries(productFactors).map(([key, config]) => {
                const step = config.max > 1000 ? 100 : config.max > 100 ? 10 : config.max > 10 ? 1 : 0.01;
                const currentValue = factors[key] || config.min;
                
                return (
                  <div key={key} className="space-y-3 pb-6 border-b border-gray-100 last:border-b-0">
                    <label className="block text-sm font-semibold text-gray-900">
                      {config.label}
                      <span className="text-gray-500 font-normal ml-2">({config.unit})</span>
                    </label>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {config.description}
                    </p>
                    
                    {/* Slider and Number Input */}
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min={config.min}
                          max={config.max}
                          step={step}
                          value={currentValue}
                          onChange={(e) => handleFactorChange(key, parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentValue - config.min) / (config.max - config.min)) * 100}%, #e5e7eb ${((currentValue - config.min) / (config.max - config.min)) * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        <input
                          type="number"
                          min={config.min}
                          max={config.max}
                          step={step}
                          value={currentValue}
                          onChange={(e) => handleFactorChange(key, parseFloat(e.target.value) || config.min)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      {/* Range Labels */}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{config.min} {config.unit}</span>
                        <span>{config.max} {config.unit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !productFactors || Object.keys(factors).length === 0}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? 'Berechne...' : !productFactors ? 'Faktoren werden geladen...' : 'Score berechnen'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {result && selectedProduct && productFactors ? (
          <SingleScoreCard result={result} productFactors={productFactors} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-300 mb-6">
              <svg
                className="w-20 h-20 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bereit zum Berechnen
            </h3>
            <p className="text-gray-600 text-sm">
              {selectedProduct 
                ? 'Geben Sie die Faktoren ein und berechnen Sie den Score'
                : 'Wählen Sie ein Produkt, um zu beginnen'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
