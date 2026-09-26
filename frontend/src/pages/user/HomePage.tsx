/** Inicio del paciente y biblioteca (RF-02). Figma: "Mis Libros - Móvil". */
import {
  IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonPage, IonProgressBar,
  IonRow, IonSearchbar, IonSkeletonText,
} from '@ionic/react';
import { libraryOutline, searchOutline } from 'ionicons/icons';
import { useState } from 'react';
import BookCard from '../../components/BookCard';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { chaptersOf, getBooks } from '../../services/bookService';
import { bookPercent, getProgress } from '../../services/progressService';
import { Book, Chapter, ProgressStore } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

interface LibraryItem {
  book: Book;
  chapters: Chapter[];
  percent: number;
}

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [library, setLibrary] = useState<LibraryItem[] | null>(null);
  const [progress, setProgress] = useState<ProgressStore>({});
  const [query, setQuery] = useState('');

  // Se recarga cada vez que la vista entra, para reflejar el avance reciente.
  usePageEnter(() => {
    Promise.all([getBooks(), getProgress(user!.id)]).then(([books, store]) => {
      setProgress(store);
      setLibrary(books.map((book) => {
        const chapters = chaptersOf(book.id);
        return { book, chapters, percent: bookPercent(chapters.length, store[book.id]) };
      }));
    });
  });

  // Último libro leído: el progreso actualizado más recientemente.
  const lastRead = library
    ?.filter((item) => progress[item.book.id]?.lastChapterId)
    .sort((a, b) => progress[b.book.id].updatedAt.localeCompare(progress[a.book.id].updatedAt))[0];
  const lastChapter = lastRead?.chapters.find((c) => c.id === progress[lastRead.book.id].lastChapterId);

  const filtered = library?.filter((item) => item.book.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <IonPage>
      <PageHeader title="Mis libros" />
      <IonContent className="ion-padding">
        <div className="page-container">
          <h1 className="page-title">Hola, {user?.alias}</h1>

          {/* "Continúa donde lo dejaste" o estado vacío del primer acceso */}
          {library === null ? (
            <IonSkeletonText animated className="skeleton-hero" />
          ) : lastRead && lastChapter ? (
            <IonCard className="continue-card">
              <IonCardContent>
                <p className="eyebrow">Continúa donde lo dejaste</p>
                <h2>{lastRead.book.title}</h2>
                <p>Capítulo {lastChapter.number} de {lastRead.chapters.length}: {lastChapter.title}</p>
                <IonProgressBar value={lastRead.percent} />
                <IonButton expand="block" routerLink={`/app/chapters/${lastChapter.id}`}>
                  Continuar leyendo
                </IonButton>
              </IonCardContent>
            </IonCard>
          ) : (
            <EmptyState
              icon={libraryOutline}
              title="Tu biblioteca te espera"
              message="Elige una historia de la lista para comenzar. Puedes leer a tu ritmo y pausar cuando quieras."
            />
          )}

          <h2 className="section-title">Biblioteca</h2>
          <IonSearchbar
            value={query}
            onIonInput={(e) => setQuery(e.detail.value ?? '')}
            placeholder="Buscar libro"
            aria-label="Buscar libro"
          />

          <IonGrid className="ion-no-padding">
            <IonRow>
              {library === null &&
                [1, 2, 3].map((n) => (
                  <IonCol size="12" sizeMd="6" sizeXl="4" key={n}>
                    <IonSkeletonText animated className="skeleton-card" />
                  </IonCol>
                ))}
              {filtered?.map(({ book, chapters, percent }) => (
                <IonCol size="12" sizeMd="6" sizeXl="4" key={book.id}>
                  <BookCard book={book} chapterCount={chapters.length} percent={percent} />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>

          {filtered?.length === 0 && (
            <EmptyState icon={searchOutline} title="Sin resultados" message={`No encontramos libros con "${query}".`} />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
