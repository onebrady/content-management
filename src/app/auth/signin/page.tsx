'use client';

import { signIn, getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  TextField,
} from '@mui/material';
import { Microsoft } from '@mui/icons-material';

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [credentialsError, setCredentialsError] = useState<string | null>(null);

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

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // If already authenticated, show loading while redirecting
  if (session && status === 'authenticated') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography>Redirecting to dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to access the Content Management Tool
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={<Microsoft />}
            onClick={handleSignIn}
            disabled={isLoading}
            sx={{
              width: '100%',
              py: 1.5,
              bgcolor: '#2f2f2f',
              '&:hover': {
                bgcolor: '#1f1f1f',
              },
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
          </Button>
          {/* Credentials login form */}
          <Box
            component="form"
            onSubmit={handleCredentialsLogin}
            sx={{ mt: 4 }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Or sign in with email and password
            </Typography>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            {credentialsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {credentialsError}
              </Alert>
            )}
            <Button
              type="submit"
              variant="outlined"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? 'Signing in...' : 'Sign in with Email'}
            </Button>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: 'block' }}
          >
            You'll be redirected to Microsoft Azure AD for authentication
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
