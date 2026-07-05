import { useEffect, useMemo, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { usePathname, useRouter, useSegments, type Href } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { UserRole } from "@/types";

export function getRoleBasedRoute(role?: UserRole | string): Href {
  switch (role) {
    case "TOURIST":
      return "/(tourist)/(tabs)/home";
    case "GUIDE":
      return "/(guide)/dashboard";
    case "ADMIN":
      return "/(auth)/login";
    default:
      return "/(auth)/login";
  }
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const lastRedirectRef = useRef<Href | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Hide the splash screen only when auth loading finishes
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {
        /* Silently catch if already hidden */
      });
    }
  }, [isLoading]);

  // Calculate the dynamic redirect route
  const redirectHref = useMemo<Href | null>(() => {
    if (isLoading) return null;

    const currentGroup = segments[0] || "";
    const isAuthGroup = currentGroup === "(auth)";
    const isTouristGroup = currentGroup === "(tourist)";
    const isGuideGroup = currentGroup === "(guide)";
    const isSupportedRole = user?.role === "TOURIST" || user?.role === "GUIDE";

    if (!user) {
      return isAuthGroup ? null : "/(auth)/login";
    }

    if (!isSupportedRole) {
      return "/(auth)/login";
    }

    if (isAuthGroup) {
      return getRoleBasedRoute(user.role);
    }

    if (isTouristGroup && user.role !== "TOURIST") {
      return getRoleBasedRoute(user.role);
    }
    if (isGuideGroup && user.role !== "GUIDE") {
      return getRoleBasedRoute(user.role);
    }

    return null;
  }, [user, segments, isLoading]);

  // Execute the redirect
  useEffect(() => {
    if (!isLoading && redirectHref && pathname !== redirectHref) {
      if (lastRedirectRef.current === redirectHref) {
        return;
      }

      lastRedirectRef.current = redirectHref;
      router.replace(redirectHref);
    }
    if (!redirectHref) {
      lastRedirectRef.current = null;
    }
  }, [isLoading, redirectHref, pathname, router]);

  // Render a fallback spinner if the splash screen drops early
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Block rendering layout children if we are redirecting away
  if (redirectHref) {
    return null;
  }

  return <>{children}</>;
}
