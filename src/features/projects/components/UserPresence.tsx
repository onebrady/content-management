'use client';

import React from 'react';
import {
  Group,
  Avatar,
  Text,
  Tooltip,
  Indicator,
  Stack,
  Badge,
  Paper,
  Box,
} from '@mantine/core';
import { IconEye, IconEdit } from '@tabler/icons-react';
import classes from './UserPresence.module.css';

interface User {
  userId: string;
  userName: string;
  presence: 'viewing' | 'editing';
  editingCard?: string;
}

interface UserPresenceProps {
  users: User[];
  currentUserId?: string;
  compact?: boolean;
}

export function UserPresence({ users, currentUserId, compact = false }: UserPresenceProps) {
  // Filter out current user and sort by presence
  const activeUsers = users
    .filter(user => user.userId !== currentUserId)
    .sort((a, b) => {
      // Editing users first, then viewing users
      if (a.presence === 'editing' && b.presence === 'viewing') return -1;
      if (a.presence === 'viewing' && b.presence === 'editing') return 1;
      return a.userName.localeCompare(b.userName);
    });

  if (activeUsers.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <Group gap="xs" className={classes.compactContainer}>
        {activeUsers.slice(0, 3).map((user) => (
          <Tooltip
            key={user.userId}
            label={
              <Stack gap={4}>
                <Text size="sm" fw={500}>{user.userName}</Text>
                <Group gap={4}>
                  {user.presence === 'editing' ? (
                    <IconEdit size={12} />
                  ) : (
                    <IconEye size={12} />
                  )}
                  <Text size="xs">
                    {user.presence === 'editing' ? 'Editing' : 'Viewing'}
                    {user.editingCard && ` (Card: ${user.editingCard.slice(0, 8)}...)`}
                  </Text>
                </Group>
              </Stack>
            }
            position="bottom"
          >
            <Indicator
              color={user.presence === 'editing' ? 'green' : 'blue'}
              size={8}
              offset={2}
              position="bottom-end"
            >
              <Avatar
                size="sm"
                src={null}
                className={`${classes.userAvatar} ${classes[user.presence]}`}
              >
                {user.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Avatar>
            </Indicator>
          </Tooltip>
        ))}
        
        {activeUsers.length > 3 && (
          <Tooltip label={`+${activeUsers.length - 3} more users`}>
            <Avatar size="sm" className={classes.moreUsers}>
              +{activeUsers.length - 3}
            </Avatar>
          </Tooltip>
        )}
      </Group>
    );
  }

  return (
    <Paper p="sm" withBorder className={classes.presencePanel}>
      <Text size="sm" fw={600} mb="xs" color="dimmed">
        Online Users ({activeUsers.length})
      </Text>
      
      <Stack gap="xs">
        {activeUsers.map((user) => (
          <Group key={user.userId} justify="space-between" align="center">
            <Group gap="xs">
              <Indicator
                color={user.presence === 'editing' ? 'green' : 'blue'}
                size={8}
                offset={2}
                position="bottom-end"
              >
                <Avatar
                  size="sm"
                  src={null}
                  className={`${classes.userAvatar} ${classes[user.presence]}`}
                >
                  {user.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Avatar>
              </Indicator>
              
              <Box>
                <Text size="sm" fw={500}>
                  {user.userName}
                </Text>
                {user.editingCard && (
                  <Text size="xs" color="dimmed">
                    Editing card
                  </Text>
                )}
              </Box>
            </Group>

            <Group gap="xs">
              <Badge
                size="xs"
                variant="dot"
                color={user.presence === 'editing' ? 'green' : 'blue'}
                leftSection={
                  user.presence === 'editing' ? (
                    <IconEdit size={10} />
                  ) : (
                    <IconEye size={10} />
                  )
                }
              >
                {user.presence === 'editing' ? 'Editing' : 'Viewing'}
              </Badge>
            </Group>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
