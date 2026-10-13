import type { APIRequestContext } from '@playwright/test';
import type { ApiResponse } from '@app-types';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

/** Cliente HTTP genérico sobre `APIRequestContext` con respuesta tipada y medición de latencia. */
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly defaultHeaders: Record<string, string> = {},
  ) {}

  async get<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const started = Date.now();
    const response = await this.request.get(url, {
      ...options,
      headers: { ...this.defaultHeaders, ...options.headers },
    });
    const durationMs = Date.now() - started;
    const headers = response.headers();
    const text = await response.text();
    const isJson = (headers['content-type'] ?? '').includes('application/json');

    return {
      url: response.url(),
      status: response.status(),
      ok: response.ok(),
      headers,
      durationMs,
      body: isJson ? (JSON.parse(text) as T) : null,
      text,
    };
  }
}
