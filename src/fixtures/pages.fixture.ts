import { test as base } from '@playwright/test';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { LoginPage } from '@pages/LoginPage';
import { ProductPage } from '@pages/ProductPage';
import { RegisterPage } from '@pages/RegisterPage';

export interface PageFixtures {
  registerPage: RegisterPage;
  loginPage: LoginPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
}

export const test = base.extend<PageFixtures>({
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});
