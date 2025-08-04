'use client';

import { signIn, getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCompanyLogo } from '@/hooks/useCompanyLogo';
import {
  Button,
  Card,
  Text,
  Box,
  Alert,
  TextInput,
  PasswordInput,
  Stack,
  Title,
  Group,
  Image,
} from '@mantine/core';
import { IconBrandWindows } from '@tabler/icons-react';

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const { companyLogo, isLoading: logoLoading } = useCompanyLogo();

  useEffect(() => {
    // If user is already signed in, redirect to dashboard
    if (session && status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use a simple callback URL to prevent loops
      // Force redirect to true and use a simple path
      await signIn('azure-ad', {
        callbackUrl: '/dashboard',
        redirect: true,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setCredentialsError(null);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setCredentialsError('Invalid email or password.');
    } else if (res?.ok) {
      router.push('/dashboard');
    }
    setIsLoading(false);
  };

  // Show loading state while checking session or loading logo
  if (status === 'loading' || logoLoading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Loading...</Text>
      </Box>
    );
  }

  // If already authenticated, show loading while redirecting
  if (session && status === 'authenticated') {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text>Redirecting to dashboard...</Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card style={{ maxWidth: 400, width: '100%', margin: '0 16px' }}>
        <Box p="xl" style={{ textAlign: 'center' }}>
          {companyLogo ? (
            <Box mb="md">
              <Image
                src={companyLogo}
                alt="Company Logo"
                style={{ maxHeight: 80, maxWidth: 200, margin: '0 auto' }}
                fallbackSrc="data:image/svg+xml,%3csvg width='200' height='80' xmlns='http://www.w3.org/2000/svg'%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='14' fill='%23666'%3eLogo%3c/text%3e%3c/svg%3e"
              />
            </Box>
          ) : (
            <Title order={1} mb="md">
              Welcome Back
            </Title>
          )}
          <Text c="dimmed" mb="xl">
            Sign in to access the dashboard.
          </Text>

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          <Button
            variant="filled"
            size="lg"
            leftSection={<IconBrandWindows size={20} />}
            onClick={handleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#2f2f2f',
              '&:hover': {
                backgroundColor: '#1f1f1f',
              },
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
          </Button>

          {/* Credentials login form */}
          <Box component="form" onSubmit={handleCredentialsLogin} mt="xl">
            <Text size="sm" mb="xs">
              Or sign in with email and password
            </Text>
            <Stack gap="md">
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {credentialsError && (
                <Alert color="red">{credentialsError}</Alert>
              )}
              <Button
                type="submit"
                variant="outline"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in with Email'}
              </Button>
            </Stack>
          </Box>

          <Text size="xs" c="dimmed" mt="md">
            You'll be redirected to Microsoft Azure AD for authentication
          </Text>
        </Box>
      </Card>
    </Box>
  );
}
