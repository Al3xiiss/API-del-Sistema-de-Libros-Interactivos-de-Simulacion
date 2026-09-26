import { IonIcon } from '@ionic/react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  /** Botones de acción opcionales. */
  children?: ReactNode;
}

/** Estado vacío o de error: evita pantallas en blanco (punto crítico 3 del README). */
const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, children }) => (
  <div className="empty-state" role="status">
    <IonIcon aria-hidden="true" icon={icon} className="empty-state-icon" />
    <h2>{title}</h2>
    <p>{message}</p>
    {children}
  </div>
);

export default EmptyState;
