# CASOS DE PRUEBA — REGRESIÓN COMPLETA
**Aplicación:** Tricentis Demo Web Shop — https://demowebshop.tricentis.com/ (nopCommerce · ASP.NET MVC 5.2)
**Módulos:** Registro · Login · Carrito de compras
**Versión:** 1.0 · **Fecha:** 13/10/2026 · **Autor:** QA Lead (asistido por Claude)
**Fuentes:** `MATRIZ_DE_CONOCIMIENTO_TECNICO_Y_MODULOS.md` (Matriz) · `TEST_PLAN_v2.md` (Plan v2)
**Documento complementario:** `CASOS_DE_PRUEBA_SMOKE.md` (Smoke y Sanity, lote de datos completo)

---

## 0. Cómo usar este documento

### 0.1 Objetivo de la regresión
Pruebas profundas por módulo, organizadas en cinco **dimensiones**:

| Código | Dimensión | Qué cubre |
|---|---|---|
| **DAT** | Calidad de datos e integridad | Qué se guarda, cómo se normaliza, coherencia entre pantallas y con el servidor |
| **UX** | Perspectiva de usuario final | Flujos realistas, mensajes comprensibles, navegación, recuperación ante errores |
| **FE** | Validación visual y controles de Front-End | Campos obligatorios, estados (vacío, error, deshabilitado), desbordamientos visuales |
| **BVA** | Casos borde, valores límite y manejo de errores | Límites inferiores y superiores, tipos inválidos, mensajes de error |
| **API** | Nivel técnico / Backend | Requests directos con payload, contrato de respuesta, reglas del servidor sin pasar por el cliente |

### 0.2 Convenciones (iguales a las del documento Smoke)
- **ID:** `XX-RGNN` → `RG` Registro, `LG` Login, `CR` Carrito; sufijo `RG` = Regresión. Ejemplo: **CR-RG07**.
- **Oráculo:** **[OBS]** observado · **[HIP]** hipótesis de QA · **[REQ?]** requiere decisión de negocio. Los casos que hoy fallan por un defecto conocido indican **“Falla conocida”** con su ID (DEF-01, DEF-02, F-01, F-02, F-04, F-07, F-08, F-13, N-03). Se ejecutan igual: sirven para validar el fix.
- **Payloads:** los formularios se envían como `application/x-www-form-urlencoded`; el body se muestra en **JSON solo por legibilidad** (en Postman: Body → x-www-form-urlencoded con esas claves). Las respuestas de los endpoints AJAX son JSON reales.
- **Reglas generales:** ver `CASOS_DE_PRUEBA_SMOKE.md` §0.4 (incógnito por TC, DevTools en Network, no confiar solo en HTTP 200, Blocked ≠ Fail, nunca contraseñas personales).
- **Navegadores:** Chrome y Firefox (Plan v2 §6.1).
- **Precondición global:** el Smoke completo en **Pass** (Plan v2 §7).

### 0.3 Lote de datos de prueba
Se usa el lote **Prueba Maty0–Maty16** definido en `CASOS_DE_PRUEBA_SMOKE.md` §1, más estos datos específicos de regresión:

| ID dato | Dato | Uso |
|---|---|---|
| **Prueba Maty5** | First name `Prueba Maty5` · Last name `QA BVA` · Email `prueba.maty5.{AAAAMMDDHHmm}@example.com` · contraseñas de 5, 6, 7, 999 y 1000 caracteres (§0.4) | BVA de contraseña |
| **Prueba Maty6** | First name `Prueba Maty6 María José` · Last name `QA Ñandú-O'Brien Pérez` · Email `prueba.maty6.{AAAAMMDDHHmm}@example.com` | Caracteres internacionales |
| **Prueba Maty7** | First name `Prueba Maty7 <b>x</b>` · Last name `QA <script>alert(1)</script>` · Email `prueba.maty7.{AAAAMMDDHHmm}@example.com` | HTML/scripts en los campos |
| **Prueba Maty8** | First name `Prueba Maty8` + 240 letras `A` (≈ 252 caracteres) · Last name `QA Overflow` · Email `prueba.maty8.{AAAAMMDDHHmm}@example.com` | Desbordamiento visual y longitud máxima |
| **Prueba Maty17** | Cuenta registrada `prueba.maty17.{AAAAMMDDHHmm}@example.com` (First name `Prueba Maty17`) | Fusión del carrito invitado → registrado |
| **Prueba Maty18** | Cuenta registrada `prueba.maty18.{AAAAMMDDHHmm}@example.com` (First name `Prueba Maty18`) — **dedicada** | Intentos fallidos repetidos (para no bloquear a Prueba Maty9) |
| **Prueba Maty19** | Gift card: Recipient name `Prueba Maty19 Destinatario` · Recipient email `prueba.maty19.dest@example.com` · Sender name `Prueba Maty19 Remitente` · Sender email `prueba.maty19.rem@example.com` · Message `Prueba Maty19 mensaje` | Gift card válida |
| **Prueba Maty20** | Códigos inválidos: cupón `PRUEBA-MATY20-CUPON` · gift card `PRUEBA-MATY20-GC` | Cupón y gift card inválidos |
| **Prueba Maty21** | Producto con compra deshabilitada: **Science** (id 27, 51.00, “In stock”) | DEF-02 |

### 0.4 Generación de valores largos (para BVA)
En DevTools → **Console** se puede generar el texto y copiarlo:
```javascript
copy('PMaty5#' + 'a'.repeat(992));   // 999 caracteres → copiar y pegar en el campo
copy('PMaty5#' + 'a'.repeat(993));   // 1000 caracteres
copy('Prueba Maty8' + 'A'.repeat(240));
```

---

## 1. MÓDULO REGISTRO — Regresión

---

### RG-RG01 — Integridad de los datos persistidos después del registro
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-01**, **R-01** · Matriz **M13.1** |
| **Datos** | **Prueba Maty1** (cuenta creada en RG-SM01) |

**Precondiciones:** RG-SM01 ejecutado en este ciclo; sesión cerrada.

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | **Log in** con Prueba Maty1 | Header con el email | `POST /login` → 302 |
| 2 | Click en el email del header → **Customer info** | Gender = **Female**; First name = `Prueba Maty1`; Last name = `QA Registro`; Email = el registrado, **en minúsculas y sin espacios** | `GET /customer/info` → 200; el HTML trae `value="Prueba Maty1"` en `FirstName` |
| 3 | Verificar que no haya caracteres extra (espacios al final, mayúsculas cambiadas) | Valores idénticos a los ingresados | — |
| 4 | Click en **Addresses** | “No addresses” (el registro no crea direcciones) [HIP] | `GET /customer/addresses` → 200 |
| 5 | Click en **Orders** | “No orders” | 200 |
| 6 | **Log out** | Invitado | 302 |

**Payload de API (lectura):** `GET /customer/info` con la cookie de sesión → `200 text/html`; extraer `#FirstName`, `#LastName`, `#Email` y el radio `Gender` marcado.

---

### RG-RG02 — El carrito del invitado se conserva al registrarse
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** · **UX** |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v1 **REG-22** · Matriz **M13** (conversión invitado → registrado) |
| **Datos** | Nueva cuenta **Prueba Maty1** con sufijo nuevo (`prueba.maty1.{AAAAMMDDHHmm}b@example.com`) · **Prueba Maty12** ×2 · **Prueba Maty13** ×1 |

**Precondiciones:** incógnito nuevo.

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ficha de Computing and Internet → Qty 2 → **Add to cart** | Header (2) | `success:true` |
| 2 | Ficha de Fiction → **Add to cart** | Header (3) | `success:true` |
| 3 | Click en **Register** y completar los datos de Prueba Maty1 (email con sufijo `b`) → **Register** | Registro confirmado; header con el email y **Shopping cart (3)** | `POST /register` → éxito |
| 4 | Click en **Shopping cart** | Las mismas 2 líneas: Computing and Internet ×2 y Fiction ×1; Sub-Total **44.00** [OBS: el carrito y las direcciones del invitado se transfirieron] | 200 |
| 5 | Vaciar el carrito y **Log out** | — | — |

**Payload de API:** igual a RG-SM01, con `Email: "prueba.maty1.202610131530b@example.com"`.

---

### RG-RG03 — Formatos de email inválidos (tabla de particiones)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** · **FE** |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **REG-02** · Matriz **M9** |
| **Datos** | **Prueba Maty4** (nombres) + emails de la tabla |

