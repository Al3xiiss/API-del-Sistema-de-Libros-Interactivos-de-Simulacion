/**
 * Autenticación SIMULADA para la EP1 (FT-01, FT-02, FT-03).
 * En la EP2 login/register llamarán a la API, que devolverá un JWT,
 * y las contraseñas se guardarán hasheadas con bcrypt en el backend.
 */
import { DEMO_USERS } from '../data/mockData';
import { Role, User } from '../types';
import { createId, delay, readJSON, removeKey, writeJSON } from './storage';

const USERS_KEY = 'li.users';
const SESSION_KEY = 'li.session';

type StoredUser = User & { password: string };

const getUsers = (): StoredUser[] => readJSON<StoredUser[]>(USERS_KEY, DEMO_USERS);

const toPublicUser = ({ id, alias, email, role }: StoredUser): User => ({ id, alias, email, role });

/** Pantalla de inicio según el rol (se usa en redirecciones). */
export const homeForRole = (role: Role) => (role === 'admin' ? '/admin' : '/app/home');

export async function login(email: string, password: string): Promise<User> {
  await delay(600);
  const found = getUsers().find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
  );
  // Mensaje genérico: no revela si el correo existe (confidencialidad).
  if (!found) throw new Error('Correo o contraseña incorrectos.');
  const user = toPublicUser(found);
  writeJSON(SESSION_KEY, user);
  return user;
}

export async function register(data: { alias: string; email: string; password: string }): Promise<void> {
  await delay(600);
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
    throw new Error('No pudimos crear la cuenta con ese correo. Prueba iniciar sesión.');
  }
  // Todo registro público crea un Paciente; los administradores se crean internamente.
  users.push({
    id: createId('u'),
    alias: data.alias.trim(),
    email: data.email.trim(),
    password: data.password,
    role: 'patient',
  });
  writeJSON(USERS_KEY, users);
}

export const getSession = (): User | null => readJSON<User | null>(SESSION_KEY, null);

export const logout = () => removeKey(SESSION_KEY);

export const countPatients = () => getUsers().filter((u) => u.role === 'patient').length;
