import { defineConfig, devices } from '@playwright/test';

/**
 * Browser E2E for the student web.
 *
 *   BASE_URL   where the student web is served   (default https://aim-learn.com)
 *   API_BASE   backend API used to provision the test student
 *              (default https://api.aim-learn.com)
 *
 * See e2e/README.md for the credentials / provisioning options.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 5 * 60 * 1000, // the whole placement test is ~26 questions
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://aim-learn.com',
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
