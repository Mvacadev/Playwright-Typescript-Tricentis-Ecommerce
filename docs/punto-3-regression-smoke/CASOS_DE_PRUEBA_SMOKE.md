# CASOS DE PRUEBA — SMOKE y SANITY
**Aplicación:** Tricentis Demo Web Shop — https://demowebshop.tricentis.com/ (nopCommerce · ASP.NET MVC 5.2)
**Módulos:** Registro · Login · Carrito de compras
**Versión:** 1.0 · **Fecha:** 13/10/2026 · **Autor:** QA Lead (asistido por Claude)
**Fuentes:** `MATRIZ_DE_CONOCIMIENTO_TECNICO_Y_MODULOS.md` (Matriz) · `TEST_PLAN_v2.md` (Plan v2)
**Documento complementario:** `CASOS_DE_PRUEBA_REGRESION.md` (regresión completa)

---

## 0. Cómo usar este documento

### 0.1 Alcance de cada tipo de prueba

| Tipo | Objetivo | Cuándo se ejecuta | Duración objetivo | Criterio |
|---|---|---|---|---|
| **Smoke** | Disponibilidad y flujo principal (happy path) de cada módulo | En cada despliegue, **antes** de cualquier otra prueba | ≤ 15 min (manual) | **Bloqueante**: si falla un Smoke, se detiene el ciclo (Plan v2 §7) |
| **Sanity** | Verificación rápida de funcionalidades clave tras un cambio menor o un fix | Después de un hotfix o cambio acotado, sobre el módulo tocado | ≤ 10 min por módulo | Si falla, no se pasa a la regresión del módulo |

### 0.2 Convención de IDs
Formato **XX-XXXX**: `MÓDULO-TIPO+NN`.

| Prefijo | Módulo | | Sufijo | Tipo |
|---|---|---|---|---|
| `RG` | Registro | | `SM` | Smoke |
| `LG` | Login | | `SN` | Sanity |
| `CR` | Carrito | | `RG` | Regresión (ver documento de regresión) |

Ejemplo: **LG-SN02** = Login · Sanity · caso 02.

### 0.3 Etiquetas de oráculo (de dónde sale el resultado esperado)

| Etiqueta | Significado |
|---|---|
| **[OBS]** | Comportamiento observado en la plataforma durante la exploración (Matriz o re-verificación) |
| **[HIP]** | Hipótesis de QA, todavía no confirmada en la plataforma |
| **[REQ?]** | Depende de una decisión de negocio; el caso puede quedar con resultado provisional |

### 0.4 Reglas generales de ejecución (aplican a todos los TCs)
1. Navegador: **Chrome** (versión estable). Para la pasada de regresión, repetir en **Firefox** (Plan v2 §6.1).
2. Antes de cada TC, salvo que diga lo contrario: abrir una **ventana de incógnito nueva** (estado limpio: sin sesión y con carrito vacío).
3. Para ver el “Backend” durante la ejecución manual: abrir **DevTools (F12) → pestaña Network**, marcar **Preserve log** y filtrar por **Fetch/XHR** (llamadas AJAX) o **Doc** (formularios).
4. **No confiar solo en el status HTTP:** este sitio devuelve **200** aun en errores de negocio y redirige las excepciones a `/errorpage.htm` (Matriz M12). Verificar siempre el contenido.
5. Los formularios se envían como `application/x-www-form-urlencoded`. En los payloads de este documento, el body se muestra como **JSON solo para que sea fácil de leer**: en Postman se carga en **Body → x-www-form-urlencoded** con esas mismas claves y valores.
6. Si un paso no se puede ejecutar por entorno (sitio caído, producto no comprable), marcar el TC como **Blocked**, no como Fail (Plan v2 §10.1).
7. **Nunca** usar contraseñas personales. La contraseña de prueba la define el tester, se anota en un gestor seguro y **no** se escribe en evidencias.

---

## 1. Lote de datos de prueba (Test Data) — “Prueba MatyX”

> **Regla:** todo dato que se crea durante la ejecución lleva el identificador **“Prueba MatyN”**. Los campos que no admiten espacios (email) usan la forma **`prueba.matyN`**.
> **Emails únicos:** el sitio no permite repetir un email registrado. Por eso cada email lleva un sufijo de ejecución **`{AAAAMMDDHHmm}`** (fecha y hora de la ejecución, p. ej. `202610131530`). Anotar el valor usado en la hoja de ejecución.

### 1.1 Cuentas y personas

| ID dato | First name | Last name | Email | Gender | Contraseña | Uso |
|---|---|---|---|---|---|---|
| **Prueba Maty1** | `Prueba Maty1` | `QA Registro` | `prueba.maty1.{AAAAMMDDHHmm}@example.com` | Female | `PMaty1#{definida por el tester}` (≥ 8 caracteres) | Registro exitoso (RG-SM01) |
| **Prueba Maty2** | `Prueba Maty2` | `QA SinGenero` | `prueba.maty2.{AAAAMMDDHHmm}@example.com` | *(ninguno)* | `PMaty2#{…}` | Registro sin Gender (RG-SN01) |
| **Prueba Maty3** | `Prueba Maty3` | `QA Duplicado` | *(el email de Prueba Maty1)* | Male | `PMaty3#{…}` | Email duplicado (RG-SN03) |
| **Prueba Maty4** | `Prueba Maty4` | `QA Mismatch` | `prueba.maty4.{AAAAMMDDHHmm}@example.com` | Male | Password `PMaty4#Aa1` · Confirm `PMaty4#Bb2` | Contraseñas distintas (RG-SN02) |
| **Prueba Maty9** | `Prueba Maty9` | `QA Login` | `prueba.maty9.{AAAAMMDDHHmm}@example.com` | Female | `PMaty9#{…}` | **Cuenta fija para Login y Carrito registrado**. Se crea una vez (§1.4) y se reutiliza |
| **Prueba Maty10** | — | — | `prueba.maty10.noexiste@example.com` (no se registra nunca) | — | `PMaty10#Cualquiera1` | Usuario inexistente (LG-SN01) |

