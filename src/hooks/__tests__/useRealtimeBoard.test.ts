import { renderHook, act } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { io } from 'socket.io-client';
import { useRealtimeBoard } from '../useRealtimeBoard';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));
const mockIo = io as unknown as jest.MockedFunction<typeof io>;

// Mock notifications
jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}));

describe('useRealtimeBoard Hook', () => {
  const mockSocket = {
    id: 'socket-123',
    on: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  };

  const mockSession = {
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIo.mockReturnValue(mockSocket as any);
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    } as any);
  });

  describe('Socket Connection', () => {
    it('should initialize socket connection with correct configuration', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      expect(mockIo).toHaveBeenCalledWith({
        path: '/api/socket',
        transports: ['websocket', 'polling'],
        timeout: 20000,
        retries: 3,
      });

      expect(mockSocket.on).toHaveBeenCalledWith(
        'connect',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'disconnect',
        expect.any(Function)
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        'connect_error',
        expect.any(Function)
      );
    });

    it('should join project room on connection', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      // Simulate connection
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      act(() => {
        connectHandler?.();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('join:project', {
        projectId: 'project-1',
        userId: 'user-1',
        userName: 'John Doe',
      });
    });

    it('should handle connection state changes', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      expect(result.current.isConnected).toBe(false);

      // Simulate connection
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      act(() => {
        connectHandler?.();
      });

      expect(result.current.isConnected).toBe(true);

      // Simulate disconnection
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'disconnect'
      )?.[1];

      act(() => {
        disconnectHandler?.();
      });

      expect(result.current.isConnected).toBe(false);
    });

    it('should handle connection errors', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      const errorHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect_error'
      )?.[1];

      act(() => {
        errorHandler?.(new Error('Connection failed'));
      });

      expect(result.current.connectionError).toBe('Connection failed');
      expect(result.current.isConnected).toBe(false);
    });
  });

  describe('User Presence Management', () => {
    it('should handle room users list', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      const roomUsersHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'room:users'
      )?.[1];

      const mockUsers = [
        { userId: 'user-1', userName: 'John Doe', presence: 'viewing' },
        { userId: 'user-2', userName: 'Jane Smith', presence: 'editing' },
      ];

      act(() => {
        roomUsersHandler?.(mockUsers);
      });

      // Should filter out current user
      expect(result.current.users).toEqual([
        { userId: 'user-2', userName: 'Jane Smith', presence: 'editing' },
      ]);
    });

    it('should handle user joined events', () => {
      const onUserJoined = jest.fn();
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
          onUserJoined,
        })
      );

      const userJoinedHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'user:joined'
      )?.[1];

      const newUser = {
        userId: 'user-3',
        userName: 'Bob Wilson',
        presence: 'viewing',
      };

      act(() => {
        userJoinedHandler?.(newUser);
      });

      expect(result.current.users).toContainEqual(newUser);
      expect(onUserJoined).toHaveBeenCalledWith(newUser);
    });

    it('should handle user left events', () => {
      const onUserLeft = jest.fn();
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
          onUserLeft,
        })
      );

      // Add a user first
      const userJoinedHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'user:joined'
      )?.[1];

      act(() => {
        userJoinedHandler?.({
          userId: 'user-2',
          userName: 'Jane Smith',
          presence: 'viewing',
        });
      });

      // Now remove the user
      const userLeftHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'user:left'
      )?.[1];

      act(() => {
        userLeftHandler?.({ userId: 'user-2', userName: 'Jane Smith' });
      });

      expect(result.current.users).not.toContainEqual(
        expect.objectContaining({ userId: 'user-2' })
      );
      expect(onUserLeft).toHaveBeenCalledWith({
        userId: 'user-2',
        userName: 'Jane Smith',
      });
    });

    it('should handle presence updates', () => {
      const onUserPresence = jest.fn();
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
          onUserPresence,
        })
      );

      // Add a user first
      const userJoinedHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'user:joined'
      )?.[1];

      act(() => {
        userJoinedHandler?.({
          userId: 'user-2',
          userName: 'Jane Smith',
          presence: 'viewing',
        });
      });

      // Update presence
      const presenceHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'user:presence'
      )?.[1];

      const updatedUser = {
        userId: 'user-2',
        userName: 'Jane Smith',
        presence: 'editing',
        editingCard: 'card-123',
      };

      act(() => {
        presenceHandler?.(updatedUser);
      });

      expect(result.current.users).toContainEqual(updatedUser);
      expect(onUserPresence).toHaveBeenCalledWith(updatedUser);
    });
  });

  describe('Real-time Board Events', () => {
    it('should handle card moved events', () => {
      const onCardMoved = jest.fn();
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
          onCardMoved,
        })
      );

      const cardMovedHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'card:moved'
      )?.[1];

      const moveEvent = {
        cardId: 'card-1',
        sourceListId: 'list-1',
        destinationListId: 'list-2',
        position: 1000,
        movedBy: { userId: 'user-2', userName: 'Jane Smith' },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        cardMovedHandler?.(moveEvent);
      });

      expect(onCardMoved).toHaveBeenCalledWith(moveEvent);
    });

    it('should handle card updated events', () => {
      const onCardUpdated = jest.fn();
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
          onCardUpdated,
        })
      );

      const cardUpdatedHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'card:updated'
      )?.[1];

      const updateEvent = {
        cardId: 'card-1',
        updates: { title: 'Updated Title' },
        updatedBy: { userId: 'user-2', userName: 'Jane Smith' },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        cardUpdatedHandler?.(updateEvent);
      });

      expect(onCardUpdated).toHaveBeenCalledWith(updateEvent);
    });

    it('should handle list updated events', () => {
      const onListUpdated = jest.fn();
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
          onListUpdated,
        })
      );

      const listUpdatedHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'list:updated'
      )?.[1];

      const updateEvent = {
        listId: 'list-1',
        updates: { title: 'Updated List' },
        updatedBy: { userId: 'user-2', userName: 'Jane Smith' },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        listUpdatedHandler?.(updateEvent);
      });

      expect(onListUpdated).toHaveBeenCalledWith(updateEvent);
    });

    it('should handle checklist updated events', () => {
      const onChecklistUpdated = jest.fn();
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
          onChecklistUpdated,
        })
      );

      const checklistUpdatedHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'checklist:updated'
      )?.[1];

      const updateEvent = {
        checklistId: 'checklist-1',
        cardId: 'card-1',
        updates: { completed: true },
        updatedBy: { userId: 'user-2', userName: 'Jane Smith' },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        checklistUpdatedHandler?.(updateEvent);
      });

      expect(onChecklistUpdated).toHaveBeenCalledWith(updateEvent);
    });
  });

  describe('Event Emission', () => {
    it('should emit presence updates when connected', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      // Simulate connection
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      act(() => {
        connectHandler?.();
      });

      act(() => {
        result.current.updatePresence('editing', 'card-123');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('presence:update', {
        projectId: 'project-1',
        presence: 'editing',
        editingCard: 'card-123',
      });
    });

    it('should emit card move when connected', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      // Simulate connection
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      act(() => {
        connectHandler?.();
      });

      act(() => {
        result.current.emitCardMove('card-1', 'list-1', 'list-2', 1000);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('card:move', {
        projectId: 'project-1',
        cardId: 'card-1',
        sourceListId: 'list-1',
        destinationListId: 'list-2',
        position: 1000,
      });
    });

    it('should not emit when disconnected', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      // Don't simulate connection, so isConnected remains false

      act(() => {
        result.current.updatePresence('editing', 'card-123');
      });

      // Should not emit when disconnected
      expect(mockSocket.emit).not.toHaveBeenCalledWith(
        'presence:update',
        expect.any(Object)
      );
    });
  });

  describe('Cleanup', () => {
    it('should disconnect socket on unmount', () => {
      const { unmount } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      unmount();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('Reconnection', () => {
    it('should provide reconnect function', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      act(() => {
        result.current.reconnect();
      });

      expect(mockSocket.connect).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing session', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      } as any);

      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      // Should not initialize socket without session
      expect(mockIo).not.toHaveBeenCalled();
    });

    it('should handle missing projectId', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: '',
        })
      );

      // Should not initialize socket without projectId
      expect(mockIo).not.toHaveBeenCalled();
    });

    it('should handle socket errors gracefully', () => {
      const { result } = renderHook(() =>
        useRealtimeBoard({
          projectId: 'project-1',
        })
      );

      const errorHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'error'
      )?.[1];

      act(() => {
        errorHandler?.({ message: 'Socket error occurred' });
      });

      expect(result.current.connectionError).toBe('Socket error occurred');
    });
  });
});
