'use client';

import {
  Button,
  Card,
  Text,
  Box,
  Alert,
  Group,
  Stack,
  Title,
  Divider,
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
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
        return 'This email is already associated with another account. The system will now automatically link your Azure AD account to your existing account.';
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

  const getErrorSolution = (error: string | null) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              This happens when you try to sign in with Microsoft Azure AD, but there's already an account with the same email address.
            </Text>
            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
              <Text size="sm">
                The system will automatically link your Azure AD account to your existing account. 
                You can now use either your credentials or Microsoft sign-in to access your account.
              </Text>
            </Alert>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card style={{ maxWidth: 500, width: '100%', margin: '0 16px' }}>
        <Box p="xl" style={{ textAlign: 'center' }}>
          <IconAlertCircle size={64} color="red" style={{ marginBottom: 16 }} />
          <Title order={1} mb="md">
            Authentication Error
          </Title>
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="lg">
            {getErrorMessage(error)}
          </Alert>
          
          {getErrorSolution(error)}
          
          {error && (
            <Text size="sm" c="dimmed" mb="lg">
              Error code: {error}
            </Text>
          )}
          
          <Divider my="lg" />
          
          <Group justify="center" gap="md">
            <Button
              component={Link}
              href="/auth/signin"
              variant="filled"
              leftSection={<IconArrowLeft size={16} />}
            >
              Try Again
            </Button>
            <Button component={Link} href="/" variant="outline">
              Go Home
            </Button>
          </Group>
        </Box>
      </Card>
    </Box>
  );
}
