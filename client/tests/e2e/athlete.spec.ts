import { test, expect } from '@playwright/test';

test.describe('Athlete Flow E2E', () => {
  test('Should render anamnesis form', async ({ page }) => {
    // Like professor, if we aren't authenticated it might throw error or require login if wrapped in a protector.
    // Assuming the page is rendered but requires auth to submit:
    await page.goto('/athlete/onboarding.html');
    await expect(page.locator('text=Onboarding Clínico')).toBeVisible();
    await expect(page.locator('text=Peso (kg)')).toBeVisible();
  });
});
