import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/**", "node_modules/**", ".next/**"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/app/**/loading.tsx", "src/app/**/template.tsx"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
