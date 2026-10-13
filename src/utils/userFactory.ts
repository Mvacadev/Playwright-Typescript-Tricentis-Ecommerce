import { randomBytes } from 'node:crypto';
import type { UserData } from '@app-types';

/** Identificador corto y único por ejecución (timestamp + aleatorio). */
export function uniqueId(): string {
  return `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;
}

/** Usuario ficticio con email único; la contraseña es descartable y no es un secreto real. */
export function buildUser(overrides: Partial<UserData> = {}): UserData {
  const id = uniqueId();
  return {
    gender: 'male',
    firstName: 'QA',
    lastName: `Tester${id.slice(-4)}`,
    email: `qa.${id}@example.com`,
    password: `Qa!${randomBytes(6).toString('hex')}`,
    ...overrides,
  };
}
