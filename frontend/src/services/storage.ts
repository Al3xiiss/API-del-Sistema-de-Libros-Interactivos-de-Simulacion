/**
 * Lectura y escritura segura en localStorage.
 * Guarda la sesión (token y usuario), la copia de la lectura para usar sin conexión
 * y la preferencia del recordatorio de lectura (EF1).
 */

/** Prefijo de la copia local de la lectura (ver offlineCache.ts). */
export const CACHE_PREFIX = 'li.cache.';

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Navegación privada o almacenamiento lleno: la app sigue funcionando en memoria.
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignorado a propósito.
  }
}

/** Borra todas las claves que empiezan con `prefix` (por ejemplo, toda la copia local de la lectura). */
export function removeKeysWithPrefix(prefix: string): void {
  try {
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) localStorage.removeItem(key);
    }
  } catch {
    // Ignorado a propósito.
  }
}
