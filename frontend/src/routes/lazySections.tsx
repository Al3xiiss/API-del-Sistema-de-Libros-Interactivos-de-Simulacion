/**
 * Carga diferida por sección (EF2: rendimiento).
 * El login solo descarga su propio código. Las pantallas del paciente y las del administrador
 * van en archivos aparte que se descargan la primera vez que se necesitan.
 *
 * Se divide por sección y no por pantalla: al entrar, el paciente descarga todas sus pantallas
 * de una vez, así la lectura sin conexión (EF1) sigue funcionando al cambiar de pantalla.
 */
import { ComponentType, lazy, useState } from 'react';
import { Role } from '../types';

function lazyWithPreload(loader: () => Promise<{ default: ComponentType }>) {
  let Loaded: ComponentType | undefined;
  let pending: Promise<void> | undefined;

  const preload = () =>
    (pending ??= loader().then(
      (module) => { Loaded = module.default; },
      (err) => { pending = undefined; throw err; }, // si falla la descarga, se puede reintentar
    ));

  const Lazy = lazy(() => preload().then(() => ({ default: Loaded! })));

  // Si la sección ya se descargó, se muestra de inmediato, sin pasar por el indicador de carga.
  // Así la transición de Ionic desde el login no queda con la página en blanco.
  // Se elige una sola vez: cambiar de componente después desmontaría todas las pantallas abiertas.
  const Section: React.FC = () => {
    const [Component] = useState<ComponentType>(() => Loaded ?? Lazy);
    return <Component />;
  };
  return Object.assign(Section, { preload });
}

export const UserLayout = lazyWithPreload(() => import('../layouts/UserLayout'));
export const AdminLayout = lazyWithPreload(() => import('../layouts/AdminLayout'));

/** Descarga la sección del rol antes de navegar a ella (se usa al iniciar sesión). */
export const preloadSection = (role: Role) => (role === 'admin' ? AdminLayout : UserLayout).preload();
