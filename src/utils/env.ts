import 'dotenv/config';

/** Configuración de ambiente. Valores por defecto seguros; sobrescribibles vía `.env`. */
export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://demowebshop.tricentis.com',
  mlDepartmentsUrl: process.env.ML_DEPARTMENTS_URL ?? 'https://www.mercadolibre.com.ar/menu/departments',
} as const;
