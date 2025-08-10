'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { notifications } from '@mantine/notifications';

interface User {
  userId: string;
  userName: string;
  presence: 'viewing' | 'editing';
  editingCard?: string;
}

interface CardMoveEvent {
  cardId: string;
  sourceListId: string;
  destinationListId: string;
  position: number;
  movedBy: {
    userId: string;
    userName: string;
  };
  timestamp: string;
}

interface CardUpdateEvent {
  cardId: string;
  updates: any;
  updatedBy: {
    userId: string;
    userName: string;
  };
  timestamp: string;
}

interface ListUpdateEvent {
  listId: string;
  updates: any;
  updatedBy: {
    userId: string;
    userName: string;
  };
  timestamp: string;
}

interface ChecklistUpdateEvent {
  checklistId: string;
  cardId: string;
  updates: any;
  updatedBy: {
    userId: string;
    userName: string;
  };
  timestamp: string;
}

interface UseRealtimeBoardOptions {
  projectId: string;
  onCardMoved?: (event: CardMoveEvent) => void;
  onCardUpdated?: (event: CardUpdateEvent) => void;
  onListUpdated?: (event: ListUpdateEvent) => void;
  onChecklistUpdated?: (event: ChecklistUpdateEvent) => void;
  onUserJoined?: (user: User) => void;
  onUserLeft?: (user: { userId: string; userName: string }) => void;
  onUserPresence?: (user: User) => void;
}

export function useRealtimeBoard({
  projectId,
  onCardMoved,
  onCardUpdated,
  onListUpdated,
  onChecklistUpdated,
  onUserJoined,
  onUserLeft,
  onUserPresence,
}: UseRealtimeBoardOptions) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user || !projectId) return;

    console.log('Initializing Socket.IO connection for project:', projectId);

    const socket = io({
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      retries: 3,
    });
    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);

      // Join the project room
      socket.emit('join:project', {
        projectId,
        userId: session.user.id,
        userName: session.user.name || session.user.email || 'Unknown User',
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
      setUsers([]);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Room event handlers
    socket.on('join:success', (data) => {
      console.log('Successfully joined project room:', data.projectId);
      notifications.show({
        title: 'Connected',
        message: 'Real-time collaboration is active',
        color: 'green',
      });
    });

    socket.on('room:users', (roomUsers: User[]) => {
      console.log('Room users:', roomUsers);
      setUsers(roomUsers.filter((user) => user.userId !== session.user.id));
    });

    socket.on('user:joined', (user: User) => {
      console.log('User joined:', user);
      setUsers((prev) => [
        ...prev.filter((u) => u.userId !== user.userId),
        user,
      ]);
      onUserJoined?.(user);

      notifications.show({
        title: 'User joined',
        message: `${user.userName} joined the board`,
        color: 'blue',
      });
    });

    socket.on('user:left', (user: { userId: string; userName: string }) => {
      console.log('User left:', user);
      setUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      onUserLeft?.(user);

      notifications.show({
        title: 'User left',
        message: `${user.userName} left the board`,
        color: 'gray',
      });
    });

    socket.on('user:presence', (user: User) => {
      console.log('User presence update:', user);
      setUsers((prev) =>
        prev.map((u) => (u.userId === user.userId ? { ...u, ...user } : u))
      );
      onUserPresence?.(user);
    });

    // Board event handlers
    socket.on('card:moved', (event: CardMoveEvent) => {
      console.log('Card moved:', event);
      onCardMoved?.(event);

      notifications.show({
        title: 'Card moved',
        message: `${event.movedBy.userName} moved a card`,
        color: 'blue',
      });
    });

    socket.on('card:updated', (event: CardUpdateEvent) => {
      console.log('Card updated:', event);
      onCardUpdated?.(event);

      notifications.show({
        title: 'Card updated',
        message: `${event.updatedBy.userName} updated a card`,
        color: 'blue',
      });
    });

    socket.on('list:updated', (event: ListUpdateEvent) => {
      console.log('List updated:', event);
      onListUpdated?.(event);

      notifications.show({
        title: 'List updated',
        message: `${event.updatedBy.userName} updated a list`,
        color: 'blue',
      });
    });

    socket.on('checklist:updated', (event: ChecklistUpdateEvent) => {
      console.log('Checklist updated:', event);
      onChecklistUpdated?.(event);

      notifications.show({
        title: 'Checklist updated',
        message: `${event.updatedBy.userName} updated a checklist`,
        color: 'blue',
      });
    });

    // Error handler
    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
      setConnectionError(error.message);

      notifications.show({
        title: 'Connection Error',
        message: error.message,
        color: 'red',
      });
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up Socket.IO connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    session?.user,
    projectId,
    onCardMoved,
    onCardUpdated,
    onListUpdated,
    onChecklistUpdated,
    onUserJoined,
    onUserLeft,
    onUserPresence,
  ]);

  // Emit presence updates
  const updatePresence = useCallback(
    (presence: 'viewing' | 'editing', editingCard?: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('presence:update', {
          projectId,
          presence,
          editingCard,
        });
      }
    },
    [projectId, isConnected]
  );

  // Emit card move
  const emitCardMove = useCallback(
    (
      cardId: string,
      sourceListId: string,
      destinationListId: string,
      position: number
    ) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('card:move', {
          projectId,
          cardId,
          sourceListId,
          destinationListId,
          position,
        });
      }
    },
    [projectId, isConnected]
  );

  // Emit card update
  const emitCardUpdate = useCallback(
    (cardId: string, updates: any) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('card:update', {
          projectId,
          cardId,
          updates,
        });
      }
    },
    [projectId, isConnected]
  );

  // Emit list update
  const emitListUpdate = useCallback(
    (listId: string, updates: any) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('list:update', {
          projectId,
          listId,
          updates,
        });
      }
    },
    [projectId, isConnected]
  );

  // Emit checklist update
  const emitChecklistUpdate = useCallback(
    (checklistId: string, cardId: string, updates: any) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('checklist:update', {
          projectId,
          checklistId,
          cardId,
          updates,
        });
      }
    },
    [projectId, isConnected]
  );

  // Reconnect function
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  return {
    isConnected,
    users,
    connectionError,
    updatePresence,
    emitCardMove,
    emitCardUpdate,
    emitListUpdate,
    emitChecklistUpdate,
    reconnect,
  };
}
