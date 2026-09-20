export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UserTokenPayload {
  userId: string;
  email: string;
}