### 1.2 Productos y datos de carrito

> Los productos son del catálogo (no se pueden crear). Se identifican por **ID de dato** “Prueba MatyN” en la hoja de ejecución. Precios verificados el **13/10/2026**; si cambian, capturar el precio en el paso correspondiente y usar ese valor (Plan v2 §6.2).

| ID dato | Producto | ID producto | URL | Precio | Tipo | Comprable |
|---|---|---|---|---|---|---|
| **Prueba Maty11** | 14.1-inch Laptop | 31 | `/141-inch-laptop` | 1590.00 | Simple | Sí |
| **Prueba Maty12** | Computing and Internet | 13 | `/computing-and-internet` | 10.00 | Simple (envío gratis) | Sí |
| **Prueba Maty13** | Fiction | 45 | `/fiction` | 24.00 | Simple | Sí |
| **Prueba Maty14** | Build your own computer | 16 | `/build-your-own-computer` | 1200.00 base | Configurable | Sí |
| **Prueba Maty15** | $25 Virtual Gift Card | 2 | `/25-virtual-gift-card` | 25.00 | Gift card | Sí |

**Configuración de Prueba Maty14 (Build your own computer):**

| Atributo | Opción elegida | Recargo | Valor en el form |
|---|---|---|---|
| Processor | 2.5 GHz Intel Pentium Dual-Core E2200 | +15.00 | `product_attribute_16_5_4=14` |
| RAM | 4GB | +20.00 | `product_attribute_16_6_5=16` |
| HDD | 320 GB | 0.00 | `product_attribute_16_3_6=18` |
| OS | Ubuntu | 0.00 | `product_attribute_16_4_7=44` |
| Software | *(ninguno)* | 0.00 | — |
| **Precio unitario esperado** | | **1235.00** [HIP: suma de recargos; ver Matriz M4] | |

### 1.3 Datos de dirección (para el traspaso del carrito al checkout)

| ID dato | First name | Last name | Email | Country | State | City | Address 1 | Zip | Phone |
|---|---|---|---|---|---|---|---|---|---|
| **Prueba Maty16** | `Prueba Maty16` | `QA Checkout` | `prueba.maty16@example.com` | United States (1) | New York (40) | `Prueba Maty16 City` | `Prueba Maty16 Street 123` | `10001` | `5550100` |

### 1.4 Preparación única de datos (antes del primer ciclo)
1. Crear la cuenta **Prueba Maty9** siguiendo los pasos de **RG-SM01** con los datos de Prueba Maty9.
2. Anotar el email exacto y guardar la contraseña en el gestor seguro.
3. Cerrar sesión (“Log out”).
4. Verificar que la cuenta **no** tenga productos en el carrito (iniciar sesión, abrir “Shopping cart”; si hay ítems, eliminarlos; cerrar sesión).

### 1.5 Hoja de ejecución (copiar por ciclo)

| Campo | Valor |
|---|---|
| Ciclo / fecha y hora | |
| Sufijo `{AAAAMMDDHHmm}` usado | |
| Navegador y versión | |
| Tester | |
| Emails creados en este ciclo | |
| Resultado por TC (Pass / Fail / Blocked / Not Run) | |

---

## 2. Endpoints involucrados (referencia rápida)

| Módulo | Acción | Método · Endpoint | Request | Response |
|---|---|---|---|---|
| Registro | Ver formulario | `GET /register` | — | 200 HTML con `__RequestVerificationToken` |
| Registro | Enviar | `POST /register` | form: `__RequestVerificationToken`, `Gender`, `FirstName`, `LastName`, `Email`, `Password`, `ConfirmPassword`, `register-button` | 200 HTML (con errores) o resultado de registro |
| Login | Enviar | `POST /login` | form: `Email`, `Password`, `RememberMe` | Éxito **302**; error **200** HTML |
| Login | Logout | `GET /logout` | — | **302** a `/` |
| Login | Área privada | `GET /customer/info` | — | Con sesión 200; sin sesión **302** a `/login` |
| Carrito | Alta (listado) | `POST /addproducttocart/catalog/{productId}/1/{qty}` | sin body | 200 JSON |
| Carrito | Alta (ficha) | `POST /addproducttocart/details/{productId}/1` | form: `addtocart_{id}.EnteredQuantity`, atributos | 200 JSON |
| Carrito | Página / actualizar | `GET` / `POST /cart` | form: `itemquantity{cartItemId}`, `removefromcart`, `updatecart`, `termsofservice`, `checkout` | 200 HTML / 302 |

---

## 3. MÓDULO REGISTRO

### 3.1 Smoke — Registro

---

#### RG-SM01 — Registro exitoso de un usuario nuevo con todos los campos
| Campo | Valor |
|---|---|
| **Tipo** | Smoke |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-01**, riesgo **R-01** · Matriz **M9**, **M13** |
| **Datos** | **Prueba Maty1** |

**Precondiciones**
1. Ventana de incógnito nueva, sin sesión.
2. Email `prueba.maty1.{AAAAMMDDHHmm}@example.com` nunca registrado (sufijo de la ejecución actual).
3. DevTools abierto en Network (filtro **Doc**).

**Pasos**

