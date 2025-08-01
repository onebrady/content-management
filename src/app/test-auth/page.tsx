'use client';

import { useAuth } from '@/hooks/useAuth';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  const router = useRouter();

  const handleTestApi = async () => {
    try {
      const response = await fetch('/api/content');
      const data = await response.json();
      console.log('API Response:', data);
      alert(`API Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('API Error:', error);
      alert(`API Error: ${error}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading authentication status...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Authentication Test Page
      </Typography>

      <Alert severity={isAuthenticated ? 'success' : 'warning'} sx={{ mb: 2 }}>
        {isAuthenticated ? 'User is authenticated' : 'User is not authenticated'}
      </Alert>

      {user && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">User Information:</Typography>
          <Typography>ID: {user.id}</Typography>
          <Typography>Email: {user.email}</Typography>
          <Typography>Name: {user.name}</Typography>
          <Typography>Role: {user.role}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {!isAuthenticated ? (
          <Button
            variant="contained"
            onClick={() => signIn('azure-ad')}
            sx={{ mr: 1 }}
          >
            Sign In with Microsoft
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={() => signOut()}
            sx={{ mr: 1 }}
          >
            Sign Out
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleTestApi}
          disabled={!isAuthenticated}
        >
          Test API Call
        </Button>
        <Button
          variant="contained"
          onClick={() => router.push('/content')}
          disabled={!isAuthenticated}
        >
          Go to Content Page
        </Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Debug Information:</Typography>
        <Typography>isAuthenticated: {String(isAuthenticated)}</Typography>
        <Typography>isLoading: {String(isLoading)}</Typography>
        <Typography>User: {user ? 'Present' : 'Not present'}</Typography>
      </Box>
    </Box>
  );
} 