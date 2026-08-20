import { defineConfig } from "vitest/config";

export default defineConfig({
  cacheDir: "/tmp/hydracut-vite",
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
