// Controlador de capítulos: recibe la petición, llama al servicio y responde.
import { matchedData } from 'express-validator';
import * as capitulosService from '../services/capitulos.service.js';

// GET /api/capitulos (filtros opcionales: ?libro_id=)
export async function listarCapitulos(req, res) {
  // matchedData entrega solo los filtros que pasaron la validación, ya convertidos a número
  const filtros = matchedData(req, { locations: ['query'] });
  const lista = await capitulosService.listar(filtros);
  res.status(200).json({ data: lista });
}

// GET /api/capitulos/:id
export async function obtenerCapitulo(req, res) {
  const item = await capitulosService.obtener(req.params.id);
  res.status(200).json({ data: item });
}

// POST /api/capitulos (solo admin)
export async function crearCapitulo(req, res) {
  const item = await capitulosService.crear(req.body);
  res.status(201).json({ data: item });
}

// PUT /api/capitulos/:id (solo admin)
export async function actualizarCapitulo(req, res) {
  const item = await capitulosService.actualizar(req.params.id, req.body);
  res.status(200).json({ data: item });
}

// DELETE /api/capitulos/:id (solo admin). 204 = eliminado, sin contenido en la respuesta.
export async function eliminarCapitulo(req, res) {
  await capitulosService.eliminar(req.params.id);
  res.status(204).end();
}
