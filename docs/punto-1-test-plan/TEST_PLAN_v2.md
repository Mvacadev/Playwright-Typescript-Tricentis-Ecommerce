# TEST PLAN --- Tricentis Demo Web Shop

**Versión:** 2.0\
**Estado:** Propuesta de ejecución para challenge QA Automation\
**Aplicación:** Tricentis Demo Web Shop ---
https://demowebshop.tricentis.com/\
**Base documental:** `ANALISIS_BASE_TEST_PLAN.md` y revisión QA Lead de
`TEST_PLAN_REGISTRO_LOGIN_CARRITO.md`\
**Stack previsto:** Playwright + TypeScript\
**Navegadores objetivo:** Chromium y Firefox

------------------------------------------------------------------------

## 1. Objetivo

Validar funcionalmente los flujos esenciales de una tienda online:
registro, autenticación, búsqueda y selección de productos, gestión del
carrito y finalización de una compra de punta a punta (E2E).

El plan está adaptado a un ejercicio sin Product Owner (PO), historias
de usuario ni criterios de aceptación formales. Por eso, distingue entre
comportamiento observable, hipótesis de trabajo y puntos que necesitan
validación. La ausencia de PO no impide ejecutar pruebas, pero limita
qué conclusiones pueden considerarse definitivas.

## 2. Alcance

### 2.1 Incluido

-   Registro de un usuario nuevo.
-   Validaciones funcionales principales del registro.
-   Inicio de sesión con credenciales válidas e inválidas y cierre de
    sesión.
-   Búsqueda de productos y selección de un resultado.
-   Agregar productos al carrito, cambiar una cantidad ordinaria y
    eliminar productos.
-   Verificar el contenido y los importes básicos del carrito.
-   Completar el checkout E2E con datos ficticios y un método de pago de
    prueba o no transaccional disponible en el entorno.
-   Rechazo de datos inválidos en los formularios principales de
    registro, login y checkout.
-   Ejecución prioritaria en Chromium y una pasada de regresión en
    Firefox.

### 2.2 Fuera del alcance de regresión obligatoria

-   Wishlist y transferencia de artículos entre Wishlist y carrito.
-   Customer Service: Recently Viewed Items, Compare Products,
    Information Links y suscripción a newsletters.
-   My Account: Downloadable Products, Back in stock subscriptions,
    Reward Points y Change Password.
-   Enlaces de contacto.
-   Persistencia del carrito entre sesiones o navegadores.
-   Fusión del carrito de invitado con el de un usuario autenticado.
-   Remember me, expiración de sesión y redirecciones post-login
    específicas.
-   Límites extremos de cantidades y pruebas de concurrencia.
-   Pruebas exhaustivas de contrato HTTP/API, seguridad, rendimiento y
    accesibilidad.
-   Cupones, gift cards y estimación de envío, salvo que se incorporen
    posteriormente como alcance explícito.

Los elementos excluidos pueden investigarse de forma exploratoria si
aparecen indicios durante la ejecución, pero no bloquean el cierre de
las suites definidas aquí.

### 2.3 Riesgo transversal: Downloadable Products

La página Downloadable Products se mantiene como **riesgo transversal e
investigación exploratoria**, no como caso obligatorio de Smoke ni de
Regression. Si durante una exploración se observa que una navegación
lenta o bloqueada afecta otras operaciones del mismo usuario, se
registrará la evidencia, el impacto y las condiciones para reproducirlo.
No se automatizará como regresión obligatoria en esta versión.

## 3. Enfoque y fases

El plan se ejecuta por fases para evitar invertir tiempo en una suite
extensa antes de confirmar los flujos básicos:

1.  **Fase A --- Preflight y exploración breve:** verificar
    disponibilidad del sitio, descubrir productos comprables,
    identificar los campos y pasos reales del checkout y confirmar que
    existe un camino de compra seguro para pruebas.
2.  **Fase B --- Smoke funcional:** conjunto pequeño y bloqueante de los
    flujos de mayor valor.
3.  **Fase C --- Regression funcional:** ampliar las combinaciones
    principales de validación, carrito, búsqueda y checkout.
4.  **Fase D --- Investigación exploratoria:** investigar anomalías
    transversales y riesgos no incluidos en las suites obligatorias.
5.  **Fase E --- Informe:** consolidar resultados, defectos, hipótesis
    no confirmadas y cobertura pendiente.

