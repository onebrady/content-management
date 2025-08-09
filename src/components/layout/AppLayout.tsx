'use client';

import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavbarNested } from './NavbarNested';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      // Ensure AppShell itself is not a scroll container interfering with DnD
      style={{ overflow: 'visible' }}
    >
      <AppShell.Navbar>
        <NavbarNested />
      </AppShell.Navbar>

      {/* Avoid making Main a scroll parent; let inner content manage scrolling */}
      <AppShell.Main style={{ overflow: 'visible' }}>{children}</AppShell.Main>
    </AppShell>
  );
}
