// Rutas de estadísticas: /api/estadisticas (solo administrador)
import { Router } from 'express';
import { obtenerGenerales, obtenerAvancePacientes } from '../controllers/estadisticas.controller.js';
import { verificarToken, permitirRoles } from '../middlewares/auth.js';

const router = Router();

router.use(verificarToken, permitirRoles('admin'));

router.get('/', obtenerGenerales);
router.get('/pacientes', obtenerAvancePacientes);

export default router;
