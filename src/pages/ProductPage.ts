import { expect, type Locator, type Page } from '@playwright/test';
import type { ProductSnapshot } from '@app-types';
import { parseAmount } from '@utils/money';
import { BasePage } from './BasePage';

interface AddToCartResponse {
  success?: boolean;
  message?: string | string[];
}

export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly price: Locator;
  readonly quantity: Locator;
  readonly addToCartButton: Locator;
  readonly notification: Locator;

  private currentSlug = '';

  constructor(page: Page) {
    super(page);
    const details = page.locator('.product-essential');
    this.name = details.locator('.product-name h1');
    this.price = details.locator('.product-price span').first();
    this.quantity = details.locator('input.qty-input');
    this.addToCartButton = details.locator('input.add-to-cart-button');
    this.notification = page.locator('#bar-notification');
  }

  async open(slug: string): Promise<void> {
    await this.visit(`/${slug}`);
    this.currentSlug = slug;
  }

  /** "In stock" no alcanza: el botón Add to cart debe estar visible y habilitado. */
  async isPurchasable(): Promise<boolean> {
    return (await this.addToCartButton.isVisible()) && (await this.addToCartButton.isEnabled());
  }

  /** Captura nombre y precio mostrados en la ejecución actual. */
  async snapshot(): Promise<ProductSnapshot> {
    return {
      slug: this.currentSlug,
      name: (await this.name.innerText()).trim(),
      unitPrice: parseAmount(await this.price.innerText()),
    };
  }

  /**
   * Agrega el producto y valida la respuesta AJAX: la aplicación devuelve HTTP 200 también
   * ante errores de negocio (`success:false`), por lo que se asierta el cuerpo (Matriz §5.1).
   */
  async addToCart(quantity = 1): Promise<void> {
    await this.quantity.fill(String(quantity));
    const responsePromise = this.page.waitForResponse(
      (r) => r.url().includes('/addproducttocart/details/') && r.request().method() === 'POST',
    );
    await this.addToCartButton.click();
    const body = (await (await responsePromise).json()) as AddToCartResponse;
    expect(body.success, `add to cart falló: ${JSON.stringify(body.message)}`).toBe(true);
  }
}
