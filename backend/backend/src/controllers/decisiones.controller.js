// Controlador de decisiones del paciente. El usuario siempre sale del token (req.usuario).
import * as decisionesService from '../services/decisiones.service.js';

// GET /api/decisiones
export async function listarMisDecisiones(req, res) {
  const decisiones = await decisionesService.listarMisDecisiones(req.usuario.id);
  res.status(200).json({ data: decisiones });
}

// PUT /api/decisiones/:simulacionId  body: { "opcion_id": 1 }
export async function guardarDecision(req, res) {
  const decision = await decisionesService.guardar(req.usuario.id, req.params.simulacionId, req.body.opcion_id);
  res.status(200).json({ data: decision });
}

// DELETE /api/decisiones/:simulacionId
export async function eliminarDecision(req, res) {
  await decisionesService.eliminar(req.usuario.id, req.params.simulacionId);
  res.status(204).end();
}
