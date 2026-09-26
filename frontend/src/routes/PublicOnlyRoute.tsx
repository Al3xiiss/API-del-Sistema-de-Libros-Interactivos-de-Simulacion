import { ReactNode, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeForRole } from '../services/authService';

/**
 * Rutas solo para visitantes (/login, /register). Si ya hay sesión al entrar,
 * redirige a /home (Paciente) o /admin (Administrador).
 *
 * Se evalúa solo al montar la vista: justo después de iniciar sesión es
 * LoginPage quien navega (con la animación de Ionic). Si esta vista se
 * reemplazara por <Navigate> mientras está visible, Ionic no terminaría
 * la transición y la siguiente página quedaría invisible.
 */
const PublicOnlyRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userOnEnter] = useState(user);
  if (userOnEnter) return <Navigate to={homeForRole(userOnEnter.role)} replace />;
  return <>{children}</>;
};

export default PublicOnlyRoute;
