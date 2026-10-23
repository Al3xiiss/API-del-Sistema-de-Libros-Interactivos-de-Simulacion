// Rutas de capítulos: /api/capitulos
// Cualquier usuario con sesión puede verlos; solo el administrador puede crear, editar o eliminar.
import { Router } from 'express';
import {
  listarCapitulos, obtenerCapitulo, crearCapitulo, actualizarCapitulo, eliminarCapitulo,
} from '../controllers/capitulos.controller.js';
import { verificarToken, permitirRoles } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { reglasId } from '../validators/comunes.validators.js';
import { reglasFiltroCapitulos, reglasCapitulo } from '../validators/capitulos.validators.js';

const router = Router();

router.use(verificarToken); // todas las rutas de capítulos requieren sesión

router.get('/', reglasFiltroCapitulos, validar, listarCapitulos);
router.get('/:id', reglasId, validar, obtenerCapitulo);
router.post('/', permitirRoles('admin'), reglasCapitulo, validar, crearCapitulo);
router.put('/:id', permitirRoles('admin'), reglasId, reglasCapitulo, validar, actualizarCapitulo);
router.delete('/:id', permitirRoles('admin'), reglasId, validar, eliminarCapitulo);

export default router;
