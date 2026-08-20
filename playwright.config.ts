import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.e2e.spec.ts",
  timeout: 60_000,
  workers: 1,
  retries: 0,
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000", trace: "retain-on-failure" },
  webServer: { command: "sh scripts/start-standalone.sh", url: process.env.BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"]! } },
    { name: "tablet", use: { ...devices["iPad Mini"]!, browserName: "chromium", viewport: { width: 834, height: 1112 } } },
    { name: "mobile", use: { ...devices["Pixel 7"]! } },
  ],
});
