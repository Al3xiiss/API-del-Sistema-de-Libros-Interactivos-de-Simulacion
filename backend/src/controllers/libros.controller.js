// recibe la petición, llama al servicio y responde
import * as librosService from '../services/libros.service.js';

// GET /api/libros
export async function listarLibros(req, res) {
  const libros = await librosService.listar();
  res.status(200).json({ data: libros });
}

// GET /api/libros/:id
export async function obtenerLibro(req, res) {
  const libro = await librosService.obtener(req.params.id);
  res.status(200).json({ data: libro });
}

// POST /api/libros (solo admin)
export async function crearLibro(req, res) {
  const libro = await librosService.crear(req.body);
  res.status(201).json({ data: libro });
}

// PUT /api/libros/:id (solo admin)
export async function actualizarLibro(req, res) {
  const libro = await librosService.actualizar(req.params.id, req.body);
  res.status(200).json({ data: libro });
}

// DELETE /api/libros/:id (solo admin). 204 = eliminado, sin contenido en la respuesta.
export async function eliminarLibro(req, res) {
  await librosService.eliminar(req.params.id);
  res.status(204).end();
}