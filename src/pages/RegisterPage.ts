import { expect, type Locator, type Page } from '@playwright/test';
import type { RegisterField, UserData } from '@app-types';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly genderMale: Locator;
  readonly genderFemale: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly registerButton: Locator;
  readonly result: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.genderMale = page.locator('#gender-male');
    this.genderFemale = page.locator('#gender-female');
    this.firstName = page.locator('#FirstName');
    this.lastName = page.locator('#LastName');
    this.email = page.locator('#Email');
    this.password = page.locator('#Password');
    this.confirmPassword = page.locator('#ConfirmPassword');
    this.registerButton = page.locator('#register-button');
    this.result = page.locator('.registration-result-page .result');
    this.continueButton = page.locator('input.register-continue-button');
  }

  async open(): Promise<void> {
    await this.visit('/register');
  }

  /** Completa solo los campos provistos (permite simular datos faltantes). */
  async fillForm(user: Partial<UserData>): Promise<void> {
    if (user.gender) await (user.gender === 'male' ? this.genderMale : this.genderFemale).check();
    if (user.firstName !== undefined) await this.firstName.fill(user.firstName);
    if (user.lastName !== undefined) await this.lastName.fill(user.lastName);
    if (user.email !== undefined) await this.email.fill(user.email);
    if (user.password !== undefined) {
      await this.password.fill(user.password);
      await this.confirmPassword.fill(user.password);
    }
  }

  async submit(): Promise<void> {
    await this.registerButton.click();
  }

  async register(user: UserData): Promise<void> {
    await this.fillForm(user);
    await this.submit();
  }

  async expectRegistrationCompleted(): Promise<void> {
    await expect(this.page).toHaveURL(/\/registerresult\//);
    await expect(this.result).toHaveText('Your registration completed');
    await this.assertNoErrorPage();
  }

  fieldError(field: RegisterField): Locator {
    return this.page.locator(`.field-validation-error[data-valmsg-for="${field}"]`);
  }

  /** Verifica errores en los campos indicados y ausencia de errores en el resto. */
  async expectFieldErrorsOnly(fields: readonly RegisterField[]): Promise<void> {
    const all: readonly RegisterField[] = ['FirstName', 'LastName', 'Email', 'Password', 'ConfirmPassword'];
    for (const field of all) {
      if (fields.includes(field)) {
        await expect(this.fieldError(field), `error de validación en ${field}`).toHaveText(/required/i);
      } else {
        await expect(this.fieldError(field), `sin error de validación en ${field}`).toHaveCount(0);
      }
    }
  }

  async expectNotRegistered(): Promise<void> {
    await expect(this.page).toHaveURL(/\/register$/);
    await expect(this.result).toBeHidden();
  }
}
