import { defineConfig } from "@playwright/test";

// Interaction tests run against the dev server; `predev` seeds a local config.json.
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:5173" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
