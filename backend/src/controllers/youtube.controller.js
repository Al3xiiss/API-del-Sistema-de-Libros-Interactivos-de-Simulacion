// Controlador de YouTube: entrega los datos de un video para completar el formulario de recursos.
import * as youtubeService from '../services/youtube.service.js';
import { HttpError } from '../utils/httpError.js';

// GET /api/youtube/video?url=https://youtu.be/... (solo admin)
export async function obtenerVideoYoutube(req, res) {
  if (!youtubeService.youtubeConfigurado()) {
    throw new HttpError(503, 'La integración con YouTube no está configurada (falta YOUTUBE_API_KEY en el .env)');
  }
  const video = await youtubeService.obtenerVideo(youtubeService.extraerIdYoutube(req.query.url));
  res.status(200).json({ data: video });
}