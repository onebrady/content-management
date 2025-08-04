'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Text } from '@mantine/core';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // If user is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // If user is not authenticated, redirect to signin page
        router.push('/auth/signin');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>Redirecting...</Text>
    </Box>
  );
}
