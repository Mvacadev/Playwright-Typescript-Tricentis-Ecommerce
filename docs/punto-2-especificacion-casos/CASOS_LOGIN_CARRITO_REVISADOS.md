# Casos de prueba revisados --- Login y carrito

**Aplicación:** Tricentis Demo Web Shop\
**URL:** https://demowebshop.tricentis.com/\
**Versión:** 2.0 --- 11/10/2026\
**Base de revisión:** `ESPECIFICACION_CASOS_LOGIN_CARRITO (1).md`,
`REVISION_CASOS_LOGIN_CARRITO_QA_LEAD.md` y `TEST_PLAN_v2.md`.

## 1. Convenciones de ejecución

-   **Estado inicial:** `Pending`. No implica que el caso haya sido
    ejecutado en esta versión.
-   **\[OBS\]:** comportamiento observado en el sitio durante el
    preflight del 11/10/2026. Es evidencia del comportamiento actual, no
    necesariamente una regla de negocio aprobada.
-   **\[ARIT\]:** resultado derivado de una regla aritmética verificable
    con los valores capturados durante la ejecución.
-   **\[REQ?\]:** criterio pendiente de decisión de negocio; no se usa
    como condición de aprobación hasta confirmarlo.
-   Los casos son independientes: cada uno prepara sus propios datos y
    no depende del resultado de otro caso.
-   No registrar contraseñas en capturas, trazas ni reportes.
-   No fijar precios de productos como constantes. Capturar el precio
    mostrado al ejecutar el caso.
-   Para cada ejecución registrar: ambiente/build, fecha y hora,
    navegador/versión, datos de prueba identificados sin secretos,
    resultado real, estado (`Passed`, `Failed`, `Blocked`), evidencia y
    defecto asociado si corresponde.
-   Si no puede provisionarse una cuenta o un producto comprable, marcar
    `Blocked`; no adaptar silenciosamente el criterio.

### Datos y aislamiento comunes

-   Cuenta registrada y activa: `${TEST_USER_EMAIL}` /
    `${TEST_USER_PASSWORD}`, obtenidas de configuración segura.
-   Contraseña deliberadamente incorrecta: `${INVALID_TEST_PASSWORD}`;
    debe ser no vacía y distinta de la válida.
-   Email inexistente: generar un valor único de ejecución, por ejemplo
    `qa+<run-id>@example.invalid`, sin colisionar con cuentas reales.
-   Carrito: limpiar o crear un contexto aislado antes de cada caso. No
    asumir que un caso previo dejó un estado determinado.
-   Producto comprable: confirmar que el botón **Add to cart** esté
    visible y habilitado. La etiqueta "In stock" por sí sola no alcanza.
-   Precios y totales: registrar los importes mostrados durante la
    ejecución. El texto `Calculated during checkout` para Shipping/Total
    se documenta como estado observado y no se convierte a número.

------------------------------------------------------------------------

## 2. Casos de Login

### TC-LOG-01 --- Login exitoso y cierre de sesión

  -----------------------------------------------------------------------
  Campo                               Valor
  ----------------------------------- -----------------------------------
  Suite / prioridad                   Smoke · P1

  Objetivo                            Verificar autenticación con una
                                      cuenta válida, acceso a Mi cuenta y
                                      cierre de sesión.

  Precondiciones                      Existe una cuenta de prueba activa;
                                      se conocen sus credenciales; el
                                      contexto del navegador no tiene
                                      sesión autenticada.

  Datos                               `${TEST_USER_EMAIL}`,
                                      `${TEST_USER_PASSWORD}`.
                                      `Remember me` desmarcado.

  Estado                              Pending
  -----------------------------------------------------------------------

**Pasos y resultados esperados**

  -------------------------------------------------------------------------
  \#                Acción              Resultado         Oráculo
                                        esperado          
  ----------------- ------------------- ----------------- -----------------
  1                 Abrir `/login`.     Se muestra el     \[OBS\]
                                        formulario de     
                                        login con Email,  
                                        Password y botón  
                                        `Log in`.         

  2                 Ingresar            La autenticación  \[OBS\]
                    credenciales        se completa sin   
                    válidas y enviar el mensaje de error. 
                    formulario.                           

  3                 Verificar el        Se muestra el     \[OBS\]
                    header.             email de la       
                                        cuenta y          
                                        `Log out`; no se  
                                        muestran los      
                                        enlaces de        
                                        invitado          
                                        `Register` y      
                                        `Log in`.         

  4                 Abrir               Se accede a Mi    \[OBS\]
                    `/customer/info`.   cuenta sin        
                                        redirección al    
                                        login.            

  5                 Hacer clic en       La aplicación     \[OBS\]
                    `Log out`.          vuelve al estado  
                                        de invitado y el  
                                        header ofrece     
                                        `Register` y      
                                        `Log in`.         

  6                 Abrir               Se solicita       \[OBS\]
                    `/customer/info`    autenticación o   
                    sin sesión.         se redirige a     
                                        `/login`.         
  -------------------------------------------------------------------------

