import { IonButton, IonSpinner } from '@ionic/react';
import { Component, ReactNode, Suspense } from 'react';

/** Si no se pudo descargar la sección (por ejemplo, sin conexión), lo explica en vez de dejar la pantalla en blanco. */
class SectionErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="section-loader" role="alert">
        <p>No pudimos cargar esta sección. Revisa tu conexión e inténtalo de nuevo.</p>
        <IonButton onClick={() => window.location.reload()}>Reintentar</IonButton>
      </div>
    );
  }
}

/** Envuelve una sección con carga diferida (EF2): muestra un indicador mientras se descarga. */
const SectionLoader: React.FC<{ children: ReactNode }> = ({ children }) => (
  <SectionErrorBoundary>
    <Suspense
      fallback={
        <div className="section-loader" role="status">
          <IonSpinner name="crescent" aria-label="Cargando" />
        </div>
      }
    >
      {children}
    </Suspense>
  </SectionErrorBoundary>
);

export default SectionLoader;
