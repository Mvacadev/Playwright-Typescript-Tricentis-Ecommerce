import { test } from '@fixtures';

test.describe('Registro', () => {
  test(
    'S-01 Registro exitoso de un usuario nuevo',
    { tag: '@smoke', annotation: { type: 'case', description: 'S-01 (TEST_PLAN_v2)' } },
    async ({ registerPage, newUser }) => {
      await registerPage.open();
      await registerPage.register(newUser);

      await registerPage.expectRegistrationCompleted();
      await registerPage.header.expectLoggedIn(newUser.email);
    },
  );

  test(
    'S-06 / REG-03 Registro rechazado con datos obligatorios faltantes',
    { tag: '@smoke', annotation: { type: 'case', description: 'S-06 / REG-03 (TEST_PLAN_v2)' } },
    async ({ registerPage, newUser }) => {
      const { lastName: _lastName, email: _email, ...incompleteUser } = newUser;

      await registerPage.open();
      await registerPage.fillForm(incompleteUser);
      await registerPage.submit();

      await registerPage.expectFieldErrorsOnly(['LastName', 'Email']);
      await registerPage.expectNotRegistered();
      await registerPage.header.expectLoggedOut();
    },
  );
});
