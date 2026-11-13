/**
 * Pruebas de los interceptores de Axios (services/api.ts).
 * No se llama a la API real: un "adaptador" falso reemplaza la conexión HTTP y responde lo que cada prueba necesita.
 * Ejecutar: npm run test.unit -- --run
 */
import { AxiosAdapter, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, apiGet, apiPost } from './api';
import { getToken, saveSession } from './session';

const USUARIO = { id: '1', alias: 'elena_r', email: 'paciente@demo.cl', role: 'patient' as const };

/** Adaptador falso: guarda la petición que recibió y responde con el código y el cuerpo indicados. */
function responder(status: number, data: unknown) {
  const peticiones: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = (config) => {
    peticiones.push(config);
    const response: AxiosResponse = { data, status, statusText: '', headers: {}, config };
    if (status < 400) return Promise.resolve(response);
    return Promise.reject(new AxiosError(`Error ${status}`, AxiosError.ERR_BAD_REQUEST, config, {}, response));
  };
  api.defaults.adapter = adapter;
  return peticiones;
}

/** Adaptador falso que simula que el servidor no responde (sin conexión). */
function sinConexion() {
  api.defaults.adapter = (config) =>
    Promise.reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, {}));
}

/** Ejecuta la petición y devuelve el ApiError con que falló. */
async function errorDe(peticion: Promise<unknown>): Promise<ApiError> {
  try {
    await peticion;
  } catch (err) {
    return err as ApiError;
  }
  throw new Error('Se esperaba que la petición fallara');
}

/** Espera la promesa como máximo `ms`, si no termina, devuelve 'pendiente'. */
const conLimite = <T>(promesa: Promise<T>, ms = 50) =>
  Promise.race([promesa, new Promise<'pendiente'>((resolve) => setTimeout(() => resolve('pendiente'), ms))]);

describe('interceptor de petición', () => {
  beforeEach(() => localStorage.clear());

  it('agrega el token en Authorization cuando hay sesión', async () => {
    saveSession('token-de-prueba', USUARIO);
    const peticiones = responder(200, { data: [] });

    await apiGet('/libros');

    expect(peticiones[0].headers.Authorization).toBe('Bearer token-de-prueba');
  });

  it('no agrega Authorization cuando no hay sesión', async () => {
    const peticiones = responder(200, { data: [] });

    await apiGet('/libros');

    expect(peticiones[0].headers.Authorization).toBeUndefined();
  });
});

describe('interceptor de respuesta', () => {
  const ubicacionOriginal = window.location;
  const replace = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    replace.mockClear();
    // window.location no se puede espiar directamente en jsdom: se reemplaza por un objeto con replace() falso.
    Object.defineProperty(window, 'location', { configurable: true, value: { ...ubicacionOriginal, replace } });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: ubicacionOriginal });
  });

  it('devuelve el primer error de validación de la API (400)', async () => {
    responder(400, {
      error: 'Datos inválidos',
      detalles: [{ campo: 'titulo', mensaje: 'El campo titulo debe tener entre 3 y 80 caracteres' }],
    });

    const error = await errorDe(apiPost('/libros', { titulo: 'A' }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('El campo titulo debe tener entre 3 y 80 caracteres');
  });

  it('devuelve el mensaje "error" de la API cuando no hay detalles (409)', async () => {
    responder(409, { error: 'Debes completar el capítulo anterior antes de completar este' });

    const error = await errorDe(apiPost('/progreso/capitulos/7', { completado: true }));

    expect(error.status).toBe(409);
    expect(error.message).toBe('Debes completar el capítulo anterior antes de completar este');
  });

  it('muestra un mensaje claro si no hay conexión con el servidor', async () => {
    sinConexion();

    const error = await errorDe(apiGet('/libros'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBeUndefined();
    expect(error.message).toBe('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  });

  it('con un 401 en una petición con sesión, cierra la sesión y vuelve al login', async () => {
    saveSession('token-vencido', USUARIO);
    responder(401, { error: 'Sesión inválida o expirada. Vuelve a iniciar sesión' });

    // La promesa queda pendiente a propósito: la página se recarga en /login.
    const resultado = await conLimite(apiGet('/libros'));

    expect(resultado).toBe('pendiente');
    expect(getToken()).toBeNull();
    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('con un 401 en el login (contraseña incorrecta) no redirige y muestra el mensaje', async () => {
    responder(401, { error: 'Correo o contraseña incorrectos' });

    const error = await errorDe(apiPost('/auth/login', { email: 'paciente@demo.cl', password: 'mala' }));

    expect(error.status).toBe(401);
    expect(error.message).toBe('Correo o contraseña incorrectos');
    expect(replace).not.toHaveBeenCalled();
  });

  it('con un 429 (demasiados intentos de login) muestra el mensaje de la API', async () => {
    responder(429, { error: 'Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentar' });

    const error = await errorDe(apiPost('/auth/login', { email: 'paciente@demo.cl', password: 'mala' }));

    expect(error.status).toBe(429);
    expect(error.message).toBe('Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentar');
  });
});