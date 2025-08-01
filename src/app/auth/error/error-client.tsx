'use client';

import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Error, ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

export default function ErrorClient({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error || null;

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please contact your administrator.';
      case 'AccessDenied':
        return 'You do not have permission to sign in. Please contact your administrator.';
      case 'Verification':
        return 'The verification token has expired or has already been used. Please try signing in again.';
      case 'OAuthCallback':
        return 'There was a problem with the Azure AD authentication. Please try again or contact your administrator.';
      case 'OAuthSignin':
        return 'Could not start the sign-in process. Please check your Azure AD configuration.';
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with another account. Please sign in with the correct provider.';
      case 'EmailSignin':
        return 'The email sign-in link is invalid or has expired. Please try again.';
      case 'CredentialsSignin':
        return 'The credentials you provided are invalid. Please try again.';
      case 'SessionRequired':
        return 'You must be signed in to access this page. Please sign in first.';
      default:
        return `An error occurred during authentication (${error || 'unknown'}). Please try again or contact support.`;
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
      <Card sx={{ maxWidth: 500, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Authentication Error
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {getErrorMessage(error)}
          </Alert>
          {error && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Error code: {error}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              component={Link}
              href="/auth/signin"
              variant="contained"
              startIcon={<ArrowBack />}
            >
              Try Again
            </Button>
            <Button component={Link} href="/" variant="outlined">
              Go Home
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
