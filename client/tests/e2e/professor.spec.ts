import { test, expect } from '@playwright/test';

test.describe('Professor Dashboard', () => {
  test('should display loading state initially', async ({ page }) => {
    // Intercept Privy's auth request
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            id: 'did:privy:test',
            created_at: 123456,
            linked_accounts: [],
            has_accepted_terms: true,
            is_guest: false,
          }
        }),
      });
    });

    await page.goto('/professor/dashboard');
    const loginText = page.locator('text=Faça login para acessar o painel do treinador.');
    await expect(loginText).toBeVisible();
  });
});
