'use client';

import { useState } from 'react';

interface ScoreResult {
  location_id?: number;
  location_name: string;
  product: string;
  score: number;
  factors_used: { [key: string]: number };
}

interface ScoreDisplayProps {
  results: ScoreResult[];
}

type SortKey = 'location_name' | 'product' | 'score';
type SortDirection = 'asc' | 'desc';

export default function ScoreDisplay({ results }: ScoreDisplayProps) {
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection(key === 'score' ? 'desc' : 'asc');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortKey === 'location_name') {
      aValue = a.location_name;
      bValue = b.location_name;
    } else if (sortKey === 'product') {
      aValue = a.product;
      bValue = b.product;
    } else {
      aValue = a.score;
      bValue = b.score;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-green-600';
    if (score >= 60) return 'bg-gradient-to-r from-blue-500 to-blue-600';
    if (score >= 40) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  const productInfo: { [key: string]: { name: string; icon: string } } = {
    pv: { name: 'PV', icon: '☀️' },
    storage: { name: 'Speicher', icon: '🔋' },
    charging: { name: 'Laden', icon: '🔌' },
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return (
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg
        className="w-4 h-4 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-2xl font-bold text-gray-900">Ergebnisse</h2>
        <p className="text-sm text-gray-600 mt-1">
          {results.length} {results.length === 1 ? 'Standort' : 'Standorte'} analysiert
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th
                onClick={() => handleSort('location_name')}
                className="px-8 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span>Standort</span>
                  <SortIcon column="location_name" />
                </div>
              </th>
              <th
                onClick={() => handleSort('product')}
                className="px-8 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span>Produkt</span>
                  <SortIcon column="product" />
                </div>
              </th>
              <th
                onClick={() => handleSort('score')}
                className="px-8 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span>Score</span>
                  <SortIcon column="score" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedResults.map((result, index) => {
              const product = productInfo[result.product] || { name: result.product, icon: '📊' };
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-medium text-gray-900">
                      {result.location_name}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{product.icon}</span>
                      <span className="font-medium text-gray-700">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${getScoreColor(
                            result.score
                          )}`}
                        >
                          {result.score.toFixed(1)}
                        </div>
                        <span className="text-xs text-gray-500 ml-4">von 100</span>
                      </div>
                      <div className="w-64">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${getScoreBarColor(result.score)}`}
                            style={{ width: `${result.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
