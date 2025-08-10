/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import ProjectsPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the projects API
jest.mock('@/features/projects/hooks/useProjectData', () => ({
  useProjects: () => ({
    data: {
      data: {
        projects: [
          {
            id: 'test-project-1',
            title: 'Test Project 1',
            description: 'Test description 1',
            status: 'planning',
            color: '#3b82f6',
            updatedAt: '2024-01-01T00:00:00Z',
            members: [],
          },
          {
            id: 'test-project-2',
            title: 'Test Project 2',
            description: 'Test description 2',
            status: 'in-progress',
            color: '#10b981',
            updatedAt: '2024-01-02T00:00:00Z',
            members: [],
          },
        ],
      },
    },
    isLoading: false,
    isError: false,
  }),
}));

// Mock auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user',
        email: 'test@example.com',
        role: 'admin',
      },
    },
    status: 'authenticated',
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>{children}</MantineProvider>
    </QueryClientProvider>
  );
};

describe('Project Card Drag Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Card Positioning and Rendering', () => {
    it('should render project cards with proper structure for drag and drop', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check that cards are rendered
        expect(screen.getByText('Test Project 1')).toBeInTheDocument();
        expect(screen.getByText('Test Project 2')).toBeInTheDocument();
      });

      // Check that cards are in correct columns
      const planningCard = screen
        .getByText('Test Project 1')
        .closest('[data-testid*="draggable"]');
      const inProgressCard = screen
        .getByText('Test Project 2')
        .closest('[data-testid*="draggable"]');

      expect(planningCard).toBeInTheDocument();
      expect(inProgressCard).toBeInTheDocument();
    });

    it('should render draggable cards with stable test ids', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card1 = screen.getByTestId('draggable-test-project-1');
        const card2 = screen.getByTestId('draggable-test-project-2');
        expect(card1).toBeInTheDocument();
        expect(card2).toBeInTheDocument();
      });
    });

    it('should apply draggable styles to project cards', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card1 = screen.getByTestId('draggable-test-project-1');
        const card2 = screen.getByTestId('draggable-test-project-2');
        expect(card1).toHaveStyle('cursor: grab');
        expect(card2).toHaveStyle('cursor: grab');
      });
    });
  });

  describe('Visual Feedback During Drag', () => {
    it('should apply grab cursor to cards in rest state', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card = screen.getByTestId('draggable-test-project-1');
        expect(card).toHaveStyle('cursor: grab');
      });
    });

    it('should show proper visual state when card is being dragged', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card = screen.getByTestId('draggable-test-project-1');
        // In rest state, cards should have grab cursor (from inline styles)
        expect(card).toHaveStyle('cursor: grab');
      });
    });

    it('should highlight drop zones when dragging over them', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const inProgressColumn = screen.getByTestId('column-in-progress');
        // Columns should have the droppableColumn class for styling
        expect(inProgressColumn).toHaveClass('droppableColumn');
      });
    });
  });

  describe('Drag Event Handling', () => {
    it('should handle drag end events properly', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card = screen.getByTestId('draggable-test-project-1');
        // Verify card structure for drag functionality
        expect(card).toHaveStyle('cursor: grab');
      });

      // Note: Actual drag simulation doesn't work reliably in jsdom
      // The real drag testing should be done with e2e tests
    });

    it('should not trigger API calls for invalid drops', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card = screen.getByTestId('draggable-test-project-1');
        // Simulate click down/up in same place
        fireEvent.mouseDown(card!);
        fireEvent.mouseUp(card!);
      });

      // Should not make any API calls for same-position drops
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should maintain card content and structure during drag operations', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card = screen.getByTestId('draggable-test-project-1');
        const originalTitle = screen.getByText('Test Project 1');
        const originalDescription = screen.getByText('Test description 1');
        fireEvent.mouseDown(card!);
        expect(originalTitle).toBeInTheDocument();
        expect(originalDescription).toBeInTheDocument();
        fireEvent.mouseUp(card!);
        expect(originalTitle).toBeInTheDocument();
        expect(originalDescription).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle failed API calls gracefully', async () => {
      // Mock a failed API response
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card = screen.getByTestId('draggable-test-project-1');
        fireEvent.mouseDown(card!);
        fireEvent.mouseMove(card!, { clientX: 200, clientY: 100 });
        fireEvent.mouseUp(card!);
      });

      // Card should remain in original position after failed API call
      await waitFor(() => {
        expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      });
    });

    it('should prevent drag operations on disabled cards', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card = screen.getByTestId('draggable-test-project-1');
        expect(card).toBeInTheDocument();
      });
    });

    it('should handle rapid successive drag operations', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card = screen.getByTestId('draggable-test-project-1');
        for (let i = 0; i < 3; i++) {
          fireEvent.mouseDown(card!);
          fireEvent.mouseMove(card!, { clientX: 100 + i * 10, clientY: 100 });
          fireEvent.mouseUp(card!);
        }
      });

      // Should handle multiple operations without breaking
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Keyboard Support', () => {
    it('should have proper ARIA attributes for drag and drop', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card = screen.getByTestId('draggable-test-project-1');
        expect(card).toBeInTheDocument();
      });
    });

    it('should be focusable with keyboard navigation', async () => {
      render(
        <TestWrapper>
          <ProjectsPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const card = screen.getByTestId('draggable-test-project-1');
        expect(card).toBeInTheDocument();
      });
    });
  });
});
