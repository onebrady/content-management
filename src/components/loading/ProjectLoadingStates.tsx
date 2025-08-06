'use client';

import React from 'react';
import {
  Skeleton,
  Stack,
  Paper,
  Group,
  Box,
  LoadingOverlay,
  Center,
  Text,
  Progress,
  Loader,
  Card,
} from '@mantine/core';
import { IconKanban, IconChecklist } from '@tabler/icons-react';

/**
 * Loading skeleton for the main project board
 */
export function ProjectBoardSkeleton() {
  return (
    <Stack spacing="md">
      {/* Header skeleton */}
      <Group justify="space-between">
        <Skeleton height={28} width={200} />
        <Group>
          <Skeleton height={36} width={120} />
          <Skeleton height={36} width={100} />
        </Group>
      </Group>

      {/* Board skeleton */}
      <Group align="flex-start" spacing="md" style={{ overflowX: 'auto' }}>
        {[1, 2, 3].map((column) => (
          <ColumnSkeleton key={column} />
        ))}
      </Group>
    </Stack>
  );
}

/**
 * Loading skeleton for individual columns
 */
export function ColumnSkeleton() {
  return (
    <Paper p="md" w={300} withBorder>
      <Stack spacing="md">
        {/* Column header */}
        <Group justify="space-between">
          <Skeleton height={20} width={100} />
          <Skeleton height={16} width={20} radius="xl" />
        </Group>

        {/* Task skeletons */}
        {[1, 2, 3].map((task) => (
          <TaskCardSkeleton key={task} />
        ))}

        {/* Add task button skeleton */}
        <Skeleton height={36} />
      </Stack>
    </Paper>
  );
}

/**
 * Loading skeleton for task cards
 */
export function TaskCardSkeleton() {
  return (
    <Card shadow="sm" p="sm" radius="md" withBorder>
      <Stack spacing="xs">
        <Skeleton height={16} />
        <Skeleton height={12} width="70%" />

        <Group justify="space-between" mt="xs">
          <Group spacing="xs">
            <Skeleton height={16} width={16} radius="xl" />
            <Skeleton height={16} width={16} radius="xl" />
          </Group>
          <Skeleton height={20} width={40} radius="md" />
        </Group>
      </Stack>
    </Card>
  );
}

/**
 * Loading overlay for drag and drop operations
 */
interface DragLoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function DragLoadingOverlay({
  visible,
  message,
}: DragLoadingOverlayProps) {
  return (
    <LoadingOverlay
      visible={visible}
      overlayProps={{ opacity: 0.3, blur: 2 }}
      loaderProps={{
        size: 'md',
        type: 'dots',
        color: 'blue',
      }}
    />
  );
}

/**
 * Optimistic update loading indicator
 */
interface OptimisticUpdateIndicatorProps {
  isUpdating: boolean;
  operation: 'moving' | 'updating' | 'deleting' | 'creating';
}

export function OptimisticUpdateIndicator({
  isUpdating,
  operation,
}: OptimisticUpdateIndicatorProps) {
  if (!isUpdating) return null;

  const messages = {
    moving: 'Moving task...',
    updating: 'Updating task...',
    deleting: 'Deleting task...',
    creating: 'Creating task...',
  };

  return (
    <Box
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        backgroundColor: 'var(--mantine-color-body)',
        padding: '8px 12px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--mantine-color-gray-3)',
      }}
    >
      <Group spacing="xs">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          {messages[operation]}
        </Text>
      </Group>
    </Box>
  );
}

/**
 * Progressive loading indicator for large datasets
 */
interface ProgressiveLoadingProps {
  current: number;
  total: number;
  operation: string;
}

export function ProgressiveLoading({
  current,
  total,
  operation,
}: ProgressiveLoadingProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <Paper p="md" withBorder>
      <Stack spacing="md">
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            {operation}
          </Text>
          <Text size="sm" c="dimmed">
            {current} / {total}
          </Text>
        </Group>

        <Progress value={percentage} size="sm" />

        <Text size="xs" c="dimmed" ta="center">
          {percentage}% complete
        </Text>
      </Stack>
    </Paper>
  );
}

/**
 * Empty state with loading option
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  isLoading?: boolean;
}

export function EmptyState({
  icon = <IconKanban size={48} />,
  title,
  description,
  action,
  isLoading = false,
}: EmptyStateProps) {
  if (isLoading) {
    return (
      <Center h={300}>
        <Stack align="center" spacing="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Center h={300}>
      <Stack align="center" spacing="md" ta="center">
        <Box c="gray.4">{icon}</Box>
        <Stack spacing="xs">
          <Text fw={500} size="lg">
            {title}
          </Text>
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        </Stack>
        {action}
      </Stack>
    </Center>
  );
}

/**
 * Task list loading skeleton
 */
export function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Stack spacing="xs">
      {Array.from({ length: count }).map((_, index) => (
        <Group key={index} spacing="md" p="sm">
          <Skeleton height={16} width={16} radius="sm" />
          <Box style={{ flex: 1 }}>
            <Skeleton height={16} width="60%" mb="xs" />
            <Skeleton height={12} width="40%" />
          </Box>
          <Skeleton height={20} width={60} radius="md" />
        </Group>
      ))}
    </Stack>
  );
}

/**
 * Project grid loading skeleton
 */
export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} shadow="sm" p="lg" radius="md" withBorder>
          <Stack spacing="md">
            <Group justify="space-between">
              <Skeleton height={20} width="70%" />
              <Skeleton height={16} width={16} radius="xl" />
            </Group>

            <Skeleton height={14} />
            <Skeleton height={14} width="80%" />

            <Group justify="space-between" mt="md">
              <Group spacing="xs">
                <Skeleton height={16} width={16} radius="xl" />
                <Skeleton height={16} width={16} radius="xl" />
                <Skeleton height={16} width={16} radius="xl" />
              </Group>
              <Skeleton height={32} width={80} radius="md" />
            </Group>
          </Stack>
        </Card>
      ))}
    </div>
  );
}

/**
 * Smart loading wrapper that shows skeleton or content
 */
interface SmartLoadingWrapperProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  error?: Error | null;
  retry?: () => void;
}

export function SmartLoadingWrapper({
  loading,
  skeleton,
  children,
  error,
  retry,
}: SmartLoadingWrapperProps) {
  if (error) {
    return (
      <Center h={200}>
        <Stack align="center" spacing="md">
          <Text c="red" fw={500}>
            Failed to load content
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            {error.message}
          </Text>
          {retry && (
            <Button size="sm" onClick={retry}>
              Try Again
            </Button>
          )}
        </Stack>
      </Center>
    );
  }

  if (loading) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
}
