-- Sistema de Libros Interactivos de Simulación — Base de datos
-- Motor: PostgreSQL

CREATE DATABASE libros_interactivos;

-- Tablas (ejecutar conectado a la BD: libros_interactivos)

DROP TABLE IF EXISTS decisiones, progreso_capitulos, recursos, opciones,
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

