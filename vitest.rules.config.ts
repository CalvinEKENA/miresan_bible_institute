import path from "node:path";
import { defineConfig } from "vitest/config";

/** Tests des Security Rules — exécutés via `npm run test:rules` (émulateurs Firestore + Storage). */
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    environment: "node",
    include: ["tests/rules/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