Las pruebas automatizadas se implementarán con Playwright y TypeScript.
Se priorizarán pruebas UI E2E que validen el resultado observable del
usuario. No se agregará una suite independiente de contratos HTTP en
esta fase.

## 4. Oráculos, supuestos y tratamiento de incertidumbre

Como no hay especificación funcional formal, cada expectativa debe
interpretarse según su fuente:

  -----------------------------------------------------------------------
  Etiqueta                Significado             Uso
  ----------------------- ----------------------- -----------------------
  **\[OBS\]**             Comportamiento          Sirve como línea base,
                          observado en la         pero no prueba por sí
                          aplicación durante el   mismo que el
                          preflight o la          comportamiento sea
                          exploración             correcto.

  **\[HIP\]**             Hipótesis funcional     Puede guiar pruebas
                          razonable de QA,        iniciales; un resultado
                          pendiente de            inesperado se registra
                          confirmación            como hallazgo
                                                  potencial.

  **\[REQ?\]**            Expectativa que depende El caso puede quedar
                          de una decisión de      bloqueado o reportarse
                          negocio o configuración como resultado
                          que no se pudo          provisional.
                          confirmar               
  -----------------------------------------------------------------------

Un comportamiento observado no se etiquetará automáticamente como
requisito. Cuando una expectativa dependa de una hipótesis, el reporte
deberá indicar esa limitación. En ausencia de PO, los defectos se
describirán como **defecto confirmado** solo si existe una regla
verificable; en otros casos se clasificarán como **anomalía observada**
o **posible defecto**, con evidencia y pregunta pendiente.

### 4.1 Supuestos de trabajo iniciales

-   El sitio público es un entorno compartido y puede cambiar durante el
    challenge.
-   El catálogo, los precios, el inventario y las opciones de checkout
    pueden variar.
-   Se utilizarán datos ficticios y un correo único por ejecución para
    evitar colisiones de registro.
-   No se introducirán datos de pago reales ni se realizarán
    transacciones reales.
-   Se utilizará el método de pago de prueba o no transaccional
    disponible. Si no existe un camino seguro para finalizar la compra,
    el E2E de checkout quedará **bloqueado por entorno/configuración**,
    con evidencia; no se declarará aprobado ni cubierto.
-   Las reglas de negocio no documentadas se mantendrán como hipótesis,
    no como criterios definitivos.

## 5. Riesgos prioritarios

  -----------------------------------------------------------------------------
  ID             Riesgo           Impacto        Prioridad      Mitigación /
                                                                cobertura
  -------------- ---------------- -------------- -------------- ---------------
  R-01           No es posible    Alto           P1             Smoke de
                 registrar una                                  registro
                 cuenta nueva                                   exitoso y
                                                                regresión de
                                                                validaciones
                                                                principales

  R-02           Un usuario       Alto           P1             Smoke de login
                 válido no puede                                válido
                 autenticarse                                   

  R-03           El sistema       Alto           P1             Smoke de login
                 permite                                        inválido
                 autenticación                                  
                 con credenciales                               
                 incorrectas                                    

  R-04           La búsqueda no   Alto           P1             Smoke de
                 devuelve                                       búsqueda y
                 resultados                                     selección
                 relevantes o no                                
                 permite                                        
                 seleccionar un                                 
                 producto                                       

  R-05           Agregar,         Alto           P1             Smoke de
                 actualizar o                                   carrito y
                 eliminar un                                    regresión de
                 producto del                                   operaciones
                 carrito falla                                  

  R-06           Los importes o   Alto           P1             Validaciones
                 cantidades del                                 funcionales del
                 carrito no son                                 carrito
                 consistentes con                               
                 sus líneas                                     

  R-07           Un usuario no    Alto           P1             Checkout E2E
                 puede completar                                completo
                 una compra                                     
                 válida                                         

  R-08           El checkout      Alto           P1             Casos negativos
                 acepta datos                                   de checkout
                 requeridos                                     
                 inválidos o no                                 
                 permite                                        
                 corregirlos                                    

  R-09           El entorno       Medio/alto     P1             Preflight,
                 público cambia o                               evidencia y
                 se encuentra                                   clasificación
                 temporalmente                                  de bloqueo de
                 indisponible                                   entorno

  R-10           Una              Variable       P3             Investigación
                 funcionalidad                                  exploratoria,
                 fuera de alcance                               no regresión
                 afecta                                         obligatoria
                 indirectamente                                 
                 al flujo                                       
                 principal                                      
  -----------------------------------------------------------------------------

