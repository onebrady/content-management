import { Server } from 'socket.io';
import { createServer } from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';

/**
 * Integration tests for real-time collaboration features
 * Tests WebSocket connections, user presence, and real-time updates
 */
describe('Real-time Collaboration System', () => {
  let httpServer: any;
  let httpServerAddr: AddressInfo;
  let ioServer: Server;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;

  beforeAll((done) => {
    httpServer = createServer();
    ioServer = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    httpServer.listen(() => {
      httpServerAddr = httpServer.address() as AddressInfo;
      done();
    });
  });

  beforeEach((done) => {
    // Create two client connections for testing collaboration
    clientSocket1 = Client(`http://localhost:${httpServerAddr.port}`, {
      transports: ['websocket'],
    });

    clientSocket2 = Client(`http://localhost:${httpServerAddr.port}`, {
      transports: ['websocket'],
    });

    let connectCount = 0;
    const onConnect = () => {
      connectCount++;
      if (connectCount === 2) {
        done();
      }
    };

    clientSocket1.on('connect', onConnect);
    clientSocket2.on('connect', onConnect);
  });

  afterEach(() => {
    ioServer.removeAllListeners();
    clientSocket1?.disconnect();
    clientSocket2?.disconnect();
  });

  afterAll((done) => {
    ioServer.close();
    httpServer.close(done);
  });

  describe('Socket.IO Server Functionality', () => {
    it('should establish WebSocket connections', () => {
      expect(clientSocket1.connected).toBe(true);
      expect(clientSocket2.connected).toBe(true);
    });

    it('should handle connection errors gracefully', (done) => {
      const badClient = Client(`http://localhost:${httpServerAddr.port + 1}`, {
        transports: ['websocket'],
        timeout: 1000,
      });

      badClient.on('connect_error', (error) => {
        expect(error).toBeDefined();
        badClient.disconnect();
        done();
      });
    });

    it('should support multiple concurrent connections', (done) => {
      const clients: ClientSocket[] = [];
      let connectedCount = 0;
      const targetConnections = 5;

      for (let i = 0; i < targetConnections; i++) {
        const client = Client(`http://localhost:${httpServerAddr.port}`, {
          transports: ['websocket'],
        });

        client.on('connect', () => {
          connectedCount++;
          if (connectedCount === targetConnections) {
            expect(connectedCount).toBe(targetConnections);
            clients.forEach((c) => c.disconnect());
            done();
          }
        });

        clients.push(client);
      }
    });
  });

  describe('Project Room Management', () => {
    const mockProjectId = 'project-123';
    const mockUser1 = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
    };
    const mockUser2 = {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
    };

    it('should allow users to join project rooms', (done) => {
      ioServer.on('connection', (socket) => {
        socket.on('join-project', ({ projectId, user }) => {
          socket.join(projectId);
          socket.to(projectId).emit('user-joined', user);
        });
      });

      clientSocket2.on('user-joined', (user) => {
        expect(user).toEqual(mockUser1);
        done();
      });

      // First user joins, then second user should receive notification
      clientSocket1.emit('join-project', {
        projectId: mockProjectId,
        user: mockUser1,
      });

      setTimeout(() => {
        clientSocket2.emit('join-project', {
          projectId: mockProjectId,
          user: mockUser2,
        });
      }, 100);
    });

    it('should track user presence in rooms', (done) => {
      const presenceTracker = new Map();

      ioServer.on('connection', (socket) => {
        socket.on('join-project', ({ projectId, user }) => {
          socket.join(projectId);

          if (!presenceTracker.has(projectId)) {
            presenceTracker.set(projectId, new Set());
          }
          presenceTracker.get(projectId).add(user.id);

          const roomUsers = Array.from(presenceTracker.get(projectId));
          ioServer.to(projectId).emit('presence-update', {
            projectId,
            activeUsers: roomUsers,
          });
        });

        socket.on('disconnect', () => {
          // In real implementation, would remove user from presence
        });
      });

      clientSocket1.on('presence-update', ({ activeUsers }) => {
        if (activeUsers.length === 2) {
          expect(activeUsers).toContain('user-1');
          expect(activeUsers).toContain('user-2');
          done();
        }
      });

      clientSocket1.emit('join-project', {
        projectId: mockProjectId,
        user: mockUser1,
      });

      clientSocket2.emit('join-project', {
        projectId: mockProjectId,
        user: mockUser2,
      });
    });

    it('should handle user disconnections', (done) => {
      const presenceTracker = new Map();

      ioServer.on('connection', (socket) => {
        socket.on('join-project', ({ projectId, user }) => {
          socket.join(projectId);
          socket.userData = { projectId, user };

          if (!presenceTracker.has(projectId)) {
            presenceTracker.set(projectId, new Set());
          }
          presenceTracker.get(projectId).add(user.id);
        });

        socket.on('disconnect', () => {
          if (socket.userData) {
            const { projectId, user } = socket.userData;
            presenceTracker.get(projectId)?.delete(user.id);
            socket.to(projectId).emit('user-left', user);
          }
        });
      });

      clientSocket2.on('user-left', (user) => {
        expect(user).toEqual(mockUser1);
        done();
      });

      clientSocket1.emit('join-project', {
        projectId: mockProjectId,
        user: mockUser1,
      });

      clientSocket2.emit('join-project', {
        projectId: mockProjectId,
        user: mockUser2,
      });

      setTimeout(() => {
        clientSocket1.disconnect();
      }, 100);
    });
  });

  describe('Real-time Card Operations', () => {
    const mockProjectId = 'project-123';
    const mockCardMove = {
      cardId: 'card-1',
      fromListId: 'list-1',
      toListId: 'list-2',
      position: 1000,
      projectId: mockProjectId,
    };

    it('should broadcast card movements to other users', (done) => {
      ioServer.on('connection', (socket) => {
        socket.on('join-project', ({ projectId }) => {
          socket.join(projectId);
        });

        socket.on('card-moved', (moveData) => {
          socket.to(moveData.projectId).emit('card-moved', moveData);
        });
      });

      clientSocket2.on('card-moved', (data) => {
        expect(data).toEqual(mockCardMove);
        done();
      });

      // Both clients join the project
      clientSocket1.emit('join-project', { projectId: mockProjectId });
      clientSocket2.emit('join-project', { projectId: mockProjectId });

      setTimeout(() => {
        clientSocket1.emit('card-moved', mockCardMove);
      }, 100);
    });

    it('should handle card updates in real-time', (done) => {
      const mockCardUpdate = {
        cardId: 'card-1',
        projectId: mockProjectId,
        title: 'Updated Card Title',
        description: 'Updated description',
      };

      ioServer.on('connection', (socket) => {
        socket.on('join-project', ({ projectId }) => {
          socket.join(projectId);
        });

        socket.on('card-updated', (updateData) => {
          socket.to(updateData.projectId).emit('card-updated', updateData);
        });
      });

      clientSocket2.on('card-updated', (data) => {
        expect(data.title).toBe('Updated Card Title');
        expect(data.description).toBe('Updated description');
        done();
      });

      clientSocket1.emit('join-project', { projectId: mockProjectId });
      clientSocket2.emit('join-project', { projectId: mockProjectId });

      setTimeout(() => {
        clientSocket1.emit('card-updated', mockCardUpdate);
      }, 100);
    });

    it('should support list updates', (done) => {
      const mockListUpdate = {
        listId: 'list-1',
        projectId: mockProjectId,
        title: 'Updated List Title',
        color: 'blue',
      };

      ioServer.on('connection', (socket) => {
        socket.on('join-project', ({ projectId }) => {
          socket.join(projectId);
        });

        socket.on('list-updated', (updateData) => {
          socket.to(updateData.projectId).emit('list-updated', updateData);
        });
      });

      clientSocket2.on('list-updated', (data) => {
        expect(data.title).toBe('Updated List Title');
        expect(data.color).toBe('blue');
        done();
      });

      clientSocket1.emit('join-project', { projectId: mockProjectId });
      clientSocket2.emit('join-project', { projectId: mockProjectId });

      setTimeout(() => {
        clientSocket1.emit('list-updated', mockListUpdate);
      }, 100);
    });
  });

  describe('Conflict Resolution', () => {
    const mockProjectId = 'project-123';

    it('should detect simultaneous edits', (done) => {
      let editCount = 0;

      ioServer.on('connection', (socket) => {
        socket.on('join-project', ({ projectId }) => {
          socket.join(projectId);
        });

        socket.on('card-edit-start', (data) => {
          editCount++;
          socket.to(data.projectId).emit('card-edit-conflict', {
            cardId: data.cardId,
            editingUser: data.user,
            timestamp: Date.now(),
          });

          if (editCount === 2) {
            done();
          }
        });
      });

      clientSocket1.emit('join-project', { projectId: mockProjectId });
      clientSocket2.emit('join-project', { projectId: mockProjectId });

      setTimeout(() => {
        clientSocket1.emit('card-edit-start', {
          cardId: 'card-1',
          projectId: mockProjectId,
          user: { id: 'user-1', name: 'John' },
        });

        clientSocket2.emit('card-edit-start', {
          cardId: 'card-1',
          projectId: mockProjectId,
          user: { id: 'user-2', name: 'Jane' },
        });
      }, 100);
    });

    it('should handle edit conflict resolution', (done) => {
      ioServer.on('connection', (socket) => {
        socket.on('join-project', ({ projectId }) => {
          socket.join(projectId);
        });

        socket.on('resolve-conflict', (resolution) => {
          socket.to(resolution.projectId).emit('conflict-resolved', resolution);
        });
      });

      clientSocket2.on('conflict-resolved', (resolution) => {
        expect(resolution.cardId).toBe('card-1');
        expect(resolution.winner).toBe('user-1');
        done();
      });

      clientSocket1.emit('join-project', { projectId: mockProjectId });
      clientSocket2.emit('join-project', { projectId: mockProjectId });

      setTimeout(() => {
        clientSocket1.emit('resolve-conflict', {
          cardId: 'card-1',
          projectId: mockProjectId,
          winner: 'user-1',
          resolution: 'latest-wins',
        });
      }, 100);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid message bursts', (done) => {
      const messageCount = 50;
      let receivedCount = 0;

      ioServer.on('connection', (socket) => {
        socket.on('join-project', ({ projectId }) => {
          socket.join(projectId);
        });

        socket.on('rapid-update', (data) => {
          socket.to(data.projectId).emit('rapid-update', data);
        });
      });

      clientSocket2.on('rapid-update', () => {
        receivedCount++;
        if (receivedCount === messageCount) {
          expect(receivedCount).toBe(messageCount);
          done();
        }
      });

      clientSocket1.emit('join-project', { projectId: 'project-123' });
      clientSocket2.emit('join-project', { projectId: 'project-123' });

      setTimeout(() => {
        for (let i = 0; i < messageCount; i++) {
          clientSocket1.emit('rapid-update', {
            projectId: 'project-123',
            data: i,
          });
        }
      }, 100);
    });

    it('should maintain connection stability', (done) => {
      let reconnectCount = 0;

      clientSocket1.on('disconnect', () => {
        reconnectCount++;
      });

      clientSocket1.on('connect', () => {
        if (reconnectCount > 0) {
          expect(reconnectCount).toBe(1);
          done();
        }
      });

      // Simulate temporary disconnection
      setTimeout(() => {
        clientSocket1.disconnect();
        setTimeout(() => {
          clientSocket1.connect();
        }, 100);
      }, 100);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed event data', (done) => {
      ioServer.on('connection', (socket) => {
        socket.on('card-moved', (data) => {
          try {
            if (!data.cardId || !data.projectId) {
              socket.emit('error', {
                type: 'INVALID_DATA',
                message: 'Missing required fields',
              });
              return;
            }
            socket.to(data.projectId).emit('card-moved', data);
          } catch (error) {
            socket.emit('error', {
              type: 'SERVER_ERROR',
              message: 'Failed to process card move',
            });
          }
        });
      });

      clientSocket1.on('error', (error) => {
        expect(error.type).toBe('INVALID_DATA');
        done();
      });

      clientSocket1.emit('card-moved', {
        // Missing required fields
        cardId: null,
        projectId: null,
      });
    });

    it('should handle room join failures', (done) => {
      ioServer.on('connection', (socket) => {
        socket.on('join-project', ({ projectId, user }) => {
          if (!projectId || !user) {
            socket.emit('join-error', {
              message: 'Invalid project or user data',
            });
            return;
          }
          socket.join(projectId);
        });
      });

      clientSocket1.on('join-error', (error) => {
        expect(error.message).toContain('Invalid project');
        done();
      });

      clientSocket1.emit('join-project', {
        projectId: null,
        user: null,
      });
    });
  });
});
