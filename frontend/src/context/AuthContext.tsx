import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { User, RegisterPayload } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  probePortal: (portalRole: string) => Promise<{ status: number; data?: any; error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => apiService.getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = apiService.getAccessToken();
      if (token) {
        try {
          const profile = await apiService.getCurrentUser();
          if (profile) {
            setUser(profile);
          } else {
            apiService.clearSession();
            setUser(null);
          }
        } catch {
          apiService.clearSession();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await apiService.login(email, password);
    setIsLoading(false);

    if (result.data?.user) {
      setUser(result.data.user);
      return { success: true, user: result.data.user };
    }

    return {
      success: false,
      error: result.error || 'Authentication failed. Please verify credentials.',
    };
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    const result = await apiService.register(payload);
    setIsLoading(false);

    if (result.data?.user) {
      setUser(result.data.user);
      return { success: true, user: result.data.user };
    }

    return {
      success: false,
      error: result.error || 'Registration failed.',
    };
  };

  const logout = async () => {
    setIsLoading(true);
    await apiService.logout();
    setUser(null);
    setIsLoading(false);
  };

  const probePortal = async (portalRole: string) => {
    return apiService.probePortal(portalRole);
  };

  const refreshSession = async () => {
    const profile = await apiService.getCurrentUser();
    if (profile) {
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        probePortal,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