## 6. Estrategia de datos y ambiente

### 6.1 Ambiente

-   URL base: `https://demowebshop.tricentis.com/`.
-   Navegadores: Chromium para Smoke; Chromium y Firefox para
    Regression.
-   Cada test deberá iniciar desde un estado conocido cuando sea posible
    y no depender de la ejecución previa de otro test.
-   El preflight confirmará que la Home, el catálogo, la búsqueda, el
    carrito y las páginas de checkout responden.
-   Si la aplicación o el catálogo cambian, los tests deberán
    identificar el cambio con un mensaje claro; no deben depender de IDs
    internos ni precios codificados como verdades permanentes.

### 6.2 Datos

-   Registrar usuarios con email único por ejecución, por ejemplo, un
    identificador aleatorio más un dominio reservado de pruebas.
-   Mantener credenciales de prueba en configuración segura, sin
    secretos reales en el repositorio.
-   Seleccionar productos visibles y disponibles durante el preflight.
-   No fijar importes absolutos salvo que se hayan capturado en el
    propio test; verificar consistencia entre precio unitario, cantidad,
    subtotal y total visible.
-   Evitar paralelizar tests que modifiquen el mismo usuario o carrito
    compartido.
-   No asumir que las cuentas creadas en una ejecución se pueden
    eliminar.
-   En los reportes, ocultar contraseñas y cualquier dato sensible que
    aparezca en capturas o trazas.

## 7. Smoke Suite --- mínima y funcional

La Smoke Suite debe responder rápidamente si los caminos esenciales
están utilizables. Es bloqueante para declarar que la aplicación está en
condiciones de continuar con la regresión. No busca cubrir todas las
validaciones.

  ---------------------------------------------------------------------------
  ID             Escenario      Pasos          Criterio de     Prioridad
                                resumidos      aceptación      
  -------------- -------------- -------------- --------------- --------------
  S-01           Registro       Abrir          La aplicación   P1
                 exitoso        registro,      confirma el     
                                completar      registro y      
                                campos válidos permite         
                                con email      continuar con   
                                único y enviar la cuenta según 
                                               el flujo        
                                               observado.      

  S-02           Login válido e Probar una     El login válido P1
                 inválido       cuenta válida; autentica; las  
                                luego intentar credenciales    
                                login con      incorrectas no  
                                credenciales   autentican y se 
                                incorrectas    muestra         
                                               feedback de     
                                               error.          

  S-03           Buscar y abrir Buscar un      Se muestran     P1
                 producto       término de     resultados      
                                catálogo       coherentes con  
                                confirmado en  la búsqueda y   
                                preflight y    puede abrirse   
                                abrir un       la ficha de un  
                                resultado      producto.       

  S-04           Agregar        Desde una      Se muestra      P1
                 producto       ficha          confirmación o  
                 simple al      comprable,     estado de       
                 carrito        agregar un     carrito         
                                producto       actualizado y   
                                simple         el producto     
                                               aparece con     
                                               cantidad 1.     

  S-05           Actualizar y   Cambiar la     La cantidad y   P1
                 eliminar del   cantidad a 2,  el subtotal se  
                 carrito        actualizar;    actualizan; al  
                                luego eliminar eliminar, el    
                                el producto    producto deja   
                                               de aparecer y   
                                               el carrito      
                                               refleja el      
                                               estado vacío.   

  S-06           Validación     Enviar el      La aplicación   P1
                 principal de   formulario sin impide          
                 registro       completar un   completar el    
                                campo          registro y      
                                requerido o    muestra         
                                con            validaciones    
                                contraseñas    asociadas al    
                                diferentes     campo o al      
                                               formulario.     

  S-07           Checkout E2E   Con un         Se alcanza la   P1
                 completo       producto en el confirmación de 
                                carrito,       pedido; el      
                                avanzar por    resumen         
                                los pasos      corresponde a   
                                requeridos,    los artículos y 
                                completar      cantidades      
                                datos          enviados y se   
                                ficticios,     muestra un      
                                seleccionar    identificador o 
                                opciones       confirmación de 
                                disponibles y  orden.          
                                confirmar                      

  S-08           Rechazo de     Omitir un dato El paso no se   P1
                 dato requerido obligatorio    completa hasta  
                 en checkout    identificado   corregir el     
                                durante el     dato y el       
                                preflight e    sistema         
                                intentar       presenta        
                                avanzar        feedback útil.  
  ---------------------------------------------------------------------------

