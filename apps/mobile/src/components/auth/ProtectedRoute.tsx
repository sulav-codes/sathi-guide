import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, useRouter, useSegments } from 'expo-router';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup && requireAuth) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to appropriate dashboard if already authenticated
      const targetRoute = getRoleBasedRoute(user?.role);
      router.replace(targetRoute);
    } else if (isAuthenticated && allowedRoles && user?.role) {
      // Check role-based access
      if (!allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard
        const targetRoute = getRoleBasedRoute(user.role);
        router.replace(targetRoute);
      }
    }
  }, [isLoading, isAuthenticated, segments, user, allowedRoles, requireAuth]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If role-based access is required but user doesn't have the role, don't render children
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

export function getRoleBasedRoute(role?: UserRole): string {
  switch (role) {
    case 'TOURIST':
      return '/(tourist)/(tabs)/home';
    case 'GUIDE':
      return '/(guide)/dashboard';
    case 'ADMIN':
      return '/(admin)/dashboard';
    default:
      return '/(auth)/login';
  }
}

// Higher-order component for protecting screens
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { allowedRoles?: UserRole[]; requireAuth?: boolean } = {}
): React.FC<P> {
  return function WithAuthWrapper(props: P) {
    return (
      <ProtectedRoute allowedRoles={options.allowedRoles} requireAuth={options.requireAuth}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
