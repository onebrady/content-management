import { glob } from 'glob';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

/**
 * Tests to verify old project management code has been properly removed
 * and the codebase is clean after migration to Trello-like system
 */
describe('Codebase Cleanup Verification', () => {
  const projectRoot = process.cwd();

  describe('Old Component Removal', () => {
    it('should not contain old ProjectBoard component references', async () => {
      const files = await glob('src/**/*.{ts,tsx}', {
        cwd: projectRoot,
        ignore: ['src/__tests__/**', 'src/**/__tests__/**', 'src/**/*.test.*'],
      });

      const problematicFiles: string[] = [];

      for (const file of files) {
        const content = readFileSync(path.join(projectRoot, file), 'utf8');

        // Check for old ProjectBoard imports or usage (but allow our new BoardView)
        if (
          content.includes('ProjectBoard') &&
          !content.includes('BoardView')
        ) {
          problematicFiles.push(`${file}: Contains old ProjectBoard reference`);
        }

        // Check for old task-related imports that should be replaced with cards
        if (
          content.includes('TaskCard') &&
          !file.includes('features/projects/components/BoardCard')
        ) {
          problematicFiles.push(`${file}: Contains old TaskCard reference`);
        }

        // Check for old column-based hooks or API calls
        if (content.includes('/api/tasks') && !content.includes('deprecated')) {
          problematicFiles.push(`${file}: Contains old /api/tasks reference`);
        }

        if (
          content.includes('/api/projects/[id]/columns') &&
          !content.includes('deprecated')
        ) {
          problematicFiles.push(`${file}: Contains old columns API reference`);
        }
      }

      if (problematicFiles.length > 0) {
        throw new Error(
          `Found old component references:\n${problematicFiles.join('\n')}`
        );
      }
    });

    it('should not contain old Task or Column type references', async () => {
      const files = await glob('src/**/*.{ts,tsx}', {
        cwd: projectRoot,
        ignore: ['src/__tests__/**', 'src/**/__tests__/**', 'src/**/*.test.*'],
      });

      const problematicFiles: string[] = [];

      for (const file of files) {
        const content = readFileSync(path.join(projectRoot, file), 'utf8');

        // Check for old type imports (but allow in deprecated API files and types file with @deprecated)
        if (
          content.includes('TaskUpdatePayload') &&
          !file.includes('deprecated') &&
          !file.includes('api/projectApi') &&
          !content.includes('@deprecated')
        ) {
          problematicFiles.push(`${file}: Contains old TaskUpdatePayload type`);
        }

        // Check for old column-based queries
        if (
          content.includes('columns:') &&
          content.includes('tasks:') &&
          !file.includes('deprecated')
        ) {
          problematicFiles.push(
            `${file}: Contains old columns/tasks schema reference`
          );
        }
      }

      if (problematicFiles.length > 0) {
        throw new Error(
          `Found old type references:\n${problematicFiles.join('\n')}`
        );
      }
    });
  });

  describe('File Structure Cleanup', () => {
    it('should not have old component files in features/projects/components', async () => {
      const oldComponentFiles = [
        'src/features/projects/components/ProjectBoard.tsx',
        'src/features/projects/components/TaskCard.tsx',
        'src/components/tasks/TaskCreateModal.tsx',
        'src/components/tasks/TaskEditModal.tsx',
        'src/components/tasks/TaskFilters.tsx',
        'src/components/tasks/TaskBulkActions.tsx',
      ];

      const existingFiles = oldComponentFiles.filter((file) =>
        existsSync(path.join(projectRoot, file))
      );

      if (existingFiles.length > 0) {
        throw new Error(
          `Old component files still exist:\n${existingFiles.join('\n')}`
        );
      }
    });

    it('should not have old API route files', async () => {
      const oldApiFiles = [
        'src/app/api/tasks/[taskId]/route.ts',
        'src/app/api/tasks/bulk-update/route.ts',
        'src/app/api/projects/[id]/columns/[columnId]/route.ts',
        'src/app/api/projects/[id]/columns/reorder/route.ts',
      ];

      const existingFiles = oldApiFiles.filter((file) =>
        existsSync(path.join(projectRoot, file))
      );

      if (existingFiles.length > 0) {
        throw new Error(
          `Old API files still exist:\n${existingFiles.join('\n')}`
        );
      }
    });
  });

  describe('New System Verification', () => {
    it('should have new Trello-like components present', () => {
      const requiredNewFiles = [
        'src/features/projects/components/BoardView.tsx',
        'src/features/projects/components/BoardList.tsx',
        'src/features/projects/components/BoardCard.tsx',
        'src/features/projects/components/CardModal.tsx',
        'src/features/projects/components/ChecklistComponent.tsx',
        'src/features/projects/components/UserPresence.tsx',
        'src/features/projects/components/ConflictResolutionModal.tsx',
      ];

      const missingFiles = requiredNewFiles.filter(
        (file) => !existsSync(path.join(projectRoot, file))
      );

      if (missingFiles.length > 0) {
        throw new Error(
          `Required new components missing:\n${missingFiles.join('\n')}`
        );
      }
    });

    it('should have new API endpoints present', () => {
      const requiredApiFiles = [
        'src/app/api/projects/[id]/board/route.ts',
        'src/app/api/lists/[listId]/route.ts',
        'src/app/api/lists/[listId]/cards/route.ts',
        'src/app/api/cards/[cardId]/route.ts',
        'src/app/api/cards/[cardId]/move/route.ts',
        'src/app/api/checklists/[checklistId]/route.ts',
        'src/app/api/checklist-items/[itemId]/route.ts',
      ];

      const missingFiles = requiredApiFiles.filter(
        (file) => !existsSync(path.join(projectRoot, file))
      );

      if (missingFiles.length > 0) {
        throw new Error(
          `Required new API endpoints missing:\n${missingFiles.join('\n')}`
        );
      }
    });

    it('should have updated hooks and utilities', () => {
      const requiredFiles = [
        'src/hooks/useRealtimeBoard.ts',
        'src/lib/board-utils.ts',
        'src/lib/conflict-resolution.ts',
        'src/features/projects/hooks/useProjectData.ts',
        'src/features/projects/hooks/useTaskPositioning.ts',
      ];

      const missingFiles = requiredFiles.filter(
        (file) => !existsSync(path.join(projectRoot, file))
      );

      if (missingFiles.length > 0) {
        throw new Error(
          `Required new utilities missing:\n${missingFiles.join('\n')}`
        );
      }
    });
  });

  describe('Deprecated API Behavior', () => {
    it('should have properly deprecated old API endpoints', async () => {
      const deprecatedFiles = [
        'src/app/api/tasks/route.ts',
        'src/app/api/projects/[id]/columns/route.ts',
      ];

      for (const file of deprecatedFiles) {
        if (existsSync(path.join(projectRoot, file))) {
          const content = readFileSync(path.join(projectRoot, file), 'utf8');

          if (
            !content.includes('deprecated') &&
            !content.includes('createDeprecationResponse') &&
            !content.includes('createTaskDeprecationResponse')
          ) {
            throw new Error(`File ${file} should contain deprecation warnings`);
          }
        }
      }
    });
  });
});
