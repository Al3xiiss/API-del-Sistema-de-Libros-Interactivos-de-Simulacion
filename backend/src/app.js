// Confir Express (middlewares globales y rutas)

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());                                  // cabeceras HTTP de seguridad
app.use(cors({ origin: process.env.CORS_ORIGIN })); // solo el frontend puede llamar a la API
app.use(express.json());                            // lee el cuerpo JSON de las peticiones

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;