export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  DOCUMENTS: {
    LIST: `${API_BASE_URL}/documents`,
    UPLOAD: `${API_BASE_URL}/documents/upload`,
    DETAIL: (id: string) => `${API_BASE_URL}/documents/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/documents/${id}`,
  },
  SEARCH: `${API_BASE_URL}/search`,
  GRAPH: `${API_BASE_URL}/graph`,
  TIMELINE: `${API_BASE_URL}/timeline`,
  INSIGHTS: `${API_BASE_URL}/insights`,
  PRIVACY: {
    STATS: `${API_BASE_URL}/privacy/stats`,
    PURGE: `${API_BASE_URL}/privacy/purge`,
  },
};
