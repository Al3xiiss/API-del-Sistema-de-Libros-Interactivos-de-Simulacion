# Documentación de la API REST

API del **Sistema de Libros Interactivos de Simulación** (EP2). Está construida con Node.js, Express y PostgreSQL.

- **URL base:** `http://localhost:3000/api`
- **Formato:** JSON en el cuerpo de las peticiones y de las respuestas.
- **Pruebas:** colección de Insomnia en [`insomnia-libros-interactivos.json`](./insomnia-libros-interactivos.json) (ver [Pruebas con Insomnia](#pruebas-con-insomnia)).

## Índice

1. [Convenciones](#convenciones)
2. [Autenticación y roles](#autenticación-y-roles)
3. [Endpoints](#endpoints)
   - [Estado del servidor](#estado-del-servidor)
   - [Autenticación](#autenticación)
   - [Libros](#libros)
   - [Capítulos](#capítulos)
   - [Personajes](#personajes)
   - [Simulaciones y opciones](#simulaciones-y-opciones)
   - [Recursos multimedia](#recursos-multimedia)
   - [Progreso del paciente](#progreso-del-paciente)
   - [Decisiones del paciente](#decisiones-del-paciente)
   - [Estadísticas](#estadísticas)
   - [YouTube (servicio externo)](#youtube-servicio-externo)
4. [Seguridad](#seguridad)
5. [Pruebas con Insomnia](#pruebas-con-insomnia)

---

## Convenciones

### Formato de las respuestas

Una respuesta correcta trae los datos dentro de `data`:

```json
{ "data": { "id": 1, "titulo": "El misterio de Valparaíso" } }
```

Un error trae un mensaje en `error`:

```json
{ "error": "Libro no encontrado" }
```

Si los datos enviados no pasan la validación, también llega la lista `detalles`, con un error por campo:

```json
{
  "error": "Datos inválidos",
  "detalles": [
    { "campo": "titulo", "mensaje": "El título debe tener entre 3 y 80 caracteres" },
    { "campo": "sinopsis", "mensaje": "La sinopsis debe tener entre 10 y 400 caracteres" }
  ]
}
```

### Códigos HTTP

| Código | Cuándo se usa |
|---|---|
| `200 OK` | Consulta o edición correcta |
| `201 Created` | Registro creado |
| `204 No Content` | Registro eliminado (la respuesta no trae cuerpo) |
| `400 Bad Request` | Datos inválidos, JSON mal formado o referencia a un registro que no existe |
| `401 Unauthorized` | Falta el token, es inválido o venció. También se usa para correo o contraseña incorrectos |
| `403 Forbidden` | El usuario tiene sesión, pero su rol no le permite la acción |
| `404 Not Found` | El registro o la ruta no existe |
| `409 Conflict` | Valor repetido (por ejemplo, un correo ya registrado) o una acción que no corresponde al estado actual, como completar un capítulo cuando el anterior está pendiente |
| `413 Payload Too Large` | El cuerpo de la petición pesa más de 100 KB |
| `429 Too Many Requests` | Demasiados intentos fallidos de inicio de sesión (5 en 15 minutos para el mismo correo desde la misma IP) o demasiadas cuentas nuevas desde la misma IP (20 por hora) |
| `500 Internal Server Error` | Error inesperado. Se registra en la terminal del servidor y al cliente solo le llega un mensaje genérico |
| `503 Service Unavailable` | YouTube no responde, se agotó la cuota o falta `YOUTUBE_API_KEY` (solo al guardar recursos de YouTube y en `/youtube/video`) |

### Ids y filtros

- Los ids de la URL (`/libros/3`) deben ser números enteros positivos. Si no lo son, la respuesta es `400`.
- Los listados aceptan filtros opcionales en la URL, por ejemplo `/capitulos?libro_id=1`.

---

## Autenticación y roles

1. El cliente inicia sesión con `POST /api/auth/login` y recibe un **token JWT**.
2. En cada petición protegida envía el token en el encabezado:

   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. El token dura **2 horas** (`JWT_EXPIRES_IN`). Lleva el `id` y el `rol` del usuario, firmados con `JWT_SECRET` (mínimo 32 caracteres; si es más corta, el servidor no arranca). Nunca lleva la contraseña.
4. En cada petición protegida, la API **vuelve a leer el rol desde la base de datos**. Si a un administrador le quitan el rol, pierde el acceso de inmediato aunque su token siga vigente, y si su cuenta se elimina, el token deja de servir (`401`).

| Rol | Valor en la API | Cómo se crea |
|---|---|---|
| Paciente | `patient` | Registro público (`POST /api/auth/register`) |
| Administrador | `admin` | Solo directamente en la base de datos. El registro público nunca crea administradores |

### Permisos por módulo

| Módulo | Paciente | Administrador |
|---|---|---|
| Libros, capítulos, personajes, simulaciones, recursos | Ver | Ver, crear, editar y eliminar |
| Progreso y decisiones | Solo los propios | Solo los propios |
| Estadísticas | — | Ver |
| YouTube (datos de un video) | — | Ver |

---

## Endpoints

En las tablas, **Acceso** indica quién puede usar la ruta: Público (sin token), Sesión (cualquier usuario con token) o Admin.

### Estado del servidor

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/health` | Público | Comprueba que la API y la base de datos responden |

```json
{ "data": { "estado": "ok", "baseDeDatos": { "hora": "2026-10-24T01:54:40.626Z", "libros": 3 } } }
```

### Autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/auth/register` | Público | Crea una cuenta de paciente |
| `POST` | `/auth/login` | Público | Inicia sesión y devuelve el token |
| `GET` | `/auth/me` | Sesión | Datos del usuario dueño del token |

**`POST /auth/register`**

| Campo | Reglas |
|---|---|
| `alias` | Obligatorio. De 3 a 20 caracteres: letras, números, punto o guion bajo |
| `email` | Obligatorio. Correo válido. Se guarda en minúsculas; la base de datos también exige el formato y las minúsculas (`CHECK`) |
| `password` | Obligatorio. De 8 a 72 caracteres, con al menos una mayúscula y un número |

```json
{ "alias": "nuevo_paciente", "email": "nuevo@demo.cl", "password": "Clave1234" }
```

- Responde `201` con el usuario creado, que siempre tiene `"rol": "patient"`, aunque el cuerpo pida otro rol.
- Responde `409` si el alias o el correo ya existen.
- Responde `429` si desde la misma IP ya se crearon 20 cuentas en la última hora. Los registros rechazados no suman.

**`POST /auth/login`**

```json
{ "email": "paciente@demo.cl", "password": "Paciente123" }
```

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": { "id": 1, "alias": "elena_r", "email": "paciente@demo.cl", "rol": "patient" }
  }
}
```

Si el correo no existe o la contraseña es incorrecta, responde `401` con el mismo mensaje en los dos casos: `Correo o contraseña incorrectos`. Así no revela qué correos están registrados.

Después de **5 intentos fallidos en 15 minutos** para el mismo correo desde la misma IP, responde `429` (*Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentar*) sin revisar la contraseña. Los inicios de sesión correctos no suman. Se cuenta por IP y correo porque en un hospital muchos pacientes pueden compartir la misma IP: así un ataque contra una cuenta no bloquea a los demás.

### Libros

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/libros` | Sesión | Lista de libros con su cantidad de capítulos |
| `GET` | `/libros/:id` | Sesión | Un libro |
| `POST` | `/libros` | Admin | Crea un libro |
| `PUT` | `/libros/:id` | Admin | Edita un libro |
| `DELETE` | `/libros/:id` | Admin | Elimina un libro **y también sus capítulos**, personajes, simulaciones y recursos (`ON DELETE CASCADE`) |

| Campo | Reglas |
|---|---|
| `titulo` | Obligatorio. De 3 a 80 caracteres |
| `sinopsis` | Obligatorio. De 10 a 400 caracteres |
| `color_portada` | Opcional. Formato `#RRGGBB`, exigido también por la base de datos (`CHECK`). Si no se envía al crear, se usa `#5B4A8B`; al editar, se mantiene el que tenía |

```json
{
  "data": {
    "id": 1,
    "titulo": "El misterio de Valparaíso",
    "sinopsis": "Ana recorre los cerros de Valparaíso siguiendo pistas que alguien dejó para ella...",
    "color_portada": "#5B4A8B",
    "creado_en": "2026-10-24T01:12:08.281Z",
    "total_capitulos": 5
  }
}
```

### Capítulos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/capitulos?libro_id=` | Sesión | Lista sin el contenido, ordenada por número. Filtro opcional por libro |
| `GET` | `/capitulos/:id` | Sesión | Un capítulo con su contenido completo |
| `POST` | `/capitulos` | Admin | Crea un capítulo |
| `PUT` | `/capitulos/:id` | Admin | Edita un capítulo |
| `DELETE` | `/capitulos/:id` | Admin | Elimina un capítulo y también sus personajes, simulación, recursos y progreso |

| Campo | Reglas |
|---|---|
| `libro_id` | Obligatorio. Id de un libro existente (si no existe: `400`) |
| `numero` | Opcional. Entero mayor que 0. Si no se envía al crear, se usa el siguiente disponible del libro. No puede repetirse dentro del mismo libro (`409`) |
| `titulo` | Obligatorio. De 3 a 120 caracteres |
| `contenido` | Obligatorio. De 10 a 20.000 caracteres. Cada salto de línea separa un párrafo |

```json
{
  "data": [
    {
      "id": 2,
      "libro_id": 1,
      "libro_titulo": "El misterio de Valparaíso",
      "numero": 2,
      "titulo": "La carta en el ascensor",
      "simulacion_id": 1,
      "total_recursos": 0
    }
  ]
}
```

### Personajes

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/personajes?capitulo_id=&libro_id=` | Sesión | Lista con el capítulo y libro de cada personaje. Filtros opcionales |
| `GET` | `/personajes/:id` | Sesión | Un personaje |
| `POST` | `/personajes` | Admin | Crea un personaje |
| `PUT` | `/personajes/:id` | Admin | Edita un personaje |
| `DELETE` | `/personajes/:id` | Admin | Elimina un personaje. Si aparecía en una simulación, esta queda sin personaje (`ON DELETE SET NULL`) |

| Campo | Reglas |
|---|---|
| `capitulo_id` | Obligatorio. Id de un capítulo existente |
| `nombre` | Obligatorio. De 2 a 40 caracteres |
| `descripcion` | Opcional. Hasta 200 caracteres |
| `atributos` | Opcional. Hasta 200 caracteres |

```json
{
  "data": {
    "id": 1,
    "capitulo_id": 2,
    "capitulo_numero": 2,
    "capitulo_titulo": "La carta en el ascensor",
    "libro_id": 1,
    "libro_titulo": "El misterio de Valparaíso",
    "nombre": "Ana",
    "descripcion": "Profesora curiosa que vuelve a Valparaíso.",
    "atributos": "Curiosa, reflexiva"
  }
}
```

### Simulaciones y opciones

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/simulaciones?capitulo_id=&libro_id=` | Sesión | Lista sin las opciones, con su cantidad (`total_opciones`) |
| `GET` | `/simulaciones/:id` | Sesión | Una simulación con su personaje y sus opciones |
| `POST` | `/simulaciones` | Admin | Crea la simulación **y sus opciones en una transacción** |
| `PUT` | `/simulaciones/:id` | Admin | Edita los datos de la simulación (no sus opciones) |
| `DELETE` | `/simulaciones/:id` | Admin | Elimina la simulación, sus opciones y las decisiones tomadas en ella |
| `POST` | `/simulaciones/:id/opciones` | Admin | Agrega una opción (máximo 4 por simulación: `409`) |
| `PUT` | `/simulaciones/:id/opciones/:opcionId` | Admin | Edita una opción de esa simulación |
| `DELETE` | `/simulaciones/:id/opciones/:opcionId` | Admin | Elimina una opción (mínimo 2 por simulación: `409`) |

**Simulación**

| Campo | Reglas |
|---|---|
| `capitulo_id` | Obligatorio al crear. Un capítulo solo puede tener una simulación (`409`) |
| `personaje_id` | Opcional. Id de un personaje existente |
| `contexto` | Obligatorio. De 10 a 2.000 caracteres |
| `pregunta` | Obligatorio. De 5 a 200 caracteres |
| `opciones` | Obligatorio al crear. Lista de 2 a 4 opciones |

**Opción**

| Campo | Reglas |
|---|---|
| `texto` | Obligatorio. De 2 a 100 caracteres |
| `descripcion` | Opcional. Hasta 200 caracteres |
| `consecuencia` | Obligatorio. De 5 a 2.000 caracteres. Es lo que se muestra al paciente después de decidir |

```json
{
  "capitulo_id": 9,
  "personaje_id": 4,
  "contexto": "Lucía invita a Clara a dar una caminata corta.",
  "pregunta": "¿Qué responde Clara?",
  "opciones": [
    { "texto": "Aceptar", "descripcion": "Salir un rato", "consecuencia": "Clara disfruta el aire fresco." },
    { "texto": "Descansar", "consecuencia": "Clara escucha a su cuerpo y descansa." }
  ]
}
```

Respuesta de `GET /simulaciones/1`:

```json
{
  "data": {
    "id": 1,
    "capitulo_id": 2,
    "capitulo_numero": 2,
    "capitulo_titulo": "La carta en el ascensor",
    "libro_id": 1,
    "personaje_id": 1,
    "personaje_nombre": "Ana",
    "personaje_descripcion": "Profesora curiosa que vuelve a Valparaíso.",
    "contexto": "Ana tiene la carta en sus manos. El ascensor está por subir y alguien la mira desde la plaza.",
    "pregunta": "¿Qué decides hacer?",
    "opciones": [
      {
        "id": 1,
        "texto": "Subir en el ascensor",
        "descripcion": "Seguir la pista de inmediato.",
        "consecuencia": "Ana sube y desde lo alto ve un faro pintado en una casa cercana."
      },
      {
        "id": 2,
        "texto": "Hablar con la persona de la plaza",
        "descripcion": "Preguntar si sabe algo de la carta.",
        "consecuencia": "La persona sonríe y le indica el camino hacia una casa llena de faros."
      }
    ]
  }
}
```

### Recursos multimedia

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/recursos?capitulo_id=&libro_id=` | Sesión | Lista de videos y audios. Filtros opcionales |
| `GET` | `/recursos/:id` | Sesión | Un recurso |
| `POST` | `/recursos` | Admin | Crea un recurso |
| `PUT` | `/recursos/:id` | Admin | Edita un recurso |
| `DELETE` | `/recursos/:id` | Admin | Elimina un recurso |

| Campo | Reglas |
|---|---|
| `capitulo_id` | Obligatorio. Id de un capítulo existente |
| `tipo` | Obligatorio. `video` o `audio` |
| `titulo` | Obligatorio. De 3 a 100 caracteres |
| `descripcion` | Opcional. Hasta 300 caracteres |
| `url` | Opcional, hasta 500 caracteres. Un video de YouTube (`youtube.com/watch?v=`, `youtu.be/`, `shorts/` o `embed/`), un archivo de `/media/` o la dirección `https://` de un archivo `.mp3`, `.m4a`, `.ogg`, `.wav`, `.mp4` o `.webm`. Cualquier otra página responde `400` |
| `duracion_segundos` | Opcional. Entero entre 1 y 86.400 |

**Videos de YouTube:** si `YOUTUBE_API_KEY` está configurada, al crear o editar un recurso con un enlace de YouTube la API consulta el video en la YouTube Data API. Si no existe, es privado o no se puede insertar, responde `400` y no guarda nada; si existe, guarda su duración real en `duracion_segundos`. Si YouTube no responde, responde `503`.

### Progreso del paciente

El usuario **siempre se obtiene del token**: cada usuario solo ve y modifica su propio progreso, aunque envíe otro `usuario_id` en el cuerpo.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/progreso` | Sesión | Resumen y avance por libro |
| `PUT` | `/progreso/capitulos/:id` | Sesión | Registra que abrió un capítulo o lo completó |
| `DELETE` | `/progreso/libros/:id` | Sesión | Reinicia el avance en un libro: borra su progreso y sus decisiones en ese libro |

**`PUT /progreso/capitulos/:id`**

| Cuerpo | Efecto |
|---|---|
| `{}` | Registra que el capítulo se abrió (para "Continúa donde lo dejaste"). Si ya estaba completado, sigue completado |
| `{ "completado": true }` | Marca el capítulo como completado. **Desbloqueo progresivo:** si el capítulo anterior del mismo libro no está completado, responde `409` (*Debes completar el capítulo anterior antes de completar este*). El primer capítulo de cada libro siempre se puede completar |

Respuesta de `GET /progreso`:

```json
{
  "data": {
    "resumen": { "libros_iniciados": 1, "capitulos_completados": 2, "decisiones_tomadas": 1 },
    "libros": [
      {
        "libro_id": 1,
        "titulo": "El misterio de Valparaíso",
        "total_capitulos": 5,
        "capitulos_completados": [1, 2],
        "ultimo_capitulo_id": 3,
        "decisiones": { "1": 1 },
        "actualizado_en": "2026-10-24T01:12:08.288Z",
        "porcentaje": 40
      }
    ]
  }
}
```

`decisiones` relaciona cada simulación con la opción elegida: `{ "id_simulacion": id_opcion }`.

### Decisiones del paciente

Igual que el progreso, el usuario se obtiene del token.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/decisiones` | Sesión | Decisiones del usuario con la pregunta, la opción elegida y su consecuencia |
| `PUT` | `/decisiones/:simulacionId` | Sesión | Guarda la decisión. Si ya había decidido en esa simulación, la reemplaza |
| `DELETE` | `/decisiones/:simulacionId` | Sesión | Borra la decisión para volver a decidir |

**`PUT /decisiones/1`**

```json
{ "opcion_id": 1 }
```

```json
{
  "data": {
    "simulacion_id": 1,
    "opcion_id": 1,
    "opcion_texto": "Subir en el ascensor",
    "consecuencia": "Ana sube y desde lo alto ve un faro pintado en una casa cercana.",
    "decidido_en": "2026-10-24T01:54:40.626Z"
  }
}
```

- Si la opción pertenece a otra simulación, responde `400`. Lo garantiza la clave foránea compuesta `(opcion_id, simulacion_id)` de la tabla `decisiones`.
- Si la simulación no existe, responde `404`.

### Estadísticas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/estadisticas` | Admin | Totales del sistema |
| `GET` | `/estadisticas/pacientes` | Admin | Avance de cada paciente. Solo muestra el alias, no el correo |

```json
{
  "data": {
    "libros": 3,
    "capitulos": 11,
    "personajes": 4,
    "simulaciones": 5,
    "recursos": 4,
    "pacientes": 2,
    "capitulos_completados": 2,
    "decisiones_tomadas": 1
  }
}
```

### YouTube (servicio externo)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/youtube/video?url=` | Admin | Datos de un video de YouTube, consultados en la YouTube Data API v3. Lo usa el botón *Completar con YouTube* del formulario de recursos |

```json
{
  "data": {
    "id": "1NSM3mhgwv0",
    "titulo": "Título del video en YouTube",
    "canal": "Nombre del canal",
    "miniatura": "https://i.ytimg.com/vi/1NSM3mhgwv0/mqdefault.jpg",
    "duracion_segundos": 256
  }
}
```

| Respuesta | Cuándo |
|---|---|
| `400` | `url` no es un enlace de YouTube, o el video no existe, es privado o su dueño no permite insertarlo |
| `503` | Falta `YOUTUBE_API_KEY`, YouTube no responde en 5 segundos, se agotó la cuota diaria o la clave no es válida (el detalle queda en la terminal) |

Los videos consultados se guardan en caché durante 1 hora para no gastar cuota repetida. `duracion_segundos` es `null` en una transmisión en vivo.

---

## Seguridad

| Medida | Dónde |
|---|---|
| Contraseñas encriptadas con **bcrypt** (costo 10). La base de datos nunca guarda la contraseña | `services/auth.service.js` |
| **JWT** firmado con `JWT_SECRET`, con vencimiento y solo el algoritmo `HS256` aceptado | `services/auth.service.js`, `middlewares/auth.js` |
| Control de **roles**: `verificarToken` (401) y `permitirRoles('admin')` (403). El rol se lee desde la base de datos en cada petición, así un administrador degradado pierde el acceso de inmediato | `middlewares/auth.js` |
| **Límite de intentos de login**: 5 fallidos en 15 minutos por IP y correo → `429` | `middlewares/limiteLogin.js` |
| **Límite de cuentas nuevas**: 20 por hora desde la misma IP → `429` (los registros rechazados no suman) | `middlewares/limiteRegistro.js` |
| **Límite de tamaño**: el cuerpo JSON acepta hasta 100 KB → `413` | `app.js`, `middlewares/errorHandler.js` |
| `JWT_SECRET` de **32 caracteres o más**; el servidor no arranca con una clave corta o con la de ejemplo | `server.js` |
| Reglas de negocio en la API, no solo en la interfaz: un capítulo no se puede completar si el anterior está pendiente (`409`) | `services/progreso.service.js` |
| La base de datos también valida el formato del correo, que esté en minúsculas y el color `#RRGGBB` (`CHECK`) | `database/database.sql` |
| **Validación** de todos los datos de entrada, filtros e ids con express-validator | `validators/` |
| Protección contra **inyección SQL**: todas las consultas usan parámetros (`$1`, `$2`...), nunca texto concatenado | `services/` |
| Los datos propios (progreso y decisiones) usan el id del **token**, nunca uno enviado por el cliente | `services/progreso.service.js`, `services/decisiones.service.js` |
| Solo se guardan los campos esperados: el registro ignora un `rol` enviado en el cuerpo | `services/` |
| Cabeceras HTTP de seguridad con **helmet** | `app.js` |
| **CORS** solo para los orígenes de `CORS_ORIGIN` (uno o varios, separados por coma), con los métodos `GET`, `POST`, `PUT` y `DELETE` y los encabezados `Content-Type` y `Authorization`. Si la variable falta, no se acepta ningún origen | `app.js` |
| Protección contra **XSS**: los textos se guardan tal cual y el frontend (React) los muestra como texto. Los enlaces de recursos solo pueden ser YouTube o archivos de audio o video de `/media/` o con `https://` (`javascript:` y `data:` responden `400`) | `validators/recursos.validators.js` |
| Errores sin detalles internos: los 500 se registran en el servidor y el cliente recibe un mensaje genérico | `middlewares/errorHandler.js` |
| Las restricciones de la base de datos (UNIQUE, FOREIGN KEY, CHECK) se traducen a `400` o `409` | `utils/pgErrors.js` |
| Transacciones en operaciones de varios pasos (crear simulación con opciones, reiniciar libro) | `utils/transaccion.js` |
| Login con mensaje genérico, que no revela qué correos existen | `services/auth.service.js` |
| La clave de YouTube está en `YOUTUBE_API_KEY` (`.env`), viaja en el encabezado `X-Goog-Api-Key` y solo el administrador puede usar `/youtube/video` | `services/youtube.service.js`, `routes/youtube.routes.js` |

---

## Pruebas con Insomnia

La colección [`insomnia-libros-interactivos.json`](./insomnia-libros-interactivos.json) tiene **101 peticiones** en 14 carpetas, con **122 pruebas automáticas**: los casos correctos y los de error (400, 401, 403, 404, 409, 429 y 503) de cada módulo, y una carpeta de pruebas de seguridad (**13. Seguridad (EF3)**): inyección SQL, XSS, token sin firma, datos sensibles y CORS. Cada petición incluye:

- Una descripción, en la pestaña **Docs**, con la respuesta esperada.
- Pruebas automáticas.
- El token correcto, que se obtiene solo desde **Login paciente** o **Login admin**.
- En las peticiones de editar y eliminar, el id del registro creado en la petición **Crear** de la misma carpeta.

### Importarla

1. Levanta el backend (`npm run dev` en `backend/`) con la base de datos cargada desde `database/database.sql`.
2. En Insomnia: **Import** y elige el archivo `insomnia-libros-interactivos.json`.
3. Revisa que el entorno tenga `base_url` = `http://localhost:3000/api`.

### Ejecutarla completa

Usa el **Collection Runner**: clic derecho sobre la colección o sobre una carpeta y **Run**. Las peticiones se ejecutan en orden y al final se ve cuántas pruebas pasaron.

La colección deja los datos como estaban: todo lo que crea en una carpeta lo elimina al final de esa misma carpeta. La única excepción es el paciente `paciente_insomnia`, que se registra la primera vez. En las siguientes ejecuciones esa petición responde `409` y su prueba acepta las dos respuestas. Lo mismo pasa con la carpeta **11. Límite de intentos de login**: si se vuelve a ejecutar antes de 15 minutos, el correo de prueba sigue bloqueado y los intentos responden `429`.

### Pruebas manuales

**Rol vigente (administrador degradado):**
1. Inicia sesión con **Login admin** y envía **Estadísticas generales** → `200`.
2. En pgAdmin: `UPDATE usuarios SET rol = 'patient' WHERE email = 'admin@demo.cl';`
3. Sin volver a iniciar sesión, envía otra vez **Estadísticas generales** o **Crear libro** → `403`.
4. Restaura el rol: `UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@demo.cl';`

**Restricciones de la base de datos (sin pasar por la API):** en pgAdmin, `INSERT INTO libros (titulo, sinopsis, color_portada) VALUES ('Prueba', 'Sinopsis de prueba', 'rojo');` falla con `libros_color_formato`, y un correo con mayúsculas o sin `@` falla con `usuarios_email_minusculas` o `usuarios_email_formato`.
