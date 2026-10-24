// Reglas para personajes. Coinciden con las restricciones de la tabla personajes.
import { filtroId, idObligatorio, textoObligatorio, textoOpcional } from './comunes.validators.js';

export const reglasFiltroPersonajes = [filtroId('capitulo_id'), filtroId('libro_id')];

export const reglasPersonaje = [
  idObligatorio('capitulo_id'),
  textoObligatorio('nombre', 2, 40),
  textoOpcional('descripcion', 200),
  textoOpcional('atributos', 200),
];
