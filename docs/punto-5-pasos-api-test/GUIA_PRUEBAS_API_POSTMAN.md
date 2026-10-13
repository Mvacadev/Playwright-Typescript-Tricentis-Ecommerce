# GUÍA DE PRUEBAS DE API CON POSTMAN — Tricentis Demo Web Shop
**Aplicación:** https://demowebshop.tricentis.com/ (nopCommerce · ASP.NET MVC 5.2 · IIS 10)
**Versión:** 1.0 · **Fecha:** 13/10/2026 · **Estrategia:** POISED
**Audiencia:** QA manual (sin experiencia previa en automatización)

**Entregables asociados (carpeta `postman/`):**

| Archivo | Contenido |
|---|---|
| `DemoWebShop_API_QA.postman_collection.json` | Colección Postman v2.1: 6 carpetas, 38 requests, scripts pre-request y de tests |
| `DemoWebShop_demo-public.postman_environment.json` | Entorno del demo público (variables y secrets vacíos) |
| `DemoWebShop_staging-TEMPLATE.postman_environment.json` | Plantilla para un entorno adicional (sin URL real; ver §8) |

**Fuentes:** `MATRIZ_DE_CONOCIMIENTO_TECNICO_Y_MODULOS.md` (Fase 1), `TEST_PLAN_v2.md`, `ESPECIFICACION_CASOS_LOGIN_CARRITO.md`, `REPORTE_DE_DEFECTO.md` y una re-verificación en la plataforma el 13/10/2026.

---

## 0. Antes de empezar: qué tipo de “API” tiene esta aplicación

Hay que entender esto antes de diseñar las pruebas, porque cambia cómo se valida todo:

| Característica | Realidad de Demo Web Shop | Consecuencia para las pruebas |
|---|---|---|
| Tipo de API | **No hay API REST pública ni documentación (Swagger/OpenAPI).** Son endpoints MVC que usa el propio sitio: unos devuelven **JSON** (AJAX) y otros **HTML** (formularios) | Los endpoints se descubren explorando (§1), no leyendo documentación |
| Formato de request | `application/x-www-form-urlencoded` (formularios). **Un body JSON se ignora** (verificado: la cantidad enviada en JSON no se aplicó) | En Postman siempre usar **Body → x-www-form-urlencoded** |
| Autenticación | **Cookie de sesión** (forms authentication), no tokens Bearer ni API keys | Postman maneja la sesión con su **cookie jar**; no hay header `Authorization` |
| Códigos de estado | Los errores de negocio responden **HTTP 200** (`success:false`, `error:1`). Las excepciones redirigen a `/errorpage.htm` | **Nunca** aprobar un test solo por el status 200 (§3.6) |
| Redirecciones | Login exitoso, logout y rutas privadas responden **302** | Desactivar “Follow redirects” en los requests donde el 302 es lo que se valida |
| Antiforgery (CSRF) | `/register` y `/customer/info` exigen `__RequestVerificationToken`. **`/login` y `/cart` no** (F-03) | Para registro, obtener el token antes con un GET (§3.5) |

> **Etiquetas de oráculo** (igual que en el resto del proyecto): **[OBS]** observado en la plataforma · **[HIP]** hipótesis de QA · **[REQ?]** requiere decisión de negocio · **F-xx / DEF-xx / N-xx** hallazgos ya documentados.

---

## 1. Fase 1 — Exploración de la plataforma para descubrir endpoints

**Objetivo:** construir el inventario de endpoints (URL, verbo, parámetros, formato de respuesta) observando lo que hace el navegador.

### 1.1 Herramientas
- Google Chrome o Firefox con **DevTools** (F12).
- Opcional: **Postman Interceptor** o el **Proxy de Postman** para capturar tráfico directamente en una colección.

