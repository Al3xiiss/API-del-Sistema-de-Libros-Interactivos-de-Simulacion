import { IonBackButton, IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/react';
import OfflineBanner from './OfflineBanner';

interface PageHeaderProps {
  title: string;
  /** Si se indica, muestra "volver" (con esta ruta por defecto); si no, el botón de menú. */
  backHref?: string;
}

/** Encabezado común de las páginas internas. */
const PageHeader: React.FC<PageHeaderProps> = ({ title, backHref }) => (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        {backHref ? <IonBackButton defaultHref={backHref} text="Volver" /> : <IonMenuButton />}
      </IonButtons>
      <IonTitle>{title}</IonTitle>
    </IonToolbar>
    {/* Bajo el título y no flotando: así nunca tapa los botones de la página (EF1) */}
    <OfflineBanner />
  </IonHeader>
);

export default PageHeader;
