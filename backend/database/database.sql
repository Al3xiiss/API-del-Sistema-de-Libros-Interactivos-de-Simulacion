-- Sistema de Libros Interactivos de Simulación — Base de datos
-- Motor: PostgreSQL

-- Paso 1 (una sola vez): crear la base de datos.
--   En pgAdmin: clic derecho en Databases → Create → Database... → libros_interactivos
--   o ejecutar esta línea conectado a la base "postgres":
-- CREATE DATABASE libros_interactivos;

-- Paso 2: ejecutar TODO este archivo conectado a la BD libros_interactivos.
-- Se puede volver a ejecutar cuando se quiera: borra las tablas y carga los datos de prueba de nuevo.

DROP TABLE IF EXISTS decisiones, progreso_capitulos, recursos, opciones_simulacion,
  simulaciones, personajes, capitulos, libros, usuarios CASCADE;

-- 1. usuarios
CREATE TABLE usuarios (
  id            SERIAL       PRIMARY KEY,
  alias         VARCHAR(20)  NOT NULL UNIQUE CHECK (char_length(alias) >= 3),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,                
  rol           VARCHAR(10)  NOT NULL DEFAULT 'patient' CHECK (rol IN ('patient', 'admin')),
  creado_en     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 2. libros
CREATE TABLE libros (
  id            SERIAL       PRIMARY KEY,
  titulo        VARCHAR(80)  NOT NULL CHECK (char_length(titulo) >= 3),
  sinopsis      VARCHAR(400) NOT NULL CHECK (char_length(sinopsis) >= 10),
  color_portada VARCHAR(7)   NOT NULL DEFAULT '#5B4A8B',
  creado_en     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- 3. capitulos (si se borra el libro, se borran sus capítulos)
CREATE TABLE capitulos (
  id        SERIAL       PRIMARY KEY,
  libro_id  INTEGER      NOT NULL REFERENCES libros(id) ON DELETE CASCADE,
  numero    INTEGER      NOT NULL CHECK (numero > 0),
  titulo    VARCHAR(120) NOT NULL,
  contenido TEXT         NOT NULL,
  UNIQUE (libro_id, numero)                            
);

-- 4. personajes
CREATE TABLE personajes (
  id          SERIAL       PRIMARY KEY,
  capitulo_id INTEGER      NOT NULL REFERENCES capitulos(id) ON DELETE CASCADE,
  nombre      VARCHAR(40)  NOT NULL,
  descripcion VARCHAR(200),
  atributos   VARCHAR(200)
);

-- 5. simulaciones (max una por capítulo)
CREATE TABLE simulaciones (
  id           SERIAL       PRIMARY KEY,
  capitulo_id  INTEGER      NOT NULL UNIQUE REFERENCES capitulos(id) ON DELETE CASCADE,
  personaje_id INTEGER      REFERENCES personajes(id) ON DELETE SET NULL, 
  contexto     TEXT         NOT NULL,
  pregunta     VARCHAR(200) NOT NULL
);

CREATE TABLE opciones_simulacion (
  id            SERIAL       PRIMARY KEY,
  simulacion_id INTEGER      NOT NULL REFERENCES simulaciones(id) ON DELETE CASCADE,
  texto         VARCHAR(100) NOT NULL,
  descripcion   VARCHAR(200),
  consecuencia  TEXT         NOT NULL,
  UNIQUE (id, simulacion_id)                           
);

-- 7. recursos multimedia
CREATE TABLE recursos (
  id                SERIAL       PRIMARY KEY,
  capitulo_id       INTEGER      NOT NULL REFERENCES capitulos(id) ON DELETE CASCADE,
  tipo              VARCHAR(5)   NOT NULL CHECK (tipo IN ('video', 'audio')),
  titulo            VARCHAR(100) NOT NULL,
  descripcion       VARCHAR(300),
  url               VARCHAR(500),
  duracion_segundos INTEGER      CHECK (duracion_segundos > 0)
);

-- 8. progreso de cada paciente por capítulo
CREATE TABLE progreso_capitulos (
  usuario_id     INTEGER   NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  capitulo_id    INTEGER   NOT NULL REFERENCES capitulos(id) ON DELETE CASCADE,
  completado     BOOLEAN   NOT NULL DEFAULT FALSE,
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, capitulo_id)                
);

-- 9. decisiones tomadas
CREATE TABLE decisiones (
  usuario_id    INTEGER   NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  simulacion_id INTEGER   NOT NULL REFERENCES simulaciones(id) ON DELETE CASCADE,
  opcion_id     INTEGER   NOT NULL,
  decidido_en   TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, simulacion_id),             
  FOREIGN KEY (opcion_id, simulacion_id) REFERENCES opciones_simulacion(id, simulacion_id) ON DELETE CASCADE
);

