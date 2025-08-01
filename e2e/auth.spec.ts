import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login page when accessing protected route', async ({
    page,
  }) => {
    // Clear storage state to ensure we're not authenticated
    await page.context().clearCookies();

    // Try to access a protected route
    await page.goto('/dashboard');

    // Should be redirected to login page
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should show error message with invalid credentials', async ({
    page,
  }) => {
    // Clear storage state to ensure we're not authenticated
    await page.context().clearCookies();

    // Go to login page
    await page.goto('/auth/signin');

    // Fill in invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');

    // Submit the form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});
