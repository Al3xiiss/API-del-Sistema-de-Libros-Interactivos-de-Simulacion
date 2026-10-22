import { param } from 'express-validator';

// ej. /api/libros/3
export const reglasId = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo').toInt(),
];