// Rutas de YouTube: /api/youtube (servicio externo, EF5)
// Solo el administrador las usa, al crear o editar un recurso multimedia.
import { Router } from 'express';
import { obtenerVideoYoutube } from '../controllers/youtube.controller.js';
import { verificarToken, permitirRoles } from '../middlewares/auth.js';
import { validar } from '../middlewares/validate.js';
import { reglasVideoYoutube } from '../validators/youtube.validators.js';

const router = Router();

router.get('/video', verificarToken, permitirRoles('admin'), reglasVideoYoutube, validar, obtenerVideoYoutube);

export default router;