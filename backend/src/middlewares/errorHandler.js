// Ruta que no existe = 404
export function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

// Errores: los esperados (400, 401, 403, 404, 409) 
// Los inesperados (500) se registran en la terminal y al cliente le llega un mensaje generico
export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }

  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(status).json({ error: err.message });
}