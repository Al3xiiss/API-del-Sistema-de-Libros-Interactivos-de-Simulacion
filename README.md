# API del Sistema de Libros Interactivos de Simulación

# Presentado por:
- Alexis Escobar — Frontend / Ionic + React
- Trabajo Grupal — Backend / API REST (EP2)
- Geraldine Allende — UI/UX y Figma
- Gabriel Fuentes — Documentación y gestión

**Distribución de responsabilidades**
- **Frontend (Ionic + React):** Estructura de vistas, componentes, navegación con React Router.
- **UI/UX y Figma:** Mockups móvil/web y flujo de navegación.
- **Backend (a desarrollar en EP2):** API REST, base de datos relacional, autenticación JWT.
- **Documentación y gestión:** README, ramas, evidencia de avance.

## Índice
1. [Justificación del problema](#justificación-del-problema)
2. [Usuarios](#usuarios-objetivo-quién-usará-la-aplicación)
    - [Roles](#roles-del-sistema)
    - [Proto-personas](#proto-personas)
3. [Requerimientos](#requerimientos)
4. [Arquitectura de la Información/ UX](#arquitectura-de-navegación)
    - [Diferenciación x roles](#diferenciación-de-acceso-según-roles)
    - [Flujos principales Tareas](#flujos-de-tareas)
    - [Puntos críticos de interacción](#puntos-críticos-de-interacción)
    - [Justificación Técnica](#justificación-técnica)
5. [Bocetos UX/UI](#bocetos-uiux)
6. [Librerías y Tecnologías](#librerías-usadas-con-react-ionic)

## Justificación del problema
El tratamiento oncológico supone una carga emocional y psicológica importante, es por ello que los pacientes suelen enfrentarse a un exceso de información médica (folletos estáticos o videos dispersos) que carece de un seguimiento estructurado.

La Organización Mundial de la Salud (OMS) y la Organización Panamericana de la Salud (OPS) destacan que el apoyo psicosocial continuo es un componente crítico para mejorar la calidad de vida y la adherencia al tratamiento en pacientes oncológicos. Sin embargo, en la práctica los pacientes experimentan una alta fatiga cognitiva al intentar buscar y procesar consejos de autocuidado en múltiples plataformas, lo que genera frustración y aislamiento.

Además, la falta de una plataforma centralizada que ofrezca experiencias narrativas interactivas provoca que el paciente se enfrente a su proceso en soledad, sin un espacio seguro donde proyectar sus decisiones y ver reflejadas sus inquietudes.

En este contexto, el problema abordado por el proyecto corresponde a la necesidad de centralizar el acompañamiento emocional del paciente a través de experiencias narrativas interactivas que le permitan desarrollar su proceso de tratamiento de forma segura y estructurada.

Para ello, se propone una API de sistema de libros interactivos que transforme la lectura pasiva en una experiencia inmersiva. A través de simulaciones y toma de decisiones, el paciente puede explorar escenarios emocionales y cotidianos en un entorno seguro.

Por lo tanto, el desarrollo de esta API de de libros interactivos permitiría centralizar el acompañamiento emocional del paciente, facilitar su consulta desde diferentes dispositivos y proporcionar una experiencia diferenciada entre pacientes y administradores de contenido.

---
## Usuarios objetivo (Quién usará la aplicación)
La aplicación considera principalmente dos grupos de usuarios: **Usuario/Paciente y Administrador/Editor de Contenido**.

### Usuario / Paciente
Corresponde a adultos en diversas etapas del tratamiento oncológico y que utilizan la plataforma principalmente en habitaciones de hospital durante la terapia, en salas de espera o en reposo domiciliario.

### Administrador / Editor de Contenido
Corresponde a psicooncólogos, educadores de salud o personal de fundaciones, los cuales trabajan principalmente desde oficinas clínicas o teletrabajo.

#### Necesidades principales
- Consumir contenido que reduzca la ansiedad.
- Registrar su progreso emocional.
- Tener máxima confidencialidad sobre su identidad y su progreso.

---
## Roles del Sistema
- **Usuario / Paciente**: Persona que interactúa con los libros interactivos, navega capítulos y realiza el seguimiento de su progreso.
- **Administrador**: Usuario encargado de la gestión de libros dentro de la plataforma.

### Definición de conceptos
**Rol**: Define qué puede hacer un usuario dentro del sistema.
**Proto-persona**: Describe quién podría ser ese usuario, sus características, necesidades, objetivos, dificultades y contexto de uso.

**Por ejemplo**
*Rol*: Usuario/Paciente
*Proto-persona*: Paciente adulto de 45 años que recibe quimioterapia semanal y utiliza principalmente tablet durante sus sesiones de tratamiento.

---
## Proto-personas
*Estos perfiles son caracterizaciones preliminares construidas a partir de fuentes secundarias y supuestos razonados del equipo, no de entrevistas a usuarios reales.*

---
### Proto-persona 1: Paciente en tratamiento oncológico activo

**Nombre ficticio:** Elena Rojas
**Tipo de usuario o rol:** Usuario / Paciente

#### Características generales

Elena tiene 45 años y es profesora con licencia médica. Actualmente se encuentra recibiendo quimioterapia intravenosa de forma semanal. Su nivel de manejo tecnológico es básico/intermedio.

#### Necesidades principales

- Sentirse comprendida sin tener que leer densa jerga médica.
- Contar con distracciones constructivas durante sus terapias.

#### Objetivos de uso

Leer historias de personajes que atraviesan situaciones similares a la suya y tomar decisiones para ver distintos desenlaces.

#### Dificultades o puntos de frustración

- Se agota rápidamente leyendo pantallas con mucho texto.
- Le frustran las interfaces con botones pequeños.

#### Funcionalidades de la aplicación que utilizaría

- Navegación de Capítulos (RF-02).
- Ejecución de Simulación (RF-03).
- Toma de Decisiones (RF-04).
- Reproducción Multimedia (RF-05).
- Consulta de Progreso (RF-06).

#### Dispositivo y contexto probable de acceso

Utilizaría principalmente **tablet y teléfono móvil**. Accede recostada en la clínica durante sus sesiones de tratamiento o desde su cama en reposo domiciliario.

---
### Proto-persona 2: Administrador y editor de contenido narrativo

**Nombre ficticio:** Martín Vargas
**Tipo de usuario o rol:** Administrador / Editor de Contenido (Psicooncólogo)

#### Características generales

Martín tiene 38 años y es psicólogo en una fundación oncológica. Está acostumbrado a redactar material de apoyo para sus pacientes. Su nivel de manejo tecnológico es intermedio.

#### Necesidades principales

- Centralizar sus guías de apoyo en una herramienta interactiva.
- Lograr que sus pacientes participen activamente del contenido.

#### Objetivos de uso

Crear un libro con simulaciones y asociar audios de relajación a capítulos específicos.

#### Dificultades o puntos de frustración

- Falta de tiempo.
- Le frustran los sistemas complejos que requieren muchos clics para publicar un texto.

#### Funcionalidades de la aplicación que utilizaría

- Gestión de Libros (RF-01).
- Reproducción Multimedia (RF-05).
- Gestión de Personajes (RF-07).

#### Dispositivo y contexto probable de acceso

Utilizaría principalmente la **versión web desde un computador de escritorio**, durante horario de oficina.

## Requerimientos

## Requerimientos Funcionales por Rol
Un requerimiento funcional (RF) describe qué debe hacer el sistema. Representa una funcionalidad, servicio, comportamiento o acción que la aplicación debe proporcionar a *uno o más roles*.

| ID | Nombre | Descripción | Rol | Precondiciones | Flujo Principal | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Gestión de Libros | Permite agregar, editar o eliminar libros interactivos. | Administrador | Estar autenticado en el panel admin. | 1. Accede a "Gestión".<br>2. Selecciona crear/editar.<br>3. Ingresa título y guarda. | El catálogo se actualiza en la base de datos. |
| **RF-02** | Navegación de Capítulos | Permite acceder y leer el contenido estructurado de un libro. | Usuario/Paciente | Tener un libro seleccionado. | 1. Abre el libro.<br>2. Selecciona un capítulo desbloqueado.<br>3. Navega el texto. | El contenido del capítulo se despliega en pantalla. |
| **RF-03** | Ejecución de Simulación | Activa el entorno narrativo donde ocurre la interacción. | Usuario/Paciente | Llegar al punto de simulación en el capítulo. | 1. Presiona "Iniciar Simulación".<br>2. El sistema carga el contexto y personajes. | La interfaz cambia al modo de simulación interactiva. |
| **RF-04** | Toma de Decisiones | Registra la elección del usuario ante un escenario narrativo. | Usuario/Paciente | Simulación activa con opciones en pantalla. | 1. Lee las opciones.<br>2. Selecciona una alternativa.<br>3. El sistema evalúa la elección. | La narrativa avanza según la variable booleana o camino elegido. |
| **RF-05** | Reproducción Multimedia | Permite visualizar videos o escuchar audios complementarios. | Usuario/Paciente | Estar en una vista con recursos asociados. | 1. Presiona el recurso.<br>2. El reproductor carga y reproduce el medio. | El medio se reproduce sin interrumpir el progreso actual. |
| **RF-06** | Consulta de Progreso | Muestra el porcentaje de avance y capítulos completados. | Usuario/Paciente | Tener interacción previa con al menos un libro. | 1. Accede a "Mi Progreso".<br>2. El sistema calcula el avance total. | Se visualiza una barra de progreso y estadísticas. |
| **RF-07** | Gestión de Personajes | Permite vincular perfiles de personajes a las simulaciones. | Administrador | Estar autenticado en el panel admin. | 1. Accede a "Personajes".<br>2. Define atributos y asocia a un capítulo. | El personaje queda disponible para renderizarse en las simulaciones. |

---

### Funcionalidades Transversales

Las siguientes funcionalidades son necesarias para el funcionamiento general de la aplicación, pero no forman parte de los siete requerimientos funcionales principales del dominio.

- **FT-01:** El sistema deberá permitir el registro de nuevos usuarios/pacientes (`/register`).
- **FT-02:** El sistema deberá permitir a los usuarios iniciar sesión mediante sus credenciales (`/login`).
- **FT-03:** El sistema deberá permitir cerrar una sesión activa.
- **FT-04:** El sistema deberá restringir las funcionalidades disponibles de acuerdo con el rol del usuario autenticado (Usuario/Paciente vs. Administrador).

---

## Requerimientos No Funcionales

Los requerimientos no funcionales establecen condiciones de calidad que deberá cumplir la plataforma.

### UX y Usabilidad

#### RNF-UX-01 — Usabilidad

El acceso al último capítulo leído deberá lograrse en un máximo de 3 clics desde el inicio. Se validará mediante pruebas de usabilidad con métrica de clics.

---

### Accesibilidad

#### RNF-ACC-01 — Accesibilidad visual

La interfaz deberá mantener un contraste de colores WCAG AA (mínimo 4.5:1) y soportar el escalado de texto al 200%. Se validará con herramientas automatizadas como aXe o WAVE.

---

### Seguridad

#### RNF-SEG-01 — Autenticación y almacenamiento de contraseñas

El sistema utilizará JWT para el manejo de sesiones y contraseñas hasheadas con bcrypt. Se validará mediante análisis de tokens y verificación de base de datos.

---

### Rendimiento

#### RNF-REN-01 — Tiempos de respuesta

La API REST deberá responder solicitudes en menos de 200 ms, e Ionic deberá renderizar las vistas en menos de 1.5 segundos. Se validará mediante pruebas de carga y auditorías con Lighthouse.

---

### Compatibilidad

#### RNF-COM-01 — Navegadores y dispositivos compatibles

El sistema deberá ejecutarse en la web (Chrome v100+) y adaptarse a dispositivos móviles (Android 10+, iOS 14+) vía Capacitor. Se validará mediante despliegue y pruebas en emuladores.

---
## Arquitectura de Navegación
### 1. Rutas principales y secundarias

La aplicación considera rutas públicas y rutas protegidas.

#### Rutas públicas

| Ruta | Vista | Descripción |
|---|---|---|
| `/` | Redirección | Redirección automática a `/login`. |
| `/login` | Inicio de sesión | Permite al usuario autenticarse en el sistema. |
| `/register` | Registro | Permite el registro de un nuevo usuario/paciente. |

#### Rutas protegidas del Usuario / Paciente

| Ruta | Vista | Descripción |
|---|---|---|
| `/home` | Inicio | Inicio y biblioteca de libros. |
| `/books` | Listado de libros | Listado completo de libros disponibles. |
| `/books/:id` | Detalle de libro | Detalle del libro y sus capítulos. |
| `/chapters/:id` | Lectura de capítulo | Lectura interactiva del capítulo. |
| `/simulation/:id` | Simulación | Entorno de simulación narrativa. |
| `/decision/:id` | Toma de decisión | Pantalla de toma de decisiones. |
| `/characters` | Personajes | Galería de personajes. |
| `/resources` | Recursos | Recursos multimedia de apoyo. |
| `/progress` | Progreso | Seguimiento de progreso y estadísticas. |
| `/profile` | Perfil | Gestión del perfil de usuario. |

#### Rutas protegidas del Administrador

| Ruta | Vista | Descripción |
|---|---|---|
| `/admin` | Inicio administrador | Panel principal de administración. |
| `/admin/books` | Gestión de libros | Gestión de los libros existentes. |
| `/admin/books/create` | Crear libro | Creación de un nuevo libro. |
| `/admin/books/:id/edit` | Editar libro | Edición de un libro existente. |
| `/admin/chapters` | Gestión de capítulos | Gestión de capítulos. |
| `/admin/simulations` | Gestión de simulaciones | Gestión de simulaciones. |
| `/admin/characters` | Gestión de personajes | Gestión de personajes. |
| `/admin/resources` | Gestión de recursos | Gestión de recursos multimedia. |
| `/admin/progress` | Estadísticas | Estadísticas globales de usuarios. |
| `/unauthorized` | Acceso denegado | Pantalla de acceso denegado por rol. |

### 2. Relaciones jerárquicas entre vistas
La aplicación se organiza mediante una estructura jerárquica en la que las funcionalidades disponibles dependen del rol del usuario autenticado.

```text
Aplicación
│
├── Rutas públicas
│   ├── /
│   ├── /login
│   └── /register
│
└── Rutas protegidas
    │
    ├── UserLayout (Usuario / Paciente)
    │   ├── /home
    │   ├── /books
    │   │   └── /books/:id
    │   ├── /chapters/:id
    │   ├── /simulation/:id
    │   ├── /decision/:id
    │   ├── /characters
    │   ├── /resources
    │   ├── /progress
    │   └── /profile
    │
    └── AdminLayout (Administrador)
        ├── /admin
        ├── /admin/books
        │   ├── /admin/books/create
        │   └── /admin/books/:id/edit
        ├── /admin/chapters
        ├── /admin/simulations
        ├── /admin/characters
        ├── /admin/resources
        ├── /admin/progress
        └── /unauthorized
```

La aplicación utiliza un enfoque de componentes contenedores (Layouts) para encapsular la navegación, permitiendo que las vistas hoja (leaf pages) se rendericen dinámicamente en el centro.

- **UserLayout:** Contenedor principal para pacientes. Envuelve las rutas de paciente (`/home`, `/books`, etc.) e inyecta la navegación inferior (móvil) o lateral (web).
- **AdminLayout:** Contenedor exclusivo para administradores. Maneja un menú lateral dedicado a las entidades del sistema (Libros, Capítulos, Usuarios).
- **Vistas Hoja (Leaf Pages):** Componentes como `ChapterPage` o `SimulationPage` que se montan dentro del `IonRouterOutlet` del Layout correspondiente.

### 3. Navegación adaptativa por dispositivo
El componente contenedor detecta la plataforma para ajustar la interfaz sin duplicar lógica:
- **Dispositivos Móviles:** Se utiliza `IonTabs` anclado en la parte inferior (`IonTabBar`). Esto facilita la navegación con los pulgares, un detalle de accesibilidad crucial para pacientes que puedan presentar debilidad motriz o administren sus terapias con una mano.
- **Versión Web (Escritorio):** Se emplea un `IonMenu` lateral, fijo en pantallas grandes y colapsable en pantallas medianas. Aprovecha el espacio horizontal para mostrar mayor densidad de opciones, ideal para el trabajo administrativo.

---
## Diferenciación de acceso según roles

La aplicación deberá controlar el acceso a las diferentes funcionalidades de acuerdo con el rol del usuario autenticado. Se consideran dos roles principales: **Usuario/Paciente** y **Administrador**.

- Un usuario no autenticado que intente acceder a una ruta protegida será redirigido forzosamente a `/login`.
- Un usuario autenticado que visite `/login` o `/register` será redirigido a `/home` o `/admin` según su rol.
- Un paciente que intente acceder a rutas administrativas será redirigido de inmediato a `/unauthorized`.
- Un administrador puede acceder en modo lectura a las rutas de paciente, ya que necesita validar visualmente cómo se despliega el contenido que acaba de crear.

### Matriz de acceso por rol

| Funcionalidad | Usuario / Paciente | Administrador |
| :--- | :--- | :--- |
| **RF-01: Gestión de Libros** | Sin acceso | Acceso total (CRUD) |
| **RF-02: Navegación de Capítulos** | Acceso total (Lectura) | Acceso total (Revisión) |
| **RF-03: Ejecución de Simulación** | Acceso total | Acceso de prueba |
| **RF-04: Toma de Decisiones** | Acceso total | Sin acceso |
| **RF-05: Reproducción Multimedia** | Acceso total | Acceso total |
| **RF-06: Consulta de Progreso** | Solo métricas propias | Estadísticas globales |
| **RF-07: Gestión de Personajes** | Sin acceso | Acceso total (CRUD) |

---

### Acceso del Usuario / Paciente

El usuario/paciente tendrá acceso a las funcionalidades relacionadas con la lectura y la experiencia narrativa dentro de la plataforma.

Podrá:

- navegar el catálogo de libros y ver el detalle de cada uno;
- leer capítulos y avanzar en la narrativa;
- participar en simulaciones y tomar decisiones;
- reproducir recursos multimedia de apoyo;
- consultar su propio progreso;
- gestionar su perfil.

El usuario/paciente no podrá acceder a las funcionalidades de gestión reservadas al administrador (creación, edición o eliminación de libros, capítulos o personajes).

---

### Acceso del Administrador

El administrador tendrá acceso a las funcionalidades de gestión de contenido de la plataforma.

Podrá:

- gestionar libros (crear, editar, eliminar);
- gestionar personajes y asociarlos a capítulos;
- revisar la navegación de capítulos y probar simulaciones;
- reproducir recursos multimedia;
- consultar estadísticas globales de progreso de los usuarios.

Además, el administrador puede acceder en modo lectura a las rutas del usuario/paciente, ya que necesita validar visualmente cómo se despliega el contenido que acaba de crear.

---

### Control de acceso a rutas

La diferenciación por roles deberá aplicarse tanto en la interfaz como en las rutas de la aplicación.

Por ejemplo:

```text
/login
/register

/home
/books
/chapters/:id
/simulation/:id
/decision/:id
/characters
/resources
/progress
/profile

/admin
/admin/books
/admin/books/create
/admin/books/:id/edit
/admin/chapters
/admin/simulations
/admin/characters
/admin/resources
/admin/progress
/unauthorized
```
---
## Flujos de Tareas
Los flujos de tareas (*task flows*) representan la secuencia de acciones que realiza un usuario para completar una actividad específica dentro de la aplicación.

---

### Task Flow 1: Lectura y toma de decisión

**Rol:** Usuario / Paciente

**Objetivo:** leer la narrativa de un capítulo, participar en la simulación y tomar una decisión que haga avanzar la historia.

```text
Inicio de sesión
      ↓
Selecciona libro (/home)
      ↓
Selecciona capítulo (/books/:id)
      ↓
Lee la narrativa (/chapters/:id)
      ↓
Inicia simulación (/simulation/:id)
      ↓
Elige una opción (/decision/:id)
      ↓
Guarda progreso y avanza
```
---

### Task Flow 2: Consumo de recursos multimedia

**Rol:** Usuario / Paciente

**Objetivo:** visualizar o escuchar material multimedia de apoyo asociado a un capítulo.

```text
Selecciona libro (/home)
      ↓
Selecciona capítulo (/books/:id)
      ↓
Abre galería de recursos (/resources)
      ↓
Reproduce video o audio
      ↓
Vuelve a la lectura sin perder el estado
```
---

### Task Flow 3: Revisión de progreso

**Rol:** Usuario / Paciente

**Objetivo:** revisar el avance y las decisiones tomadas a lo largo del tratamiento narrativo.

```text
Inicio de sesión
      ↓
Navega mediante Tab o Menú
      ↓
Visualiza gráficos de progreso (/progress)
      ↓
Vuelve al inicio
```
---

### Task Flow 4: Creación de contenido narrativo

**Rol:** Administrador

**Objetivo:** registrar un nuevo libro, con sus capítulos y simulaciones, para que quede disponible para los usuarios/pacientes.

```text
Inicio de sesión
      ↓
Accede al panel de administración (/admin)
      ↓
Crea el libro base (/admin/books/create)
      ↓
Agrega texto y lógica booleana (/admin/chapters)
      ↓
Asocia personajes y opciones (/admin/simulations)
      ↓
Guarda y publica
```
---
## Puntos críticos de interacción
Los puntos críticos de interacción corresponden a momentos del sistema en los que una interacción poco clara o una carga técnica insuficiente puede afectar significativamente la experiencia del usuario, considerando especialmente el contexto emocional y físico de los pacientes en tratamiento oncológico.

Para este caso de estudio se identifican los siguientes puntos críticos:

1. **El momento de la decisión en la simulación:**
   * *Fricción:* Riesgo de toques accidentales o ansiedad ante opciones definitorias.
   * *Solución:* Diseño con tarjetas (`IonCard`) amplias. Requiere una selección (que resalta la tarjeta visualmente) y luego presionar un botón explícito de confirmación en la parte inferior.
2. **Carga de recursos multimedia (Audio/Video):**
   * *Fricción:* Conexiones lentas a internet en recintos hospitalarios.
   * *Solución:* Implementación de `IonSkeletonText` durante la carga de la interfaz y `IonSpinner` en el reproductor. Manejo de estado vacío si el recurso falla, ofreciendo un botón de recarga.
3. **Primer acceso del paciente (Empty State):**
   * *Fricción:* Confusión al no tener historial de lectura.
   * *Solución:* En lugar de una pantalla en blanco, la ruta `/home` mostrará una ilustración cálida invitando a explorar la biblioteca mediante un botón Call-to-Action destacado.
---
### Justificación Técnica

### Usabilidad
Minimizar la carga cognitiva del paciente, manteniendo estructuras predecibles (Layouts constantes) y controles al alcance del dedo (`IonTabs`).

### Eficiencia de interacción
El uso de React Router con `IonRouterOutlet` permite mantener el estado de navegación de Ionic (animaciones, historial de vistas) sin recargar el DOM.

### Claridad estructural
Las vistas se organizan mediante componentes contenedores (Layouts) según el rol del usuario autenticado: `UserLayout` para pacientes y `AdminLayout` para administradores, encapsulando la navegación e inyectando el patrón correspondiente (inferior en móvil, lateral en web).

### Escalabilidad
Encapsular la lógica en Layouts independientes permite hacer crecer el panel de administración sin sobrecargar el bundle del paciente.

### Seguridad
Las validaciones de ruta actúan como primera barrera (Frontend), complementando la futura verificación estricta de tokens en la API REST.

---
## Bocetos UI/UX
[Figma - Prototipo de UI/UX]()

### Criterios de diseño
- **Paleta de colores:** Tonos tranquilizadores (violetas suaves, azules serenos, verdes apagados). Contraste estricto WCAG AA (mínimo 4.5:1) para evitar fatiga visual.
- **Tipografía:** Sans-serif limpia (Inter o Roboto). Tamaño mínimo de 16px en móvil y 14px en web para legibilidad óptima.
- **Coherencia e Iconografía:** Uso exclusivo de Ionicons. Sistema de espaciado basado en múltiplos de 8px.

### Descripción de pantallas para Figma

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

---
## Librerías usadas con React (Ionic)

### Librerías principales

| Librería | Propósito |
|---|---|
| `react` | Construcción de la interfaz mediante componentes. |
| `@ionic/react` | Estructura de vistas y componentes de interfaz de Ionic. |
| `react-router-dom` | Navegación entre las diferentes vistas de la aplicación. |

## Tecnologías
- **Ionic Framework**
- **React**
- **API REST** (Backend, a desarrollar en EP2)
- **Autenticación JWT**
- **Capacitor** (adaptación móvil, Android 10+ / iOS 14+)
