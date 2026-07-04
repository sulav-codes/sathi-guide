import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { apiClient } from '@/lib/api';

export type UserRole = 'TOURIST' | 'GUIDE' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatarKey: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (user: User) => void;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  // Tourist fields
  nationality?: string;
  preferredLanguage?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  // Guide fields
  experienceYears?: number;
  languagesSpoken?: string[];
  hasGuideLicense?: boolean;
  licenseNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
};

// Helper for secure storage
const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail
    }
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if we have tokens
      const accessToken = await secureStorage.getItem(TOKEN_KEYS.accessToken);
      
      if (!accessToken) {
        setUser(null);
        return;
      }

      // Validate token and get user info
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch {
      // Token is invalid or expired, try to refresh
      const refreshed = await refreshSession();
      if (!refreshed) {
        setUser(null);
        await clearTokens();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const storeTokens = async (tokens: AuthTokens) => {
    await Promise.all([
      secureStorage.setItem(TOKEN_KEYS.accessToken, tokens.accessToken),
      secureStorage.setItem(TOKEN_KEYS.refreshToken, tokens.refreshToken),
    ]);
  };

  const clearTokens = async () => {
    await Promise.all([
      secureStorage.removeItem(TOKEN_KEYS.accessToken),
      secureStorage.removeItem(TOKEN_KEYS.refreshToken),
    ]);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const deviceInfo = {
        platform: Platform.OS,
        deviceId: '',
        deviceName: '',
      };

      const response = await apiClient.login(email, password, deviceInfo);
      
      await storeTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      await apiClient.register(data);
      // Registration successful, user needs to login
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      const refreshToken = await secureStorage.getItem(TOKEN_KEYS.refreshToken);
      
      if (refreshToken) {
        try {
          await apiClient.logout(refreshToken);
        } catch {
          // Ignore logout errors
        }
      }
      
      await clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const refreshToken = await secureStorage.getItem(TOKEN_KEYS.refreshToken);
      
      if (!refreshToken) {
        return false;
      }

      const response = await apiClient.refreshToken(refreshToken);
      
      await storeTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      return true;
    } catch {
      await clearTokens();
      return false;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshSession,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
