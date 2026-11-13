/**
 * Pruebas del almacenamiento local para leer sin conexión (services/offlineCache.ts, EF1).
 * Ejecutar: npm run test.unit -- --run
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './api';
import { onConnectionChange, withOfflineCache } from './offlineCache';
import { clearSession, saveSession } from './session';

const PACIENTE = { id: '7', alias: 'elena_r', email: 'paciente@demo.cl', role: 'patient' as const };
const OTRO_PACIENTE = { ...PACIENTE, id: '8', alias: 'tomas' };
const CAPITULO = { id: '1', title: 'El primer día', paragraphs: ['Texto del capítulo'] };

/** Así falla una petición sin conexión: ApiError sin código HTTP (ver interceptor en api.ts). */
const sinConexion = () => Promise.reject(new ApiError('No pudimos conectar con el servidor.'));

describe('withOfflineCache', () => {
  beforeEach(() => {
    localStorage.clear();
    saveSession('token', PACIENTE);
  });

  it('con conexión devuelve la respuesta de la API y guarda una copia', async () => {
    const data = await withOfflineCache('capitulo.1', () => Promise.resolve(CAPITULO));

    expect(data).toEqual(CAPITULO);
    expect(JSON.parse(localStorage.getItem('li.cache.7.capitulo.1')!)).toEqual(CAPITULO);
  });

  it('sin conexión devuelve la copia guardada y avisa que no hay conexión', async () => {
    await withOfflineCache('capitulo.1', () => Promise.resolve(CAPITULO));
    const aviso = vi.fn();
    const dejarDeEscuchar = onConnectionChange(aviso);

    const data = await withOfflineCache('capitulo.1', sinConexion);

    expect(data).toEqual(CAPITULO);
    expect(aviso).toHaveBeenCalledWith(true);
    dejarDeEscuchar();
  });

  it('sin conexión y sin copia (capítulo nunca abierto) lanza el error', async () => {
    await expect(withOfflineCache('capitulo.2', sinConexion)).rejects.toBeInstanceOf(ApiError);
  });

  it('no oculta los errores de la API (por ejemplo 403) aunque exista una copia', async () => {
    await withOfflineCache('capitulo.1', () => Promise.resolve(CAPITULO));

    await expect(
      withOfflineCache('capitulo.1', () => Promise.reject(new ApiError('No tienes permiso', 403))),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('si el recurso ya no existe (404 → undefined) borra su copia', async () => {
    await withOfflineCache('capitulo.1', () => Promise.resolve(CAPITULO));

    await withOfflineCache('capitulo.1', () => Promise.resolve(undefined));

    expect(localStorage.getItem('li.cache.7.capitulo.1')).toBeNull();
  });

  it('la copia es de cada paciente: otro usuario en el mismo dispositivo no la ve', async () => {
    await withOfflineCache('capitulo.1', () => Promise.resolve(CAPITULO));
    saveSession('token-2', OTRO_PACIENTE);

    await expect(withOfflineCache('capitulo.1', sinConexion)).rejects.toBeInstanceOf(ApiError);
  });

  it('al cerrar sesión se borra la copia local, pero no otros datos del navegador', async () => {
    await withOfflineCache('libros', () => Promise.resolve([CAPITULO]));
    await withOfflineCache('capitulo.1', () => Promise.resolve(CAPITULO));
    localStorage.setItem('otra-app', 'se mantiene');

    clearSession();

    expect(Object.keys(localStorage).filter((key) => key.startsWith('li.cache.'))).toEqual([]);
    expect(localStorage.getItem('li.token')).toBeNull();
    expect(localStorage.getItem('otra-app')).toBe('se mantiene');
  });
});
