// Servicio de recursos multimedia (videos y audios de cada capítulo).
// Todas las consultas usan parámetros ($1, $2...) para evitar inyección SQL.
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { traducirErrorPg } from '../utils/pgErrors.js';

const MENSAJES = {
  recursos_capitulo_id_fkey: 'El capítulo indicado no existe',
};

// Datos del recurso + capítulo y libro al que pertenece
const CONSULTA = `
  SELECT r.id, r.capitulo_id, c.numero AS capitulo_numero, c.titulo AS capitulo_titulo, c.libro_id,
         r.tipo, r.titulo, r.descripcion, r.url, r.duracion_segundos
  FROM recursos r
  JOIN capitulos c ON c.id = r.capitulo_id`;

// Filtros opcionales: por capítulo o por libro
export async function listar({ capitulo_id, libro_id } = {}) {
  const { rows } = await pool.query(
    `${CONSULTA}
     WHERE ($1::int IS NULL OR r.capitulo_id = $1)
       AND ($2::int IS NULL OR c.libro_id = $2)
     ORDER BY c.libro_id, c.numero, r.id`,
    [capitulo_id ?? null, libro_id ?? null],
  );
  return rows;
}

export async function obtener(id) {
  const { rows } = await pool.query(`${CONSULTA} WHERE r.id = $1`, [id]);
  if (!rows[0]) {
    throw new HttpError(404, 'Recurso no encontrado');
  }
  return rows[0];
}

export async function crear({ capitulo_id, tipo, titulo, descripcion, url, duracion_segundos }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO recursos (capitulo_id, tipo, titulo, descripcion, url, duracion_segundos)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [capitulo_id, tipo, titulo, descripcion ?? null, url ?? null, duracion_segundos ?? null],
    );
    return obtener(rows[0].id);
  } catch (err) {
    throw traducirErrorPg(err, MENSAJES);
  }
}

export async function actualizar(id, { capitulo_id, tipo, titulo, descripcion, url, duracion_segundos }) {
  try {
    const { rowCount } = await pool.query(
      `UPDATE recursos
       SET capitulo_id = $1, tipo = $2, titulo = $3, descripcion = $4, url = $5, duracion_segundos = $6
       WHERE id = $7`,
      [capitulo_id, tipo, titulo, descripcion ?? null, url ?? null, duracion_segundos ?? null, id],
    );
    if (rowCount === 0) {
      throw new HttpError(404, 'Recurso no encontrado');
    }
  } catch (err) {
    throw traducirErrorPg(err, MENSAJES);
  }
  return obtener(id);
}

export async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM recursos WHERE id = $1', [id]);
  if (rowCount === 0) {
    throw new HttpError(404, 'Recurso no encontrado');
  }
}