| Variante | Email ingresado | Esperado |
|---|---|---|
| a | `pruebamaty4` | “Wrong email” [OBS] |
| b | `prueba.maty4@` | “Wrong email” [OBS] |
| c | `@example.com` | “Wrong email” [OBS] |
| d | `prueba maty4@example.com` (con espacio) | “Wrong email” [OBS] |
| e | `prueba.maty4@example` (sin TLD) | [REQ?] hoy probablemente lo acepta la regex del cliente |
| f | `prueba.maty4..x@example.com` (doble punto) | [REQ?] |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `/register`; First name `Prueba Maty4`, Last name `QA Email`, contraseñas válidas e iguales | — | — |
| 2 | En **Email** escribir la variante **a** y hacer click fuera del campo | Mensaje rojo “**Wrong email**” bajo el campo | — |
| 3 | Click en **Register** | No se envía | Sin `POST` |
| 4 | Repetir los pasos 2–3 con las variantes b, c y d | Mismo mensaje | Sin `POST` |
| 5 | Repetir con e y f; anotar el resultado | Registrar lo observado | Si se envía, verificar la respuesta del servidor |

**Payload de API (servidor sin cliente):**
```json
{ "__RequestVerificationToken": "<token>", "FirstName": "Prueba Maty4", "LastName": "QA Email", "Email": "pruebamaty4", "Password": "PMaty4#Aa1", "ConfirmPassword": "PMaty4#Aa1", "register-button": "Register" }
```
Esperado: `200 text/html` con “Wrong email”; sin cuenta creada [HIP: validación del servidor no verificada para este campo].

---

### RG-RG04 — Email duplicado con otra combinación de mayúsculas
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** · **BVA** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **REG-19**, H-04 |
| **Datos** | **Prueba Maty3** + el email de Prueba Maty1 en MAYÚSCULAS |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | `/register` con First name `Prueba Maty3`, Last name `QA Mayus`, Email `PRUEBA.MATY1.{AAAAMMDDHHmm}@EXAMPLE.COM`, contraseñas iguales → **Register** | Mensaje de email ya existente (igual que en RG-SN03) | No se crea una segunda cuenta [HIP; dato de apoyo: el login no distingue mayúsculas en el email, OBS] |
| 2 | Si el registro **se completa**, anotarlo como defecto (cuentas duplicadas por mayúsculas) | — | — |

**Payload de API**
```json
{ "__RequestVerificationToken": "<token>", "FirstName": "Prueba Maty3", "LastName": "QA Mayus", "Email": "PRUEBA.MATY1.202610131530@EXAMPLE.COM", "Password": "<PMaty3#…>", "ConfirmPassword": "<PMaty3#…>", "register-button": "Register" }
```

---

### RG-RG05 — Valores límite de la contraseña: longitud mínima (5 / 6 / 7)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v1 **REG-11/12** · Matriz **M9** (mínimo 6) |
| **Datos** | **Prueba Maty5** |

| Valor | Contraseña | Esperado |
|---|---|---|
| Límite − 1 | `PMt5#` (5) | “**The password should have at least 6 characters.**” [OBS] |
| Límite | `PMt5#a` (6) | Aceptada [OBS] |
| Límite + 1 | `PMt5#ab` (7) | Aceptada |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | `/register` con los datos de Prueba Maty5 y la contraseña de **5** caracteres en ambos campos | Mensaje de mínimo 6 al salir del campo; **Register** no envía | Sin `POST` |
| 2 | Cambiar a la contraseña de **6** caracteres (ambos campos) | Sin mensaje | — |
| 3 | Click en **Register** | Registro confirmado | `POST /register` → éxito |
| 4 | **Log out**; verificar el login con esa contraseña de 6 caracteres | Login OK | 302 |
| 5 | (Variante 7 caracteres) repetir en un incógnito nuevo con `prueba.maty5.{AAAAMMDDHHmm}c@example.com` | Registro OK | Éxito |

**Payload de API (5 caracteres, sin cliente):**
```json
{ "__RequestVerificationToken": "<token>", "FirstName": "Prueba Maty5", "LastName": "QA BVA", "Email": "prueba.maty5.202610131530@example.com", "Password": "PMt5#", "ConfirmPassword": "PMt5#", "register-button": "Register" }
```
Esperado: `200 text/html` con el mensaje de mínimo [HIP: regla en el servidor].

---

### RG-RG06 — Valores límite de la contraseña: longitud máxima (999 / 1000)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** · **FE** |
| **Prioridad** | P3 |
| **Trazabilidad** | Plan v1 **REG-13** · Matriz **M9** (`data-val-length-max = 999`) |
| **Datos** | **Prueba Maty5** (email con sufijo `d` y `e`) |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Generar el texto de 999 caracteres (§0.4) y pegarlo en Password y Confirm | El campo acepta el texto (no tiene `maxlength`) [OBS]; sin desbordar el layout | — |
| 2 | Completar el resto con `prueba.maty5.{…}d@example.com` → **Register** | Registro OK | Éxito |
| 3 | Incógnito nuevo; repetir con 1000 caracteres y el email `…e@…` | Mensaje de longitud máxima, o rechazo controlado [REQ?: texto] | Nunca `/errorpage.htm` |

**Payload de API:** igual a RG-RG05 con `Password` de 999 / 1000 caracteres.

---

### RG-RG07 — Nombres con caracteres internacionales
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** · **UX** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **REG-20** |
| **Datos** | **Prueba Maty6** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | `/register` con First name `Prueba Maty6 María José`, Last name `QA Ñandú-O'Brien Pérez`, su email y contraseñas → **Register** | Registro OK | Éxito |
| 2 | Ir a **Customer info** | Acentos, ñ, apóstrofo y guion se muestran **sin corromper** (no `MarÃ­a`, no `&#39;`) | El HTML trae los valores correctamente codificados |
| 3 | **Log out** | — | — |

**Payload de API**
```json
{ "__RequestVerificationToken": "<token>", "Gender": "F", "FirstName": "Prueba Maty6 María José", "LastName": "QA Ñandú-O'Brien Pérez", "Email": "prueba.maty6.202610131530@example.com", "Password": "<PMaty6#…>", "ConfirmPassword": "<PMaty6#…>", "register-button": "Register" }
```

---

### RG-RG08 — HTML o scripts en los campos de nombre
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** · **API** (seguridad básica) |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **REG-21** · Matriz **F-07** (HTML en la búsqueda → `/errorpage.htm`) |
| **Datos** | **Prueba Maty7** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | `/register` con First name `Prueba Maty7 <b>x</b>`, Last name `QA <script>alert(1)</script>` y el resto válido → **Register** | **Esperado:** rechazo con un mensaje claro, o registro con los valores **escapados** (se ven como texto, nunca se ejecuta un `alert`) | **Nunca** `/errorpage.htm` [REQ?] |
| 2 | Anotar el resultado real | Si aparece “We're sorry, an internal error occurred” → defecto (excepción no controlada, como F-07) [HIP] | — |
| 3 | Si se registró: ir a **Customer info** y al header | Se ven como texto literal; no hay ventanas emergentes | — |

**Payload de API**
```json
{ "__RequestVerificationToken": "<token>", "FirstName": "Prueba Maty7 <b>x</b>", "LastName": "QA <script>alert(1)</script>", "Email": "prueba.maty7.202610131530@example.com", "Password": "<PMaty7#…>", "ConfirmPassword": "<PMaty7#…>", "register-button": "Register" }
```

---

### RG-RG09 — Desbordamiento visual con un nombre muy largo
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **FE** · **BVA** |
| **Prioridad** | P3 |
| **Trazabilidad** | Plan v1 **REG-10** (longitudes, Q-02) |
| **Datos** | **Prueba Maty8** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Pegar el First name largo (§0.4) | El campo acepta el texto (no tiene `maxlength`) [OBS]; el input no rompe el layout | — |
| 2 | Completar el resto → **Register** | Registro OK **o** mensaje de longitud máxima [REQ?] | Nunca `/errorpage.htm` |
| 3 | Si se registró: revisar **Customer info**, el header y el bloque de Mi cuenta | El texto se recorta, ajusta o hace scroll **sin** superponerse a otros elementos ni generar scroll horizontal de la página | — |
| 4 | Reducir la ventana a 375 px de ancho (DevTools → modo dispositivo) | Sigue sin desbordar | — |

**Payload de API:** igual a RG-SM01 con `FirstName` de ~252 caracteres.

---

### RG-RG10 — Campos con solo espacios
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **FE** · **DAT** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **REG-06** |
| **Datos** | **Prueba Maty4** (email con sufijo `s`) |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | First name = 3 espacios; Last name = 3 espacios; resto válido → **Register** | “First name is required.” / “Last name is required.” [HIP: el `required` del cliente recorta espacios] | Sin `POST` |
| 2 | Enviar por API los mismos valores | Rechazo del servidor | [REQ?] |

