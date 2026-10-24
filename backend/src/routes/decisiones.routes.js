// Rutas de decisiones del paciente: /api/decisiones
// Cada usuario trabaja solo con sus propias decisiones (el id sale del token).
import { Router } from 'express';
import { listarMisDecisiones, guardarDecision, eliminarDecision } from '../controllers/decisiones.controller.js';
import { verificarToken } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { reglasDecision, reglasIdSimulacion } from '../validators/decisiones.validators.js';

const router = Router();

router.use(verificarToken);

router.get('/', listarMisDecisiones);
router.put('/:simulacionId', reglasDecision, validar, guardarDecision);
router.delete('/:simulacionId', reglasIdSimulacion, validar, eliminarDecision);

export default router;
