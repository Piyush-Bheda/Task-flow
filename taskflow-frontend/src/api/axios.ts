import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types/auth';

/** Remove trailing `/api` so Axios does not combine with `/api/auth/...` → `/api/api/auth/...` (404). */
function normalizeApiOrigin(url: string): string {
  return url.trim().replace(/\/api\/?$/i, '').replace(/\/+$/, '');
}

function resolveBaseURL(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
  const malformed = !raw || raw === 'undefined';
  const parsed =
    malformed ? '' : normalizeApiOrigin(raw.includes('://') ? raw : `http://${raw}`);

  // Dev: browser → same-origin `/api/*` handled by `vite.config` proxy unless API is on another host.
  if (import.meta.env.DEV) {
    if (!parsed) return '';
    try {
      const apiOrigin = new URL(parsed).origin;
      if (typeof window !== 'undefined' && apiOrigin === window.location.origin) {
        return ''; // Common mis-config: API URL pointed at Vite itself
      }
    } catch {
      return '';
    }
    return parsed;
  }

  // Production preview / deployed build — direct to backend unless `VITE_API_URL` overrides.
  return parsed || 'http://localhost:5000';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    console.log("Axios request - Token:", token?.substring(0, 50));
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    console.error("API Error:", error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - removing token and redirecting");
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;