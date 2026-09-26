/** Lectura de capítulo (RF-02). Figma: "Lectura del capítulo - Móvil". */
import {
  IonButton, IonContent, IonFooter, IonIcon, IonPage, IonProgressBar, IonSkeletonText, IonToolbar,
  useIonRouter, useIonToast,
} from '@ionic/react';
import { imageOutline, lockClosedOutline, playCircleOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { chaptersOf, getChapter, hasResources } from '../../services/bookService';
import { chapterStatus, completeChapter, getProgress, markChapterOpened } from '../../services/progressService';
import { Chapter } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const ChapterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [chapter, setChapter] = useState<Chapter | null | undefined>(undefined);
  const [siblings, setSiblings] = useState<Chapter[]>([]);
  const [locked, setLocked] = useState(false);

  usePageEnter(() => {
    Promise.all([getChapter(id!), getProgress(user!.id)]).then(([found, store]) => {
      if (!found) return setChapter(null);
      const bookChapters = chaptersOf(found.bookId);
      const status = chapterStatus(bookChapters, bookChapters.indexOf(found), store[found.bookId]);
      setSiblings(bookChapters);
      setLocked(status === 'locked');
      setChapter(found);
      // Guarda el último capítulo abierto para "Continúa donde lo dejaste".
      if (status !== 'locked') markChapterOpened(user!.id, found.bookId, found.id);
    });
  });

  const finishChapter = () => {
    if (!chapter) return;
    completeChapter(user!.id, chapter.bookId, chapter.id);
    const next = siblings.find((c) => c.number === chapter.number + 1);
    if (next) {
      router.push(`/app/chapters/${next.id}`);
    } else {
      presentToast({ message: '¡Terminaste el libro!', duration: 2500, color: 'success', position: 'top' });
      router.push(`/app/books/${chapter.bookId}`, 'back');
    }
  };

  const bookHref = chapter ? `/app/books/${chapter.bookId}` : '/app/home';

  return (
    <IonPage>
      <PageHeader title={chapter ? `Capítulo ${chapter.number}` : 'Capítulo'} backHref={bookHref} />
      {chapter && !locked && <IonProgressBar value={chapter.number / siblings.length} aria-hidden="true" />}

      <IonContent className="ion-padding">
        <article className="reading">
          {chapter === undefined && <IonSkeletonText animated className="skeleton-hero" />}

          {chapter === null && (
            <EmptyState icon={lockClosedOutline} title="Capítulo no encontrado" message="Vuelve al libro para elegir otro capítulo.">
              <IonButton routerLink="/app/home" routerDirection="root">Ir al inicio</IonButton>
            </EmptyState>
          )}

          {chapter && locked && (
            <EmptyState icon={lockClosedOutline} title="Capítulo bloqueado" message="Completa el capítulo anterior para continuar.">
              <IonButton routerLink={bookHref} routerDirection="back">Ver capítulos</IonButton>
            </EmptyState>
          )}

          {chapter && !locked && (
            <>
              <h1>{chapter.title}</h1>
              {chapter.paragraphs.map((text) => <p key={text}>{text}</p>)}

              <div className="illustration" role="img" aria-label={`Ilustración del capítulo ${chapter.number}`}>
                <IonIcon aria-hidden="true" icon={imageOutline} />
              </div>

              {hasResources(chapter.id) && (
                <IonButton fill="outline" expand="block" routerLink={`/app/chapters/${chapter.id}/resources`}>
                  <IonIcon aria-hidden="true" slot="start" icon={playCircleOutline} />
                  Ver recursos del capítulo
                </IonButton>
              )}
              <p className="small-note ion-text-center">{chapter.number} / {siblings.length}</p>
            </>
          )}
        </article>
      </IonContent>

      {chapter && !locked && (
        <IonFooter>
          <IonToolbar className="footer-actions">
            {chapter.simulationId ? (
              <IonButton expand="block" routerLink={`/app/simulation/${chapter.simulationId}`}>
                Ir a la simulación
              </IonButton>
            ) : (
              <IonButton expand="block" onClick={finishChapter}>
                Siguiente
              </IonButton>
            )}
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default ChapterPage;
