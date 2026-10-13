import { expect, type Locator, type Page } from '@playwright/test';
import type { AddressData, CheckoutOptions, OrderConfirmation, OrderSummary } from '@app-types';
import { readCartLines, readTotals } from '@utils/cartTable';
import { BasePage } from './BasePage';

/** Respuesta JSON de los endpoints `/checkout/OpcSave*` (Matriz §M8). */
interface OpcResponse {
  goto_section?: string;
  update_section?: { name: string };
  wrong_billing_address?: boolean;
  error?: number;
  message?: string;
}

/** One Page Checkout para un usuario registrado sin direcciones guardadas. */
export class CheckoutPage extends BasePage {
  readonly billingCountry: Locator;
  readonly billingState: Locator;
  readonly billingCity: Locator;
  readonly billingAddress1: Locator;
  readonly billingZip: Locator;
  readonly billingPhone: Locator;
  readonly billingContinue: Locator;
  readonly shippingContinue: Locator;
  readonly shippingMethodContinue: Locator;
  readonly paymentMethodContinue: Locator;
  readonly paymentInfoContinue: Locator;
  readonly confirmButton: Locator;
  readonly confirmSection: Locator;
  readonly completedTitle: Locator;
  readonly completedDetails: Locator;

  constructor(page: Page) {
    super(page);
    this.billingCountry = page.locator('#BillingNewAddress_CountryId');
    this.billingState = page.locator('#BillingNewAddress_StateProvinceId');
    this.billingCity = page.locator('#BillingNewAddress_City');
    this.billingAddress1 = page.locator('#BillingNewAddress_Address1');
    this.billingZip = page.locator('#BillingNewAddress_ZipPostalCode');
    this.billingPhone = page.locator('#BillingNewAddress_PhoneNumber');
    this.billingContinue = page.locator('#billing-buttons-container .new-address-next-step-button');
    this.shippingContinue = page.locator('#shipping-buttons-container .new-address-next-step-button');
    this.shippingMethodContinue = page.locator('#shipping-method-buttons-container .shipping-method-next-step-button');
    this.paymentMethodContinue = page.locator('#payment-method-buttons-container .payment-method-next-step-button');
    this.paymentInfoContinue = page.locator('#payment-info-buttons-container .payment-info-next-step-button');
    this.confirmButton = page.locator('#confirm-order-buttons-container .confirm-order-next-step-button');
    this.confirmSection = page.locator('#checkout-step-confirm-order');
    this.completedTitle = page.locator('.order-completed .title');
    this.completedDetails = page.locator('.order-completed .details');
  }

  async fillBillingAddress(address: AddressData): Promise<void> {
    await this.billingCountry.selectOption({ label: address.country });
    // Los estados se cargan por AJAX al cambiar el país (/country/getstatesbycountryid).
    await expect(this.billingState.locator('option', { hasText: address.state })).toHaveCount(1);
    await this.billingState.selectOption({ label: address.state });
    await this.billingCity.fill(address.city);
    await this.billingAddress1.fill(address.address1);
    await this.billingZip.fill(address.zipPostalCode);
    await this.billingPhone.fill(address.phoneNumber);
  }

  async saveBilling(): Promise<void> {
    await this.saveStep(this.billingContinue, 'OpcSaveBilling', 'shipping');
  }

  /** Usa la dirección de facturación recién creada (seleccionada por defecto). */
  async saveShipping(): Promise<void> {
    await this.saveStep(this.shippingContinue, 'OpcSaveShipping', 'shipping_method');
  }

  async selectShippingMethod(method: string): Promise<void> {
    await this.page.locator(`input[name="shippingoption"][value^="${method}___"]`).check();
    await this.saveStep(this.shippingMethodContinue, 'OpcSaveShippingMethod', 'payment_method');
  }

  async selectPaymentMethod(systemName: string): Promise<void> {
    await this.page.locator(`input[name="paymentmethod"][value="${systemName}"]`).check();
    await this.saveStep(this.paymentMethodContinue, 'OpcSavePaymentMethod', 'payment_info');
  }

  async savePaymentInfo(): Promise<void> {
    await this.saveStep(this.paymentInfoContinue, 'OpcSavePaymentInfo', 'confirm_order');
  }

  /** Resumen mostrado en el paso Confirm, antes de confirmar la orden. */
  async orderSummary(): Promise<OrderSummary> {
    await expect(this.confirmSection.locator('table.cart')).toBeVisible();
    return {
      lines: await readCartLines(this.confirmSection),
      totals: await readTotals(this.confirmSection),
    };
  }

  /**
   * Tras `OpcConfirmOrder` el cliente navega de inmediato a `/checkout/completed/`, por lo que
   * el cuerpo JSON ya no es legible: el oráculo es la página de confirmación con el número de orden.
   * Ante un error (`error:1`) la aplicación no navega y la aserción de URL falla.
   */
  async confirmOrder(): Promise<string> {
    const responsePromise = this.page.waitForResponse(
      (r) => r.url().includes('/checkout/OpcConfirmOrder') && r.request().method() === 'POST',
    );
    await this.confirmButton.click();
    expect((await responsePromise).status(), 'OpcConfirmOrder status').toBe(200);

    await expect(this.page).toHaveURL(/\/checkout\/completed/);
    await this.assertNoErrorPage();
    await expect(this.completedTitle).toHaveText('Your order has been successfully processed!');
    const details = await this.completedDetails.innerText();
    const orderNumber = /Order number:\s*(\d+)/i.exec(details)?.[1];
    if (!orderNumber) throw new Error(`No se encontró el número de orden en: "${details}"`);
    return orderNumber;
  }

  /** Recorre todos los pasos del checkout y confirma la orden. */
  async completeOrder(options: CheckoutOptions): Promise<OrderConfirmation> {
    await this.fillBillingAddress(options.address);
    await this.saveBilling();
    await this.saveShipping();
    await this.selectShippingMethod(options.shippingMethod);
    await this.selectPaymentMethod(options.paymentMethod);
    await this.savePaymentInfo();
    const summary = await this.orderSummary();
    const orderNumber = await this.confirmOrder();
    return { orderNumber, summary };
  }

  /**
   * Cada paso responde HTTP 200 aun con error (`error:1`, `wrong_billing_address`):
   * se valida el cuerpo y la sección siguiente esperada.
   */
  private async saveStep(button: Locator, endpoint: string, expectedNextSection: string): Promise<void> {
    const responsePromise = this.waitForOpcResponse(endpoint);
    await button.click();
    const body = await responsePromise;
    expect(body.error, `${endpoint} devolvió error: ${body.message ?? ''}`).toBeUndefined();
    expect(body.wrong_billing_address, `${endpoint}: dirección rechazada`).toBeUndefined();
    expect(body.goto_section, `${endpoint}: sección siguiente`).toBe(expectedNextSection);
  }

  private async waitForOpcResponse(endpoint: string): Promise<OpcResponse> {
    const response = await this.page.waitForResponse(
      (r) => r.url().includes(`/checkout/${endpoint}`) && r.request().method() === 'POST',
    );
    return (await response.json()) as OpcResponse;
  }
}
