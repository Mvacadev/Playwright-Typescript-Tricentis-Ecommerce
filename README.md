# Playwright + TypeScript — Tricentis Demo Web Shop

Framework de pruebas automatizadas para https://demowebshop.tricentis.com/ y un test de API contra Mercado Libre.
Base documental: `TEST_PLAN_v2.md`, `MATRIZ_DE_CONOCIMIENTO_TECNICO_Y_MODULOS.md` y `CASOS_LOGIN_CARRITO_REVISADOS.md`.

## Requisitos e instalación

```bash
npm install
npx playwright install chromium firefox
cp .env.example .env   # opcional: sobrescribe BASE_URL / ML_DEPARTMENTS_URL
```

## Ejecución

| Script | Qué ejecuta |
|---|---|
| `npm test` | UI en Chromium + API (sin la falla forzada) |
| `npm run test:smoke` | Tests `@smoke` en Chromium |
| `npm run test:regression` | `@smoke` y `@regression` en Chromium y Firefox |
| `npm run test:api` | Test de Mercado Libre |
| `npm run test:forced` | Solo la falla controlada (`@forced-failure`) |
| `npm run report` | Abre el último reporte HTML |
| `npm run typecheck` | Verificación de tipos (`tsc --noEmit`) |

`npx playwright test` sin filtros ejecuta **todos** los proyectos, incluida la falla forzada.

## Estructura

```
src/
├── pages/            BasePage, components/HeaderComponent, Register/Login/Product/Cart/CheckoutPage
├── fixtures/         pages.fixture, api.fixture, data.fixture → index.ts (mergeTests)
├── api/              ApiClient (wrapper tipado sobre APIRequestContext), MercadoLibreClient
├── data/             productos candidatos y datos de checkout
├── utils/            env, money, userFactory, cartTable
└── types/            tipos de dominio y de API
tests/
├── ui/               register, login, cart-checkout
├── api/              mercadolibre
└── forced/           forced-failure
```

## Cobertura

| Test | Tag | Fuente |
|---|---|---|
| S-01 Registro exitoso | `@smoke` | TEST_PLAN_v2 |
| S-06 / REG-03 Registro con datos faltantes | `@smoke` | TEST_PLAN_v2 |
| TC-LOG-01 Login exitoso (usuario nuevo) y logout | `@smoke` | Casos revisados |
| TC-LOG-02 Login con contraseña faltante | `@smoke` | Casos revisados (adaptado) |
| TC-CART-01 Agregar dos productos + checkout | `@smoke` | Casos revisados + S-07 |
| TC-CART-02 Actualizar cantidad + checkout | `@regression` | Casos revisados + S-07 |
| API-ML-01 GET departments | `@api` | Challenge, punto 6 |
| FORCED-01 Falla controlada | `@forced-failure` | Challenge, punto 4 |

## Decisiones de diseño

- **Usuarios nuevos por test:** se registran vía UI en fixtures (`registeredUser`, `authenticatedUser`). No hay credenciales en el repositorio.
- **Productos dinámicos:** no se fijan IDs ni precios. Se validan candidatos en ejecución (botón *Add to cart* visible y habilitado) y se captura el precio. Si no hay suficientes, el test queda **omitido como Blocked**.
- **Oráculos:** los totales se verifican aritméticamente `[ARIT]`. Los textos observados (mensaje de login, Shipping/Total del carrito) se guardan como anotaciones `evidence [OBS]` en el reporte, no como criterio de aprobación.
- **Errores con HTTP 200:** la aplicación devuelve errores de negocio con status 200 y redirige excepciones a `/errorpage.htm`. Por eso se asierta el cuerpo JSON (add to cart, pasos del checkout) y la URL final.
- **Checkout seguro:** usuario registrado, envío *Ground* y pago *Check / Money Order* (no transaccional).
- **Ejecución secuencial** (`workers: 1`) y **sin retries**. El paralelismo queda para una versión futura.

## Evidencia ante fallas

- Captura de página completa automática solo en fallos (`screenshot: only-on-failure`).
- Trace y video se conservan solo en fallos (`retain-on-failure`).
- Todo se adjunta al reporte HTML en `playwright-report/`.

**Nota:** el trace registra los valores escritos con `fill()`, incluidas las contraseñas. Son descartables y se generan en cada ejecución para cuentas de prueba; aun así, no compartas traces fuera del equipo.
