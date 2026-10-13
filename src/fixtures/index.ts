import { mergeTests } from '@playwright/test';
import { test as apiTest } from './api.fixture';
import { test as dataTest } from './data.fixture';
import { test as pagesTest } from './pages.fixture';

/** Punto de entrada único para los specs: páginas + API + datos. */
export const test = mergeTests(pagesTest, apiTest, dataTest);
export { expect } from '@playwright/test';
