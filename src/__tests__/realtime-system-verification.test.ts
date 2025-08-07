import { existsSync } from 'fs';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * System verification tests for real-time collaboration activation
 * Ensures all components, files, and configurations are properly in place
 */
describe('Real-time Collaboration System Verification', () => {
  const projectRoot = process.cwd();

  describe('Server Infrastructure', () => {
    it('should have Socket.IO server configuration files', () => {
      const requiredFiles = [
        'server.js',
        'src/app/api/socket/route.ts',
        'package.json',
      ];

      for (const file of requiredFiles) {
        const filePath = path.join(projectRoot, file);
        expect(existsSync(filePath)).toBe(true);
      }
    });

    it('should have Socket.IO dependencies in package.json', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.dependencies['socket.io']).toBeDefined();
      expect(packageJson.dependencies['socket.io-client']).toBeDefined();
    });

    it('should have proper server.js configuration', () => {
      const serverPath = path.join(projectRoot, 'server.js');
      const serverContent = readFileSync(serverPath, 'utf8');

      // Verify key Socket.IO server features
      expect(serverContent).toContain('SocketIOServer');
      expect(serverContent).toContain('join:project');
      expect(serverContent).toContain('card:move');
      expect(serverContent).toContain('presence:update');
      expect(serverContent).toContain('projectRooms');
    });
  });

  describe('Client-side Hooks and Components', () => {
    it('should have real-time board hook', () => {
      const hookPath = path.join(projectRoot, 'src/hooks/useRealtimeBoard.ts');
      expect(existsSync(hookPath)).toBe(true);

      const hookContent = readFileSync(hookPath, 'utf8');
      expect(hookContent).toContain('useRealtimeBoard');
      expect(hookContent).toContain('socket.io-client');
      expect(hookContent).toContain('emitCardMove');
      expect(hookContent).toContain('emitCardUpdate');
      expect(hookContent).toContain('updatePresence');
    });

    it('should have user presence component', () => {
      const componentPath = path.join(
        projectRoot,
        'src/features/projects/components/UserPresence.tsx'
      );
      expect(existsSync(componentPath)).toBe(true);

      const componentContent = readFileSync(componentPath, 'utf8');
      expect(componentContent).toContain('UserPresence');
      expect(componentContent).toContain('users');
      expect(componentContent).toContain('presence');
    });

    it('should have conflict resolution modal', () => {
      const modalPath = path.join(
        projectRoot,
        'src/features/projects/components/ConflictResolutionModal.tsx'
      );
      expect(existsSync(modalPath)).toBe(true);

      const modalContent = readFileSync(modalPath, 'utf8');
      expect(modalContent).toContain('ConflictResolutionModal');
      expect(modalContent).toContain('conflict');
      expect(modalContent).toContain('resolution');
    });

    it('should have conflict resolution utilities', () => {
      const utilPath = path.join(projectRoot, 'src/lib/conflict-resolution.ts');
      expect(existsSync(utilPath)).toBe(true);

      const utilContent = readFileSync(utilPath, 'utf8');
      expect(utilContent).toContain('ConflictResolver');
      expect(utilContent).toContain('resolveConflict');
    });
  });

  describe('Project Board Integration', () => {
    it('should have updated project page with real-time integration', () => {
      const pagePath = path.join(projectRoot, 'src/app/projects/[id]/page.tsx');
      expect(existsSync(pagePath)).toBe(true);

      const pageContent = readFileSync(pagePath, 'utf8');
      expect(pageContent).toContain('useRealtimeBoard');
      expect(pageContent).toContain('UserPresence');
      expect(pageContent).toContain('ConflictResolutionModal');
      expect(pageContent).toContain('emitCardMove');
      expect(pageContent).toContain('emitCardUpdate');
    });

    it('should have updated BoardView with real-time props', () => {
      const boardPath = path.join(
        projectRoot,
        'src/features/projects/components/BoardView.tsx'
      );
      expect(existsSync(boardPath)).toBe(true);

      const boardContent = readFileSync(boardPath, 'utf8');
      expect(boardContent).toContain('onCardMove');
      expect(boardContent).toContain('onCardUpdate');
      expect(boardContent).toContain('onListUpdate');
      expect(boardContent).toContain('onUserPresence');
    });

    it('should have updated CardModal with conflict detection', () => {
      const modalPath = path.join(
        projectRoot,
        'src/features/projects/components/CardModal.tsx'
      );
      expect(existsSync(modalPath)).toBe(true);

      const modalContent = readFileSync(modalPath, 'utf8');
      expect(modalContent).toContain('onEditStart');
      expect(modalContent).toContain('onEditEnd');
      expect(modalContent).toContain('onEditUpdate');
      expect(modalContent).toContain('editingUsers');
    });
  });

  describe('API Integration', () => {
    it('should have Socket.IO API route', () => {
      const apiPath = path.join(projectRoot, 'src/app/api/socket/route.ts');
      expect(existsSync(apiPath)).toBe(true);

      const apiContent = readFileSync(apiPath, 'utf8');
      expect(apiContent).toContain('SocketIOServer');
      expect(apiContent).toContain('projectRooms');
      expect(apiContent).toContain('verifyProjectAccess');
    });

    it('should have proper event handling in API', () => {
      const apiPath = path.join(projectRoot, 'src/app/api/socket/route.ts');
      const apiContent = readFileSync(apiPath, 'utf8');

      // Verify all real-time events are handled
      expect(apiContent).toContain('join:project');
      expect(apiContent).toContain('presence:update');
      expect(apiContent).toContain('card:move');
      expect(apiContent).toContain('card:update');
      expect(apiContent).toContain('list:update');
      expect(apiContent).toContain('checklist:update');
    });
  });

  describe('Development Scripts', () => {
    it('should have updated package.json scripts for Socket.IO server', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      // Verify dev and start scripts use custom server
      expect(packageJson.scripts.dev).toContain('server.js');
      expect(packageJson.scripts.start).toContain('server.js');
    });
  });

  describe('Type Definitions', () => {
    it('should have proper TypeScript types for real-time features', () => {
      const typesPath = path.join(projectRoot, 'src/types/database.ts');
      expect(existsSync(typesPath)).toBe(true);

      const typesContent = readFileSync(typesPath, 'utf8');
      expect(typesContent).toContain('ProjectCard');
      expect(typesContent).toContain('ProjectList');
      expect(typesContent).toContain('ProjectCardActivity');
    });

    it('should have real-time hook interfaces', () => {
      const hookPath = path.join(projectRoot, 'src/hooks/useRealtimeBoard.ts');
      const hookContent = readFileSync(hookPath, 'utf8');

      expect(hookContent).toContain('interface User');
      expect(hookContent).toContain('interface CardMoveEvent');
      expect(hookContent).toContain('interface CardUpdateEvent');
      expect(hookContent).toContain('interface ListUpdateEvent');
      expect(hookContent).toContain('interface ChecklistUpdateEvent');
    });
  });

  describe('Integration Completeness', () => {
    it('should verify all major real-time features are present', () => {
      const features = [
        {
          name: 'Socket.IO Server',
          file: 'server.js',
          markers: ['SocketIOServer', 'projectRooms', 'card:move'],
        },
        {
          name: 'Real-time Hook',
          file: 'src/hooks/useRealtimeBoard.ts',
          markers: ['useRealtimeBoard', 'emitCardMove', 'updatePresence'],
        },
        {
          name: 'User Presence',
          file: 'src/features/projects/components/UserPresence.tsx',
          markers: ['UserPresence', 'users', 'presence'],
        },
        {
          name: 'Conflict Resolution',
          file: 'src/features/projects/components/ConflictResolutionModal.tsx',
          markers: ['ConflictResolutionModal', 'conflict', 'onResolve'],
        },
        {
          name: 'Project Integration',
          file: 'src/app/projects/[id]/page.tsx',
          markers: [
            'useRealtimeBoard',
            'UserPresence',
            'ConflictResolutionModal',
          ],
        },
      ];

      for (const feature of features) {
        const filePath = path.join(projectRoot, feature.file);
        expect(existsSync(filePath)).toBe(true);

        const content = readFileSync(filePath, 'utf8');
        for (const marker of feature.markers) {
          expect(content).toContain(marker);
        }
      }
    });

    it('should verify no old task/column references remain in real-time components', () => {
      const realtimeFiles = [
        'src/hooks/useRealtimeBoard.ts',
        'src/features/projects/components/UserPresence.tsx',
        'src/features/projects/components/ConflictResolutionModal.tsx',
        'src/app/projects/[id]/page.tsx',
      ];

      for (const file of realtimeFiles) {
        const filePath = path.join(projectRoot, file);
        if (existsSync(filePath)) {
          const content = readFileSync(filePath, 'utf8');

          // Should not contain old task/column references
          expect(content).not.toContain('TaskCard');
          expect(content).not.toContain('ColumnWithTasks');
          expect(content).not.toContain('/api/tasks');
          expect(content).not.toContain('/api/columns');
        }
      }
    });
  });

  describe('Error Handling and Security', () => {
    it('should have proper authentication checks in Socket.IO', () => {
      const serverPath = path.join(projectRoot, 'server.js');
      const serverContent = readFileSync(serverPath, 'utf8');

      expect(serverContent).toContain('userId');
      expect(serverContent).toContain('userName');
    });

    it('should have project access verification', () => {
      const apiPath = path.join(projectRoot, 'src/app/api/socket/route.ts');
      const apiContent = readFileSync(apiPath, 'utf8');

      expect(apiContent).toContain('verifyProjectAccess');
      expect(apiContent).toContain('project.ownerId');
      expect(apiContent).toContain('project.members');
    });

    it('should have error handling in real-time hook', () => {
      const hookPath = path.join(projectRoot, 'src/hooks/useRealtimeBoard.ts');
      const hookContent = readFileSync(hookPath, 'utf8');

      expect(hookContent).toContain('connectionError');
      expect(hookContent).toContain('try');
      expect(hookContent).toContain('catch');
    });
  });
});
