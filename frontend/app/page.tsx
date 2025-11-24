'use client';

import { useState } from 'react';
import Image from 'next/image';
import ManualInput from '@/components/ManualInput';
import FileUpload from '@/components/FileUpload';
import FactorWeightsMatrix from '@/components/FactorWeightsMatrix';

export default function Home() {
  const [activeMode, setActiveMode] = useState<'manual' | 'upload'>('manual');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                VIMGRID Location Tool
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 italic">
                zu Zwecken der Veranschaulichung
              </p>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">
                Berechnung der Erfolgswahrscheinlichkeit von PV-, Speicher- und Ladeinfrastruktur-Standorten
              </p>
            </div>
            <div className="flex-shrink-0 sm:ml-4 flex items-center h-full">
              <Image 
                src="/vimgrid_logo_png.png" 
                alt="VIM GRID Logo" 
                width={150}
                height={80}
                className="h-12 sm:h-16 w-auto object-contain"
                priority
                unoptimized
                style={{ 
                  maxWidth: '120px',
                  height: 'auto',
                  imageRendering: 'auto'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-1.5 flex mb-6 sm:mb-8 border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveMode('manual')}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeMode === 'manual'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden xs:inline">Manuelle Eingabe</span>
            <span className="xs:hidden">Manuell</span>
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeMode === 'upload'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden xs:inline">Datei Upload</span>
            <span className="xs:hidden">Upload</span>
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
