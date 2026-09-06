import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Single worker: every suite shares the one test database and the boot
    // gate's advisory lock — parallel files would just contend.
    fileParallelism: false,
    globalSetup: ["tests/global-setup.ts"],
    setupFiles: ["tests/setup.ts"],
    // The first request triggers migrations + the full demo seed.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
