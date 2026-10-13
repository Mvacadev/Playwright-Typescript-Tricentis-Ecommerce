# REPORTE DE DEFECTO — DEF-01

**Aplicación:** Tricentis Demo Web Shop  
**URL:** https://demowebshop.tricentis.com/  
**Fecha de observación documentada:** 11/10/2026 y 12/10/2026  
**Entorno de observación:** Chrome 155, desktop, usuario invitado  
**Módulo:** M5 — Shopping cart (`/cart`)  
**Estado:** Nuevo — pendiente de triage y confirmación funcional  
**Severidad propuesta:** Media (Major)  
**Prioridad propuesta:** P2, pendiente de confirmación del QA Lead  
**Tipo de reporte:** Defecto funcional reproducible mediante la interfaz

---

## 1. Título

**[Carrito] Al actualizar la cantidad de una línea a 0 o a un valor negativo, el producto se elimina sin mensaje de validación ni confirmación.**

## 2. Resumen e impacto en el negocio

En la página **Shopping cart**, el campo **Qty.** permite ingresar `0` o un valor negativo. Al seleccionar **Update shopping cart**, la línea correspondiente desaparece del carrito sin mensaje de validación y sin conservar la cantidad anterior.

Se observó un contraste dentro de la misma aplicación: al ingresar `10001`, el carrito muestra el mensaje `The maximum quantity allowed for purchase is 10000.` y conserva la cantidad anterior. En la ficha del producto, los valores `0` y `-1` se rechazan con `Quantity should be positive`.

**Impacto potencial:**
- El usuario puede eliminar un producto accidentalmente al editar su cantidad.
- La eliminación silenciosa puede generar un carrito incompleto, pérdida de una venta o abandono.
- El comportamiento es inconsistente entre el carrito y la ficha de producto.

El impacto es potencial; no hay evidencia en este reporte de pedidos confirmados afectados ni de pérdidas comerciales medidas.

## 3. Precondiciones

1. El sitio está disponible.
2. La sesión corresponde a un usuario invitado (sin iniciar sesión).
3. Se puede agregar al carrito al menos dos productos comprables.
4. El carrito comienza vacío o se limpia antes de iniciar.
5. En el listado, confirmar que cada producto tenga **Add to cart** visible y habilitado. La etiqueta `In stock` por sí sola no garantiza que pueda comprarse.

## 4. Datos de prueba

Los productos y precios pueden cambiar; se muestran los usados en la observación original como referencia, no como valores permanentes.

| Dato | Valor observado |
|---|---|
| Producto A | `Computing and Internet`, cantidad 1 |
| Producto B bajo prueba | `Fiction`, cantidad inicial 1 |
| Valores defectuosos | `0`, `-1` |
| Valor de referencia | `10001` |
| Usuario | Invitado |

Antes de ejecutar, registrar los nombres y precios que muestre el sitio en ese momento.

## 5. Pasos manuales de reproducción

### Escenario A — cantidad 0

1. Abrir el navegador e ingresar a la página principal de Demo Web Shop.
2. Entrar en **Books** desde la navegación del sitio.
3. Localizar `Computing and Internet` y comprobar que tenga el botón **Add to cart** visible y habilitado.
4. Hacer clic en **Add to cart**. Verificar que el sitio muestre la confirmación de agregado y que el contador del carrito aumente.
5. Volver a **Books**, localizar `Fiction` y comprobar que **Add to cart** esté visible y habilitado.
6. Hacer clic en **Add to cart**.
7. Abrir **Shopping cart** desde el encabezado.
8. Antes de continuar, verificar que aparecen ambos productos y que cada uno tiene cantidad `1`. Si no es así, detener el escenario, registrar el estado y volver a preparar el carrito.
9. En la fila de `Fiction`, seleccionar el campo **Qty.**, reemplazar el valor `1` por `0` y no marcar la casilla **Remove**.
10. Hacer clic en **Update shopping cart**.
11. Observar el resultado y registrar:
    - si la línea `Fiction` sigue presente;
    - qué cantidad muestra;
    - si aparece un mensaje de validación;
    - qué productos quedan en el carrito;
    - qué valor muestra el contador del carrito en el encabezado.
12. Guardar una captura de la página resultante.

### Escenario B — cantidad negativa

