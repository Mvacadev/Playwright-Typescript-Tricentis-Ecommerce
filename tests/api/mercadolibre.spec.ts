import { expect, test } from '@fixtures';

test.describe('API Mercado Libre', () => {
  test(
    'API-ML-01 GET /menu/departments contiene "departments"',
    { tag: '@api', annotation: { type: 'case', description: 'Punto 6 del challenge' } },
    async ({ mercadoLibreClient }) => {
      const response = await mercadoLibreClient.getDepartments();
      test.info().annotations.push({ type: 'latency', description: `${response.durationMs} ms` });

      expect(response.status, `status de ${response.url}`).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.text).toContain('departments');

      expect(response.body).toHaveProperty('departments');
      expect(Array.isArray(response.body?.departments)).toBe(true);
      expect(response.body?.departments.length).toBeGreaterThan(0);
    },
  );
});
