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

## Problema y Justificación (EP 1.2)

### 1. Problema
El tratamiento oncológico impone una carga emocional y psicológica severa. Los pacientes suelen enfrentarse a un exceso de información médica fragmentada (folletos estáticos, videos dispersos) que carece de un seguimiento empático y estructurado.

* **Evidencia encontrada en fuentes:** La Organización Mundial de la Salud (OMS) y la Organización Panamericana de la Salud (OPS) destacan que el apoyo psicosocial continuo es un componente crítico para mejorar la calidad de vida y la adherencia al tratamiento en pacientes con cáncer.
* **Supuesto del equipo:** Asumimos que los pacientes experimentan una alta "fatiga cognitiva" al intentar buscar y procesar consejos de autocuidado en múltiples plataformas, lo que genera frustración y aislamiento.

La falta de una plataforma centralizada que ofrezca experiencias narrativas interactivas provoca que el paciente se enfrente a su proceso en soledad, sin un espacio seguro donde proyectar sus decisiones y ver reflejadas sus inquietudes.

### 2. Justificación
Un sistema de libros interactivos aporta valor al transformar la lectura pasiva en una experiencia inmersiva. A través de simulaciones y toma de decisiones, el paciente puede explorar escenarios emocionales y cotidianos en un entorno seguro y validante. 
**Aviso explícito:** Esta plataforma se justifica exclusivamente como una herramienta digital de educación y contención emocional. No es, bajo ninguna circunstancia, un sistema de diagnóstico, pronóstico o tratamiento médico.

### 3. Caracterización de Usuarios Objetivo

**Usuario / Paciente**
* **Características:** Adultos en diversas etapas del tratamiento oncológico o en fase de remisión.
* **Contexto de uso:** Habitaciones de hospital durante quimioterapia/radioterapia, salas de espera, o en reposo domiciliario.
* **Necesidades:** Consumir contenido que reduzca la ansiedad, ofrezca estrategias de afrontamiento y permita el registro de su progreso emocional.
* **Privacidad:** Requieren máxima confidencialidad sobre su identidad y progreso (datos sensibles de salud).

**Administrador / Editor de Contenido**
* **Características:** Psicooncólogos, educadores de salud o personal de fundaciones.
* **Contexto de uso:** Oficinas clínicas o modalidad teletrabajo, principalmente desde computadoras de escritorio.
* **Necesidades:** Crear y gestionar ramificaciones narrativas, subir recursos multimedia y estructurar capítulos sin depender de personal de TI.


## Proto-personas

*Nota: Estos perfiles son caracterizaciones preliminares construidas a partir de fuentes secundarias y supuestos razonados del equipo, no de entrevistas a usuarios reales.*

| Campo | Proto-persona 1: Usuario/Paciente | Proto-persona 2: Administrador/Editor |
| :--- | :--- | :--- |
| **Nombre y rol** | Elena Rojas (Paciente) | Martín Vargas (Admin / Psicooncólogo) |
| **Características** | 45 años. Profesora con licencia médica. Actualmente recibiendo quimioterapia intravenosa semanal. | 38 años. Psicólogo en una fundación oncológica. Acostumbrado a redactar material de apoyo. |
| **Necesidades** | Sentirse comprendida sin leer densa jerga médica. Necesita distracciones constructivas durante sus terapias. | Centralizar sus guías de apoyo en una herramienta interactiva para que sus pacientes participen activamente. |
| **Objetivos de uso** | Leer historias de personajes que atraviesan situaciones similares y tomar decisiones para ver distintos desenlaces. | Crear un libro con simulaciones y asociar audios de relajación a capítulos específicos. |
| **Dificultades (Pain points)** | Se agota rápido leyendo pantallas con mucho texto. Le frustran las interfaces con botones pequeños. | Falta de tiempo. Le frustran los sistemas complejos que requieren muchos clics para publicar un texto. |
| **RFs asociados** | RF-02, RF-03, RF-04, RF-05, RF-06 | RF-01, RF-05, RF-07 |
| **Dispositivo/Contexto** | Principalmente Tablet y Móvil. Lo usa recostada en la clínica o en su cama. | Versión Web (computadora de escritorio), en horario de oficina. |
| **Nivel tecnológico** | Básico/Intermedio | Intermedio |


