import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

/**
 * Ruta protegida por rol (FT-04): sin sesión va a /login;
 * con un rol distinto al requerido va a /unauthorized.
 */
const RoleRoute: React.FC<{ role: Role; children: ReactNode }> = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};

export default RoleRoute;
