// Reglas para el progreso del paciente.
import { body } from 'express-validator';

// "completado" es opcional: si no se envía, solo se registra que el capítulo se abrió.
export const reglasProgresoCapitulo = [
  body('completado')
    .optional()
    .not().isArray().withMessage('El campo completado debe ser true o false').bail()
    .isBoolean().withMessage('El campo completado debe ser true o false')
    .toBoolean(),
];
