/**
 * API Configuration
 * 
 * Verwendung der Environment Variable für Production-Deployments
 * Lokale Entwicklung: http://localhost:8000
 * Production: Wird über NEXT_PUBLIC_API_URL gesetzt
 * 
 * WICHTIG für Vercel Deployment:
 * - In Vercel Dashboard → Settings → Environment Variables
 * - Key: NEXT_PUBLIC_API_URL
 * - Value: Ihre Backend-URL (z.B. https://vlt-tool-production.up.railway.app)
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Warnung in der Konsole, wenn API_URL nicht gesetzt ist (nur im Browser)
if (typeof window !== 'undefined' && API_URL === 'http://localhost:8000') {
  console.warn(
    '⚠️ API_URL nicht konfiguriert! Verwende localhost:8000.\n' +
    'Für Production: Setzen Sie NEXT_PUBLIC_API_URL in Vercel Environment Variables.'
  );
}

/**
 * Helper für API-Anfragen mit Fehlerbehandlung
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Ein unerwarteter Fehler ist aufgetreten');
  }
}


