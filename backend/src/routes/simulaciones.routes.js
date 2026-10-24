// Rutas de simulaciones: /api/simulaciones
// Cualquier usuario con sesión puede verlas; solo el administrador puede crear, editar o eliminar.
import { Router } from 'express';
import {
  listarSimulaciones, obtenerSimulacion, crearSimulacion, actualizarSimulacion, eliminarSimulacion,
  crearOpcion, actualizarOpcion, eliminarOpcion,
} from '../controllers/simulaciones.controller.js';
import { verificarToken, permitirRoles } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { reglasId } from '../validators/comunes.validators.js';
import {
  reglasFiltroSimulaciones, reglasCrearSimulacion, reglasEditarSimulacion, reglasOpcion, reglasIdOpcion,
} from '../validators/simulaciones.validators.js';

const router = Router();
const soloAdmin = permitirRoles('admin');

router.use(verificarToken); // todas las rutas de simulaciones requieren sesión

// Simulaciones
router.get('/', reglasFiltroSimulaciones, validar, listarSimulaciones);
router.get('/:id', reglasId, validar, obtenerSimulacion);
router.post('/', soloAdmin, reglasCrearSimulacion, validar, crearSimulacion);
router.put('/:id', soloAdmin, reglasId, reglasEditarSimulacion, validar, actualizarSimulacion);
router.delete('/:id', soloAdmin, reglasId, validar, eliminarSimulacion);

// Opciones de una simulación
router.post('/:id/opciones', soloAdmin, reglasId, reglasOpcion, validar, crearOpcion);
router.put('/:id/opciones/:opcionId', soloAdmin, reglasId, reglasIdOpcion, reglasOpcion, validar, actualizarOpcion);
router.delete('/:id/opciones/:opcionId', soloAdmin, reglasId, reglasIdOpcion, validar, eliminarOpcion);

export default router;
