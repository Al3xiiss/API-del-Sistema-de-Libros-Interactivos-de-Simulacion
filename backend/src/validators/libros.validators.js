// Reglas para crear o editar un libro

import { body } from 'express-validator';

export const reglasLibro = [
  body('titulo')
    .isString().withMessage('El título es obligatorio')
    .trim()
    .isLength({ min: 3, max: 80 }).withMessage('El título debe tener entre 3 y 80 caracteres'),
  body('sinopsis')
    .isString().withMessage('La sinopsis es obligatoria')
    .trim()
    .isLength({ min: 10, max: 400 }).withMessage('La sinopsis debe tener entre 10 y 400 caracteres'),
  body('color_portada')
    .optional()
    .isString()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('El color debe tener el formato #RRGGBB, por ejemplo #5B4A8B'),
];