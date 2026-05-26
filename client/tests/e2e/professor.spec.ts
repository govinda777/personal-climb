import { test, expect } from "@playwright/test";

test.describe("Professor Dashboard", () => {
  test("should display loading state initially", async ({ page }) => {
    // Intercept Privy's auth request
    await page.route("**/api/v1/users/me", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            id: "did:privy:test",
            created_at: 123456,
            linked_accounts: [],
            has_accepted_terms: true,
            is_guest: false,
          },
        }),
      });
    });

    // We are mocking Privy as logged in, but not as the professor yet, so it should show login prompt
    await page.goto("/professor/dashboard");
    const loginText = page.getByText(/Faça login/i);
    await expect(loginText).toBeVisible({ timeout: 10000 });
  });
});
