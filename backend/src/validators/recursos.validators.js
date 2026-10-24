// Reglas para recursos multimedia. Coinciden con las restricciones de la tabla recursos.
import { body } from 'express-validator';
import { filtroId, idObligatorio, textoObligatorio, textoOpcional } from './comunes.validators.js';

export const reglasFiltroRecursos = [filtroId('capitulo_id'), filtroId('libro_id')];

export const reglasRecurso = [
  idObligatorio('capitulo_id'),
  body('tipo')
    .isString().withMessage('El campo tipo es obligatorio')
    .isIn(['video', 'audio']).withMessage('El campo tipo debe ser "video" o "audio"'),
  textoObligatorio('titulo', 3, 100),
  textoOpcional('descripcion', 300),
  body('url')
    .optional({ values: 'null' })
    .isString().withMessage('El campo url debe ser texto')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('El campo url debe ser una dirección http:// o https:// válida')
    .isLength({ max: 500 }).withMessage('El campo url puede tener como máximo 500 caracteres'),
  body('duracion_segundos')
    .optional({ values: 'null' })
    .not().isArray().withMessage('El campo duracion_segundos debe ser un entero entre 1 y 86400').bail()
    .isInt({ min: 1, max: 86400 }).withMessage('El campo duracion_segundos debe ser un entero entre 1 y 86400')
    .toInt(),
];