## Criterios de Diseño UI/UX y Pantallas (EP 1.3)

* **Paleta de colores:** Tonos tranquilizadores (violetas suaves, azules serenos, verdes apagados). Contraste estricto WCAG AA (mínimo 4.5:1) para evitar fatiga visual.
* **Tipografía:** Sans-serif limpia (Inter o Roboto). Tamaño mínimo de 16px en móvil y 14px en web para legibilidad óptima.
* **Coherencia e Iconografía:** Uso exclusivo de Ionicons. Sistema de espaciado basado en múltiplos de 8px.

### Descripción de Pantallas para Figma

**1. Inicio de Sesión (/login)**
* **Objetivo:** Autenticación de acceso para Pacientes y Administradores.
* **Componentes:** Logotipo, IonInput (correo, contraseña con toggle), IonButton (ingresar), enlace a registro.
* **Navegación:** Conduce a /home (paciente) o /admin (admin).
* **Versiones:** Móvil (formulario centrado vertical); Web (pantalla dividida, imagen relajante y formulario).
* **Estados y Validaciones:** Carga (IonLoading), Error (mensaje en texto rojo). Obligatoriedad y formato de email.

**2. Registro de Usuario (/register)**
* **Objetivo:** Creación de cuenta para nuevos Pacientes.
* **Componentes:** IonInput (nombre, correo, contraseña, confirmar), IonCheckbox (términos de privacidad obligatorios). 
* **Navegación:** Conduce a /login.
* **Versiones:** Móvil (scroll vertical); Web (formulario tipo tarjeta centrada).
* **Estados y Validaciones:** Indicador de contraseña segura en tiempo real, IonToast de éxito al crear cuenta.

**3. Biblioteca de Libros (/home) - RF-02**
* **Objetivo:** Explorar el catálogo disponible y continuar lecturas (Paciente).
* **Componentes:** IonSearchbar, IonCard (portada, título), IonProgressBar (progreso actual).
* **Navegación:** Conduce a /books/:id.
* **Versiones:** Móvil (lista vertical, IonTabs inferior); Web (grilla de 3-4 columnas, IonMenu lateral).
* **Estados y Validaciones:** Carga (IonSkeletonText), Vacío (ilustración "Sin libros").

**4. Detalle de Libro y Capítulos (/books/:id) - RF-02**
* **Objetivo:** Mostrar sinopsis y lista de capítulos desbloqueados (Paciente).
* **Componentes:** Portada destacada, IonList con IonItem por capítulo, iconos de estado (candado).
* **Navegación:** Conduce a /chapters/:id.
* **Versiones:** Móvil (imagen superior, lista inferior); Web (imagen izquierda, lista interactiva derecha).
* **Estados y Validaciones:** Clic en capítulo bloqueado genera un IonToast preventivo.

**5. Lectura de Capítulo (/chapters/:id) - RF-02**
* **Objetivo:** Desplegar la narrativa textual del capítulo (Paciente).
* **Componentes:** IonContent (texto), IonProgressBar superior, botón "Siguiente" o "Tomar Decisión".
* **Navegación:** Conduce a /decision/:id o /resources.
* **Versiones:** Móvil (fuente 18px, márgenes holgados); Web (texto centrado max 800px de ancho).
* **Estados y Validaciones:** Botón de avance deshabilitado si no se ha hecho scroll total.

**6. Simulación y Decisión (/decision/:id) - RF-03, RF-04**
* **Objetivo:** Momento de interacción donde la historia se ramifica (Paciente).
* **Componentes:** Tarjeta de contexto narrativo, avatares (IonImg), múltiples IonCard como opciones.
* **Navegación:** Conduce al siguiente bloque narrativo.
* **Versiones:** Móvil (opciones apiladas); Web (opciones lado a lado).
* **Estados y Validaciones:** Resaltado claro de la opción seleccionada antes de confirmar.

