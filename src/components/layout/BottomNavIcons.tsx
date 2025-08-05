'use client';

import {
  ActionIcon,
  Group,
  Tooltip,
  useMantineColorScheme,
  Menu,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconSettings,
  IconSearch,
  IconUser,
  IconUsers,
  IconLayoutDashboard,
  IconClipboardList,
  IconFileText,
  IconBellRinging,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export function BottomNavIcons() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeIcon = () => {
    if (!mounted) {
      return <IconDeviceDesktop size={18} />;
    }

    switch (colorScheme) {
      case 'light':
        return <IconSun size={18} />;
      case 'dark':
        return <IconMoon size={18} />;
      default:
        return <IconDeviceDesktop size={18} />;
    }
  };

  const getThemeLabel = () => {
    switch (colorScheme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      default:
        return 'System theme';
    }
  };

  const handleSettingsClick = () => {
    router.push('/admin/settings');
  };

  const handleSearchClick = () => {
    router.push('/search');
  };

  return (
    <Group gap="md" justify="center">
      {/* Theme Toggle */}
      <Menu shadow="md" width={200} position="top-end">
        <Menu.Target>
          <Tooltip label="Toggle theme">
            <ActionIcon
              variant="light"
              size="md"
              color="primary"
              aria-label="Toggle theme"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--primary)',
                borderColor: 'var(--border)',
                transition: 'all 0.2s ease',
              }}
            >
              {getThemeIcon()}
            </ActionIcon>
          </Tooltip>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Theme</Menu.Label>
          <Menu.Item
            leftSection={<IconSun size={16} />}
            onClick={() => setColorScheme('light')}
            color={colorScheme === 'light' ? 'primary' : undefined}
          >
            Light mode
          </Menu.Item>
          <Menu.Item
            leftSection={<IconMoon size={16} />}
            onClick={() => setColorScheme('dark')}
            color={colorScheme === 'dark' ? 'primary' : undefined}
          >
            Dark mode
          </Menu.Item>
          <Menu.Item
            leftSection={<IconDeviceDesktop size={16} />}
            onClick={() => setColorScheme('auto')}
            color={colorScheme === 'auto' ? 'primary' : undefined}
          >
            System theme
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* Settings */}
      {user?.role === 'ADMIN' && (
        <Menu shadow="md" width={200} position="top-end">
          <Menu.Target>
            <Tooltip label="Settings">
              <ActionIcon
                variant="light"
                size="md"
                color="primary"
                aria-label="Settings"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--primary)',
                  borderColor: 'var(--border)',
                  transition: 'all 0.2s ease',
                }}
              >
                <IconSettings size={18} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Settings</Menu.Label>
            <Menu.Item
              leftSection={<IconUser size={16} />}
              onClick={() => router.push('/admin/users')}
            >
              User Management
            </Menu.Item>
            <Menu.Item
              leftSection={<IconSettings size={16} />}
              onClick={() => router.push('/admin/settings')}
            >
              System Settings
            </Menu.Item>
            <Menu.Item
              leftSection={<IconClipboardList size={16} />}
              onClick={() => router.push('/admin/permissions')}
            >
              Permissions
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}

      {/* Search */}
      <Menu shadow="md" width={200} position="top-end">
        <Menu.Target>
          <Tooltip label="Search">
            <ActionIcon
              variant="light"
              size="md"
              color="primary"
              aria-label="Search"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--primary)',
                borderColor: 'var(--border)',
                transition: 'all 0.2s ease',
              }}
            >
              <IconSearch size={18} />
            </ActionIcon>
          </Tooltip>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Quick Navigation</Menu.Label>
          <Menu.Item
            leftSection={<IconLayoutDashboard size={16} />}
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </Menu.Item>
          <Menu.Item
            leftSection={<IconFileText size={16} />}
            onClick={() => router.push('/content')}
          >
            Content
          </Menu.Item>
          <Menu.Item
            leftSection={<IconBellRinging size={16} />}
            onClick={() => router.push('/approvals')}
          >
            Approvals
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            leftSection={<IconSearch size={16} />}
            onClick={() => router.push('/search')}
            color="primary"
          >
            Advanced Search
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
