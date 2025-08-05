import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { MantineProviderWrapper } from '@/components/providers/MantineProviderWrapper';

// Import migration handler for production
if (process.env.NODE_ENV === 'production') {
  import('@/lib/db-migration');
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Content Management Tool',
  description:
    'Secure, role-based content management tool with Microsoft Azure AD authentication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={inter.className}
        style={{
          backgroundColor: 'var(--mantine-color-body)',
          color: 'var(--mantine-color-text)',
          minHeight: '100vh',
        }}
      >
        <MantineProviderWrapper>
          <SessionProvider>{children}</SessionProvider>
        </MantineProviderWrapper>
      </body>
    </html>
  );
}
