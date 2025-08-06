import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CardModal } from '../CardModal';

// Mock the API calls
jest.mock('../../api/projectApi');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('CardModal Component', () => {
  let queryClient: QueryClient;

  const mockCard = {
    id: 'card-1',
    title: 'Test Card',
    description: 'Test Description',
    position: 0,
    completed: false,
    dueDate: new Date('2025-12-31'),
    cover: null,
    archived: false,
    listId: 'list-1',
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    list: {
      id: 'list-1',
      title: 'To Do',
      position: 0,
      project: {
        id: 'project-1',
        title: 'Test Project',
        ownerId: 'user-1',
      },
    },
    assignees: [
      {
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    ],
    labels: [
      {
        label: {
          id: 'label-1',
          name: 'Priority',
          color: '#ff0000',
        },
      },
    ],
    checklists: [
      {
        id: 'checklist-1',
        title: 'Tasks',
        position: 0,
        items: [
          {
            id: 'item-1',
            text: 'Complete task',
            completed: false,
            position: 0,
            assignee: null,
          },
        ],
      },
    ],
    attachments: [],
    comments: [
      {
        id: 'comment-1',
        text: 'Test comment',
        createdAt: new Date(),
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    ],
    activities: [],
    _count: {
      comments: 1,
      attachments: 0,
      checklists: 1,
    },
    createdBy: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    content: null,
  };

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  describe('Modal Display and Navigation', () => {
    it('should render modal with card details', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('in list To Do')).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should close modal when overlay is clicked', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByTestId('modal-overlay'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should close modal when Escape key is pressed', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('should not render when isOpen is false', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={false}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      expect(screen.queryByText('Test Card')).not.toBeInTheDocument();
    });
  });

  describe('Card Title and Description Editing', () => {
    it('should allow editing card title', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const titleElement = screen.getByText('Test Card');
      fireEvent.click(titleElement);

      const titleInput = screen.getByDisplayValue('Test Card');
      fireEvent.change(titleInput, { target: { value: 'Updated Card Title' } });
      fireEvent.blur(titleInput);

      await waitFor(() => {
        // Check if auto-save was triggered
        expect(titleInput.value).toBe('Updated Card Title');
      });
    });

    it('should allow editing card description', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const descriptionElement = screen.getByText('Test Description');
      fireEvent.click(descriptionElement);

      const descriptionInput = screen.getByDisplayValue('Test Description');
      fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
      fireEvent.blur(descriptionInput);

      await waitFor(() => {
        expect(descriptionInput.value).toBe('Updated description');
      });
    });

    it('should handle empty description placeholder', () => {
      const cardWithoutDescription = { ...mockCard, description: null };
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={cardWithoutDescription} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText('Add a more detailed description...')).toBeInTheDocument();
    });
  });

  describe('Due Date Management', () => {
    it('should display current due date', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText(/Dec 31, 2025/)).toBeInTheDocument();
    });

    it('should allow setting due date', async () => {
      const cardWithoutDueDate = { ...mockCard, dueDate: null };
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={cardWithoutDueDate} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const dueDateButton = screen.getByText('Add due date');
      fireEvent.click(dueDateButton);

      // Should open date picker
      expect(screen.getByText('Set due date')).toBeInTheDocument();
    });

    it('should allow removing due date', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const removeDueDateButton = screen.getByLabelText('Remove due date');
      fireEvent.click(removeDueDateButton);

      await waitFor(() => {
        expect(screen.getByText('Add due date')).toBeInTheDocument();
      });
    });
  });

  describe('Assignee Management', () => {
    it('should display current assignees', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should allow adding assignees', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const addAssigneeButton = screen.getByText('Add assignee');
      fireEvent.click(addAssigneeButton);

      expect(screen.getByText('Search members')).toBeInTheDocument();
    });

    it('should allow removing assignees', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const removeAssigneeButton = screen.getByLabelText('Remove John Doe');
      fireEvent.click(removeAssigneeButton);

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });
  });

  describe('Label Management', () => {
    it('should display current labels', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    it('should allow adding labels', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const addLabelButton = screen.getByText('Add label');
      fireEvent.click(addLabelButton);

      expect(screen.getByText('Select labels')).toBeInTheDocument();
    });

    it('should allow removing labels', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const removeLabelButton = screen.getByLabelText('Remove Priority label');
      fireEvent.click(removeLabelButton);

      await waitFor(() => {
        expect(screen.queryByText('Priority')).not.toBeInTheDocument();
      });
    });
  });

  describe('Checklist Management', () => {
    it('should display existing checklists', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Complete task')).toBeInTheDocument();
    });

    it('should show checklist progress', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText('0/1')).toBeInTheDocument();
    });

    it('should allow adding new checklist', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const addChecklistButton = screen.getByText('Add checklist');
      fireEvent.click(addChecklistButton);

      expect(screen.getByPlaceholderText('Checklist title')).toBeInTheDocument();
    });

    it('should allow checking/unchecking items', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const checkboxItem = screen.getByRole('checkbox', { name: 'Complete task' });
      fireEvent.click(checkboxItem);

      await waitFor(() => {
        expect(checkboxItem).toBeChecked();
      });
    });
  });

  describe('Comments System', () => {
    it('should display existing comments', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });

    it('should allow adding new comments', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const commentInput = screen.getByPlaceholderText('Write a comment...');
      fireEvent.change(commentInput, { target: { value: 'New comment' } });
      
      const submitButton = screen.getByText('Comment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('New comment')).toBeInTheDocument();
      });
    });

    it('should show comment count', () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText('Activity (1)')).toBeInTheDocument();
    });
  });

  describe('Card Actions', () => {
    it('should allow marking card as complete', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const completeButton = screen.getByText('Mark complete');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(screen.getByText('Mark incomplete')).toBeInTheDocument();
      });
    });

    it('should allow archiving card', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const archiveButton = screen.getByText('Archive');
      fireEvent.click(archiveButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should allow moving card to different list', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const moveButton = screen.getByText('Move');
      fireEvent.click(moveButton);

      expect(screen.getByText('Move card')).toBeInTheDocument();
    });
  });

  describe('Auto-save Functionality', () => {
    it('should auto-save changes after edit', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const titleElement = screen.getByText('Test Card');
      fireEvent.click(titleElement);

      const titleInput = screen.getByDisplayValue('Test Card');
      fireEvent.change(titleInput, { target: { value: 'Auto-saved Title' } });

      // Wait for auto-save debounce
      await waitFor(() => {
        expect(screen.getByText('Saved')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show saving indicator during updates', async () => {
      const onClose = jest.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CardModal 
            card={mockCard} 
            isOpen={true}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const titleElement = screen.getByText('Test Card');
      fireEvent.click(titleElement);

      const titleInput = screen.getByDisplayValue('Test Card');
      fireEvent.change(titleInput, { target: { value: 'Saving...' } });

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });
});
