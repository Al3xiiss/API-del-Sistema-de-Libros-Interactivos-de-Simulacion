// Servicio de personajes: consultas a la tabla personajes.
// Todas las consultas usan parámetros ($1, $2...) para evitar inyección SQL.
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { traducirErrorPg } from '../utils/pgErrors.js';

const MENSAJES = {
  personajes_capitulo_id_fkey: 'El capítulo indicado no existe',
};

// Datos del personaje + capítulo y libro al que pertenece
const CONSULTA = `
  SELECT p.id, p.capitulo_id, c.numero AS capitulo_numero, c.titulo AS capitulo_titulo,
         c.libro_id, l.titulo AS libro_titulo,
         p.nombre, p.descripcion, p.atributos
  FROM personajes p
  JOIN capitulos c ON c.id = p.capitulo_id
  JOIN libros l ON l.id = c.libro_id`;

// Filtros opcionales: por capítulo o por libro
export async function listar({ capitulo_id, libro_id } = {}) {
  const { rows } = await pool.query(
    `${CONSULTA}
     WHERE ($1::int IS NULL OR p.capitulo_id = $1)
       AND ($2::int IS NULL OR c.libro_id = $2)
     ORDER BY c.libro_id, c.numero, p.id`,
    [capitulo_id ?? null, libro_id ?? null],
  );
  return rows;
}

export async function obtener(id) {
  const { rows } = await pool.query(`${CONSULTA} WHERE p.id = $1`, [id]);
  if (!rows[0]) {
    throw new HttpError(404, 'Personaje no encontrado');
  }
  return rows[0];
}

export async function crear({ capitulo_id, nombre, descripcion, atributos }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO personajes (capitulo_id, nombre, descripcion, atributos)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [capitulo_id, nombre, descripcion ?? null, atributos ?? null],
    );
    return obtener(rows[0].id);
  } catch (err) {
    throw traducirErrorPg(err, MENSAJES);
  }
}

export async function actualizar(id, { capitulo_id, nombre, descripcion, atributos }) {
  try {
    const { rowCount } = await pool.query(
      `UPDATE personajes
       SET capitulo_id = $1, nombre = $2, descripcion = $3, atributos = $4
       WHERE id = $5`,
      [capitulo_id, nombre, descripcion ?? null, atributos ?? null, id],
    );
    if (rowCount === 0) {
      throw new HttpError(404, 'Personaje no encontrado');
    }
  } catch (err) {
    throw traducirErrorPg(err, MENSAJES);
  }
  return obtener(id);
}

// Si el personaje aparecía en una simulación, la simulación queda sin personaje (ON DELETE SET NULL)
export async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM personajes WHERE id = $1', [id]);
  if (rowCount === 0) {
    throw new HttpError(404, 'Personaje no encontrado');
  }
}
