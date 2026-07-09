import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { apiClient } from "@/lib/api";
import { AuthTokens, RegisterData, User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
} as const;

const VALID_ROLES: UserRole[] = ["TOURIST", "GUIDE", "ADMIN"];

const isValidRole = (role: string): role is UserRole =>
  VALID_ROLES.includes(role as UserRole);

const sanitizeUser = (raw: Record<string, unknown>): User => {
  const role = raw.role as string;
  if (!isValidRole(role)) {
    throw new Error(`Invalid role received from API: "${role}"`);
  }
  return {
    id: raw.id as string,
    email: raw.email as string,
    phone: (raw.phone as string | null) ?? null,
    role,
    isEmailVerified: raw.isEmailVerified as boolean,
    isPhoneVerified: raw.isPhoneVerified as boolean,
    avatarId: (raw.avatarId as string | null) ?? null,
    createdAt: raw.createdAt as string,
    lastLoginAt: (raw.lastLoginAt as string | null) ?? null,
  };
};

const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Non-critical — token will expire naturally
    }
  },
};

const storeTokens = async (tokens: AuthTokens): Promise<void> => {
  await Promise.all([
    secureStorage.setItem(TOKEN_KEYS.accessToken, tokens.accessToken),
    secureStorage.setItem(TOKEN_KEYS.refreshToken, tokens.refreshToken),
  ]);
};

const clearTokens = async (): Promise<void> => {
  await Promise.all([
    secureStorage.removeItem(TOKEN_KEYS.accessToken),
    secureStorage.removeItem(TOKEN_KEYS.refreshToken),
  ]);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasSession, setHasSession] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const refreshSessionRef = useRef<(() => Promise<boolean>) | null>(null);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = await secureStorage.getItem(TOKEN_KEYS.refreshToken);
      if (!refreshToken) return false;

      const response = await apiClient.refreshToken(refreshToken);
      setHasSession(true);
      await storeTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      return true;
    } catch {
      setHasSession(false);
      await clearTokens();
      return false;
    }
  }, []);

  useEffect(() => {
    refreshSessionRef.current = refreshSession;
    // Wire up the api client so it can auto-refresh on 401
    apiClient.setRefreshCallback(refreshSession);
  }, [refreshSession]);

  const fetchAndSetUser = useCallback(async (): Promise<boolean> => {
    try {
      const rawUser = await apiClient.getMe();
      const safeUser = sanitizeUser(rawUser as Record<string, unknown>);
      setUser(safeUser);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Runs once on mount to restore existing session
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const accessToken = await secureStorage.getItem(TOKEN_KEYS.accessToken);

        if (!accessToken) {
          if (isMounted) {
            setUser(null);
            setHasSession(false);
          }
          return;
        }

        if (isMounted) {
          setHasSession(true);
        }

        const success = await fetchAndSetUser();

        if (!success) {
          const refreshed = await refreshSessionRef.current?.();
          if (refreshed) {
            await fetchAndSetUser();
          } else {
            if (isMounted) {
              setUser(null);
              setHasSession(false);
            }
            await clearTokens();
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setHasSession(false);
        }
        await clearTokens();
      } finally {
        // The ONLY place isLoading flips to false — once, on bootstrap complete
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, [fetchAndSetUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const deviceInfo = {
        platform: Platform.OS,
        deviceId: `${Platform.OS}-device`,
        deviceName: `${Platform.OS}-client`,
      };

      const response = await apiClient.login(email, password, deviceInfo);

      await storeTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      const safeUser = sanitizeUser(response.user as Record<string, unknown>);
      setHasSession(true);
      // Setting user triggers RouteGuard to recompute redirectHref
      // and navigate to the correct role-based home screen automatically
      setUser(safeUser);
    },
    [],
  );

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    await apiClient.register(data);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    // Clear user immediately so RouteGuard redirects to login right away
    // without waiting for the API call
    setUser(null);
    setHasSession(false);
    const refreshToken = await secureStorage.getItem(TOKEN_KEYS.refreshToken);
    if (refreshToken) {
      try {
        await apiClient.logout(refreshToken);
      } catch {
        // Server logout failure is non-critical — local state already cleared
      }
    }
    await clearTokens();
  }, []);

  const updateUser = useCallback((updatedUser: User): void => {
    setUser(updatedUser);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasSession,
    login,
    register,
    logout,
    refreshSession,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
