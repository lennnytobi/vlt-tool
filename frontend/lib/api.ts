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
  if (typeof window !== 'undefined') {
    // Browser: Verwende relative URL (Next.js API Routes)
    if (!API_URL) {
      return endpoint;
    }
    // Externes Backend ist konfiguriert
    return `${API_URL}${endpoint}`;
  }
  
  // Server-Side: Verwende absolute URL oder relative
  if (API_URL) {
    return `${API_URL}${endpoint}`;
  }
  
  // Fallback für Server-Side Rendering
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';
  
  return `${baseUrl}${endpoint}`;
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


