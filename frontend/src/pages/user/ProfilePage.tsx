/** Perfil del usuario, recordatorio de lectura (EF1: notificaciones) y cierre de sesión (FT-03). */
import {
  IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonPage, IonToggle,
  useIonAlert, useIonToast,
} from '@ionic/react';
import { logOutOutline, notificationsOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import {
  getReminderSettings, notificationsSupported, ReminderSettings, requestNotificationPermission,
  saveReminderSettings, showReadingReminder,
} from '../../services/reminderService';

const PERMISO_DENEGADO =
  'Para recibir el recordatorio, permite las notificaciones de este sitio en la configuración del navegador.';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const [reminder, setReminder] = useState<ReminderSettings>(() =>
    user ? getReminderSettings(user.id) : { enabled: false, time: '19:00' });
  const supported = notificationsSupported();

  const updateReminder = (settings: ReminderSettings) => {
    setReminder(settings);
    if (user) saveReminderSettings(user.id, settings);
  };

  const toggleReminder = async (enabled: boolean) => {
    if (enabled && !(await requestNotificationPermission())) {
      setReminder((r) => ({ ...r, enabled: false }));
      presentToast({ message: PERMISO_DENEGADO, duration: 4000, color: 'warning', position: 'top' });
      return;
    }
    updateReminder({ ...reminder, enabled });
    if (enabled) {
      presentToast({ message: `Te recordaremos leer todos los días a las ${reminder.time}.`, duration: 2500, color: 'success', position: 'top' });
    }
  };

  const changeTime = (time: string | null | undefined) => {
    if (time && /^\d{2}:\d{2}$/.test(time)) updateReminder({ ...reminder, time });
  };

  const testNotification = () => {
    if (!showReadingReminder()) {
      presentToast({ message: PERMISO_DENEGADO, duration: 4000, color: 'warning', position: 'top' });
    }
  };

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

          <IonList inset>
            <IonListHeader>
              <IonLabel>Recordatorio de lectura</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonToggle
                checked={reminder.enabled}
                disabled={!supported}
                onIonChange={(e) => toggleReminder(e.detail.checked)}
              >
                Recordarme leer cada día
              </IonToggle>
            </IonItem>
            <IonItem lines="none">
              <IonInput
                type="time"
                label="Hora del aviso"
                value={reminder.time}
                disabled={!reminder.enabled}
                onIonChange={(e) => changeTime(e.detail.value)}
              />
            </IonItem>
          </IonList>
          <p className="small-note reminder-note">
            {supported
              ? 'El aviso llega como notificación del navegador mientras la app esté abierta, aunque estés en otra pestaña.'
              : 'Este navegador no permite notificaciones.'}
          </p>
          {reminder.enabled && (
            <IonButton expand="block" fill="clear" onClick={testNotification}>
              <IonIcon aria-hidden="true" slot="start" icon={notificationsOutline} />
              Probar notificación
            </IonButton>
          )}

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
