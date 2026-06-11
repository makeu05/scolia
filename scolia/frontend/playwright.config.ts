// playwright.config.ts — à la racine du projet React
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir:    './e2e',
  timeout:    30_000,
  retries:    1,
  workers:    2,

  use: {
    baseURL:       'http://localhost:5173', // URL de votre app React (vite dev)
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
    trace:         'on-first-retry',
    locale:        'fr-FR',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    // { name: 'mobile',   use: { ...devices['Pixel 5'] } },
  ],

  // Démarrer le serveur de dev automatiquement avant les tests
  webServer: {
    command: 'npm run dev',
    url:     'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
