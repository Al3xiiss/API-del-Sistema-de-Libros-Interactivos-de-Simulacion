// Punto de entrada (carga el .env, prueba la base de datos y levanta el servidor)

import 'dotenv/config';
import app from './app.js';
import { pool } from './config/db.js';

const PORT = process.env.PORT || 3000;

// La clave que firma los tokens debe ser larga y no puede ser la de ejemplo de .env.example
const JWT_SECRET = process.env.JWT_SECRET ?? '';
if (JWT_SECRET.length < 32 || JWT_SECRET === 'cambia_esto_por_una_clave_larga_y_aleatoria') {
  console.error('JWT_SECRET debe estar en el archivo .env y tener al menos 32 caracteres aleatorios');
  console.error("Genera una con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
  process.exit(1);
}

// La integración con YouTube es opcional: sin clave, los enlaces de YouTube se guardan sin verificar
if (!process.env.YOUTUBE_API_KEY) {
  console.warn('YOUTUBE_API_KEY no está configurada: los videos de YouTube no se verificarán al guardar recursos');
}

try {
  await pool.query('SELECT 1');
  console.log('Conectado a PostgreSQL');
  // En Express 5, si el puerto está ocupado el error llega a esta función
  app.listen(PORT, (err) => {
    if (err) {
      console.error(`No se pudo iniciar la API en el puerto ${PORT}: ${err.message}`);
      process.exit(1);
    }
    console.log(`API escuchando en http://localhost:${PORT}/api`);
  });
} catch (err) {
  console.error('No se pudo conectar a PostgreSQL. Revisa los datos del archivo .env');
  console.error(err.message);
  process.exit(1);
}