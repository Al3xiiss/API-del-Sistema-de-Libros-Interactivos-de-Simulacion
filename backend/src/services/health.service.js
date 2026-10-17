import { pool } from '../config/db.js';

export async function checkDatabase() {
  const { rows } = await pool.query('SELECT NOW() AS hora, (SELECT COUNT(*) FROM libros)::int AS libros');
  return rows[0];
}