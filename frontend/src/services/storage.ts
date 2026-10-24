/**
 * Lectura y escritura segura en localStorage.
 * En la EP2 solo se usa para guardar la sesión (token y usuario); los datos vienen de la API.
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
