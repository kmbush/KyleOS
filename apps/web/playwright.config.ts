import { defineConfig } from "@playwright/test";

// Interaction tests run against the production preview build (`e2e:serve` seeds a
// local config.json/content.json, builds, then serves dist) — the shipped bundle,
// with no dev-only StrictMode double-invoke or cold on-demand transforms to flake.
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:4173" },
  webServer: {
    command: "npm run e2e:serve",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