**Reglas de ejecución de Smoke** - Ejecutar en Chromium en cada ciclo
relevante. - No reintentar automáticamente un fallo funcional para
convertirlo en verde. Si se habilitan retries de infraestructura,
reportar el primer resultado y el resultado del retry por separado. - Si
S-07 no puede ejecutarse por falta de método de pago seguro o por una
configuración no disponible, marcarlo como **Blocked**, no como Pass ni
como Fail funcional. - La Smoke Suite no debe incluir Wishlist,
Downloadable Products, pruebas de seguridad especializadas ni métricas
de rendimiento.

## 8. Regression Suite --- ampliación funcional acotada

La regresión cubre variantes funcionales de los flujos principales sin
intentar agotar todos los valores de entrada.

  -----------------------------------------------------------------------
  ID                Escenario         Criterio de       Prioridad
                                      aceptación        
  ----------------- ----------------- ----------------- -----------------
  REG-01            Registro con      El sistema no     P1
                    email ya          crea una segunda  
                    registrado        cuenta con el     
                                      mismo email y     
                                      comunica el       
                                      problema.         

  REG-02            Registro con      No se crea la     P1
                    formato de email  cuenta y se       
                    inválido          informa el        
                                      formato inválido. 

  REG-03            Registro con      El formulario no  P1
                    campos            se completa y se  
                    obligatorios      identifican los   
                    incompletos       datos faltantes.  

  REG-04            Contraseñas no    El registro se    P1
                    coincidentes      rechaza con una   
                                      validación clara. 

  LOG-01            Login con usuario No se autentica y P1
                    inexistente       se muestra        
                                      feedback de       
                                      error.            

  LOG-02            Logout            Tras cerrar       P2
                                      sesión, la        
                                      interfaz refleja  
                                      el estado no      
                                      autenticado.      

  SRCH-01           Búsqueda sin      Se informa que no P2
                    resultados        hay resultados o  
                                      se muestra un     
                                      estado vacío      
                                      comprensible.     

  SRCH-02           Abrir producto    La ficha          P1
                    desde resultados  corresponde al    
                                      producto          
                                      seleccionado en   
                                      la lista.         

  CART-01           Agregar dos       Ambos productos   P1
                    productos         aparecen en el    
                    diferentes        carrito con las   
                                      cantidades        
                                      correctas.        

  CART-02           Modificar         La cantidad, el   P1
                    cantidad de un    subtotal de línea 
                    producto          y el total se     
                                      recalculan        
                                      coherentemente.   

  CART-03           Eliminar un       Solo se elimina   P1
                    producto de un    el artículo       
                    carrito con       elegido; los      
                    varios artículos  demás permanecen. 

  CART-04           Carrito vacío     El estado vacío   P2
                                      se muestra y no   
                                      quedan líneas de  
                                      producto          
                                      visibles.         

  CART-05           Totales del       El subtotal       P1
                    carrito           coincide con la   
                                      suma de los       
                                      subtotales de     
                                      línea; los        
                                      importes          
                                      adicionales se    
                                      validan según lo  
                                      mostrado por el   
                                      entorno.          

  CHK-01            Checkout con      Se puede          P1
                    datos de          completar el paso 
                    facturación       de facturación    
                    válidos           con los datos de  
                                      prueba.           

  CHK-02            Selección de      El paso permite   P1
                    método de envío   seleccionar una   
                    disponible        opción mostrada   
                                      por la aplicación 
                                      y avanzar.        

  CHK-03            Selección de      Se puede          P1
                    método de pago    seleccionar un    
                    disponible        método seguro de  
                                      prueba/no         
                                      transaccional y   
                                      avanzar.          

  CHK-04            Revisión antes de El resumen        P1
                    confirmar         refleja los       
                                      productos,        
                                      cantidades y      
                                      total que se van  
                                      a ordenar.        

  CHK-05            Confirmación de   El sistema        P1
                    compra            confirma la orden 
                                      y muestra un      
                                      identificador o   
                                      mensaje           
                                      verificable.      

  CHK-06            Corregir datos    Tras un error de  P2
                    inválidos en      validación, se    
                    checkout          pueden corregir   
                                      los campos y      
                                      continuar sin     
                                      duplicar el       
                                      pedido.           
  -----------------------------------------------------------------------

