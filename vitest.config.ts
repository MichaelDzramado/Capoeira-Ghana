import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: [
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/api/**/*.test.ts",
      "tests/integration/**/*.test.ts",
    ],
    exclude: [
      "tests/e2e/**",
      "tests/accessibility/**",
      "node_modules/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "apps/web"),
    },
  },
});
