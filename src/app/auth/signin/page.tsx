'use client';

import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import { Microsoft } from '@mui/icons-material';

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  const handleSignIn = async () => {
    try {
      // Use fixed callback URL and force redirect to prevent loops
      await signIn('azure-ad', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

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
          <Button
            variant="contained"
            size="large"
            startIcon={<Microsoft />}
            onClick={handleSignIn}
            sx={{
              width: '100%',
              py: 1.5,
              bgcolor: '#2f2f2f',
              '&:hover': {
                bgcolor: '#1f1f1f',
              },
            }}
          >
            Sign in with Microsoft
          </Button>
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