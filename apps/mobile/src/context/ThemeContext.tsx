import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useNativeColorScheme, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from "expo-router/react-navigation";

type ThemeType = "light" | "dark" | "system";
type ColorSchemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  colorScheme: ColorSchemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Reuse the platform-aware storage logic from AuthContext for web compatibility
const webStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  },
};

const nativeStorage = {
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
};

const storage = Platform.OS === "web" ? webStorage : nativeStorage;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const nativeColorScheme = useNativeColorScheme();
  const [theme, setThemeState] = useState<ThemeType>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await storage.getItem("theme_pref");
      if (stored === "light" || stored === "dark") {
        setThemeState(stored as ThemeType);
      }
      setIsLoaded(true);
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    await storage.setItem("theme_pref", newTheme);
  };

  const resolveColorScheme = (
    scheme: typeof nativeColorScheme,
  ): ColorSchemeType => {
    if (scheme === "light" || scheme === "dark") {
      return scheme;
    }
    return "light";
  };

  const activeColorScheme: ColorSchemeType =
    theme === "system" ? resolveColorScheme(nativeColorScheme) : theme;

  // Wait until we know the preferred theme to avoid flickering
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{ theme, colorScheme: activeColorScheme, setTheme }}
    >
      <NavigationThemeProvider value={activeColorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
