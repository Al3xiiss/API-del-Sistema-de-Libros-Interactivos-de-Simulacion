// rutas de autenticacion

import { Router } from 'express';
import { registro, login, perfil } from '../controllers/auth.controller.js';
import { reglasRegistro, reglasLogin } from '../validators/auth.validators.js';
import { validar } from '../middlewares/validate.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.post('/register', reglasRegistro, validar, registro);
router.post('/login', reglasLogin, validar, login);
router.get('/me', verificarToken, perfil);

export default router;