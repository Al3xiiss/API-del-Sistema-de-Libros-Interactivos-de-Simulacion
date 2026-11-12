// Reglas para capítulos. Coinciden con las restricciones de la tabla capitulos.
import { body } from 'express-validator';
import { filtroId, idObligatorio, textoObligatorio } from './comunes.validators.js';

export const reglasFiltroCapitulos = [filtroId('libro_id')];

export const reglasCapitulo = [
  idObligatorio('libro_id'),
  // Opcional: si no se envía, se usa el siguiente número disponible del libro
  body('numero')
    .optional({ values: 'null' })
    .not().isArray().withMessage('El campo numero debe ser un entero mayor que 0').bail()
    .isInt({ min: 1 }).withMessage('El campo numero debe ser un entero mayor que 0')
    .toInt(),
  textoObligatorio('titulo', 3, 120),
  textoObligatorio('contenido', 10, 20000),
];
