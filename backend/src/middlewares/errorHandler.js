// Ruta que no existe = 404
export function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

// Cualquier error no controlado = 500 sin mostrar detalles internos 
export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Error interno del servidor' });
}