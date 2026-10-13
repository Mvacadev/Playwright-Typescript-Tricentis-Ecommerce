import { expect, type Locator, type Page } from '@playwright/test';
import type { CartLine, Totals } from '@app-types';
import { readCartLines, readTotals } from '@utils/cartTable';
import { amountOf, roundMoney, sumMoney } from '@utils/money';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly content: Locator;
  readonly rows: Locator;
  readonly updateCartButton: Locator;
  readonly termsOfService: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.content = page.locator('.order-summary-content');
    this.rows = this.content.locator('table.cart tr.cart-item-row');
    this.updateCartButton = this.content.locator('input[name="updatecart"]');
    this.termsOfService = page.locator('#termsofservice');
    this.checkoutButton = page.locator('#checkout');
  }

  async open(): Promise<void> {
    await this.visit('/cart');
  }

  row(productName: string): Locator {
    return this.rows.filter({ has: this.page.locator('a.product-name', { hasText: productName }) });
  }

  async lines(): Promise<CartLine[]> {
    return readCartLines(this.content);
  }

  async totals(): Promise<Totals> {
    return readTotals(this.content);
  }

  async setQuantity(productName: string, quantity: number): Promise<void> {
    await this.row(productName).locator('input.qty-input').fill(String(quantity));
  }

  async updateCart(): Promise<void> {
    await this.updateCartButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.assertNoErrorPage();
  }

  /**
   * [ARIT] total de línea = precio unitario × cantidad; Sub-Total = suma de líneas.
   * Shipping/Total pueden mostrarse como texto ("Calculated during checkout"): no se convierten.
   */
  async expectArithmeticConsistency(): Promise<void> {
    const lines = await this.lines();
    for (const line of lines) {
      expect(line.total, `total de línea de "${line.name}"`).toBeCloseTo(roundMoney(line.unitPrice * line.quantity), 2);
    }
    const subTotal = amountOf(await this.totals(), 'Sub-Total');
    expect(subTotal, 'Sub-Total = suma de totales de línea').toBeCloseTo(sumMoney(lines.map((l) => l.total)), 2);
  }

  /** Los términos se validan solo en el cliente (Matriz F-01): se aceptan explícitamente. */
  async proceedToCheckout(): Promise<void> {
    await this.termsOfService.check();
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/\/onepagecheckout/);
    await this.assertNoErrorPage();
  }
}
