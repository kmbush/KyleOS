import { expect, test } from "@playwright/test";

// The springboard experience at a phone width.
test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("shows the springboard and does not auto-open Help on mobile", async ({ page }) => {
  // Dock apps identify the springboard; auto-waits past the boot overlay.
  await expect(page.getByTitle("About")).toBeVisible();
  await expect(page.getByText("Welcome to KyleOS")).toBeHidden();
  // No desktop chrome.
  await expect(page.getByRole("button", { name: "View" })).toHaveCount(0);
});

test("opens an app in a full-screen sheet and returns via the back chevron", async ({ page }) => {
  await page.getByTitle("About").click();
  await expect(
    page.getByText("I turn ambiguous problems into systems that hold up under load."),
  ).toBeVisible();
  await page.getByTitle("Back").click();
  await expect(page.getByTitle("About")).toBeVisible();
});

test("Contact shows the social buttons on mobile", async ({ page }) => {
  await page.getByTitle("Contact").click();
  await expect(page.getByTitle("GitHub")).toBeVisible();
  await expect(page.getByTitle("LinkedIn")).toBeVisible();
});
