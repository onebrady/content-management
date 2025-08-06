const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store for project rooms and users
const projectRooms = new Map();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXTAUTH_URL || false,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket.IO connection handling
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

        // Join the project room
        socket.join(`project:${projectId}`);

        // Initialize or get project room
        if (!projectRooms.has(projectId)) {
          projectRooms.set(projectId, {
            projectId,
            users: new Map(),
          });
        }

        const room = projectRooms.get(projectId);
        
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
          timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
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
          io.to(`project:${projectId}`).emit('user:left', {
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

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server is running on path /api/socket`);
  });
});
