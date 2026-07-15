import { defineConfig, devices } from "@playwright/test";

// A persisted, repeatable smoke suite — see docs/LEARNING_GUIDE.md for why this didn't exist
// before: every prior verification pass in this project was a one-off script run against a
// local production build talking to the *live* Lambda, then thrown away. These tests
// deliberately mock every network call to the interest-form API (see e2e/*.spec.ts) instead
// of hitting the live backend, so they're safe to run unattended on every push/PR without
// writing real submissions or tripping rate limits.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "html",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // This sandbox pre-installs one pinned Chromium revision at a fixed path rather than
        // letting each project's Playwright version fetch its own — pointing at it directly
        // avoids a version-mismatch download failure. Harmless/no-op on a real CI runner where
        // `playwright install` has already fetched the exact revision this package.json's
        // @playwright/test version expects, since the env var below just won't be set there.
        launchOptions: process.env.PLAYWRIGHT_BROWSERS_PATH ? { executablePath: "/opt/pw-browsers/chromium" } : {},
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