| # | Acción (click a click) | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `https://demowebshop.tricentis.com/` | Carga la Home con el logo “Demo Web Shop” y, arriba a la derecha, los links **Register**, **Log in**, **Shopping cart (0)**, **Wishlist (0)** | `GET /` → 200 |
| 2 | Click en **Register** (header) | Abre la página **Register** con: radio **Male/Female**, campos **First name\***, **Last name\***, **Email\***, **Password\***, **Confirm password\*** y el botón **Register** | `GET /register` → 200; el HTML contiene `__RequestVerificationToken` |
| 3 | Click en el radio **Female** | Queda seleccionado | — |
| 4 | Click en **First name** y escribir `Prueba Maty1` | El texto se ve completo | — |
| 5 | Click en **Last name** y escribir `QA Registro` | — | — |
| 6 | Click en **Email** y escribir `prueba.maty1.{AAAAMMDDHHmm}@example.com` | — | — |
| 7 | Click en **Password** y escribir la contraseña de Prueba Maty1 | Caracteres enmascarados (•••) | — |
| 8 | Click en **Confirm password** y escribir la misma contraseña | Enmascarada; no aparece ningún mensaje de error | — |
| 9 | Click en **Register** | Aparece la confirmación de registro (p. ej., “Your registration completed”) con el botón **Continue** [HIP: texto exacto]. En el header se ve el **email** del usuario y **Log out**; ya no se ven **Register** ni **Log in** [OBS] | `POST /register` → éxito (redirect a la página de resultado [HIP]); se crea el registro **Customer** y se emite la cookie de autenticación |
| 10 | Click en **Continue** (si se muestra) | Vuelve a la Home, autenticado | `GET /` → 200 |
| 11 | Click en el email del header (link a **My account**) | Abre **My account – Customer info** con: Gender = Female, First name = `Prueba Maty1`, Last name = `QA Registro`, Email = el registrado | `GET /customer/info` → 200 (no redirige a `/login`) |
| 12 | Click en **Log out** | Vuelve a la Home como invitado (**Register / Log in** visibles) | `GET /logout` → 302 → `/` |

**Postcondición:** cuenta Prueba Maty1 creada; anotar el email en la hoja de ejecución (no se puede borrar).

**Payload de API**
```http
POST https://demowebshop.tricentis.com/register
Content-Type: application/x-www-form-urlencoded
```
```json
{
  "__RequestVerificationToken": "<valor extraído de GET /register>",
  "Gender": "F",
  "FirstName": "Prueba Maty1",
  "LastName": "QA Registro",
  "Email": "prueba.maty1.202610131530@example.com",
  "Password": "<PMaty1#…>",
  "ConfirmPassword": "<PMaty1#…>",
  "register-button": "Register"
}
```
Response esperada: redirect a la página de resultado de registro [HIP] + `Set-Cookie` de autenticación. Sin token → `/errorpage.htm` [OBS] (ver RG-RG11 en regresión).

---

#### RG-SM02 — Disponibilidad del formulario de registro y sus controles
| Campo | Valor |
|---|---|
| **Tipo** | Smoke |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-01** (prerrequisito), **Fase A Preflight** · Matriz **M9** |
| **Datos** | Ninguno (solo lectura) — se registra como “Prueba Maty0 / verificación de página” |

**Precondiciones:** ventana de incógnito nueva.

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `https://demowebshop.tricentis.com/register` | Título **Register**; sección **Your Personal Details** con Gender, First name, Last name, Email; sección **Your Password** con Password y Confirm password; botón **Register** | `GET /register` → 200, `Content-Type: text/html` |
| 2 | Verificar los asteriscos rojos de obligatoriedad | Hay **\*** en First name, Last name, Email, Password y Confirm password; **no** en Gender | El HTML tiene `data-val-required` en esos 5 campos [OBS] |
| 3 | Click en **Password** y escribir `abc` | Se muestra enmascarado | Input `type="password"` |
| 4 | En DevTools → Elements, buscar `__RequestVerificationToken` | Existe un input hidden con valor no vacío | Token antiforgery presente [OBS] |
| 5 | Recargar la página (F5) | Los campos quedan vacíos | 200 |

**Payload de API**
```http
GET https://demowebshop.tricentis.com/register
```
Response: `200 text/html` con `<input name="__RequestVerificationToken" type="hidden" value="…">` y los campos `Gender`, `FirstName`, `LastName`, `Email`, `Password`, `ConfirmPassword`.

---

#### RG-SM03 — El registro no se completa con los campos obligatorios vacíos
| Campo | Valor |
|---|---|
| **Tipo** | Smoke |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-06**, **REG-03** · Matriz **M9** |
| **Datos** | **Prueba Maty0** (formulario vacío) |

**Precondiciones:** ventana de incógnito nueva; DevTools en Network.

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `/register` | Formulario vacío | `GET /register` → 200 |
| 2 | Sin completar nada, click en **Register** | Junto a cada campo aparecen en rojo: “**First name is required.**”, “**Last name is required.**”, “**Email is required.**”, “**Password is required.**” (en Password y en Confirm password) [OBS] | **No** se envía ningún `POST /register` (la validación es en el cliente) [OBS] |
| 3 | Escribir `Prueba Maty0` en First name y hacer click fuera del campo | Desaparece solo el mensaje de First name | — |
| 4 | Verificar el header | Siguen **Register / Log in** (no se creó nada) | — |

**Payload de API (validación en el servidor, sin pasar por el cliente)**
```json
{
  "__RequestVerificationToken": "<token>",
  "FirstName": "", "LastName": "", "Email": "", "Password": "", "ConfirmPassword": "",
  "register-button": "Register"
}
```
Response: `200 text/html` con los mismos mensajes de requerido; **no** se crea la cuenta [OBS].

