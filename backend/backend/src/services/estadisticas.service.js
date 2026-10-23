// Servicio de estadísticas para el panel de administración.
import { pool } from '../config/db.js';

// Totales generales del sistema
export async function generales() {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM libros)::int AS libros,
       (SELECT COUNT(*) FROM capitulos)::int AS capitulos,
       (SELECT COUNT(*) FROM personajes)::int AS personajes,
       (SELECT COUNT(*) FROM simulaciones)::int AS simulaciones,
       (SELECT COUNT(*) FROM recursos)::int AS recursos,
       (SELECT COUNT(*) FROM usuarios WHERE rol = 'patient')::int AS pacientes,
       (SELECT COUNT(*) FROM progreso_capitulos WHERE completado)::int AS capitulos_completados,
       (SELECT COUNT(*) FROM decisiones)::int AS decisiones_tomadas`,
  );
  return rows[0];
}

// Avance de cada paciente. Solo se muestra el alias (no el correo) para cuidar su privacidad.
export async function avancePacientes() {
  const { rows } = await pool.query(
    `SELECT u.id, u.alias, u.creado_en,
            (SELECT COUNT(*) FROM progreso_capitulos p WHERE p.usuario_id = u.id AND p.completado)::int AS capitulos_completados,
            (SELECT COUNT(*) FROM decisiones d WHERE d.usuario_id = u.id)::int AS decisiones_tomadas,
            (SELECT MAX(p.actualizado_en) FROM progreso_capitulos p WHERE p.usuario_id = u.id) AS ultima_actividad
     FROM usuarios u
     WHERE u.rol = 'patient'
     ORDER BY u.alias`,
  );
  return rows;
}
