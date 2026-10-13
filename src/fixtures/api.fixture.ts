import { test as base } from '@playwright/test';
import { ApiClient } from '@api/ApiClient';
import { MercadoLibreClient } from '@api/MercadoLibreClient';

export interface ApiFixtures {
  apiClient: ApiClient;
  mercadoLibreClient: MercadoLibreClient;
}

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => use(new ApiClient(request)),
  mercadoLibreClient: async ({ apiClient }, use) => use(new MercadoLibreClient(apiClient)),
});
