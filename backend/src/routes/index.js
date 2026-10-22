// punto central de rutas, se iran sumando auth, libros, capítulos, etc.

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import librosRoutes from './libros.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/libros', librosRoutes);

export default router;