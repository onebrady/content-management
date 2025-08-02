'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button, Box, Text, Container, Title, Stack } from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';

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

  return (
    <Container size="lg">
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Stack gap="xl" align="center">
          <Title order={1} size="3rem">
            Content Management Tool
          </Title>
          <Text size="xl" c="dimmed">
            Secure, role-based content management with Microsoft Azure AD
            authentication
          </Text>
          <Text size="md" maw={600}>
            Streamline your content creation, review, and approval workflows
            with our enterprise-grade content management system. Built with
            Next.js, Mantine UI, and Microsoft Azure AD for secure
            authentication.
          </Text>
          <Button
            size="lg"
            leftSection={<IconLogin size={20} />}
            onClick={() => signIn('azure-ad')}
            px="xl"
            py="md"
          >
            Get Started
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
