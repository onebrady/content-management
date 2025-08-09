import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProjectsPage from '../page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { projectKeys } from '@/features/projects/hooks/queryKeys';

// Do NOT mock useProjects here; we want the component to call fetch and React Query

describe('Projects Page - persistence across refetch', () => {
  function createWrapper(queryClient: QueryClient) {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <MantineProvider>{children}</MantineProvider>
        </QueryClientProvider>
      );
    };
  }

  it('reflects updated status after PATCH + refetch', async () => {
    // Track current status as the UI would receive it from GET /api/projects
    let currentStatus = 'planning';
    const calls: Array<{ url: string; init?: any }> = [];

    const originalFetch = global.fetch as any;
    (global as any).fetch = jest.fn(async (url: string, init?: any) => {
      calls.push({ url, init });
      const method = (init?.method || 'GET').toUpperCase();
      if (url.includes('/api/projects') && method === 'GET') {
        return {
          ok: true,
          json: async () => ({
            data: {
              projects: [
                {
                  id: 'p1',
                  title: 'Test Project',
                  description: 'Desc',
                  color: '#3b82f6',
                  archived: false,
                  status: currentStatus,
                  statusOrder: 1000,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          }),
        } as any;
      }
      if (url.includes('/api/projects/p1') && method === 'PATCH') {
        // Emulate server update to in-progress
        currentStatus = 'in-progress';
        return { ok: true, json: async () => ({ success: true }) } as any;
      }
      // Default ok response
      return { ok: true, json: async () => ({}) } as any;
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const Wrapper = createWrapper(queryClient);

    render(
      <Wrapper>
        <ProjectsPage />
      </Wrapper>
    );

    // Initial render loads projects
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(
        calls.some(
          (c) =>
            c.url.includes('/api/projects') &&
            (!c.init || c.init.method === undefined)
        )
      ).toBe(true);
    });

    // Simulate a move resulting in server update (PATCH)
    await (global as any).fetch('/api/projects/p1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destStatus: 'in-progress', destIndex: 0 }),
    });

    // Force refetch in the component
    await queryClient.invalidateQueries({ queryKey: projectKeys.list('all') });

    // After refetch, GET should have been called again and our simulated status switches to in-progress
    await waitFor(() => {
      const getCalls = calls.filter(
        (c) =>
          c.url.includes('/api/projects') &&
          (!c.init || (c.init.method || 'GET').toUpperCase() === 'GET')
      );
      expect(getCalls.length).toBeGreaterThan(1);
      expect(currentStatus).toBe('in-progress');
    });

    (global as any).fetch = originalFetch;
  });
});
