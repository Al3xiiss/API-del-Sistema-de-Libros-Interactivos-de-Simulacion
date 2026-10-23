// Rutas de personajes: /api/personajes
// Cualquier usuario con sesión puede verlos; solo el administrador puede crear, editar o eliminar.
import { Router } from 'express';
import {
  listarPersonajes, obtenerPersonaje, crearPersonaje, actualizarPersonaje, eliminarPersonaje,
} from '../controllers/personajes.controller.js';
import { verificarToken, permitirRoles } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { reglasId } from '../validators/comunes.validators.js';
import { reglasFiltroPersonajes, reglasPersonaje } from '../validators/personajes.validators.js';

const router = Router();

router.use(verificarToken); // todas las rutas de personajes requieren sesión

router.get('/', reglasFiltroPersonajes, validar, listarPersonajes);
router.get('/:id', reglasId, validar, obtenerPersonaje);
router.post('/', permitirRoles('admin'), reglasPersonaje, validar, crearPersonaje);
router.put('/:id', permitirRoles('admin'), reglasId, reglasPersonaje, validar, actualizarPersonaje);
router.delete('/:id', permitirRoles('admin'), reglasId, validar, eliminarPersonaje);

export default router;
