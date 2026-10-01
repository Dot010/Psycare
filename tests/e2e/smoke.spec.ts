import { expect, test } from "@playwright/test";

test("redirects root to login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
});
