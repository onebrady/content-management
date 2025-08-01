'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button, Box, Typography, Container } from '@mui/material';
import { Login } from '@mui/icons-material';

export default function Home() {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Content Management Tool
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Secure, role-based content management with Microsoft Azure AD
          authentication
        </Typography>
        <Typography variant="body1" sx={{ mb: 6, maxWidth: 600 }}>
          Streamline your content creation, review, and approval workflows with
          our enterprise-grade content management system. Built with Next.js,
          Material-UI, and Microsoft Azure AD for secure authentication.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Login />}
          onClick={() => signIn('azure-ad')}
          sx={{ px: 4, py: 1.5 }}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
}
