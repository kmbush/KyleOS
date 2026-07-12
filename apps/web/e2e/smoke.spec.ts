import { expect, test } from "@playwright/test";

test("boots and renders the KyleOS placeholder", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("booting KyleOS")).toBeVisible();
});
