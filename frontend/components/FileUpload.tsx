'use client';

import { useState } from 'react';
import ScoreDisplay from './ScoreDisplay';
import { getApiUrl } from '@/lib/api';

interface ScoreResult {
  location_id: number;
  location_name: string;
  product: string;
  score: number;
  factors_used: { [key: string]: number };
}

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ScoreResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(getApiUrl('/api/score/csv'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Fehler beim Hochladen');
      }

      // Check if response is Excel file
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('spreadsheetml') || contentType?.includes('excel')) {
        // Download Excel file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'standorte_mit_scores.xlsx'
          : 'standorte_mit_scores.xlsx';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Show success message
        setError(null);
        // Optionally show results in table too
        // For now, just show success
      } else {
        // JSON response (CSV)
        const data = await response.json();
        setResults(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          CSV oder Excel-Datei hochladen
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3 text-green-600">
                  <svg
                    className="w-8 h-8 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-base font-medium text-gray-900">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
                >
                  Andere Datei wählen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <svg
                  className="w-12 h-12 mx-auto text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div>
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-500 hover:text-blue-600 font-semibold transition-colors"
                  >
                    Datei auswählen
                  </label>
                  <span className="text-gray-600"> oder hierhin ziehen</span>
                </div>
                <p className="text-sm text-gray-500">
                  CSV oder Excel-Dateien (.csv, .xlsx, .xls)
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          {file && (
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Verarbeite...' : 'Scores berechnen'}
            </button>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </form>

        {/* Template Download */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Template */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Excel-Vorlage
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Laden Sie unsere Vorlagen-Datei herunter, die bereits alle erforderlichen Spalten enthält.
                </p>
                <a
                  href={getApiUrl('/api/template/excel')}
                  download="standort_template.xlsx"
                  className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-md border border-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Vorlage herunterladen</span>
                </a>
              </div>
            </div>
          </div>

          {/* Mock Data */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Testdaten
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Laden Sie Beispieldaten herunter (20 Einträge pro Produkt), um die Anwendung zu testen.
                </p>
                <a
                  href={getApiUrl('/api/template/mock')}
                  download="mock_standorte.xlsx"
                  className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-md border border-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Testdaten herunterladen</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && results.length > 0 && <ScoreDisplay results={results} />}
    </div>
  );
}

