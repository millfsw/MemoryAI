/**
 * API configuration for the frontend.
 * Uses VITE_API_URL if set, otherwise uses relative /api/ path (for nginx proxy).
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function apiPath(path: string): string {
  // If path already starts with /, use it as-is (for absolute paths)
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
}

export function getApiUrl(): string {
  return API_BASE_URL;
}

/**
 * Returns the base URL for fetch calls.
 * If using relative path, ensures it ends with /api/
 */
export function getFetchBaseUrl(): string {
  if (API_BASE_URL === '/api') {
    return '/api';
  }
  return API_BASE_URL;
}
