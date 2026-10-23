// Servicio de capítulos: consultas a la tabla capitulos.
// Todas las consultas usan parámetros ($1, $2...) para evitar inyección SQL.
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { traducirErrorPg } from '../utils/pgErrors.js';

// Mensajes según la restricción de la tabla que no se cumplió
const MENSAJES = {
  capitulos_libro_id_fkey: 'El libro indicado no existe',
  capitulos_libro_id_numero_key: 'Ese libro ya tiene un capítulo con ese número',
};

// Datos del capítulo + título del libro, id de su simulación (si tiene) y cantidad de recursos
const COLUMNAS = `
  c.id, c.libro_id, l.titulo AS libro_titulo, c.numero, c.titulo,
  s.id AS simulacion_id,
  (SELECT COUNT(*) FROM recursos r WHERE r.capitulo_id = c.id)::int AS total_recursos`;

const TABLAS = `
  FROM capitulos c
  JOIN libros l ON l.id = c.libro_id
  LEFT JOIN simulaciones s ON s.capitulo_id = c.id`;

// Lista sin el contenido (más liviana). Si llega libro_id, solo los de ese libro.
export async function listar({ libro_id } = {}) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} ${TABLAS}
     WHERE ($1::int IS NULL OR c.libro_id = $1)
     ORDER BY c.libro_id, c.numero`,
    [libro_id ?? null],
  );
  return rows;
}

// Un capítulo con su contenido completo
export async function obtener(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNAS}, c.contenido ${TABLAS} WHERE c.id = $1`, [id]);
  if (!rows[0]) {
    throw new HttpError(404, 'Capítulo no encontrado');
  }
  return rows[0];
}

// Si no se envía numero, se usa el siguiente disponible en el libro
export async function crear({ libro_id, numero, titulo, contenido }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO capitulos (libro_id, numero, titulo, contenido)
       VALUES ($1, COALESCE($2::int, (SELECT COALESCE(MAX(numero), 0) + 1 FROM capitulos WHERE libro_id = $1)), $3, $4)
       RETURNING id`,
      [libro_id, numero ?? null, titulo, contenido],
    );
    return obtener(rows[0].id);
  } catch (err) {
    throw traducirErrorPg(err, MENSAJES);
  }
}

// Si no se envía numero, se mantiene el que tenía
export async function actualizar(id, { libro_id, numero, titulo, contenido }) {
  try {
    const { rowCount } = await pool.query(
      `UPDATE capitulos
       SET libro_id = $1, numero = COALESCE($2::int, numero), titulo = $3, contenido = $4
       WHERE id = $5`,
      [libro_id, numero ?? null, titulo, contenido, id],
    );
    if (rowCount === 0) {
      throw new HttpError(404, 'Capítulo no encontrado');
    }
  } catch (err) {
    throw traducirErrorPg(err, MENSAJES);
  }
  return obtener(id);
}

// Al borrar un capítulo se borran también sus personajes, simulación, recursos y progreso (ON DELETE CASCADE)
export async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM capitulos WHERE id = $1', [id]);
  if (rowCount === 0) {
    throw new HttpError(404, 'Capítulo no encontrado');
  }
}
