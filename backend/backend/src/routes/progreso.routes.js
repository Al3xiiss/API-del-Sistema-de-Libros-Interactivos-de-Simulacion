// Rutas del progreso del paciente: /api/progreso
// Cada usuario trabaja solo con su propio progreso (el id sale del token).
import { Router } from 'express';
import { obtenerMiProgreso, actualizarCapitulo, reiniciarLibro } from '../controllers/progreso.controller.js';
import { verificarToken } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { reglasId } from '../validators/comunes.validators.js';
import { reglasProgresoCapitulo } from '../validators/progreso.validators.js';

const router = Router();

router.use(verificarToken);

router.get('/', obtenerMiProgreso);
router.put('/capitulos/:id', reglasId, reglasProgresoCapitulo, validar, actualizarCapitulo);
router.delete('/libros/:id', reglasId, validar, reiniciarLibro);

export default router;
