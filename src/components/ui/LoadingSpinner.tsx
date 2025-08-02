import { Box, Loader, Text, Stack } from '@mantine/core';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack align="center" gap="md">
        <Loader size={size} />
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      </Stack>
    </Box>
  );
} 