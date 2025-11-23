'use client';

interface ScoreResult {
  location_name: string;
  product: string;
  score: number;
  factors_used: { [key: string]: number };
}

interface SingleScoreCardProps {
  result: ScoreResult;
}

export default function SingleScoreCard({ result }: SingleScoreCardProps) {
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

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const productInfo = {
    pv: { name: 'Photovoltaik', icon: '☀️', description: 'Solarenergieanlage' },
    storage: { name: 'Energiespeicher', icon: '🔋', description: 'Batteriespeicher' },
    charging: { name: 'Ladeinfrastruktur', icon: '🔌', description: 'E-Auto Ladestation' },
  };

  const info = productInfo[result.product as keyof typeof productInfo] || 
    { name: result.product, icon: '📊', description: '' };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <h2 className="text-xl font-bold text-gray-900">
          {result.location_name}
        </h2>
        <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
          <span className="text-lg">{info.icon}</span>
          <span className="font-medium">{info.name}</span>
          {info.description && <span>• {info.description}</span>}
        </div>
      </div>

      {/* Score Card - Simplified */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Colored Top Bar */}
        <div className={`h-3 bg-gradient-to-r ${getScoreColor(result.score)}`}></div>
        
        <div className="p-12">
          {/* Main Score Display - Only this */}
          <div className="text-center">
            <div className="inline-flex items-baseline space-x-3">
              <span className={`text-7xl font-bold bg-gradient-to-r ${getScoreColor(result.score)} bg-clip-text text-transparent`}>
                {result.score.toFixed(1)}
              </span>
              <span className="text-3xl text-gray-400 font-medium">/100</span>
            </div>
            <div className={`inline-block mt-6 px-8 py-3 rounded-full border-2 ${getScoreBadgeColor(result.score)} font-semibold`}>
              {getScoreLabel(result.score)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