**7. Recursos Multimedia (/resources) - RF-05**
* **Objetivo:** Visualizar material de apoyo emocional asociado al capítulo (Paciente).
* **Componentes:** Listado de recursos, reproductor incrustado, título y descripción.
* **Navegación:** Botón IonBackButton para volver al capítulo.
* **Versiones:** Móvil (reproductor ancho total); Web (reproductor central, lista lateral).
* **Estados y Validaciones:** Carga en reproductor (IonSpinner), controles nativos de reproducción.

**8. Seguimiento de Progreso (/progress) - RF-06**
* **Objetivo:** Revisar el impacto y avance del tratamiento narrativo (Paciente).
* **Componentes:** Gráficos circulares, contador de capítulos, IonBadge de logros.
* **Navegación:** IonTabs o IonMenu para volver a inicio.
* **Versiones:** Móvil (métricas en scroll vertical); Web (dashboard analítico).
* **Estados y Validaciones:** Estado vacío ("Inicia tu primer libro para ver estadísticas").

**9. Panel de Administración (/admin) - RF-01, RF-07**
* **Objetivo:** CMS para gestionar el contenido global de la plataforma (Administrador).
* **Componentes:** IonGrid con métricas, listas editables, IonFab para agregar registros.
* **Navegación:** Conduce a subrutas de creación y edición (ej. /admin/books/create).
* **Versiones:** Móvil (prioriza estadísticas); Web (tablas de datos densas para edición).
* **Estados y Validaciones:** Diálogos IonAlert obligatorios antes de eliminar cualquier contenido.

## Arquitectura de Navegación y Experiencia de Usuario (EP 1.4)

### 1. Mapa de Rutas del Sistema

**Rutas Públicas**
* `/` — Redirección automática a `/login`
* `/login` — Inicio de sesión
* `/register` — Registro de nuevo usuario

**Rutas Protegidas (Usuario/Paciente)**
* `/home` — Inicio y biblioteca de libros
* `/books` — Listado completo de libros
* `/books/:id` — Detalle del libro y sus capítulos
* `/chapters/:id` — Lectura interactiva del capítulo
* `/simulation/:id` — Entorno de simulación narrativa
* `/decision/:id` — Pantalla de toma de decisiones
* `/characters` — Galería de personajes
* `/resources` — Recursos multimedia de apoyo
* `/progress` — Seguimiento de progreso y estadísticas
* `/profile` — Gestión del perfil de usuario

**Rutas Protegidas (Administrador)**
* `/admin` — Panel principal de administración
* `/admin/books` — Gestión de libros
* `/admin/books/create` — Creación de libro
* `/admin/books/:id/edit` — Edición de libro
* `/admin/chapters` — Gestión de capítulos
* `/admin/simulations` — Gestión de simulaciones
* `/admin/characters` — Gestión de personajes
* `/admin/resources` — Gestión de recursos multimedia
* `/admin/progress` — Estadísticas globales de usuarios
* `/unauthorized` — Pantalla de acceso denegado por rol

### 2. Jerarquía de Vistas y Layouts
La aplicación utiliza un enfoque de componentes contenedores (Layouts) para encapsular la navegación, permitiendo que las vistas hoja (leaf pages) se rendericen dinámicamente en el centro.

* **UserLayout:** Contenedor principal para pacientes. Envuelve las rutas de paciente (`/home`, `/books`, etc.) e inyecta la navegación inferior (móvil) o lateral (web).
* **AdminLayout:** Contenedor exclusivo para administradores. Maneja un menú lateral dedicado a las entidades del sistema (Libros, Capítulos, Usuarios).
* **Vistas Hoja (Leaf Pages):** Componentes como `ChapterPage` o `SimulationPage` que se montan dentro del `IonRouterOutlet` del Layout correspondiente.

