/**
 * Menú lateral (IonMenu). Sus opciones dependen del rol del usuario en sesión,
 * así el paciente nunca ve opciones de gestión.
 */
import {
  IonContent, IonFooter, IonIcon, IonItem, IonLabel, IonList, IonListHeader,
  IonMenu, IonMenuToggle, IonNote, IonToolbar,
} from '@ionic/react';
import {
  bookOutline, gridOutline, homeOutline, logOutOutline, peopleOutline,
  personOutline, playCircleOutline, statsChartOutline,
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PATIENT_ITEMS = [
  { title: 'Inicio', url: '/app/home', icon: homeOutline },
  { title: 'Recursos', url: '/app/resources', icon: playCircleOutline },
  { title: 'Mi progreso', url: '/app/progress', icon: statsChartOutline },
  { title: 'Perfil', url: '/app/profile', icon: personOutline },
];

const ADMIN_ITEMS = [
  { title: 'Panel', url: '/admin', icon: gridOutline },
  { title: 'Gestión de libros', url: '/admin/books', icon: bookOutline },
  { title: 'Gestión de personajes', url: '/admin/characters', icon: peopleOutline },
];

const AppMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Sin sesión no hay menú (login y registro ocupan toda la pantalla).
  if (!user) return null;

  const items = user.role === 'admin' ? ADMIN_ITEMS : PATIENT_ITEMS;

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList lines="none" className="menu-list">
          <IonListHeader>Libros Interactivos</IonListHeader>
          <IonNote className="ion-padding-start">
            {user.alias} · {user.role === 'admin' ? 'Administrador' : 'Paciente'}
          </IonNote>
          {items.map((item) => (
            <IonMenuToggle key={item.url} autoHide={false}>
              <IonItem
                routerLink={item.url}
                routerDirection="root"
                detail={false}
                className={location.pathname === item.url ? 'selected' : ''}
              >
                <IonIcon aria-hidden="true" slot="start" icon={item.icon} />
                <IonLabel>{item.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonItem button detail={false} lines="none" onClick={logout}>
            <IonIcon aria-hidden="true" slot="start" icon={logOutOutline} />
            <IonLabel>Cerrar sesión</IonLabel>
          </IonItem>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  );
};

export default AppMenu;
