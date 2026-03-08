import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.spec.ts"],
    reporters: isCI ? ["default", "junit"] : ["default"],
    outputFile: isCI ? { junit: "./test-results/junit.xml" } : undefined,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text-summary", "json-summary", "lcov"],
      exclude: [
        "**/*.d.ts",
        "**/*.spec.ts",
        "**/test/**",
        "**/.next/**",
        "**/dist/**",
        "**/node_modules/**",
      ],
      thresholds: {
        statements: 7,
        branches: 40,
        functions: 30,
        lines: 7,
      },
    },
  },
});
