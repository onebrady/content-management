import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication for tests
    await page.goto('/dashboard');

    // Verify we're on the dashboard (authentication should be handled by storageState)
    await expect(
      page.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible();
  });

  test('should navigate through main sections', async ({ page }) => {
    // Start at dashboard
    await page.goto('/dashboard');
    await expect(
      page.getByRole('heading', { name: 'Dashboard' })
    ).toBeVisible();

    // Navigate to content
    await page.getByRole('link', { name: 'Content' }).click();
    await expect(page.getByRole('heading', { name: 'Content' })).toBeVisible();

    // Navigate to approvals
    await page.getByRole('link', { name: 'Approvals' }).click();
    await expect(
      page.getByRole('heading', { name: 'Approval Dashboard' })
    ).toBeVisible();

    // Navigate to search
    await page.getByRole('link', { name: 'Search' }).click();
    await expect(
      page.getByRole('heading', { name: 'Search Content' })
    ).toBeVisible();

    // Navigate to analytics
    await page.getByRole('link', { name: 'Analytics' }).click();
    await expect(
      page.getByRole('heading', { name: 'Analytics Dashboard' })
    ).toBeVisible();
  });

  test('should complete content creation and approval workflow', async ({
    page,
  }) => {
    // Create content
    await page.goto('/content/editor');
    await page.getByLabel('Title').fill('Test Content');

    // Fill editor content (simplified for test)
    await page.locator('.ProseMirror').fill('This is test content.');
    await page.getByRole('button', { name: 'Save' }).click();

    // Submit for review
    await page.getByRole('button', { name: 'Submit for Review' }).click();

    // Go to approvals
    await page.goto('/approvals');

    // Find and approve content
    await page.getByText('Test Content').first().click();
    await page.getByRole('button', { name: 'Approve' }).click();

    // Publish content
    await page.getByRole('button', { name: 'Publish' }).click();

    // Verify published status
    await expect(page.getByText('PUBLISHED')).toBeVisible();
  });
});
