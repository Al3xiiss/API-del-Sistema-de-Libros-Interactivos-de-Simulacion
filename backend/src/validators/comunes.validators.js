// Reglas que se repiten en varios módulos.
import { body, param, query } from 'express-validator';

// El :id de la URL debe ser un número entero positivo (ej. /api/libros/3).
export const reglasId = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo').toInt(),
];

// Revisa que el valor sea UN número entero positivo (no una lista) y lo convierte a número.
const enteroPositivo = (regla, mensaje) =>
  regla.not().isArray().withMessage(mensaje).bail().isInt({ min: 1 }).withMessage(mensaje).toInt();

// Otro número en la URL, ej. :opcionId en /api/simulaciones/1/opciones/2
export const reglaParamId = (nombre) =>
  enteroPositivo(param(nombre), `${nombre} debe ser un número entero positivo`);

// Filtro opcional en la URL, ej. /api/capitulos?libro_id=1
export const filtroId = (nombre) =>
  enteroPositivo(query(nombre).optional(), `El filtro ${nombre} debe ser un número entero positivo`);

// Id obligatorio en el cuerpo, ej. "libro_id": 1
export const idObligatorio = (campo) =>
  enteroPositivo(body(campo), `El campo ${campo} es obligatorio y debe ser un número entero positivo`);

// Id opcional en el cuerpo: se puede omitir o enviar como null
export const idOpcional = (campo) =>
  enteroPositivo(body(campo).optional({ values: 'null' }), `El campo ${campo} debe ser un número entero positivo`);

// Texto obligatorio con largo mínimo y máximo.
// "path" es el nombre real del campo, ej. opciones[0].texto
export const textoObligatorio = (campo, min, max) =>
  body(campo)
    .isString().withMessage((_, { path }) => `El campo ${path} es obligatorio`)
    .trim()
    .isLength({ min, max }).withMessage((_, { path }) => `El campo ${path} debe tener entre ${min} y ${max} caracteres`);

// Texto opcional con largo máximo: se puede omitir o enviar como null
export const textoOpcional = (campo, max) =>
  body(campo)
    .optional({ values: 'null' })
    .isString().withMessage((_, { path }) => `El campo ${path} debe ser texto`)
    .trim()
    .isLength({ max }).withMessage((_, { path }) => `El campo ${path} puede tener como máximo ${max} caracteres`);
