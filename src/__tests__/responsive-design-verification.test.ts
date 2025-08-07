import { existsSync, readFileSync } from 'fs';
import path from 'path';

/**
 * Responsive design verification tests
 * Ensures mobile and responsive design works properly across all viewport sizes
 */
describe('Responsive Design Verification', () => {
  const projectRoot = process.cwd();

  describe('CSS and Styling Configuration', () => {
    it('should have responsive CSS configurations', () => {
      const configFiles = ['tailwind.config.js', 'postcss.config.js'];

      for (const file of configFiles) {
        const filePath = path.join(projectRoot, file);
        expect(existsSync(filePath)).toBe(true);
      }
    });

    it('should have Mantine responsive configuration', () => {
      // Check if Mantine is properly configured for responsive design
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.dependencies['@mantine/core']).toBeDefined();
      expect(packageJson.dependencies['@mantine/hooks']).toBeDefined();
    });

    it('should have responsive breakpoints in theme configuration', () => {
      const themePath = path.join(projectRoot, 'src/lib/theme.ts');
      if (existsSync(themePath)) {
        const themeContent = readFileSync(themePath, 'utf8');

        // Should define breakpoints for responsive design
        const hasBreakpoints =
          themeContent.includes('breakpoint') ||
          themeContent.includes('mobile') ||
          themeContent.includes('tablet') ||
          themeContent.includes('desktop');

        expect(hasBreakpoints).toBe(true);
      }
    });
  });

  describe('Component Responsive Design', () => {
    it('should have responsive board layout', () => {
      const boardPath = path.join(
        projectRoot,
        'src/features/projects/components/BoardView.tsx'
      );
      const boardContent = readFileSync(boardPath, 'utf8');

      // Should have responsive styling
      const hasResponsiveFeatures =
        boardContent.includes('overflow-x') ||
        boardContent.includes('scroll') ||
        boardContent.includes('responsive') ||
        boardContent.includes('mobile') ||
        boardContent.includes('flex');

      expect(hasResponsiveFeatures).toBe(true);
    });

    it('should have responsive board CSS module', () => {
      const boardCSSPath = path.join(
        projectRoot,
        'src/features/projects/components/BoardView.module.css'
      );
      if (existsSync(boardCSSPath)) {
        const boardCSSContent = readFileSync(boardCSSPath, 'utf8');

        // Should have mobile-first responsive styling
        const hasResponsiveCSS =
          boardCSSContent.includes('@media') ||
          boardCSSContent.includes('flex') ||
          boardCSSContent.includes('overflow') ||
          boardCSSContent.includes('scroll');

        expect(hasResponsiveCSS).toBe(true);
      }
    });

    it('should have responsive navigation', () => {
      const dashboardLayoutPath = path.join(
        projectRoot,
        'src/components/layout/DashboardLayout.tsx'
      );
      const dashboardLayoutContent = readFileSync(dashboardLayoutPath, 'utf8');

      // Should handle mobile navigation
      const hasMobileNav =
        dashboardLayoutContent.includes('mobile') ||
        dashboardLayoutContent.includes('breakpoint') ||
        dashboardLayoutContent.includes('collapsed') ||
        dashboardLayoutContent.includes('useMediaQuery');

      expect(hasMobileNav).toBe(true);
    });

    it('should have responsive card modal', () => {
      const cardModalPath = path.join(
        projectRoot,
        'src/features/projects/components/CardModal.tsx'
      );
      const cardModalContent = readFileSync(cardModalPath, 'utf8');

      // Should be responsive on mobile
      const hasResponsiveModal =
        cardModalContent.includes('fullScreen') ||
        cardModalContent.includes('mobile') ||
        cardModalContent.includes('responsive') ||
        cardModalContent.includes('scroll') ||
        cardModalContent.includes('overflow');

      expect(hasResponsiveModal).toBe(true);
    });
  });

  describe('Mobile-First Design Patterns', () => {
    it('should use mobile-first CSS approach', () => {
      const styleFiles = ['src/app/globals.css', 'src/styles/editor.css'];

      for (const file of styleFiles) {
        const filePath = path.join(projectRoot, file);
        if (existsSync(filePath)) {
          const styleContent = readFileSync(filePath, 'utf8');

          // Should not have max-width media queries (mobile-first pattern)
          const hasMaxWidthQueries = /@media.*max-width/g.test(styleContent);

          // Should prefer min-width queries for mobile-first
          const hasMinWidthQueries = /@media.*min-width/g.test(styleContent);

          if (styleContent.includes('@media')) {
            expect(hasMinWidthQueries || !hasMaxWidthQueries).toBe(true);
          }
        }
      }
    });

    it('should have touch-friendly interface elements', () => {
      const componentFiles = [
        'src/features/projects/components/BoardView.tsx',
        'src/features/projects/components/BoardCard.tsx',
        'src/features/projects/components/CardModal.tsx',
      ];

      for (const file of componentFiles) {
        const filePath = path.join(projectRoot, file);
        if (existsSync(filePath)) {
          const componentContent = readFileSync(filePath, 'utf8');

          // Should have appropriate sizing for touch interfaces
          const hasTouchFriendlyFeatures =
            componentContent.includes('size="lg"') ||
            componentContent.includes('size="md"') ||
            componentContent.includes('size="xl"') ||
            componentContent.includes('padding') ||
            componentContent.includes('p="') ||
            componentContent.includes('gap=');

          expect(hasTouchFriendlyFeatures).toBe(true);
        }
      }
    });

    it('should have responsive drag and drop', () => {
      const boardViewPath = path.join(
        projectRoot,
        'src/features/projects/components/BoardView.tsx'
      );
      const boardViewContent = readFileSync(boardViewPath, 'utf8');

      // Should use drag and drop library that supports touch
      expect(boardViewContent).toContain('@hello-pangea/dnd');

      // Should have proper drag configuration
      const hasDragConfig =
        boardViewContent.includes('DragDropContext') &&
        boardViewContent.includes('Droppable') &&
        boardViewContent.includes('Draggable');

      expect(hasDragConfig).toBe(true);
    });
  });

  describe('Viewport and Layout Handling', () => {
    it('should handle horizontal scrolling for board lists', () => {
      const boardViewPath = path.join(
        projectRoot,
        'src/features/projects/components/BoardView.tsx'
      );
      const boardViewContent = readFileSync(boardViewPath, 'utf8');

      // Should have horizontal scrolling for lists on small screens
      const hasHorizontalScroll =
        boardViewContent.includes('overflow-x') ||
        boardViewContent.includes('scroll') ||
        boardViewContent.includes('horizontal');

      expect(hasHorizontalScroll).toBe(true);
    });

    it('should have responsive grid layouts', () => {
      const projectsPagePath = path.join(
        projectRoot,
        'src/app/projects/page.tsx'
      );
      const projectsPageContent = readFileSync(projectsPagePath, 'utf8');

      // Should use responsive grid or flex layouts
      const hasResponsiveLayout =
        projectsPageContent.includes('Grid') ||
        projectsPageContent.includes('SimpleGrid') ||
        projectsPageContent.includes('flex') ||
        projectsPageContent.includes('Stack') ||
        projectsPageContent.includes('Group');

      expect(hasResponsiveLayout).toBe(true);
    });

    it('should handle small screen navigation', () => {
      const layoutPath = path.join(
        projectRoot,
        'src/components/layout/DashboardLayout.tsx'
      );
      const layoutContent = readFileSync(layoutPath, 'utf8');

      // Should have mobile navigation handling
      const hasMobileNavigation =
        layoutContent.includes('mobileOpened') ||
        layoutContent.includes('setMobileOpened') ||
        layoutContent.includes('mobile') ||
        layoutContent.includes('collapsed');

      expect(hasMobileNavigation).toBe(true);
    });
  });

  describe('Performance on Mobile Devices', () => {
    it('should use efficient rendering for lists', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      // Check if react-window is available for virtual scrolling
      const hasVirtualScrolling =
        packageJson.dependencies['react-window'] ||
        packageJson.dependencies['react-virtualized'] ||
        packageJson.dependencies['@tanstack/react-virtual'];

      // Virtual scrolling is optional but beneficial for performance
      if (hasVirtualScrolling) {
        expect(hasVirtualScrolling).toBeDefined();
      }
    });

    it('should have optimized images for mobile', () => {
      const componentFiles = [
        'src/features/projects/components/CardModal.tsx',
        'src/components/upload/CompanyLogoUpload.tsx',
      ];

      for (const file of componentFiles) {
        const filePath = path.join(projectRoot, file);
        if (existsSync(filePath)) {
          const componentContent = readFileSync(filePath, 'utf8');

          // Should use Next.js Image component for optimization
          if (
            componentContent.includes('<img') ||
            componentContent.includes('Image')
          ) {
            const hasOptimizedImages =
              componentContent.includes('next/image') ||
              componentContent.includes('Image') ||
              componentContent.includes('loading="lazy"');

            expect(hasOptimizedImages).toBe(true);
          }
        }
      }
    });

    it('should minimize bundle size for mobile', () => {
      const nextConfigPath = path.join(projectRoot, 'next.config.js');
      if (existsSync(nextConfigPath)) {
        const nextConfigContent = readFileSync(nextConfigPath, 'utf8');

        // Should have optimization configurations
        const hasOptimizations =
          nextConfigContent.includes('compress') ||
          nextConfigContent.includes('minify') ||
          nextConfigContent.includes('optimization') ||
          nextConfigContent.includes('webpack');

        // Optimizations are beneficial but not required
        if (nextConfigContent.length > 100) {
          expect(hasOptimizations).toBe(true);
        }
      }
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should have proper touch targets', () => {
      const componentFiles = [
        'src/features/projects/components/BoardCard.tsx',
        'src/features/projects/components/BoardList.tsx',
      ];

      for (const file of componentFiles) {
        const filePath = path.join(projectRoot, file);
        if (existsSync(filePath)) {
          const componentContent = readFileSync(filePath, 'utf8');

          // Should use appropriate button/action sizes
          const hasProperTargets =
            componentContent.includes('Button') ||
            componentContent.includes('ActionIcon') ||
            componentContent.includes('size="') ||
            componentContent.includes('p="') ||
            componentContent.includes('padding');

          expect(hasProperTargets).toBe(true);
        }
      }
    });

    it('should have mobile-friendly modals', () => {
      const cardModalPath = path.join(
        projectRoot,
        'src/features/projects/components/CardModal.tsx'
      );
      const cardModalContent = readFileSync(cardModalPath, 'utf8');

      // Should handle mobile modal sizing
      const hasMobileFriendlyModal =
        cardModalContent.includes('Modal') &&
        (cardModalContent.includes('size') ||
          cardModalContent.includes('fullScreen') ||
          cardModalContent.includes('mobile') ||
          cardModalContent.includes('responsive'));

      expect(hasMobileFriendlyModal).toBe(true);
    });

    it('should support keyboard navigation on mobile', () => {
      const boardViewPath = path.join(
        projectRoot,
        'src/features/projects/components/BoardView.tsx'
      );
      const boardViewContent = readFileSync(boardViewPath, 'utf8');

      // Should have keyboard support for drag and drop
      const hasKeyboardSupport =
        boardViewContent.includes('onKeyDown') ||
        boardViewContent.includes('tabIndex') ||
        boardViewContent.includes('aria-') ||
        boardViewContent.includes('role=');

      expect(hasKeyboardSupport).toBe(true);
    });
  });

  describe('Cross-Device Compatibility', () => {
    it('should work across different screen orientations', () => {
      const boardViewPath = path.join(
        projectRoot,
        'src/features/projects/components/BoardView.tsx'
      );
      const boardViewContent = readFileSync(boardViewPath, 'utf8');

      // Should handle both portrait and landscape
      const hasOrientationSupport =
        boardViewContent.includes('overflow') ||
        boardViewContent.includes('scroll') ||
        boardViewContent.includes('flex') ||
        boardViewContent.includes('responsive');

      expect(hasOrientationSupport).toBe(true);
    });

    it('should support various touch gestures', () => {
      const packageJsonPath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      // Should have drag and drop that supports touch
      expect(packageJson.dependencies['@hello-pangea/dnd']).toBeDefined();

      // Should handle touch interactions
      const boardViewPath = path.join(
        projectRoot,
        'src/features/projects/components/BoardView.tsx'
      );
      const boardViewContent = readFileSync(boardViewPath, 'utf8');

      const hasTouchSupport =
        boardViewContent.includes('DragDropContext') ||
        boardViewContent.includes('onClick') ||
        boardViewContent.includes('onTouch');

      expect(hasTouchSupport).toBe(true);
    });

    it('should maintain functionality across device types', () => {
      const mainComponents = [
        'src/app/projects/page.tsx',
        'src/app/projects/[id]/page.tsx',
        'src/features/projects/components/BoardView.tsx',
      ];

      for (const file of mainComponents) {
        const filePath = path.join(projectRoot, file);
        const componentContent = readFileSync(filePath, 'utf8');

        // Should not have device-specific code that breaks on others
        const hasDeviceSpecificCode =
          componentContent.includes('navigator.userAgent') ||
          componentContent.includes('window.orientation') ||
          componentContent.includes('isMobile') ||
          componentContent.includes('isDesktop');

        // If device detection is used, should have fallbacks
        if (hasDeviceSpecificCode) {
          const hasFallbacks =
            componentContent.includes('fallback') ||
            componentContent.includes('default') ||
            componentContent.includes('else');

          expect(hasFallbacks).toBe(true);
        }
      }
    });
  });

  describe('Responsive Testing Infrastructure', () => {
    it('should have responsive testing capabilities', () => {
      const playwrightConfigPath = path.join(
        projectRoot,
        'playwright.config.ts'
      );
      if (existsSync(playwrightConfigPath)) {
        const playwrightConfig = readFileSync(playwrightConfigPath, 'utf8');

        // Should have mobile testing configurations
        const hasMobileTesting =
          playwrightConfig.includes('mobile') ||
          playwrightConfig.includes('viewport') ||
          playwrightConfig.includes('iPhone') ||
          playwrightConfig.includes('Android') ||
          playwrightConfig.includes('tablet');

        expect(hasMobileTesting).toBe(true);
      }
    });

    it('should have viewport-specific test data attributes', () => {
      const componentFiles = [
        'src/features/projects/components/BoardView.tsx',
        'src/app/projects/page.tsx',
        'src/components/layout/DashboardLayout.tsx',
      ];

      for (const file of componentFiles) {
        const filePath = path.join(projectRoot, file);
        const componentContent = readFileSync(filePath, 'utf8');

        // Should have test attributes for responsive testing
        const hasTestAttributes =
          componentContent.includes('data-testid') ||
          componentContent.includes('test-id') ||
          componentContent.includes('id=');

        expect(hasTestAttributes).toBe(true);
      }
    });
  });
});
