import { test as base } from "@playwright/test";

// Shared e2e test with CSS animations and transitions disabled. Windows open with
// a `winIn` transform: scale() pop; measuring geometry mid-pop yields a scaled-down
// boundingBox, so maximize/restore assertions read the wrong width. Zeroing every
// animation/transition from first paint makes all geometry deterministic — the
// animations themselves are design, not behavior under test. Injected via an init
// script so the style is in place before React ever mounts a window.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      const css =
        "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}";
      const style = document.createElement("style");
      style.textContent = css;
      const attach = () => document.head.append(style);
      if (document.head) attach();
      else document.addEventListener("DOMContentLoaded", attach);
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
