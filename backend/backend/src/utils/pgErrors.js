// Traduce los errores de PostgreSQL más comunes a errores HTTP con un mensaje claro.
// Así, si los datos no cumplen una regla de la base de datos, el cliente recibe 400 o 409 y no un 500.
import { HttpError } from './httpError.js';

const CODIGOS = {
  23505: { status: 409, mensaje: 'Ya existe un registro con esos datos' }, // UNIQUE
  23503: { status: 400, mensaje: 'Uno de los datos hace referencia a un registro que no existe' }, // FOREIGN KEY
  23514: { status: 400, mensaje: 'Algún dato no cumple las reglas de la base de datos' }, // CHECK
  22001: { status: 400, mensaje: 'Algún texto supera el largo permitido' },
  '22P02': { status: 400, mensaje: 'Algún dato tiene un formato inválido' },
};

// "mensajes" permite dar un texto específico según la restricción que falló.
// Ejemplo: { capitulos_libro_id_fkey: 'El libro indicado no existe' }
export function traducirErrorPg(err, mensajes = {}) {
  const conocido = CODIGOS[err.code];
  if (!conocido) {
    return err;
  }
  return new HttpError(conocido.status, mensajes[err.constraint] ?? conocido.mensaje);
}
