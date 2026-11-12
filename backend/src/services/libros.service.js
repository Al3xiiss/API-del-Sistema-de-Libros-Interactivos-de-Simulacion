// consultas a la tabla libros
// Todas las consultas usan parámetros ($1...) para evitar inyeccion SQL

import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';

const COLOR_POR_DEFECTO = '#5B4A8B';

// Columnas que se devuelven siempre, más la cantidad de capitulos de cada libro
const COLUMNAS = `
  l.id, l.titulo, l.sinopsis, l.color_portada, l.creado_en,
  (SELECT COUNT(*) FROM capitulos c WHERE c.libro_id = l.id)::int AS total_capitulos`;

export async function listar() {
  const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM libros l ORDER BY l.id`);
  return rows;
}

export async function obtener(id) {
  const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM libros l WHERE l.id = $1`, [id]);
  if (!rows[0]) {
    throw new HttpError(404, 'Libro no encontrado');
  }
  return rows[0];
}

export async function crear({ titulo, sinopsis, color_portada }) {
  const { rows } = await pool.query(
    `INSERT INTO libros (titulo, sinopsis, color_portada)
     VALUES ($1, $2, $3)
     RETURNING id, titulo, sinopsis, color_portada, creado_en, 0 AS total_capitulos`,
    [titulo, sinopsis, color_portada ?? COLOR_POR_DEFECTO],
  );
  return rows[0];
}

// Si no se envía color_portada, se mantiene el que tenia
export async function actualizar(id, { titulo, sinopsis, color_portada }) {
  const { rowCount } = await pool.query(
    `UPDATE libros
     SET titulo = $1, sinopsis = $2, color_portada = COALESCE($3, color_portada)
     WHERE id = $4`,
    [titulo, sinopsis, color_portada ?? null, id],
  );
  if (rowCount === 0) {
    throw new HttpError(404, 'Libro no encontrado');
  }
  return obtener(id);
}

// Al borrar un libro, PostgreSQL borra también sus capítulos (ON DELETE CASCADE)
export async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM libros WHERE id = $1', [id]);
  if (rowCount === 0) {
    throw new HttpError(404, 'Libro no encontrado');
  }
}