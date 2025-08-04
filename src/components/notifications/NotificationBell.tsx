'use client';

import { useState } from 'react';
import {
  Badge,
  ActionIcon,
  Popover,
  Text,
  Box,
  Button,
  Divider,
  Loader,
  Tooltip,
  Group,
  Stack,
  ScrollArea,
} from '@mantine/core';
import {
  IconBell,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconExclamationMark,
} from '@tabler/icons-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications({ unreadOnly: false, autoRefresh: true });

  const handleClick = () => {
    setOpened(!opened);
    // Refresh notifications when opening the popover
    fetchNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAsRead('all');
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead([id]);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    markAsRead([notification.id]);

    // Navigate based on notification type
    if (notification.contentId) {
      router.push(`/content?view=${notification.contentId}`);
    }

    setOpened(false);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPROVAL_APPROVED':
        return <IconCheck size={16} color="green" />;
      case 'APPROVAL_REJECTED':
        return <IconAlertCircle size={16} color="red" />;
      case 'APPROVAL_REQUEST':
        return <IconExclamationMark size={16} color="yellow" />;
      case 'CONTENT_PUBLISHED':
        return <IconCheck size={16} color="blue" />;
      case 'NEW_COMMENT':
        return <IconInfoCircle size={16} color="blue" />;
      default:
        return <IconInfoCircle size={16} />;
    }
  };

  // Format notification date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      width={360}
      position="bottom-end"
      withArrow
    >
      <Popover.Target>
        <ActionIcon variant="subtle" onClick={handleClick}>
          <Badge
            size="xs"
            variant="filled"
            color="red"
            style={{ position: 'absolute', top: -5, right: -5 }}
          >
            {unreadCount}
          </Badge>
          <IconBell size={20} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown>
        <Group justify="space-between" mb="md">
          <Text size="lg" fw={600}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Button size="xs" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Group>

        <Divider mb="md" />

        {isLoading ? (
          <Box ta="center" py="xl">
            <Loader size="sm" />
          </Box>
        ) : notifications.length === 0 ? (
          <Box ta="center" py="xl">
            <Text c="dimmed">No notifications</Text>
          </Box>
        ) : (
          <ScrollArea h={400}>
            <Stack gap={0}>
              {notifications.map((notification) => (
                <Box
                  key={notification.id}
                  p="md"
                  style={{
                    backgroundColor: notification.isRead
                      ? 'transparent'
                      : 'var(--mantine-color-gray-0)',
                    borderBottom: '1px solid var(--mantine-color-gray-3)',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Group justify="space-between" align="flex-start">
                    <Group gap="sm" align="flex-start" style={{ flex: 1 }}>
                      {getNotificationIcon(notification.type)}
                      <Box style={{ flex: 1 }}>
                        <Text
                          size="sm"
                          fw={notification.isRead ? 'normal' : 'bold'}
                          mb={4}
                        >
                          {notification.message}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(notification.createdAt)}
                        </Text>
                      </Box>
                    </Group>
                    <Tooltip label="Delete">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Box>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
