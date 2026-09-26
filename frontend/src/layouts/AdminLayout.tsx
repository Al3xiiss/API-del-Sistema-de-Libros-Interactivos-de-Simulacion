/**
 * Layout del Administrador. Agrupa las rutas /admin/* en un IonRouterOutlet
 * anidado; la navegación es el menú lateral (AppMenu), fijo en web y
 * desplegable con el botón de menú en móvil.
 */
import { IonRouterOutlet } from '@ionic/react';
import { Navigate, Route } from 'react-router-dom';
import AdminBookFormPage from '../pages/admin/AdminBookFormPage';
import AdminBooksPage from '../pages/admin/AdminBooksPage';
import AdminCharacterFormPage from '../pages/admin/AdminCharacterFormPage';
import AdminCharactersPage from '../pages/admin/AdminCharactersPage';
import AdminHomePage from '../pages/admin/AdminHomePage';

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
    <Route path="*" element={<Navigate to="/admin" replace />} />
  </IonRouterOutlet>
);

export default AdminLayout;
