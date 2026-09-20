import { API_BASE_URL } from '../config/apiConfig.js';
import { ApiResponse } from '../types/index.js';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('lifenexus_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchHealth(): Promise<ApiResponse<{ service: string; status: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unable to connect to backend server',
    };
  }
}

export async function apiGet<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Request failed with status ${response.status}`,
      };
    }
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network request failed',
    };
  }
}

export async function apiPost<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Request failed with status ${response.status}`,
      };
    }
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network request failed',
    };
  }
}

export async function apiUpload<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    // Auth header without Content-Type so browser sets boundary automatically
    const headers: HeadersInit = {};
    const token = localStorage.getItem('lifenexus_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Upload failed with status ${response.status}`,
      };
    }
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network upload failed',
    };
  }
}

export async function apiDelete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Delete failed with status ${response.status}`,
      };
    }
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network request failed',
    };
  }
}

