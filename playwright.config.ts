import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.e2e.spec.ts",
  workers: 1,
  retries: 1,
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000", trace: "retain-on-failure" },
  webServer: { command: "sh scripts/start-standalone.sh", url: process.env.BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: false, timeout: 120_000 },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"]! } },
    { name: "mobile", use: { ...devices["Pixel 7"]! } },
  ],
});
