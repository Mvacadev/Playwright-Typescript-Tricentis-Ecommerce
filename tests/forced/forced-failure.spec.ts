import { expect, test } from '@fixtures';

/**
 * Punto 4: falla deliberada y controlada. Demuestra la captura automática de pantalla,
 * el trace y el video en el reporte HTML. Se excluye de los proyectos chromium/firefox y
 * se ejecuta solo con `npm run test:forced`.
 */
test(
  'FORCED-01 Falla controlada: el login muestra un título inexistente',
  {
    tag: '@forced-failure',
    annotation: { type: 'forced-failure', description: 'Falla intencional; no representa un defecto del producto' },
  },
  async ({ loginPage, page }) => {
    await loginPage.open();
    await expect(page.locator('.page-title h1'), 'aserción falsa a propósito').toHaveText('Forced failure: this title does not exist', {
      timeout: 3_000,
    });
  },
);
