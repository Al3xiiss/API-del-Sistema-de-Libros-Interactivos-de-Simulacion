/**
 * Cliente HTTP de la API REST (EP2), hecho con Axios.
 * - Interceptor de petición: agrega el token JWT en el encabezado Authorization.
 * - Interceptor de respuesta: transforma los errores de la API en mensajes legibles y,
 *   si la sesión venció (401), la cierra y vuelve al login.
 */
import axios, { AxiosError } from 'axios';
import { clearSession, getToken } from './session';

/** URL base de la API. Se puede cambiar con VITE_API_URL en frontend/.env */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({ baseURL: API_URL, timeout: 10000 });

/** Error con el código HTTP y el mensaje que devolvió la API. */
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

interface ApiErrorBody {
  error?: string;
  detalles?: { campo: string; mensaje: string }[];
}

// Antes de cada petición: si hay sesión, se envía el token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Después de cada respuesta con error
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const body = error.response?.data;

    // Sesión vencida o inválida: si la petición llevaba token, se cierra la sesión y se vuelve al login.
    // (Un 401 en el propio login solo significa correo o contraseña incorrectos.)
    const llevabaToken = Boolean(error.config?.headers?.Authorization);
    const esLogin = error.config?.url?.includes('/auth/login');
    if (status === 401 && llevabaToken && !esLogin) {
      clearSession();
      window.location.replace('/login');
      return new Promise(() => {}); // la página se recarga en /login; no hace falta mostrar el error
    }

    let message = 'Ocurrió un error inesperado. Inténtalo de nuevo.';
    if (!error.response) {
      message = 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
    } else if (body?.detalles?.length) {
      message = body.detalles[0].mensaje; // primer error de validación
    } else if (body?.error) {
      message = body.error;
    }
    return Promise.reject(new ApiError(message, status));
  },
);

// La API responde { data: ... }; estas funciones devuelven directamente "data".
type Params = Record<string, string | number | undefined>;

export async function apiGet<T>(url: string, params?: Params): Promise<T> {
  const response = await api.get<{ data: T }>(url, { params });
  return response.data.data;
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const response = await api.post<{ data: T }>(url, body);
  return response.data.data;
}

export async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const response = await api.put<{ data: T }>(url, body);
  return response.data.data;
}

export async function apiDelete(url: string): Promise<void> {
  await api.delete(url);
}

/**
 * Para "obtener por id": si no existe (404) o el id no es válido (400) devuelve undefined,
 * igual que los servicios de la EP1. Así las pantallas muestran "no encontrado".
 */
export async function orUndefined<T>(request: Promise<T>): Promise<T | undefined> {
  try {
    return await request;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return undefined;
    throw err;
  }
}

/** Arma una ruta con un id de forma segura, ej. path('/libros', '3') → '/libros/3' */
export const path = (base: string, id: string) => `${base}/${encodeURIComponent(id)}`;