**Payload de API**
```json
{ "__RequestVerificationToken": "<token>", "FirstName": "   ", "LastName": "   ", "Email": "prueba.maty4.202610131530s@example.com", "Password": "PMaty4#Aa1", "ConfirmPassword": "PMaty4#Aa1", "register-button": "Register" }
```

---

### RG-RG11 — Registro sin antiforgery token (API)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **API** · **BVA** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **REG-API-03** · Matriz **M9**, **F-07** · Colección Postman `REG-API-03` |
| **Datos** | **Prueba Maty4** (email con sufijo `t`) |

| # | Acción (Postman) | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Crear un request `POST {{baseUrl}}/register`, Body x-www-form-urlencoded **sin** `__RequestVerificationToken`; Settings → Follow redirects **OFF** | — | — |
| 2 | Send | — | **Esperado:** rechazo controlado (400/403 o mensaje). **Observado:** redirect a `/errorpage.htm` con 200 → **Falla conocida F-07** |
| 3 | Verificar que no se creó la cuenta (intentar login con ese email) | “No customer account found” | — |

**Payload de API**
```json
{ "FirstName": "Prueba Maty4", "LastName": "QA SinToken", "Email": "prueba.maty4.202610131530t@example.com", "Password": "PMaty4#Aa1", "ConfirmPassword": "PMaty4#Aa1", "register-button": "Register" }
```

---

### RG-RG12 — Las reglas del registro se aplican en el servidor (sin el cliente)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **API** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **REG-API-01/02/04** · Colección Postman `REG-00`, `REG-API-01` |
| **Datos** | **Prueba Maty4** (email con sufijo `u`) |

| # | Acción (Postman) | Resultado esperado — Backend |
|---|---|---|
| 1 | `GET {{baseUrl}}/register` → guardar `__RequestVerificationToken` en `{{rvToken}}` (script de Tests) | 200; token no vacío [OBS] |
| 2 | `POST /register` con el token y todos los campos vacíos | 200 HTML con 5 mensajes de requerido; sin cuenta [OBS] |
| 3 | `POST /register` con el token, `Email=pruebamaty4` y contraseñas distintas | 200 HTML con “Wrong email” y “…do not match.” [HIP] |
| 4 | `POST /register` con el token y `Password=PMt4#` (5) | 200 HTML con el mensaje de mínimo [HIP] |

**Payload de API (paso 3)**
```json
{ "__RequestVerificationToken": "{{rvToken}}", "FirstName": "Prueba Maty4", "LastName": "QA Server", "Email": "pruebamaty4", "Password": "PMaty4#Aa1", "ConfirmPassword": "PMaty4#Bb2", "register-button": "Register" }
```

---

### RG-RG13 — Experiencia de usuario del formulario (foco, tabulación, mensajes)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **UX** · **FE** |
| **Prioridad** | P3 |
| **Trazabilidad** | Plan v1 **REG-24**, **REG-05** |
| **Datos** | **Prueba Maty4** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | En `/register`, click en el primer campo y recorrer con **Tab** | Orden lógico: Gender → First name → Last name → Email → Password → Confirm → Register | — |
| 2 | Click en cada label (“First name:”, etc.) | El foco va al campo correspondiente (label asociado) [HIP] | — |
| 3 | Completar solo First name y Email y click en **Register** | Solo aparecen errores en los campos vacíos; **los datos ya cargados se conservan** | Sin `POST` |
| 4 | Corregir los campos uno por uno | Cada mensaje desaparece al corregir su campo | — |
| 5 | Verificar el contraste y el tamaño de los mensajes rojos | Legibles; asociados visualmente al campo | — |

**Payload de API:** no aplica (validación del cliente).

---

### RG-RG14 — Doble envío y botón Back después de registrarse
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** · **UX** |
| **Prioridad** | P3 |
| **Trazabilidad** | Plan v1 **REG-23** |
| **Datos** | **Prueba Maty2** (email con sufijo `r`) |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Completar `/register` con Prueba Maty2 y hacer **doble click rápido** en **Register** | Un solo registro; confirmación normal | Un solo Customer creado; si hay un segundo `POST`, responde email ya existente |
| 2 | Botón **Back** del navegador | Vuelve al formulario o a una página cacheada | — |
| 3 | Si el navegador ofrece reenviar el formulario, aceptar | Mensaje de email ya existente; no se duplica la cuenta [HIP] | — |
| 4 | **Log out** | — | — |

**Payload de API:** igual a RG-SN01 enviado dos veces seguidas; la segunda respuesta debe contener el error de email duplicado.

---

### RG-RG15 — Usuario logueado que entra a la página de registro
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **UX** |
| **Prioridad** | P3 |
| **Trazabilidad** | Plan v1 **REG-25** (Q-25) |
| **Datos** | **Prueba Maty9** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Iniciar sesión con Prueba Maty9 | Header con el email | 302 |
| 2 | Escribir `/register` en la barra | **[REQ?]** Redirigir a Mi cuenta, o mostrar el formulario. Anotar el comportamiento | `GET /register` → 200 o 302 |
| 3 | Si se muestra el formulario, **no** enviarlo; **Log out** | — | — |

**Payload de API:** `GET /register` con la cookie de sesión.

---

## 2. MÓDULO LOGIN — Regresión

---

### LG-RG01 — Los mensajes de error no revelan si la cuenta existe (enumeración)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **API** · **UX** (seguridad) |
| **Prioridad** | P1 |
| **Trazabilidad** | Especificación **TC-LOG-02/03** · Matriz **F-02** · Colección `LOGIN-02`, `LOGIN-03` |
| **Datos** | **Prueba Maty9** (contraseña incorrecta `PMaty9#Incorrecta0`) · **Prueba Maty10** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | `/login` con el email de Prueba Maty9 y `PMaty9#Incorrecta0` → **Log in** | Copiar el texto del bloque rojo | `POST /login` → 200 HTML |
| 2 | `/login` con `prueba.maty10.noexiste@example.com` y `PMaty10#Cualquiera1` → **Log in** | Copiar el texto del bloque rojo | 200 HTML |
| 3 | Comparar ambos textos | **Esperado:** idénticos (mensaje genérico) [REQ? PO-01]. **Observado:** “The credentials provided are incorrect” vs “No customer account found” → **Falla conocida F-02** | — |
| 4 | Repetir con `/passwordrecovery` usando `prueba.maty10.noexiste@example.com` | **Esperado:** mensaje genérico. **Observado:** “Email not found.” → F-02 | 200 HTML |

**Payloads de API**
```json
{ "Email": "prueba.maty9.202610131530@example.com", "Password": "PMaty9#Incorrecta0", "RememberMe": "false" }
```
```json
{ "Email": "prueba.maty10.noexiste@example.com", "Password": "PMaty10#Cualquiera1", "RememberMe": "false" }
```

---

### LG-RG02 — Login con el email en MAYÚSCULAS
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** · **BVA** |
| **Prioridad** | P2 |
| **Trazabilidad** | Especificación **N-02** · Colección `LOGIN-06` |
| **Datos** | **Prueba Maty9** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | `/login` con el email de Prueba Maty9 **en mayúsculas** y la contraseña correcta → **Log in** | Login exitoso; header con el email | `POST /login` → 302 [OBS: la búsqueda no distingue mayúsculas; el login completo es HIP] |
| 2 | **Log out** | — | 302 |

**Payload de API**
```json
{ "Email": "PRUEBA.MATY9.202610131530@EXAMPLE.COM", "Password": "<PMaty9#…>", "RememberMe": "false" }
```

---

### LG-RG03 — Login con espacios antes y después del email
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** · **UX** |
| **Prioridad** | P2 |
| **Trazabilidad** | Especificación **N-03**, **PO-02** · Colección `LOGIN-05` |
| **Datos** | **Prueba Maty9** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | En Email escribir un espacio + el email de Prueba Maty9 + un espacio; contraseña correcta → **Log in** | **Esperado:** login exitoso (se recortan los espacios) [REQ?]. **Observado:** “No customer account found” → **Falla conocida N-03** | `POST /login` → 200 HTML (observado) |
| 2 | Si autenticó, **Log out** | — | — |

**Payload de API**
```json
{ "Email": " prueba.maty9.202610131530@example.com ", "Password": "<PMaty9#…>", "RememberMe": "false" }
```

---

### LG-RG04 — La contraseña distingue mayúsculas y espacios
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **LOG-06** |
| **Datos** | **Prueba Maty9** |

