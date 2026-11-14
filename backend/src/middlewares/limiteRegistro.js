// Límite de cuentas nuevas: 20 por hora desde la misma IP.
// Evita la creación masiva de cuentas falsas y que se use el registro para cargar el servidor,
// porque cada contraseña nueva se procesa con bcrypt. Los registros rechazados (datos inválidos o
// correo repetido) no suman, y 20 deja margen para un grupo de pacientes que se registra en el hospital.
import { rateLimit } from 'express-rate-limit';

const MAX_REGISTROS = 20;

export const limiteRegistro = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: MAX_REGISTROS,
  skipFailedRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Se crearon demasiadas cuentas desde esta conexión. Intenta de nuevo en una hora' },
});
