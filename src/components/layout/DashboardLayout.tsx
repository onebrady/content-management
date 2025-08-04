'use client';

import { ReactNode, useState } from 'react';
import {
  AppShell,
  Navbar,
  Header,
  Text,
  Group,
  Button,
  Avatar,
  Menu,
  ActionIcon,
  Box,
  Stack,
  Divider,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconMenu2,
  IconDashboard,
  IconArticle,
  IconChecklist,
  IconUsers,
  IconSettings,
  IconUser,
  IconLogout,
  IconChevronLeft,
  IconSearch,
  IconChartBar,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/notifications/NotificationBell';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpened, setMobileOpened] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <IconDashboard size={20} />,
      href: '/dashboard',
      roles: ['VIEWER', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
    },
    {
      text: 'Content',
      icon: <IconArticle size={20} />,
      href: '/content',
      roles: ['VIEWER', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
    },
    {
      text: 'Search',
      icon: <IconSearch size={20} />,
      href: '/search',
      roles: ['VIEWER', 'CONTRIBUTOR', 'MODERATOR', 'ADMIN'],
    },
    {
      text: 'Approvals',
      icon: <IconChecklist size={20} />,
      href: '/approvals',
      roles: ['MODERATOR', 'ADMIN'],
    },
    {
      text: 'Users',
      icon: <IconUsers size={20} />,
      href: '/admin/users',
      roles: ['ADMIN'],
    },
    {
      text: 'Analytics',
      icon: <IconChartBar size={20} />,
      href: '/analytics',
      roles: ['ADMIN', 'MODERATOR'],
    },
    {
      text: 'Settings',
      icon: <IconSettings size={20} />,
      href: '/admin/settings',
      roles: ['ADMIN'],
    },
  ];

  const filteredNavigationItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'md',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={() => setMobileOpened(!mobileOpened)}
              display={{ base: 'block', md: 'none' }}
            >
              <IconMenu2 size={20} />
            </ActionIcon>
            <Text size="lg" fw={700}>
              Content Management
            </Text>
          </Group>

          <Group gap="xs">
            <ActionIcon variant="subtle" onClick={() => router.push('/search')}>
              <IconSearch size={20} />
            </ActionIcon>
            <NotificationBell />
            <Text size="sm" display={{ base: 'none', sm: 'block' }}>
              {user?.name}
            </Text>
            <Menu>
              <Menu.Target>
                <Avatar size="sm" color="blue">
                  <IconUser size={16} />
                </Avatar>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={14} />}>
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {filteredNavigationItems.map((item) => (
            <Button
              key={item.text}
              variant="subtle"
              leftSection={item.icon}
              justify="flex-start"
              onClick={() => {
                router.push(item.href);
                if (isMobile) {
                  setMobileOpened(false);
                }
              }}
            >
              {item.text}
            </Button>
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
