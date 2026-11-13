/* Gestión de capítulos (EF): lista los capítulos del libro elegido, con acciones para editar y eliminar. */
import {
  IonButton, IonCol, IonContent, IonFooter, IonGrid, IonIcon, IonPage, IonRow, IonSelect, IonSelectOption,
  IonSkeletonText, IonToolbar, useIonAlert, useIonToast,
} from '@ionic/react';
import { addOutline, documentTextOutline } from 'ionicons/icons';
import { useState } from 'react';
import AdminItemCard from '../../components/AdminItemCard';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { deleteChapter } from '../../services/adminContentService';
import { getBooks, getChapters } from '../../services/bookService';
import { Book, Chapter } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const AdminChaptersPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [bookId, setBookId] = useState('');
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const loadChapters = (id: string) => {
    setChapters(null);
    if (!id) {
      setChapters([]);
      return;
    }
    getChapters(id).then(setChapters);
  };

  // Al entrar se recargan los libros, si el libro elegido ya no existe, se elige el primero.
  usePageEnter(() => {
    getBooks().then((list) => {
      setBooks(list);
      const selected = list.some((b) => b.id === bookId) ? bookId : (list[0]?.id ?? '');
      setBookId(selected);
      loadChapters(selected);
    });
  });

  const changeBook = (id: string) => {
    setBookId(id);
    loadChapters(id);
  };

  const confirmDelete = (chapter: Chapter) =>
    presentAlert({
      header: 'Eliminar capítulo',
      message: `¿Seguro que quieres eliminar el capítulo ${chapter.number} "${chapter.title}"? También se eliminarán sus personajes, su simulación, sus recursos y el progreso de los pacientes en él. Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await deleteChapter(chapter.id);
              presentToast({ message: 'Capítulo eliminado.', duration: 2000, position: 'top' });
              loadChapters(bookId);
            } catch (err) {
              presentToast({ message: (err as Error).message, duration: 3000, color: 'danger', position: 'top' });
            }
          },
        },
      ],
    });

  const subtitle = (chapter: Chapter) => {
    const recursos = chapter.resourceCount === 1 ? '1 recurso' : `${chapter.resourceCount ?? 0} recursos`;
    return `${recursos} · ${chapter.simulationId ? 'Con simulación' : 'Sin simulación'}`;
  };

  return (
    <IonPage>
      <PageHeader title="Gestión de capítulos" />
      <IonContent className="ion-padding">
        <div className="page-container">
          <IonSelect
            className="ion-margin-bottom"
            label="Libro"
            labelPlacement="floating"
            fill="outline"
            interface="popover"
            value={bookId}
            onIonChange={(e) => changeBook(e.detail.value)}
          >
            {books.map((book) => (
              <IonSelectOption key={book.id} value={book.id}>{book.title}</IonSelectOption>
            ))}
          </IonSelect>

          {chapters === null && <IonSkeletonText animated className="skeleton-card" />}
          {chapters?.length === 0 && (
            <EmptyState
              icon={documentTextOutline}
              title="Este libro no tiene capítulos"
              message="Crea el primer capítulo para que los pacientes puedan leerlo."
            />
          )}
          <IonGrid className="ion-no-padding">
            <IonRow>
              {chapters?.map((chapter) => (
                <IonCol size="12" sizeMd="6" key={chapter.id}>
                  <AdminItemCard
                    title={`Capítulo ${chapter.number}: ${chapter.title}`}
                    subtitle={subtitle(chapter)}
                    editHref={`/admin/chapters/${chapter.id}/edit`}
                    onDelete={() => confirmDelete(chapter)}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar className="footer-actions">
          <IonButton expand="block" routerLink={`/admin/chapters/create?libro=${bookId}`} disabled={!bookId}>
            <IonIcon aria-hidden="true" slot="start" icon={addOutline} />
            Nuevo capítulo
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default AdminChaptersPage;