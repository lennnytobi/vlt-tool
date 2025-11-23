'use client';

interface FactorConfig {
  label: string;
  unit: string;
  description: string;
  min: number;
  max: number;
  optimal: string;
  optimal_value?: number;
  optimal_min?: number;
  optimal_max?: number;
  optimal_max_limit?: number; // Falls im Backend "optimal_max" für lower verwendet wurde
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

interface SingleScoreCardProps {
  result: ScoreResult;
  productFactors?: ProductFactors;
}

export default function SingleScoreCard({ result, productFactors }: SingleScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-blue-500 to-blue-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };


  const productInfo = {
    pv: { name: 'Photovoltaik', icon: '☀️', description: 'Solarenergieanlage' },
    storage: { name: 'Energiespeicher', icon: '🔋', description: 'Batteriespeicher' },
    charging: { name: 'Ladeinfrastruktur', icon: '🔌', description: 'E-Auto Ladestation' },
  };

  const info = productInfo[result.product as keyof typeof productInfo] || 
    { name: result.product, icon: '📊', description: '' };

  // Helper function to normalize score (0-1) locally for UI indication
  const getFactorStatus = (key: string, value: number): 'good' | 'bad' | 'neutral' => {
    if (!productFactors || !productFactors[key]) return 'neutral';
    const config = productFactors[key];
    
    // Sicherstellen, dass value eine gültige Zahl ist
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return 'neutral';
    
    let normalized = 0.5;
    const range = config.max - config.min;
    
    // Division durch Null vermeiden
    if (range === 0) return 'neutral';
    
    try {
      // Einfache Normalisierungslogik (repliziert Backend-Logik vereinfacht)
      if (config.optimal === 'higher') {
        normalized = Math.max(0, Math.min(1, (value - config.min) / range));
      } else if (config.optimal === 'lower') {
        normalized = Math.max(0, Math.min(1, 1.0 - (value - config.min) / range));
      } else if (config.optimal === 'target' && config.optimal_value !== undefined) {
        const maxDev = Math.max(Math.abs(config.optimal_value - config.min), Math.abs(config.max - config.optimal_value));
        if (maxDev === 0) return 'neutral';
        normalized = Math.max(0, Math.min(1, 1.0 - (Math.abs(value - config.optimal_value) / maxDev)));
      } else if (config.optimal === 'range' && config.optimal_min !== undefined && config.optimal_max !== undefined) {
        if (value >= config.optimal_min && value <= config.optimal_max) {
          normalized = 1.0;
        } else if (value < config.optimal_min) {
          const minRange = config.optimal_min - config.min;
          normalized = minRange > 0 ? Math.max(0, (value - config.min) / minRange) : 0;
        } else {
          const maxRange = config.max - config.optimal_max;
          normalized = maxRange > 0 ? Math.max(0, 1.0 - (value - config.optimal_max) / maxRange) : 0;
        }
      }
      
      // Sicherstellen, dass normalized gültig ist
      if (isNaN(normalized) || !isFinite(normalized)) return 'neutral';
      
      if (normalized >= 0.75) return 'good';
      if (normalized <= 0.25) return 'bad';
      return 'neutral';
    } catch (error) {
      console.error('Error calculating factor status:', error);
      return 'neutral';
    }
  };

  const getIndicators = () => {
    if (!productFactors) return { good: [], bad: [] };
    
    const good: Array<{ label: string, value: number, unit: string }> = [];
    const bad: Array<{ label: string, value: number, unit: string }> = [];

    Object.entries(result.factors_used).forEach(([key, value]) => {
      const status = getFactorStatus(key, value);
      const config = productFactors[key];
      if (!config) return;

      const item = { label: config.label, value, unit: config.unit };
      if (status === 'good') good.push(item);
      if (status === 'bad') bad.push(item);
    });

    return { good, bad };
  };

  const indicators = getIndicators();

  return (
    <div className="space-y-6">
      {/* Combined Location Name and Score Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Colored Top Bar */}
        <div className={`h-3 bg-gradient-to-r ${getScoreColor(result.score)}`}></div>
        
        <div className="p-8">
          {/* Location Name and Product Info */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {result.location_name}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="text-lg">{info.icon}</span>
              <span className="font-medium">{info.name}</span>
              {info.description && <span>• {info.description}</span>}
            </div>
          </div>

          {/* Main Score Display */}
          <div className="text-center mb-8">
            <div className="inline-flex items-baseline space-x-3">
              <span className={`text-7xl font-bold bg-gradient-to-r ${getScoreColor(result.score)} bg-clip-text text-transparent`}>
                {result.score.toFixed(1)}
              </span>
              <span className="text-3xl text-gray-400 font-medium">/100</span>
            </div>
            
            {/* Score Scale */}
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
              <div className="relative h-4 rounded-full overflow-hidden bg-gray-200">
                <div className="absolute inset-0 flex">
                  <div className="flex-1 bg-gradient-to-r from-red-500 to-red-400"></div>
                  <div className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-400"></div>
                  <div className="flex-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
                  <div className="flex-1 bg-gradient-to-r from-green-500 to-green-400"></div>
                </div>
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-gray-900 shadow-lg"
                  style={{ left: `${result.score}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span className="text-red-600">Niedrig</span>
                <span className="text-yellow-600">Mittel</span>
                <span className="text-blue-600">Gut</span>
                <span className="text-green-600">Ausgezeichnet</span>
              </div>
            </div>
          </div>

          {/* Key Indicators Section */}
          {(indicators.good.length > 0 || indicators.bad.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-100">
              {/* Positiv */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Top Indikatoren
                </h3>
                {indicators.good.length > 0 ? (
                  <ul className="space-y-3">
                    {indicators.good.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-green-50 p-3 rounded-lg min-h-[3rem]">
                        <span className="text-sm font-medium text-gray-700 flex-1">{item.label}</span>
                        <span className="text-sm font-bold text-green-700 text-right whitespace-nowrap ml-4">
                          {typeof item.value === 'number' ? item.value.toLocaleString('de-DE', { maximumFractionDigits: 2 }) : item.value} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic min-h-[3rem] flex items-center">Keine besonders positiven Faktoren.</p>
                )}
              </div>

              {/* Negativ */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Limitierende Indikatoren
                </h3>
                {indicators.bad.length > 0 ? (
                  <ul className="space-y-3">
                    {indicators.bad.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-red-50 p-3 rounded-lg min-h-[3rem]">
                        <span className="text-sm font-medium text-gray-700 flex-1">{item.label}</span>
                        <span className="text-sm font-bold text-red-700 text-right whitespace-nowrap ml-4">
                          {typeof item.value === 'number' ? item.value.toLocaleString('de-DE', { maximumFractionDigits: 2 }) : item.value} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic min-h-[3rem] flex items-center">Keine kritischen Faktoren.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
