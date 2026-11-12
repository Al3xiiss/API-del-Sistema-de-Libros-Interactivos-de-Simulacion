/**
 * Sesión guardada en el navegador: el token JWT que entrega la API y los datos públicos del usuario.
 * El token se agrega a cada petición en el interceptor de api.ts.
 */
import { User } from '../types';
import { readJSON, removeKey, writeJSON } from './storage';

const TOKEN_KEY = 'li.token';
const SESSION_KEY = 'li.session';

export const getToken = (): string | null => readJSON<string | null>(TOKEN_KEY, null);

/** Usuario en sesión. Sin token no hay sesión (por ejemplo, datos viejos de la EP1). */
export const getStoredUser = (): User | null => (getToken() ? readJSON<User | null>(SESSION_KEY, null) : null);

export function saveSession(token: string, user: User): void {
  writeJSON(TOKEN_KEY, token);
  writeJSON(SESSION_KEY, user);
}

export function clearSession(): void {
  removeKey(TOKEN_KEY);
  removeKey(SESSION_KEY);
}
