import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  expect: { timeout: 5000 },
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: fileURLToPath(new URL('./.artifacts/browser-results.json', import.meta.url)) }]
  ],
  use: {
    channel: process.platform === 'win32' ? 'msedge' : undefined,
    headless: true,
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
    trace: 'retain-on-failure'
  }
});