**Postcondición / limpieza:** sesión cerrada. No modificar los datos de
perfil.

**Fuera de este caso:** destino exacto después del login, botón Back,
rutas privadas adicionales, `Remember me`, fusión/persistencia del
carrito, login desde checkout y acceso a `/login` estando ya
autenticado. Ver backlog exploratorio.

### TC-LOG-02 --- Login rechazado con contraseña incorrecta

  -----------------------------------------------------------------------
  Campo                               Valor
  ----------------------------------- -----------------------------------
  Suite / prioridad                   Smoke · P1

  Objetivo                            Verificar que una contraseña
                                      incorrecta no autentique al
                                      usuario.

  Precondiciones                      La cuenta existe, está activa y sus
                                      credenciales válidas fueron
                                      verificadas por separado; contexto
                                      sin sesión.

  Datos                               `${TEST_USER_EMAIL}` y
                                      `${INVALID_TEST_PASSWORD}`. La
                                      contraseña incorrecta debe ser no
                                      vacía y diferente de la válida.

  Estado                              Pending
  -----------------------------------------------------------------------

**Pasos y resultados esperados**

  -----------------------------------------------------------------------
  \#                Acción            Resultado         Oráculo
                                      esperado          
  ----------------- ----------------- ----------------- -----------------
  1                 Abrir `/login`.   Se muestra el     \[OBS\]
                                      formulario de     
                                      login.            

  2                 Ingresar el email La autenticación  Rechazo funcional
                    registrado y una  es rechazada y el esperado;
                    contraseña        usuario permanece confirmar
                    incorrecta no     sin sesión        mediante
                    vacía; enviar.    autenticada.      ejecución formal

  3                 Verificar el      Continúa el       \[OBS\]
                    header.           estado de         
                                      invitado; no      
                                      aparece el email  
                                      de la cuenta como 
                                      usuario           
                                      autenticado.      

  4                 Registrar el      Se muestra        \[OBS\]
                    mensaje visible y feedback de login 
                    la URL final.     fallido.          
                                      Conservar el      
                                      texto exacto como 
                                      evidencia, no     
                                      como requisito de 
                                      seguridad         
                                      aprobado.         
  -----------------------------------------------------------------------

**Postcondición / limpieza:** no hay sesión autenticada.

**Nota de criterio:** se observó el mensaje
`The credentials provided are incorrect`, pero la contraseña incorrecta
no vacía debe confirmarse en una ejecución formal. Que el mensaje sea
genérico e idéntico al de un email inexistente es una decisión pendiente
y no bloquea este caso funcional.

**Fuera de este caso:** reintento con contraseña correcta, intentos
repetidos, bloqueo, rate limiting y comparación de tiempos.

### TC-LOG-03A --- Login rechazado con email inexistente

  -----------------------------------------------------------------------
  Campo                               Valor
  ----------------------------------- -----------------------------------
  Suite / prioridad                   Regression · P2

  Objetivo                            Verificar que un email inexistente
                                      no permita autenticarse.

  Precondiciones                      Contexto sin sesión; el dato
                                      generado no corresponde a una
                                      cuenta existente.

  Datos                               Email único de ejecución, por
                                      ejemplo
                                      `qa+<run-id>@example.invalid`;
                                      contraseña no vacía.

  Estado                              Pending
  -----------------------------------------------------------------------

**Pasos y resultados esperados**

  -----------------------------------------------------------------------
  \#                Acción            Resultado         Oráculo
                                      esperado          
  ----------------- ----------------- ----------------- -----------------
  1                 Abrir `/login`,   No se autentica y Comportamiento
                    ingresar el email permanece en el   funcional
                    inexistente y una flujo de login.   esperado
                    contraseña no                       
                    vacía; enviar.                      

  2                 Verificar el      Continúa como     \[OBS\]
                    header.           invitado.         

  3                 Registrar el      Se muestra        \[OBS\]
                    mensaje y la URL  feedback de       
                    final.            error; guardar el 
                                      texto exacto como 
                                      evidencia.        
  -----------------------------------------------------------------------

**Postcondición / limpieza:** no hay sesión autenticada.

