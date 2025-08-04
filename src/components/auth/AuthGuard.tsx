'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader, Box } from '@mantine/core';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  fallback = null,
  redirectTo = '/auth/signin',
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to sign-in with current URL as callback
      const currentPath = window.location.pathname + window.location.search;
      const signInUrl = `${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`;
      router.push(signInUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <Loader />
      </Box>
    );
  }

  // Show fallback or nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Show children if authenticated
  return <>{children}</>;
}
