// Reglas para simulaciones y sus opciones de decisión.
import { body } from 'express-validator';
import {
  filtroId, idObligatorio, idOpcional, reglaParamId, textoObligatorio, textoOpcional,
} from './comunes.validators.js';

export const reglasFiltroSimulaciones = [filtroId('capitulo_id'), filtroId('libro_id')];

// Campos de una opción. "prefijo" permite validar cada opción dentro de una lista (opciones.*.texto).
const camposOpcion = (prefijo = '') => [
  textoObligatorio(`${prefijo}texto`, 2, 100),
  textoOpcional(`${prefijo}descripcion`, 200),
  textoObligatorio(`${prefijo}consecuencia`, 5, 2000),
];

// Crear: la simulación y sus opciones llegan juntas
export const reglasCrearSimulacion = [
  idObligatorio('capitulo_id'),
  idOpcional('personaje_id'),
  textoObligatorio('contexto', 10, 2000),
  textoObligatorio('pregunta', 5, 200),
  body('opciones')
    .isArray({ min: 2, max: 4 }).withMessage('El campo opciones debe ser una lista de 2 a 4 opciones'),
  ...camposOpcion('opciones.*.'),
];

// Editar: solo los datos de la simulación (las opciones tienen sus propias rutas)
export const reglasEditarSimulacion = [
  idOpcional('capitulo_id'),
  idOpcional('personaje_id'),
  textoObligatorio('contexto', 10, 2000),
  textoObligatorio('pregunta', 5, 200),
];

export const reglasOpcion = camposOpcion();

export const reglasIdOpcion = [reglaParamId('opcionId')];
