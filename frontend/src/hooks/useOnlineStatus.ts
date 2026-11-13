import { useEffect, useState } from 'react';
import { onConnectionChange } from '../services/offlineCache';

/**
 * true si hay conexión. Escucha los eventos online/offline del navegador y, además,
 * se marca sin conexión cuando la API no responde por falta de red (EF1).
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    const stopListening = onConnectionChange((offline) => setOnline(!offline));
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      stopListening();
    };
  }, []);

  return online;
}
