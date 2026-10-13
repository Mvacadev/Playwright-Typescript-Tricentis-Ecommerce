import type { ProductSnapshot, UserData } from '@app-types';
import { PURCHASABLE_PRODUCT_CANDIDATES } from '@data/products';
import type { RegisterPage } from '@pages/RegisterPage';
import { buildUser } from '@utils/userFactory';
import { test as pagesTest } from './pages.fixture';

export interface DataFixtures {
  /** Datos de un usuario nuevo, todavía no registrado. */
  newUser: UserData;
  /** Usuario registrado vía UI; el contexto queda sin sesión (listo para probar login). */
  registeredUser: UserData;
  /** Usuario registrado vía UI con la sesión iniciada (el registro autentica). */
  authenticatedUser: UserData;
  /**
   * Devuelve `count` productos comprables entre los candidatos, con nombre y precio capturados
   * en ejecución. Si no hay suficientes, el test se marca como omitido (Blocked por datos).
   */
  purchasableProducts: (count: number) => Promise<ProductSnapshot[]>;
}

async function registerViaUi(registerPage: RegisterPage, user: UserData): Promise<void> {
  await registerPage.open();
  await registerPage.register(user);
  await registerPage.expectRegistrationCompleted();
}

// Extiende pages.fixture porque el setup de usuarios y productos usa las páginas.
export const test = pagesTest.extend<DataFixtures>({
  newUser: async ({}, use) => use(buildUser()),

  registeredUser: async ({ registerPage }, use) => {
    const user = buildUser();
    await registerViaUi(registerPage, user);
    await registerPage.header.logout();
    await use(user);
  },

  authenticatedUser: async ({ registerPage }, use) => {
    const user = buildUser();
    await registerViaUi(registerPage, user);
    await registerPage.header.expectLoggedIn(user.email);
    await use(user);
  },

  purchasableProducts: async ({ productPage }, use, testInfo) => {
    await use(async (count) => {
      const found: ProductSnapshot[] = [];
      for (const slug of PURCHASABLE_PRODUCT_CANDIDATES) {
        if (found.length === count) break;
        await productPage.open(slug);
        if (await productPage.isPurchasable()) found.push(await productPage.snapshot());
      }
      testInfo.skip(
        found.length < count,
        `Blocked: se requieren ${count} productos comprables y se encontraron ${found.length}`,
      );
      return found;
    });
  },
});