13. Volver a **Books** y agregar `Fiction` otra vez, verificando que se pueda comprar.
14. Abrir **Shopping cart** y confirmar que `Fiction` esté presente con cantidad `1`.
15. En la fila de `Fiction`, reemplazar la cantidad `1` por `-1`, sin marcar **Remove**.
16. Hacer clic en **Update shopping cart**.
17. Registrar las mismas observaciones del paso 11 y guardar una captura.

### Escenario C — control de validación del límite superior

18. Volver a agregar `Fiction` y abrir **Shopping cart**.
19. Confirmar que su cantidad inicial sea `1`.
20. Reemplazar la cantidad por `10001` y hacer clic en **Update shopping cart**.
21. Registrar el mensaje, la cantidad final, la presencia de la línea y el contador. Este control permite comparar el tratamiento de una cantidad inválida con el comportamiento observado para `0` y `-1`.

### Limpieza

22. Al terminar, eliminar los productos mediante la casilla **Remove** y **Update shopping cart**, o vaciar el carrito mediante la interfaz.
23. Confirmar que el carrito quede vacío. No dejar el estado modificado para la siguiente ejecución.

## 6. Resultado obtenido

Según la ejecución documentada:

| Entrada | Resultado observado |
|---|---|
| `0` | La línea `Fiction` desaparece; no se muestra mensaje; el contador pasa de 2 a 1. |
| `-1` | La línea `Fiction` desaparece; no se muestra mensaje. |
| `10001` | Se muestra `The maximum quantity allowed for purchase is 10000.` y la cantidad anterior se conserva. |
| Ficha de producto con `0` o `-1` | El sistema devuelve el mensaje `Quantity should be positive`. |

La observación de red que respalda el resultado está disponible en el reporte técnico original: `POST /cart` responde HTTP 200 y vuelve a renderizar el carrito sin la línea eliminada y sin mensaje de error. Este detalle es evidencia complementaria; no es necesario para reproducir el defecto manualmente.

## 7. Resultado esperado propuesto por QA

Para `0` y cantidades negativas ingresadas en **Shopping cart**:

1. La aplicación muestra un mensaje de validación asociado a la cantidad.
2. Se conserva la cantidad válida anterior (en estos pasos, `1`).
3. El producto permanece en el carrito.
4. Los totales y el contador no cambian.
5. La eliminación ocurre mediante la acción explícita **Remove** y la posterior actualización del carrito.

**Decisión funcional pendiente:** confirmar con Producto/PO si `0` debe ser tratado como cantidad inválida o como una forma válida de eliminar el producto. La expectativa anterior es la definición propuesta por QA para este reporte, pero la decisión de negocio debe registrarse antes de usarla como criterio definitivo de aceptación. Para valores negativos, la validación es consistente con el comportamiento observado en la ficha de producto.

## 8. Severidad y prioridad

### Severidad propuesta: Media (Major)

Justificación:
- El usuario puede perder una línea del carrito sin recibir aviso.
- Existe inconsistencia entre validaciones del mismo flujo de compra.
- Hay una alternativa manual para recuperar el producto: volver a agregarlo.
- No se ha demostrado que afecte pedidos ya confirmados ni que bloquee por completo la compra.

Se recomienda reconsiderar la severidad si se comprueba que el comportamiento afecta otras pantallas críticas o genera pérdida de datos adicional.

### Prioridad propuesta: P2

La prioridad queda **pendiente de confirmación del QA Lead**. P2 es una propuesta razonable mientras exista el workaround y no se haya demostrado bloqueo del checkout. Podría elevarse a P1 si el equipo confirma que la pérdida silenciosa tiene impacto crítico o si el defecto afecta el flujo de checkout.

| Decisión | Valor |
|---|---|
| Severidad propuesta | Media |
| Prioridad propuesta | P2 |
| Confirmación QA Lead | Pendiente |
| Decisión PO sobre cantidad 0 | Pendiente |

## 9. Evidencia disponible

El reporte de ejecución original menciona estos archivos; verificar que estén incluidos en el paquete de evidencia del proyecto antes de distribuir el defecto:

| Evidencia | Descripción |
|---|---|
| `DEF-01_EV00_carrito_inicial.jpg` | Carrito con `Computing and Internet` ×1 y `Fiction` ×1 |
| `DEF-01_EV01_cantidad0_antes_update.png` | `Fiction` con Qty. `0` antes de actualizar |
| `DEF-01_EV02_cantidad0_despues_update.jpg` | `Fiction` desaparece después de actualizar |
| `DEF-01_EV03_cantidad_negativa_antes_update.png` | `Fiction` con Qty. `-1` antes de actualizar |
| `DEF-01_EV04_cantidad_negativa_despues_update.jpg` | `Fiction` desaparece después de actualizar |
| `DEF-01_EV05_referencia_10001_con_validacion.jpg` | Mensaje de máximo con cantidad `10001` |

