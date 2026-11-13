/** Lectura de capítulo (RF-04). Figma: "Lectura del capítulo - Móvil". */
import {
  IonButton, IonContent, IonFooter, IonIcon, IonPage, IonProgressBar, IonSkeletonText, IonToolbar,
  useIonRouter, useIonToast,
} from '@ionic/react';
import { imageOutline, lockClosedOutline, playCircleOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import OfflineState from '../../components/OfflineState';
import PageHeader from '../../components/PageHeader';
import { getChapter, getChapters } from '../../services/bookService';
import { isOfflineError } from '../../services/offlineCache';
import { chapterStatus, completeChapter, getProgress, markChapterOpened } from '../../services/progressService';
import { Chapter } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const ChapterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [chapter, setChapter] = useState<Chapter | null | undefined>(undefined);
  const [siblings, setSiblings] = useState<Chapter[]>([]);
  const [locked, setLocked] = useState(false);
  // Si ya estaba completado, "Siguiente" no desbloquea nada nuevo
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  // Sin conexión y sin copia guardada de este capítulo (EF1)
  const [unavailableOffline, setUnavailableOffline] = useState(false);

  usePageEnter(() => {
    setUnavailableOffline(false);
    Promise.all([getChapter(id!), getProgress()]).then(async ([found, store]) => {
      if (!found) return setChapter(null);
      const bookChapters = await getChapters(found.bookId);
      const index = bookChapters.findIndex((c) => c.id === found.id);
      const status = chapterStatus(bookChapters, index, store[found.bookId]);
      setSiblings(bookChapters);
      setLocked(status === 'locked');
      setAlreadyCompleted(status === 'completed');
      setChapter(found);
      // Guarda el último capítulo abierto para "Continúa donde lo dejaste".
      // Si falla, solo se pierde el "Continúa donde lo dejaste"; la lectura sigue.
      if (status !== 'locked') markChapterOpened(found.id).catch(() => undefined);
    }).catch((err) => {
      // Sin conexión y sin copia de este capítulo en el dispositivo
      if (isOfflineError(err)) {
        setChapter(undefined);
        setUnavailableOffline(true);
      } else {
        throw err;
      }
    });
  });

  const finishChapter = async () => {
    if (!chapter) return;
    // Se espera a que la API guarde el avance: así el siguiente capítulo ya aparece desbloqueado.
    try {
      await completeChapter(chapter.id);
    } catch (err) {
      presentToast({ message: (err as Error).message, duration: 3000, color: 'danger', position: 'top' });
      return;
    }
    const next = siblings.find((c) => c.number === chapter.number + 1);
    if (next) {
      router.push(`/app/chapters/${next.id}`);
      // Aviso de capítulo desbloqueado (EF1)
      if (!alreadyCompleted) {
        presentToast({ message: `Desbloqueaste el capítulo ${next.number}: ${next.title}`, duration: 2500, color: 'success', position: 'top' });
      }
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
          {chapter === undefined && !unavailableOffline && <IonSkeletonText animated className="skeleton-hero" />}

          {chapter === undefined && unavailableOffline && (
            <OfflineState message="Este capítulo todavía no está guardado en tu dispositivo. Ábrelo cuando tengas internet y quedará disponible sin conexión." />
          )}

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

              {(chapter.resourceCount ?? 0) > 0 && (
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
