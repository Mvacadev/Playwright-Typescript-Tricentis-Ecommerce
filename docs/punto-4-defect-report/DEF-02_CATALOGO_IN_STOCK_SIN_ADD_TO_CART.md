# REPORTE DE DEFECTO — DEF-02

**Aplicación:** Tricentis Demo Web Shop  
**URL:** https://demowebshop.tricentis.com/  
**Fecha de observación documentada:** 11/10/2026 y 12/10/2026  
**Entorno de observación:** Chrome 155, desktop, usuario invitado  
**Módulos:** M2 — Catálogo; M4 — Detalle de producto; impacto en M5 — Carrito  
**Estado:** Nuevo — pendiente de decisión funcional de Producto/PO  
**Severidad propuesta:** Alta (Major) si los productos deben venderse; revisar si la compra deshabilitada es intencional  
**Prioridad propuesta:** P1 si deben venderse; alternativa P3 si el comportamiento es intencional y solo debe corregirse la comunicación de la UI  
**Tipo de reporte:** Inconsistencia de disponibilidad/comprabilidad reproducible mediante la interfaz

---

## 1. Título

**[Catálogo / Carrito] Productos indicados como “In stock” muestran precio, pero no ofrecen “Add to cart” ni permiten iniciar la compra.**

## 2. Resumen e impacto en el negocio

En un barrido documentado de 10 categorías, se identificaron 11 productos con la indicación **In stock** y precio visible, pero sin botón **Add to cart** en el listado ni en la ficha. En la ficha tampoco aparece el campo de cantidad. El usuario no puede iniciar la compra y la interfaz no explica por qué.

La inspección técnica adicional de la ejecución original indicó que el servidor rechazó las solicitudes de alta con el mensaje `Buying is disabled for this product`. Esto apunta a una configuración de compra deshabilitada por producto, aunque el reporte no determina por sí solo si esa configuración es incorrecta o intencional.

**Impacto potencial si los productos deberían venderse:**
- El usuario no puede comprar artículos que la interfaz presenta como disponibles.
- Se genera una expectativa contradictoria entre disponibilidad/precio y posibilidad de compra.
- Los datos de prueba no pueden seleccionarse de forma fiable usando únicamente la etiqueta `In stock`.

El impacto comercial cuantificado no está disponible. La proporción observada fue 11 de 45 productos indicados como en stock (aproximadamente 24 %) en el conjunto de categorías revisado.

## 3. Precondiciones

1. El sitio está disponible.
2. La sesión corresponde a un usuario invitado.
3. Los productos listados en la tabla de datos siguen publicados y accesibles.
4. Se ejecuta la inspección desde la interfaz web, sin requerir herramientas de desarrollo.
5. Para el control positivo, debe existir al menos un producto con **Add to cart** visible y habilitado.

## 4. Datos de prueba

Los precios son los observados en la ejecución original y pueden cambiar.

| Categoría | Producto | ID registrado | Precio observado | Observación |
|---|---|---:|---:|---|
| Books | Science | 27 | 51.00 | In stock, sin botón |
| Books | Fiction EX | 78 | 24.00 | In stock, sin botón |
| Desktops | Desktop PC with CDRW | 21 | 500.00 | In stock, sin botón |
| Desktops | Elite Desktop PC | 32 | 1350.00 | In stock, sin botón |
| Camera, photo | 1MP 60GB Hard Drive Handycam Camcorder | 44 | 349.00 | In stock, sin botón |
| Camera, photo | Camcorder | 20 | 530.00 | In stock, sin botón |
| Camera, photo | High Definition 3D Camcorder | 41 | 1300.00 | In stock, sin botón |
| Cell phones | Used phone | 15 | 5.00 | In stock, sin botón |
| Apparel & Shoes | Green and blue Sneaker | 68 | 17.56 | In stock; producto con atributos |
| Jewelry | Diamond Tennis Bracelet | 26 | 360.00 | In stock, sin botón |
| Jewelry | Vintage Style Three Stone Diamond Engagement Ring | 48 | 2100.00 | In stock, sin botón |

**Controles y exclusiones observados:**
- Controles positivos: `Computing and Internet`, `Fiction` y `Health Book` mostraron **Add to cart** y pudieron agregarse durante la observación.
- Algunos productos `Out of stock` tampoco mostraban botón; esto es coherente con su disponibilidad y no debe reportarse como el mismo defecto sin evidencia adicional.
- `Digital SLR Camera 12.2 Mpixel` no mostraba el botón en el listado, pero sí en la ficha; se documentó como producto configurable y quedó excluido del defecto original.

Antes de reportar, volver a comprobar que cada producto siga publicado y registrar los valores actuales. No depender del precio como identificador del defecto.

## 5. Pasos manuales de reproducción

### Escenario A — producto Science

