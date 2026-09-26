import { useEffect } from 'react';
import { useLocation, useResolvedPath } from 'react-router-dom';

/**
 * Ejecuta `onEnter` cada vez que esta página pasa a ser la visible
 * (al entrar por primera vez, al volver con "atrás" o al cambiar de pestaña).
 *
 * ¿Por qué no basta con useEffect o useIonViewWillEnter?
 * - Ionic mantiene montadas las páginas visitadas para conservar su estado,
 *   así que un useEffect normal no se vuelve a ejecutar al regresar.
 * - En Ionic 9, useIonViewWillEnter no se dispara al cambiar de pestaña con IonTabBar.
 * Por eso se compara la URL actual con la URL de esta página.
 */
export function usePageEnter(onEnter: () => void) {
  const { pathname } = useLocation();
  const ownPath = useResolvedPath('.').pathname;
  const isActive = pathname === ownPath;

  useEffect(() => {
    if (isActive) onEnter();
    // Solo debe re-ejecutarse al activarse la página o al cambiar su URL (p. ej. otro :id).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, ownPath]);
}
