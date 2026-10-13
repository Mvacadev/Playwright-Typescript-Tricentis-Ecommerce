import type { ApiResponse, MlDepartmentsResponse } from '@app-types';
import { env } from '@utils/env';
import type { ApiClient } from './ApiClient';

/**
 * El endpoint responde 403 a clientes sin User-Agent de navegador (observado con curl),
 * por eso se envían headers explícitos.
 */
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  Accept: 'application/json',
  'Accept-Language': 'es-AR,es;q=0.9',
};

export class MercadoLibreClient {
  constructor(
    private readonly api: ApiClient,
    private readonly departmentsUrl: string = env.mlDepartmentsUrl,
  ) {}

  async getDepartments(): Promise<ApiResponse<MlDepartmentsResponse>> {
    return this.api.get<MlDepartmentsResponse>(this.departmentsUrl, { headers: BROWSER_HEADERS });
  }
}
