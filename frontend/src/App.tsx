import { IonApp, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import AppMenu from './components/AppMenu';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

import '@ionic/react/css/core.css';

import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Tema del proyecto */
import './theme/variables.css';
import './theme/global.css';

setupIonicReact();

/**
 * IonSplitPane muestra el menú lateral fijo en pantallas grandes (web)
 * y lo convierte en menú desplegable en móvil.
 */
const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonSplitPane contentId="main" when="lg">
          <AppMenu />
          <AppRoutes />
        </IonSplitPane>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
