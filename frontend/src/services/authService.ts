/**
 * Autenticación con la API (FT-01, FT-02, FT-03).
 * El login devuelve un token JWT que se guarda en la sesión y se envía en cada petición.
 * Las contraseñas se validan y guardan encriptadas (bcrypt) en el backend.
 */
import { Role, User } from '../types';
import { apiPost } from './api';
import { toUser, UsuarioApi } from './mappers';
import { clearSession, getStoredUser, saveSession } from './session';

/** Pantalla de inicio según el rol (se usa en redirecciones). */
export const homeForRole = (role: Role) => (role === 'admin' ? '/admin' : '/app/home');

export async function login(email: string, password: string): Promise<User> {
  const { token, usuario } = await apiPost<{ token: string; usuario: UsuarioApi }>('/auth/login', {
    email: email.trim(),
    password,
  });
  const user = toUser(usuario);
  saveSession(token, user);
  return user;
}

// Todo registro público crea un Paciente; los administradores se crean en la base de datos.
export async function register(data: { alias: string; email: string; password: string }): Promise<void> {
  await apiPost('/auth/register', {
    alias: data.alias.trim(),
    email: data.email.trim(),
    password: data.password,
  });
}

export const getSession = (): User | null => getStoredUser();

export const logout = () => clearSession();
