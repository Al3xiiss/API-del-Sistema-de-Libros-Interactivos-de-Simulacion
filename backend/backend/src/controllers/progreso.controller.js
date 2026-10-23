// Controlador del progreso del paciente. El usuario siempre sale del token (req.usuario).
import * as progresoService from '../services/progreso.service.js';

// GET /api/progreso
export async function obtenerMiProgreso(req, res) {
  const progreso = await progresoService.obtenerMiProgreso(req.usuario.id);
  res.status(200).json({ data: progreso });
}

// PUT /api/progreso/capitulos/:id  body opcional: { "completado": true }
export async function actualizarCapitulo(req, res) {
  const registro = await progresoService.actualizarCapitulo(req.usuario.id, req.params.id, req.body?.completado);
  res.status(200).json({ data: registro });
}

// DELETE /api/progreso/libros/:id
export async function reiniciarLibro(req, res) {
  await progresoService.reiniciarLibro(req.usuario.id, req.params.id);
  res.status(204).end();
}
