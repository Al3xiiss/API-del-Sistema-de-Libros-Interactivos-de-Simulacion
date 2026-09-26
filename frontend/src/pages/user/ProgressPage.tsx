/** Consulta de progreso propio (RF-06). Figma: "Mi progreso - Móvil". */
import {
  IonButton, IonCard, IonCardContent, IonCol, IonContent, IonGrid, IonPage, IonProgressBar, IonRow,
  IonSkeletonText,
} from '@ionic/react';
import { statsChartOutline } from 'ionicons/icons';
import { useState } from 'react';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { chaptersOf, getBooks } from '../../services/bookService';
import { bookPercent, getProgress } from '../../services/progressService';
import { Book, BookProgress, Chapter } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

interface Row {
  book: Book;
  chapters: Chapter[];
  progress: BookProgress;
}

const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);

  usePageEnter(() => {
    Promise.all([getBooks(), getProgress(user!.id)]).then(([books, store]) => {
      setRows(
        books
          .filter((book) => store[book.id])
          .map((book) => ({ book, chapters: chaptersOf(book.id), progress: store[book.id] })),
      );
    });
  });

  const totals = (rows ?? []).reduce(
    (acc, { chapters, progress }) => ({
      completed: acc.completed + progress.completedChapterIds.length,
      pending: acc.pending + chapters.length - progress.completedChapterIds.length,
      decisions: acc.decisions + Object.keys(progress.decisions).length,
    }),
    { completed: 0, pending: 0, decisions: 0 },
  );

  return (
    <IonPage>
      <PageHeader title="Mi progreso" />
      <IonContent className="ion-padding">
        <div className="page-container">
          {rows === null && <IonSkeletonText animated className="skeleton-hero" />}

          {rows?.length === 0 && (
            <EmptyState icon={statsChartOutline} title="Aún no hay estadísticas" message="Inicia tu primer libro para ver tu avance aquí.">
              <IonButton routerLink="/app/home" routerDirection="root">Ir a la biblioteca</IonButton>
            </EmptyState>
          )}

          {rows && rows.length > 0 && (
            <>
              <IonGrid className="ion-no-padding">
                <IonRow>
                  {[
                    { label: 'Capítulos completados', value: totals.completed },
                    { label: 'Capítulos pendientes', value: totals.pending },
                    { label: 'Decisiones tomadas', value: totals.decisions },
                  ].map((stat) => (
                    <IonCol size="4" key={stat.label}>
                      <IonCard className="stat-card">
                        <IonCardContent>
                          <span className="stat-value">{stat.value}</span>
                          <span className="stat-label">{stat.label}</span>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>

              <h2 className="section-title">Por libro</h2>
              {rows.map(({ book, chapters, progress }) => {
                const percent = bookPercent(chapters.length, progress);
                const last = chapters.find((c) => c.id === progress.lastChapterId);
                return (
                  <IonCard key={book.id}>
                    <IonCardContent>
                      <h3 className="card-title">{book.title}</h3>
                      <div className="progress-line">
                        <IonProgressBar value={percent} aria-hidden="true" />
                        <strong>{Math.round(percent * 100)}%</strong>
                      </div>
                      <p>{progress.completedChapterIds.length}/{chapters.length} capítulos completados</p>
                      {last && <p>Última lectura: Capítulo {last.number}</p>}
                      {last && (
                        <IonButton fill="outline" routerLink={`/app/chapters/${last.id}`}>Continuar leyendo</IonButton>
                      )}
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProgressPage;
