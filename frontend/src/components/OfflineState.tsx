import { IonButton } from '@ionic/react';
import { cloudOfflineOutline } from 'ionicons/icons';
import { ReactNode } from 'react';
import EmptyState from './EmptyState';

interface OfflineStateProps {
  message: string;
  /** Botón de acción; por defecto, volver al inicio. */
  children?: ReactNode;
}

/** Sin conexión y el contenido todavía no está guardado en el dispositivo (EF1). */
const OfflineState: React.FC<OfflineStateProps> = ({ message, children }) => (
  <EmptyState icon={cloudOfflineOutline} title="Sin conexión" message={message}>
    {children ?? <IonButton routerLink="/app/home" routerDirection="root">Ir al inicio</IonButton>}
  </EmptyState>
);

export default OfflineState;
