'use client';

import { useState } from 'react';
import ManualInput from '@/components/ManualInput';
import FileUpload from '@/components/FileUpload';
import FactorWeightsMatrix from '@/components/FactorWeightsMatrix';

export default function Home() {
  const [activeMode, setActiveMode] = useState<'manual' | 'upload'>('manual');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              VIMGRID Location Tool
            </h1>
            <p className="mt-1 text-sm text-gray-500 italic">
              zu Zwecken der Veranschaulichung
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Berechnung der Erfolgswahrscheinlichkeit von PV-, Speicher- und Ladeinfrastruktur-Standorten
            </p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <img 
              src="/vimgrid_logo_png.png" 
              alt="VIM GRID Logo" 
              className="h-20 w-auto object-contain max-w-[150px]"
              style={{ imageRendering: 'auto' }}
              onError={(e) => {
                // Fallback: Versuche andere Formate
                const target = e.target as HTMLImageElement;
                if (target.src.includes('_png.png')) {
                  target.src = '/vimgrid_logo.jpeg';
                } else if (target.src.includes('.jpeg')) {
                  target.src = '/vimgrid-logo.svg';
                } else {
                  // Letzter Fallback: Zeige Text
                  target.style.display = 'none';
                  if (target.parentElement && !target.parentElement.querySelector('.logo-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'logo-fallback text-blue-600 font-bold text-lg';
                    fallback.textContent = 'VIMGRID';
                    target.parentElement.appendChild(fallback);
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-1.5 inline-flex mb-8 border border-gray-200">
          <button
            onClick={() => setActiveMode('manual')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
              activeMode === 'manual'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Manuelle Eingabe</span>
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
              activeMode === 'upload'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Datei Upload</span>
          </button>
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {activeMode === 'manual' ? <ManualInput /> : <FileUpload />}
        </div>

        {/* Factor Weights Matrix */}
        <FactorWeightsMatrix />
      </div>
    </main>
  );
}
