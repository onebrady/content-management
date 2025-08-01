import { test, expect } from '@playwright/test';

// Mock authentication for testing
test.use({
  storageState: async ({ browser }, use) => {
    // Create a new browser context with storage state
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set up mock session storage
    await page.evaluate(() => {
      const mockSession = {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'ADMIN',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      localStorage.setItem(
        'next-auth.session-token',
        JSON.stringify(mockSession)
      );
    });

    // Save storage state to use in tests
    const storageState = await context.storageState();
    await context.close();
    await use(storageState);
  },
});

test.describe('Approval Workflow', () => {
  test('should display approval dashboard', async ({ page }) => {
    await page.goto('/approvals');
    await expect(
      page.getByRole('heading', { name: 'Approval Dashboard' })
    ).toBeVisible();
  });

  test('should show approval filters', async ({ page }) => {
    await page.goto('/approvals');
    await expect(page.getByText('Filter Approvals')).toBeVisible();
  });

  test('should display approval statistics', async ({ page }) => {
    await page.goto('/approvals');
    await expect(page.getByText('Approval Statistics')).toBeVisible();
  });

  test('should show approval list', async ({ page }) => {
    await page.goto('/approvals');
    await expect(page.getByRole('table')).toBeVisible();
  });
});
