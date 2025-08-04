'use client';

import { useState } from 'react';
import {
  Box,
  Text,
  Card,
  Divider,
  List,
  Avatar,
  Badge,
  ActionIcon,
  Tooltip,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import {
  IconEdit,
  IconSend,
  IconCheck,
  IconX,
  IconDeviceFloppy,
  IconArrowLeft,
  IconMessage,
  IconPaperclip,
  IconHistory,
} from '@tabler/icons-react';
import { UserRole } from '@prisma/client';

interface ContentActivityProps {
  activities: Array<{
    id: string;
    action: string;
    details?: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      role: UserRole;
    };
  }>;
}

export function ContentActivity({ activities }: ContentActivityProps) {
  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // Get activity icon
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return <IconEdit size={16} />;
      case 'UPDATED':
        return <IconEdit size={16} />;
      case 'SUBMITTED_FOR_REVIEW':
        return <IconSend size={16} />;
      case 'APPROVED':
        return <IconCheck size={16} />;
      case 'REJECTED':
        return <IconX size={16} />;
      case 'PUBLISHED':
        return <IconDeviceFloppy size={16} />;
      case 'RETURNED_TO_DRAFT':
        return <IconArrowLeft size={16} />;
      case 'COMMENT_ADDED':
        return <IconMessage size={16} />;
      case 'FILE_ATTACHED':
        return <IconPaperclip size={16} />;
      default:
        return <IconHistory size={16} />;
    }
  };

  // Get activity color
  const getActivityColor = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'blue';
      case 'UPDATED':
        return 'blue';
      case 'SUBMITTED_FOR_REVIEW':
        return 'yellow';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'PUBLISHED':
        return 'cyan';
      case 'RETURNED_TO_DRAFT':
        return 'yellow';
      case 'COMMENT_ADDED':
        return 'violet';
      case 'FILE_ATTACHED':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  // Get activity label
  const getActivityLabel = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'Created';
      case 'UPDATED':
        return 'Updated';
      case 'SUBMITTED_FOR_REVIEW':
        return 'Submitted for Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'PUBLISHED':
        return 'Published';
      case 'RETURNED_TO_DRAFT':
        return 'Returned to Draft';
      case 'COMMENT_ADDED':
        return 'Comment Added';
      case 'FILE_ATTACHED':
        return 'File Attached';
      default:
        return action;
    }
  };

  return (
    <Card withBorder>
      <Card.Section p="md">
        <Group justify="space-between" align="center">
          <Title order={4}>Activity History</Title>
          <Text size="sm" c="dimmed">
            {activities.length} activities recorded
          </Text>
        </Group>
      </Card.Section>
      <Divider />
      <Card.Section p="md">
        {activities.length > 0 ? (
          <List>
            {activities.map((activity) => (
              <List.Item key={activity.id}>
                <Group gap="md" align="flex-start" py="xs">
                  <Avatar color={getActivityColor(activity.action)} size="sm">
                    {getActivityIcon(activity.action)}
                  </Avatar>
                  <Box style={{ flex: 1 }}>
                    <Group gap="xs" align="center" mb={4}>
                      <Text fw={500} size="sm">
                        {getActivityLabel(activity.action)}
                      </Text>
                      <Badge size="xs" variant="outline">
                        {activity.user.role}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {activity.user.name} - {formatDate(activity.createdAt)}
                    </Text>
                    {activity.details && (
                      <Text size="sm" mt="xs">
                        {activity.details}
                      </Text>
                    )}
                  </Box>
                </Group>
              </List.Item>
            ))}
          </List>
        ) : (
          <Text size="sm" c="dimmed">
            No activity recorded yet.
          </Text>
        )}
      </Card.Section>
    </Card>
  );
}
