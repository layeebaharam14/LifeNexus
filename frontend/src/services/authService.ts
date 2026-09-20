import { apiGet, apiPost } from './api.js';
import { ApiResponse, User } from '../types/index.js';

export interface AuthResponseData {
  user: User;
  token: string;
}

export async function register(
  name: string,
  email: string,
  password: string,
  confirmPassword?: string
): Promise<ApiResponse<AuthResponseData>> {
  return apiPost<AuthResponseData>('/auth/register', {
    name,
    email,
    password,
    confirmPassword,
  });
}

export async function login(
  email: string,
  password: string
): Promise<ApiResponse<AuthResponseData>> {
  return apiPost<AuthResponseData>('/auth/login', {
    email,
    password,
  });
}

export async function getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
  return apiGet<{ user: User }>('/auth/me');
}

export async function logout(): Promise<ApiResponse<null>> {
  return apiPost<null>('/auth/logout');
}