| Variante | Contraseña ingresada | Esperado |
|---|---|---|
| a | La correcta con las letras en mayúscula/minúscula invertidas | Rechazo [HIP] |
| b | La correcta + un espacio al final | Rechazo [HIP] |
| c | La correcta | Login OK |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | `/login` con la variante **a** → **Log in** | “Login was unsuccessful… The credentials provided are incorrect” | 200 |
| 2 | Variante **b** | Mismo mensaje | 200 |
| 3 | Variante **c** | Login OK | 302 |
| 4 | **Log out** | — | — |

**Payload de API:** `{ "Email": "<email Maty9>", "Password": "<variante>", "RememberMe": "false" }`.

---

### LG-RG05 — Remember me conserva la sesión al cerrar el navegador
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** · **UX** |
| **Prioridad** | P3 (fuera de la regresión obligatoria del Plan v2 §8.1 → exploratorio) |
| **Trazabilidad** | Plan v1 **LOG-09/10** · Especificación **PO-10** |
| **Datos** | **Prueba Maty9** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Perfil normal de Chrome (**no** incógnito). `/login` con Prueba Maty9, **marcar Remember me?** → **Log in** | Autenticado | `POST /login` con `RememberMe=true` → 302; cookie **persistente** (con fecha `Expires`, ver DevTools → Application → Cookies) [HIP] |
| 2 | Cerrar **todas** las ventanas de Chrome y volver a abrir el sitio | Sigue autenticado [HIP] | La cookie se reenvía |
| 3 | **Log out**. Repetir **sin** Remember me | Al reabrir, debería pedir login [HIP / REQ?] | Cookie de sesión (sin `Expires`) |

**Payload de API**
```json
{ "Email": "prueba.maty9.202610131530@example.com", "Password": "<PMaty9#…>", "RememberMe": "true" }
```

---

### LG-RG06 — Después del login vuelve a la página privada solicitada (returnUrl)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **UX** |
| **Prioridad** | P3 (exploratorio según Plan v2 §8.1) |
| **Trazabilidad** | Plan v1 **LOG-13** · Especificación **PO-03** |
| **Datos** | **Prueba Maty9** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo. Ingresar a `/customer/orders` | Redirige al login; la URL incluye `ReturnUrl` [HIP] | 302 → `/login?ReturnUrl=%2fcustomer%2forders` [HIP] |
| 2 | Iniciar sesión con Prueba Maty9 | Llega a **Orders** (no a la Home) [HIP] | `POST /login?ReturnUrl=…` → 302 → `/customer/orders` |
| 3 | **Log out** | — | — |

**Payload de API:** `POST /login?ReturnUrl=%2fcustomer%2forders` con el body de LG-SM01.

---

### LG-RG07 — Login desde el checkout (“Checkout as Guest” / “Returning Customer”)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **UX** · **DAT** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **LOG-14** · Matriz **M8** |
| **Datos** | **Prueba Maty9** + **Prueba Maty12** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo; agregar Computing and Internet; ir a **Shopping cart**; marcar los términos → **Checkout** | Página “Welcome, Please Sign In!” con **Checkout as Guest** | 302 → `/login/checkoutasguest` [OBS] |
| 2 | En **Returning Customer**, iniciar sesión con Prueba Maty9 | Continúa al checkout (Billing address) con el producto [HIP] | `POST /login/checkoutasguest` → 302 → `/checkout` → `/onepagecheckout` [HIP] |
| 3 | Volver a **Shopping cart** | Contiene Computing and Internet (no se perdió al loguearse) | — |
| 4 | Vaciar el carrito y **Log out** | — | — |

**Payload de API**
```json
{ "Email": "prueba.maty9.202610131530@example.com", "Password": "<PMaty9#…>", "RememberMe": "false" }
```
→ `POST /login/checkoutasguest`

---

### LG-RG08 — Fusión del carrito del invitado con el del usuario al loguearse
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** |
| **Prioridad** | P2 (exploratorio según Plan v2 §2.2) |
| **Trazabilidad** | Plan v1 **LOG-15**, riesgo **R-07** · Especificación **PO-05** |
| **Datos** | **Prueba Maty17** + **Prueba Maty11** + **Prueba Maty13** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Iniciar sesión con Prueba Maty17; agregar **14.1-inch Laptop** (Prueba Maty11); **Log out** | Al salir, el header del invitado muestra (0) | El ítem queda guardado en la cuenta Maty17 |
| 2 | Como invitado, agregar **Fiction** (Prueba Maty13) | Header (1) | — |
| 3 | Iniciar sesión con Prueba Maty17 | Header **(2)** | — |
| 4 | Abrir **Shopping cart** | **Esperado:** Laptop ×1 **y** Fiction ×1 [HIP / REQ?]. Anotar si se pierde alguno | — |
| 5 | Vaciar el carrito y **Log out** | — | — |

**Payload de API:** `POST /addproducttocart/catalog/31/1/1` (con sesión) y `POST /addproducttocart/catalog/45/1/1` (invitado); luego `POST /login` y `GET /cart`.

---

### LG-RG09 — Botón Back después del logout no expone datos privados
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **UX** (seguridad) |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **LOG-12** · Matriz **M13.5** |
| **Datos** | **Prueba Maty9** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Login con Prueba Maty9; abrir **My account → Customer info** | Datos visibles | 200 |
| 2 | **Log out** | Home como invitado | 302 |
| 3 | Botón **Back** del navegador | No muestra los datos privados, o si muestra una copia en caché, al recargar o hacer cualquier acción pide login [HIP] | `GET /customer/info` → 302 → `/login` |

**Payload de API:** `GET /customer/info` sin cookie → 302 [OBS]; header de respuesta `Cache-Control: private` [OBS].

---

### LG-RG10 — Controles visuales del formulario de login
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **FE** · **UX** |
| **Prioridad** | P2 |
| **Trazabilidad** | Especificación **N-04** · Matriz **M9** |
| **Datos** | **Prueba Maty10** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Abrir `/login` | Labels “Email:” y “Password:”; checkbox **Remember me?** **desmarcado**; link **Forgot password?**; botón **Log in** [OBS] | — |
| 2 | Escribir en Password | Enmascarado (`type="password"`) [OBS] | — |
| 3 | Login con Prueba Maty10 | Bloque rojo arriba del formulario; **el email se conserva y la contraseña se vacía** [OBS] | 200 |
| 4 | Click en **Forgot password?** | Abre **Password recovery** | `GET /passwordrecovery` → 200 |
| 5 | Volver y click en **Register** (bloque New Customer) | Abre `/register` | 200 |
| 6 | Observación: el campo Email es `type="text"` y no valida el formato en el cliente [OBS] | Registrar como mejora (consistencia con Registro) | — |

**Payload de API:** no aplica (UI).

---

### LG-RG11 — HTML en el campo Email del login
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** · **API** |
| **Prioridad** | P3 |
| **Trazabilidad** | Especificación **TC-LOG-03** (variante) · Matriz **F-07** |
| **Datos** | **Prueba Maty10** (variante HTML): Email `<b>prueba.maty10</b>@example.com` |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | `/login` con el email con HTML y cualquier contraseña → **Log in** | **Esperado:** mensaje de login fallido. Anotar si aparece la página de error genérica | **Nunca** `/errorpage.htm` [HIP: la búsqueda con HTML sí la provoca, F-07] |

**Payload de API**
```json
{ "Email": "<b>prueba.maty10</b>@example.com", "Password": "PMaty10#Cualquiera1", "RememberMe": "false" }
```

---

### LG-RG12 — Email extremadamente largo en el login
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** |
| **Prioridad** | P3 |
| **Trazabilidad** | Especificación **TC-LOG-03** (variante) |
| **Datos** | **Prueba Maty10** (variante larga): `prueba.maty10.` + 240 × `a` + `@example.com` (~266 caracteres) |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Generar el texto en la Console: `copy('prueba.maty10.' + 'a'.repeat(240) + '@example.com')` | — | — |
| 2 | Pegar en Email, cualquier contraseña → **Log in** | “No customer account found” o un mensaje controlado; el campo no rompe el layout | 200; nunca `/errorpage.htm` |

**Payload de API:** `{ "Email": "<266 caracteres>", "Password": "x", "RememberMe": "false" }`.

---

### LG-RG13 — Contrato técnico del login y del logout (API)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **API** |
| **Prioridad** | P2 |
| **Trazabilidad** | Colección `LOGIN-01`, `LOGIN-01b`, `LOGOUT-01`, `AUTH-01` · Matriz **F-03**, **F-20** · `CASO_PRUEBA_API_DOCUMENTADO.md` |
| **Datos** | **Prueba Maty9** |

