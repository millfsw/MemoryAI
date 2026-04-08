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