---

### 3.2 Sanity — Registro

---

#### RG-SN01 — Registro exitoso sin seleccionar Gender (campo opcional)
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **REG-02** · Matriz **M9** |
| **Datos** | **Prueba Maty2** |

**Precondiciones:** incógnito nuevo; email de Prueba Maty2 no registrado.

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `/register` | Formulario vacío | 200 |
| 2 | **No** seleccionar Male ni Female | Ningún radio marcado | — |
| 3 | First name `Prueba Maty2` · Last name `QA SinGenero` · Email `prueba.maty2.{AAAAMMDDHHmm}@example.com` · Password y Confirm iguales | Sin mensajes de error | — |
| 4 | Click en **Register** | Confirmación de registro; header con email y **Log out** | `POST /register` sin el campo `Gender` → éxito |
| 5 | Ir a **My account** | Gender sin selección; nombre y email correctos | `GET /customer/info` → 200 |
| 6 | Click en **Log out** | Invitado | 302 → `/` |

**Payload de API**
```json
{
  "__RequestVerificationToken": "<token>",
  "FirstName": "Prueba Maty2",
  "LastName": "QA SinGenero",
  "Email": "prueba.maty2.202610131530@example.com",
  "Password": "<PMaty2#…>",
  "ConfirmPassword": "<PMaty2#…>",
  "register-button": "Register"
}
```

---

#### RG-SN02 — Contraseña y confirmación distintas
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-06**, **REG-04** · Matriz **M9** |
| **Datos** | **Prueba Maty4** |

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `/register` | — | 200 |
| 2 | Gender Male · First name `Prueba Maty4` · Last name `QA Mismatch` · Email `prueba.maty4.{AAAAMMDDHHmm}@example.com` | — | — |
| 3 | Password `PMaty4#Aa1` · Confirm password `PMaty4#Bb2` | Al salir del campo Confirm: “**The password and confirmation password do not match.**” [OBS] | — |
| 4 | Click en **Register** | El formulario no se envía; el mensaje sigue visible | No hay `POST /register` |
| 5 | Corregir Confirm password a `PMaty4#Aa1` | El mensaje desaparece | — |
| 6 | **No** enviar (cerrar la pestaña) | — | No se crea la cuenta Prueba Maty4 |

**Payload de API (validación del servidor)** [HIP: la Fase 1 solo verificó en el servidor el envío vacío]
```json
{
  "__RequestVerificationToken": "<token>",
  "Gender": "M", "FirstName": "Prueba Maty4", "LastName": "QA Mismatch",
  "Email": "prueba.maty4.202610131530@example.com",
  "Password": "PMaty4#Aa1", "ConfirmPassword": "PMaty4#Bb2",
  "register-button": "Register"
}
```
Response esperada: `200 text/html` con “The password and confirmation password do not match.”; sin cuenta creada.

---

#### RG-SN03 — Registro con un email ya registrado
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **REG-01**, riesgo **R-01** |
| **Datos** | **Prueba Maty3** (usa el email de Prueba Maty1) |

**Precondiciones:** RG-SM01 ejecutado en el mismo ciclo (existe el email de Prueba Maty1); incógnito nuevo.

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `/register` | — | 200 |
| 2 | Gender Male · First name `Prueba Maty3` · Last name `QA Duplicado` · Email = **el email de Prueba Maty1** · Password y Confirm iguales | Sin errores del cliente | — |
| 3 | Click en **Register** | Sigue en Register con un mensaje de email ya existente (p. ej., “The specified email already exists”) [HIP: texto exacto]; header como invitado | `POST /register` → 200 HTML con error; **no** se crea una segunda cuenta |
| 4 | Ingresar a `/login` e intentar loguearse con el email de Prueba Maty1 y la contraseña de **Prueba Maty3** | Error de credenciales | Confirma que no se sobrescribió la cuenta original |

**Payload de API**
```json
{
  "__RequestVerificationToken": "<token>",
  "Gender": "M", "FirstName": "Prueba Maty3", "LastName": "QA Duplicado",
  "Email": "prueba.maty1.202610131530@example.com",
  "Password": "<PMaty3#…>", "ConfirmPassword": "<PMaty3#…>",
  "register-button": "Register"
}
```

---

#### RG-SN04 — Un usuario recién registrado puede volver a iniciar sesión
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **REG-03** · Plan v2 **S-01/S-02** |
| **Datos** | **Prueba Maty1** |

**Precondiciones:** RG-SM01 ejecutado; sesión cerrada.

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Click en **Log in** | Página “Welcome, Please Sign In!” | `GET /login` → 200 |
| 2 | Email de Prueba Maty1 · Password de Prueba Maty1 · click en **Log in** | Header con el email y **Log out** | `POST /login` → 302 |
| 3 | Click en **Log out** | Invitado | `GET /logout` → 302 |

**Payload de API**
```json
{ "Email": "prueba.maty1.202610131530@example.com", "Password": "<PMaty1#…>", "RememberMe": "false" }
```

---

## 4. MÓDULO LOGIN

### 4.1 Smoke — Login

---

#### LG-SM01 — Login exitoso con un usuario registrado
| Campo | Valor |
|---|---|
| **Tipo** | Smoke |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-02** (parte válida), riesgo **R-02** · Especificación **TC-LOG-01** · Matriz **M9/M13** |
| **Datos** | **Prueba Maty9** |

