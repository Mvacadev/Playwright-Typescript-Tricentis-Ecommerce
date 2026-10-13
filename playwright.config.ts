import { defineConfig, devices } from '@playwright/test';
import { env } from './src/utils/env';

const FORCED_FAILURE_TAG = /@forced-failure/;

export default defineConfig({
  testDir: './tests',
  // v1: ejecución secuencial. El paralelismo queda para una versión futura.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  // TEST_PLAN_v2 §7: no reintentar fallos funcionales para convertirlos en verde.
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 10_000 },

  // Punto 5: reporte HTML nativo (interactivo) + salida de consola.
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: env.baseUrl,
    // Punto 2: captura automática (página completa) solo cuando el test falla.
    screenshot: { mode: 'only-on-failure', fullPage: true },
    // Trace y video solo se conservan en fallos. El trace registra los valores de fill():
    // las contraseñas son descartables y generadas por ejecución (ver README).
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  projects: [
    {
      name: 'chromium',
      testDir: './tests/ui',
      grepInvert: FORCED_FAILURE_TAG,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      grepInvert: FORCED_FAILURE_TAG,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
    },
    {
      // Punto 4: falla controlada, se ejecuta solo de forma explícita (npm run test:forced).
      name: 'forced-failure',
      testDir: './tests/forced',
      grep: FORCED_FAILURE_TAG,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