**Nota de criterio:** se observó `No customer account found`. La
diferencia de mensajes entre email inexistente y contraseña incorrecta
queda en el backlog como riesgo por validar con la persona responsable
del producto; no es criterio de aprobación de este caso.

### TC-LOG-03B --- Login rechazado con email de formato inválido

  -----------------------------------------------------------------------
  Campo                               Valor
  ----------------------------------- -----------------------------------
  Suite / prioridad                   Regression · P2

  Objetivo                            Verificar que un email de formato
                                      inválido no permita autenticarse ni
                                      genere un error no controlado.

  Precondiciones                      Contexto sin sesión.

  Datos                               Email `abc`; contraseña no vacía.

  Estado                              Pending
  -----------------------------------------------------------------------

**Pasos y resultados esperados**

  -----------------------------------------------------------------------
  \#                Acción            Resultado         Oráculo
                                      esperado          
  ----------------- ----------------- ----------------- -----------------
  1                 Abrir `/login`,   No se autentica y Comportamiento
                    ingresar `abc`    se presenta       funcional
                    como email y una  feedback de       esperado; validar
                    contraseña no     error.            formalmente
                    vacía; enviar.                      

  2                 Verificar el      Sigue como        \[OBS\] para el
                    estado final.     invitado y no     estado de
                                      aparece una       invitado; error
                                      página de error   controlado como
                                      no controlada.    criterio
                                                        funcional
  -----------------------------------------------------------------------

**Postcondición / limpieza:** no hay sesión autenticada.

**Fuera de la suite mínima:** ambos campos vacíos, email registrado con
espacios y otras cadenas límite; ver backlog exploratorio.

------------------------------------------------------------------------

## 3. Casos de carrito

### TC-CART-01 --- Agregar dos productos distintos al carrito

  -----------------------------------------------------------------------
  Campo                               Valor
  ----------------------------------- -----------------------------------
  Suite / prioridad                   Smoke · P1

  Objetivo                            Verificar que dos productos
                                      comprables se agreguen y se
                                      reflejen en la página del carrito.

  Precondiciones                      Carrito limpio; dos productos
                                      distintos con botón `Add to cart`
                                      visible y habilitado.

  Datos                               Seleccionar productos comprables en
                                      tiempo de ejecución. Capturar
                                      nombre, precio unitario y moneda
                                      mostrados. No depender de IDs o
                                      precios fijos.

  Estado                              Pending
  -----------------------------------------------------------------------

**Pasos y resultados esperados**

  ------------------------------------------------------------------------
  \#                Acción            Resultado esperado Oráculo
  ----------------- ----------------- ------------------ -----------------
  1                 En un producto    Se muestra         \[OBS\]
                    comprable,        confirmación de    
                    registrar         agregado o una     
                    nombre/precio y   señal observable   
                    hacer clic en     equivalente; el    
                    `Add to cart`.    carrito incorpora  
                                      el producto.       

  2                 Repetir con un    El segundo         \[OBS\]
                    segundo producto  producto se        
                    distinto y        incorpora al       
                    registrar         carrito.           
                    nombre/precio.                       

  3                 Abrir `/cart`.    Se muestran dos    \[OBS\]
                                      líneas             
                                      correspondientes a 
                                      los productos      
                                      agregados, cada    
                                      una con cantidad   
                                      1.                 

  4                 Verificar totales Cada total de      \[ARIT\]
                    de línea y        línea coincide con 
                    Sub-Total.        precio unitario    
                                      capturado ×        
                                      cantidad;          
                                      Sub-Total coincide 
                                      con la suma de las 
                                      líneas.            

  5                 Verificar el      El contador        \[OBS\]
                    contador del      coincide con la    
                    header.           suma de cantidades 
                                      (2 en esta         
                                      preparación).      
  ------------------------------------------------------------------------

**Postcondición / limpieza:** limpiar el carrito o descartar el contexto
de prueba. El caso no depende de que el carrito quede preparado para
otro caso.

**Notas:** la confirmación visual puede ocultarse automáticamente; no
usarla como única evidencia. No verificar orden de las líneas ni orden
del flyout. `In stock` no garantiza que exista botón para agregar.

### TC-CART-02 --- Actualizar cantidad y recalcular el carrito

  -----------------------------------------------------------------------
  Campo                               Valor
  ----------------------------------- -----------------------------------
  Suite / prioridad                   Regression · P1

  Objetivo                            Verificar que una actualización
                                      válida de cantidad se aplique al
                                      confirmar el carrito y recalcule
                                      los importes.

  Precondiciones                      Carrito aislado con un producto
                                      comprable y cantidad 1.

  Datos                               Producto seleccionado
                                      dinámicamente; precio unitario
                                      capturado durante la ejecución.

  Estado                              Pending
  -----------------------------------------------------------------------

