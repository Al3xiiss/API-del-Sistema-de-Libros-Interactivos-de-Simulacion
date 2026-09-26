/** Acceso denegado: destino de un paciente que intenta entrar a /admin (FT-04). */
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { lockClosedOutline } from 'ionicons/icons';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { homeForRole } from '../../services/authService';

const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Acceso denegado</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <EmptyState
          icon={lockClosedOutline}
          title="No tienes permisos para ver esta sección"
          message="Esta área es solo para administradores de contenido."
        >
          <IonButton routerLink={user ? homeForRole(user.role) : '/login'} routerDirection="root">
            Volver a mi inicio
          </IonButton>
        </EmptyState>
      </IonContent>
    </IonPage>
  );
};

export default UnauthorizedPage;
