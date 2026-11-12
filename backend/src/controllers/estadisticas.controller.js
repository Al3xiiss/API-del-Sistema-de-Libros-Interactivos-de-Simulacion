// Controlador de estadísticas del panel de administración.
import * as estadisticasService from '../services/estadisticas.service.js';

// GET /api/estadisticas
export async function obtenerGenerales(req, res) {
  const estadisticas = await estadisticasService.generales();
  res.status(200).json({ data: estadisticas });
}

// GET /api/estadisticas/pacientes
export async function obtenerAvancePacientes(req, res) {
  const pacientes = await estadisticasService.avancePacientes();
  res.status(200).json({ data: pacientes });
}