### 1.2 Paso a paso
1. Abrir https://demowebshop.tricentis.com/ en Chrome.
2. Abrir DevTools (**F12**) → pestaña **Network**. Marcar **Preserve log** y **Disable cache**.
3. Filtrar por **Fetch/XHR** para ver las llamadas AJAX (JSON). Quitar el filtro (**All**/**Doc**) para ver los POST de formularios.
4. Recorrer cada funcionalidad y anotar cada request nuevo:

| Acción en el sitio | Request que aparece en Network |
|---|---|
| Escribir “com” en el buscador | `GET /catalog/searchtermautocomplete?term=com` |
| Click en “Add to cart” en un listado | `POST /addproducttocart/catalog/13/1/1` |
| Click en “Add to cart” en una ficha | `POST /addproducttocart/details/13/1` |
| Cambiar la cantidad en el carrito + “Update shopping cart” | `POST /cart` (Doc) |
| Cambiar el país en “Estimate shipping” | `GET /country/getstatesbycountryid?countryId=1&addEmptyStateIfRequired=true` |
| Suscribirse al newsletter | `POST /subscribenewsletter` |
| Votar en la encuesta | `POST /poll/vote` |
| Iniciar sesión | `POST /login` (Doc, 302) |
| Cerrar sesión | `GET /logout` (302) |
| Pasos del checkout | `POST /checkout/OpcSaveBilling/` … `POST /checkout/OpcConfirmOrder/` |

5. Para cada request: click derecho → **Copy → Copy as cURL (bash)**. Esto se puede importar en Postman (§3.4.3) y conserva URL, headers y body.
6. Para cada request, revisar en DevTools las pestañas **Headers** (verbo, status, Content-Type), **Payload** (parámetros) y **Response**.
7. Leer el JavaScript del sitio para encontrar endpoints que no se disparan fácilmente:
   - `/Scripts/public.ajaxcart.js` → contrato de alta al carrito (`success`, `message`, `redirect`, `updatetopcartsectionhtml`…).
   - `/Scripts/public.onepagecheckout.js` → claves de respuesta del checkout (`update_section`, `goto_section`, `error`, `message`, `success`…).
8. Ver el código fuente de los formularios (**Ctrl+U** o Elements) para obtener los **nombres exactos de los campos** y las reglas de validación (`data-val-required`, `data-val-email`, `data-val-length-min`).
9. Probar verbos alternativos (por ejemplo, un GET sobre un endpoint POST) para conocer el manejo de errores.

### 1.3 Checklist de salida de la exploración
- [ ] Inventario de endpoints con verbo, URL, parámetros y Content-Type de request/response (§2.1).
- [ ] Reglas de validación de cada formulario (campos requeridos, formatos, límites).
- [ ] Mecanismo de sesión identificado (cookies) y endpoints con antiforgery.
- [ ] Datos de prueba estables (IDs de productos comprables, país/estado).
- [ ] Hallazgos o anomalías registrados (status 200 en errores, redirects, etc.).

---

## 2. Fase 2 — Identificación de casos de prueba de API

### 2.1 Inventario de endpoints

| # | Endpoint | Verbo | Request (Content-Type · parámetros) | Response | Auth / CSRF |
|---|---|---|---|---|---|
| E1 | `/login` | POST | form · `Email`, `Password`, `RememberMe` | Éxito: **302**. Error: **200 HTML** con `.validation-summary-errors` | Cookie · sin token (F-03) |
| E2 | `/logout` | GET | — | **302** a `/` | Cookie |
| E3 | `/customer/info` | GET | — | Logueado: 200 HTML. Invitado: **302** a `/login` | Cookie |
| E4 | `/register` | GET / POST | form · `__RequestVerificationToken`, `Gender`, `FirstName*`, `LastName*`, `Email*`, `Password*` (mín. 6), `ConfirmPassword*` | 200 HTML con errores, o éxito | **Token obligatorio** |
| E5 | `/addproducttocart/catalog/{productId}/{shoppingCartTypeId}/{quantity}` | POST | sin body (todo en la URL) | 200 **JSON** | Cookie (invitado o logueado) |
| E6 | `/addproducttocart/details/{productId}/{shoppingCartTypeId}` | POST | form · `addtocart_{id}.EnteredQuantity`, `product_attribute_*`, `giftcard_*` | 200 **JSON** | Cookie |
| E7 | `/cart` | GET / POST | form · `itemquantity{cartItemId}`, `removefromcart`, `updatecart`, `discountcouponcode`, `giftcardcouponcode`, `CountryId`, `termsofservice`, `checkout` | 200 HTML; con `checkout` → 302 | Cookie · sin token |
| E8 | `/checkout/OpcSaveBilling/` · `OpcSaveShipping/` · `OpcSaveShippingMethod/` · `OpcSavePaymentMethod/` · `OpcSavePaymentInfo/` · `OpcConfirmOrder/` | POST | form · campos de cada paso (Matriz M8) | 200 **JSON** (`update_section`, `goto_section`, `error`, `message`, `success`) | Cookie |
| E9 | `/country/getstatesbycountryid` | GET | query · `countryId`, `addEmptyStateIfRequired` | 200 **JSON** `[{id,name}]` | Pública |
| E10 | `/catalog/searchtermautocomplete` | GET | query · `term` (mín. 3) | 200 **JSON** `[{label,producturl,productpictureurl}]` | Pública |
| E11 | `/subscribenewsletter` | POST | form · `email` | 200 **JSON** `{Success,Result}` | Pública |
| E12 | `/poll/vote` | POST | form · `pollAnswerId` | 200 **JSON** `{error}` o `{html}` | Solo registrados |
| E13 | `/passwordrecovery` | POST | form · `Email` | 200 HTML | Pública |

### 2.2 Aplicación de POISED por endpoint

| Endpoint | **P** Parámetros | **O** Salidas | **I** Interoperabilidad | **S** Seguridad | **E** Excepciones | **D** Datos |
|---|---|---|---|---|---|---|
| E1 Login | Email (formato, mayúsculas, espacios), Password (vacía, incorrecta), RememberMe | 302 + cookie vs 200 + mensaje | Login ↔ `/customer/info` ↔ header ↔ carrito | Enumeración (F-02), sin CSRF (F-03), rutas privadas | Mensaje claro sin revelar existencia | Email persistido; sesión |
| E5/E6 Alta carrito | productId, shoppingCartTypeId, quantity, atributos, gift card | `success`, `message` (string o array), `redirect`, HTML de header/flyout | AJAX ↔ `/cart` HTML ↔ checkout | Solo POST; IDOR de carrito [HIP] | 0/negativo/>10000, producto inexistente, compra deshabilitada | Cantidades sumadas, precio del servidor |
| E7 Carrito | itemquantity, removefromcart, termsofservice | HTML recalculado | Header/flyout/checkout | Términos solo en cliente (F-01); sin CSRF | 0/negativo silenciosos (DEF-01) | Persistencia de cantidades |
| E8 Checkout | Campos de dirección, shippingoption, paymentmethod | JSON con `goto_section` | Carrito → checkout → orden | Pasos fuera de orden | Carrito vacío → `error:1` | Totales y orden creada |
| E9/E10 Auxiliares | countryId (num/no num), term (longitud) | Arrays JSON | Usados por checkout/búsqueda | Públicos | `abc` → HTML de error (F-07); término corto vacío (F-13) | Estructura `{id,name}` |
| E11/E12 | email, pollAnswerId | `Success/Result` (PascalCase), `error/html` | — | Poll solo registrados | id faltante → error HTML (F-07) | — |

### 2.3 Catálogo de casos de prueba de API

Cada ID coincide con el nombre del request en la colección. Columna **POISED** = letras que cubre.

#### 2.3.1 Login y sesión (carpeta `01 - Login y sesión`)

| ID | POISED | Request | Datos | Response esperado | Oráculo |
|---|---|---|---|---|---|
| LOGIN-01 | P·O·S | `POST {{baseUrl}}/login` | `Email={{testUserEmail}}&Password={{testUserPassword}}&RememberMe=false` | **302**, header `Location` a `/`, `Set-Cookie` presente | 302 [OBS: el login redirige]; destino exacto y nombre de la cookie [HIP] |
| LOGIN-01b | O·I·S | `GET {{baseUrl}}/customer/info` | (cookie de LOGIN-01) | **200**; `#Email` = email del usuario; header con “Log out” | [OBS] (sesión 2) |
| LOGOUT-01 | S | `GET {{baseUrl}}/logout` | — | **302** | [OBS] |
| AUTH-01 | S | `GET {{baseUrl}}/customer/info` | sin sesión | **302**, `Location` contiene `/login` | [OBS] |
| LOGIN-02 | P·O·E·S | `POST {{baseUrl}}/login` | Email registrado + `Password={{testUserPassword}}_x` | 200 HTML; “Login was unsuccessful… **The credentials provided are incorrect**”; email conservado | [OBS] (con contraseña vacía) |
| LOGIN-03 | O·E·S | `POST {{baseUrl}}/login` | `Email={{nonExistentEmail}}` | 200 HTML; “…**No customer account found**”. **Mensaje idéntico a LOGIN-02** | Texto [OBS]; igualdad **[REQ?] → falla F-02** |
| LOGIN-04 | P·E | `POST {{baseUrl}}/login` | Email y Password vacíos | 200; “Login was unsuccessful” | [OBS] |
| LOGIN-05 | P·D | `POST {{baseUrl}}/login` | `Email=" {{testUserEmail}} "` | **302** (se recorta) | **[REQ?] → falla N-03** |
| LOGIN-06 | P·D | `POST {{baseUrl}}/login` | Email en MAYÚSCULAS | **302** | Búsqueda [OBS]; login [HIP] |

#### 2.3.2 Registro (carpeta `02 - Registro`)

| ID | POISED | Request | Datos | Response esperado | Oráculo |
|---|---|---|---|---|---|
| REG-00 | S | `GET {{baseUrl}}/register` | — | 200; extrae `__RequestVerificationToken` → `{{rvToken}}` | [OBS] |
| REG-API-01 | P·O·E | `POST {{baseUrl}}/register` | token + campos vacíos | 200 HTML con “First name is required.”, “Last name is required.”, “Email is required.”, “Password is required.” | [OBS] |
| REG-API-03 | S·E | `POST {{baseUrl}}/register` | **sin token** | Rechazo controlado **400/403** | Hoy `/errorpage.htm` → **falla F-07** |

> No se incluye un **registro exitoso** automatizado: cada ejecución crearía una cuenta que no se puede borrar (R-D04). Si se necesita, hay que usar un email único `qa.{{runId}}@example.com` y anotarlo en el inventario de cuentas.

#### 2.3.3 Carrito (carpeta `03 - Carrito`)

| ID | POISED | Request | Body | Response esperado | Oráculo |
|---|---|---|---|---|---|
| CART-API-01 | P·O·D | `POST {{baseUrl}}/addproducttocart/catalog/{{productSimpleId}}/1/1` | — | `{"success":true,"message":"…added to your…","updatetopcartsectionhtml":"(1)","updateflyoutcartsectionhtml":"…"}` | [OBS] |
| CART-API-10 | I·D | `GET {{baseUrl}}/cart` | — | 1 línea, Qty 1, header (1); captura `{{cartItemId}}` | [OBS] |
| CART-API-12 | P·E | `POST {{baseUrl}}/cart` | `itemquantity{{cartItemId}}=10001&updatecart=Update shopping cart` | Mensaje “The maximum quantity allowed for purchase is 10000.”; Qty se conserva en 1 | [OBS] |
| CART-API-11 | P·E·D | `POST {{baseUrl}}/cart` | `itemquantity{{cartItemId}}=0&updatecart=…` | La línea **se conserva** y se muestra un error | **Falla DEF-01** |
| CART-API-02 | P·E | `POST {{baseUrl}}/addproducttocart/details/{{productSimpleId}}/1` | `addtocart_13.EnteredQuantity=0` | `{"success":false,"message":["Quantity should be positive"]}` | [OBS] |
| CART-API-03 | P·E | ídem | `EnteredQuantity=10001` | `success:false`, “The maximum quantity allowed for purchase is 10000.” | [OBS] |
| CART-API-04 | P·E | `POST …/catalog/99999/1/1` | — | `{"success":false,"message":"No product found with the specified ID"}` (message **string**) | [OBS] |
| CART-API-05 | P·O | `POST …/catalog/{{productSimpleId}}/9/1` | — | `success:false` | Hoy `success:true` sin efecto → **falla F-04** |
| CART-API-06 | D·E | `POST …/catalog/{{productDisabledId}}/1/1` | — | Tras el fix: `success:true`. Hoy: `["Buying is disabled for this product"]` | **Falla DEF-02** |
| CART-API-07 | O·I | `POST …/catalog/{{productConfigId}}/1/1` | — | `{"redirect":"/build-your-own-computer"}` | [OBS] |
| CART-API-08 | P·E | `POST …/details/{{productConfigId}}/1` | `addtocart_16.EnteredQuantity=1` | `success:false`, 4 mensajes “Please select …” | [OBS] |
| CART-API-09 | S·E | `GET …/catalog/{{productSimpleId}}/1/1` | — | 404 (ideal 405) | [OBS] 404 |
| CART-API-13 | S·E | `POST {{baseUrl}}/cart` (sin follow) | `checkout=checkout` (sin `termsofservice`) | No avanza (200 en `/cart`) | Hoy 302 → **falla F-01** |

#### 2.3.4 Checkout — guardas (carpeta `04`)

| ID | POISED | Request | Body | Response esperado | Oráculo |
|---|---|---|---|---|---|
| CHK-API-01 | E·D | `POST {{baseUrl}}/checkout/OpcSaveBilling/` (carrito vacío) | `BillingNewAddress.Id=0` | `{"error":1,"message":"Your cart is empty"}` | [OBS] |
| CHK-API-02 | P·E | `POST {{baseUrl}}/checkout/OpcSaveShippingMethod/` | `shippingoption=` | `{"error":1,"message":"Selected shipping method can't be parsed"}` (o “Your cart is empty” si el carrito está vacío) | [OBS] |

#### 2.3.5 Servicios auxiliares (carpeta `05`)

| ID | POISED | Request | Response esperado | Oráculo |
|---|---|---|---|---|
| AUX-01 | P·O·D | `GET {{baseUrl}}/country/getstatesbycountryid?countryId=1&addEmptyStateIfRequired=true` | `[{"id":1,"name":"AA (Armed Forces Americas)"},…]`, incluye `{"id":40,"name":"New York"}` | [OBS] |
| AUX-02 | P·E | ídem con `countryId=abc` | JSON de error o 400 | Hoy HTML de error con 200 → **falla F-07** |
| AUX-03 | O·D | `GET {{baseUrl}}/catalog/searchtermautocomplete?term=com` | `[{"label":"Build your own cheap computer","producturl":"/build-your-cheap-own-computer","productpictureurl":null},…]` | [OBS] |
| AUX-04 | P·O | ídem con `term=co` | `[]` con `application/json` | Hoy cuerpo vacío sin Content-Type → **falla F-13** |
| AUX-05 | P·O | `POST {{baseUrl}}/subscribenewsletter` · `email=qa.nl.{{runId}}@example.com` | `{"Success":true,"Result":"Thank you for signing up! A verification email has been sent. We appreciate your interest."}` | [OBS] |
| AUX-06 | P·E | ídem · `email=abc` | `{"Success":false,"Result":"Enter valid email"}` | [OBS] |
| AUX-07 | S | `POST {{baseUrl}}/poll/vote` · `pollAnswerId=1` (invitado) | `{"error":"Only registered users can vote."}` | [OBS] |

> Los casos marcados **“falla F-xx / DEF-xx / N-xx”** fallan **a propósito**: documentan el comportamiento esperado y sirven como **validación del fix**. En el reporte de ejecución se informan como *known failures*, no como fallas nuevas.

---

## 3. Fase 3 — Preparación del ambiente

### 3.1 Descargar e instalar Postman
1. Ir a **https://www.postman.com/downloads/** y descargar la versión para el sistema operativo (Windows, macOS o Linux).
2. Instalar y abrir Postman. Iniciar sesión o crear una cuenta gratuita (se necesita para workspaces; los **secrets** no se sincronizan si se usa “current value”, ver §3.3).
3. Crear un workspace: **Workspaces → Create Workspace → “DemoWebShop QA”** (Personal o Team).
4. *(Opcional, ejecución por línea de comandos)* Instalar Node.js LTS desde https://nodejs.org y luego:
   ```bash
   npm install -g newman newman-reporter-htmlextra
   ```

### 3.2 Importar colección y entornos
1. En Postman: **Import** (arriba a la izquierda) → arrastrar los 3 archivos de la carpeta `postman/`.
2. Verificar que aparezcan:
   - **Collections →** “Demo Web Shop - API QA (POISED)”, con 6 carpetas.
   - **Environments →** “DemoWebShop - demo-public” y “DemoWebShop - staging (plantilla, sin URL real)”.
3. Arriba a la derecha, en el selector de entorno, elegir **“DemoWebShop - demo-public”**.

### 3.3 Configurar variables por entorno

| Variable | demo-public | Tipo | Uso |
|---|---|---|---|
| `baseUrl` | `https://demowebshop.tricentis.com` | default | Prefijo de todas las URLs |
| `cookieDomain` | `demowebshop.tricentis.com` | default | Limpieza de cookies desde scripts |
| `testUserEmail` | *(completar)* | **secret** | Usuario de prueba **dedicado** |
| `testUserPassword` | *(completar)* | **secret** | Contraseña del usuario de prueba |
| `productSimpleId` / `productSimpleSlug` | `13` / `computing-and-internet` | default | Producto simple comprable |
| `productConfigId` | `16` | default | Build your own computer |
| `productDisabledId` | `27` | default | Science (compra deshabilitada, DEF-02) |
| `countryUS` / `stateNY` | `1` / `40` | default | Datos de dirección |
| `slaMs` | `3000` | default | Umbral de tiempo de respuesta |
| `rvToken`, `cartItemId`, `productSimplePrice`, `lastLoginErrorExisting` | *(vacías)* | default | Las completan los scripts en tiempo de ejecución |

**Pasos:**
1. **Environments → DemoWebShop - demo-public**.
2. En `testUserEmail` y `testUserPassword`, escribir los valores en la columna **Current value** (no en *Initial value*: así no se sincronizan ni se exportan). El tipo **secret** los oculta en pantalla.
3. **Save**.
4. **Nunca** exportar el entorno con valores reales ni subirlo a un repositorio.

> **Cuenta de prueba:** usar una cuenta creada para QA (como en las fases anteriores, la crea una persona en `/register`). No reutilizar contraseñas personales. Para pruebas de intentos fallidos, usar **otra** cuenta (R-D02).

### 3.4 Configuración de Postman necesaria para esta aplicación
1. **Cookies (sesión):** Postman guarda automáticamente las cookies de la respuesta y las reenvía (cookie jar). Para que los scripts puedan **limpiarlas**: click en **Cookies** (debajo del botón Send) → **Domains Allowlist** → agregar `demowebshop.tricentis.com`.
2. **Redirecciones:** la colección ya trae **“Automatically follow redirects” = OFF** en los requests donde se valida un 302 (LOGIN-01, LOGIN-01b, LOGOUT, AUTH-01, LOGIN-02..06, REG-API-03, CART-API-13). Para verlo: abrir el request → pestaña **Settings**.
3. **Importar desde cURL (si se quiere agregar requests nuevos):** **Import → Raw text** → pegar el cURL copiado de DevTools (§1.2 paso 5) → Continue → Import. Reemplazar el host por `{{baseUrl}}`.
4. **SSL certificate verification:** dejar **ON** (Settings → General).

### 3.5 Estructura de la colección y scripts

```
Demo Web Shop - API QA (POISED)
├── [Pre-request de colección]  genera runId y nonExistentEmail únicos
├── [Tests de colección]        reglas globales: no /errorpage.htm · tiempo < slaMs
├── 00 - Preflight              PRE-01 Home · PRE-02 producto comprable (data guard)
├── 01 - Login y sesión         LOGIN-01..06 · LOGOUT-01..03 · AUTH-01
├── 02 - Registro (antiforgery) REG-00 token · REG-API-01 · REG-API-03
├── 03 - Carrito                CART-API-01..13 (el primero vacía el carrito)
├── 04 - Checkout (guardas)     CHK-API-01..02
└── 05 - Servicios auxiliares   AUX-01..07
```

**Scripts clave (incluidos en la colección):**

*a) Obtener el token antiforgery (REG-00 → pestaña Tests):*
```javascript
const $ = cheerio.load(pm.response.text());          // cheerio viene incluido en Postman
const token = $('input[name="__RequestVerificationToken"]').val();
pm.test('Token antiforgery presente', () => pm.expect(token).to.be.a('string').and.not.empty);
pm.environment.set('rvToken', token);                 // se usa en el body de REG-API-01
```

*b) Vaciar el carrito antes de una prueba (CART-API-01 → pestaña Pre-request):*
```javascript
const base = pm.environment.get('baseUrl');
pm.sendRequest({ url: base + '/cart', method: 'GET' }, (err, res) => {
  const $ = cheerio.load(res.text());
  const ids = $('input[name="removefromcart"]').map((i, e) => $(e).val()).get();
  if (!ids.length) return;
  const body = ids.map(id => 'removefromcart=' + id).join('&') + '&updatecart=Update';
  pm.sendRequest({ url: base + '/cart', method: 'POST',
    header: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: { mode: 'raw', raw: body } });
});
```

*c) Regla global (Tests de colección):*
```javascript
pm.test('[GLOBAL] No es la página de error genérica', () =>
  pm.expect(pm.response.text()).to.not.include("We're sorry, an internal error occurred"));
pm.test('[GLOBAL] Tiempo < slaMs', () =>
  pm.expect(pm.response.responseTime).to.be.below(parseInt(pm.environment.get('slaMs'), 10)));
```

### 3.6 Reglas de validación obligatorias (por qué no alcanza con el status)
1. Verificar el **status esperado** (200, 302 o 404 según el caso).
2. Verificar el **Content-Type** (`application/json` o `text/html`).
3. Verificar el **contenido**: claves JSON (`success`, `error`, `message`, `redirect`) o elementos HTML (`.validation-summary-errors`, `.cart-item-row`).
4. Verificar que la respuesta **no sea** `/errorpage.htm`.
5. Cuando una acción cambia estado (carrito), **confirmarla con un segundo request** (`GET /cart`). Un `success:true` solo no alcanza (F-04).

---

## 4. Fase 4 — Guía de ejecución paso a paso (QA manual)

### 4.1 Ejecutar un request individual
1. Seleccionar el entorno **DemoWebShop - demo-public**.
2. En la colección, abrir el request (por ejemplo, `AUX-01 Estados de USA`).
3. Revisar las pestañas **Params**, **Headers**, **Body** y **Settings**.
4. Click en **Send**.
5. En el panel inferior, revisar:
   - **Body** → la respuesta (Pretty para JSON, Preview para HTML).
   - **Headers** → `Content-Type`, `Location`, `Set-Cookie`.
   - **Test Results** → cada aserción en verde (PASS) o rojo (FAIL).
   - Status, Time y Size, arriba a la derecha.
6. Abrir **Console** (abajo a la izquierda) para ver los `console.log` de los scripts (cookies, precios capturados).

### 4.2 Ejecutar una carpeta o la colección completa (Collection Runner)
1. Click derecho en la colección (o en una carpeta) → **Run collection**.
2. En el Runner: elegir el **Environment** demo-public. **Iterations: 1**. **Delay: 300 ms** (no saturar el demo público).
3. Mantener el **orden** de los requests (las carpetas 01 y 03 dependen del orden).
4. Click en **Run**.
5. Al terminar, revisar **Passed / Failed** por request. Los fallos esperados (known failures) son: LOGIN-03.5, LOGIN-05.1, REG-API-03, CART-API-11, CART-API-05, CART-API-06.2, CART-API-13, AUX-02 y AUX-04.
6. **Export Results** (arriba a la derecha del Runner) → guardar el JSON como evidencia.

### 4.3 Ejecución por línea de comandos (opcional)
```bash
newman run postman/DemoWebShop_API_QA.postman_collection.json \
  -e postman/DemoWebShop_demo-public.postman_environment.json \
  --env-var "testUserEmail=$QA_USER" --env-var "testUserPassword=$QA_PASS" \
  --delay-request 300 -r cli,htmlextra --reporter-htmlextra-export reports/api.html
```
Las credenciales se pasan como variables del sistema; no quedan en archivos.

### 4.4 Interpretación de resultados y registro de defectos

| Resultado | Acción |
|---|---|
| PASS en todas las aserciones | Marcar Pass en la matriz |
| FAIL en una aserción marcada F-xx / DEF-xx / N-xx | Known failure: verificar que siga igual y referenciar el hallazgo existente |
| FAIL en una aserción no marcada | Posible defecto nuevo: repetir 2 veces, revisar Console y Body, y registrar con la plantilla de `REPORTE_DE_DEFECTO.md` (request, response, evidencia) |
| Error de conexión o timeout | Revisar disponibilidad (PRE-01); si persiste, **Blocked por entorno** (TEST_PLAN_v2 §10.1) |
| PRE-02 falla | Datos cambiados: actualizar `productSimpleId` antes de seguir |
| Solo falla `[GLOBAL] Tiempo < slaMs` | Tratar como **warning de performance**: registrar el tiempo (picos de 12–14 s conocidos, F-10) sin reportar defecto funcional |

**Evidencia mínima por defecto:** captura del request (URL, Body), del response (Body, Headers), de los Test Results y el JSON exportado del Runner.

---

## 5. Caso detallado de ejemplo — Login exitoso y fallido con Postman

### 5.1 Ficha del caso

| Campo | Valor |
|---|---|
| **ID** | API-LOGIN-EX (requests LOGIN-01, LOGIN-01b, LOGOUT-01, AUTH-01, LOGIN-02, LOGIN-03 de la colección) |
| **Objetivo** | Validar a nivel HTTP que un usuario válido se autentica y que uno inválido es rechazado con un mensaje claro |
| **POISED** | **P** (Email/Password/RememberMe) · **O** (302 vs 200 + mensaje) · **I** (login ↔ `/customer/info` ↔ header) · **S** (sesión, rutas privadas, enumeración) · **E** (mensajes de error) · **D** (email persistido y comparado sin distinguir mayúsculas) |
| **Trazabilidad** | TEST_PLAN_v2 **S-02**, **LOG-01**, **LOG-02** · Especificación **TC-LOG-01/02/03** · Matriz **M9/M13.5** · Hallazgos **F-02**, **F-03**, **N-01** |
| **Precondiciones** | Entorno demo-public seleccionado; `testUserEmail` y `testUserPassword` cargados como secret; dominio en Cookies → Domains Allowlist |

### 5.2 Escenario exitoso

**Paso 1 — LOGIN-01: enviar las credenciales**

| Elemento | Valor |
|---|---|
| Método / URL | `POST {{baseUrl}}/login` |
| Headers | `Content-Type: application/x-www-form-urlencoded` |
| Body (x-www-form-urlencoded) | `Email` = `{{testUserEmail}}` · `Password` = `{{testUserPassword}}` · `RememberMe` = `false` |
| Settings | **Automatically follow redirects: OFF** |
| Pre-request | Limpia las cookies del dominio y verifica que existan las credenciales |

Request equivalente (cURL, para referencia):
```bash
curl -i -X POST "https://demowebshop.tricentis.com/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "Email=<testUserEmail>" --data-urlencode "Password=<testUserPassword>" \
  --data "RememberMe=false"
```

**Response esperado:**
```http
HTTP/1.1 302 Found
Location: /                                   ← [HIP] Home o returnUrl
Set-Cookie: <cookie de autenticación>=<valor>; path=/; HttpOnly      ← [HIP] nombre exacto a confirmar en Cookies
Content-Type: text/html; charset=utf-8

<html><head><title>Object moved</title></head><body>…</body></html>   ← [HIP] cuerpo estándar de IIS para 302
```

**Tests (pestaña Tests de LOGIN-01):**
```javascript
pm.test('LOGIN-01.1 Status 302 (redirect post-login)', () => pm.response.to.have.status(302));
pm.test('LOGIN-01.2 Header Location presente', () => pm.expect(pm.response.headers.get('Location')).to.be.a('string'));
pm.test('LOGIN-01.3 Location apunta a la Home o a returnUrl [HIP]', () =>
  pm.expect(pm.response.headers.get('Location')).to.match(/^(\/|https?:\/\/demowebshop\.tricentis\.com\/)/));
pm.test('LOGIN-01.4 Se emite cookie de autenticación', () => {
  const sc = pm.response.headers.all().filter(h => h.key.toLowerCase() === 'set-cookie').map(h => h.value).join(' | ');
  pm.expect(sc.length).to.be.above(0);
});
```

**Paso 2 — LOGIN-01b: confirmar la sesión (verificación independiente)**

| Elemento | Valor |
|---|---|
| Método / URL | `GET {{baseUrl}}/customer/info` |
| Cookies | Las envía Postman automáticamente (las guardó en el paso 1) |
| Settings | Follow redirects: OFF (si la sesión no existiera, veríamos un 302 a `/login`) |

**Response esperado:** `200 OK`, `text/html`, con el formulario de Mi cuenta y el email del usuario en `<input id="Email" value="…">`, y “Log out” en el header.

```javascript
pm.test('LOGIN-01.5 /customer/info responde 200 (no redirige a /login)', () => pm.response.to.have.status(200));
const $ = cheerio.load(pm.response.text());
pm.test('LOGIN-01.6 Mi cuenta muestra el email del usuario', () =>
  pm.expect(($('#Email').val() || '').toLowerCase()).to.eql(pm.environment.get('testUserEmail').toLowerCase()));
pm.test('LOGIN-01.7 El header muestra "Log out"', () => pm.expect($('.header-links').text()).to.include('Log out'));
```

**Paso 3 — LOGOUT-01 y AUTH-01: cerrar sesión y verificar la protección**
- `GET {{baseUrl}}/logout` → **302**.
- `GET {{baseUrl}}/customer/info` → **302** con `Location` que contiene `/login` [OBS].

**Resultado del escenario exitoso:** Pass si LOGIN-01.1..01.4, LOGIN-01.5..01.7, LOGOUT-01.1 y AUTH-01.1..01.2 están en verde. Si LOGIN-01.1 falla con **200**, la respuesta trae el bloque de error: revisar las credenciales del entorno antes de reportar.

### 5.3 Escenario fallido

**Paso 4 — LOGIN-02: email registrado + contraseña incorrecta**

| Elemento | Valor |
|---|---|
| Método / URL | `POST {{baseUrl}}/login` |
| Body | `Email` = `{{testUserEmail}}` · `Password` = `{{testUserPassword}}_x` · `RememberMe` = `false` |
| Settings | Follow redirects: OFF |

**Response observado [OBS] (verificado con contraseña vacía; con contraseña incorrecta no vacía, [HIP] igual):**
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

… <div class="validation-summary-errors"><span>Login was unsuccessful. Please correct the errors and try again.</span>
<ul><li>The credentials provided are incorrect</li></ul></div> …
<input id="Email" name="Email" type="text" value="<testUserEmail>" /> …
<input id="Password" name="Password" type="password" />          ← la contraseña vuelve vacía
```

**Tests:**
```javascript
const $ = cheerio.load(pm.response.text());
const err = $('.validation-summary-errors').text().replace(/\s+/g, ' ').trim();
pm.test('LOGIN-02.1 Status 200 (el error de negocio NO usa 4xx)', () => pm.response.to.have.status(200));
pm.test('LOGIN-02.2 Content-Type text/html', () => pm.expect(pm.response.headers.get('Content-Type')).to.include('text/html'));
pm.test('LOGIN-02.3 Mensaje de login fallido', () => pm.expect(err).to.include('Login was unsuccessful'));
pm.test('LOGIN-02.4 Causa: "The credentials provided are incorrect" [OBS]', () => pm.expect(err).to.include('The credentials provided are incorrect'));
pm.test('LOGIN-02.5 Sigue como invitado', () => pm.expect($('.header-links').text()).to.include('Log in'));
pm.test('LOGIN-02.6 El email se conserva', () => pm.expect(($('#Email').val() || '').trim().toLowerCase()).to.eql(pm.environment.get('testUserEmail').toLowerCase()));
pm.environment.set('lastLoginErrorExisting', err);   // se compara en LOGIN-03
```

**Paso 5 — LOGIN-03: usuario inexistente**

| Elemento | Valor |
|---|---|
| Método / URL | `POST {{baseUrl}}/login` |
| Body | `Email` = `{{nonExistentEmail}}` (generado: `qa.noexiste.<runId>@example.com`) · `Password` = `Cualquiera123` · `RememberMe` = `false` |

**Response observado [OBS]:** `200 text/html` con “Login was unsuccessful. Please correct the errors and try again. **No customer account found**”.

```javascript
pm.test('LOGIN-03.3 Causa: "No customer account found" [OBS]', () => pm.expect(err).to.include('No customer account found'));
pm.test('LOGIN-03.5 [SEC][REQ? PO-01] Mensaje idéntico al de contraseña incorrecta — falla conocida F-02', () =>
  pm.expect(err).to.eql(pm.environment.get('lastLoginErrorExisting')));
```

**Resultado del escenario fallido:**
- **Funcional (TEST_PLAN_v2 S-02 / LOG-01):** Pass si LOGIN-02.1..02.6 y LOGIN-03.1..03.4 están en verde. El sistema no autentica y muestra un mensaje.
- **Seguridad:** LOGIN-03.5 **falla** hoy, porque los mensajes de LOGIN-02 y LOGIN-03 son distintos y permiten saber qué emails están registrados (F-02). Se informa como known failure hasta la respuesta de PO-01.

### 5.4 Evidencia a adjuntar
Captura de Body y Headers de LOGIN-01 (con `Set-Cookie` enmascarado), LOGIN-01b, LOGIN-02 y LOGIN-03; el panel **Test Results** de cada uno; y el JSON exportado del Runner de la carpeta `01 - Login y sesión`.

---

## 6. Cobertura POISED: qué se pudo aplicar y qué no

| Lineamiento | Aplicación en este proyecto | Limitaciones (por qué no es posible completo) |
|---|---|---|
| **P — Parameters** | Todos los parámetros de URL, query y body inventariados (§2.1); particiones válidas/inválidas, límites (0, −1, 10000, 10001), tipos (`abc`), ausencia, mayúsculas y espacios | Sin especificación, los **rangos válidos** se infieren de la UI y de los mensajes. Hallado: si falta `EnteredQuantity`, el servidor asume 1 sin error, y un **body JSON se ignora** |
| **O — Output** | Status, Content-Type, claves JSON y elementos HTML verificados para entradas válidas e inválidas | Muchas salidas son **HTML**, no JSON: se valida con cheerio y selectores, que se rompen si cambia el diseño. Los errores usan **200** |
| **I — Interoperability** | Coherencia AJAX ↔ `/cart` ↔ header; login ↔ `/customer/info`; carrito vacío ↔ guardas del checkout | No hay **otras APIs ni servicios externos** expuestos (pagos, stock, email) para verificar integraciones; el contrato JSON no es uniforme (F-13) |
| **S — Security** | Rutas privadas sin sesión, logout, verbo incorrecto, antiforgery en registro, enumeración (F-02), términos solo en cliente (F-01) | **No hay roles** disponibles (sin cuenta admin) → no se puede probar autorización por rol ni IDOR entre usuarios con datos reales. No hay tokens/API keys. No se hacen pruebas de fuerza bruta ni pentesting sobre un sitio público compartido. No es posible inspeccionar flags de cookies HttpOnly desde scripts del navegador; en Postman sí se ven en el panel Cookies |
| **E — Exceptions** | Mensajes de negocio verificados (texto exacto); detección de `/errorpage.htm`; 404 en verbo incorrecto | Las excepciones del servidor **no devuelven 4xx/5xx** ni JSON (F-07): solo se detectan por contenido |
| **D — Data** | Estructuras (`{id,name}`, `{label,producturl,…}`), datos reales del catálogo con data guard (PRE-02), tiempos contra `slaMs`, persistencia vía GET posterior | **Sin acceso a la base de datos** → la persistencia se verifica solo por la UI o HTTP. Datos compartidos y cambiantes (precios con descuento nuevos, totales no deterministas). Cuentas que no se pueden borrar. Tiempos medidos desde el cliente, no carga real |

---

## 7. Trazabilidad

| Caso API | Plan v2 | Especificación / Plan v1 | Hallazgo |
|---|---|---|---|
| LOGIN-01, 01b, LOGOUT-01, AUTH-01 | S-02, LOG-02 | TC-LOG-01 · LOG-01/11/12 | — |
| LOGIN-02 | S-02 | TC-LOG-02 · LOG-03 | N-01 |
| LOGIN-03 | LOG-01 | TC-LOG-03 · LOG-04/07 | F-02 |
| LOGIN-05 / 06 | — (borde) | TC-LOG-03 / TC-LOG-01 variantes | N-03 / N-02 |
| REG-API-01 / 03 | REG-03 / S-06 | REG-API-01 / 03 | F-07 |
| CART-API-01, 10 | S-04, CART-01 | TC-CART-01 · CAR-API-01 | — |
| CART-API-11 / 12 | S-05, CART-02 | TC-CART-02 · CAR-14/15/17 | DEF-01 |
| CART-API-02..04, 07..09 | CART-01/02 | CAR-API-03..06, 08 | F-13 |
| CART-API-05 | — | CAR-API-07 | F-04 |
| CART-API-06 | S-04 | TC-CART-01 | DEF-02 |
| CART-API-13 | S-07 (entrada) | CAR-API-09 | F-01 |
| CHK-API-01/02 | CHK-06 | Matriz M8 | — |
| AUX-01..07 | Preflight (Fase A) | Matriz M3/M10/M11 | F-07, F-13 |

---

## 8. Limitaciones y consideraciones finales

1. **Un solo entorno real.** Solo existe el demo público. La plantilla `staging` sirve de ejemplo de cómo parametrizar otro entorno (cambiar `baseUrl` y `cookieDomain`), pero **no tiene URL real**.
2. **Entorno compartido.** Ejecutar con delay (300 ms) y sin iteraciones masivas. Otros usuarios pueden cambiar datos durante la ejecución.
3. **Credenciales.** El login exitoso necesita una cuenta de prueba; Claude no ingresa contraseñas, así que **LOGIN-01 y sus variantes no se ejecutaron en esta preparación**. Los tests están escritos según el comportamiento observado (sesión 2 del proyecto) y lo que queda como hipótesis está marcado [HIP]. La primera ejecución debe confirmar: el `Location` del 302, el nombre de la cookie de autenticación y que LOGIN-02 con una contraseña incorrecta no vacía devuelve el mismo mensaje que con contraseña vacía.
4. **Fallas conocidas incluidas a propósito** (F-01, F-02, F-04, F-07, F-13, DEF-01, DEF-02, N-03). Si el equipo prefiere un Runner “verde” para smoke, mover esas aserciones a una carpeta `99 - Known failures`.
5. **Fuera de alcance:** checkout E2E con confirmación de orden (crea pedidos reales en el demo), pago con tarjeta, pruebas de carga y de seguridad intrusivas.
