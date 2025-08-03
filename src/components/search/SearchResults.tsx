'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  Paper,
  Grid,
  Card,
  Button,
  Badge,
  ActionIcon,
  Pagination,
  Divider,
  Loader,
  Alert,
  Tooltip,
  Group,
  Stack,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconUser,
  IconClock,
  IconMessage,
  IconPaperclip,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { ContentStatus, ContentType, Priority } from '@prisma/client';
import { SearchPagination } from '@/lib/search';
import { useAuth } from '@/hooks/useAuth';
import { CONTENT_PERMISSIONS } from '@/lib/permissions';

interface SearchResultsProps {
  results: any[];
  pagination: SearchPagination;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onViewContent: (id: string) => void;
  onEditContent: (id: string) => void;
  onDeleteContent: (id: string) => void;
}

export function SearchResults({
  results,
  pagination,
  loading,
  error,
  onPageChange,
  onViewContent,
  onEditContent,
  onDeleteContent,
}: SearchResultsProps) {
  const { user } = useAuth();
  const { colorScheme } = useMantineColorScheme();

  const isDark = colorScheme === 'dark';

  // Check permissions
  const canEdit = user && CONTENT_PERMISSIONS.canEdit(user.role);
  const canDelete = user && CONTENT_PERMISSIONS.canDelete(user.role);

  // Get status color
  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case ContentStatus.DRAFT:
        return 'gray';
      case ContentStatus.IN_REVIEW:
        return 'blue';
      case ContentStatus.APPROVED:
        return 'green';
      case ContentStatus.REJECTED:
        return 'red';
      case ContentStatus.PUBLISHED:
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'green';
      case Priority.MEDIUM:
        return 'blue';
      case Priority.HIGH:
        return 'orange';
      case Priority.URGENT:
        return 'red';
      default:
        return 'gray';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  if (loading) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
        <Loader size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert color="red" mb="md">
        {error}
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <Paper p="xl" ta="center">
        <Text size="lg" c="dimmed" mb="xs">
          No results found
        </Text>
        <Text c="dimmed">
          Try adjusting your search or filters to find what you're looking for.
        </Text>
      </Paper>
    );
  }

  return (
    <Box>
      <Text size="sm" c="dimmed" mb="md">
        Showing {results.length} of {pagination.total} results
      </Text>

      <Stack gap="md">
        {results.map((content) => (
          <Card
            key={content.id}
            withBorder
            shadow="sm"
            style={{
              backgroundColor: isDark
                ? 'var(--mantine-color-dark-6)'
                : 'var(--mantine-color-white)',
              borderColor: isDark
                ? 'var(--mantine-color-dark-4)'
                : 'var(--mantine-color-gray-3)',
            }}
          >
            <Card.Section p="md">
              <Group justify="space-between" align="flex-start" mb="md">
                <Text size="lg" fw={500} style={{ flex: 1 }}>
                  {content.title}
                </Text>
                <Group gap="xs">
                  <Badge
                    size="sm"
                    color={getStatusColor(content.status)}
                    variant="light"
                  >
                    {content.status}
                  </Badge>
                  <Badge
                    size="sm"
                    color={getPriorityColor(content.priority)}
                    variant="light"
                  >
                    {content.priority}
                  </Badge>
                </Group>
              </Group>

              <Group gap="xs" mb="md" wrap="wrap">
                {content.tags.map((tag: any) => (
                  <Badge key={tag.id} size="sm" variant="outline" color="gray">
                    {tag.name}
                  </Badge>
                ))}
              </Group>

              <Group gap="lg" wrap="wrap">
                <Group gap={4}>
                  <IconUser size={14} />
                  <Text size="sm" c="dimmed">
                    {content.author?.name || 'Unknown'}
                  </Text>
                </Group>

                <Group gap={4}>
                  <IconClock size={14} />
                  <Text size="sm" c="dimmed">
                    {formatDate(content.updatedAt)}
                  </Text>
                </Group>

                <Group gap={4}>
                  <IconMessage size={14} />
                  <Text size="sm" c="dimmed">
                    {content._count?.comments || 0} comments
                  </Text>
                </Group>

                <Group gap={4}>
                  <IconPaperclip size={14} />
                  <Text size="sm" c="dimmed">
                    {content._count?.attachments || 0} attachments
                  </Text>
                </Group>
              </Group>
            </Card.Section>

            <Divider />

            <Card.Section p="md">
              <Group gap="xs">
                <Button
                  size="sm"
                  variant="light"
                  leftSection={<IconEye size={14} />}
                  onClick={() => onViewContent(content.id)}
                >
                  View
                </Button>

                {canEdit && (
                  <Button
                    size="sm"
                    variant="light"
                    leftSection={<IconEdit size={14} />}
                    onClick={() => onEditContent(content.id)}
                  >
                    Edit
                  </Button>
                )}

                {canDelete && (
                  <Button
                    size="sm"
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => onDeleteContent(content.id)}
                  >
                    Delete
                  </Button>
                )}
              </Group>
            </Card.Section>
          </Card>
        ))}
      </Stack>

      {pagination.totalPages > 1 && (
        <Box
          style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}
        >
          <Pagination
            total={pagination.totalPages}
            value={pagination.page}
            onChange={handlePageChange}
            color="blue"
          />
        </Box>
      )}
    </Box>
  );
}
