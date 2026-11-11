// Límite de intentos de inicio de sesión (protección contra ataques de fuerza bruta).
// Solo cuentan los intentos fallidos: tras 5 en 15 minutos, la API responde 429.
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

const MINUTOS = 15;
const MAX_INTENTOS = 5;

export const limiteLogin = rateLimit({
  windowMs: MINUTOS * 60 * 1000,
  limit: MAX_INTENTOS,
  skipSuccessfulRequests: true, // un login correcto no suma
  standardHeaders: 'draft-8',   // informa en las cabeceras cuántos intentos quedan
  legacyHeaders: false,
  // Se cuenta por IP + correo: en un hospital muchos pacientes pueden compartir la misma IP,
  // así un ataque contra una cuenta no bloquea el inicio de sesión de los demás.
  keyGenerator: (req) => {
    const correo = String(req.body?.email ?? '').trim().toLowerCase();
    return `${ipKeyGenerator(req.ip)}|${correo}`;
  },
  message: { error: `Demasiados intentos fallidos. Espera ${MINUTOS} minutos antes de volver a intentar` },
});
