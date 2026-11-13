/** Gestión de recursos multimedia (EF): videos y audios de apoyo asociados a un capítulo. */
import {
  IonButton, IonCol, IonContent, IonFooter, IonGrid, IonIcon, IonPage, IonRow, IonSkeletonText, IonToolbar,
  useIonAlert, useIonToast,
} from '@ionic/react';
import { addOutline, playCircleOutline } from 'ionicons/icons';
import { useState } from 'react';
import AdminItemCard from '../../components/AdminItemCard';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { deleteResource } from '../../services/adminContentService';
import { getAllChapters, getBooks, getResources } from '../../services/bookService';
import { Book, Chapter, Resource } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const AdminResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const load = () =>
    Promise.all([getResources(), getAllChapters(), getBooks()]).then(([list, chapterList, bookList]) => {
      setChapters(chapterList);
      setBooks(bookList);
      setResources(list);
    });
  usePageEnter(() => { load(); });

  const chapterLabel = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return 'Sin capítulo';
    const book = books.find((b) => b.id === chapter.bookId);
    return `${book?.title ?? 'Libro'} · Capítulo ${chapter.number}`;
  };

  const confirmDelete = (resource: Resource) =>
    presentAlert({
      header: 'Eliminar recurso',
      message: `¿Seguro que quieres eliminar "${resource.title}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await deleteResource(resource.id);
              presentToast({ message: 'Recurso eliminado.', duration: 2000, position: 'top' });
              load();
            } catch (err) {
              presentToast({ message: (err as Error).message, duration: 3000, color: 'danger', position: 'top' });
            }
          },
        },
      ],
    });

  return (
    <IonPage>
      <PageHeader title="Gestión de recursos" />
      <IonContent className="ion-padding">
        <div className="page-container">
          {resources === null && <IonSkeletonText animated className="skeleton-card" />}
          {resources?.length === 0 && (
            <EmptyState icon={playCircleOutline} title="No hay recursos" message="Agrega un video o un audio de apoyo para un capítulo." />
          )}
          <IonGrid className="ion-no-padding">
            <IonRow>
              {resources?.map((resource) => (
                <IonCol size="12" sizeMd="6" key={resource.id}>
                  <AdminItemCard
                    title={resource.title}
                    subtitle={`${resource.type === 'video' ? 'Video' : 'Audio'} · ${chapterLabel(resource.chapterId)}`}
                    detail={resource.url ?? 'Sin enlace: se muestra el reproductor de vista previa'}
                    editHref={`/admin/resources/${resource.id}/edit`}
                    onDelete={() => confirmDelete(resource)}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar className="footer-actions">
          <IonButton expand="block" routerLink="/admin/resources/create">
            <IonIcon aria-hidden="true" slot="start" icon={addOutline} />
            Nuevo recurso
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default AdminResourcesPage;