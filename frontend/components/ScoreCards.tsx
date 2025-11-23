'use client';

interface ScoreResult {
  location_name: string;
  scores: {
    pv: number;
    storage: number;
    charging: number;
  };
}

interface ScoreCardsProps {
  result: ScoreResult;
}

export default function ScoreCards({ result }: ScoreCardsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-blue-500 to-blue-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Ausgezeichnet';
    if (score >= 60) return 'Gut';
    if (score >= 40) return 'Mittel';
    return 'Niedrig';
  };

  const products = [
    {
      key: 'pv',
      name: 'Photovoltaik',
      icon: '☀️',
      description: 'Solarenergieanlage zur Stromerzeugung',
      score: result.scores.pv,
    },
    {
      key: 'storage',
      name: 'Energiespeicher',
      icon: '🔋',
      description: 'Batteriespeichersystem für Energie',
      score: result.scores.storage,
    },
    {
      key: 'charging',
      name: 'Ladeinfrastruktur',
      icon: '🔌',
      description: 'E-Auto Ladestation',
      score: result.scores.charging,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-bold text-gray-900">
          Standort: {result.location_name}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Erfolgswahrscheinlichkeit nach Produkttyp
        </p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 gap-6">
        {products.map((product) => (
          <div
            key={product.key}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className={`h-2 bg-gradient-to-r ${getScoreColor(product.score)}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{product.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {product.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {product.score.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    von 100
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Erfolgswahrscheinlichkeit</span>
                  <span className="font-semibold text-gray-900">
                    {getScoreLabel(product.score)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${getScoreColor(
                      product.score
                    )} transition-all duration-500`}
                    style={{ width: `${product.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="space-y-1">
                    <div className={`h-16 bg-gray-200 rounded relative overflow-hidden ${
                      product.score >= 20 ? 'bg-opacity-50' : ''
                    }`}>
                      {product.score >= 20 && (
                        <div 
                          className={`absolute bottom-0 w-full bg-gradient-to-r ${getScoreColor(product.score)}`}
                          style={{ height: `${Math.min((product.score / 20) * 100, 100)}%` }}
                        ></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">0-20</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-16 bg-gray-200 rounded relative overflow-hidden ${
                      product.score >= 40 ? 'bg-opacity-50' : ''
                    }`}>
                      {product.score >= 40 && (
                        <div 
                          className={`absolute bottom-0 w-full bg-gradient-to-r ${getScoreColor(product.score)}`}
                          style={{ height: `${Math.min(((product.score - 20) / 20) * 100, 100)}%` }}
                        ></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">20-40</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-16 bg-gray-200 rounded relative overflow-hidden ${
                      product.score >= 60 ? 'bg-opacity-50' : ''
                    }`}>
                      {product.score >= 60 && (
                        <div 
                          className={`absolute bottom-0 w-full bg-gradient-to-r ${getScoreColor(product.score)}`}
                          style={{ height: `${Math.min(((product.score - 40) / 20) * 100, 100)}%` }}
                        ></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">40-60</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-16 bg-gray-200 rounded relative overflow-hidden ${
                      product.score >= 80 ? 'bg-opacity-50' : ''
                    }`}>
                      {product.score >= 80 && (
                        <div 
                          className={`absolute bottom-0 w-full bg-gradient-to-r ${getScoreColor(product.score)}`}
                          style={{ height: `${Math.min(((product.score - 60) / 20) * 100, 100)}%` }}
                        ></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">60-80</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-16 bg-gray-200 rounded relative overflow-hidden ${
                      product.score >= 100 ? 'bg-opacity-50' : ''
                    }`}>
                      {product.score > 80 && (
                        <div 
                          className={`absolute bottom-0 w-full bg-gradient-to-r ${getScoreColor(product.score)}`}
                          style={{ height: `${Math.min(((product.score - 80) / 20) * 100, 100)}%` }}
                        ></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">80-100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