-- Datos de prueba (los mismos de la EP1)
-- Contraseñas: Paciente123 y Admin12345

-- Usuarios
INSERT INTO usuarios (id, alias, email, password_hash, rol) VALUES
  (1, 'elena_r',      'paciente@demo.cl', '$2b$10$OB4XGKqVsLMBvO6/ErNG6O2mQiXmV4AvcZGKT3VJyvq499g3s4WI2', 'patient'),
  (2, 'martin_admin', 'admin@demo.cl',    '$2b$10$hzXGIlJUf8en4ONoOEjsFulgadSB/ozyH02XHy4CxvR1Nv4mN/oPK', 'admin');

-- Libros
INSERT INTO libros (id, titulo, sinopsis, color_portada) VALUES
  (1, 'El misterio de Valparaíso', 'Ana recorre los cerros de Valparaíso siguiendo pistas que alguien dejó para ella. Cada decisión la acerca a descubrir quién está detrás del misterio y a reencontrarse consigo misma.', '#5B4A8B'),
  (2, 'Un jardín para Tomás', 'Tomás hereda un jardín abandonado. Mientras decide qué sembrar, aprende a pedir ayuda y a cuidar su propio ritmo.', '#3F6E55'),
  (3, 'Respira, Clara', 'Clara practica pequeñas pausas durante un día agitado. Una historia breve para acompañar los momentos de espera.', '#3A6EA5');

-- Capítulos
INSERT INTO capitulos (id, libro_id, numero, titulo, contenido) VALUES
  (1,  1, 1, 'El comienzo de la historia', 'Ana caminaba por las calles del cerro Alegre cuando comenzó a notar algo extraño en el lugar. En cada escalera había un pequeño dibujo de un faro, pintado con tiza azul, siempre apuntando hacia el mar. Se detuvo a respirar, miró el puerto y decidió seguir los dibujos para descubrir qué estaba ocurriendo.'),
  (2,  1, 2, 'La carta en el ascensor', 'Los dibujos terminaban en el ascensor Reina Victoria. Dentro, alguien había dejado un sobre con su nombre. "Si llegaste hasta aquí, estás lista para la siguiente pista", decía la carta. Ana sintió una mezcla de curiosidad y nervios. Tenía que decidir cómo seguir.'),
  (3,  1, 3, 'La casa de los faros', 'La pista la llevó a una casa antigua con la fachada llena de faros pintados. La puerta estaba entreabierta y desde adentro se escuchaba música suave. Ana recordó que no tenía que resolverlo todo de una vez: podía avanzar paso a paso.'),
  (4,  1, 4, 'Pedro, el guardián', 'En la casa la esperaba Pedro, un pintor que conocía a su abuela desde hacía muchos años. Le contó que su abuela había preparado este recorrido para recordarle los lugares que más amaba. Ana escuchó en silencio y, por primera vez en semanas, se sintió acompañada.'),
  (5,  1, 5, 'El último faro', 'La última pista estaba en el mirador Paseo 21 de Mayo, frente al mar. Allí encontró una caja con fotografías y una nota: "Cada paso que diste hoy también es parte del camino". Ana decidió qué hacer con aquel regalo.'),
  (6,  2, 1, 'La llave oxidada', 'Tomás abrió la reja del jardín con una llave oxidada que encontró en un cajón. Las malezas cubrían casi todo, pero entre ellas asomaba un rosal que seguía floreciendo.'),
  (7,  2, 2, 'Pedir ayuda', 'Después de una hora de trabajo, Tomás se sentó en la tierra, cansado. Su vecina lo saludó desde la reja y le ofreció una pala y un poco de compañía.'),
  (8,  2, 3, 'Lo que crece despacio', 'Semanas después, las primeras semillas asomaron entre la tierra. Tomás entendió que algunas cosas crecen despacio y que eso también está bien.'),
  (9,  3, 1, 'La sala de espera', 'Clara miraba el reloj de la sala de espera. Los minutos parecían más largos que nunca. Recordó un ejercicio simple: contar cuatro al inhalar y seis al exhalar.'),
  (10, 3, 2, 'Una ventana', 'Desde la ventana se veía un árbol moviéndose con el viento. Clara se concentró en sus hojas y notó que sus hombros se relajaban.'),
  (11, 3, 3, 'La elección de Clara', 'Al final de la tarde, Clara pensó en cómo quería terminar su día.');

-- Personajes
INSERT INTO personajes (id, capitulo_id, nombre, descripcion, atributos) VALUES
  (1, 2,  'Ana',   'Profesora curiosa que vuelve a Valparaíso.', 'Curiosa, reflexiva'),
  (2, 4,  'Pedro', 'Pintor y amigo de la abuela de Ana.',        'Paciente, cálido'),
  (3, 7,  'Tomás', 'Heredero de un jardín abandonado.',          'Perseverante, tímido'),
  (4, 11, 'Clara', 'Paciente que aprende a hacer pausas.',       'Serena, observadora');

