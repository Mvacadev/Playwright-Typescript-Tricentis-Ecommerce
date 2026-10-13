import type { AddressData, CheckoutOptions } from '@app-types';

/** Dirección ficticia (no corresponde a una persona real). */
export const TEST_ADDRESS: AddressData = {
  country: 'United States',
  state: 'New York',
  city: 'New York',
  address1: '123 Test St',
  zipPostalCode: '10001',
  phoneNumber: '5550101',
};

/** Camino de compra seguro: Check / Money Order es no transaccional (TEST_PLAN_v2 §4.1). */
export const DEFAULT_CHECKOUT: CheckoutOptions = {
  address: TEST_ADDRESS,
  shippingMethod: 'Ground',
  paymentMethod: 'Payments.CheckMoneyOrder',
};
