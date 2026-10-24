// Controlador de recursos: recibe la petición, llama al servicio y responde.
import { matchedData } from 'express-validator';
import * as recursosService from '../services/recursos.service.js';

// GET /api/recursos (filtros opcionales: ?capitulo_id= y ?libro_id=)
export async function listarRecursos(req, res) {
  // matchedData entrega solo los filtros que pasaron la validación, ya convertidos a número
  const filtros = matchedData(req, { locations: ['query'] });
  const lista = await recursosService.listar(filtros);
  res.status(200).json({ data: lista });
}

// GET /api/recursos/:id
export async function obtenerRecurso(req, res) {
  const item = await recursosService.obtener(req.params.id);
  res.status(200).json({ data: item });
}

// POST /api/recursos (solo admin)
export async function crearRecurso(req, res) {
  const item = await recursosService.crear(req.body);
  res.status(201).json({ data: item });
}

// PUT /api/recursos/:id (solo admin)
export async function actualizarRecurso(req, res) {
  const item = await recursosService.actualizar(req.params.id, req.body);
  res.status(200).json({ data: item });
}

// DELETE /api/recursos/:id (solo admin). 204 = eliminado, sin contenido en la respuesta.
export async function eliminarRecurso(req, res) {
  await recursosService.eliminar(req.params.id);
  res.status(204).end();
}
