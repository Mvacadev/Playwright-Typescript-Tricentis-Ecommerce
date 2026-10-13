# CASO DE PRUEBA DE API DOCUMENTADO — Login exitoso y fallido con Postman
**Aplicación:** https://demowebshop.tricentis.com/ (nopCommerce · ASP.NET MVC 5.2 · IIS 10)
**Versión:** 1.0 · **Fecha:** 13/10/2026 · **Estrategia:** POISED
**Origen:** sección 5 de `GUIA_PRUEBAS_API_POSTMAN.md` (separada en este documento)

**Documentos y archivos relacionados:**

| Archivo | Uso |
|---|---|
| `GUIA_PRUEBAS_API_POSTMAN.md` | Preparación del ambiente (instalación de Postman, variables, cookies, redirects) y guía de ejecución |
| `postman/DemoWebShop_API_QA.postman_collection.json` | Requests LOGIN-01, LOGIN-01b, LOGOUT-01, AUTH-01, LOGIN-02, LOGIN-03 (carpeta `01 - Login y sesión`) |
| `postman/DemoWebShop_demo-public.postman_environment.json` | Variables `baseUrl`, `testUserEmail`, `testUserPassword` (secret) |

> **Etiquetas de oráculo:** **[OBS]** observado en la plataforma · **[HIP]** hipótesis de QA · **[REQ?]** requiere decisión de negocio · **F-xx / N-xx** hallazgos ya documentados.
>
> **Antes de ejecutar:** completar la preparación descrita en las secciones 3.1 a 3.4 de `GUIA_PRUEBAS_API_POSTMAN.md`.

---

## 1. Ficha del caso

| Campo | Valor |
|---|---|
| **ID** | API-LOGIN-EX (requests LOGIN-01, LOGIN-01b, LOGOUT-01, AUTH-01, LOGIN-02, LOGIN-03 de la colección) |
| **Objetivo** | Validar a nivel HTTP que un usuario válido se autentica y que uno inválido es rechazado con un mensaje claro |
| **POISED** | **P** (Email/Password/RememberMe) · **O** (302 vs 200 + mensaje) · **I** (login ↔ `/customer/info` ↔ header) · **S** (sesión, rutas privadas, enumeración) · **E** (mensajes de error) · **D** (email persistido y comparado sin distinguir mayúsculas) |
| **Trazabilidad** | TEST_PLAN_v2 **S-02**, **LOG-01**, **LOG-02** · Especificación **TC-LOG-01/02/03** · Matriz **M9/M13.5** · Hallazgos **F-02**, **F-03**, **N-01** |
| **Precondiciones** | Entorno demo-public seleccionado; `testUserEmail` y `testUserPassword` cargados como secret; dominio en Cookies → Domains Allowlist |

## 2. Escenario exitoso

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

## 3. Escenario fallido

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

## 4. Evidencia a adjuntar
Captura de Body y Headers de LOGIN-01 (con `Set-Cookie` enmascarado), LOGIN-01b, LOGIN-02 y LOGIN-03; el panel **Test Results** de cada uno; y el JSON exportado del Runner de la carpeta `01 - Login y sesión`.
