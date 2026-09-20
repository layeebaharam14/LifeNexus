import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token automatically if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('lifenexus_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle global response errors (e.g. 401 redirect)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('lifenexus_token');
    }
    return Promise.reject(error);
  }
);
