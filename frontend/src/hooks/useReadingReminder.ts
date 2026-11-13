import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getReminderSettings, msUntilNext, REMINDER_CHANGED_EVENT, showReadingReminder,
} from '../services/reminderService';

/** Programa el recordatorio diario de lectura del paciente mientras la app esté abierta (EF1). */
export function useReadingReminder(): void {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);

  // Si el paciente cambia la hora o lo desactiva en Perfil, se vuelve a programar
  useEffect(() => {
    const reschedule = () => setVersion((v) => v + 1);
    window.addEventListener(REMINDER_CHANGED_EVENT, reschedule);
    return () => window.removeEventListener(REMINDER_CHANGED_EVENT, reschedule);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    const { enabled, time } = getReminderSettings(user.id);
    if (!enabled) return undefined;

    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        showReadingReminder();
        schedule(); // el de mañana
      }, msUntilNext(time));
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [user, version]);
}
