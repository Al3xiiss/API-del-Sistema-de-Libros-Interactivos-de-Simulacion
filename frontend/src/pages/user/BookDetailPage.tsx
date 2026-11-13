/** Detalle del libro y lista de capítulos (RF-04). Figma: "Capítulos - Móvil". */
import {
  IonCol, IonContent, IonGrid, IonList, IonPage, IonProgressBar, IonRow, IonSkeletonText,
  useIonRouter, useIonToast,
} from '@ionic/react';
import { alertCircleOutline, documentTextOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ChapterListItem from '../../components/ChapterListItem';
import EmptyState from '../../components/EmptyState';
import OfflineState from '../../components/OfflineState';
import PageHeader from '../../components/PageHeader';
import { getBook, getChapters } from '../../services/bookService';
import { isOfflineError } from '../../services/offlineCache';
import { bookPercent, chapterStatus, getProgress } from '../../services/progressService';
import { Book, BookProgress, Chapter, ChapterStatus } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [book, setBook] = useState<Book | null | undefined>(undefined); // undefined = cargando
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<BookProgress>();
  const [offline, setOffline] = useState(false); // sin conexión y sin copia guardada (EF1)

  usePageEnter(() => {
    setOffline(false);
    Promise.all([getBook(id!), getChapters(id!), getProgress()]).then(([b, c, store]) => {
      setBook(b ?? null);
      setChapters(c);
      setProgress(store[id!]);
    }).catch((err) => {
      if (!isOfflineError(err)) throw err;
      setBook(undefined);
      setOffline(true);
    });
  });

  const openChapter = (chapter: Chapter, status: ChapterStatus) => {
    if (status === 'locked') {
      presentToast({ message: 'Completa el capítulo anterior para desbloquear este.', duration: 2500, position: 'bottom' });
      return;
    }
    router.push(`/app/chapters/${chapter.id}`);
  };

  return (
    <IonPage>
      <PageHeader title={book?.title ?? 'Libro'} backHref="/app/home" />
      <IonContent className="ion-padding">
        <div className="page-container">
          {book === undefined && !offline && <IonSkeletonText animated className="skeleton-hero" />}
          {book === undefined && offline && (
            <OfflineState message="Este libro todavía no está guardado en tu dispositivo. Ábrelo cuando tengas internet y quedará disponible sin conexión." />
          )}

          {book === null && (
            <EmptyState icon={alertCircleOutline} title="Libro no encontrado" message="Puede que haya sido retirado de la biblioteca." />
          )}

          {book && (
            <IonGrid className="ion-no-padding">
              <IonRow>
                <IonCol size="12" sizeLg="5">
                  <div className="book-cover book-cover-large" style={{ background: book.coverColor }} aria-hidden="true">
                    <span>{book.title.charAt(0)}</span>
                  </div>
                  <h1 className="page-title">{book.title}</h1>
                  <p>{book.synopsis}</p>
                  <IonProgressBar
  value={bookPercent(chapters.length, progress)}
  aria-label={`Avance ${Math.round(bookPercent(chapters.length, progress) * 100)}%`}
/>
                  <p className="small-note">
                    {progress?.completedChapterIds.length ?? 0} de {chapters.length} capítulos completados
                  </p>
                </IonCol>
                <IonCol size="12" sizeLg="7">
                  <h2 className="section-title">Capítulos</h2>
                  {chapters.length === 0 ? (
                    <EmptyState icon={documentTextOutline} title="Sin capítulos" message="Este libro aún no tiene capítulos publicados." />
                  ) : (
                    <IonList inset>
                      {chapters.map((chapter, index) => (
                        <ChapterListItem
                          key={chapter.id}
                          chapter={chapter}
                          status={chapterStatus(chapters, index, progress)}
                          onSelect={openChapter}
                        />
                      ))}
                    </IonList>
                  )}
                </IonCol>
              </IonRow>
            </IonGrid>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BookDetailPage;