| # | Llamada (Postman, Follow redirects **OFF**) | Resultado esperado — Backend |
|---|---|---|
| 1 | `POST {{baseUrl}}/login` con las credenciales de Prueba Maty9 | **302**; `Location` presente [HIP: `/`]; `Set-Cookie` de autenticación |
| 2 | `GET {{baseUrl}}/customer/info` (Postman reenvía la cookie) | **200**; `#Email` = email de Prueba Maty9 |
| 3 | `GET {{baseUrl}}/logout` | **302** → `/` |
| 4 | `GET {{baseUrl}}/customer/info` | **302**, `Location` contiene `/login` [OBS] |
| 5 | Revisar el form de `/login` | **Observado:** no tiene `__RequestVerificationToken` → **F-03** (riesgo CSRF). El logout es GET → **F-20** |

**Payload de API (paso 1)**
```json
{ "Email": "prueba.maty9.202610131530@example.com", "Password": "{{testUserPassword}}", "RememberMe": "false" }
```

---

### LG-RG14 — Intentos fallidos consecutivos (bloqueo de cuenta)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** (seguridad) |
| **Prioridad** | P3 (exploratorio; Plan v2 §8.1) |
| **Trazabilidad** | Plan v1 **LOG-SEC-01** · Especificación **PO-04** |
| **Datos** | **Prueba Maty18** (cuenta **dedicada**, nunca la de Maty9) |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Login con Prueba Maty18 y una contraseña incorrecta, **10 veces seguidas** | Mismo mensaje de error cada vez, o un aviso de cuenta bloqueada a partir del intento N [REQ?] | 200 en cada intento |
| 2 | Intento 11 con la contraseña **correcta** | Si hay bloqueo: aviso de bloqueo. Si no: login OK → registrar **riesgo de fuerza bruta** | 302 o 200 |
| 3 | **Log out** si autenticó | — | — |

**Payload de API:** 10 × `{ "Email": "prueba.maty18.202610131530@example.com", "Password": "PMaty18#Mal{n}", "RememberMe": "false" }` con `n` = 1..10.

---

### LG-RG15 — Tiempo de respuesta del login
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **API** (no funcional ligera) |
| **Prioridad** | P3 |
| **Trazabilidad** | Plan v1 **REG-NF-01**, **LOG-08** |
| **Datos** | **Prueba Maty9** · **Prueba Maty10** |

| # | Acción | Resultado esperado — Backend |
|---|---|---|
| 1 | En DevTools → Network, ejecutar 5 logins fallidos con Prueba Maty9 (contraseña incorrecta) y anotar el **Time** de cada `POST /login` | Cada uno < 3 s (SLA propuesto) [REQ? Q-13]. Observado: 418–507 ms |
| 2 | Repetir 5 veces con Prueba Maty10 | Sin diferencia apreciable de tiempo frente al paso 1 (no hay enumeración por tiempo) [HIP] |

**Payload de API:** los de LG-RG01.

---

## 3. MÓDULO CARRITO DE COMPRAS — Regresión

> **Obtener `{cartItemId}`** (lo necesitan los payloads de `/cart`): en **Shopping cart** → DevTools → Elements → buscar `input[name="removefromcart"]` → su `value` es el ID de la línea. El campo de cantidad se llama `itemquantity{cartItemId}`.

---

### CR-RG01 — Valores límite de la cantidad máxima (10000 / 10001)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v1 **CAR-17**, **CAR-API-05** · Matriz **M5.1/M5.2** · `REPORTE_DE_DEFECTO.md` EV-05 |
| **Datos** | **Prueba Maty13** (Fiction) |

| Valor | Esperado |
|---|---|
| 10000 (límite) | Aceptado; Total de línea 240000.00 |
| 10001 (límite + 1) | “**The maximum quantity allowed for purchase is 10000.**” en la línea; la cantidad **se conserva** en el valor anterior [OBS] |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo; agregar Fiction; ir a **Shopping cart** | Qty 1 | — |
| 2 | Qty = `10001` → **Update shopping cart** | Mensaje rojo en la línea; Qty vuelve a **1**; Sub-Total sin cambio [OBS] | `POST /cart` → 200 HTML |
| 3 | Qty = `10000` → **Update shopping cart** | Qty 10000; Total **240000.00**; header **(10000)** [HIP] | 200 |
| 4 | En la ficha de Fiction: Qty `10001` → **Add to cart** | Barra roja persistente con el mensaje de máximo | `POST /addproducttocart/details/45/1` → `success:false` |
| 5 | Vaciar el carrito | — | — |

**Payload de API**
```json
{ "itemquantity{cartItemId}": "10001", "updatecart": "Update shopping cart" }
```
```json
// POST /addproducttocart/details/45/1   body: { "addtocart_45.EnteredQuantity": "10001" }
{ "success": false, "message": ["The maximum quantity allowed for purchase is 10000."] }
```

---

### CR-RG02 — Cantidad 0 en el carrito
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** · **DAT** |
| **Prioridad** | P1 |
| **Trazabilidad** | **DEF-01** · Especificación **TC-CART-02**, **N-05** · Colección `CART-API-11` |
| **Datos** | **Prueba Maty12** + **Prueba Maty13** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo; agregar Computing and Internet y Fiction; ir a **Shopping cart** | 2 líneas, Qty 1 | — |
| 2 | Qty de Fiction = `0` → **Update shopping cart** | **Esperado:** mensaje de error en la línea, Qty se conserva en 1 y el producto **no** se elimina. **Observado:** la línea desaparece sin mensaje → **Falla conocida DEF-01** | `POST /cart` → 200 HTML |
| 3 | Verificar el header y el Sub-Total | Esperado: (2) y 34.00 sin cambios | — |

**Payload de API**
```json
{ "itemquantity{cartItemId}": "0", "updatecart": "Update shopping cart" }
```

---

### CR-RG03 — Cantidad negativa en el carrito
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** |
| **Prioridad** | P1 |
| **Trazabilidad** | **DEF-01** · Matriz **F-05** · Plan v1 **CAR-15** |
| **Datos** | **Prueba Maty13** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Carrito con Fiction ×1 | — | — |
| 2 | Qty = `-1` → **Update shopping cart** | **Esperado:** error, Qty se conserva, la línea no se elimina. **Observado:** se elimina sin mensaje → **DEF-01** | 200 |
| 3 | Repetir con `-10000` | Mismo criterio | — |
| 4 | En la ficha: Qty `-1` → **Add to cart** | Barra roja “Quantity should be positive” [OBS] | `success:false` |

**Payload de API**
```json
{ "itemquantity{cartItemId}": "-1", "updatecart": "Update shopping cart" }
```
```json
// POST /addproducttocart/details/45/1   body: { "addtocart_45.EnteredQuantity": "-1" }
{ "success": false, "message": ["Quantity should be positive"] }
```

---

### CR-RG04 — Cantidad no numérica o vacía
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** · **FE** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **CAR-16** · Matriz **M5.2** |
| **Datos** | **Prueba Maty13** |

| Variante | Qty | Esperado |
|---|---|---|
| a | `abc` | Error de validación; Qty se conserva. **Observado:** la línea desaparece sin mensaje [OBS] |
| b | *(vacío)* | Error de validación [REQ?] |
| c | `1.5` | Error de validación [REQ?] |
| d | ` 2 ` (con espacios) | Se interpreta 2 o error claro [HIP] |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Carrito con Fiction ×1; aplicar la variante **a** → **Update** | Ver la tabla | 200 HTML |
| 2 | Volver a agregar Fiction si desapareció; repetir con b, c y d | Ver la tabla | — |
| 3 | En la ficha, Qty `abc` → **Add to cart** | Mensaje del cliente (el campo tiene `data-val-number`) o del servidor “Quantity should be positive” [OBS] | — |

**Payload de API:** `{ "itemquantity{cartItemId}": "abc", "updatecart": "Update shopping cart" }`.

---

### CR-RG05 — El mismo producto agregado dos veces suma la cantidad en una línea
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **CAR-08** (H-08) · Especificación **PO-09** |
| **Datos** | **Prueba Maty11** (Laptop) |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo; Home/listado → **Add to cart** de 14.1-inch Laptop | Header (1) | `success:true`, `"(1)"` |
| 2 | **Add to cart** de Laptop otra vez | Header (2) | `"(2)"` |
| 3 | Ir a **Shopping cart** | **Una sola** línea Laptop · Qty **2** · Total **3180.00** [HIP] | — |
| 4 | Vaciar el carrito | — | — |

**Payload de API:** 2 × `POST /addproducttocart/catalog/31/1/1`.

---

### CR-RG06 — Configurable: distintas configuraciones generan líneas separadas con su precio
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **CAR-03**, **CAR-09** · Matriz **M4** |
| **Datos** | **Prueba Maty14** (config A = §1.2 del Smoke) + config B |

