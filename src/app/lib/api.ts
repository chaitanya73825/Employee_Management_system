/**
 * API utility for making consistent requests to the backend.
 * 
 * Uses relative paths (/api/...) which are proxied to the backend during dev.
 * The Vite proxy forwards requests to http://localhost:5000
 */

const API_BASE = "/api";

interface RequestOptions extends RequestInit {
  body?: any;
}

export async function apiCall(
  endpoint: string,
  options: RequestOptions = {}
): Promise<any> {
  const { body, ...fetchOptions } = options;

  const url = `${API_BASE}${endpoint}`;
  const fetchOpts: RequestInit = {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      "bypass-tunnel-reminder": "true",
      "ngrok-skip-browser-warning": "true",
      ...(fetchOptions.headers || {}),
    },
  };

  if (body) {
    fetchOpts.body = JSON.stringify(body);
  }

  const res = await fetch(url, fetchOpts);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `API Error: ${res.status}`);
  }

  return data;
}

// Convenience methods for common operations
export const api = {
  get: (endpoint: string, options?: RequestOptions) =>
    apiCall(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, body?: any, options?: RequestOptions) =>
    apiCall(endpoint, { ...options, method: "POST", body }),

  put: (endpoint: string, body?: any, options?: RequestOptions) =>
    apiCall(endpoint, { ...options, method: "PUT", body }),

  delete: (endpoint: string, options?: RequestOptions) =>
    apiCall(endpoint, { ...options, method: "DELETE" }),
};
