import { NextRequest, NextResponse } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

interface ProjectRoom {
  projectId: string;
  users: Map<string, {
    userId: string;
    userName: string;
    socketId: string;
    presence: 'viewing' | 'editing';
    editingCard?: string;
    lastActivity: Date;
  }>;
}

// Store active project rooms
const projectRooms = new Map<string, ProjectRoom>();

// Initialize Socket.IO server
let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    // This endpoint is used to initialize the socket server
    // The actual socket handling is done in the middleware
    return NextResponse.json({ 
      message: 'Socket.IO server initialization endpoint',
      status: 'ready' 
    });
  }

  return NextResponse.json({ 
    message: 'Socket.IO server is running',
    connectedClients: io.engine.clientsCount || 0
  });
}

export async function POST(req: NextRequest) {
  try {
    // This endpoint can be used to trigger server-side events if needed
    const body = await req.json();
    const { action, projectId, data } = body;

    if (!io) {
      return NextResponse.json(
        { error: 'Socket.IO server not initialized' },
        { status: 500 }
      );
    }

    // Broadcast events to specific project rooms
    switch (action) {
      case 'card_moved':
        io.to(`project:${projectId}`).emit('card:moved', data);
        break;
      case 'list_updated':
        io.to(`project:${projectId}`).emit('list:updated', data);
        break;
      case 'board_updated':
        io.to(`project:${projectId}`).emit('board:updated', data);
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Socket.IO POST endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Socket.IO event handlers
export function initializeSocketIO(server: SocketServer) {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL || false
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle project room joining
    socket.on('join:project', async (data) => {
      try {
        const { projectId, userId, userName } = data;

        if (!projectId || !userId || !userName) {
          socket.emit('error', { message: 'Missing required data for project join' });
          return;
        }

        // Verify user has access to this project
        const projectAccess = await verifyProjectAccess(userId, projectId);
        if (!projectAccess) {
          socket.emit('error', { message: 'Access denied to project' });
          return;
        }

        // Join the project room
        socket.join(`project:${projectId}`);

        // Initialize or get project room
        if (!projectRooms.has(projectId)) {
          projectRooms.set(projectId, {
            projectId,
            users: new Map(),
          });
        }

        const room = projectRooms.get(projectId)!;
        
        // Add user to room
        room.users.set(socket.id, {
          userId,
          userName,
          socketId: socket.id,
          presence: 'viewing',
          lastActivity: new Date(),
        });

        // Broadcast user joined to other users in the room
        socket.to(`project:${projectId}`).emit('user:joined', {
          userId,
          userName,
          presence: 'viewing',
        });

        // Send current room users to the new user
        const roomUsers = Array.from(room.users.values()).map(user => ({
          userId: user.userId,
          userName: user.userName,
          presence: user.presence,
          editingCard: user.editingCard,
        }));

        socket.emit('room:users', roomUsers);
        socket.emit('join:success', { projectId });

        console.log(`User ${userName} joined project ${projectId}`);
      } catch (error) {
        console.error('Error joining project:', error);
        socket.emit('error', { message: 'Failed to join project' });
      }
    });

    // Handle presence updates
    socket.on('presence:update', (data) => {
      try {
        const { projectId, presence, editingCard } = data;
        
        const room = projectRooms.get(projectId);
        if (!room) return;

        const user = room.users.get(socket.id);
        if (!user) return;

        // Update user presence
        user.presence = presence;
        user.editingCard = editingCard;
        user.lastActivity = new Date();

        // Broadcast presence update to other users
        socket.to(`project:${projectId}`).emit('user:presence', {
          userId: user.userId,
          userName: user.userName,
          presence,
          editingCard,
        });

        console.log(`User ${user.userName} updated presence: ${presence}`);
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    });

    // Handle real-time card movements
    socket.on('card:move', (data) => {
      try {
        const { projectId, cardId, sourceListId, destinationListId, position } = data;
        
        const room = projectRooms.get(projectId);
        if (!room) return;

        const user = room.users.get(socket.id);
        if (!user) return;

        // Broadcast card movement to other users
        socket.to(`project:${projectId}`).emit('card:moved', {
          cardId,
          sourceListId,
          destinationListId,
          position,
          movedBy: {
            userId: user.userId,
            userName: user.userName,
          },
        });

        console.log(`Card ${cardId} moved by ${user.userName}`);
      } catch (error) {
        console.error('Error broadcasting card move:', error);
      }
    });

    // Handle real-time list updates
    socket.on('list:update', (data) => {
      try {
        const { projectId, listId, updates } = data;
        
        const room = projectRooms.get(projectId);
        if (!room) return;

        const user = room.users.get(socket.id);
        if (!user) return;

        // Broadcast list update to other users
        socket.to(`project:${projectId}`).emit('list:updated', {
          listId,
          updates,
          updatedBy: {
            userId: user.userId,
            userName: user.userName,
          },
        });

        console.log(`List ${listId} updated by ${user.userName}`);
      } catch (error) {
        console.error('Error broadcasting list update:', error);
      }
    });

    // Handle real-time card updates
    socket.on('card:update', (data) => {
      try {
        const { projectId, cardId, updates } = data;
        
        const room = projectRooms.get(projectId);
        if (!room) return;

        const user = room.users.get(socket.id);
        if (!user) return;

        // Broadcast card update to other users
        socket.to(`project:${projectId}`).emit('card:updated', {
          cardId,
          updates,
          updatedBy: {
            userId: user.userId,
            userName: user.userName,
          },
        });

        console.log(`Card ${cardId} updated by ${user.userName}`);
      } catch (error) {
        console.error('Error broadcasting card update:', error);
      }
    });

    // Handle checklist updates
    socket.on('checklist:update', (data) => {
      try {
        const { projectId, checklistId, cardId, updates } = data;
        
        const room = projectRooms.get(projectId);
        if (!room) return;

        const user = room.users.get(socket.id);
        if (!user) return;

        // Broadcast checklist update to other users
        socket.to(`project:${projectId}`).emit('checklist:updated', {
          checklistId,
          cardId,
          updates,
          updatedBy: {
            userId: user.userId,
            userName: user.userName,
          },
        });

        console.log(`Checklist ${checklistId} updated by ${user.userName}`);
      } catch (error) {
        console.error('Error broadcasting checklist update:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Remove user from all project rooms
      for (const [projectId, room] of projectRooms.entries()) {
        const user = room.users.get(socket.id);
        if (user) {
          room.users.delete(socket.id);

          // Broadcast user left to other users in the room
          socket.to(`project:${projectId}`).emit('user:left', {
            userId: user.userId,
            userName: user.userName,
          });

          console.log(`User ${user.userName} left project ${projectId}`);

          // Clean up empty rooms
          if (room.users.size === 0) {
            projectRooms.delete(projectId);
            console.log(`Cleaned up empty room for project ${projectId}`);
          }
        }
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Clean up inactive users periodically
  setInterval(() => {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [projectId, room] of projectRooms.entries()) {
      for (const [socketId, user] of room.users.entries()) {
        if (now.getTime() - user.lastActivity.getTime() > inactiveThreshold) {
          // Remove inactive user
          room.users.delete(socketId);
          
          // Broadcast user left
          io?.to(`project:${projectId}`).emit('user:left', {
            userId: user.userId,
            userName: user.userName,
          });

          console.log(`Removed inactive user ${user.userName} from project ${projectId}`);
        }
      }

      // Clean up empty rooms
      if (room.users.size === 0) {
        projectRooms.delete(projectId);
        console.log(`Cleaned up empty room for project ${projectId}`);
      }
    }
  }, 60000); // Check every minute

  server.io = io;
  return io;
}

// Helper function to verify project access
async function verifyProjectAccess(userId: string, projectId: string): Promise<boolean> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!project) return false;

    // Allow access if user is owner, member, or project is public
    return (
      project.ownerId === userId ||
      project.members.length > 0 ||
      project.visibility === 'PUBLIC'
    );
  } catch (error) {
    console.error('Error verifying project access:', error);
    return false;
  }
}

export { io, projectRooms };
