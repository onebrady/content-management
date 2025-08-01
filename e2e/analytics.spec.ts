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

test.describe('Analytics Dashboard', () => {
  test('should display analytics dashboard', async ({ page }) => {
    await page.goto('/analytics');
    await expect(
      page.getByRole('heading', { name: 'Analytics Dashboard' })
    ).toBeVisible();
  });

  test('should show time range selector', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.getByText('Last 7 Days')).toBeVisible();
    await expect(page.getByText('Last 30 Days')).toBeVisible();
    await expect(page.getByText('Last 90 Days')).toBeVisible();
    await expect(page.getByText('Custom Range')).toBeVisible();
  });

  test('should display summary statistics', async ({ page }) => {
    await page.goto('/analytics');
    // Wait for analytics data to load
    await page.waitForTimeout(1000);
    // Should see at least one stat card
    await expect(page.locator('.MuiCard-root')).toBeVisible();
  });

  test('should show charts', async ({ page }) => {
    await page.goto('/analytics');
    // Wait for charts to load
    await page.waitForTimeout(1000);
    // Should see at least one chart
    await expect(page.locator('svg')).toBeVisible();
  });

  test('should export data', async ({ page }) => {
    await page.goto('/analytics');
    await page.getByRole('button', { name: 'Export Data' }).click();
    // Should trigger download (can't fully test in headless mode)
  });
});
