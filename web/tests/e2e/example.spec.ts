import { test, expect } from '@playwright/test';

test('should increment counter on click', async ({ page }) => {
  await page.goto('/');

  const counterButton = page.locator('button.counter');
  await expect(counterButton).toBeVisible();
  await expect(counterButton).toHaveText('Count is 0');

  await counterButton.click();
  await expect(counterButton).toHaveText('Count is 1');

  await counterButton.click();
  await expect(counterButton).toHaveText('Count is 2');
});
