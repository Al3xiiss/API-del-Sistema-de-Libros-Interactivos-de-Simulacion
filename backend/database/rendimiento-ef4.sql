-- Medición de los índices de la EF4 con EXPLAIN ANALYZE
--
-- Carga muchos datos de prueba, mide las consultas que usa la API sin los índices de la EF4 ("antes")
-- y con ellos ("después"), y muestra una tabla comparativa.
-- Todo ocurre dentro de una transacción que se deshace al final (ROLLBACK):
-- los datos de prueba no quedan guardados y los índices quedan como estaban.
--
-- Ejecutar con psql (no con pgAdmin, que solo muestra el resultado de la última instrucción).
-- Con Docker, desde la raíz del repositorio (PowerShell):
--   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
--   docker compose cp backend/database/rendimiento-ef4.sql db:/tmp/rendimiento-ef4.sql
--   docker compose exec db psql -U postgres -d libros_interactivos -f /tmp/rendimiento-ef4.sql
-- Tarda menos de un minuto.

\set ON_ERROR_STOP on
\set QUIET on
\pset footer off

BEGIN;
SET LOCAL jit = off;                          -- sin compilación JIT, para comparar solo el plan de cada consulta
SET LOCAL max_parallel_workers_per_gather = 0;  -- sin procesos paralelos, igual que en un servidor pequeño

-- 1. "Antes": se quitan los índices de la EF4 (solo dentro de esta transacción)
DROP INDEX IF EXISTS idx_opciones_simulacion, idx_recursos_capitulo, idx_personajes_capitulo,
  idx_simulaciones_personaje, idx_progreso_capitulo, idx_decisiones_simulacion, idx_decisiones_opcion;

-- Los contadores de id (secuencias) no se deshacen con ROLLBACK: se guardan para dejarlos como estaban al final.
-- Sin esto, los registros que se creen después en la app tendrían ids muy altos (por ejemplo 180007).
CREATE TEMP TABLE secuencias (nombre text, valor bigint, usado boolean);
INSERT INTO secuencias
SELECT 'libros_id_seq', last_value, is_called FROM libros_id_seq UNION ALL
SELECT 'capitulos_id_seq', last_value, is_called FROM capitulos_id_seq UNION ALL
SELECT 'personajes_id_seq', last_value, is_called FROM personajes_id_seq UNION ALL
SELECT 'simulaciones_id_seq', last_value, is_called FROM simulaciones_id_seq UNION ALL
SELECT 'opciones_simulacion_id_seq', last_value, is_called FROM opciones_simulacion_id_seq UNION ALL
SELECT 'recursos_id_seq', last_value, is_called FROM recursos_id_seq UNION ALL
SELECT 'usuarios_id_seq', last_value, is_called FROM usuarios_id_seq;

-- 2. Datos de prueba: 200 libros de 100 capítulos, cada capítulo con un personaje, una simulación
--    de 4 opciones y 3 recursos; 2.000 pacientes que completaron 50 capítulos y tomaron sus decisiones.
\echo 'Cargando datos de prueba...'
CREATE TEMP TABLE prueba_libros AS
WITH nuevos AS (
  INSERT INTO libros (titulo, sinopsis)
  SELECT 'Libro de prueba ' || n, 'Datos generados para medir las consultas.'
  FROM generate_series(1, 200) AS n
  RETURNING id
)
SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS orden FROM nuevos;

INSERT INTO capitulos (libro_id, numero, titulo, contenido)
SELECT l.id, n, 'Capítulo ' || n, 'Contenido de prueba.'
FROM prueba_libros l CROSS JOIN generate_series(1, 100) AS n;

INSERT INTO personajes (capitulo_id, nombre)
SELECT c.id, 'Personaje ' || c.id
FROM capitulos c JOIN prueba_libros l ON l.id = c.libro_id;

INSERT INTO simulaciones (capitulo_id, personaje_id, contexto, pregunta)
SELECT p.capitulo_id, p.id, 'Contexto de prueba.', '¿Qué decides?'
FROM personajes p JOIN capitulos c ON c.id = p.capitulo_id JOIN prueba_libros l ON l.id = c.libro_id;

INSERT INTO opciones_simulacion (simulacion_id, texto, consecuencia)
SELECT s.id, 'Opción ' || k, 'Consecuencia de prueba.'
FROM simulaciones s JOIN capitulos c ON c.id = s.capitulo_id JOIN prueba_libros l ON l.id = c.libro_id
CROSS JOIN generate_series(1, 4) AS k;

INSERT INTO recursos (capitulo_id, tipo, titulo, duracion_segundos)
SELECT c.id, CASE WHEN k = 1 THEN 'audio' ELSE 'video' END, 'Recurso ' || k, 60 * k
FROM capitulos c JOIN prueba_libros l ON l.id = c.libro_id
CROSS JOIN generate_series(1, 3) AS k;