**Precondiciones:** cuenta Prueba Maty9 creada (§1.4); incógnito nuevo; DevTools en Network (Doc).

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `https://demowebshop.tricentis.com/` | Header con **Register / Log in** | `GET /` → 200 |
| 2 | Click en **Log in** | Página **Welcome, Please Sign In!** con los bloques **New Customer** (botón Register) y **Returning Customer**: Email, Password, **Remember me?** (desmarcado), link **Forgot password?**, botón **Log in** [OBS] | `GET /login` → 200 |
| 3 | Click en **Email** y escribir el email de Prueba Maty9 | — | — |
| 4 | Click en **Password** y escribir la contraseña de Prueba Maty9 | Enmascarada | — |
| 5 | Dejar **Remember me?** desmarcado y click en **Log in** | Sale de la página de login sin errores; va a la Home [HIP: destino] | `POST /login` → **302** con `Location` [HIP: `/`] y `Set-Cookie` de autenticación |
| 6 | Verificar el header | Muestra el **email de Prueba Maty9** y **Log out**; no se ven **Register / Log in** [OBS] | — |
| 7 | Click en el email del header | **My account – Customer info** con First name `Prueba Maty9` y su email | `GET /customer/info` → 200 |

**Postcondición:** dejar la sesión abierta si se ejecuta LG-SM03 a continuación; si no, hacer click en **Log out**.

**Payload de API**
```http
POST https://demowebshop.tricentis.com/login
Content-Type: application/x-www-form-urlencoded
```
```json
{ "Email": "prueba.maty9.202610131530@example.com", "Password": "<PMaty9#…>", "RememberMe": "false" }
```
Response esperada: `302 Found`, `Location: /` [HIP], `Set-Cookie: <cookie de autenticación>` [HIP: nombre]. Verificación posterior: `GET /customer/info` → 200 con `<input id="Email" value="prueba.maty9…">`.

---

#### LG-SM02 — Login rechazado con contraseña incorrecta
| Campo | Valor |
|---|---|
| **Tipo** | Smoke |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-02** (parte inválida), riesgo **R-03** · Especificación **TC-LOG-02** · Matriz **F-02** |
| **Datos** | **Prueba Maty9** + contraseña incorrecta `PMaty9#Incorrecta0` |

**Precondiciones:** incógnito nuevo.

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `/login` | Formulario Returning Customer | 200 |
| 2 | Email de Prueba Maty9 · Password `PMaty9#Incorrecta0` · click en **Log in** | Sigue en `/login` con el bloque rojo: “**Login was unsuccessful. Please correct the errors and try again.** The credentials provided are incorrect” [OBS con contraseña vacía; HIP con contraseña incorrecta no vacía] | `POST /login` → **200** `text/html` (no hay redirect) |
| 3 | Verificar los campos | El email sigue cargado; la contraseña quedó **vacía** [OBS] | — |
| 4 | Verificar el header | Sigue **Log in** (no autenticado) | — |
| 5 | Ingresar a `/customer/info` | Redirige al login | `GET /customer/info` → 302 → `/login` |

**Payload de API**
```json
{ "Email": "prueba.maty9.202610131530@example.com", "Password": "PMaty9#Incorrecta0", "RememberMe": "false" }
```
Response observada: `200 text/html` con `<div class="validation-summary-errors"><span>Login was unsuccessful. Please correct the errors and try again.</span><ul><li>The credentials provided are incorrect</li></ul></div>`.

---

#### LG-SM03 — Logout cierra la sesión
| Campo | Valor |
|---|---|
| **Tipo** | Smoke |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **LOG-02** · Matriz **M13.5** |
| **Datos** | **Prueba Maty9** |

**Precondiciones:** sesión iniciada con Prueba Maty9 (LG-SM01).

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Click en **Log out** (header) | Vuelve a la Home; header con **Register / Log in** [OBS] | `GET /logout` → **302** → `/` |
| 2 | Escribir en la barra `https://demowebshop.tricentis.com/customer/info` y Enter | Muestra la página de login | `GET /customer/info` → **302** → `/login` [OBS] |
| 3 | Escribir `/customer/orders` y Enter | Muestra la página de login | 302 → `/login` [OBS] |

**Payload de API**
```http
GET https://demowebshop.tricentis.com/logout          → 302 Location: /
GET https://demowebshop.tricentis.com/customer/info   → 302 Location: /login…
```

---

### 4.2 Sanity — Login

---

#### LG-SN01 — Login rechazado con un usuario inexistente
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **LOG-01** · Especificación **TC-LOG-03** · Matriz **F-02** |
| **Datos** | **Prueba Maty10** |

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `/login` | — | 200 |
| 2 | Email `prueba.maty10.noexiste@example.com` · Password `PMaty10#Cualquiera1` · click en **Log in** | Bloque rojo: “Login was unsuccessful. Please correct the errors and try again. **No customer account found**” [OBS] | `POST /login` → 200 `text/html` |
| 3 | Verificar el header | Sigue **Log in** | — |
| 4 | Comparar con el mensaje de LG-SM02 | **Observado:** los mensajes son distintos (“No customer account found” vs “The credentials provided are incorrect”) → permite saber qué emails existen | [REQ?] Registrar como riesgo de seguridad F-02; **no** hace fallar el Sanity funcional |

**Payload de API**
```json
{ "Email": "prueba.maty10.noexiste@example.com", "Password": "PMaty10#Cualquiera1", "RememberMe": "false" }
```

---

#### LG-SN02 — Las páginas privadas exigen sesión
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P1 |
| **Trazabilidad** | Matriz **M9**, **M13.5** · Especificación **TC-LOG-01** (permisos) |
| **Datos** | **Prueba Maty9** |

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo. Ingresar a `/customer/info` | Página de login | 302 → `/login` |
| 2 | Ingresar a `/customer/addresses` | Página de login | 302 → `/login` |
| 3 | Ingresar a `/customer/orders` | Página de login | 302 → `/login` |
| 4 | Iniciar sesión con Prueba Maty9 | Header con el email | `POST /login` → 302 |
| 5 | Ingresar a `/customer/info` | Página Customer info | 200 |
| 6 | Click en **Log out** | Invitado | 302 |

