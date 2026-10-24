// Servicio de decisiones: la opción que eligió el paciente en cada simulación.
// El id del usuario siempre viene del token: cada paciente solo ve y cambia sus propias decisiones.
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { traducirErrorPg } from '../utils/pgErrors.js';

const MENSAJES = {
  // La tabla exige que la opción pertenezca a la simulación (clave foránea compuesta)
  decisiones_opcion_id_simulacion_id_fkey: 'La opción elegida no pertenece a esta simulación',
};

// Decisiones del paciente con la pregunta, la opción elegida y su consecuencia
export async function listarMisDecisiones(usuarioId) {
  const { rows } = await pool.query(
    `SELECT d.simulacion_id, s.pregunta,
            c.id AS capitulo_id, c.numero AS capitulo_numero, c.libro_id, l.titulo AS libro_titulo,
            d.opcion_id, o.texto AS opcion_texto, o.consecuencia, d.decidido_en
     FROM decisiones d
     JOIN simulaciones s ON s.id = d.simulacion_id
     JOIN capitulos c ON c.id = s.capitulo_id
     JOIN libros l ON l.id = c.libro_id
     JOIN opciones_simulacion o ON o.id = d.opcion_id
     WHERE d.usuario_id = $1
     ORDER BY d.decidido_en DESC`,
    [usuarioId],
  );
  return rows;
}

// Guarda la decisión. Si el paciente ya había decidido en esa simulación, la reemplaza.
export async function guardar(usuarioId, simulacionId, opcionId) {
  const simulacion = await pool.query('SELECT id FROM simulaciones WHERE id = $1', [simulacionId]);
  if (!simulacion.rows[0]) {
    throw new HttpError(404, 'Simulación no encontrada');
  }

  try {
    await pool.query(
      `INSERT INTO decisiones (usuario_id, simulacion_id, opcion_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario_id, simulacion_id)
       DO UPDATE SET opcion_id = EXCLUDED.opcion_id, decidido_en = NOW()`,
      [usuarioId, simulacionId, opcionId],
    );
  } catch (err) {
    throw traducirErrorPg(err, MENSAJES);
  }

  // Devuelve la decisión con la consecuencia que se muestra al paciente
  const { rows } = await pool.query(
    `SELECT d.simulacion_id, d.opcion_id, o.texto AS opcion_texto, o.consecuencia, d.decidido_en
     FROM decisiones d
     JOIN opciones_simulacion o ON o.id = d.opcion_id
     WHERE d.usuario_id = $1 AND d.simulacion_id = $2`,
    [usuarioId, simulacionId],
  );
  return rows[0];
}

export async function eliminar(usuarioId, simulacionId) {
  const { rowCount } = await pool.query(
    'DELETE FROM decisiones WHERE usuario_id = $1 AND simulacion_id = $2',
    [usuarioId, simulacionId],
  );
  if (rowCount === 0) {
    throw new HttpError(404, 'No has tomado una decisión en esta simulación');
  }
}
