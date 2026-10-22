// Rutas de libros: /api/libros
// Cualquier usuario con sesión puede verlos pero solo el administrador puede crear, editar o eliminar

import { Router } from 'express';
import {
  listarLibros, obtenerLibro, crearLibro, actualizarLibro, eliminarLibro,
} from '../controllers/libros.controller.js';
import { verificarToken, permitirRoles } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { reglasId } from '../validators/comunes.validators.js';
import { reglasLibro } from '../validators/libros.validators.js';

const router = Router();

router.use(verificarToken); // todas las rutas de libros requieren sesión

router.get('/', listarLibros);
router.get('/:id', reglasId, validar, obtenerLibro);
router.post('/', permitirRoles('admin'), reglasLibro, validar, crearLibro);
router.put('/:id', permitirRoles('admin'), reglasId, reglasLibro, validar, actualizarLibro);
router.delete('/:id', permitirRoles('admin'), reglasId, validar, eliminarLibro);

export default router;