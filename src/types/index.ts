export type Gender = 'male' | 'female';

export interface UserData {
  gender: Gender;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Campos del formulario de registro (coinciden con `data-valmsg-for`). */
export type RegisterField = 'FirstName' | 'LastName' | 'Email' | 'Password' | 'ConfirmPassword';

export interface AddressData {
  country: string;
  state: string;
  city: string;
  address1: string;
  zipPostalCode: string;
  phoneNumber: string;
}

export interface CheckoutOptions {
  address: AddressData;
  /** Prefijo del valor del radio de envío, p. ej. `Ground` → `Ground___Shipping.FixedRate`. */
  shippingMethod: string;
  /** System name del método de pago, p. ej. `Payments.CheckMoneyOrder`. */
  paymentMethod: string;
}

/** Producto comprable identificado en tiempo de ejecución (precio capturado, no fijo). */
export interface ProductSnapshot {
  slug: string;
  name: string;
  unitPrice: number;
}

export interface CartLine {
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

/** Importe mostrado: numérico o texto observado (p. ej. "Calculated during checkout"). */
export type DisplayedAmount =
  | { kind: 'amount'; value: number }
  | { kind: 'text'; text: string };

/** Filas de totales indexadas por etiqueta normalizada (`Sub-Total`, `Shipping`, `Total`...). */
export type Totals = Record<string, DisplayedAmount>;

export interface OrderSummary {
  lines: CartLine[];
  totals: Totals;
}

export interface OrderConfirmation {
  orderNumber: string;
  summary: OrderSummary;
}

export interface ApiResponse<T> {
  url: string;
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  durationMs: number;
  /** Cuerpo parseado como JSON si el Content-Type lo indica; si no, `null`. */
  body: T | null;
  text: string;
}

export interface MlCategory {
  id: string;
  name: string;
  permalink: string;
  children_categories?: MlCategory[];
}

export interface MlDepartment {
  name: string;
  categories: MlCategory[];
}

export interface MlDepartmentsResponse {
  departments: MlDepartment[];
}