CREATE TEMP TABLE prueba_usuarios AS
WITH nuevos AS (
  INSERT INTO usuarios (alias, email, password_hash)
  SELECT 'prueba_' || n, 'prueba' || n || '@demo.cl', 'sin-contrasena'
  FROM generate_series(1, 2000) AS n
  RETURNING id
)
SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS orden FROM nuevos;

-- Cada paciente completó los capítulos 1 a 50 de uno de los libros
INSERT INTO progreso_capitulos (usuario_id, capitulo_id, completado)
SELECT u.id, c.id, TRUE
FROM prueba_usuarios u
JOIN prueba_libros l ON l.orden = (u.orden - 1) % 200 + 1
JOIN capitulos c ON c.libro_id = l.id AND c.numero <= 50;

-- ...y eligió la primera opción en cada una de esas simulaciones
INSERT INTO decisiones (usuario_id, simulacion_id, opcion_id)
SELECT p.usuario_id, s.id, (SELECT MIN(o.id) FROM opciones_simulacion o WHERE o.simulacion_id = s.id)
FROM progreso_capitulos p
JOIN prueba_usuarios u ON u.id = p.usuario_id
JOIN simulaciones s ON s.capitulo_id = p.capitulo_id;

ANALYZE libros, capitulos, personajes, simulaciones, opciones_simulacion, recursos,
  usuarios, progreso_capitulos, decisiones;

\echo 'Filas en las tablas principales:'
SELECT
  (SELECT COUNT(*) FROM capitulos)           AS capitulos,
  (SELECT COUNT(*) FROM opciones_simulacion) AS opciones,
  (SELECT COUNT(*) FROM recursos)            AS recursos,
  (SELECT COUNT(*) FROM progreso_capitulos)  AS progreso,
  (SELECT COUNT(*) FROM decisiones)          AS decisiones;

-- 3. Consultas que se miden: las mismas que usa la API (backend/src/services/), con un id real.
--    {id} se reemplaza por el resultado de "elegir", que se vuelve a calcular en cada repetición.
CREATE TEMP TABLE consultas (orden int, nombre text, tabla text, elegir text, consulta text);
INSERT INTO consultas VALUES
(1, 'Opciones de una simulación', 'opciones_simulacion',
 'SELECT MAX(id) FROM simulaciones',
 'SELECT id, texto, descripcion, consecuencia FROM opciones_simulacion WHERE simulacion_id = {id} ORDER BY id'),
