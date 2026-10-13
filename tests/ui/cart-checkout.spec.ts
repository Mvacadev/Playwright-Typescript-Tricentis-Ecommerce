import type { CartLine, OrderConfirmation, ProductSnapshot, Totals } from '@app-types';
import { DEFAULT_CHECKOUT } from '@data/checkout.data';
import { expect, test } from '@fixtures';
import { amountOf, describeAmount, sumMoney } from '@utils/money';

/** [ARIT] El resumen de Confirm refleja productos y cantidades del carrito y su total es coherente. */
function expectOrderMatchesCart(order: OrderConfirmation, cartLines: CartLine[]): void {
  const byName = (lines: CartLine[]) =>
    lines.map(({ name, quantity }) => ({ name, quantity })).sort((a, b) => a.name.localeCompare(b.name));
  expect(byName(order.summary.lines), 'productos y cantidades del resumen').toEqual(byName(cartLines));

  const { Total: _total, ...components } = order.summary.totals;
  const numericComponents = Object.values(components).flatMap((a) => (a.kind === 'amount' ? [a.value] : []));
  expect(amountOf(order.summary.totals, 'Total'), 'Total = suma de componentes').toBeCloseTo(sumMoney(numericComponents), 2);
  expect(order.orderNumber).toMatch(/^\d+$/);
}

/** [OBS] Shipping/Total del carrito pueden ser texto ("Calculated during checkout"): se registran. */
function recordObservedTotals(totals: Totals): void {
  for (const label of ['Shipping', 'Total']) {
    test.info().annotations.push({
      type: 'evidence [OBS]',
      description: `Carrito ${label}: ${describeAmount(totals[label])}`,
    });
  }
}

test.describe('Carrito y checkout (usuario registrado)', () => {
  test(
    'TC-CART-01 Agregar dos productos al carrito y completar el checkout',
    { tag: '@smoke', annotation: { type: 'case', description: 'TC-CART-01 + S-07' } },
    async ({ authenticatedUser: _user, purchasableProducts, productPage, cartPage, checkoutPage }) => {
      const products = await purchasableProducts(2);

      await test.step('Agregar productos al carrito', async () => {
        for (const product of products) {
          await productPage.open(product.slug);
          await productPage.addToCart();
        }
        await productPage.header.expectCartQty(2);
      });

      const cartLines = await test.step('Verificar el carrito', async () => {
        await cartPage.open();
        const lines = await cartPage.lines();
        expect(lines).toHaveLength(2);
        for (const product of products) {
          expectLine(lines, product, 1);
        }
        await cartPage.expectArithmeticConsistency();
        recordObservedTotals(await cartPage.totals());
        return lines;
      });

      const order = await test.step('Checkout E2E', async () => {
        await cartPage.proceedToCheckout();
        return checkoutPage.completeOrder(DEFAULT_CHECKOUT);
      });

      expectOrderMatchesCart(order, cartLines);
      test.info().annotations.push({ type: 'order', description: order.orderNumber });
    },
  );

  test(
    'TC-CART-02 Actualizar la cantidad del carrito y completar el checkout',
    { tag: '@regression', annotation: { type: 'case', description: 'TC-CART-02 + S-07' } },
    async ({ authenticatedUser: _user, purchasableProducts, productPage, cartPage, checkoutPage }) => {
      const [product] = await purchasableProducts(1);
      if (!product) throw new Error('purchasableProducts no devolvió productos');

      await productPage.open(product.slug);
      await productPage.addToCart();

      const cartLines = await test.step('Actualizar cantidad a 2', async () => {
        await cartPage.open();
        expectLine(await cartPage.lines(), product, 1);

        await cartPage.setQuantity(product.name, 2);
        await cartPage.updateCart();

        const lines = await cartPage.lines();
        expectLine(lines, product, 2);
        await cartPage.expectArithmeticConsistency();
        await cartPage.header.expectCartQty(2);
        recordObservedTotals(await cartPage.totals());
        return lines;
      });

      const order = await test.step('Checkout E2E', async () => {
        await cartPage.proceedToCheckout();
        return checkoutPage.completeOrder(DEFAULT_CHECKOUT);
      });

      expectOrderMatchesCart(order, cartLines);
      test.info().annotations.push({ type: 'order', description: order.orderNumber });
    },
  );
});

/** La línea existe, con el precio capturado en la ficha y la cantidad esperada. */
function expectLine(lines: CartLine[], product: ProductSnapshot, quantity: number): void {
  const line = lines.find((l) => l.name === product.name);
  expect(line, `línea de "${product.name}" en el carrito`).toBeDefined();
  expect(line?.quantity).toBe(quantity);
  expect(line?.unitPrice, 'precio unitario = precio capturado en la ficha').toBeCloseTo(product.unitPrice, 2);
}
