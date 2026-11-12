// Manejo centralizado de errores.
import { traducirErrorPg } from '../utils/pgErrors.js';

// Ruta que no existe → 404
export function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

// Errores: los esperados (400, 401, 403, 404, 409) devuelven su mensaje.
// Los inesperados (500) se registran en la terminal y al cliente solo le llega un mensaje genérico.
export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }

  const error = traducirErrorPg(err); // reglas de la BD (UNIQUE, FOREIGN KEY, CHECK) → 400 o 409
  const status = error.status || 500;
  if (status >= 500) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(status).json({ error: error.message });
}
