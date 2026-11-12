/**
 * Layout del Administrador. Agrupa las rutas /admin/* en un IonRouterOutlet
 * anidado; la navegación es el menú lateral (AppMenu), fijo en web y
 * desplegable con el botón de menú en móvil.
 */
import { IonRouterOutlet } from '@ionic/react';
import { Navigate, Route } from 'react-router-dom';
import AdminBookFormPage from '../pages/admin/AdminBookFormPage';
import AdminBooksPage from '../pages/admin/AdminBooksPage';
import AdminChapterFormPage from '../pages/admin/AdminChapterFormPage';
import AdminChaptersPage from '../pages/admin/AdminChaptersPage';
import AdminCharacterFormPage from '../pages/admin/AdminCharacterFormPage';
import AdminCharactersPage from '../pages/admin/AdminCharactersPage';
import AdminHomePage from '../pages/admin/AdminHomePage';
import AdminSimulationFormPage from '../pages/admin/AdminSimulationFormPage';
import AdminSimulationsPage from '../pages/admin/AdminSimulationsPage';

const AdminLayout: React.FC = () => (
  // `ionPage` es obligatorio en un outlet anidado que se renderiza directo desde una Route.
  <IonRouterOutlet ionPage>
    <Route index element={<AdminHomePage />} />
    <Route path="books" element={<AdminBooksPage />} />
    <Route path="books/create" element={<AdminBookFormPage />} />
    <Route path="books/:id/edit" element={<AdminBookFormPage />} />
    <Route path="characters" element={<AdminCharactersPage />} />
    <Route path="characters/create" element={<AdminCharacterFormPage />} />
    <Route path="characters/:id/edit" element={<AdminCharacterFormPage />} />
    <Route path="chapters" element={<AdminChaptersPage />} />
    <Route path="chapters/create" element={<AdminChapterFormPage />} />
    <Route path="chapters/:id/edit" element={<AdminChapterFormPage />} />
    <Route path="simulations" element={<AdminSimulationsPage />} />
    <Route path="simulations/create" element={<AdminSimulationFormPage />} />
    <Route path="simulations/:id/edit" element={<AdminSimulationFormPage />} />
    <Route path="*" element={<Navigate to="/admin" replace />} />
  </IonRouterOutlet>
);

export default AdminLayout;
