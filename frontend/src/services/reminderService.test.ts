/**
 * Pruebas del recordatorio diario de lectura (services/reminderService.ts, EF1).
 * jsdom no trae la API de notificaciones: se reemplaza por una clase falsa que guarda lo que se mostró.
 * Ejecutar: npm run test.unit -- --run
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getReminderSettings, msUntilNext, REMINDER_CHANGED_EVENT, requestNotificationPermission,
  saveReminderSettings, showReadingReminder,
} from './reminderService';

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;

describe('msUntilNext', () => {
  const ahora = new Date(2026, 10, 13, 18, 30); // 13 de noviembre, 18:30 (hora local)

  it('si la hora todavía no pasa, programa el aviso para hoy', () => {
    expect(msUntilNext('19:00', ahora)).toBe(30 * MINUTO);
  });

  it('si la hora ya pasó, programa el aviso para mañana', () => {
    expect(msUntilNext('08:15', ahora)).toBe(13 * HORA + 45 * MINUTO);
  });

  it('justo a la hora del aviso, el siguiente es en 24 horas', () => {
    expect(msUntilNext('18:30', ahora)).toBe(24 * HORA);
  });

  it('funciona con el cambio de día (23:59 → 00:00)', () => {
    expect(msUntilNext('00:00', new Date(2026, 10, 13, 23, 59))).toBe(MINUTO);
  });
});

describe('preferencia del recordatorio', () => {
  beforeEach(() => localStorage.clear());

  it('por defecto está desactivado, a las 19:00', () => {
    expect(getReminderSettings('7')).toEqual({ enabled: false, time: '19:00' });
  });

  it('se guarda por usuario y avisa al programador que cambió', () => {
    const cambio = vi.fn();
    window.addEventListener(REMINDER_CHANGED_EVENT, cambio);

    saveReminderSettings('7', { enabled: true, time: '08:30' });

    expect(getReminderSettings('7')).toEqual({ enabled: true, time: '08:30' });
    expect(getReminderSettings('8')).toEqual({ enabled: false, time: '19:00' });
    expect(cambio).toHaveBeenCalledTimes(1);
    window.removeEventListener(REMINDER_CHANGED_EVENT, cambio);
  });
});

describe('notificación del navegador', () => {
  const mostradas: { title: string; options?: NotificationOptions }[] = [];

  /** Instala una API de notificaciones falsa con el permiso indicado. */
  function notificacionesFalsas(permiso: NotificationPermission, respuesta: NotificationPermission = permiso) {
    class NotificacionFalsa {
      static permission = permiso;
      static requestPermission = vi.fn(async () => respuesta);
      onclick: (() => void) | null = null;
      constructor(title: string, options?: NotificationOptions) {
        mostradas.push({ title, options });
      }
      close() {}
    }
    vi.stubGlobal('Notification', NotificacionFalsa);
    return NotificacionFalsa;
  }

  beforeEach(() => { mostradas.length = 0; });
  afterEach(() => vi.unstubAllGlobals());

  it('con permiso, muestra el recordatorio una sola vez aunque haya varias pestañas (tag)', () => {
    notificacionesFalsas('granted');

    expect(showReadingReminder()).toBe(true);
    expect(mostradas[0].title).toBe('Libros Interactivos');
    expect(mostradas[0].options?.body).toContain('¿Seguimos con la historia?');
    expect(mostradas[0].options?.tag).toBe('recordatorio-lectura');
  });

  it('sin permiso, no muestra nada y devuelve false', () => {
    notificacionesFalsas('denied');

    expect(showReadingReminder()).toBe(false);
    expect(mostradas).toHaveLength(0);
  });

  it('pide permiso solo si el usuario todavía no decidió', async () => {
    const aceptada = notificacionesFalsas('default', 'granted');
    expect(await requestNotificationPermission()).toBe(true);
    expect(aceptada.requestPermission).toHaveBeenCalledTimes(1);

    const bloqueada = notificacionesFalsas('denied');
    expect(await requestNotificationPermission()).toBe(false);
    expect(bloqueada.requestPermission).not.toHaveBeenCalled();
  });
});
