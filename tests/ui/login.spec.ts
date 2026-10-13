import { test } from '@fixtures';

test.describe('Login', () => {
  test(
    'TC-LOG-01 Login exitoso de un usuario nuevo y cierre de sesión',
    { tag: '@smoke', annotation: { type: 'case', description: 'TC-LOG-01 (usuario nuevo por ejecución)' } },
    async ({ loginPage, registeredUser }) => {
      await loginPage.open();
      await loginPage.login(registeredUser.email, registeredUser.password);
      await loginPage.header.expectLoggedIn(registeredUser.email);

      await test.step('Acceso a Mi cuenta', async () => {
        await loginPage.header.openMyAccount();
      });

      await test.step('Logout y ruta privada sin sesión', async () => {
        await loginPage.header.logout();
        await loginPage.header.expectLoggedOut();
        await loginPage.expectAccessRequiresLogin('/customer/info');
      });
    },
  );

  test(
    'TC-LOG-02 Login rechazado con contraseña faltante',
    { tag: '@smoke', annotation: { type: 'case', description: 'TC-LOG-02 (adaptado: contraseña vacía)' } },
    async ({ loginPage, registeredUser }) => {
      await loginPage.open();
      await loginPage.login(registeredUser.email, '');

      await loginPage.expectLoginRejected();
      await loginPage.header.expectLoggedOut();

      // El texto exacto es evidencia [OBS], no criterio de aprobación.
      test.info().annotations.push({ type: 'evidence [OBS]', description: await loginPage.errorMessage() });
    },
  );
});