**Payload de API:** `GET /customer/info` sin cookie de sesión → `302 Location: /login…`; con cookie → `200 text/html`.

---

#### LG-SN03 — Login con los campos vacíos
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P2 |
| **Trazabilidad** | Plan v1 **LOG-05** · Matriz **M9** |
| **Datos** | **Prueba Maty0** (vacío) |

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a `/login` | — | 200 |
| 2 | Sin completar nada, click en **Log in** | El formulario **se envía** (no hay validación en el cliente) y aparece “Login was unsuccessful. Please correct the errors and try again. No customer account found” [OBS] | `POST /login` → 200 |
| 3 | Verificar el header | **Log in** | — |

**Payload de API**
```json
{ "Email": "", "Password": "", "RememberMe": "false" }
```

---

#### LG-SN04 — El estado autenticado se mantiene al navegar
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P2 |
| **Trazabilidad** | Especificación **TC-LOG-01** (integración) |
| **Datos** | **Prueba Maty9** |

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Iniciar sesión con Prueba Maty9 | Header con el email | 302 |
| 2 | Click en **BOOKS** (menú) | En el listado, el header sigue mostrando el email y **Log out** | `GET /books` → 200 |
| 3 | Click en un producto (p. ej., **Fiction**) | Ficha; header autenticado | 200 |
| 4 | Click en **Shopping cart** | Carrito; header autenticado | `GET /cart` → 200 |
| 5 | Recargar con F5 | Sigue autenticado | La cookie se reenvía |
| 6 | Click en **Log out** | Invitado | 302 |

**Payload de API:** no aplica (navegación GET con la cookie de sesión).

---

## 5. MÓDULO CARRITO DE COMPRAS

### 5.1 Smoke — Carrito

---

#### CR-SM01 — Agregar un producto simple desde el listado
| Campo | Valor |
|---|---|
| **Tipo** | Smoke |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-04**, riesgo **R-05** · Especificación **TC-CART-01** · Matriz **M5.1** |
| **Datos** | **Prueba Maty12** (Computing and Internet, id 13, 10.00) |

**Precondiciones:** incógnito nuevo (carrito vacío, header **Shopping cart (0)**); DevTools en Network (Fetch/XHR).

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Ingresar a la Home y click en **BOOKS** | Listado de libros con tarjetas (imagen, título, precio) | `GET /books` → 200 |
| 2 | Ubicar **Computing and Internet** y verificar que tenga el botón verde **Add to cart** | Precio **10.00** (precio anterior tachado, si lo hay); botón visible | — |
| 3 | Click en **Add to cart** de Computing and Internet | Aparece arriba una barra verde “**The product has been added to your shopping cart**” (se oculta sola en ~3.5 s); el header cambia a **Shopping cart (1)** [OBS] | `POST /addproducttocart/catalog/13/1/1` → 200 `application/json` con `success: true` |
| 4 | Pasar el mouse sobre **Shopping cart** | Flyout: “There are 1 item(s) in your cart.”, Computing and Internet, Unit price 10.00, Quantity 1, Sub-Total 10.00 [OBS] | — |
| 5 | Click en **Shopping cart** | Página **Shopping cart** con 1 línea: Computing and Internet · Price **10.00** · Qty **1** · Total **10.00**; Sub-Total **10.00** [OBS] | `GET /cart` → 200 |

**Payload de API**
```http
POST https://demowebshop.tricentis.com/addproducttocart/catalog/13/1/1
X-Requested-With: XMLHttpRequest
(sin body)
```
```json
{
  "success": true,
  "message": "The product has been added to your <a href=\"/cart\">shopping cart</a>",
  "updatetopcartsectionhtml": "(1)",
  "updateflyoutcartsectionhtml": "<div id=\"flyout-cart\" …>There are 1 item(s) in your cart.…</div>"
}
```

---

#### CR-SM02 — Actualizar la cantidad de un producto en el carrito
| Campo | Valor |
|---|---|
| **Tipo** | Smoke |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-05**, riesgos **R-05/R-06** · Especificación **TC-CART-02** · Matriz **M5.2** |
| **Datos** | **Prueba Maty13** (Fiction, id 45, 24.00) |

**Precondiciones:** incógnito nuevo; agregar Fiction al carrito (BOOKS → Fiction → **Add to cart**); header **(1)**.

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Click en **Shopping cart** | 1 línea: Fiction · 24.00 · Qty 1 · Total 24.00 | `GET /cart` → 200 |
| 2 | Click en el campo **Qty.** de Fiction, borrar el 1 y escribir `2` | El campo muestra 2; los totales **todavía no** cambian (no hay recálculo automático) [OBS] | — |
| 3 | Click en **Update shopping cart** | La página se recarga: Qty **2**, Total de línea **48.00**, Sub-Total **48.00**; header **Shopping cart (2)** [OBS] | `POST /cart` con `itemquantity{cartItemId}=2&updatecart=…` → 200 `text/html` |
| 4 | Recargar la página (F5) | Se mantiene Qty 2 | La cantidad quedó guardada en el servidor |

**Payload de API**
```http
POST https://demowebshop.tricentis.com/cart
Content-Type: application/x-www-form-urlencoded
```
```json
{ "itemquantity{cartItemId}": "2", "updatecart": "Update shopping cart" }
```
`{cartItemId}` = valor del checkbox **Remove** de la línea (se obtiene en DevTools → Elements, `input[name=removefromcart]`). Response: `200 text/html` con la línea en Qty 2.

