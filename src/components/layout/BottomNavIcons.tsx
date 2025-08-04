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
    <Group gap="xs" justify="center">
      {/* Theme Toggle */}
      <Menu shadow="md" width={200} position="top-end">
        <Menu.Target>
          <Tooltip label="Toggle theme">
            <ActionIcon
              variant="light"
              size="md"
              color="gray"
              aria-label="Toggle theme"
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
            color={colorScheme === 'light' ? 'blue' : undefined}
          >
            Light mode
          </Menu.Item>
          <Menu.Item
            leftSection={<IconMoon size={16} />}
            onClick={() => setColorScheme('dark')}
            color={colorScheme === 'dark' ? 'blue' : undefined}
          >
            Dark mode
          </Menu.Item>
          <Menu.Item
            leftSection={<IconDeviceDesktop size={16} />}
            onClick={() => setColorScheme('auto')}
            color={colorScheme === 'auto' ? 'blue' : undefined}
          >
            System theme
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* Settings */}
      {user?.role === 'ADMIN' && (
        <Tooltip label="Settings">
          <ActionIcon
            variant="light"
            size="md"
            color="gray"
            onClick={handleSettingsClick}
            aria-label="Settings"
          >
            <IconSettings size={18} />
          </ActionIcon>
        </Tooltip>
      )}

      {/* Search */}
      <Tooltip label="Search">
        <ActionIcon
          variant="light"
          size="md"
          color="gray"
          onClick={handleSearchClick}
          aria-label="Search"
        >
          <IconSearch size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
