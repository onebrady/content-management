import { Box, Paper, Text, Button, Alert, Stack } from '@mantine/core';
import { IconShieldLock, IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface PermissionErrorProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export function PermissionError({
  title = 'Access Denied',
  message = 'You do not have permission to access this resource.',
  showBackButton = true,
}: PermissionErrorProps) {
  const router = useRouter();

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 'var(--mantine-spacing-lg)',
      }}
    >
      <Paper p="xl" style={{ maxWidth: 500, width: '100%' }}>
        <Stack align="center" gap="md">
          <IconShieldLock size={64} color="var(--mantine-color-red-6)" />
          <Text size="xl" fw={700} ta="center">
            {title}
          </Text>
          <Alert color="red" title="Permission Error" style={{ width: '100%' }}>
            {message}
          </Alert>
          {showBackButton && (
            <Button
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
