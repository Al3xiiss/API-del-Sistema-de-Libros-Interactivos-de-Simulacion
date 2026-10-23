// Servicio de progreso del paciente (capítulos abiertos y completados).
// El id del usuario siempre viene del token, nunca del cuerpo de la petición:
// así cada paciente solo puede ver y modificar su propio progreso.
import { pool } from '../config/db.js';
import { HttpError } from '../utils/httpError.js';
import { enTransaccion } from '../utils/transaccion.js';

// Progreso agrupado por libro: capítulos completados, último capítulo abierto y decisiones tomadas
export async function obtenerMiProgreso(usuarioId) {
  const { rows } = await pool.query(
    `SELECT l.id AS libro_id, l.titulo,
            (SELECT COUNT(*) FROM capitulos c2 WHERE c2.libro_id = l.id)::int AS total_capitulos,
            COALESCE(ARRAY_AGG(p.capitulo_id ORDER BY c.numero) FILTER (WHERE p.completado), '{}') AS capitulos_completados,
            (ARRAY_AGG(p.capitulo_id ORDER BY p.actualizado_en DESC))[1] AS ultimo_capitulo_id,
            COALESCE((SELECT JSON_OBJECT_AGG(d.simulacion_id, d.opcion_id)
                      FROM decisiones d
                      JOIN simulaciones s ON s.id = d.simulacion_id
                      JOIN capitulos c3 ON c3.id = s.capitulo_id
                      WHERE d.usuario_id = $1 AND c3.libro_id = l.id), '{}'::json) AS decisiones,
            MAX(p.actualizado_en) AS actualizado_en
     FROM progreso_capitulos p
     JOIN capitulos c ON c.id = p.capitulo_id
     JOIN libros l ON l.id = c.libro_id
     WHERE p.usuario_id = $1
     GROUP BY l.id
     ORDER BY MAX(p.actualizado_en) DESC`,
    [usuarioId],
  );

  const libros = rows.map((libro) => ({
    ...libro,
    porcentaje: libro.total_capitulos === 0
      ? 0
      : Math.round((libro.capitulos_completados.length / libro.total_capitulos) * 100),
  }));

  return {
    resumen: {
      libros_iniciados: libros.length,
      capitulos_completados: libros.reduce((total, l) => total + l.capitulos_completados.length, 0),
      decisiones_tomadas: libros.reduce((total, l) => total + Object.keys(l.decisiones).length, 0),
    },
    libros,
  };
}

// Registra que el paciente abrió un capítulo o lo completó.
// Si ya existía el registro, lo actualiza (INSERT ... ON CONFLICT = "upsert").
// Si no se envía "completado", se mantiene el valor anterior (abrir de nuevo no borra lo completado).
export async function actualizarCapitulo(usuarioId, capituloId, completado) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO progreso_capitulos (usuario_id, capitulo_id, completado)
       VALUES ($1, $2, COALESCE($3::boolean, FALSE))
       ON CONFLICT (usuario_id, capitulo_id)
       DO UPDATE SET completado = COALESCE($3::boolean, progreso_capitulos.completado),
                     actualizado_en = NOW()
       RETURNING capitulo_id, completado, actualizado_en`,
      [usuarioId, capituloId, completado ?? null],
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23503') {
      throw new HttpError(404, 'Capítulo no encontrado');
    }
    throw err;
  }
}

// Reinicia el avance del paciente en un libro: borra su progreso y sus decisiones en ese libro
export async function reiniciarLibro(usuarioId, libroId) {
  await enTransaccion(async (cliente) => {
    await cliente.query(
      `DELETE FROM decisiones d
       USING simulaciones s, capitulos c
       WHERE d.simulacion_id = s.id AND s.capitulo_id = c.id
         AND d.usuario_id = $1 AND c.libro_id = $2`,
      [usuarioId, libroId],
    );
    await cliente.query(
      `DELETE FROM progreso_capitulos p
       USING capitulos c
       WHERE p.capitulo_id = c.id AND p.usuario_id = $1 AND c.libro_id = $2`,
      [usuarioId, libroId],
    );
  });
}
