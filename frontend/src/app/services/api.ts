/**
 * Base API service — fetch wrapper with JWT interceptor.
 * All API calls go through this layer.
 */

// Empty string = use Vite proxy which forwards /api/* to backend:5000 in Docker
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get stored JWT token from localStorage
 */
function getToken(): string | null {
  return localStorage.getItem('apotek_jwt_token');
}

/**
 * Save JWT token to localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('apotek_jwt_token', token);
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem('apotek_jwt_token');
}

/**
 * Generic fetch wrapper with JWT header injection and error handling
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 (token expired/invalid) — auto-logout
      if (response.status === 401) {
        removeToken();
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return { data: null, error: data.message || 'Request gagal', status: response.status };
    }

    return { data, error: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: 'Tidak bisa terhubung ke server. Pastikan backend berjalan.',
      status: 0,
    };
  }
}

/**
 * Convenience methods
 */
export const api = {
  get: <T = any>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
};

export default api;
