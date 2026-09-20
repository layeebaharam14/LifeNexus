import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import * as authApi from '../services/authService.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logoutUser: () => Promise<void>;
  logout: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (name: string, email: string, password: string, confirmPassword?: string) => Promise<{ success: boolean; error?: string }>;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lifenexus_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('lifenexus_token');
      const storedUser = localStorage.getItem('lifenexus_user');

      if (storedToken) {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (_e) {
            // invalid JSON, ignore
          }
        }

        // Verify with server
        try {
          const res = await authApi.getCurrentUser();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('lifenexus_user', JSON.stringify(res.data.user));
          } else {
            // Invalid or expired token
            localStorage.removeItem('lifenexus_token');
            localStorage.removeItem('lifenexus_user');
            setToken(null);
            setUser(null);
          }
        } catch (_err) {
          // If offline/error, retain local cache or handle gracefully
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data) {
        const { user: newUser, token: newToken } = res.data;
        localStorage.setItem('lifenexus_token', newToken);
        localStorage.setItem('lifenexus_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Login failed.' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.register(name, email, password, confirmPassword);
      if (res.success && res.data) {
        const { user: newUser, token: newToken } = res.data;
        localStorage.setItem('lifenexus_token', newToken);
        localStorage.setItem('lifenexus_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Registration failed.' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
  };

  const logoutUser = async () => {
    try {
      await authApi.logout();
    } catch (_e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('lifenexus_token');
    localStorage.removeItem('lifenexus_user');
    setToken(null);
    setUser(null);
  };

  const refreshCurrentUser = async () => {
    if (!token) return;
    try {
      const res = await authApi.getCurrentUser();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('lifenexus_user', JSON.stringify(res.data.user));
      }
    } catch (_e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        loginUser,
        registerUser,
        logoutUser,
        logout: logoutUser,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
