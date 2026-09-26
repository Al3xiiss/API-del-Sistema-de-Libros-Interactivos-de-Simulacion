/** Perfil del usuario y cierre de sesión (FT-03). */
import { IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonNote, IonPage, useIonAlert } from '@ionic/react';
import { logOutOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [presentAlert] = useIonAlert();

  const confirmLogout = () =>
    presentAlert({
      header: '¿Cerrar sesión?',
      message: 'Tu progreso queda guardado.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cerrar sesión', role: 'destructive', handler: logout },
      ],
    });

  return (
    <IonPage>
      <PageHeader title="Perfil" />
      <IonContent className="ion-padding">
        <div className="page-container narrow">
          <IonList inset>
            <IonItem>
              <IonLabel>
                <IonNote>Nombre de usuario</IonNote>
                <h2>{user?.alias}</h2>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <IonNote>Correo electrónico</IonNote>
                <h2>{user?.email}</h2>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <IonNote>Rol</IonNote>
                <h2>{user?.role === 'admin' ? 'Administrador' : 'Paciente'}</h2>
              </IonLabel>
            </IonItem>
          </IonList>

          <p className="privacy-note">
            <IonIcon aria-hidden="true" icon={shieldCheckmarkOutline} />
            Solo tú puedes ver tu progreso y tus decisiones.
          </p>

          <IonButton expand="block" fill="outline" color="danger" onClick={confirmLogout}>
            <IonIcon aria-hidden="true" slot="start" icon={logOutOutline} />
            Cerrar sesión
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
