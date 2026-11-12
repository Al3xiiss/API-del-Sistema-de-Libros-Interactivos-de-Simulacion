// Rutas de recursos: /api/recursos
// Cualquier usuario con sesión puede verlos; solo el administrador puede crear, editar o eliminar.
import { Router } from 'express';
import {
  listarRecursos, obtenerRecurso, crearRecurso, actualizarRecurso, eliminarRecurso,
} from '../controllers/recursos.controller.js';
import { verificarToken, permitirRoles } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { reglasId } from '../validators/comunes.validators.js';
import { reglasFiltroRecursos, reglasRecurso } from '../validators/recursos.validators.js';

const router = Router();

router.use(verificarToken); // todas las rutas de recursos requieren sesión

router.get('/', reglasFiltroRecursos, validar, listarRecursos);
router.get('/:id', reglasId, validar, obtenerRecurso);
router.post('/', permitirRoles('admin'), reglasRecurso, validar, crearRecurso);
router.put('/:id', permitirRoles('admin'), reglasId, reglasRecurso, validar, actualizarRecurso);
router.delete('/:id', permitirRoles('admin'), reglasId, validar, eliminarRecurso);

export default router;
