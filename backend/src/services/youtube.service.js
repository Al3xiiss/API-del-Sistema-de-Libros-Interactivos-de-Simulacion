// Integración con la YouTube Data API v3 (servicio externo, EF5).
// Cuando un recurso usa un enlace de YouTube, la API consulta el video para:
//   1. comprobar que existe, que no es privado y que se puede reproducir fuera de YouTube.
//   2. tomar su duración real (y entregar título, canal y miniatura al formulario del administrador).
// La clave va en YOUTUBE_API_KEY (.env). Sin clave, los enlaces de YouTube se guardan sin verificar.

import { HttpError } from '../utils/httpError.js';

const API_URL = process.env.YOUTUBE_API_URL ?? 'https://www.googleapis.com/youtube/v3'; // solo se cambia en pruebas
const TIEMPO_MAXIMO_MS = 5000;               // si YouTube no responde en 5 s, se corta la consulta
const VIGENCIA_CACHE_MS = 60 * 60 * 1000;    // 1 hora: no se gasta cuota consultando el mismo video
const cache = new Map();

export const youtubeConfigurado = () => Boolean(process.env.YOUTUBE_API_KEY);

/**
 * Devuelve el id de 11 caracteres de un enlace de YouTube, o null si el enlace no es de YouTube.
 * Acepta youtube.com/watch?v=, youtu.be/, youtube.com/shorts/ y youtube.com/embed/.
 */
export function extraerIdYoutube(url) {
  let direccion;
  try {
    direccion = new URL(url);
  } catch {
    return null;
  }
  if (direccion.protocol !== 'https:' && direccion.protocol !== 'http:') return null;

  const sitio = direccion.hostname.replace(/^(www|m)\./, '');
  let id = null;
  if (sitio === 'youtu.be') {
    id = direccion.pathname.slice(1);
  } else if (sitio === 'youtube.com') {
    id = direccion.pathname === '/watch'
      ? direccion.searchParams.get('v')
      : direccion.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

/** Duración de YouTube (formato ISO 8601) a segundos: "PT4M16S" → 256. Una transmisión en vivo ("P0D") → null. */
export function duracionEnSegundos(iso) {
  const partes = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(iso ?? '');
  if (!partes) return null;
  const [dias, horas, minutos, segundos] = partes.slice(1).map((valor) => Number(valor ?? 0));
  const total = ((dias * 24 + horas) * 60 + minutos) * 60 + segundos;
  return total > 0 ? total : null;
}

/** Consulta un video por su id. Lanza 400 si no se puede usar y 503 si YouTube no responde. */
export async function obtenerVideo(id) {
  const guardado = cache.get(id);
  if (guardado && guardado.vence > Date.now()) return guardado.video;

  const parametros = new URLSearchParams({ part: 'snippet,contentDetails,status', id });
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}/videos?${parametros}`, {
      // La clave va en un encabezado y no en la URL, así no queda escrita en registros ni historiales
      headers: { 'X-Goog-Api-Key': process.env.YOUTUBE_API_KEY },
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
  } catch {
    throw new HttpError(503, 'No se pudo conectar con YouTube para verificar el video. Intenta de nuevo en unos minutos');
  }

  if (!respuesta.ok) {
    // 400: clave inválida · 403: cuota agotada o API no habilitada. El detalle queda solo en la terminal.
    const detalle = await respuesta.json().catch(() => null);
    console.error(`YouTube Data API respondió ${respuesta.status}: ${detalle?.error?.message ?? 'sin detalle'}`);
    throw new HttpError(503, 'YouTube no está disponible para verificar el video. Intenta de nuevo más tarde');
  }

  const { items = [] } = await respuesta.json();
  const item = items[0];
  if (!item) {
    throw new HttpError(400, 'El video de YouTube no existe o es privado');
  }
  if (item.status?.embeddable === false) {
    throw new HttpError(400, 'El dueño de ese video de YouTube no permite reproducirlo fuera de YouTube');
  }

  const video = {
    id,
    titulo: item.snippet?.title ?? '',
    canal: item.snippet?.channelTitle ?? '',
    miniatura: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? null,
    duracion_segundos: duracionEnSegundos(item.contentDetails?.duration),
  };
  cache.set(id, { video, vence: Date.now() + VIGENCIA_CACHE_MS });
  return video;
}