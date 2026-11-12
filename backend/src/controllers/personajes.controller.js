// Controlador de personajes: recibe la petición, llama al servicio y responde.
import { matchedData } from 'express-validator';
import * as personajesService from '../services/personajes.service.js';

// GET /api/personajes (filtros opcionales: ?capitulo_id= y ?libro_id=)
export async function listarPersonajes(req, res) {
  // matchedData entrega solo los filtros que pasaron la validación, ya convertidos a número
  const filtros = matchedData(req, { locations: ['query'] });
  const lista = await personajesService.listar(filtros);
  res.status(200).json({ data: lista });
}

// GET /api/personajes/:id
export async function obtenerPersonaje(req, res) {
  const item = await personajesService.obtener(req.params.id);
  res.status(200).json({ data: item });
}

// POST /api/personajes (solo admin)
export async function crearPersonaje(req, res) {
  const item = await personajesService.crear(req.body);
  res.status(201).json({ data: item });
}

// PUT /api/personajes/:id (solo admin)
export async function actualizarPersonaje(req, res) {
  const item = await personajesService.actualizar(req.params.id, req.body);
  res.status(200).json({ data: item });
}

// DELETE /api/personajes/:id (solo admin). 204 = eliminado, sin contenido en la respuesta.
export async function eliminarPersonaje(req, res) {
  await personajesService.eliminar(req.params.id);
  res.status(204).end();
}
