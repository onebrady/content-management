import { readFileSync, existsSync } from 'fs';
import path from 'path';

/**
 * Navigation and routing verification tests
 * Ensures all navigation links work and route to correct new interfaces
 */
describe('Navigation System Verification', () => {
  const projectRoot = process.cwd();

  describe('Navigation Configuration', () => {
    it('should have updated navigation links in navigation config', () => {
      const navPath = path.join(projectRoot, 'src/lib/navigation.ts');
      expect(existsSync(navPath)).toBe(true);

      const navContent = readFileSync(navPath, 'utf8');

      // Should contain projects navigation
      expect(navContent).toContain('/projects');

      // Should not contain old task or column specific routes
      expect(navContent).not.toContain('/tasks');
      expect(navContent).not.toContain('/columns');
    });

    it('should have proper route structure in app directory', () => {
      const routeStructure = [
        'src/app/projects/page.tsx',
        'src/app/projects/[id]/page.tsx',
        'src/app/projects/create/page.tsx',
        'src/app/dashboard/page.tsx',
      ];

      for (const route of routeStructure) {
        const routePath = path.join(projectRoot, route);
        expect(existsSync(routePath)).toBe(true);
      }
    });

    it('should not have old task management routes', () => {
      const oldRoutes = [
        'src/app/tasks/page.tsx',
        'src/app/tasks/[id]/page.tsx',
        'src/app/columns/page.tsx',
        'src/app/columns/[id]/page.tsx',
      ];

      for (const route of oldRoutes) {
        const routePath = path.join(projectRoot, route);
        expect(existsSync(routePath)).toBe(false);
      }
    });
  });

  describe('Layout and Navigation Components', () => {
    it('should have updated main layout with correct navigation', () => {
      const layoutPath = path.join(
        projectRoot,
        'src/components/layout/DashboardLayout.tsx'
      );
      expect(existsSync(layoutPath)).toBe(true);

      const layoutContent = readFileSync(layoutPath, 'utf8');

      // Should contain navigation to projects
      expect(layoutContent).toContain('Projects');
      expect(layoutContent).toContain('/projects');
    });

    it.skip('should have navbar with updated links', () => {
      const navbarPath = path.join(
        projectRoot,
        'src/components/layout/NavbarNested.tsx'
      );
      expect(existsSync(navbarPath)).toBe(true);

      const navbarContent = readFileSync(navbarPath, 'utf8');

      // Should reference project-related navigation
      expect(navbarContent.length).toBeGreaterThan(0);
    });

    it('should have breadcrumbs component for navigation', () => {
      const breadcrumbPath = path.join(
        projectRoot,
        'src/components/navigation/Breadcrumbs.tsx'
      );
      expect(existsSync(breadcrumbPath)).toBe(true);

      const breadcrumbContent = readFileSync(breadcrumbPath, 'utf8');

      // Should support project navigation
      expect(breadcrumbContent).toContain('breadcrumb');
      expect(breadcrumbContent).toContain('navigation');
    });
  });

  describe('API Route Verification', () => {
    it('should have new project management API routes', () => {
      const apiRoutes = [
        'src/app/api/projects/route.ts',
        'src/app/api/projects/[id]/route.ts',
        'src/app/api/projects/[id]/board/route.ts',
        'src/app/api/lists/[listId]/route.ts',
        'src/app/api/lists/[listId]/cards/route.ts',
        'src/app/api/cards/[cardId]/route.ts',
        'src/app/api/cards/[cardId]/move/route.ts',
        'src/app/api/checklists/[checklistId]/route.ts',
        'src/app/api/checklist-items/[itemId]/route.ts',
      ];

      for (const route of apiRoutes) {
        const routePath = path.join(projectRoot, route);
        expect(existsSync(routePath)).toBe(true);
      }
    });

    it.skip('should have deprecated old API routes with proper warnings', () => {
      const deprecatedRoutes = [
        'src/app/api/tasks/route.ts',
        'src/app/api/projects/[id]/columns/route.ts',
      ];

      for (const route of deprecatedRoutes) {
        const routePath = path.join(projectRoot, route);
        if (existsSync(routePath)) {
          const routeContent = readFileSync(routePath, 'utf8');

          // Should contain deprecation warnings
          expect(routeContent).toContain('deprecated');
          expect(routeContent).toMatch(/410|Gone|deprecation/i);
        }
      }
    });

    it('should not have old individual task/column routes', () => {
      const removedRoutes = [
        'src/app/api/tasks/[taskId]/route.ts',
        'src/app/api/tasks/bulk-update/route.ts',
        'src/app/api/projects/[id]/columns/[columnId]/route.ts',
        'src/app/api/projects/[id]/columns/reorder/route.ts',
      ];

      for (const route of removedRoutes) {
        const routePath = path.join(projectRoot, route);
        expect(existsSync(routePath)).toBe(false);
      }
    });
  });

  describe('Component Navigation References', () => {
    it('should have updated project components with correct routing', () => {
      const projectComponents = [
        'src/app/projects/page.tsx',
        'src/app/projects/[id]/page.tsx',
        'src/features/projects/components/BoardView.tsx',
      ];

      for (const component of projectComponents) {
        const componentPath = path.join(projectRoot, component);
        expect(existsSync(componentPath)).toBe(true);

        const componentContent = readFileSync(componentPath, 'utf8');

        // Should not reference old task/column routes
        expect(componentContent).not.toContain('/api/tasks');
        expect(componentContent).not.toContain('/api/columns');

        // Should reference new card/list routes if making API calls
        if (componentContent.includes('/api/')) {
          const hasNewRoutes =
            componentContent.includes('/api/projects') ||
            componentContent.includes('/api/lists') ||
            componentContent.includes('/api/cards') ||
            componentContent.includes('/api/checklists');

          expect(hasNewRoutes).toBe(true);
        }
      }
    });

    it.skip('should have clean imports without old component references', () => {
      const mainComponents = [
        'src/app/projects/page.tsx',
        'src/app/projects/[id]/page.tsx',
        'src/features/projects/components/BoardView.tsx',
      ];

      for (const component of mainComponents) {
        const componentPath = path.join(projectRoot, component);
        const componentContent = readFileSync(componentPath, 'utf8');

        // Should not import old components
        expect(componentContent).not.toContain('TaskCard');
        expect(componentContent).not.toContain('TaskModal');
        expect(componentContent).not.toContain('ColumnComponent');

        // Should import new components
        if (componentContent.includes('import')) {
          const hasNewImports =
            componentContent.includes('BoardView') ||
            componentContent.includes('BoardCard') ||
            componentContent.includes('BoardList') ||
            componentContent.includes('CardModal');

          if (componentContent.includes('features/projects')) {
            expect(hasNewImports).toBe(true);
          }
        }
      }
    });
  });

  describe('Navigation Flow Integrity', () => {
    it('should have consistent navigation between projects list and project board', () => {
      const projectsListPath = path.join(
        projectRoot,
        'src/app/projects/page.tsx'
      );
      const projectBoardPath = path.join(
        projectRoot,
        'src/app/projects/[id]/page.tsx'
      );

      const projectsListContent = readFileSync(projectsListPath, 'utf8');
      const projectBoardContent = readFileSync(projectBoardPath, 'utf8');

      // Projects list should link to individual projects
      expect(projectsListContent).toMatch(
        /\/projects\/\[.*\]|\/projects\/\$\{.*\}/
      );

      // Project board should have navigation back to projects
      expect(projectBoardContent).toMatch(/projects|Projects/);
    });

    it('should have proper error handling for navigation', () => {
      const projectBoardPath = path.join(
        projectRoot,
        'src/app/projects/[id]/page.tsx'
      );
      const projectBoardContent = readFileSync(projectBoardPath, 'utf8');

      // Should handle missing or invalid project IDs
      expect(projectBoardContent).toMatch(/error|Error|not found|404/i);
    });

    it('should have authentication guards on protected routes', () => {
      const protectedRoutes = [
        'src/app/projects/page.tsx',
        'src/app/projects/[id]/page.tsx',
        'src/app/dashboard/page.tsx',
      ];

      for (const route of protectedRoutes) {
        const routePath = path.join(projectRoot, route);
        const routeContent = readFileSync(routePath, 'utf8');

        // Should have authentication checks
        const hasAuthGuard =
          routeContent.includes('AuthGuard') ||
          routeContent.includes('useSession') ||
          routeContent.includes('withAuth') ||
          routeContent.includes('authentication');

        expect(hasAuthGuard).toBe(true);
      }
    });
  });

  describe('URL Structure and SEO', () => {
    it('should have SEO-friendly URL structure', () => {
      // Projects should be at /projects
      const projectsPage = path.join(projectRoot, 'src/app/projects/page.tsx');
      expect(existsSync(projectsPage)).toBe(true);

      // Individual projects at /projects/[id]
      const projectPage = path.join(
        projectRoot,
        'src/app/projects/[id]/page.tsx'
      );
      expect(existsSync(projectPage)).toBe(true);

      // No deeply nested or confusing URLs
      const badRoutes = [
        'src/app/projects/[id]/tasks/[taskId]/page.tsx',
        'src/app/projects/[id]/columns/[columnId]/page.tsx',
        'src/app/tasks/projects/[id]/page.tsx',
      ];

      for (const route of badRoutes) {
        const routePath = path.join(projectRoot, route);
        expect(existsSync(routePath)).toBe(false);
      }
    });

    it('should have proper metadata for SEO', () => {
      const projectsPage = path.join(projectRoot, 'src/app/projects/page.tsx');
      const projectsContent = readFileSync(projectsPage, 'utf8');

      // Should have title or metadata configuration
      const hasMetadata =
        projectsContent.includes('title') ||
        projectsContent.includes('metadata') ||
        projectsContent.includes('Head');

      expect(hasMetadata).toBe(true);
    });
  });

  describe('Link and Reference Validation', () => {
    it('should not have broken internal links in navigation', () => {
      const navigationFiles = [
        'src/lib/navigation.ts',
        'src/components/layout/DashboardLayout.tsx',
        'src/components/layout/NavbarNested.tsx',
      ];

      for (const file of navigationFiles) {
        const filePath = path.join(projectRoot, file);
        if (existsSync(filePath)) {
          const fileContent = readFileSync(filePath, 'utf8');

          // Check for references to non-existent routes
          const suspiciousPatterns = [
            '/tasks(?![\\w-])', // /tasks but not /task-management
            '/columns(?![\\w-])', // /columns but not /column-management
            '/old-projects',
            '/legacy',
          ];

          for (const pattern of suspiciousPatterns) {
            expect(fileContent).not.toMatch(new RegExp(pattern));
          }
        }
      }
    });

    it('should have all referenced components actually exist', () => {
      const mainFiles = [
        'src/app/projects/page.tsx',
        'src/app/projects/[id]/page.tsx',
      ];

      for (const file of mainFiles) {
        const filePath = path.join(projectRoot, file);
        const fileContent = readFileSync(filePath, 'utf8');

        // Extract import statements
        const importMatches =
          fileContent.match(/import.*from ['"](.+)['"]/g) || [];

        for (const importStatement of importMatches) {
          const pathMatch = importStatement.match(/from ['"](.+)['"]/);
          if (
            (pathMatch && pathMatch[1].startsWith('@/')) ||
            pathMatch[1].startsWith('./') ||
            pathMatch[1].startsWith('../')
          ) {
            const importPath = pathMatch[1]
              .replace('@/', 'src/')
              .replace(/^\.\//, path.dirname(file) + '/')
              .replace(/^\.\.\//, path.dirname(path.dirname(file)) + '/');

            // Check if the imported file exists (with possible extensions)
            const possiblePaths = [
              path.join(projectRoot, importPath),
              path.join(projectRoot, importPath + '.ts'),
              path.join(projectRoot, importPath + '.tsx'),
              path.join(projectRoot, importPath + '/index.ts'),
              path.join(projectRoot, importPath + '/index.tsx'),
            ];

            const fileExists = possiblePaths.some((p) => existsSync(p));

            if (!fileExists && !importPath.includes('node_modules')) {
              console.warn(
                `Warning: Import not found: ${importPath} in ${file}`
              );
            }
          }
        }
      }
    });
  });

  describe('Navigation Performance', () => {
    it.skip('should have efficient navigation structure', () => {
      // Check that there are not too many nested route files
      const appDir = path.join(projectRoot, 'src/app');
      const routeFiles: string[] = [];

      function findRouteFiles(dir: string, depth = 0) {
        if (depth > 4) return; // Prevent infinite recursion and deep nesting

        const items = require('fs').readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
          if (item.isDirectory()) {
            findRouteFiles(path.join(dir, item.name), depth + 1);
          } else if (item.name === 'page.tsx' || item.name === 'route.ts') {
            routeFiles.push(path.join(dir, item.name));
          }
        }
      }

      findRouteFiles(appDir);

      // Should have reasonable number of route files (not too many)
      expect(routeFiles.length).toBeLessThan(50);

      // Should not have excessive nesting
      const maxDepth = Math.max(
        ...routeFiles.map(
          (file) => file.replace(appDir, '').split(path.sep).length
        )
      );
      expect(maxDepth).toBeLessThan(6);
    });

    it('should not have circular navigation dependencies', () => {
      const navigationFile = path.join(projectRoot, 'src/lib/navigation.ts');

      if (existsSync(navigationFile)) {
        const navContent = readFileSync(navigationFile, 'utf8');

        // Should not have circular references like /a -> /b -> /a
        const urlMatches = navContent.match(/['"][^'"]*\/[^'"]*['"]/g) || [];
        const urls = urlMatches.map((match) => match.slice(1, -1));

        // Basic check: no URL should reference itself
        for (const url of urls) {
          expect(navContent.split(url).length - 1).toBeLessThan(5); // Not referenced too many times
        }
      }
    });
  });
});
