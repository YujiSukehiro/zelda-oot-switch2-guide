import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: 'list',
  use: {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 10_000,
  },
  webServer: {
    command: 'node e2e/serve-dual.mjs',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