(2, 'Simulaciones de un libro y sus opciones', 'opciones_simulacion',
 'SELECT MAX(id) FROM libros',
 'SELECT q.*, (SELECT COUNT(*) FROM opciones_simulacion o WHERE o.simulacion_id = q.id)::int AS total_opciones
  FROM (SELECT s.id, s.capitulo_id, c.numero AS capitulo_numero, c.titulo AS capitulo_titulo, c.libro_id,
               s.personaje_id, p.nombre AS personaje_nombre, p.descripcion AS personaje_descripcion, s.contexto, s.pregunta
        FROM simulaciones s JOIN capitulos c ON c.id = s.capitulo_id LEFT JOIN personajes p ON p.id = s.personaje_id
        WHERE c.libro_id = {id}) q
  ORDER BY q.libro_id, q.capitulo_numero'),
(3, 'Capítulos de un libro y sus recursos', 'recursos',
 'SELECT MAX(id) FROM libros',
 'SELECT c.id, c.libro_id, l.titulo AS libro_titulo, c.numero, c.titulo, s.id AS simulacion_id,
         (SELECT COUNT(*) FROM recursos r WHERE r.capitulo_id = c.id)::int AS total_recursos
  FROM capitulos c JOIN libros l ON l.id = c.libro_id LEFT JOIN simulaciones s ON s.capitulo_id = c.id
  WHERE c.libro_id = {id} ORDER BY c.libro_id, c.numero'),
(4, 'Recursos de un capítulo', 'recursos',
 'SELECT MAX(id) FROM capitulos',
 'SELECT r.id, r.capitulo_id, c.numero AS capitulo_numero, c.titulo AS capitulo_titulo, c.libro_id,
         r.tipo, r.titulo, r.descripcion, r.url, r.duracion_segundos
  FROM recursos r JOIN capitulos c ON c.id = r.capitulo_id
  WHERE r.capitulo_id = {id} ORDER BY c.libro_id, c.numero, r.id'),
(5, 'Personajes de un capítulo', 'personajes',
 'SELECT MAX(id) FROM capitulos',
 'SELECT p.id, p.capitulo_id, c.numero AS capitulo_numero, c.titulo AS capitulo_titulo, c.libro_id,
         l.titulo AS libro_titulo, p.nombre, p.descripcion, p.atributos
  FROM personajes p JOIN capitulos c ON c.id = p.capitulo_id JOIN libros l ON l.id = c.libro_id
  WHERE p.capitulo_id = {id} ORDER BY c.libro_id, c.numero, p.id'),
(6, 'Borrar una opción ya elegida', NULL,
 'SELECT MAX(opcion_id) FROM decisiones',
 'DELETE FROM opciones_simulacion WHERE id = {id}'),
(7, 'Borrar un capítulo leído', NULL,
 'SELECT MAX(capitulo_id) FROM progreso_capitulos',
 'DELETE FROM capitulos WHERE id = {id}');

CREATE TEMP TABLE resultados (orden int, etapa text, plan text, ms numeric);

-- Ejecuta cada consulta 3 veces con EXPLAIN ANALYZE y guarda la mediana del tiempo
-- y cómo PostgreSQL leyó la tabla principal: Seq Scan recorre toda la tabla; Index Scan, Index Only Scan
-- y Bitmap Heap Scan usan el índice que aparece después del punto. Un índice cuya primera columna no es
-- la del filtro (por ejemplo opciones_simulacion_id_simulacion_id_key, que empieza por id) se tiene que leer completo.
CREATE FUNCTION pg_temp.medir(etapa text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  q consultas;
  id_elegido bigint;
  plan jsonb;
  tiempos numeric[];
  nodo jsonb;
BEGIN
  FOR q IN SELECT * FROM consultas ORDER BY orden LOOP
    tiempos := '{}';
    FOR i IN 1..3 LOOP
      EXECUTE q.elegir INTO id_elegido;
      EXECUTE 'EXPLAIN (ANALYZE, FORMAT JSON) ' || replace(q.consulta, '{id}', id_elegido::text) INTO plan;
      tiempos := tiempos || (plan->0->>'Execution Time')::numeric;
    END LOOP;
    -- Cómo se leyó la tabla principal y con qué índice (en un Bitmap Heap Scan, el índice está en el nodo hijo)
    nodo := jsonb_path_query_first(plan, '$.** ? (@."Relation Name" == $t)', jsonb_build_object('t', q.tabla));
    INSERT INTO resultados
    VALUES (q.orden, etapa,
            CASE WHEN q.tabla IS NULL THEN 'Borrado en cascada'
                 ELSE (nodo->>'Node Type') || COALESCE(' · ' || COALESCE(nodo->>'Index Name', nodo#>>'{Plans,0,Index Name}'), '') END,
            (SELECT x FROM unnest(tiempos) AS x ORDER BY x OFFSET 1 LIMIT 1));
  END LOOP;
END $$;

\echo 'Midiendo sin los índices de la EF4...'
SELECT pg_temp.medir('antes') AS listo \gset

-- 4. "Después": los mismos índices de database.sql
CREATE INDEX idx_opciones_simulacion    ON opciones_simulacion (simulacion_id);
CREATE INDEX idx_recursos_capitulo      ON recursos (capitulo_id);
CREATE INDEX idx_personajes_capitulo    ON personajes (capitulo_id);
CREATE INDEX idx_simulaciones_personaje ON simulaciones (personaje_id);
CREATE INDEX idx_progreso_capitulo      ON progreso_capitulos (capitulo_id);
CREATE INDEX idx_decisiones_simulacion  ON decisiones (simulacion_id);
CREATE INDEX idx_decisiones_opcion      ON decisiones (opcion_id, simulacion_id);
ANALYZE opciones_simulacion, recursos, personajes, simulaciones, progreso_capitulos, decisiones;

\echo 'Midiendo con los índices de la EF4...'
SELECT pg_temp.medir('despues') AS listo \gset

-- 5. Comparación
\echo ''
\echo 'Resultado (tiempo de ejecución en milisegundos, mediana de 3 mediciones):'
SELECT c.orden AS "#", c.nombre AS "Consulta",
       a.plan AS "Antes", a.ms AS "ms",
       d.plan AS "Después", d.ms AS "ms",
       ROUND(a.ms / NULLIF(d.ms, 0)) || 'x' AS "Más rápida"
FROM consultas c
JOIN resultados a ON a.orden = c.orden AND a.etapa = 'antes'
JOIN resultados d ON d.orden = c.orden AND d.etapa = 'despues'
ORDER BY c.orden;

-- Las secuencias vuelven a su valor inicial (setval sí queda guardado aunque después venga ROLLBACK)
SELECT COUNT(setval(nombre, valor, usado)) AS secuencias FROM secuencias \gset

ROLLBACK;
\echo 'Listo: se deshicieron los datos de prueba (ROLLBACK) y los contadores de id quedaron como estaban.'
