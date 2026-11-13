/**
 * Recordatorio diario de lectura (EF1: notificaciones).
 * Usa la API de notificaciones del navegador. El aviso llega mientras la app esté abierta,
 * aunque esté en otra pestaña o minimizada. La preferencia se guarda en el dispositivo (localStorage).
 */
import { readJSON, writeJSON } from './storage';

export interface ReminderSettings {
  enabled: boolean;
  /** Hora del aviso, "HH:MM" (24 horas). */
  time: string;
}

const DEFAULT_SETTINGS: ReminderSettings = { enabled: false, time: '19:00' };
/** Evento que avisa al programador del recordatorio que cambió la preferencia. */
export const REMINDER_CHANGED_EVENT = 'li-recordatorio';

const settingsKey = (userId: string) => `li.recordatorio.${userId}`;

export const getReminderSettings = (userId: string): ReminderSettings =>
  readJSON<ReminderSettings>(settingsKey(userId), DEFAULT_SETTINGS);

export function saveReminderSettings(userId: string, settings: ReminderSettings): void {
  writeJSON(settingsKey(userId), settings);
  window.dispatchEvent(new Event(REMINDER_CHANGED_EVENT));
}

export const notificationsSupported = (): boolean => typeof window !== 'undefined' && 'Notification' in window;

/** Pide permiso para mostrar notificaciones. Devuelve true si el usuario lo concede. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

/** Milisegundos desde `now` hasta la próxima vez que el reloj marque `time` ("HH:MM"). */
export function msUntilNext(time: string, now: Date = new Date()): number {
  const [hours, minutes] = time.split(':').map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

/** Muestra la notificación del recordatorio. Devuelve false si no se pudo mostrar. */
export function showReadingReminder(): boolean {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false;
  try {
    const notification = new Notification('Libros Interactivos', {
      body: '¿Seguimos con la historia? Tu próximo capítulo te espera.',
      icon: '/favicon.png',
      tag: 'recordatorio-lectura', // con varias pestañas abiertas, se muestra una sola
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch {
    // Algunos navegadores móviles solo permiten notificaciones desde un service worker.
    return false;
  }
}
