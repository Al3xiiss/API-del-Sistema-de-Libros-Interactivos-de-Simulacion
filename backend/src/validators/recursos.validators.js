// Reglas para recursos multimedia. Coinciden con las restricciones de la tabla recursos.
import { body } from 'express-validator';
import { extraerIdYoutube } from '../services/youtube.service.js';
import { filtroId, idObligatorio, textoObligatorio, textoOpcional } from './comunes.validators.js';

export const reglasFiltroRecursos = [filtroId('capitulo_id'), filtroId('libro_id')];

// Solo se aceptan enlaces que el reproductor de la app sabe usar:
// - un video de YouTube (se verifica con la YouTube Data API al guardar),
// - un archivo de audio o video en frontend/public/media (ej. /media/respiracion-guiada.mp3),
// - un archivo de audio o video en otro sitio, solo con https (ej. https://ejemplo.cl/audio.mp3).
//   Así el contenido no viaja sin cifrar y coincide con la política de seguridad (CSP) del frontend.
// Cualquier otro esquema, como javascript: o data:, se rechaza (protección contra XSS).
const ARCHIVO_LOCAL = /^\/media\/[a-z0-9_-]+\.(mp3|m4a|ogg|wav|mp4|webm)$/i;
const ARCHIVO_EXTERNO = /^https:\/\/[^\s"'<>?#]+\.(mp3|m4a|ogg|wav|mp4|webm)(\?[^\s"'<>#]*)?$/i;

export const enlaceValido = (url) =>
  ARCHIVO_LOCAL.test(url) || ARCHIVO_EXTERNO.test(url) || extraerIdYoutube(url) !== null;

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
    .isLength({ max: 500 }).withMessage('El campo url puede tener como máximo 500 caracteres')
    .custom(enlaceValido)
    .withMessage('El campo url debe ser un video de YouTube o un archivo de audio o video (.mp3, .m4a, .ogg, .wav, .mp4 o .webm) de /media/ o con https://'),
  body('duracion_segundos')
    .optional({ values: 'null' })
    .not().isArray().withMessage('El campo duracion_segundos debe ser un entero entre 1 y 86400').bail()
    .isInt({ min: 1, max: 86400 }).withMessage('El campo duracion_segundos debe ser un entero entre 1 y 86400')
    .toInt(),
];