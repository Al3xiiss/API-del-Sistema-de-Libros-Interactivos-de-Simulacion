import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon } from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';

interface AdminItemCardProps {
  title: string;
  subtitle: string;
  detail?: string;
  editHref: string;
  onDelete: () => void;
}

/** Tarjeta con acciones Editar / Eliminar, usada en la gestión de libros y personajes. */
const AdminItemCard: React.FC<AdminItemCardProps> = ({ title, subtitle, detail, editHref, onDelete }) => (
  <IonCard>
    <IonCardHeader>
      <IonCardTitle>{title}</IonCardTitle>
      <IonCardSubtitle>{subtitle}</IonCardSubtitle>
    </IonCardHeader>
    <IonCardContent>
      {detail && <p className="admin-card-detail">{detail}</p>}
      <div className="card-actions">
        <IonButton fill="outline" routerLink={editHref}>
          <IonIcon aria-hidden="true" slot="start" icon={createOutline} />
          Editar
        </IonButton>
        <IonButton fill="outline" color="danger" onClick={onDelete}>
          <IonIcon aria-hidden="true" slot="start" icon={trashOutline} />
          Eliminar
        </IonButton>
      </div>
    </IonCardContent>
  </IonCard>
);

export default AdminItemCard;
