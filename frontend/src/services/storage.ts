/**
 * Utilidades para simular una API con localStorage durante la EP1.
 * En la EP2 los servicios reemplazan estas llamadas por fetch/Axios.
 */

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

/** Simula la latencia de red para poder mostrar estados de carga. */
export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const createId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;
