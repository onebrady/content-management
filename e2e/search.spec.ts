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

test.describe('Search Functionality', () => {
  test('should display search page', async ({ page }) => {
    await page.goto('/search');
    await expect(
      page.getByRole('heading', { name: 'Search Content' })
    ).toBeVisible();
  });

  test('should show search filters', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByPlaceholder('Search content...')).toBeVisible();
  });

  test('should perform search', async ({ page }) => {
    await page.goto('/search');
    await page.getByPlaceholder('Search content...').fill('test');
    await page.keyboard.press('Enter');
    // Wait for search results to load
    await page.waitForTimeout(1000);
    // Should see search results or "No results found" message
  });

  test('should filter by status', async ({ page }) => {
    await page.goto('/search');
    await page.getByText('Status').click();
    await page.getByRole('option', { name: 'Draft' }).click();
    // Wait for filtered results
    await page.waitForTimeout(1000);
  });
});
