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

test.describe('Content Management', () => {
  test('should display content list page', async ({ page }) => {
    await page.goto('/content');
    await expect(page.getByRole('heading', { name: 'Content' })).toBeVisible();
  });

  test('should navigate to content editor', async ({ page }) => {
    await page.goto('/content');
    await page.getByRole('button', { name: 'Create New' }).click();
    await expect(page).toHaveURL(/.*\/content\/editor.*/);
  });

  test('should display content table', async ({ page }) => {
    await page.goto('/content/table');
    await expect(page.getByRole('grid')).toBeVisible();
  });
});
