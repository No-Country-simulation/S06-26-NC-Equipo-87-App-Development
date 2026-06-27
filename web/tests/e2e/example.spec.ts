import { test, expect } from '@playwright/test';

test('should render the login screen', async ({ page }) => {
  await page.goto('/');

  const title = page.locator('.opscore-login-title');
  await expect(title).toBeVisible();
  await expect(title).toHaveText('OpsCore');

  const idInput = page.locator('[data-testid="identifier-input"]');
  await expect(idInput).toBeVisible();

  const passwordInput = page.locator('[data-testid="password-input"]');
  await expect(passwordInput).toBeVisible();

  const loginButton = page.locator('[data-testid="login-button"]');
  await expect(loginButton).toBeVisible();
});
