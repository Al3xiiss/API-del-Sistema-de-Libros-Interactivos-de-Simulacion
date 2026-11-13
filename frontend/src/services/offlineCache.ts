/**
 * Almacenamiento local para leer sin conexión (EF1).
 * Cada respuesta correcta de la API se guarda en localStorage. Si después la API no responde
 * (por ejemplo, se cae el wifi del hospital), se usa la última copia guardada.
 * La copia es de cada usuario y se borra al cerrar sesión (ver clearSession en session.ts).
 */
import { ApiError } from './api';
import { getStoredUser } from './session';
import { CACHE_PREFIX, readJSON, removeKey, writeJSON } from './storage';

type Listener = (offline: boolean) => void;
const listeners = new Set<Listener>();

/** Avisa si la API dejó de responder por falta de conexión (true) o si volvió a responder (false). Devuelve la función para dejar de escuchar. */
export function onConnectionChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const notify = (offline: boolean) => listeners.forEach((listener) => listener(offline));

/** true si la petición falló porque no hay conexión (el ApiError no trae código HTTP). */
export const isOfflineError = (err: unknown): boolean => err instanceof ApiError && err.status === undefined;

/** Llama a la API y guarda la respuesta; si no hay conexión, devuelve la última copia guardada. */
export async function withOfflineCache<T>(name: string, request: () => Promise<T>): Promise<T> {
  const key = `${CACHE_PREFIX}${getStoredUser()?.id ?? 'anonimo'}.${name}`;
  try {
    const data = await request();
    // Si ya no existe (404), también se borra su copia
    if (data === undefined) removeKey(key);
    else writeJSON(key, data);
    notify(false);
    return data;
  } catch (err) {
    // Un 404 o un 403 sí traen código HTTP: esos errores no se ocultan.
    if (!isOfflineError(err)) throw err;
    notify(true);
    const copy = readJSON<T | null>(key, null);
    if (copy === null) throw err; // nunca se abrió con conexión: no hay copia
    return copy;
  }
}