### 8.1 Qué no se agrega a esta regresión

No se incorporan en esta versión casos independientes para Remember me,
fusión de carrito invitado/usuario, persistencia entre sesiones,
expiración de sesión, cantidades extremas, concurrencia, contratos HTTP,
escaneo de seguridad, rendimiento o accesibilidad. Podrán considerarse
en una iteración posterior si el tiempo, los resultados exploratorios o
nuevos requisitos lo justifican.

## 9. Criterios de aceptación del flujo E2E de compra

El flujo de compra se considera aprobado únicamente si se cumplen todos
los criterios aplicables:

1.  El producto seleccionado se agrega al carrito y conserva la cantidad
    esperada.
2.  El carrito muestra los productos y cantidades que se pretenden
    comprar.
3.  El usuario puede avanzar por los pasos obligatorios de checkout.
4.  Los datos requeridos se aceptan cuando son válidos y se rechazan
    cuando son inválidos.
5.  Se puede seleccionar un método de envío y un método de pago
    disponible en el entorno.
6.  El resumen previo a la confirmación es coherente con los productos,
    cantidades y total mostrado por la aplicación.
7.  La confirmación final indica que la orden fue creada y, cuando el
    sistema lo ofrece, presenta un número o identificador de orden.
8.  No se utilizan datos reales de pago ni se realiza una transacción
    financiera real.

Si el entorno no permite finalizar una compra de forma segura, registrar
el caso como **Blocked --- configuración del entorno**, adjuntando el
paso exacto y la evidencia. El flujo sigue formando parte del alcance y
no se declara cubierto hasta ejecutarse correctamente.

## 10. Matriz de cobertura ejecutable

