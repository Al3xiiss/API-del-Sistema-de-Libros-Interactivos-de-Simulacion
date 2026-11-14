// Reglas para consultar un video de YouTube: ?url= debe ser un enlace de YouTube.
import { query } from 'express-validator';
import { extraerIdYoutube } from '../services/youtube.service.js';

export const reglasVideoYoutube = [
  query('url')
    .isString().withMessage('El parámetro url es obligatorio').bail()
    .isLength({ max: 500 }).withMessage('El parámetro url puede tener como máximo 500 caracteres').bail()
    .custom((url) => extraerIdYoutube(url) !== null)
    .withMessage('El enlace no es de un video de YouTube (youtube.com/watch?v=, youtu.be/, shorts/ o embed/)'),
];