'use client';

import { UnstyledButton, Group, Text, rem, Menu, Avatar } from '@mantine/core';
import {
  IconChevronRight,
  IconLogout,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import classes from './UserButton.module.css';

export function UserButton() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton className={classes.user}>
          <Group>
            <Avatar src={null} radius="xl" size="md" color="blue">
              {user?.name?.charAt(0) || 'U'}
            </Avatar>

            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                {user?.name || 'User'}
              </Text>

              <Text c="dimmed" size="xs">
                {user?.email || 'user@example.com'}
              </Text>
            </div>

            <IconChevronRight
              style={{ width: rem(14), height: rem(14) }}
              stroke={1.5}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
          onClick={() => router.push('/profile')}
        >
          Profile
        </Menu.Item>
        <Menu.Item
          leftSection={
            <IconSettings style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={() => router.push('/admin/settings')}
        >
          Settings
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={
            <IconLogout style={{ width: rem(14), height: rem(14) }} />
          }
          onClick={handleSignOut}
          color="red"
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