1. Abrir el navegador e ingresar a la página principal de Demo Web Shop.
2. Desde la navegación del sitio, entrar en **Books**.
3. Localizar el producto `Science` en la grilla.
4. Verificar que la tarjeta muestre **In stock** y un precio.
5. Verificar si la tarjeta presenta el botón **Add to cart**. No asumir que existe: registrar si está ausente.
6. Hacer clic en el nombre o imagen de `Science` para abrir su ficha.
7. En la ficha, localizar la sección de disponibilidad y el precio.
8. Confirmar si se muestra **Availability: In stock**.
9. Revisar el área donde normalmente aparecen la cantidad y el botón **Add to cart**.
10. Registrar si ambos controles están ausentes y si la página muestra alguna explicación de por qué no se puede comprar.
11. Guardar una captura del listado y otra de la ficha.

### Escenario B — comprobar que no es un problema general del sitio

12. Volver a **Books**.
13. Localizar `Computing and Internet` o `Fiction`.
14. Confirmar que **Add to cart** esté visible y habilitado.
15. Hacer clic en **Add to cart**.
16. Verificar que aparezca una confirmación de agregado y que el contador del carrito aumente.
17. Abrir **Shopping cart** y comprobar que el producto aparece en el carrito.
18. Registrar el control positivo y luego retirar el producto del carrito.

### Escenario C — comprobar la extensión en otras categorías

19. Entrar en **Desktops** y buscar `Desktop PC with CDRW` y `Elite Desktop PC`.
20. Repetir la inspección del listado y de la ficha: disponibilidad, precio, botón **Add to cart**, campo de cantidad y mensaje explicativo.
21. Entrar en **Camera, photo** y repetir con `1MP 60GB Hard Drive Handycam Camcorder`, `Camcorder` y `High Definition 3D Camcorder`.
22. Entrar en **Cell phones** y repetir con `Used phone`.
23. Entrar en **Apparel & Shoes** y revisar `Green and blue Sneaker`. Si la ficha permite elegir Size o Color, registrar las opciones disponibles y si aparece el control de compra después de elegirlas.
24. Entrar en **Jewelry** y repetir con `Diamond Tennis Bracelet` y `Vintage Style Three Stone Diamond Engagement Ring`.
25. Para cada producto, registrar categoría, nombre, disponibilidad, precio mostrado, presencia del botón en listado y ficha, presencia del campo de cantidad y cualquier mensaje explicativo.
26. Si un producto ya no aparece o cambió su estado, registrar la diferencia y no dar por reproducido ese elemento.

### Limpieza

27. Abrir **Shopping cart** y retirar los productos agregados durante los controles positivos.
28. Confirmar que el carrito quede vacío.

## 6. Resultado obtenido

En la ejecución documentada:
- Los 11 productos de la tabla mostraban `In stock` y precio, pero no ofrecían **Add to cart** ni campo de cantidad en la ficha.
- No se mostró un mensaje explicando la imposibilidad de compra.
- Las llamadas HTTP de diagnóstico respondieron `Buying is disabled for this product`; para un producto agotado se observó además `Out of stock`.

La respuesta de API es evidencia técnica complementaria y no es necesaria para que un QA manual reproduzca la inconsistencia de la interfaz.

## 7. Resultado esperado y decisión funcional

La expectativa depende de una decisión pendiente de Producto/PO.

### Alternativa A — los productos deben venderse

Si los productos publicados como `In stock` están destinados a la venta online:

1. El producto debe ofrecer un camino de compra consistente con su configuración y tipo.
2. En la ficha debe mostrarse **Add to cart** y el control de cantidad cuando corresponda.
3. Al seleccionar **Add to cart**, el producto debe incorporarse al carrito y la UI debe confirmar el resultado.
4. El estado y la configuración del producto deben permitir la compra; no basta con mostrar el botón si el servidor la rechaza.

### Alternativa B — la compra deshabilitada es intencional

Si negocio confirma que esos productos no deben venderse online:

1. La UI no debe crear la expectativa de que están disponibles para compra online.
2. Debe ocultar o aclarar el estado `In stock` de forma coherente con la regla definida.
3. Debe comunicar la indisponibilidad de compra con un mensaje claro, o excluir el producto de la presentación de disponibilidad para compra online.

**Decisión pendiente:** Producto/PO debe confirmar qué alternativa corresponde. Hasta entonces, el reporte describe una inconsistencia reproducible, pero no debe cerrarse como defecto de configuración de compra sin validar la intención de negocio.

## 8. Severidad y prioridad

### Severidad propuesta: Alta (Major) si se esperaba vender los productos

Justificación:
- Impide iniciar la compra de los artículos afectados.
- No existe un workaround visible para el usuario.
- La UI muestra disponibilidad y precio sin permitir completar la acción esperada.

La severidad debe revisarse si Producto confirma que la compra deshabilitada es intencional y solo se requiere mejorar el mensaje de disponibilidad.

### Prioridad propuesta: condicionada a la decisión de Producto

