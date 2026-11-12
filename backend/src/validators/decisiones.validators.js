// Reglas para las decisiones del paciente.
import { idObligatorio, reglaParamId } from './comunes.validators.js';

export const reglasIdSimulacion = [reglaParamId('simulacionId')];

export const reglasDecision = [...reglasIdSimulacion, idObligatorio('opcion_id')];