**Pasos y resultados esperados**

  ---------------------------------------------------------------------------------------------
  \#                Acción                    Resultado esperado              Oráculo
  ----------------- ------------------------- ------------------------------- -----------------
  1                 Abrir `/cart` y confirmar La línea del producto está      \[OBS\]
                    que el producto está en   presente con cantidad 1.        
                    cantidad 1.                                               

  2                 Cambiar la cantidad a 2 y La cantidad se actualiza a 2.   \[OBS\]
                    pulsar                                                    
                    `Update shopping cart`.                                   

  3                 Verificar el total de la  Total de línea = precio         \[ARIT\]
                    línea.                    unitario capturado × 2.         

  4                 Verificar el Sub-Total    Sub-Total = suma de los totales \[ARIT\]
                    del carrito.              de línea.                       

  5                 Verificar Shipping y      Si se muestran importes         \[OBS\]
                    Total.                    numéricos, registrar y          
                                              comprobar su consistencia con   
                                              los componentes visibles. Si    
                                              aparece                         
                                              `Calculated during checkout`,   
                                              registrar el texto sin forzar   
                                              una conversión numérica.        

  6                 Verificar el contador del El contador refleja la suma de  \[OBS\]
                    header.                   cantidades del carrito (2 para  
                                              esta preparación).              
  ---------------------------------------------------------------------------------------------

**Postcondición / limpieza:** limpiar el carrito o descartar el
contexto.

**Fuera de este caso:** cantidad 0, negativa, no numérica, vacía,
decimal, límite máximo, actualización de varias líneas y regla de
eliminación por cantidad inválida. Ver backlog exploratorio.

### TC-CART-03 --- Eliminar productos y comprobar el estado de carrito vacío

  -----------------------------------------------------------------------
  Campo                               Valor
  ----------------------------------- -----------------------------------
  Suite / prioridad                   Regression · P1

  Objetivo                            Verificar la eliminación de una
                                      línea y el estado observable del
                                      carrito vacío.

  Precondiciones                      Carrito aislado con dos productos
                                      distintos, comprables y cantidades
                                      conocidas (1 cada uno).

  Datos                               Dos productos seleccionados
                                      dinámicamente; precios capturados
                                      durante la ejecución.

  Estado                              Pending
  -----------------------------------------------------------------------

**Pasos y resultados esperados**

  -------------------------------------------------------------------------------
  \#                Acción                    Resultado         Oráculo
                                              esperado          
  ----------------- ------------------------- ----------------- -----------------
  1                 Abrir `/cart` y verificar Ambas líneas      \[OBS\]
                    las dos líneas.           están presentes   
                                              con sus           
                                              cantidades        
                                              esperadas.        

  2                 Marcar `Remove` para uno  Desaparece la     \[OBS\]
                    de los productos y pulsar línea             
                    `Update shopping cart`.   seleccionada; el  
                                              otro producto     
                                              permanece con su  
                                              cantidad.         

  3                 Verificar Sub-Total y     Sub-Total         \[ARIT\] +
                    contador.                 corresponde a las \[OBS\]
                                              líneas restantes; 
                                              el contador       
                                              coincide con la   
                                              suma de           
                                              cantidades        
                                              restantes.        

  4                 Marcar `Remove` para el   No quedan líneas  \[OBS\]
                    último producto y pulsar  y aparece el      
                    `Update shopping cart`.   mensaje de        
                                              carrito vacío.    

  5                 Verificar el contador del El contador es 0. \[OBS\]
                    header.                                     
  -------------------------------------------------------------------------------

**Postcondición / limpieza:** carrito vacío.

**Fuera de este caso:** navegar a `/checkout` con carrito vacío, botón
Back, cambiar cantidad y eliminar en un mismo envío, persistencia tras
logout/login y validación directa de endpoints. Ver backlog
exploratorio.

------------------------------------------------------------------------

## 4. Cobertura pendiente frente al plan general

Este documento revisa únicamente los casos de login y carrito que venían
en la especificación de origen. No reemplaza `TEST_PLAN_v2.md`.

-   **Registro:** faltan casos ejecutables específicos en esta entrega;
    deben mantenerse en el plan general y elaborarse como casos aparte.
-   **Checkout E2E:** no está cubierto por los seis casos de este
    documento. Debe existir un caso separado que recorra la compra
    completa con datos válidos, según `TEST_PLAN_v2.md`.
-   **Ejecución real:** todos los casos de este documento quedan
    `Pending` hasta ejecutarse y guardar evidencia.
