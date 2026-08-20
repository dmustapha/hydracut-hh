import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.e2e.spec.ts",
  retries: 1,
  use: { baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3000", trace: "retain-on-failure" },
  webServer: { command: "pnpm start", url: process.env.BASE_URL ?? "http://127.0.0.1:3000",
    reuseExistingServer: false, timeout: 120_000 },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"]! } },
    { name: "mobile", use: { ...devices["Pixel 7"]! } },
  ],
});