**Nota:** las capturas se referencian desde el reporte original; no se afirma que estén embebidas en este archivo separado.

## 10. Validación de la corrección (Fix Validation) y regresión

Ejecutar después de que Desarrollo informe que la corrección está disponible. Usar Chromium como navegador principal y Firefox como regresión si ambos forman parte del alcance del proyecto. Ejecutar como invitado y, si está contemplado por el cambio, como usuario registrado.

| ID | Tipo | Prueba | Resultado esperado |
|---|---|---|---|
| FV-01-01 | Confirmación | Cambiar Qty. de `1` a `0` y actualizar | Mensaje de validación; producto y cantidad anterior conservados, según regla aprobada |
| FV-01-02 | Confirmación | Cambiar Qty. de `1` a `-1` y actualizar | Mensaje de validación; producto y cantidad anterior conservados |
| FV-01-03 | Confirmación | Cambiar Qty. de `3` a `0` | Si se confirma que `0` es inválido, se conserva `3` |
| FV-01-04 | Borde exploratorio | Probar `-10000`, `-0` y ` 0 ` | Registrar resultado; aplicar criterio acordado para entradas equivalentes o con espacios |
| FV-01-05 | Borde exploratorio | Probar `abc`, vacío y `1.5` | Definir el resultado esperado con QA/PO; no asumirlo sin acuerdo |
| FV-01-06 | Combinación | Dos líneas: A con cantidad inválida y B con cantidad válida `2` | Confirmar con Desarrollo/PO si se rechaza todo el envío o si B se actualiza; documentar la regla |
| FV-01-07 | Regresión | Cambiar cantidad `1` a `2` | Cantidad y totales se actualizan correctamente |
| FV-01-08 | Regresión | Probar `10000` y `10001` | `10000` se acepta si sigue siendo el máximo definido; `10001` muestra el mensaje de máximo y no elimina la línea |
| FV-01-09 | Regresión | Marcar **Remove** y actualizar | La línea marcada se elimina |
| FV-01-10 | Regresión | Eliminar la última línea | Se muestra el estado vacío del carrito y el contador queda en cero |
| FV-01-11 | Regresión | Marcar **Remove** y poner Qty. `0` en la misma línea | Confirmar precedencia de la acción explícita **Remove** según regla acordada |
| FV-01-12 | Regresión | Probar Qty. `0` y `-1` en la ficha de producto | Se mantiene la validación existente o la regla definida para ese flujo |
| FV-01-13 | Exploratoria | Probar cantidades inválidas en Wishlist | Fuera de la aceptación de este defecto salvo que se amplíe formalmente el alcance |
| FV-01-14 | Integración | Introducir cantidad inválida y navegar a Checkout | No se pierde silenciosamente el estado válido del carrito; verificar según regla aprobada |

### Criterio de cierre

No cerrar el defecto hasta que:
1. exista una decisión registrada sobre el comportamiento esperado para cantidad `0`;
2. FV-01-01 y FV-01-02 pasen en los navegadores acordados;
3. las pruebas de regresión relevantes no presenten fallos;
4. se adjunte evidencia posterior a la corrección;
5. el resultado se refleje en los casos de prueba relacionados.

## 11. Trazabilidad

| Artefacto | Referencia |
|---|---|
| Matriz de conocimiento | M5.2 — página del carrito; hallazgo F-05 |
| TEST_PLAN_v2 | S-05 y CART-02; riesgos R-05 y R-06 |
| Especificación original | TC-CART-02, N-05, PO-06, R-F02 y R-U01 |
| Historia derivada | HU-CART-02, criterio relativo a validación de cantidades inválidas |

## 12. Notas para triage

- El comportamiento se ha reportado como reproducido el 11/10/2026 y el 12/10/2026.
- El valor `abc` también se observó como capaz de eliminar la línea sin mensaje, pero debe tratarse como una variante adicional que requiere validación explícita.
- El defecto está reproducido; eso no sustituye la decisión de Producto sobre el criterio esperado ni la ejecución de las pruebas de fix validation.
