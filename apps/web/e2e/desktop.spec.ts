import { expect, type Locator, type Page, test } from "@playwright/test";

// The desktop boots, auto-opens Help, and every window interaction works.
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // Boot dismisses at 1500ms and auto-opens Help on the desktop.
  await expect(page.getByText("Welcome to KyleOS")).toBeVisible();
});

function windowEl(page: Page, id: string): Locator {
  return page.locator(`[data-window="${id}"]`);
}

async function zIndex(locator: Locator): Promise<number> {
  return locator.evaluate((el) => Number(getComputedStyle(el).zIndex));
}

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error("element has no bounding box");
  return b;
}

// Windows open with a `winIn` transform: scale() pop, so boundingBox() reports a
// mid-animation (scaled-down) size until it finishes. Await it before measuring
// geometry, or the settled size won't match. Resolves instantly if none running.
async function settle(locator: Locator): Promise<void> {
  await locator.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
}

test("boots and auto-opens Help", async ({ page }) => {
  await expect(page.getByText("booting KyleOS")).toBeHidden();
  await expect(windowEl(page, "help")).toBeVisible();
});

test("opens an app from the dock", async ({ page }) => {
  await page.getByText("About", { exact: true }).click();
  await expect(windowEl(page, "about")).toBeVisible();
  await expect(
    page.getByText("I turn ambiguous problems into systems that hold up under load."),
  ).toBeVisible();
});

test("clicking a background window brings it to the front", async ({ page }) => {
  await page.getByText("About", { exact: true }).click();
  await page.getByText("Writing", { exact: true }).click();
  expect(await zIndex(windowEl(page, "writing"))).toBeGreaterThan(
    await zIndex(windowEl(page, "about")),
  );

  // Click About's top-left title bar — the one corner Writing's +26px offset leaves uncovered.
  await windowEl(page, "about").click({ position: { x: 8, y: 8 } });
  expect(await zIndex(windowEl(page, "about"))).toBeGreaterThan(
    await zIndex(windowEl(page, "writing")),
  );
});

test("minimizes to a dock pill and restores", async ({ page }) => {
  await page.getByText("About", { exact: true }).click();
  await expect(windowEl(page, "about")).toBeVisible();

  await windowEl(page, "about").getByTitle("minimize").click();
  await expect(windowEl(page, "about")).toHaveCount(0);

  await page.getByTitle("About").click(); // the dock pill
  await expect(windowEl(page, "about")).toBeVisible();
});

test("drags a window by its title bar", async ({ page }) => {
  await page.getByText("About", { exact: true }).click();
  const win = windowEl(page, "about");
  await settle(win);
  const before = await box(win);

  await page.mouse.move(before.x + 120, before.y + 8);
  await page.mouse.down();
  await page.mouse.move(before.x + 240, before.y + 68, { steps: 5 });
  await page.mouse.up();

  const after = await box(win);
  expect(after.x).toBeGreaterThan(before.x + 80);
  expect(after.y).toBeGreaterThan(before.y + 40);
});

test("Spotlight opens with the keyboard and launches an app", async ({ page }) => {
  await page.keyboard.press("Control+k");
  const input = page.getByPlaceholder("Search apps, projects, sections…");
  await expect(input).toBeFocused();

  await input.fill("cert");
  await expect(page.getByText("Certifications")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(windowEl(page, "certs")).toBeVisible();
});

test("toggles the theme from the View menu", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "View" }).click();
  await page.getByText("Light theme").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("Spotlight closes on Escape", async ({ page }) => {
  const input = page.getByPlaceholder("Search apps, projects, sections…");
  await page.keyboard.press("Control+k");
  await expect(input).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(input).toBeHidden();
});

test("maximizes a window to fill the viewport and restores", async ({ page }) => {
  await page.getByText("About", { exact: true }).click();
  const win = windowEl(page, "about");
  await settle(win);
  const before = await box(win);

  await win.getByTitle("maximize").click();
  const maxed = await box(win);
  const viewport = page.viewportSize();
  if (viewport) expect(maxed.width).toBeGreaterThan(viewport.width - 40);

  await win.getByTitle("maximize").click();
  const restored = await box(win);
  expect(Math.round(restored.width)).toBe(Math.round(before.width));
});
