'use client';

import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { customTheme, cssVariablesResolver } from '@/lib/theme';

interface MantineProviderWrapperProps {
  children: React.ReactNode;
}

export function MantineProviderWrapper({
  children,
}: MantineProviderWrapperProps) {
  return (
    <MantineProvider
      theme={customTheme}
      defaultColorScheme="auto"
      cssVariablesResolver={cssVariablesResolver}
    >
      <DatesProvider settings={{ consistentWeeks: true }}>
        {children}
      </DatesProvider>
    </MantineProvider>
  );
}
