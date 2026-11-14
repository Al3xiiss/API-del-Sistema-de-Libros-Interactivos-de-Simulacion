/** Aviso bajo el encabezado cuando no hay conexión: el paciente sigue leyendo con la copia guardada en el dispositivo (EF1). */
import { IonIcon } from '@ionic/react';
import { cloudOfflineOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const OfflineBanner: React.FC = () => {
  const online = useOnlineStatus();
  const { user } = useAuth();
  if (online) return null;
  return (
    <div className="offline-banner" role="status">
      <IonIcon aria-hidden="true" icon={cloudOfflineOutline} />
      {user?.role === 'patient'
        ? 'Sin conexión. Puedes seguir leyendo los capítulos que ya abriste.'
        : 'Sin conexión. Revisa tu internet para continuar.'}
    </div>
  );
};

export default OfflineBanner;
