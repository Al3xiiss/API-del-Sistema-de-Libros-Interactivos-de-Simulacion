/** Gestión de libros (RF-01). Figma: "Gestión de libros - Móvil". */
import {
  IonButton, IonCol, IonContent, IonFooter, IonGrid, IonIcon, IonPage, IonRow, IonSkeletonText, IonToolbar,
  useIonAlert, useIonToast,
} from '@ionic/react';
import { addOutline, bookOutline } from 'ionicons/icons';
import { useState } from 'react';
import AdminItemCard from '../../components/AdminItemCard';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { chaptersOf, deleteBook, getBooks } from '../../services/bookService';
import { Book } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const AdminBooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const load = () => getBooks().then(setBooks);
  usePageEnter(() => { load(); });

  // Confirmación obligatoria antes de eliminar (README, pantalla 9).
  const confirmDelete = (book: Book) =>
    presentAlert({
      header: 'Eliminar libro',
      message: `¿Seguro que quieres eliminar "${book.title}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await deleteBook(book.id);
            presentToast({ message: 'Libro eliminado.', duration: 2000, position: 'top' });
            load();
          },
        },
      ],
    });

  return (
    <IonPage>
      <PageHeader title="Gestión de libros" />
      <IonContent className="ion-padding">
        <div className="page-container">
          {books === null && <IonSkeletonText animated className="skeleton-card" />}
          {books?.length === 0 && (
            <EmptyState icon={bookOutline} title="No hay libros" message="Crea el primer libro de la plataforma." />
          )}
          <IonGrid className="ion-no-padding">
            <IonRow>
              {books?.map((book) => (
                <IonCol size="12" sizeMd="6" key={book.id}>
                  <AdminItemCard
                    title={book.title}
                    subtitle={`${chaptersOf(book.id).length} capítulos`}
                    detail={book.synopsis}
                    editHref={`/admin/books/${book.id}/edit`}
                    onDelete={() => confirmDelete(book)}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar className="footer-actions">
          <IonButton expand="block" routerLink="/admin/books/create">
            <IonIcon aria-hidden="true" slot="start" icon={addOutline} />
            Nuevo libro
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default AdminBooksPage;