| Decisión de Producto | Prioridad propuesta | Tratamiento |
|---|---|---|
| Los productos deben venderse online | P1 | Corregir configuración o implementación y validar la compra de los productos afectados |
| La compra deshabilitada es intencional | P3, como propuesta | Corregir la presentación de disponibilidad/mensaje; registrar como problema de comunicación de UI si corresponde |
| La decisión aún no existe | Pendiente | Mantener abierto; no cerrar ni asignar prioridad definitiva |

| Decisión | Valor |
|---|---|
| Severidad propuesta si deben venderse | Alta |
| Prioridad si deben venderse | P1 |
| Prioridad si es intencional | P3, propuesta |
| Confirmación QA Lead / PO | Pendiente |

## 9. Evidencia disponible

El reporte original menciona estas capturas. Verificar que estén incluidas en el paquete de evidencia del proyecto antes de distribuir el defecto:

| Evidencia | Descripción |
|---|---|
| `DEF-02_EV01_listado_books_sin_boton.jpg` | Listado de Books: productos comprables con botón y `Science`/`Fiction EX` sin botón |
| `DEF-02_EV02_ficha_science_in_stock_sin_boton.jpg` | Ficha de Science: disponibilidad y precio visibles, sin botón ni cantidad |

La ejecución técnica original registró también respuestas de API para los productos afectados y un producto agotado. No se reproducen aquí como requisito para la ejecución manual.

## 10. Validación de la corrección (Fix Validation) y regresión

Ejecutar cuando Producto haya confirmado la alternativa esperada y Desarrollo haya aplicado el cambio.

| ID | Tipo | Prueba | Resultado esperado |
|---|---|---|---|
| FV-02-01 | Confirmación | Revisar los productos simples afectados en el listado | Si deben venderse, muestran un camino de compra válido; si no, la UI comunica la indisponibilidad según la decisión aprobada |
| FV-02-02 | Confirmación | Abrir las fichas de los 11 productos | Estado de disponibilidad, botón y cantidad coherentes con la decisión de Producto |
| FV-02-03 | Confirmación | Agregar desde el listado los productos simples seleccionados | Si deben venderse, se agregan al carrito, aparece confirmación y el contador se actualiza |
| FV-02-04 | Confirmación | Revisar `Green and blue Sneaker` con sus atributos | La UI presenta el flujo de compra correcto según la decisión; si es comprable, permite seleccionar atributos y agregarlo |
| FV-02-05 | Integración complementaria | Confirmar que los productos declarados comprables no sean rechazados por configuración | La operación de alta resulta exitosa para los productos que deben venderse |
| FV-02-06 | E2E opcional | Completar un checkout de prueba con un producto afectado | Solo si está autorizado y forma parte del alcance; no confirmar pedidos reales sin autorización |
| FV-02-07 | Permisos | Repetir el flujo como usuario registrado | El comportamiento es consistente con el de invitado, salvo regla documentada |
| FV-02-08 | Regresión | Revisar productos `Out of stock` | No se habilita la compra si el producto está agotado, conforme a la regla aprobada |
| FV-02-09 | Regresión | Revisar `Digital SLR Camera 12.2 Mpixel` | El comportamiento de producto configurable se mantiene según la regla acordada |
| FV-02-10 | Regresión | Agregar los controles positivos `Computing and Internet`, `Fiction` y `Health Book` | Siguen pudiéndose agregar al carrito |
| FV-02-11 | Data guard | Recorrer las categorías y comparar disponibilidad declarada con capacidad de compra | No hay contradicciones sin explicación; definir si este chequeo se automatizará |
| FV-02-12 | Alternativa B | Si la compra deshabilitada es intencional, revisar los productos afectados | No se presentan como disponibles para compra online sin explicación |

### Criterio de cierre

No cerrar el defecto hasta que:
1. Producto/PO registre si los artículos deben venderse online;
2. el resultado esperado esté definido para listado y ficha;
3. se ejecuten las pruebas de confirmación aplicables a esa decisión;
4. se compruebe que los productos agotados y configurables conservan el comportamiento esperado;
5. se adjunte evidencia posterior a la corrección y se actualice la trazabilidad.

## 11. Trazabilidad

| Artefacto | Referencia |
|---|---|
| Matriz de conocimiento | M2 — listados; M4 — detalle de producto; M5.1 — alta al carrito |
| TEST_PLAN_v2 | S-04 y CART-01; criterios de selección de producto y riesgos R-05/R-09 |
| Especificación original | TC-CART-01, N-07, PO-08, R-F03 y R-U05 |
| Historia derivada | HU-CART-01, criterio sobre productos no comprables; debe actualizarse después de la decisión de Producto |

## 12. Notas para triage

- La ejecución original registró 11 productos afectados entre 45 productos marcados `In stock`, dentro de 10 categorías revisadas. Es una observación de ese barrido, no una garantía de que el catálogo actual conserve exactamente los mismos datos.
- La causa probable indicada por la respuesta técnica es que la compra está deshabilitada por producto. La causa raíz debe confirmarla Desarrollo.
- El defecto de presentación/requisito y la configuración de comprabilidad deben analizarse juntos, pero no deben confundirse: la decisión de negocio determina cuál es el resultado esperado.