-- Simulaciones (una por capítulo que termina en decisión)
INSERT INTO simulaciones (id, capitulo_id, personaje_id, contexto, pregunta) VALUES
  (1, 2,  1, 'Ana tiene la carta en sus manos. El ascensor está por subir y alguien la mira desde la plaza.', '¿Qué decides hacer?'),
  (2, 3,  1, 'La puerta de la casa está entreabierta y se escucha música.',                                   '¿Qué decides hacer?'),
  (3, 5,  1, 'Ana tiene la caja de fotografías entre sus manos, frente al mar.',                              '¿Qué harás con el regalo?'),
  (4, 7,  3, 'La vecina ofrece su ayuda y Tomás está cansado.',                                               '¿Qué responde Tomás?'),
  (5, 11, 4, 'El día terminó y Clara tiene un rato libre.',                                                   '¿Cómo termina Clara su día?');

-- Opciones de cada simulación
INSERT INTO opciones_simulacion (id, simulacion_id, texto, descripcion, consecuencia) VALUES
  (1,  1, 'Subir en el ascensor',              'Seguir la pista de inmediato.',       'Ana sube y desde lo alto ve un faro pintado en una casa cercana.'),
  (2,  1, 'Hablar con la persona de la plaza', 'Preguntar si sabe algo de la carta.', 'La persona sonríe y le indica el camino hacia una casa llena de faros.'),
  (3,  2, 'Entrar al lugar',                   'Tocar la puerta y pasar.',            'Al entrar, Ana encuentra un taller de pintura lleno de luz.'),
  (4,  2, 'Continuar el camino',               'Observar un momento desde afuera.',   'Ana se sienta en la escalera; al rato, alguien sale a invitarla a pasar.'),
  (5,  3, 'Compartirlo',                       'Llamar a su familia y contarles.',    'La conversación termina en risas y planes para volver juntos a Valparaíso.'),
  (6,  3, 'Guardarlo para sí',                 'Quedarse un rato mirando las fotos.', 'Ana se toma su tiempo. Siente que el recuerdo ahora también le pertenece.'),
  (7,  4, 'Aceptar la ayuda',                  'Trabajar juntos una tarde.',          'Entre los dos limpian medio jardín y comparten un té.'),
  (8,  4, 'Descansar hoy',                     'Agradecer y seguir mañana.',          'Tomás descansa. Al día siguiente vuelve con más energía.'),
  (9,  5, 'Escuchar música',                   'Su lista favorita, con audífonos.',   'Clara se duerme tranquila con su canción preferida.'),
  (10, 5, 'Escribir tres cosas buenas',        'Un pequeño diario de gratitud.',      'Clara descubre que el día tuvo más momentos buenos de los que creía.');

-- Recursos multimedia
INSERT INTO recursos (id, capitulo_id, tipo, titulo, descripcion, duracion_segundos) VALUES
  (1, 1, 'video', 'Paseo por los cerros', 'Recorrido visual por las escaleras del cerro Alegre.',            84),
  (2, 3, 'audio', 'Respiración guiada',   'Ejercicio de respiración de 3 minutos para antes de continuar.', 180),
  (3, 3, 'video', 'La casa de los faros', 'Ilustraciones animadas del capítulo.',                            95),
  (4, 9, 'audio', 'Respirar 4-6',         'Audio para practicar la respiración que usa Clara.',             120);

-- Progreso del paciente de prueba: completó los capítulos 1 y 2 y dejó abierto el 3
INSERT INTO progreso_capitulos (usuario_id, capitulo_id, completado, actualizado_en) VALUES
  (1, 1, TRUE,  NOW() - INTERVAL '2 days'),
  (1, 2, TRUE,  NOW() - INTERVAL '1 day'),
  (1, 3, FALSE, NOW());

-- Decisión que ya tomó en la simulación del capítulo 2
INSERT INTO decisiones (usuario_id, simulacion_id, opcion_id) VALUES
  (1, 1, 1);

SELECT setval('usuarios_id_seq',     (SELECT MAX(id) FROM usuarios));
SELECT setval('libros_id_seq',       (SELECT MAX(id) FROM libros));
SELECT setval('capitulos_id_seq',    (SELECT MAX(id) FROM capitulos));
SELECT setval('personajes_id_seq',   (SELECT MAX(id) FROM personajes));
SELECT setval('simulaciones_id_seq', (SELECT MAX(id) FROM simulaciones));
SELECT setval('opciones_simulacion_id_seq', (SELECT MAX(id) FROM opciones_simulacion));
SELECT setval('recursos_id_seq',     (SELECT MAX(id) FROM recursos));