---

#### CR-SM03 — Eliminar el producto y llegar al carrito vacío
| Campo | Valor |
|---|---|
| **Tipo** | Smoke |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-05**, **CART-04** · Especificación **TC-CART-03** · Matriz **M5.2** |
| **Datos** | **Prueba Maty13** |

**Precondiciones:** carrito con Fiction (continuación de CR-SM02, o agregar Fiction en un incógnito nuevo).

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | En **Shopping cart**, marcar el checkbox **Remove** de Fiction | Checkbox tildado | — |
| 2 | Click en **Update shopping cart** | Mensaje “**Your Shopping Cart is empty!**”; sin tabla de productos, sin totales y sin botón **Checkout**; header **Shopping cart (0)** [OBS] | `POST /cart` con `removefromcart={cartItemId}&updatecart=…` → 200 |
| 3 | Pasar el mouse sobre **Shopping cart** | Flyout: “You have no items in your shopping cart.” [OBS] | — |

**Payload de API**
```json
{ "removefromcart": "{cartItemId}", "updatecart": "Update shopping cart" }
```

---

#### CR-SM04 — Del carrito al checkout aceptando los términos
| Campo | Valor |
|---|---|
| **Tipo** | Smoke |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **S-07** (entrada), **CHK-04** · Especificación **TC-CART-02** (integración) · Matriz **M8/M13.2** |
| **Datos** | **Prueba Maty9** (registrado) + **Prueba Maty12** |

**Precondiciones:** sesión iniciada con Prueba Maty9; carrito vacío.

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | BOOKS → **Add to cart** de Computing and Internet | Header **(1)** | `POST /addproducttocart/catalog/13/1/1` → `success:true` |
| 2 | Click en **Shopping cart** | 1 línea, Sub-Total 10.00 | 200 |
| 3 | Marcar **I agree with the terms of service and I adhere to them unconditionally** | Tildado | — |
| 4 | Click en **Checkout** | Abre el checkout de una página (**Billing address** expandido) [OBS: registrado va directo a `/onepagecheckout`] | `POST /cart` con `termsofservice=on&checkout=checkout` → 302 → `/onepagecheckout` |
| 5 | No avanzar más: click en el logo para volver | Home | — |
| 6 | Vaciar el carrito (Remove + Update) y click en **Log out** | Carrito vacío; invitado | — |

**Payload de API**
```json
{ "termsofservice": "on", "checkout": "checkout" }
```
Response: `302 Location: /onepagecheckout` (usuario registrado) o `/login/checkoutasguest` (invitado) [OBS].

---

### 5.2 Sanity — Carrito

---

#### CR-SN01 — Agregar un producto configurable con atributos válidos
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **CART-01** · Especificación **TC-CART-01** · Matriz **M4**, **M5.1** |
| **Datos** | **Prueba Maty14** (configuración de §1.2) |

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo. Ingresar a `/build-your-own-computer` | Ficha con Processor\*, RAM\*, HDD\*, OS\*, Software; precio **1200.00** | 200 |
| 2 | Processor: elegir **2.5 GHz Intel Pentium Dual-Core E2200 [+15.00]** | — | — |
| 3 | RAM: elegir **4GB [+20.00]** | — | — |
| 4 | HDD: click en **320 GB** | — | — |
| 5 | OS: click en **Ubuntu** | — | — |
| 6 | Software: dejar sin marcar | — | — |
| 7 | Qty 1 → click en **Add to cart** | Barra verde de confirmación; header **(1)** | `POST /addproducttocart/details/16/1` → `success:true` |
| 8 | Ir a **Shopping cart** | La línea muestra “Processor: 2.5 GHz…, RAM: 4GB, HDD: 320 GB, OS: Ubuntu” y el link **Edit**; Price **1235.00** [HIP: suma de recargos] | 200 |

**Payload de API**
```http
POST https://demowebshop.tricentis.com/addproducttocart/details/16/1
Content-Type: application/x-www-form-urlencoded
X-Requested-With: XMLHttpRequest
```
```json
{
  "product_attribute_16_5_4": "14",
  "product_attribute_16_6_5": "16",
  "product_attribute_16_3_6": "18",
  "product_attribute_16_4_7": "44",
  "addtocart_16.EnteredQuantity": "1"
}
```
```json
{ "success": true, "message": "The product has been added to your <a href=\"/cart\">shopping cart</a>", "updatetopcartsectionhtml": "(1)", "updateflyoutcartsectionhtml": "…" }
```

---

#### CR-SN02 — Dos productos distintos: líneas y totales coherentes
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v2 **CART-01**, **CART-05** · Especificación **TC-CART-01/03** |
| **Datos** | **Prueba Maty12** + **Prueba Maty13** |

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo. BOOKS → **Add to cart** de Computing and Internet | Header (1) | `success:true` |
| 2 | **Add to cart** de Fiction | Header (2) | `success:true` |
| 3 | Ir a **Shopping cart** | 2 líneas, cada una con Qty 1: Computing and Internet 10.00 y Fiction 24.00 | 200 |
| 4 | Verificar el Sub-Total | **34.00** = 10.00 + 24.00 [OBS] | — |
| 5 | Verificar Shipping y Total | Pueden mostrar un número **o** el texto “**Calculated during checkout**”. Registrar lo que aparezca; **no** marcar Fail por el texto (N-06, comportamiento variable) [OBS] | — |
| 6 | Verificar el header | (2) = suma de cantidades | — |

**Payload de API:** dos llamadas `POST /addproducttocart/catalog/13/1/1` y `POST /addproducttocart/catalog/45/1/1`; la segunda devuelve `"updatetopcartsectionhtml": "(2)"`.

