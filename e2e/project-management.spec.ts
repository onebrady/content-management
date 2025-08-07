import { test, expect, Page } from '@playwright/test';

/**
 * End-to-end tests for the new Trello-like project management system
 * Tests complete user workflows and system functionality
 */
test.describe('Trello-like Project Management System', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;

    // Navigate to login page and authenticate
    await page.goto('/auth/signin');

    // Mock authentication for testing
    await page.evaluate(() => {
      window.localStorage.setItem('test-auth', 'true');
    });

    // Navigate to projects page
    await page.goto('/projects');
  });

  test.describe('Project Creation and Management', () => {
    test('should create a new project successfully', async () => {
      // Click create project button
      await page.click('[data-testid="create-project-button"]');

      // Fill in project details
      await page.fill(
        '[data-testid="project-title-input"]',
        'Test Project E2E'
      );
      await page.fill(
        '[data-testid="project-description-input"]',
        'End-to-end test project'
      );

      // Select project color
      await page.click('[data-testid="color-blue"]');

      // Create project
      await page.click('[data-testid="create-project-submit"]');

      // Wait for navigation to project board
      await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+$/);

      // Verify project was created
      await expect(page.locator('h1')).toContainText('Test Project E2E');
      await expect(
        page.locator('[data-testid="board-container"]')
      ).toBeVisible();
    });

    test('should display project in projects list', async () => {
      // Navigate back to projects list
      await page.goto('/projects');

      // Verify project appears in list
      await expect(page.locator('[data-testid="project-card"]')).toBeVisible();
      await expect(page.locator('text=Test Project E2E')).toBeVisible();

      // Verify project metadata
      await expect(page.locator('text=lists')).toBeVisible();
      await expect(page.locator('text=cards')).toBeVisible();
    });
  });

  test.describe('Board Interface and List Management', () => {
    test.beforeEach(async () => {
      // Create a test project or navigate to existing one
      await page.goto('/projects');
      await page.click('[data-testid="project-card"]');
      await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+$/);
    });

    test('should have default lists when project is created', async () => {
      // Verify default lists are present
      await expect(page.locator('[data-testid="board-list"]')).toHaveCount(3);
      await expect(page.locator('text=To Do')).toBeVisible();
      await expect(page.locator('text=In Progress')).toBeVisible();
      await expect(page.locator('text=Done')).toBeVisible();
    });

    test('should create new lists', async () => {
      // Click add list button
      await page.click('[data-testid="add-list-button"]');

      // Enter list title
      await page.fill('[data-testid="new-list-input"]', 'New List');

      // Submit new list
      await page.click('[data-testid="add-list-submit"]');

      // Verify list was created
      await expect(page.locator('text=New List')).toBeVisible();
      await expect(page.locator('[data-testid="board-list"]')).toHaveCount(4);
    });

    test('should edit list titles', async () => {
      // Click on list title to edit
      await page.click('[data-testid="list-title"]:first-child');

      // Edit title
      await page.fill('[data-testid="list-title-input"]', 'Updated List Title');

      // Save changes (click outside or press enter)
      await page.press('[data-testid="list-title-input"]', 'Enter');

      // Verify title was updated
      await expect(page.locator('text=Updated List Title')).toBeVisible();
    });

    test('should archive lists', async () => {
      const initialListCount = await page
        .locator('[data-testid="board-list"]')
        .count();

      // Open list menu
      await page.click('[data-testid="list-menu"]:first-child');

      // Click archive option
      await page.click('[data-testid="archive-list"]');

      // Confirm archive action
      await page.click('[data-testid="confirm-archive"]');

      // Verify list was archived (no longer visible)
      await expect(page.locator('[data-testid="board-list"]')).toHaveCount(
        initialListCount - 1
      );
    });
  });

  test.describe('Card Management', () => {
    test.beforeEach(async () => {
      await page.goto('/projects');
      await page.click('[data-testid="project-card"]');
      await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+$/);
    });

    test('should create new cards', async () => {
      // Click add card button in first list
      await page.click('[data-testid="add-card-button"]:first-child');

      // Enter card title
      await page.fill('[data-testid="new-card-input"]', 'Test Card');

      // Submit new card
      await page.click('[data-testid="add-card-submit"]');

      // Verify card was created
      await expect(page.locator('[data-testid="board-card"]')).toBeVisible();
      await expect(page.locator('text=Test Card')).toBeVisible();
    });

    test('should open card modal when clicking on card', async () => {
      // Create a card first
      await page.click('[data-testid="add-card-button"]:first-child');
      await page.fill('[data-testid="new-card-input"]', 'Modal Test Card');
      await page.click('[data-testid="add-card-submit"]');

      // Click on the card
      await page.click('[data-testid="board-card"]');

      // Verify modal is open
      await expect(page.locator('[data-testid="card-modal"]')).toBeVisible();
      await expect(page.locator('text=Modal Test Card')).toBeVisible();
    });

    test('should edit card details in modal', async () => {
      // Open card modal
      await page.click('[data-testid="board-card"]');

      // Edit card title
      await page.click('[data-testid="card-title"]');
      await page.fill('[data-testid="card-title-input"]', 'Updated Card Title');
      await page.press('[data-testid="card-title-input"]', 'Enter');

      // Edit description
      await page.click('[data-testid="card-description"]');
      await page.fill(
        '[data-testid="card-description-textarea"]',
        'Updated card description'
      );
      await page.click('[data-testid="save-description"]');

      // Set due date
      await page.click('[data-testid="set-due-date"]');
      await page.click('[data-testid="date-picker"] button:has-text("15")');

      // Close modal
      await page.click('[data-testid="close-modal"]');

      // Verify changes were saved
      await page.click('[data-testid="board-card"]');
      await expect(page.locator('text=Updated Card Title')).toBeVisible();
      await expect(page.locator('text=Updated card description')).toBeVisible();
    });

    test('should drag and drop cards between lists', async () => {
      // Create cards in different lists
      await page.click('[data-testid="add-card-button"]:first-child');
      await page.fill('[data-testid="new-card-input"]', 'Draggable Card');
      await page.click('[data-testid="add-card-submit"]');

      // Get initial position
      const sourceList = page.locator('[data-testid="board-list"]').first();
      const targetList = page.locator('[data-testid="board-list"]').nth(1);

      // Perform drag and drop
      await page
        .locator('[data-testid="board-card"]:has-text("Draggable Card")')
        .dragTo(targetList);

      // Verify card moved to new list
      const targetCards = targetList.locator('[data-testid="board-card"]');
      await expect(targetCards).toContainText('Draggable Card');
    });
  });

  test.describe('Checklist Management', () => {
    test.beforeEach(async () => {
      await page.goto('/projects');
      await page.click('[data-testid="project-card"]');
      await page.click('[data-testid="board-card"]');
    });

    test('should create checklists in cards', async () => {
      // Add checklist
      await page.click('[data-testid="add-checklist"]');
      await page.fill(
        '[data-testid="checklist-title-input"]',
        'Test Checklist'
      );
      await page.click('[data-testid="create-checklist"]');

      // Verify checklist was created
      await expect(page.locator('text=Test Checklist')).toBeVisible();
      await expect(page.locator('[data-testid="checklist"]')).toBeVisible();
    });

    test('should add checklist items', async () => {
      // Add checklist item
      await page.click('[data-testid="add-checklist-item"]');
      await page.fill('[data-testid="checklist-item-input"]', 'Test task item');
      await page.click('[data-testid="add-item"]');

      // Verify item was added
      await expect(page.locator('text=Test task item')).toBeVisible();
      await expect(
        page.locator('[data-testid="checklist-item"]')
      ).toBeVisible();
    });

    test('should toggle checklist item completion', async () => {
      // Toggle checklist item
      await page.click('[data-testid="checklist-item-checkbox"]');

      // Verify item is marked as completed
      await expect(page.locator('[data-testid="checklist-item"]')).toHaveClass(
        /completed/
      );

      // Verify progress is updated
      await expect(
        page.locator('[data-testid="checklist-progress"]')
      ).toContainText('1/1');
    });
  });

  test.describe('Real-time Collaboration', () => {
    test('should show user presence indicators', async () => {
      await page.goto('/projects');
      await page.click('[data-testid="project-card"]');

      // Mock real-time user joining
      await page.evaluate(() => {
        window.dispatchEvent(
          new CustomEvent('user-joined', {
            detail: { userId: 'test-user', userName: 'Test User' },
          })
        );
      });

      // Verify presence indicator
      await expect(page.locator('[data-testid="user-presence"]')).toBeVisible();
      await expect(page.locator('text=Test User')).toBeVisible();
    });

    test('should show real-time collaboration status', async () => {
      await page.goto('/projects');
      await page.click('[data-testid="project-card"]');

      // Verify collaboration status
      await expect(
        page.locator('[data-testid="collaboration-status"]')
      ).toBeVisible();

      // Should show either "Connected" or "Connecting" status
      const statusText = await page
        .locator('[data-testid="collaboration-status"]')
        .textContent();
      expect(['Connected', 'Connecting to real-time collaboration']).toContain(
        statusText?.trim()
      );
    });

    test('should handle conflict resolution modal', async () => {
      // Mock conflict situation
      await page.evaluate(() => {
        window.dispatchEvent(
          new CustomEvent('edit-conflict', {
            detail: {
              cardId: 'test-card',
              conflictingUser: 'Other User',
              field: 'title',
            },
          })
        );
      });

      // Verify conflict modal appears
      await expect(
        page.locator('[data-testid="conflict-modal"]')
      ).toBeVisible();
      await expect(page.locator('text=Edit Conflict')).toBeVisible();
    });
  });

  test.describe('Navigation and Routing', () => {
    test('should navigate correctly between pages', async () => {
      // Test navigation to projects
      await page.click('[data-testid="nav-projects"]');
      await expect(page).toHaveURL(/\/projects$/);

      // Test navigation to dashboard
      await page.click('[data-testid="nav-dashboard"]');
      await expect(page).toHaveURL(/\/dashboard$/);

      // Test navigation back to projects
      await page.click('[data-testid="nav-projects"]');
      await expect(page).toHaveURL(/\/projects$/);
    });

    test('should have working breadcrumbs', async () => {
      // Navigate to project
      await page.click('[data-testid="project-card"]');

      // Verify breadcrumbs
      await expect(page.locator('[data-testid="breadcrumbs"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="breadcrumb-projects"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="breadcrumb-current"]')
      ).toBeVisible();

      // Click breadcrumb to navigate back
      await page.click('[data-testid="breadcrumb-projects"]');
      await expect(page).toHaveURL(/\/projects$/);
    });

    test('should handle deep links correctly', async () => {
      // Navigate directly to project URL
      const projectUrl = '/projects/test-project-id';
      await page.goto(projectUrl);

      // Should show project board or appropriate error
      const hasBoard = await page
        .locator('[data-testid="board-container"]')
        .isVisible();
      const hasError = await page
        .locator('[data-testid="error-message"]')
        .isVisible();

      expect(hasBoard || hasError).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/projects');

      // Verify mobile navigation
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

      // Test project creation on mobile
      await page.click('[data-testid="mobile-create-project"]');
      await expect(page.locator('[data-testid="project-modal"]')).toBeVisible();
    });

    test('should work on tablet viewport', async () => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/projects');
      await page.click('[data-testid="project-card"]');

      // Verify board works on tablet
      await expect(
        page.locator('[data-testid="board-container"]')
      ).toBeVisible();

      // Test horizontal scrolling for lists
      const boardContainer = page.locator('[data-testid="board-container"]');
      await expect(boardContainer).toHaveCSS('overflow-x', 'auto');
    });

    test('should maintain functionality across different screen sizes', async () => {
      const viewports = [
        { width: 320, height: 568 }, // Small mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1024, height: 768 }, // Small desktop
        { width: 1920, height: 1080 }, // Large desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/projects');

        // Verify core functionality works
        await expect(
          page.locator('[data-testid="projects-container"]')
        ).toBeVisible();

        if (viewport.width >= 768) {
          // Desktop/tablet specific tests
          await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
        }
      }
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate network error
      await page.route('**/api/projects', (route) => route.abort());

      await page.goto('/projects');

      // Should show error state
      await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
      await expect(page.locator('text=Failed to load')).toBeVisible();
    });

    test('should handle empty states correctly', async () => {
      // Mock empty projects response
      await page.route('**/api/projects', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { projects: [], total: 0 },
          }),
        })
      );

      await page.goto('/projects');

      // Should show empty state
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
      await expect(page.locator('text=No projects yet')).toBeVisible();
    });

    test('should handle authentication errors', async () => {
      // Mock authentication error
      await page.route('**/api/auth/**', (route) => route.abort());

      await page.goto('/projects');

      // Should redirect to login or show auth error
      const currentUrl = page.url();
      expect(
        currentUrl.includes('/auth/signin') || currentUrl.includes('/error')
      ).toBeTruthy();
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load projects page within acceptable time', async () => {
      const startTime = Date.now();

      await page.goto('/projects');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should show loading states appropriately', async () => {
      // Delay API response to test loading state
      await page.route('**/api/projects', async (route) => {
        await page.waitForTimeout(1000);
        route.continue();
      });

      const navigationPromise = page.goto('/projects');

      // Should show loading skeleton
      await expect(
        page.locator('[data-testid="loading-skeleton"]')
      ).toBeVisible();

      await navigationPromise;
      await page.waitForLoadState('networkidle');

      // Loading should be gone
      await expect(
        page.locator('[data-testid="loading-skeleton"]')
      ).not.toBeVisible();
    });

    test('should handle large numbers of cards efficiently', async () => {
      // Mock project with many cards
      await page.route('**/api/projects/**/board', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-project',
              title: 'Performance Test Project',
              lists: [
                {
                  id: 'list-1',
                  title: 'Large List',
                  cards: Array.from({ length: 100 }, (_, i) => ({
                    id: `card-${i}`,
                    title: `Card ${i}`,
                    position: i * 1000,
                  })),
                },
              ],
            },
          }),
        })
      );

      await page.goto('/projects/test-project');

      // Should render without performance issues
      await expect(
        page.locator('[data-testid="board-container"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="board-card"]')).toHaveCount(100);
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist project data correctly', async () => {
      // Create project
      await page.click('[data-testid="create-project-button"]');
      await page.fill(
        '[data-testid="project-title-input"]',
        'Persistence Test'
      );
      await page.click('[data-testid="create-project-submit"]');

      // Add list and card
      await page.click('[data-testid="add-card-button"]:first-child');
      await page.fill('[data-testid="new-card-input"]', 'Test Card');
      await page.click('[data-testid="add-card-submit"]');

      // Navigate away and back
      await page.goto('/dashboard');
      await page.goto('/projects');
      await page.click(
        '[data-testid="project-card"]:has-text("Persistence Test")'
      );

      // Verify data persisted
      await expect(page.locator('text=Test Card')).toBeVisible();
    });

    test('should handle concurrent edits correctly', async () => {
      // Simulate concurrent editing scenario
      await page.goto('/projects');
      await page.click('[data-testid="project-card"]');
      await page.click('[data-testid="board-card"]');

      // Edit card title
      await page.click('[data-testid="card-title"]');
      await page.fill('[data-testid="card-title-input"]', 'Concurrency Test');

      // Simulate another user's edit via API
      await page.evaluate(async () => {
        await fetch('/api/cards/test-card-id', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Another User Edit' }),
        });
      });

      // Submit local edit
      await page.press('[data-testid="card-title-input"]', 'Enter');

      // Should handle conflict appropriately
      const hasConflictModal = await page
        .locator('[data-testid="conflict-modal"]')
        .isVisible();
      const hasUpdatedTitle = await page
        .locator('text=Concurrency Test')
        .isVisible();

      // Either show conflict resolution or apply last-write-wins
      expect(hasConflictModal || hasUpdatedTitle).toBeTruthy();
    });
  });
});
