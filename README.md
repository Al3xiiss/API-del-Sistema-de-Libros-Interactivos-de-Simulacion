# API-del-Sistema-de-Libros-Interactivos-de-Simulación

## Requerimientos Funcionales (RF)

| ID | Nombre | Descripción | Actor/Rol | Precondiciones | Flujo Principal | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Gestión de Libros | Permite agregar, editar o eliminar libros interactivos. | Administrador | Estar autenticado en el panel admin. | 1. Accede a "Gestión".<br>2. Selecciona crear/editar.<br>3. Ingresa título y guarda. | El catálogo se actualiza en la base de datos. |
| **RF-02** | Navegación de Capítulos | Permite acceder y leer el contenido estructurado de un libro. | Usuario/Paciente | Tener un libro seleccionado. | 1. Abre el libro.<br>2. Selecciona un capítulo desbloqueado.<br>3. Navega el texto. | El contenido del capítulo se despliega en pantalla. |
| **RF-03** | Ejecución de Simulación | Activa el entorno narrativo donde ocurre la interacción. | Usuario/Paciente | Llegar al punto de simulación en el capítulo. | 1. Presiona "Iniciar Simulación".<br>2. El sistema carga el contexto y personajes. | La interfaz cambia al modo de simulación interactiva. |
| **RF-04** | Toma de Decisiones | Registra la elección del usuario ante un escenario narrativo. | Usuario/Paciente | Simulación activa con opciones en pantalla. | 1. Lee las opciones.<br>2. Selecciona una alternativa.<br>3. El sistema evalúa la elección. | La narrativa avanza según la variable booleana o camino elegido. |
| **RF-05** | Reproducción Multimedia | Permite visualizar videos o escuchar audios complementarios. | Usuario/Paciente | Estar en una vista con recursos asociados. | 1. Presiona el recurso.<br>2. El reproductor carga y reproduce el medio. | El medio se reproduce sin interrumpir el progreso actual. |
| **RF-06** | Consulta de Progreso | Muestra el porcentaje de avance y capítulos completados. | Usuario/Paciente | Tener interacción previa con al menos un libro. | 1. Accede a "Mi Progreso".<br>2. El sistema calcula el avance total. | Se visualiza una barra de progreso y estadísticas. |
| **RF-07** | Gestión de Personajes | Permite vincular perfiles de personajes a las simulaciones. | Administrador | Estar autenticado en el panel admin. | 1. Accede a "Personajes".<br>2. Define atributos y asocia a un capítulo. | El personaje queda disponible para renderizarse en las simulaciones. |


## Requerimientos No Funcionales (RNF)

| ID | Categoría | Requisito Medible | Estrategia de Validación |
| :--- | :--- | :--- | :--- |
| **RNF-01** | Rendimiento | La API REST responderá solicitudes en menos de 200 ms e Ionic renderizará vistas en menos de 1.5 segundos. | Pruebas de carga y auditorías con Lighthouse. |
| **RNF-02** | Seguridad | Uso de JWT para sesiones y contraseñas hasheadas con bcrypt. | Análisis de tokens y verificación de base de datos. |
| **RNF-03** | Usabilidad | Acceso al último capítulo leído en un máximo de 3 clics desde el inicio. | Pruebas de usabilidad con métrica de clics. |
| **RNF-04** | Accesibilidad | Contraste de colores WCAG AA (mínimo 4.5:1) y soporte para escalar texto al 200%. | Herramientas automatizadas como aXe o WAVE. |
| **RNF-05** | Compatibilidad | Ejecución web (Chrome v100+) y adaptación móvil (Android 10+, iOS 14+) vía Capacitor. | Despliegue y validación en emuladores. |


## Matriz de Roles y Permisos

| Funcionalidad | Usuario / Paciente | Administrador |
| :--- | :--- | :--- |
| **RF-01: Gestión de Libros** | Sin acceso | Acceso total (CRUD) |
| **RF-02: Navegación de Capítulos** | Acceso total (Lectura) | Acceso total (Revisión) |
| **RF-03: Ejecución de Simulación** | Acceso total | Acceso de prueba |
| **RF-04: Toma de Decisiones** | Acceso total | Sin acceso |
| **RF-05: Reproducción Multimedia** | Acceso total | Acceso total |
| **RF-06: Consulta de Progreso** | Solo métricas propias | Estadísticas globales |
| **RF-07: Gestión de Personajes** | Sin acceso | Acceso total (CRUD) |
