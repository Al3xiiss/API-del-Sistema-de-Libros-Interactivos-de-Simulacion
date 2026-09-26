import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Ruta protegida: sin sesión, redirige a /login (FT-02). Cualquier rol autenticado puede entrar. */
const PrivateRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default PrivateRoute;
