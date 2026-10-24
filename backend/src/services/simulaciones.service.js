// Servicio de simulaciones y sus opciones de decisión.
// Todas las consultas usan parámetros ($1, $2...) para evitar inyección SQL.
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { traducirErrorPg } from '../utils/pgErrors.js';
import { enTransaccion } from '../utils/transaccion.js';

const MIN_OPCIONES = 2;
const MAX_OPCIONES = 4;

const MENSAJES = {
  simulaciones_capitulo_id_fkey: 'El capítulo indicado no existe',
  simulaciones_capitulo_id_key: 'Ese capítulo ya tiene una simulación',
  simulaciones_personaje_id_fkey: 'El personaje indicado no existe',
};

// Datos de la simulación + capítulo y personaje
const CONSULTA = `
  SELECT s.id, s.capitulo_id, c.numero AS capitulo_numero, c.titulo AS capitulo_titulo, c.libro_id,
         s.personaje_id, p.nombre AS personaje_nombre, p.descripcion AS personaje_descripcion,
         s.contexto, s.pregunta
  FROM simulaciones s
  JOIN capitulos c ON c.id = s.capitulo_id
  LEFT JOIN personajes p ON p.id = s.personaje_id`;

// ---------- Simulaciones ----------

// Lista sin las opciones, con cuántas tiene cada una. Filtros opcionales: capítulo o libro.
export async function listar({ capitulo_id, libro_id } = {}) {
  const { rows } = await pool.query(
    `SELECT q.*, (SELECT COUNT(*) FROM opciones_simulacion o WHERE o.simulacion_id = q.id)::int AS total_opciones
     FROM (${CONSULTA}
           WHERE ($1::int IS NULL OR s.capitulo_id = $1)
             AND ($2::int IS NULL OR c.libro_id = $2)) q
     ORDER BY q.libro_id, q.capitulo_numero`,
    [capitulo_id ?? null, libro_id ?? null],
  );
  return rows;
}

// Una simulación con su lista de opciones
export async function obtener(id) {
  const { rows } = await pool.query(`${CONSULTA} WHERE s.id = $1`, [id]);
  if (!rows[0]) {
    throw new HttpError(404, 'Simulación no encontrada');
  }
  const opciones = await pool.query(
    `SELECT id, texto, descripcion, consecuencia
     FROM opciones_simulacion
     WHERE simulacion_id = $1
     ORDER BY id`,
    [id],
  );
  return { ...rows[0], opciones: opciones.rows };
}

// Crea la simulación y sus opciones en una transacción:
// si alguna opción falla, no queda una simulación a medias.
export async function crear({ capitulo_id, personaje_id, contexto, pregunta, opciones }) {
  let id;
  try {
    id = await enTransaccion(async (cliente) => {
      const { rows } = await cliente.query(
        `INSERT INTO simulaciones (capitulo_id, personaje_id, contexto, pregunta)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [capitulo_id, personaje_id ?? null, contexto, pregunta],
      );
      for (const opcion of opciones) {
        await cliente.query(
          `INSERT INTO opciones_simulacion (simulacion_id, texto, descripcion, consecuencia)
           VALUES ($1, $2, $3, $4)`,
          [rows[0].id, opcion.texto, opcion.descripcion ?? null, opcion.consecuencia],
        );
      }
      return rows[0].id;
    });
  } catch (err) {
    throw traducirErrorPg(err, MENSAJES);
  }
  return obtener(id);
}

// Edita los datos de la simulación (no sus opciones).
// Si no se envía capitulo_id o personaje_id, se mantienen los que tenía.
export async function actualizar(id, { capitulo_id, personaje_id, contexto, pregunta }) {
  try {
    const { rowCount } = await pool.query(
      `UPDATE simulaciones
       SET capitulo_id = COALESCE($1::int, capitulo_id),
           personaje_id = COALESCE($2::int, personaje_id),
           contexto = $3,
           pregunta = $4
       WHERE id = $5`,
      [capitulo_id ?? null, personaje_id ?? null, contexto, pregunta, id],
    );
    if (rowCount === 0) {
      throw new HttpError(404, 'Simulación no encontrada');
    }
  } catch (err) {
    throw traducirErrorPg(err, MENSAJES);
  }
  return obtener(id);
}

// Borra la simulación, sus opciones y las decisiones tomadas en ella (ON DELETE CASCADE)
export async function eliminar(id) {
  const { rowCount } = await pool.query('DELETE FROM simulaciones WHERE id = $1', [id]);
  if (rowCount === 0) {
    throw new HttpError(404, 'Simulación no encontrada');
  }
}

// ---------- Opciones de una simulación ----------

async function contarOpciones(simulacionId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM opciones_simulacion WHERE simulacion_id = $1',
    [simulacionId],
  );
  return rows[0].total;
}

export async function crearOpcion(simulacionId, { texto, descripcion, consecuencia }) {
  await obtener(simulacionId); // 404 si la simulación no existe
  if ((await contarOpciones(simulacionId)) >= MAX_OPCIONES) {
    throw new HttpError(409, `Una simulación puede tener como máximo ${MAX_OPCIONES} opciones`);
  }
  const { rows } = await pool.query(
    `INSERT INTO opciones_simulacion (simulacion_id, texto, descripcion, consecuencia)
     VALUES ($1, $2, $3, $4)
     RETURNING id, simulacion_id, texto, descripcion, consecuencia`,
    [simulacionId, texto, descripcion ?? null, consecuencia],
  );
  return rows[0];
}

// La opción debe pertenecer a la simulación indicada en la URL
export async function actualizarOpcion(simulacionId, opcionId, { texto, descripcion, consecuencia }) {
  const { rows } = await pool.query(
    `UPDATE opciones_simulacion
     SET texto = $1, descripcion = $2, consecuencia = $3
     WHERE id = $4 AND simulacion_id = $5
     RETURNING id, simulacion_id, texto, descripcion, consecuencia`,
    [texto, descripcion ?? null, consecuencia, opcionId, simulacionId],
  );
  if (!rows[0]) {
    throw new HttpError(404, 'Opción no encontrada en esta simulación');
  }
  return rows[0];
}

// No se permite dejar una simulación con menos de 2 opciones
export async function eliminarOpcion(simulacionId, opcionId) {
  const { rows } = await pool.query(
    'SELECT id FROM opciones_simulacion WHERE id = $1 AND simulacion_id = $2',
    [opcionId, simulacionId],
  );
  if (!rows[0]) {
    throw new HttpError(404, 'Opción no encontrada en esta simulación');
  }
  if ((await contarOpciones(simulacionId)) <= MIN_OPCIONES) {
    throw new HttpError(409, `Una simulación debe tener al menos ${MIN_OPCIONES} opciones`);
  }
  await pool.query('DELETE FROM opciones_simulacion WHERE id = $1', [opcionId]);
}
