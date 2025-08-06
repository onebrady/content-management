'use client';

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, Text, Button, Stack, Paper, Group } from '@mantine/core';
import { IconAlertCircle, IconRefresh, IconBug } from '@tabler/icons-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ProjectErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleReportError = () => {
    // In production, this would send the error to a logging service
    console.error('Error reported:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // You could integrate with services like Sentry, LogRocket, etc.
    // Sentry.captureException(error);
  };

  return (
    <Paper p="xl" radius="md" withBorder>
      <Stack spacing="md">
        <Alert icon={<IconAlertCircle size={20} />} color="red" variant="light">
          <Text fw={500} size="lg">
            Something went wrong with the project board
          </Text>
        </Alert>

        <Text size="sm" c="dimmed">
          We encountered an unexpected error while loading the project board.
          This might be a temporary issue.
        </Text>

        {isDevelopment && (
          <Paper p="sm" bg="gray.0" radius="sm">
            <Text size="xs" ff="monospace" c="red">
              <Text fw={600} mb="xs">
                Error Details (Development Mode):
              </Text>
              {error.message}
            </Text>
            {error.stack && (
              <details>
                <summary style={{ cursor: 'pointer', marginTop: '8px' }}>
                  <Text size="xs" fw={500}>
                    View Stack Trace
                  </Text>
                </summary>
                <Text
                  size="xs"
                  ff="monospace"
                  mt="xs"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {error.stack}
                </Text>
              </details>
            )}
          </Paper>
        )}

        <Group justify="flex-start">
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={resetErrorBoundary}
            variant="filled"
          >
            Try Again
          </Button>

          <Button
            leftSection={<IconBug size={16} />}
            onClick={handleReportError}
            variant="light"
            color="gray"
          >
            Report Issue
          </Button>
        </Group>

        <Text size="xs" c="dimmed">
          If this problem persists, please contact support or try refreshing the
          page.
        </Text>
      </Stack>
    </Paper>
  );
}

interface ProjectErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

export function ProjectErrorBoundary({
  children,
  fallback = ProjectErrorFallback,
  onError,
}: ProjectErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    // Log error for monitoring
    console.error('ProjectBoard Error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={() => {
        // Clear any cached state that might be causing the error
        if (typeof window !== 'undefined') {
          // Clear localStorage cache if needed
          const cacheKeys = Object.keys(localStorage).filter(
            (key) => key.startsWith('project-') || key.startsWith('task-')
          );
          cacheKeys.forEach((key) => localStorage.removeItem(key));
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Specialized error boundary for task components
 */
export function TaskErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          variant="light"
        >
          <Group justify="space-between">
            <Text size="sm">Failed to load task</Text>
            <Button size="xs" variant="subtle" onClick={resetErrorBoundary}>
              Retry
            </Button>
          </Group>
        </Alert>
      )}
      onError={(error) => {
        console.error('Task component error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Specialized error boundary for column components
 */
export function ColumnErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <Paper p="md" withBorder style={{ minHeight: 200 }}>
          <Stack align="center" justify="center" h="100%">
            <IconAlertCircle size={32} color="var(--mantine-color-red-6)" />
            <Text size="sm" ta="center" c="dimmed">
              Failed to load column
            </Text>
            <Button size="xs" onClick={resetErrorBoundary}>
              Retry
            </Button>
          </Stack>
        </Paper>
      )}
      onError={(error) => {
        console.error('Column component error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
