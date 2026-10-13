import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly rememberMe: Locator;
  readonly loginButton: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.locator('#Email');
    this.password = page.locator('#Password');
    this.rememberMe = page.locator('#RememberMe');
    this.loginButton = page.locator('input.login-button');
    this.errorSummary = page.locator('.validation-summary-errors');
  }

  async open(): Promise<void> {
    await this.visit('/login');
    await expect(this.loginButton).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  /** Rechazo funcional: sigue en /login, hay feedback de error y no hay soft-error. */
  async expectLoginRejected(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.errorSummary, 'feedback de login fallido').toBeVisible();
    await expect(this.errorSummary).not.toBeEmpty();
    await this.assertNoErrorPage();
  }

  /** Texto exacto del error, para registrarlo como evidencia [OBS] (no como requisito). */
  async errorMessage(): Promise<string> {
    return (await this.errorSummary.innerText()).trim();
  }

  /** Una ruta privada sin sesión debe redirigir al login. */
  async expectAccessRequiresLogin(protectedPath: string): Promise<void> {
    await this.page.goto(protectedPath);
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.loginButton).toBeVisible();
  }
}