Esta matriz es la fuente de trazabilidad para implementar, ejecutar y
reportar. El estado inicial de todos los casos es `Pending`; se
actualizará a `Pass`, `Fail`, `Blocked` o `Not Run` en cada ciclo. Los
IDs se usarán como etiquetas en los tests de Playwright y en el reporte.

  --------------------------------------------------------------------------------------------------------
  ID        Área          Riesgo /       Suite          Prioridad   Tipo           Estado    Automatizar
                          objetivo                                                 inicial   
  --------- ------------- -------------- -------------- ----------- -------------- --------- -------------
  S-01      Registro      Crear cuenta   Smoke          P1          UI E2E         Pending   Sí
                          válida                                                             

  S-02      Login         Autenticar     Smoke          P1          UI funcional   Pending   Sí
                          válidamente y                                                      
                          rechazar                                                           
                          credenciales                                                       
                          inválidas                                                          

  S-03      Búsqueda      Encontrar y    Smoke          P1          UI E2E         Pending   Sí
                          seleccionar                                                        
                          producto                                                           

  S-04      Carrito       Agregar        Smoke          P1          UI E2E         Pending   Sí
                          producto                                                           
                          simple                                                             

  S-05      Carrito       Actualizar     Smoke          P1          UI funcional   Pending   Sí
                          cantidad y                                                         
                          eliminar                                                           
                          producto                                                           

  S-06      Registro      Rechazar       Smoke          P1          UI negativa    Pending   Sí
                          campos                                                             
                          requeridos                                                         
                          incompletos o                                                      
                          contraseñas                                                        
                          distintas                                                          

  S-07      Checkout      Completar      Smoke          P1          UI E2E         Pending   Sí
                          compra E2E                                                         

  S-08      Checkout      Rechazar dato  Smoke          P1          UI negativa    Pending   Sí
                          obligatorio                                                        
                          inválido                                                           

  REG-01    Registro      Rechazar email Regression     P1          UI negativa    Pending   Sí
                          duplicado                                                          

  REG-02    Registro      Rechazar email Regression     P1          UI negativa    Pending   Sí
                          con formato                                                        
                          inválido                                                           

  REG-03    Registro      Rechazar       Regression     P1          UI negativa    Pending   Sí
                          campos                                                             
                          obligatorios                                                       
                          incompletos                                                        

  REG-04    Registro      Rechazar       Regression     P1          UI negativa    Pending   Sí
                          contraseñas no                                                     
                          coincidentes                                                       

  LOG-01    Login         Rechazar       Regression     P1          UI negativa    Pending   Sí
                          usuario                                                            
                          inexistente                                                        

  LOG-02    Login         Cerrar sesión  Regression     P2          UI funcional   Pending   Sí

  SRCH-01   Búsqueda      Mostrar estado Regression     P2          UI funcional   Pending   Sí
                          sin resultados                                                     

  SRCH-02   Búsqueda      Abrir el       Regression     P1          UI E2E         Pending   Sí
                          producto                                                           
                          correcto desde                                                     
                          resultados                                                         

  CART-01   Carrito       Agregar dos    Regression     P1          UI funcional   Pending   Sí
                          productos                                                          
                          diferentes                                                         

  CART-02   Carrito       Recalcular     Regression     P1          UI funcional   Pending   Sí
                          cantidad y                                                         
                          subtotal                                                           

  CART-03   Carrito       Eliminar solo  Regression     P1          UI funcional   Pending   Sí
                          el producto                                                        
                          seleccionado                                                       

  CART-04   Carrito       Mostrar        Regression     P2          UI funcional   Pending   Sí
                          carrito vacío                                                      

  CART-05   Carrito       Validar        Regression     P1          UI funcional   Pending   Sí
                          consistencia                                                       
                          de totales                                                         

  CHK-01    Checkout      Completar      Regression     P1          UI E2E         Pending   Sí
                          facturación                                                        

  CHK-02    Checkout      Seleccionar    Regression     P1          UI E2E         Pending   Sí
                          envío                                                              
                          disponible                                                         

  CHK-03    Checkout      Seleccionar    Regression     P1          UI E2E         Pending   Sí
                          pago seguro                                                        
                          disponible                                                         

  CHK-04    Checkout      Verificar      Regression     P1          UI funcional   Pending   Sí
                          resumen antes                                                      
                          de confirmar                                                       

  CHK-05    Checkout      Confirmar      Regression     P1          UI E2E         Pending   Sí
                          orden                                                              

  CHK-06    Checkout      Corregir       Regression     P2          UI negativa    Pending   Sí
                          validación sin                                                     
                          duplicar                                                           
                          pedido                                                             

  EXP-01    Transversal   Investigar si  Exploratoria   P3          Exploratoria   Not Run   No
                          Downloadable                              manual                   obligatoria
                          Products                                                           
                          afecta otras                                                       
                          operaciones de                                                     
                          sesión                                                             
  --------------------------------------------------------------------------------------------------------

### 10.1 Reglas de actualización de la matriz

-   **Pass:** se ejecutó y cumplió el criterio de aceptación.
-   **Fail:** se ejecutó y el resultado contradice una expectativa
    suficientemente sustentada.
-   **Blocked:** no pudo ejecutarse por entorno, datos, configuración o
    falta de una precondición.
-   **Not Run:** no se ejecutó en el ciclo.
-   Los resultados basados en hipótesis deben indicar `[HIP]` en la
    evidencia o reporte.
-   Un caso bloqueado no se cuenta como aprobado.
-   La cobertura se informará por separado: casos ejecutados, casos
    aprobados, fallidos, bloqueados y no ejecutados.

## 11. Criterios de entrada, salida e interrupción

### 11.1 Entrada

-   La Home y las páginas principales están accesibles.
-   Hay al menos un producto disponible para agregar al carrito.
-   Se confirmó un camino seguro para el checkout, o se documentó de
    antemano que el flujo de compra puede quedar bloqueado por
    configuración.
-   Los datos de prueba están preparados y no incluyen información
    personal real.
-   Los casos Smoke y sus criterios de aceptación están revisados.

### 11.2 Salida

-   Se ejecutaron todos los casos Smoke posibles y cada excepción está
    documentada.
-   Los casos P1 de regresión se ejecutaron o tienen un motivo explícito
    de bloqueo/no ejecución.
-   Los defectos y anomalías tienen pasos reproducibles, evidencia,
    impacto y etiqueta de oráculo.
-   La matriz de cobertura está actualizada.
-   Se generó el reporte HTML de Playwright.
-   Las limitaciones por falta de requisitos, cambios del entorno o
    configuración del checkout están explícitas.

