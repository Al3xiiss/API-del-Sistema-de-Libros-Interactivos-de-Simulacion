/**
 * Contexto global de sesión: expone el usuario autenticado y su rol
 * a los guardias de ruta, al menú y a las páginas.
 */
import { createContext, ReactNode, useContext, useState } from 'react';
import * as authService from '../services/authService';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { alias: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // La sesión se recupera al recargar la página.
  const [user, setUser] = useState<User | null>(() => authService.getSession());

  const login = async (email: string, password: string) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    authService.logout();
    // Recarga completa: Ionic mantiene las páginas visitadas en memoria;
    // así ninguna vista privada queda montada después de cerrar sesión.
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register: authService.register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