**Config B:** Processor 2.2 GHz (`13`, +0) · RAM 8GB (`17`, +60) · HDD 400 GB (`19`, +100) · OS Windows 10 (`21`, +60) · Software Microsoft Office (`22`, +50) → precio esperado **1470.00** [HIP].

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Agregar Build your own computer con la **config A** | Header (1) | `success:true` |
| 2 | Agregar con la **config B** | Header (2) | `success:true` |
| 3 | Ir a **Shopping cart** | **Dos líneas** con los atributos de cada una; precios **1235.00** y **1470.00**; Sub-Total **2705.00** [HIP] | — |
| 4 | Agregar otra vez la **config A** | La línea A pasa a Qty 2 (no se crea una tercera línea) [HIP] | — |
| 5 | Vaciar el carrito | — | — |

**Payload de API (config B)**
```json
{ "product_attribute_16_5_4": "13", "product_attribute_16_6_5": "17", "product_attribute_16_3_6": "19", "product_attribute_16_4_7": "21", "product_attribute_16_8_8": "22", "addtocart_16.EnteredQuantity": "1" }
```

---

### CR-RG07 — Configurable sin atributos obligatorios
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **FE** · **BVA** |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v1 **CAR-04** · Matriz **M5.1** · Colección `CART-API-08` |
| **Datos** | **Prueba Maty14** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ficha de Build your own computer: **no** elegir HDD (no tiene valor por defecto) → **Add to cart** | Barra roja persistente “**Please select HDD**”; header sin cambios [OBS] | `success:false` |
| 2 | Desde el listado (Computers → Desktops), **Add to cart** de Build your own computer | Navega a la ficha sin agregar [OBS] | `{"redirect":"/build-your-own-computer"}` |

**Payload de API (sin atributos)**
```json
// POST /addproducttocart/details/16/1   body: { "addtocart_16.EnteredQuantity": "1" }
{ "success": false, "message": ["Please select Processor", "Please select RAM", "Please select HDD", "Please select OS"] }
```

---

### CR-RG08 — Gift card: validaciones de los campos del destinatario y remitente
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **FE** · **BVA** · **DAT** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **CAR-07** · Matriz **M4**, **M5.1** |
| **Datos** | **Prueba Maty15** + **Prueba Maty19** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ficha de $25 Virtual Gift Card; dejar todo vacío → **Add to cart** | Barra roja: “Enter valid recipient name”, “Enter valid recipient email”, “Enter valid sender name”, “Enter valid sender email” [OBS] (no hay validación en el cliente) | `success:false` |
| 2 | Completar con los datos de Prueba Maty19, pero Recipient email = `prueba.maty19` y Sender email = `x` | “Enter valid recipient email”, “Enter valid sender email” [OBS] | `success:false` |
| 3 | Corregir los emails con los de Prueba Maty19 → **Add to cart** | Barra verde; header (1) | `success:true` |
| 4 | Ir a **Shopping cart** | La línea muestra los datos de la gift card (destinatario y remitente “Prueba Maty19…”) [HIP] | — |
| 5 | Vaciar el carrito | — | — |

**Payload de API (paso 3)**
```json
{
  "giftcard_2.RecipientName": "Prueba Maty19 Destinatario",
  "giftcard_2.RecipientEmail": "prueba.maty19.dest@example.com",
  "giftcard_2.SenderName": "Prueba Maty19 Remitente",
  "giftcard_2.SenderEmail": "prueba.maty19.rem@example.com",
  "giftcard_2.Message": "Prueba Maty19 mensaje",
  "addtocart_2.EnteredQuantity": "1"
}
```

---

### CR-RG09 — Productos en stock sin botón de compra
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **FE** · **DAT** · **API** |
| **Prioridad** | P1 |
| **Trazabilidad** | **DEF-02** · Especificación **N-07** · Colección `CART-API-06` |
| **Datos** | **Prueba Maty21** (Science, id 27) |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | BOOKS → ubicar **Science** | **Esperado:** botón **Add to cart** visible y seleccionable. **Observado:** sin botón → **Falla conocida DEF-02** | — |
| 2 | Click en **Science** (ficha) | “Availability: In stock”, precio 51.00. **Esperado:** botón y campo de cantidad. **Observado:** no están | — |
| 3 | (Postman) `POST /addproducttocart/catalog/27/1/1` | — | **Esperado tras el fix:** `success:true`. **Observado:** `{"success":false,"message":["Buying is disabled for this product"]}` |
| 4 | Repetir los pasos 1–3 con 2 productos más de la lista de DEF-02 (p. ej., Elite Desktop PC id 32, Used phone id 15) | Mismo criterio | — |

**Payload de API**
```http
POST https://demowebshop.tricentis.com/addproducttocart/catalog/27/1/1
X-Requested-With: XMLHttpRequest
```
```json
{ "success": false, "message": ["Buying is disabled for this product"] }
```

---

### CR-RG10 — Cupón de descuento inválido o vacío
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **BVA** · **UX** |
| **Prioridad** | P3 |
| **Trazabilidad** | Plan v1 **CAR-22** · Matriz **M5.2** |
| **Datos** | **Prueba Maty20** + **Prueba Maty12** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Carrito con Computing and Internet. En **Discount Code** escribir `PRUEBA-MATY20-CUPON` → **Apply coupon** | “The coupon code you entered couldn't be applied to your order” [OBS]; totales sin cambio | `POST /cart` → 200 |
| 2 | Campo vacío → **Apply coupon** | Mismo mensaje [OBS] | 200 |

**Payload de API**
```json
{ "discountcouponcode": "PRUEBA-MATY20-CUPON", "applydiscountcouponcode": "Apply coupon" }
```

---

### CR-RG11 — Gift card inválida en el carrito (mensaje)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **UX** · **BVA** |
| **Prioridad** | P3 |
| **Trazabilidad** | Matriz **F-08**, **F-10** · Plan v1 **CAR-23** |
| **Datos** | **Prueba Maty20** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | En **Gift Cards** escribir `PRUEBA-MATY20-GC` → **Add gift card** | **Esperado:** mensaje específico de gift card. **Observado:** “The coupon code you entered couldn't be applied to your order” → **Falla conocida F-08** | `POST /cart` → 200 |
| 2 | Anotar el tiempo de respuesta (DevTools) | < 3 s esperado; se observaron picos de 13.8 s (F-10) | — |

**Payload de API**
```json
{ "giftcardcouponcode": "PRUEBA-MATY20-GC", "applygiftcardcouponcode": "Add gift card" }
```

---

### CR-RG12 — Estimar envío desde el carrito
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **UX** · **API** |
| **Prioridad** | P3 |
| **Trazabilidad** | Plan v1 **CAR-24/25/26** · Matriz **M5.2**, **M11**, **F-09** |
| **Datos** | **Prueba Maty16** (US / New York / 10001) |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Carrito con un producto. En **Estimate shipping**: Country **United States** | El combo State se recarga con los estados de EE. UU. | `GET /country/getstatesbycountryid?countryId=1&addEmptyStateIfRequired=true` → JSON `[{id,name}]` [OBS] |
| 2 | State **New York**, Zip `10001` → **Estimate shipping** | Lista: Ground, Next Day Air, 2nd Day Air con su costo [OBS] | `POST /cart` → 200 |
| 3 | Country **Select country**, Zip vacío → **Estimate shipping** | **Esperado:** pedir el país. **Observado:** devuelve los métodos → **Falla conocida F-09** | 200 |

**Payload de API**
```json
{ "CountryId": "1", "StateProvinceId": "40", "ZipPostalCode": "10001", "estimateshipping": "Estimate shipping" }
```
```json
// GET /country/getstatesbycountryid?countryId=1&addEmptyStateIfRequired=true
[ { "id": 1, "name": "AA (Armed Forces Americas)" }, { "id": 2, "name": "AE (Armed Forces Europe)" }, "…", { "id": 40, "name": "New York" } ]
```

---

### CR-RG13 — Totales: consistencia matemática y texto “Calculated during checkout”
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **CART-05**, **R-06** · Especificación **N-06**, **PO-07** |
| **Datos** | **Prueba Maty11** ×1 + **Prueba Maty12** ×2 + **Prueba Maty13** ×1 |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Agregar Laptop ×1, Computing and Internet ×2 y Fiction ×1 | Header (4) | — |
| 2 | En **Shopping cart**, verificar cada Total de línea = Price × Qty | 1590.00 · 20.00 · 24.00 | — |
| 3 | Verificar el Sub-Total | **1634.00** | — |
| 4 | Verificar Shipping y Total | Si son números: Total = Sub-Total + Shipping + Tax. Si muestran “Calculated during checkout”: anotarlo (comportamiento variable, N-06) | — |
| 5 | Eliminar Laptop y Computing and Internet (queda solo Fiction) | Sub-Total 24.00; anotar Shipping y Total | — |
| 6 | Marcar los términos → **Checkout** (como registrado Prueba Maty9) y avanzar hasta **Confirm order** con la dirección de Prueba Maty16, Ground y Check / Money Order | En Confirm: Sub-Total = el del carrito; Payment method additional fee 5.00; Total = Sub-Total + 5.00 [OBS: cálculo verificado en la Fase 1]. **No** confirmar el pedido | `POST /checkout/OpcSavePaymentInfo/` → `goto_section: "confirm_order"` |
| 7 | Volver al carrito, vaciarlo y **Log out** | — | — |

