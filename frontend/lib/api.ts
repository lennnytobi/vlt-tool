/**
 * API Configuration
 * 
 * Verwendet Next.js API Routes (integriert im Frontend)
 * Kein separates Backend mehr nötig!
 * 
 * Falls ein externes Backend verwendet werden soll:
 * - Setzen Sie NEXT_PUBLIC_API_URL in Environment Variables
 * - Dann wird das externe Backend verwendet statt der API Routes
 */

// Wenn NEXT_PUBLIC_API_URL gesetzt ist, verwende externes Backend
// Sonst verwende lokale Next.js API Routes
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Im Browser: Verwende relative URLs für API Routes
// Im Server: Verwende absolute URL oder leer für relative
export function getApiUrl(endpoint: string): string {
  // Wenn externes Backend konfiguriert ist, verwende das
  if (API_URL) {
    return `${API_URL}${endpoint}`;
  }
  
  // Stelle sicher, dass endpoint mit / beginnt
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Im Browser: Verwende relative URL (Next.js API Routes)
  // Relative URLs funktionieren immer, egal ob localhost oder Vercel
  if (typeof window !== 'undefined') {
    return normalizedEndpoint;
  }
  
  // Server-Side Rendering: Verwende absolute URL
  // Auf Vercel: NEXT_PUBLIC_VERCEL_URL ist verfügbar
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  
  return `${baseUrl}${normalizedEndpoint}`;
}

/**
 * Helper für API-Anfragen mit Fehlerbehandlung
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = getApiUrl(endpoint);
  
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


