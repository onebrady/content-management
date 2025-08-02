'use client';

import {
  Box,
  Avatar,
  Text,
  Badge,
  Card,
  Grid,
  Divider,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import { IconUser, IconMail, IconBuilding, IconShield } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';

export function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'MODERATOR':
        return 'orange';
      case 'CONTRIBUTOR':
        return 'blue';
      case 'VIEWER':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Full system access and user management';
      case 'MODERATOR':
        return 'Content review and approval capabilities';
      case 'CONTRIBUTOR':
        return 'Create and edit content';
      case 'VIEWER':
        return 'Read-only access to published content';
      default:
        return 'Unknown role';
    }
  };

  return (
    <Card withBorder>
      <Card.Section p="md">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack align="center" gap="md">
              <Avatar
                size="xl"
                radius="xl"
                color="blue"
              >
                <IconUser size={40} />
              </Avatar>
              <Stack gap="xs" align="center">
                <Title order={3}>{user.name}</Title>
                <Badge color={getRoleColor(user.role)} variant="light">
                  {user.role}
                </Badge>
                <Text size="sm" c="dimmed" ta="center">
                  {getRoleDescription(user.role)}
                </Text>
              </Stack>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              <Title order={4}>User Information</Title>
              <Divider />

              <Stack gap="sm">
                <Group>
                  <IconMail size={16} />
                  <Text size="sm" c="dimmed">
                    Email:
                  </Text>
                  <Text size="sm">{user.email}</Text>
                </Group>

                {user.department && (
                  <Group>
                    <IconBuilding size={16} />
                    <Text size="sm" c="dimmed">
                      Department:
                    </Text>
                    <Text size="sm">{user.department}</Text>
                  </Group>
                )}

                <Group>
                  <IconShield size={16} />
                  <Text size="sm" c="dimmed">
                    Role:
                  </Text>
                  <Badge color={getRoleColor(user.role)} variant="light" size="sm">
                    {user.role}
                  </Badge>
                </Group>
              </Stack>
            </Stack>
          </Grid.Col>
        </Grid>
      </Card.Section>
    </Card>
  );
} 