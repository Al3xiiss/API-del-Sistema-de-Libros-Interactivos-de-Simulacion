/**
 * Mapa de rutas de la aplicación (ver "Arquitectura de Navegación" en el README).
 * Las rutas del paciente viven dentro de UserLayout y las del administrador
 * dentro de AdminLayout, cada una con su propio IonRouterOutlet anidado.
 */
import { IonRouterOutlet } from '@ionic/react';
import { Navigate, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';
import UnauthorizedPage from '../pages/common/UnauthorizedPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import PrivateRoute from './PrivateRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import RoleRoute from './RoleRoute';

const AppRoutes: React.FC = () => (
  <IonRouterOutlet id="main">
    {/* Rutas públicas */}
    <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route path="/" element={<Navigate to="/login" replace />} />

    {/* Rutas protegidas del Administrador: /admin, /admin/books, ... */}
    <Route path="/admin/*" element={<RoleRoute role="admin"><AdminLayout /></RoleRoute>} />

    {/*
      Rutas protegidas del Paciente: /app/home, /app/books/:id, /app/chapters/:id, ...
      Van bajo el prefijo /app porque en Ionic 9 un layout con pestañas en la raíz ("/*")
      captura todas las rutas y rompe la transición desde /login (la página queda invisible).
    */}
    <Route path="/app/*" element={<PrivateRoute><UserLayout /></PrivateRoute>} />

    {/* Cualquier otra ruta */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </IonRouterOutlet>
);

export default AppRoutes;
