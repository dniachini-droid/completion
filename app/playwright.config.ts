import { defineConfig } from '@playwright/test';

// Flows and the look at true phone size (TEST_STRATEGY.md layer 5).
// WebKit is the target engine; the cloud container only ships Chromium, so Chromium runs here for now (recorded, D-061).
export default defineConfig({
  testDir: 'tests/flows',
  outputDir: 'test-results',
  webServer: { command: 'npx vite preview --port 4173 --strictPort', port: 4173, reuseExistingServer: true },
  use: { baseURL: 'http://localhost:4173', deviceScaleFactor: 2, hasTouch: true, isMobile: true },
  projects: [
    { name: 'phone-390', use: { viewport: { width: 390, height: 844 } } },
    { name: 'phone-360', use: { viewport: { width: 360, height: 780 } } },
  ],
});
