import type { Locator } from '@playwright/test';
import type { CartLine, Totals } from '@app-types';
import { parseAmount, parseDisplayedAmount } from './money';

/**
 * Lee las líneas de una tabla `table.cart` dentro de `scope`.
 * Se reutiliza en la página del carrito (cantidad editable) y en el resumen de confirmación
 * del checkout (cantidad como texto).
 */
export async function readCartLines(scope: Locator): Promise<CartLine[]> {
  const rows = scope.locator('table.cart tr.cart-item-row');
  const lines: CartLine[] = [];
  for (const row of await rows.all()) {
    const qtyCell = row.locator('td.qty');
    const qtyInput = qtyCell.locator('input.qty-input');
    const quantityText = (await qtyInput.count()) > 0 ? await qtyInput.inputValue() : await qtyCell.innerText();
    lines.push({
      name: (await row.locator('a.product-name').innerText()).trim(),
      unitPrice: parseAmount(await row.locator('.product-unit-price').innerText()),
      quantity: Number.parseInt(quantityText.trim(), 10),
      total: parseAmount(await row.locator('.product-subtotal').innerText()),
    });
  }
  return lines;
}

/** Lee la tabla `table.cart-total` como mapa etiqueta → importe (numérico o texto observado). */
export async function readTotals(scope: Locator): Promise<Totals> {
  const totals: Totals = {};
  for (const row of await scope.locator('table.cart-total tr').all()) {
    const label = (await row.locator('td.cart-total-left').innerText()).trim().replace(/:$/, '');
    const value = await row.locator('td.cart-total-right').innerText();
    totals[label] = parseDisplayedAmount(value);
  }
  return totals;
}