No se fija un porcentaje arbitrario de aprobación para declarar calidad
del producto. Para este challenge, el cierre debe basarse en el estado
de los flujos P1, la evidencia y los riesgos pendientes. Cualquier
criterio cuantitativo adicional debe justificarse y registrarse.

### 11.3 Interrupción y reanudación

  -----------------------------------------------------------------------
  Interrumpir o pausar si...          Reanudar cuando...
  ----------------------------------- -----------------------------------
  El sitio está indisponible o falla  Las páginas principales vuelven a
  de forma generalizada               responder de forma estable

  No hay un producto disponible para  Se identifica un producto comprable
  el flujo de carrito/compra          

  El checkout exige datos de pago     Se confirma un método de prueba/no
  reales o una operación no           transaccional seguro
  autorizada                          

  Un defecto bloquea registro, login, Se dispone de una corrección,
  carrito o checkout                  alternativa aprobada o se documenta
                                      el bloqueo

  Los datos del entorno cambiaron y   Se actualizan las precondiciones y
  los resultados dejaron de ser       los datos de prueba
  confiables                          
  -----------------------------------------------------------------------

## 12. Gestión de defectos y hallazgos

Cada hallazgo debe incluir:

-   ID y título descriptivo.
-   Caso de prueba y pasos para reproducir.
-   Resultado esperado y resultado actual.
-   Evidencia: captura, trace de Playwright y/o vídeo si aporta valor.
-   Navegador, fecha de ejecución y datos no sensibles utilizados.
-   Impacto funcional y severidad propuesta.
-   Etiqueta de oráculo: `[OBS]`, `[HIP]` o `[REQ?]`.
-   Estado: defecto confirmado, anomalía observada, posible defecto o
    bloqueo de entorno.

No se marcará una anomalía como "defecto conocido aceptado" sin una
decisión explícita del responsable del ejercicio. Cuando no exista una
regla verificable, se expondrá la incertidumbre en lugar de atribuir una
expectativa de negocio no documentada.

## 13. Plan de ejecución recomendado

  -----------------------------------------------------------------------
  Fase                    Actividad               Entregable / condición
                                                  para avanzar
  ----------------------- ----------------------- -----------------------
  A                       Preflight y exploración Datos y productos
                          breve de registro,      identificados; pasos
                          login, búsqueda,        reales de checkout
                          carrito y checkout      documentados; riesgos
                                                  de entorno anotados

  B                       Automatizar y ejecutar  Los flujos críticos
                          Smoke                   tienen resultados
                                                  reproducibles; los
                                                  bloqueos están
                                                  clasificados

  C                       Automatizar y ejecutar  Matriz actualizada;
                          Regression funcional    variantes principales
                                                  cubiertas

  D                       Investigación           Hallazgos transversales
                          exploratoria acotada    priorizados, incluido
                                                  Downloadable Products
                                                  si hay indicios

  E                       Cierre                  Reporte Playwright,
                                                  defectos y anomalías,
                                                  cobertura ejecutada y
                                                  riesgos pendientes
  -----------------------------------------------------------------------

### 13.1 Prioridad de implementación

1.  Smoke de registro, login, búsqueda, carrito y compra E2E.
2.  Regresión funcional de validaciones principales, operaciones del
    carrito y pasos de checkout.
3.  Estabilización de selectores, datos y limpieza entre tests.
4.  Exploración de riesgos residuales solo después de tener los flujos
    P1 funcionando.

## 14. Limitaciones conocidas

-   No hay PO ni requisitos funcionales formales; varias expectativas
    son hipótesis de QA.
-   La demo es pública y compartida, por lo que puede cambiar sin aviso.
-   No se asume acceso a base de datos, administración ni mecanismos de
    reset.
-   La disponibilidad de envío, pago y confirmación de compra debe
    verificarse durante el preflight.
-   Este plan prioriza el valor funcional del challenge. Seguridad
    especializada, rendimiento, accesibilidad y pruebas de contrato
    quedan fuera de las suites obligatorias de esta versión.

------------------------------------------------------------------------

**Resultado esperado del plan:** una suite pequeña y confiable de Smoke,
una regresión funcional trazable y un flujo de compra E2E explícito, con
incertidumbres y bloqueos documentados en lugar de ocultarlos mediante
supuestos.
