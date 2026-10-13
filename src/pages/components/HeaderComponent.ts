import { expect, type Locator, type Page } from '@playwright/test';

/** Header común a todas las páginas: estado de sesión, contador de carrito y búsqueda. */
export class HeaderComponent {
  readonly accountLink: Locator;
  readonly logoutLink: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly cartLink: Locator;
  readonly cartQty: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(private readonly page: Page) {
    const links = page.locator('.header-links');
    this.accountLink = links.locator('a.account');
    this.logoutLink = links.locator('a.ico-logout');
    this.loginLink = links.locator('a.ico-login');
    this.registerLink = links.locator('a.ico-register');
    this.cartLink = links.locator('a.ico-cart');
    this.cartQty = links.locator('a.ico-cart .cart-qty');
    this.searchInput = page.locator('#small-searchterms');
    this.searchButton = page.locator('.search-box input[type="submit"]');
  }

  async expectLoggedIn(email: string): Promise<void> {
    await expect(this.accountLink, 'el header muestra el email de la cuenta').toHaveText(email);
    await expect(this.logoutLink).toBeVisible();
    await expect(this.loginLink).toBeHidden();
    await expect(this.registerLink).toBeHidden();
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.loginLink).toBeVisible();
    await expect(this.registerLink).toBeVisible();
    await expect(this.logoutLink).toBeHidden();
    await expect(this.accountLink).toBeHidden();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await expect(this.loginLink).toBeVisible();
  }

  async openMyAccount(): Promise<void> {
    await this.accountLink.click();
    await expect(this.page).toHaveURL(/\/customer\/info/);
  }

  /** El contador del header suma cantidades, no líneas (Matriz §13.2). */
  async expectCartQty(quantity: number): Promise<void> {
    await expect(this.cartQty, 'contador del carrito en el header').toHaveText(`(${quantity})`);
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/\/cart/);
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }
}
