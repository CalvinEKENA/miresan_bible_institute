import { defineConfig } from "@playwright/test";

/** Contrôle d'hydratation sur le serveur de développement (`npm run test:hydration`). */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const port = Number(process.env.HYDRATION_PORT ?? 3210);
process.env.HYDRATION_DEV = "1";

export default defineConfig({
  testDir: "e2e",
  testMatch: "hydration.spec.ts",
  timeout: 90_000,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    locale: "fr-FR",
    timezoneId: "Africa/Douala",
    viewport: { width: 1440, height: 900 },
    launchOptions: executablePath ? { executablePath } : {},
  },
  webServer: {
    command: `npx next dev -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { NEXT_PUBLIC_DATA_MODE: "demo" },
  },
});