---

#### CR-SN03 — Checkout sin aceptar los términos muestra una advertencia
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P1 |
| **Trazabilidad** | Plan v1 **CAR-27** · Matriz **M5.2**, **F-01** |
| **Datos** | **Prueba Maty12** |

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo; agregar Computing and Internet; ir a **Shopping cart** | 1 línea | 200 |
| 2 | **No** marcar el checkbox de términos. Click en **Checkout** | Aparece un diálogo de advertencia pidiendo aceptar los términos; **no** navega [OBS] | **No** se envía ningún request (la regla está solo en el cliente) |
| 3 | Cerrar el diálogo, marcar los términos y click en **Checkout** | Va a la pantalla **Welcome, Please Sign In!** con **Checkout as Guest** | `POST /cart` → 302 → `/login/checkoutasguest` |

**Payload de API (nota de riesgo):** enviar directamente `{ "checkout": "checkout" }` **sin** `termsofservice` también avanza a `/login/checkoutasguest` [OBS] → defecto conocido **F-01** (se cubre en regresión CR-RG18).

---

#### CR-SN04 — Header, flyout y página del carrito coinciden
| Campo | Valor |
|---|---|
| **Tipo** | Sanity |
| **Prioridad** | P2 |
| **Trazabilidad** | Especificación **TC-CART-01** (pasos 4–7) · Matriz **M1**, **M5.1** |
| **Datos** | **Prueba Maty12** ×2 + **Prueba Maty13** ×1 |

**Pasos**

| # | Acción | Resultado esperado — Front | Resultado esperado — Backend |
|---|---|---|---|
| 1 | Incógnito nuevo. Ficha de Computing and Internet → Qty **2** → **Add to cart** | Header **(2)** | `POST /addproducttocart/details/13/1` (`EnteredQuantity=2`) → `success:true`, `"(2)"` |
| 2 | Ficha de Fiction → Qty 1 → **Add to cart** | Header **(3)** | `"(3)"` |
| 3 | Hover sobre **Shopping cart** | Flyout: “There are 3 item(s)…”, ambas líneas con su cantidad; Sub-Total **44.00** (2 × 10 + 24) | — |
| 4 | Click en **Shopping cart** | Las cantidades y el Sub-Total **44.00** coinciden con el flyout (el orden de las líneas puede variar: N-08) | 200 |

**Payload de API**
```json
{ "addtocart_13.EnteredQuantity": "2" }
```

---

## 6. Resumen de la suite Smoke / Sanity

| ID | Módulo | Tipo | Título | Datos | Prioridad |
|---|---|---|---|---|---|
| RG-SM01 | Registro | Smoke | Registro exitoso con todos los campos | Prueba Maty1 | P1 |
| RG-SM02 | Registro | Smoke | Disponibilidad del formulario y controles | Prueba Maty0 | P1 |
| RG-SM03 | Registro | Smoke | Campos obligatorios vacíos | Prueba Maty0 | P1 |
| RG-SN01 | Registro | Sanity | Registro sin Gender | Prueba Maty2 | P2 |
| RG-SN02 | Registro | Sanity | Contraseñas distintas | Prueba Maty4 | P1 |
| RG-SN03 | Registro | Sanity | Email ya registrado | Prueba Maty3 | P1 |
| RG-SN04 | Registro | Sanity | Login tras el registro | Prueba Maty1 | P2 |
| LG-SM01 | Login | Smoke | Login exitoso | Prueba Maty9 | P1 |
| LG-SM02 | Login | Smoke | Contraseña incorrecta | Prueba Maty9 | P1 |
| LG-SM03 | Login | Smoke | Logout | Prueba Maty9 | P1 |
| LG-SN01 | Login | Sanity | Usuario inexistente | Prueba Maty10 | P1 |
| LG-SN02 | Login | Sanity | Páginas privadas exigen sesión | Prueba Maty9 | P1 |
| LG-SN03 | Login | Sanity | Campos vacíos | Prueba Maty0 | P2 |
| LG-SN04 | Login | Sanity | Estado autenticado al navegar | Prueba Maty9 | P2 |
| CR-SM01 | Carrito | Smoke | Agregar producto simple | Prueba Maty12 | P1 |
| CR-SM02 | Carrito | Smoke | Actualizar cantidad | Prueba Maty13 | P1 |
| CR-SM03 | Carrito | Smoke | Eliminar y carrito vacío | Prueba Maty13 | P1 |
| CR-SM04 | Carrito | Smoke | Del carrito al checkout | Prueba Maty9 + Maty12 | P1 |
| CR-SN01 | Carrito | Sanity | Configurable con atributos | Prueba Maty14 | P1 |
| CR-SN02 | Carrito | Sanity | Dos productos y totales | Prueba Maty12 + Maty13 | P1 |
| CR-SN03 | Carrito | Sanity | Términos no aceptados | Prueba Maty12 | P1 |
| CR-SN04 | Carrito | Sanity | Header, flyout y carrito coinciden | Prueba Maty12 + Maty13 | P2 |

**Orden de ejecución sugerido del Smoke (≈ 15 min):** RG-SM02 → RG-SM03 → RG-SM01 → LG-SM01 → LG-SM03 → LG-SM02 → CR-SM01 → CR-SM02 → CR-SM03 → CR-SM04.

**Criterio de salida del Smoke:** los 10 casos Smoke en **Pass**. Un Fail detiene el ciclo y se reporta con la plantilla de `REPORTE_DE_DEFECTO.md`. Un Blocked por entorno se documenta y se reintenta cuando el entorno se estabiliza (Plan v2 §11.3).
