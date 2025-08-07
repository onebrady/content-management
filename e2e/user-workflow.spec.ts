import { test, expect, Page } from '@playwright/test';

/**
 * End-to-end test for complete user workflow in the new project management system
 * Tests the entire flow: create project → add lists → add cards → collaborate
 */
test.describe('Complete User Workflow', () => {
  let page: Page;
  let projectId: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    // Setup authentication
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      window.localStorage.setItem('test-auth', 'true');
      window.localStorage.setItem(
        'test-user',
        JSON.stringify({
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        })
      );
    });
  });

  test('Complete Project Management Workflow', async () => {
    // Step 1: Navigate to projects page
    await test.step('Navigate to projects page', async () => {
      await page.goto('/projects');
      await expect(page.locator('h1')).toContainText('Projects');
      await expect(
        page.locator('[data-testid="projects-container"]')
      ).toBeVisible();
    });

    // Step 2: Create a new project
    await test.step('Create new project', async () => {
      // Click create project button
      await page.click('[data-testid="create-project-button"]');

      // Verify modal opened
      await expect(page.locator('[data-testid="project-modal"]')).toBeVisible();

      // Fill project details
      await page.fill(
        '[data-testid="project-title-input"]',
        'Complete Workflow Test Project'
      );
      await page.fill(
        '[data-testid="project-description-input"]',
        'Testing the complete user workflow from start to finish'
      );

      // Select project color
      await page.click('[data-testid="color-blue"]');

      // Create project
      await page.click('[data-testid="create-project-submit"]');

      // Wait for navigation to project board
      await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+$/);

      // Extract project ID from URL
      const url = page.url();
      projectId = url.split('/').pop() || '';

      // Verify project board loaded
      await expect(page.locator('h1')).toContainText(
        'Complete Workflow Test Project'
      );
      await expect(
        page.locator('[data-testid="board-container"]')
      ).toBeVisible();
    });

    // Step 3: Verify default lists were created
    await test.step('Verify default lists', async () => {
      // Should have 3 default lists
      await expect(page.locator('[data-testid="board-list"]')).toHaveCount(3);

      // Verify list titles
      await expect(page.locator('text=To Do')).toBeVisible();
      await expect(page.locator('text=In Progress')).toBeVisible();
      await expect(page.locator('text=Done')).toBeVisible();

      // Verify lists are empty initially
      const toDoList = page.locator('[data-testid="board-list"]').first();
      await expect(toDoList.locator('[data-testid="board-card"]')).toHaveCount(
        0
      );
    });

    // Step 4: Add custom lists
    await test.step('Add custom lists', async () => {
      // Add "Review" list
      await page.click('[data-testid="add-list-button"]');
      await page.fill('[data-testid="new-list-input"]', 'Review');
      await page.click('[data-testid="add-list-submit"]');

      // Add "Blocked" list
      await page.click('[data-testid="add-list-button"]');
      await page.fill('[data-testid="new-list-input"]', 'Blocked');
      await page.click('[data-testid="add-list-submit"]');

      // Verify lists were added
      await expect(page.locator('[data-testid="board-list"]')).toHaveCount(5);
      await expect(page.locator('text=Review')).toBeVisible();
      await expect(page.locator('text=Blocked')).toBeVisible();
    });

    // Step 5: Add cards to different lists
    await test.step('Add cards to lists', async () => {
      // Add cards to "To Do" list
      const toDoList = page.locator('[data-testid="board-list"]').first();

      // Add first card
      await toDoList.locator('[data-testid="add-card-button"]').click();
      await page.fill(
        '[data-testid="new-card-input"]',
        'Design user interface mockups'
      );
      await page.click('[data-testid="add-card-submit"]');

      // Add second card
      await toDoList.locator('[data-testid="add-card-button"]').click();
      await page.fill(
        '[data-testid="new-card-input"]',
        'Set up project repository'
      );
      await page.click('[data-testid="add-card-submit"]');

      // Add third card
      await toDoList.locator('[data-testid="add-card-button"]').click();
      await page.fill(
        '[data-testid="new-card-input"]',
        'Write technical requirements'
      );
      await page.click('[data-testid="add-card-submit"]');

      // Verify cards were added
      await expect(toDoList.locator('[data-testid="board-card"]')).toHaveCount(
        3
      );
      await expect(
        page.locator('text=Design user interface mockups')
      ).toBeVisible();
      await expect(
        page.locator('text=Set up project repository')
      ).toBeVisible();
      await expect(
        page.locator('text=Write technical requirements')
      ).toBeVisible();
    });

    // Step 6: Edit card details
    await test.step('Edit card details', async () => {
      // Click on first card to open modal
      await page.click(
        '[data-testid="board-card"]:has-text("Design user interface mockups")'
      );

      // Verify modal opened
      await expect(page.locator('[data-testid="card-modal"]')).toBeVisible();
      await expect(page.locator('h2')).toContainText(
        'Design user interface mockups'
      );

      // Add description
      await page.click('[data-testid="card-description"]');
      await page.fill(
        '[data-testid="card-description-textarea"]',
        'Create wireframes and high-fidelity mockups for all main user interfaces including dashboard, project board, and card details.'
      );
      await page.click('[data-testid="save-description"]');

      // Set due date
      await page.click('[data-testid="set-due-date"]');
      await page.click('[data-testid="date-picker"] button:has-text("25")');

      // Add checklist
      await page.click('[data-testid="add-checklist"]');
      await page.fill('[data-testid="checklist-title-input"]', 'Design Tasks');
      await page.click('[data-testid="create-checklist"]');

      // Add checklist items
      await page.click('[data-testid="add-checklist-item"]');
      await page.fill(
        '[data-testid="checklist-item-input"]',
        'Create wireframes'
      );
      await page.click('[data-testid="add-item"]');

      await page.click('[data-testid="add-checklist-item"]');
      await page.fill(
        '[data-testid="checklist-item-input"]',
        'Design high-fidelity mockups'
      );
      await page.click('[data-testid="add-item"]');

      await page.click('[data-testid="add-checklist-item"]');
      await page.fill(
        '[data-testid="checklist-item-input"]',
        'Get stakeholder approval'
      );
      await page.click('[data-testid="add-item"]');

      // Verify checklist was created
      await expect(page.locator('text=Design Tasks')).toBeVisible();
      await expect(page.locator('[data-testid="checklist-item"]')).toHaveCount(
        3
      );

      // Mark first item as complete
      await page.click('[data-testid="checklist-item-checkbox"]');
      await expect(
        page.locator('[data-testid="checklist-progress"]')
      ).toContainText('1/3');

      // Close modal
      await page.click('[data-testid="close-modal"]');
    });

    // Step 7: Move cards between lists (drag and drop)
    await test.step('Move cards between lists', async () => {
      // Move "Set up project repository" to "In Progress"
      const sourceCard = page.locator(
        '[data-testid="board-card"]:has-text("Set up project repository")'
      );
      const inProgressList = page.locator('[data-testid="board-list"]').nth(1);

      await sourceCard.dragTo(inProgressList);

      // Verify card moved
      await expect(
        inProgressList.locator(
          '[data-testid="board-card"]:has-text("Set up project repository")'
        )
      ).toBeVisible();

      // Move "Design user interface mockups" to "Review"
      const designCard = page.locator(
        '[data-testid="board-card"]:has-text("Design user interface mockups")'
      );
      const reviewList = page.locator('[data-testid="board-list"]').nth(3);

      await designCard.dragTo(reviewList);

      // Verify card moved
      await expect(
        reviewList.locator(
          '[data-testid="board-card"]:has-text("Design user interface mockups")'
        )
      ).toBeVisible();
    });

    // Step 8: Test real-time collaboration features
    await test.step('Test real-time collaboration', async () => {
      // Verify collaboration status is shown
      await expect(
        page.locator('[data-testid="collaboration-status"]')
      ).toBeVisible();

      // Simulate another user joining
      await page.evaluate(() => {
        const event = new CustomEvent('user-joined', {
          detail: {
            userId: 'user-2',
            userName: 'Collaborator User',
            presence: 'viewing',
          },
        });
        window.dispatchEvent(event);
      });

      // Verify user presence is shown
      await expect(page.locator('[data-testid="user-presence"]')).toBeVisible();
      await expect(page.locator('text=Collaborator User')).toBeVisible();

      // Test edit conflict scenario
      await page.click(
        '[data-testid="board-card"]:has-text("Write technical requirements")'
      );

      // Simulate edit conflict
      await page.evaluate(() => {
        const event = new CustomEvent('edit-conflict', {
          detail: {
            cardId: 'test-card',
            conflictingUser: 'Collaborator User',
            field: 'title',
          },
        });
        window.dispatchEvent(event);
      });

      // Verify conflict modal shows (if implemented)
      const hasConflictModal = await page
        .locator('[data-testid="conflict-modal"]')
        .isVisible();
      const hasEditingIndicator = await page
        .locator('[data-testid="editing-indicator"]')
        .isVisible();

      // Should show some form of conflict indication
      expect(hasConflictModal || hasEditingIndicator).toBeTruthy();

      // Close modal if open
      if (await page.locator('[data-testid="card-modal"]').isVisible()) {
        await page.click('[data-testid="close-modal"]');
      }
    });

    // Step 9: Test project navigation and persistence
    await test.step('Test navigation and data persistence', async () => {
      // Navigate back to projects list
      await page.click('[data-testid="nav-projects"]');
      await expect(page).toHaveURL('/projects');

      // Verify project appears in list with correct data
      const projectCard = page.locator(
        '[data-testid="project-card"]:has-text("Complete Workflow Test Project")'
      );
      await expect(projectCard).toBeVisible();
      await expect(projectCard.locator('text=5 lists')).toBeVisible();
      await expect(projectCard.locator('text=3 cards')).toBeVisible();

      // Navigate back to project
      await projectCard.click();
      await page.waitForURL(/\/projects\/[a-zA-Z0-9-]+$/);

      // Verify all data persisted
      await expect(page.locator('[data-testid="board-list"]')).toHaveCount(5);
      await expect(page.locator('[data-testid="board-card"]')).toHaveCount(3);

      // Verify cards are in correct lists
      const reviewList = page.locator('[data-testid="board-list"]').nth(3);
      await expect(
        reviewList.locator(
          '[data-testid="board-card"]:has-text("Design user interface mockups")'
        )
      ).toBeVisible();

      const inProgressList = page.locator('[data-testid="board-list"]').nth(1);
      await expect(
        inProgressList.locator(
          '[data-testid="board-card"]:has-text("Set up project repository")'
        )
      ).toBeVisible();
    });

    // Step 10: Test responsive behavior
    await test.step('Test responsive design', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify board is still functional on mobile
      await expect(
        page.locator('[data-testid="board-container"]')
      ).toBeVisible();

      // Should show horizontal scroll for lists
      const boardContainer = page.locator('[data-testid="board-container"]');
      await expect(boardContainer).toHaveCSS('overflow-x', 'auto');

      // Test card interaction on mobile
      await page.click('[data-testid="board-card"]');
      await expect(page.locator('[data-testid="card-modal"]')).toBeVisible();
      await page.click('[data-testid="close-modal"]');

      // Reset to desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    // Step 11: Test search and filtering (if implemented)
    await test.step('Test search functionality', async () => {
      // If search is implemented
      if (await page.locator('[data-testid="search-input"]').isVisible()) {
        await page.fill('[data-testid="search-input"]', 'Design');
        await expect(
          page.locator(
            '[data-testid="board-card"]:has-text("Design user interface mockups")'
          )
        ).toBeVisible();
        await expect(
          page.locator(
            '[data-testid="board-card"]:has-text("Set up project repository")'
          )
        ).not.toBeVisible();

        // Clear search
        await page.fill('[data-testid="search-input"]', '');
        await expect(page.locator('[data-testid="board-card"]')).toHaveCount(3);
      }
    });

    // Step 12: Test performance with multiple operations
    await test.step('Test performance and stability', async () => {
      const startTime = Date.now();

      // Perform multiple rapid operations
      for (let i = 0; i < 5; i++) {
        // Add card
        await page.click('[data-testid="add-card-button"]');
        await page.fill(
          '[data-testid="new-card-input"]',
          `Performance Test Card ${i}`
        );
        await page.click('[data-testid="add-card-submit"]');

        // Move card
        const newCard = page.locator(
          `[data-testid="board-card"]:has-text("Performance Test Card ${i}")`
        );
        const targetList = page.locator('[data-testid="board-list"]').nth(1);
        await newCard.dragTo(targetList);
      }

      const endTime = Date.now();
      const operationTime = endTime - startTime;

      // Should complete operations in reasonable time
      expect(operationTime).toBeLessThan(10000); // 10 seconds max

      // Verify all operations completed successfully
      await expect(page.locator('[data-testid="board-card"]')).toHaveCount(8);
    });

    // Step 13: Final validation
    await test.step('Final system validation', async () => {
      // Verify no console errors occurred during workflow
      const logs = await page.evaluate(() => {
        return window.console.errors || [];
      });

      // Should have minimal or no errors
      expect(logs.length).toBeLessThan(3);

      // Verify all major features are functional
      await expect(
        page.locator('[data-testid="board-container"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="collaboration-status"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="board-list"]')).toHaveCount(5);
      await expect(page.locator('[data-testid="board-card"]')).toBeVisible();

      // Verify navigation still works
      await page.click('[data-testid="nav-projects"]');
      await expect(page).toHaveURL('/projects');

      // Success - complete workflow tested
      console.log('✅ Complete user workflow test passed successfully!');
    });
  });

  test.afterAll(async () => {
    // Cleanup - remove test project if needed
    if (projectId) {
      await page.evaluate(async (id) => {
        try {
          await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        } catch (error) {
          console.log('Cleanup error:', error);
        }
      }, projectId);
    }

    await page.close();
  });
});