**Payload de API (resumen de totales en Confirm):** respuesta de `OpcSavePaymentInfo` con `update_section.html` que contiene “Sub-Total: …”, “Payment method additional fee: 5.00”, “Total: …”.

---

### CR-RG14 — Persistencia del carrito al recargar, navegar y cerrar sesión
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **DAT** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **CAR-31/32**, **LOG-16/17** |
| **Datos** | **Prueba Maty9** + **Prueba Maty12** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Invitado: agregar Computing and Internet; recargar (F5) y navegar a ELECTRONICS | Header (1) en todas las páginas [HIP] | Carrito asociado a la cookie del cliente invitado |
| 2 | Borrar las cookies del sitio (DevTools → Application → Cookies → Clear) y recargar | Header (0): sesión nueva [HIP] | — |
| 3 | Login con Prueba Maty9; agregar Computing and Internet; **Log out** | Invitado con (0) [HIP] | — |
| 4 | Login de nuevo con Prueba Maty9 | Header (1): el carrito del usuario se conservó [HIP] | Carrito persistido en el servidor |
| 5 | Vaciar el carrito y **Log out** | — | — |

**Payload de API:** `GET /cart` antes y después de cada paso; comparar las líneas.

---

### CR-RG15 — Editar un producto configurable desde el carrito
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **UX** · **DAT** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **CAR-30** |
| **Datos** | **Prueba Maty14** (config A) |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Agregar Build your own computer (config A); ir a **Shopping cart** | Línea con el link **Edit** [OBS] | — |
| 2 | Click en **Edit** | Abre la ficha con la config A preseleccionada [HIP] | `GET /build-your-own-computer?updatecartitemid=…` [HIP] |
| 3 | Cambiar RAM a **8GB [+60.00]** y click en **Update** (o el botón equivalente) | Vuelve al carrito con **una** línea, RAM 8GB y precio **1275.00** [HIP] | — |
| 4 | Vaciar el carrito | — | — |

**Payload de API:** `POST /addproducttocart/details/16/1?updatecartitemid={cartItemId}` con `product_attribute_16_6_5=17` [HIP].

---

### CR-RG16 — Contrato JSON del alta al carrito (API)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **API** |
| **Prioridad** | P1 |
| **Trazabilidad** | Matriz **M5.1**, **F-13** · Colección `CART-API-01..04, 07, 09` · `GUIA_PRUEBAS_API_POSTMAN.md` §2.3.3 |
| **Datos** | **Prueba Maty12** · producto inexistente 99999 |

| # | Llamada (Postman) | Resultado esperado — Backend |
|---|---|---|
| 1 | `POST /addproducttocart/catalog/13/1/1` | 200 `application/json`; `success:true`; `message` (string); `updatetopcartsectionhtml`; `updateflyoutcartsectionhtml` [OBS] |
| 2 | `GET /cart` | La línea existe (verificación cruzada) |
| 3 | `POST /addproducttocart/details/13/1` con `EnteredQuantity=0` | `success:false`, `message` = **array** `["Quantity should be positive"]` [OBS] |
| 4 | `POST /addproducttocart/catalog/99999/1/1` | `success:false`, `message` = **string** “No product found with the specified ID” [OBS] → tipo inconsistente (F-13) |
| 5 | `GET /addproducttocart/catalog/13/1/1` | 404 (solo POST) [OBS] |
| 6 | `POST /addproducttocart/details/13/1` **sin body** | **Observado:** agrega 1 unidad (sin cantidad asume 1) → registrar como hallazgo de parámetros |
| 7 | `POST /addproducttocart/details/13/1` con body **JSON** `{"addtocart_13.EnteredQuantity": 3}` | **Observado:** se ignora el JSON y agrega 1 → el endpoint solo acepta form-urlencoded |

**Payloads de referencia**
```json
// éxito
{ "success": true, "message": "The product has been added to your <a href=\"/cart\">shopping cart</a>", "updatetopcartsectionhtml": "(1)", "updateflyoutcartsectionhtml": "…" }
// error de validación
{ "success": false, "message": ["Quantity should be positive"] }
// producto inexistente
{ "success": false, "message": "No product found with the specified ID" }
// configurable desde el listado
{ "redirect": "/build-your-own-computer" }
```

---

### CR-RG17 — Tipo de carrito inexistente responde éxito sin agregar (API)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **API** · **DAT** |
| **Prioridad** | P2 |
| **Trazabilidad** | Matriz **F-04** · Colección `CART-API-05` |
| **Datos** | **Prueba Maty12** |

| # | Llamada | Resultado esperado — Backend |
|---|---|---|
| 1 | Carrito vacío. `POST /addproducttocart/catalog/13/9/1` (`shoppingCartTypeId=9`) | **Esperado:** `success:false`. **Observado:** `success:true` con “added to your shopping cart” → **Falla conocida F-04** |
| 2 | `GET /cart` | Sigue vacío (confirma que no agregó nada) |
| 3 | `POST /addproducttocart/catalog/13/2/1` (wishlist, tipo 2) | `success:true` y `updatetopwishlistsectionhtml` (1) [OBS] |

**Payload de API**
```json
// Observado (Fase 1): success true y el contador del header SIN incremento
{ "success": true, "message": "The product has been added to your shopping cart", "updatetopcartsectionhtml": "(<contador actual sin cambio>)" }
```

---

### CR-RG18 — Checkout sin aceptar los términos, vía request directo (API)
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **API** |
| **Prioridad** | P1 |
| **Trazabilidad** | Matriz **F-01** · Colección `CART-API-13` |
| **Datos** | **Prueba Maty12** |

| # | Llamada (Postman, Follow redirects **OFF**) | Resultado esperado — Backend |
|---|---|---|
| 1 | Agregar Computing and Internet (`POST /addproducttocart/catalog/13/1/1`) | `success:true` |
| 2 | `POST /cart` con `checkout=checkout` **sin** `termsofservice` | **Esperado:** el servidor no avanza (200 en `/cart` con aviso). **Observado:** 302 → `/login/checkoutasguest` → **Falla conocida F-01** |
| 3 | `POST /cart` con `termsofservice=on&checkout=checkout` | 302 → `/login/checkoutasguest` (invitado) [OBS] |

**Payload de API**
```json
{ "checkout": "checkout" }
```

---

### CR-RG19 — Controles visuales del carrito: desbordamientos y estados
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **FE** |
| **Prioridad** | P3 |
| **Trazabilidad** | Plan v1 **CAR-36/37** |
| **Datos** | **Prueba Maty11** ×10000 · **Prueba Maty15** con **Prueba Maty19** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Agregar Laptop con Qty 10000 | Total de línea **15,900,000.00** (o con el formato del sitio) que **no** se superpone a otras columnas | — |
| 2 | En el campo Qty escribir `99999999999999999999` (20 dígitos) → **Update** | El input no rompe la tabla; mensaje de máximo o error controlado; **nunca** `/errorpage.htm` [HIP] | 200 |
| 3 | Agregar la gift card de Prueba Maty19 con Message de 500 caracteres | El mensaje en la línea se ajusta sin desbordar [HIP] | — |
| 4 | Ver el carrito con 375 px de ancho (DevTools → modo dispositivo) | Botones **Update shopping cart**, **Continue shopping** y **Checkout** visibles y usables; sin scroll horizontal que los oculte [REQ?] | — |
| 5 | Verificar los estados: carrito vacío (sin Checkout), con ítems (Checkout visible), términos sin marcar (diálogo) | Coinciden con CR-SM03 y CR-SN03 [OBS] | — |
| 6 | Vaciar el carrito | — | — |

**Payload de API:** `{ "itemquantity{cartItemId}": "99999999999999999999", "updatecart": "Update shopping cart" }`.

---

