'use client';

import { useState, useEffect } from 'react';
import SingleScoreCard from './SingleScoreCard';
import { getApiUrl } from '@/lib/api';

interface FactorConfig {
  label: string;
  unit: string;
  description: string;
  min?: number;
  max?: number;
  optimal?: string;
  weight: number;
  optimal_value?: number;
  optimal_min?: number;
  optimal_max?: number;
  type?: "boolean" | "dropdown";
  options?: string[];
}

interface ProductFactors {
  [key: string]: FactorConfig;
}

interface ScoreResult {
  location_name: string;
  product: string;
  score: number;
  factors_used: { [key: string]: number | string };
}

export default function ManualInput() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [locationName, setLocationName] = useState('');
  const [factors, setFactors] = useState<{ [key: string]: number | string | boolean }>({});
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
      
      const apiUrl = getApiUrl(`/api/product-factors/${selectedProduct}`);
      console.log('Fetching from:', apiUrl);
      
      fetch(apiUrl, {
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
          const initialFactors: { [key: string]: number | string | boolean } = {};
          Object.keys(data).forEach(key => {
            const config = data[key];
            if (!config || typeof config !== 'object') return;
            
            // Handle boolean type
            if (config.type === 'boolean') {
              initialFactors[key] = false; // Default: Nein
            }
            // Handle dropdown type
            else if (config.type === 'dropdown' && config.options && config.options.length > 0) {
              initialFactors[key] = config.options[0]; // Default: first option
            }
            // Handle numeric types
            else if (config.min !== undefined && config.max !== undefined) {
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
            }
          });
          setFactors(initialFactors);
          setResult(null);
          setLoading(false);
        })
        .catch(err => {
          clearTimeout(timeoutId);
          console.error('Fehler beim Laden der Faktoren:', err);
          console.error('API URL war:', apiUrl);
          console.error('Window location:', typeof window !== 'undefined' ? window.location.href : 'N/A');
          
          let errorMessage = 'Backend-Verbindung fehlgeschlagen. ';
          
          if (err.name === 'AbortError') {
            errorMessage += 'Das Backend antwortet nicht (Timeout nach 5 Sekunden). ';
          } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            errorMessage += 'Netzwerkfehler - API Route ist nicht erreichbar. ';
          } else {
            errorMessage += err.message + '. ';
          }
          
          // Zusätzliche Hilfe basierend auf der Umgebung
          if (typeof window !== 'undefined') {
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isLocalhost) {
              errorMessage += 'Bitte prüfen Sie, ob der Next.js Dev-Server läuft: `npm run dev`';
            } else {
              errorMessage += `Bitte prüfen Sie die Browser-Konsole (F12) für Details. API URL: ${apiUrl}`;
            }
          }
          
          setError(errorMessage);
          setLoading(false);
        });
    }
  }, [selectedProduct]);

  const handleFactorChange = (key: string, value: number | string | boolean) => {
    setFactors(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !locationName || !productFactors) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('/api/score/manual'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location_name: locationName,
          product: selectedProduct,
          factors: Object.fromEntries(
            Object.entries(factors).map(([key, value]) => {
              // Convert boolean to number for API
              if (typeof value === 'boolean') {
                return [key, value ? 1 : 0];
              }
              // Keep string values for dropdown (will be handled by API)
              return [key, value];
            })
          ),
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
          `1. Funktioniert die Next.js API Route?\n` +
          `2. Ist die Anwendung korrekt deployed?`
        );
      } else {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Input Form */}
      <div className="space-y-6">
        {/* Product Selection */}
        {!selectedProduct ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Produkttyp wählen
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              Wählen Sie zunächst, welches Produkt Sie bewerten möchten
            </p>

            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product.id)}
                  className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left group"
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
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
            {/* Header with product and back button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl sm:text-3xl">
                  {products.find(p => p.id === selectedProduct)?.icon}
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {products.find(p => p.id === selectedProduct)?.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
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
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 underline self-start sm:self-auto"
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
                        <strong>Lösung:</strong> Das Backend ist integriert in Next.js API Routes. Bitte prüfen Sie, ob die API Routes korrekt deployed sind.
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
                // Handle boolean type (Eigentümer)
                if (config.type === 'boolean') {
                  const currentValue = factors[key] === true || factors[key] === 'true' || factors[key] === 1;
                  return (
                    <div key={key} className="space-y-3 pb-6 border-b border-gray-100 last:border-b-0">
                      <label className="block text-sm font-semibold text-gray-900">
                        {config.label}
                      </label>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {config.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <button
                          type="button"
                          onClick={() => handleFactorChange(key, true)}
                          className={`flex-1 px-4 py-3 rounded-md font-medium transition-all ${
                            currentValue
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Ja
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFactorChange(key, false)}
                          className={`flex-1 px-4 py-3 rounded-md font-medium transition-all ${
                            !currentValue
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Nein
                        </button>
                      </div>
                    </div>
                  );
                }
                
                // Handle dropdown type (Branche)
                if (config.type === 'dropdown' && config.options) {
                  const currentValue = factors[key] || config.options[0];
                  return (
                    <div key={key} className="space-y-3 pb-6 border-b border-gray-100 last:border-b-0">
                      <label className="block text-sm font-semibold text-gray-900">
                        {config.label}
                      </label>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {config.description}
                      </p>
                      <select
                        value={String(currentValue)}
                        onChange={(e) => handleFactorChange(key, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mt-3"
                      >
                        {config.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                
                // Handle numeric types (with slider and number input)
                if (config.min !== undefined && config.max !== undefined) {
                  // Use step from config if available, otherwise calculate
                  const step = (config as any).step || (config.max > 1000 ? 100 : config.max > 100 ? 10 : config.max > 10 ? 1 : 0.01);
                  const currentValue = typeof factors[key] === 'number' ? factors[key] : (config.min || 0);
                  
                  // Format display value for Umsatz (show in 1k format)
                  const formatValue = (val: number) => {
                    if (key === 'umsatz') {
                      return `${val} × 1k`;
                    }
                    return val.toString();
                  };
                  
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
                            onChange={(e) => handleFactorChange(key, parseFloat(e.target.value) || config.min || 0)}
                            className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md text-center font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        {/* Range Labels */}
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatValue(config.min)}</span>
                          <span>{formatValue(config.max)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return null;
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
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-12 text-center">
            <div className="text-gray-300 mb-4 sm:mb-6">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto"
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
