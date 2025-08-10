import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/core/styles.css';

// Create a custom renderer that wraps components with necessary providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider forceColorScheme="light">
    <Notifications />
    <DatesProvider settings={{ locale: 'en' }}>{children}</DatesProvider>
  </MantineProvider>
);

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
