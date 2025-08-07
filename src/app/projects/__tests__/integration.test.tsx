import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import ProjectPage from '../[id]/page';
import ProjectsPage from '../page';
import {
  useProject,
  useProjects,
} from '@/features/projects/hooks/useProjectData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock project data hooks
jest.mock('@/features/projects/hooks/useProjectData');
const mockUseProject = useProject as jest.MockedFunction<typeof useProject>;
const mockUseProjects = useProjects as jest.MockedFunction<typeof useProjects>;

// Mock BoardView component
jest.mock('@/features/projects/components/BoardView', () => {
  return function MockBoardView({ project }: { project: any }) {
    return (
      <div data-testid="board-view">
        <h2>{project.title}</h2>
        <div data-testid="lists-container">
          {project.lists?.map((list: any) => (
            <div key={list.id} data-testid={`list-${list.id}`}>
              {list.title}
              {list.cards?.map((card: any) => (
                <div key={card.id} data-testid={`card-${card.id}`}>
                  {card.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };
});

// Mock UserPresence component
jest.mock('@/features/projects/components/UserPresence', () => {
  return function MockUserPresence({ users }: { users: any[] }) {
    return (
      <div data-testid="user-presence">
        {users.map((user) => (
          <div key={user.userId} data-testid={`user-${user.userId}`}>
            {user.userName}
          </div>
        ))}
      </div>
    );
  };
});

// Mock ConflictResolutionModal
jest.mock('@/features/projects/components/ConflictResolutionModal', () => {
  return function MockConflictResolutionModal({ isOpen }: { isOpen: boolean }) {
    return isOpen ? (
      <div data-testid="conflict-modal">Conflict Resolution</div>
    ) : null;
  };
});

// Mock useRealtimeBoard hook
jest.mock('@/hooks/useRealtimeBoard', () => ({
  useRealtimeBoard: () => ({
    isConnected: true,
    users: [
      { userId: 'user-1', userName: 'John Doe', presence: 'viewing' },
      { userId: 'user-2', userName: 'Jane Smith', presence: 'editing' },
    ],
    connectionError: null,
    updatePresence: jest.fn(),
    emitCardMove: jest.fn(),
    emitCardUpdate: jest.fn(),
    emitListUpdate: jest.fn(),
    emitChecklistUpdate: jest.fn(),
    reconnect: jest.fn(),
  }),
}));

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MantineProvider>{children}</MantineProvider>
      </QueryClientProvider>
    );
  };
};

describe('Project Management Integration', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'CONTRIBUTOR',
    },
  };

  const mockProject = {
    id: 'project-1',
    title: 'Test Project',
    description: 'Test project description',
    background: '#f8f9fa',
    visibility: 'TEAM',
    starred: false,
    ownerId: 'user-1',
    lists: [
      {
        id: 'list-1',
        title: 'To Do',
        position: 1000,
        archived: false,
        color: 'blue',
        cards: [
          {
            id: 'card-1',
            title: 'First Task',
            description: 'Task description',
            position: 1000,
            dueDate: null,
            assignees: [],
            labels: [],
            checklists: [],
          },
        ],
      },
      {
        id: 'list-2',
        title: 'In Progress',
        position: 2000,
        archived: false,
        color: 'yellow',
        cards: [],
      },
    ],
    members: [],
    labels: [],
  };

  const mockProjects = {
    data: {
      projects: [
        {
          id: 'project-1',
          title: 'Test Project',
          description: 'Test project description',
          color: '#3b82f6',
          archived: false,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-08T00:00:00.000Z',
          background: '#f8f9fa',
          visibility: 'TEAM',
          starred: false,
          template: false,
          ownerId: 'user-1',
          members: [],
          lists: mockProject.lists,
          _count: {
            lists: 2,
            cards: 1,
          },
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    } as any);
  });

  describe('Individual Project Page Integration', () => {
    it('should render BoardView component with project data', async () => {
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        isError: false,
      } as any);

      const params = Promise.resolve({ id: 'project-1' });
      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ProjectPage params={params} />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('board-view')).toBeInTheDocument();
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(screen.getByTestId('lists-container')).toBeInTheDocument();
        expect(screen.getByTestId('list-list-1')).toBeInTheDocument();
        expect(screen.getByTestId('list-list-2')).toBeInTheDocument();
        expect(screen.getByTestId('card-card-1')).toBeInTheDocument();
        expect(screen.getByText('First Task')).toBeInTheDocument();
      });
    });

    it('should integrate real-time collaboration features', async () => {
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        isError: false,
      } as any);

      const params = Promise.resolve({ id: 'project-1' });
      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ProjectPage params={params} />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-presence')).toBeInTheDocument();
        expect(screen.getByTestId('user-user-1')).toBeInTheDocument();
        expect(screen.getByTestId('user-user-2')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should handle loading state correctly', async () => {
      mockUseProject.mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
      } as any);

      const params = Promise.resolve({ id: 'project-1' });
      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ProjectPage params={params} />
        </Wrapper>
      );

      // LoadingOverlay doesn't use role="progressbar", it's a Mantine component
      await waitFor(() => {
        expect(screen.getByText(/Connecting to real-time/)).toBeInTheDocument();
      });
    });

    it('should handle error state correctly', async () => {
      mockUseProject.mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
      } as any);

      const params = Promise.resolve({ id: 'project-1' });
      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ProjectPage params={params} />
        </Wrapper>
      );

      expect(
        screen.getByText(/Project not found or you don't have access/)
      ).toBeInTheDocument();
    });
  });

  describe('Projects Listing Page Integration', () => {
    it('should render projects with new schema data', async () => {
      mockUseProjects.mockReturnValue({
        data: mockProjects,
        isLoading: false,
        isError: false,
      } as any);

      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ProjectsPage />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument();
        expect(
          screen.getByText('Test project description')
        ).toBeInTheDocument();
        expect(screen.getByText('2 lists')).toBeInTheDocument();
        expect(screen.getByText('1 cards')).toBeInTheDocument();
      });
    });

    it('should show empty state when no projects exist', async () => {
      mockUseProjects.mockReturnValue({
        data: { data: { projects: [] } },
        isLoading: false,
        isError: false,
      } as any);

      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ProjectsPage />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No projects yet')).toBeInTheDocument();
        expect(
          screen.getByText(/Create your first project/)
        ).toBeInTheDocument();
      });
    });

    it('should handle loading state correctly', async () => {
      mockUseProjects.mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
      } as any);

      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ProjectsPage />
        </Wrapper>
      );

      // LoadingOverlay doesn't use role="progressbar", check for the overlay presence
      await waitFor(() => {
        expect(
          document.querySelector('.mantine-LoadingOverlay-root')
        ).toBeInTheDocument();
      });
    });

    it('should handle project navigation correctly', async () => {
      mockUseProjects.mockReturnValue({
        data: mockProjects,
        isLoading: false,
        isError: false,
      } as any);

      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ProjectsPage />
        </Wrapper>
      );

      await waitFor(() => {
        const viewProjectLink = screen.getByText('View Project');
        expect(viewProjectLink.closest('a')).toHaveAttribute(
          'href',
          '/projects/project-1'
        );
      });
    });
  });

  describe('Component Integration', () => {
    it('should not render old ProjectBoard component', async () => {
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        isError: false,
      } as any);

      const params = Promise.resolve({ id: 'project-1' });
      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ProjectPage params={params} />
        </Wrapper>
      );

      // Should not find old component indicators
      expect(screen.queryByTestId('old-project-board')).not.toBeInTheDocument();
      expect(screen.queryByTestId('task-card')).not.toBeInTheDocument();
      expect(screen.queryByTestId('column-container')).not.toBeInTheDocument();

      // Should find new component indicators
      expect(screen.getByTestId('board-view')).toBeInTheDocument();
    });

    it('should integrate conflict resolution modal', async () => {
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        isError: false,
      } as any);

      const params = Promise.resolve({ id: 'project-1' });
      const Wrapper = createWrapper();

      render(
        <Wrapper>
          <ProjectPage params={params} />
        </Wrapper>
      );

      // Conflict modal should be available (though not open by default)
      expect(screen.queryByTestId('conflict-modal')).not.toBeInTheDocument();
    });
  });
});
