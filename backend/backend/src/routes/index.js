// Punto central de rutas: une todos los módulos bajo /api
import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import librosRoutes from './libros.routes.js';
import capitulosRoutes from './capitulos.routes.js';
import personajesRoutes from './personajes.routes.js';
import simulacionesRoutes from './simulaciones.routes.js';
import recursosRoutes from './recursos.routes.js';
import progresoRoutes from './progreso.routes.js';
import decisionesRoutes from './decisiones.routes.js';
import estadisticasRoutes from './estadisticas.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/libros', librosRoutes);
router.use('/capitulos', capitulosRoutes);
router.use('/personajes', personajesRoutes);
router.use('/simulaciones', simulacionesRoutes);
router.use('/recursos', recursosRoutes);
router.use('/progreso', progresoRoutes);
router.use('/decisiones', decisionesRoutes);
router.use('/estadisticas', estadisticasRoutes);

export default router;
