// Revisa el resultado de las reglas de express-validator
// Si algún campo no cumple, responde 400 y la petición no llega al controlador

import { validationResult } from 'express-validator';

export function validar(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: errores.array({ onlyFirstError: true }).map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
}