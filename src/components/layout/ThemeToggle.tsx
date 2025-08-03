'use client';

import {
  ActionIcon,
  useMantineColorScheme,
  Menu,
  Tooltip,
} from '@mantine/core';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const getThemeIcon = () => {
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

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Tooltip label="Toggle theme">
          <ActionIcon variant="light" size="md" aria-label="Toggle theme">
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
  );
}
