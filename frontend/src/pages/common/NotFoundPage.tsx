/** Ruta inexistente dentro del área del paciente. */
import { IonButton, IonContent, IonPage } from '@ionic/react';
import { compassOutline } from 'ionicons/icons';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';

const NotFoundPage: React.FC = () => (
  <IonPage>
    <PageHeader title="Página no encontrada" />
    <IonContent className="ion-padding">
      <EmptyState icon={compassOutline} title="No encontramos esta página" message="Puede que el enlace haya cambiado.">
        <IonButton routerLink="/app/home" routerDirection="root">Ir al inicio</IonButton>
      </EmptyState>
    </IonContent>
  </IonPage>
);

export default NotFoundPage;
