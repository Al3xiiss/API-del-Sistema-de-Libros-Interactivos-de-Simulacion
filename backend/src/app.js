// Confir Express (middlewares globales y rutas)

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Orígenes que pueden llamar a la API desde el navegador (CORS_ORIGIN; si son varios, separados por coma).
// Si no está configurado no se acepta ninguno: nunca se responde con "cualquier origen" (*).
const origenesPermitidos = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

// En Docker, nginx está delante de la API y envía la IP real del usuario 
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

app.use(helmet()); // cabeceras HTTP de seguridad

// Solo el frontend puede llamar a la API, con los métodos y encabezados que usa
app.use(cors({
  origin: origenesPermitidos.length > 0 ? origenesPermitidos : false,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600, // el navegador recuerda la respuesta de la consulta previa (preflight) por 10 minutos
}));

// Lee el cuerpo JSON. El más grande que se usa es un capítulo (20.000 caracteres),
// así que 100 KB alcanza y se rechazan cuerpos enormes que solo buscan cargar el servidor.
app.use(express.json({ limit: '100kb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;