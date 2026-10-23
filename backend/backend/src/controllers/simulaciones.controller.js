// Controlador de simulaciones: recibe la petición, llama al servicio y responde.
import { matchedData } from 'express-validator';
import * as simulacionesService from '../services/simulaciones.service.js';

// GET /api/simulaciones (filtros opcionales: ?capitulo_id= y ?libro_id=)
export async function listarSimulaciones(req, res) {
  // matchedData entrega solo los filtros que pasaron la validación, ya convertidos a número
  const filtros = matchedData(req, { locations: ['query'] });
  const lista = await simulacionesService.listar(filtros);
  res.status(200).json({ data: lista });
}

// GET /api/simulaciones/:id
export async function obtenerSimulacion(req, res) {
  const item = await simulacionesService.obtener(req.params.id);
  res.status(200).json({ data: item });
}

// POST /api/simulaciones (solo admin)
export async function crearSimulacion(req, res) {
  const item = await simulacionesService.crear(req.body);
  res.status(201).json({ data: item });
}

// PUT /api/simulaciones/:id (solo admin)
export async function actualizarSimulacion(req, res) {
  const item = await simulacionesService.actualizar(req.params.id, req.body);
  res.status(200).json({ data: item });
}

// DELETE /api/simulaciones/:id (solo admin). 204 = eliminado, sin contenido en la respuesta.
export async function eliminarSimulacion(req, res) {
  await simulacionesService.eliminar(req.params.id);
  res.status(204).end();
}

// ---------- Opciones de una simulación (solo admin) ----------

// POST /api/simulaciones/:id/opciones
export async function crearOpcion(req, res) {
  const opcion = await simulacionesService.crearOpcion(req.params.id, req.body);
  res.status(201).json({ data: opcion });
}

// PUT /api/simulaciones/:id/opciones/:opcionId
export async function actualizarOpcion(req, res) {
  const opcion = await simulacionesService.actualizarOpcion(req.params.id, req.params.opcionId, req.body);
  res.status(200).json({ data: opcion });
}

// DELETE /api/simulaciones/:id/opciones/:opcionId
export async function eliminarOpcion(req, res) {
  await simulacionesService.eliminarOpcion(req.params.id, req.params.opcionId);
  res.status(204).end();
}
