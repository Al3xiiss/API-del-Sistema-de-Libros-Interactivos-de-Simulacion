// Punto de entrada (carga el .env, prueba la base de datos y levanta el servidor)

import 'dotenv/config';
import app from './app.js';
import { pool } from './config/db.js';

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

try {
  await pool.query('SELECT 1');
  console.log('Conectado a PostgreSQL');
  app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}/api`));
} catch (err) {
  console.error('No se pudo conectar a PostgreSQL. Revisa los datos del archivo .env');
  console.error(err.message);
  process.exit(1);
}