### CR-RG20 — Doble click en “Add to cart” y flujo realista de compra
| Campo | Valor |
|---|---|
| **Tipo / Dimensión** | Regresión · **UX** · **DAT** |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **CAR-12** · Matriz **M5.1** (`loadWaiting`) · Plan v2 **S-07** |
| **Datos** | **Prueba Maty9** · **Prueba Maty13** · **Prueba Maty14** · **Prueba Maty16** |

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo. Ficha de Fiction: **doble click rápido** en **Add to cart** | Se agrega **1** unidad (header (1)) [HIP: el flag `loadWaiting` bloquea el segundo click] | Un solo `POST` o el segundo descartado |
| 2 | Flujo realista: BOOKS → Fiction (ya en el carrito) → COMPUTERS → Desktops → Build your own computer (config A) → **Add to cart** | Header (2) | `success:true` |
| 3 | **Continue shopping** desde el carrito | Vuelve a la última página de catálogo visitada [HIP] | — |
| 4 | En el carrito: Fiction a Qty 2 → **Update** | Recalcula; header (3) | — |
| 5 | Marcar los términos → **Checkout** → en la pantalla de login, iniciar sesión con Prueba Maty9 | Llega al checkout con los 2 productos [HIP] | — |
| 6 | Completar Billing con Prueba Maty16 → Shipping → Ground → Check / Money Order → hasta **Confirm order** | El resumen coincide con el carrito (2 líneas, cantidades y Sub-Total) | `goto_section: "confirm_order"` |
| 7 | **No** confirmar. Volver al carrito, vaciarlo y **Log out** | — | — |

**Payload de API (Billing con Prueba Maty16)**
```json
{
  "BillingNewAddress.Id": "0",
  "BillingNewAddress.FirstName": "Prueba Maty16",
  "BillingNewAddress.LastName": "QA Checkout",
  "BillingNewAddress.Email": "prueba.maty16@example.com",
  "BillingNewAddress.CountryId": "1",
  "BillingNewAddress.StateProvinceId": "40",
  "BillingNewAddress.City": "Prueba Maty16 City",
  "BillingNewAddress.Address1": "Prueba Maty16 Street 123",
  "BillingNewAddress.ZipPostalCode": "10001",
  "BillingNewAddress.PhoneNumber": "5550100"
}
```
```json
// POST /checkout/OpcSaveBilling/  → respuesta
{ "update_section": { "name": "shipping", "html": "…" }, "goto_section": "shipping" }
```

---

## 4. Resumen de la suite de regresión

### 4.1 Casos por módulo y dimensión

| ID | Título | DAT | UX | FE | BVA | API | Prio | Estado conocido |
|---|---|:-:|:-:|:-:|:-:|:-:|---|---|
| RG-RG01 | Integridad de los datos persistidos | ● | | | | ○ | P1 | — |
| RG-RG02 | Carrito del invitado al registrarse | ● | ● | | | | P1 | — |
| RG-RG03 | Formatos de email inválidos | | | ● | ● | ○ | P1 | — |
| RG-RG04 | Email duplicado en mayúsculas | ● | | | ● | | P2 | — |
| RG-RG05 | BVA contraseña mínima | | | | ● | ○ | P1 | — |
| RG-RG06 | BVA contraseña máxima | | | ● | ● | | P3 | — |
| RG-RG07 | Caracteres internacionales | ● | ● | | | | P2 | — |
| RG-RG08 | HTML/scripts en nombres | | | | ● | ● | P2 | [REQ?] |
| RG-RG09 | Desbordamiento con nombre largo | | | ● | ● | | P3 | [REQ?] |
| RG-RG10 | Campos solo con espacios | ● | | ● | | | P2 | — |
| RG-RG11 | Registro sin token | | | | ● | ● | P2 | Falla F-07 |
| RG-RG12 | Reglas en el servidor | | | | | ● | P2 | — |
| RG-RG13 | UX del formulario | | ● | ● | | | P3 | — |
| RG-RG14 | Doble envío y Back | ● | ● | | | | P3 | — |
| RG-RG15 | Logueado entra a /register | | ● | | | | P3 | [REQ?] |
| LG-RG01 | Enumeración de usuarios | | ● | | | ● | P1 | Falla F-02 |
| LG-RG02 | Email en mayúsculas | ● | | | ● | | P2 | — |
| LG-RG03 | Email con espacios | ● | ● | | | | P2 | Falla N-03 |
| LG-RG04 | Contraseña: mayúsculas y espacios | | | | ● | | P2 | — |
| LG-RG05 | Remember me | ● | ● | | | | P3 | Exploratorio |
| LG-RG06 | returnUrl | | ● | | | | P3 | Exploratorio |
| LG-RG07 | Login desde el checkout | ● | ● | | | | P2 | — |
| LG-RG08 | Fusión del carrito | ● | | | | | P2 | Exploratorio |
| LG-RG09 | Back tras el logout | | ● | | | | P2 | — |
| LG-RG10 | Controles visuales del login | | ● | ● | | | P2 | — |
| LG-RG11 | HTML en el email | | | | ● | ● | P3 | — |
| LG-RG12 | Email extremadamente largo | | | | ● | | P3 | — |
| LG-RG13 | Contrato técnico login/logout | | | | | ● | P2 | F-03, F-20 |
| LG-RG14 | Intentos fallidos | | | | ● | | P3 | Exploratorio |
| LG-RG15 | Tiempo de respuesta | | | | | ● | P3 | — |
| CR-RG01 | BVA cantidad máxima | | | | ● | ○ | P1 | — |
| CR-RG02 | Cantidad 0 | ● | | | ● | | P1 | **Falla DEF-01** |
| CR-RG03 | Cantidad negativa | | | | ● | | P1 | **Falla DEF-01** |
| CR-RG04 | Cantidad no numérica | | | ● | ● | | P2 | Comportamiento observado sin mensaje |
| CR-RG05 | Mismo producto suma cantidad | ● | | | | | P2 | — |
| CR-RG06 | Configuraciones distintas | ● | | | | | P2 | — |
| CR-RG07 | Configurable sin atributos | | | ● | ● | | P1 | — |
| CR-RG08 | Gift card: validaciones | ● | | ● | ● | | P2 | — |
| CR-RG09 | En stock sin botón de compra | ● | | ● | | ● | P1 | **Falla DEF-02** |
| CR-RG10 | Cupón inválido | | ● | | ● | | P3 | — |
| CR-RG11 | Gift card inválida | | ● | | ● | | P3 | Falla F-08 |
| CR-RG12 | Estimar envío | | ● | | | ● | P3 | Falla F-09 |
| CR-RG13 | Totales | ● | | | | | P1 | Variable N-06 |
| CR-RG14 | Persistencia del carrito | ● | | | | | P2 | — |
| CR-RG15 | Editar configurable | ● | ● | | | | P2 | — |
| CR-RG16 | Contrato JSON del alta | | | | | ● | P1 | F-13 |
| CR-RG17 | Tipo de carrito inexistente | ● | | | | ● | P2 | Falla F-04 |
| CR-RG18 | Checkout sin términos (API) | | | | | ● | P1 | Falla F-01 |
| CR-RG19 | Desbordamientos y estados | | | ● | | | P3 | — |
| CR-RG20 | Doble click y flujo realista | ● | ● | | | | P2 | — |

● cobertura principal · ○ cobertura secundaria

### 4.2 Totales
| Módulo | Smoke | Sanity | Regresión | Total |
|---|---|---|---|---|
| Registro | 3 | 4 | 15 | 22 |
| Login | 3 | 4 | 15 | 22 |
| Carrito | 4 | 4 | 20 | 28 |
| **Total** | **10** | **12** | **50** | **72** |

### 4.3 Orden de ejecución y criterios
1. **Precondición:** el Smoke completo en Pass (`CASOS_DE_PRUEBA_SMOKE.md`).
2. **Orden sugerido:** Registro (RG-RG01..15) → Login (LG-RG01..15) → Carrito (CR-RG01..20). Dentro de cada módulo, primero los P1.
3. **Exploratorios** (LG-RG05, LG-RG06, LG-RG08, LG-RG14): se ejecutan en la Fase D del Plan v2; no bloquean el cierre.
4. **Fallas conocidas** (DEF-01, DEF-02, F-01, F-02, F-04, F-07, F-08, F-09, N-03): se marcan **Fail – conocido** con referencia al hallazgo. Si alguna pasa, verificar si hubo un fix y actualizar el reporte de defectos.
5. **Criterio de salida (Plan v2 §11.2):** todos los P1 ejecutados; cada Fail o Blocked con evidencia (captura y request/response) y etiqueta de oráculo; matriz de cobertura actualizada.
6. **Limpieza:** al final de cada TC, vaciar el carrito y cerrar sesión. Las cuentas “Prueba Maty” creadas no se pueden borrar: listarlas en la hoja de ejecución.