### 3. Restricciones y Redirecciones por Rol
* **Usuario no autenticado:** Cualquier intento de acceder a rutas protegidas redirige forzosamente a `/login`.
* **Usuario autenticado en rutas públicas:** Si un usuario con sesión activa visita `/login` o `/register`, es redirigido a `/home` o `/admin` según su rol.
* **Paciente en rutas administrativas:** Redirección inmediata a `/unauthorized`.
* **Administrador en rutas de paciente:** Se permite el acceso en modo lectura. Justificación: El administrador (psicooncólogo/editor) necesita validar visualmente cómo se despliega el contenido que acaba de crear.

### 4. Navegación Adaptativa por Dispositivo
El componente contenedor detecta la plataforma para ajustar la interfaz sin duplicar lógica:
* **Dispositivos Móviles:** Se utiliza `IonTabs` anclado en la parte inferior (`IonTabBar`). Esto facilita la navegación con los pulgares, un detalle de accesibilidad crucial para pacientes que puedan presentar debilidad motriz o administren sus terapias con una mano.
* **Versión Web (Escritorio):** Se emplea un `IonMenu` lateral, fijo en pantallas grandes y colapsable en pantallas medianas. Aprovecha el espacio horizontal para mostrar mayor densidad de opciones, ideal para el trabajo administrativo.

### 5. Flujos de Tareas Principales (Task Flows)

**Flujo 1: Lectura y Toma de Decisión (Paciente)**
Inicio de sesión -> `/home` (Selecciona libro) -> `/books/:id` (Selecciona capítulo) -> `/chapters/:id` (Lee narrativa) -> `/simulation/:id` (Inicia simulación) -> `/decision/:id` (Elige opción) -> Guarda progreso y avanza.

**Flujo 2: Consumo de Recursos Multimedia (Paciente)**
`/home` -> `/books/:id` -> `/resources` (Abre galería de medios del capítulo) -> Reproduce video/audio -> `IonBackButton` (Retorna a la lectura sin perder el estado).

**Flujo 3: Revisión de Progreso (Paciente)**
Inicio de sesión -> Navegación en Tab/Menú -> `/progress` (Visualiza gráficos de capítulos completados y decisiones previas) -> Retorno al inicio.

**Flujo 4: Creación de Contenido Narrativo (Administrador)**
Inicio de sesión -> `/admin` -> `/admin/books/create` (Crea libro base) -> `/admin/chapters` (Agrega texto y lógica booleana) -> `/admin/simulations` (Asocia personajes y opciones) -> Guarda y publica.

### 6. Puntos Críticos de Interacción

1. **El momento de la decisión en la simulación:** 
   * *Fricción:* Riesgo de toques accidentales o ansiedad ante opciones definitorias. 
   * *Solución:* Diseño con tarjetas (`IonCard`) amplias. Requiere una selección (que resalta la tarjeta visualmente) y luego presionar un botón explícito de confirmación en la parte inferior.
2. **Carga de recursos multimedia (Audio/Video):**
   * *Fricción:* Conexiones lentas a internet en recintos hospitalarios.
   * *Solución:* Implementación de `IonSkeletonText` durante la carga de la interfaz y `IonSpinner` en el reproductor. Manejo de estado vacío si el recurso falla, ofreciendo un botón de recarga.
3. **Primer acceso del paciente (Empty State):**
   * *Fricción:* Confusión al no tener historial de lectura.
   * *Solución:* En lugar de una pantalla en blanco, la ruta `/home` mostrará una ilustración cálida invitando a explorar la biblioteca mediante un botón Call-to-Action destacado.

### 7. Justificación Técnica de la Arquitectura
* **Usabilidad oncológica:** Minimizar la carga cognitiva manteniendo estructuras predecibles (Layouts constantes) y controles al alcance del dedo (IonTabs).
* **Eficiencia:** El uso de React Router con `IonRouterOutlet` permite mantener el estado de navegación de Ionic (animaciones, historial de vistas) sin recargar el DOM.
* **Escalabilidad:** Encapsular la lógica en Layouts independientes permite crecer el panel de administración sin sobrecargar el bundle del paciente.
* **Seguridad:** Las validaciones de ruta actúan como primera barrera (Frontend), complementando la futura verificación estricta de tokens en la API REST.
