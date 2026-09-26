/**
 * Layout del Paciente. En móvil muestra IonTabs con la barra inferior
 * (navegación con el pulgar). En pantallas grandes la barra se oculta
 * y se usa el menú lateral (AppMenu) que muestra IonSplitPane.
 */
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { homeOutline, personOutline, playCircleOutline, statsChartOutline } from 'ionicons/icons';
import { Route } from 'react-router-dom';
import NotFoundPage from '../pages/common/NotFoundPage';
import BookDetailPage from '../pages/user/BookDetailPage';
import ChapterPage from '../pages/user/ChapterPage';
import DecisionPage from '../pages/user/DecisionPage';
import HomePage from '../pages/user/HomePage';
import ProfilePage from '../pages/user/ProfilePage';
import ProgressPage from '../pages/user/ProgressPage';
import ResourcesPage from '../pages/user/ResourcesPage';
import SimulationPage from '../pages/user/SimulationPage';

const UserLayout: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="home" element={<HomePage />} />
      <Route path="books/:id" element={<BookDetailPage />} />
      <Route path="chapters/:id" element={<ChapterPage />} />
      <Route path="chapters/:id/resources" element={<ResourcesPage />} />
      <Route path="simulation/:id" element={<SimulationPage />} />
      <Route path="decision/:id" element={<DecisionPage />} />
      <Route path="resources" element={<ResourcesPage />} />
      <Route path="progress" element={<ProgressPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </IonRouterOutlet>

    <IonTabBar slot="bottom" className="ion-hide-lg-up">
      <IonTabButton tab="home" href="/app/home">
        <IonIcon aria-hidden="true" icon={homeOutline} />
        <IonLabel>Inicio</IonLabel>
      </IonTabButton>
      <IonTabButton tab="resources" href="/app/resources">
        <IonIcon aria-hidden="true" icon={playCircleOutline} />
        <IonLabel>Recursos</IonLabel>
      </IonTabButton>
      <IonTabButton tab="progress" href="/app/progress">
        <IonIcon aria-hidden="true" icon={statsChartOutline} />
        <IonLabel>Progreso</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/app/profile">
        <IonIcon aria-hidden="true" icon={personOutline} />
        <IonLabel>Perfil</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

export default UserLayout;
