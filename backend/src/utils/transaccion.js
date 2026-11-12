// Ejecuta varias consultas como una sola unidad (transacción).
// Si alguna falla, se deshacen todas (ROLLBACK) y la base de datos queda como estaba.
import { pool } from '../config/db.js';

export async function enTransaccion(trabajo) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await trabajo(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (err) {
    await cliente.query('ROLLBACK');
    throw err;
  } finally {
    cliente.release();
  }
}
