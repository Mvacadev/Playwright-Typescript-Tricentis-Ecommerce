import type { DisplayedAmount, Totals } from '@app-types';

/** Convierte un importe mostrado ("1,590.00", "$10.00") a número. Lanza si no es numérico. */
export function parseAmount(text: string): number {
  const normalized = text.replace(/[^\d.-]/g, '');
  const value = Number.parseFloat(normalized);
  if (normalized === '' || Number.isNaN(value)) {
    throw new Error(`Importe no numérico: "${text}"`);
  }
  return value;
}

/** Interpreta un importe que puede ser texto observado (p. ej. "Calculated during checkout"). */
export function parseDisplayedAmount(text: string): DisplayedAmount {
  const trimmed = text.trim();
  return /\d/.test(trimmed)
    ? { kind: 'amount', value: parseAmount(trimmed) }
    : { kind: 'text', text: trimmed };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function sumMoney(values: readonly number[]): number {
  return roundMoney(values.reduce((acc, v) => acc + v, 0));
}

/** Devuelve el importe numérico de una fila de totales o lanza si no existe / no es numérico. */
export function amountOf(totals: Totals, label: string): number {
  const row = totals[label];
  if (!row) throw new Error(`No existe la fila de totales "${label}". Filas: ${Object.keys(totals).join(', ')}`);
  if (row.kind !== 'amount') throw new Error(`La fila "${label}" no es numérica: "${row.text}"`);
  return row.value;
}

export function describeAmount(amount: DisplayedAmount | undefined): string {
  if (!amount) return '(no mostrado)';
  return amount.kind === 'amount' ? amount.value.toFixed(2) : amount.text;
}
