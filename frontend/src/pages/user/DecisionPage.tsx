/**
 * Toma de decisiones (RF-06). Figma: "Toma de decisiones - Móvil".
 * Primero se selecciona una tarjeta y luego se confirma (evita toques accidentales).
 */
import {
  IonButton, IonCard, IonCardContent, IonCol, IonContent, IonFooter, IonGrid, IonPage, IonRow,
  IonSkeletonText, IonToolbar, useIonRouter, useIonToast,
} from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DecisionOptionCard from '../../components/DecisionOptionCard';
import EmptyState from '../../components/EmptyState';
import OfflineState from '../../components/OfflineState';
import PageHeader from '../../components/PageHeader';
import { getChapter, getChapters, getSimulation, getSimulations } from '../../services/bookService';
import { getCharacter } from '../../services/characterService';
import { isOfflineError } from '../../services/offlineCache';
import { completeChapter, getProgress, saveDecision } from '../../services/progressService';
import { Chapter, Character, Simulation } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const LETTERS = ['A', 'B', 'C', 'D'];

const DecisionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const [simulation, setSimulation] = useState<Simulation | null | undefined>(undefined);
  const [chapter, setChapter] = useState<Chapter>();
  const [nextChapter, setNextChapter] = useState<Chapter>();
  const [character, setCharacter] = useState<Character>();
  const [selected, setSelected] = useState<string>();
  const [confirmed, setConfirmed] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [offline, setOffline] = useState(false); // sin conexión y sin copia guardada (EF1)
  const [counter, setCounter] = useState({ current: 0, total: 0 });

  usePageEnter(() => {
    setSelected(undefined);
    setConfirmed(false);
    setOffline(false);
    getSimulation(id!).then(async (sim) => {
      if (!sim) return setSimulation(null);
      const [current, person, store] = await Promise.all([
        getChapter(sim.chapterId), getCharacter(sim.characterId), getProgress(),
      ]);
      if (!current) return setSimulation(null);
      const bookId = current.bookId;
      const [chapters, bookSims] = await Promise.all([getChapters(bookId), getSimulations(bookId)]);
      setChapter(current);
      setNextChapter(chapters.find((c) => c.number === current.number + 1));
      setAlreadyCompleted(store[bookId]?.completedChapterIds.includes(current.id) ?? false);
      setCharacter(person);
      setCounter({ current: bookSims.findIndex((s) => s.id === sim.id) + 1, total: bookSims.length });
      // Si ya decidió antes, se muestra su elección anterior.
      const previous = store[bookId]?.decisions[sim.id];
      if (previous) {
        setSelected(previous);
        setConfirmed(true);
      }
      setSimulation(sim);
    }).catch((err) => {
      if (!isOfflineError(err)) throw err;
      setSimulation(undefined);
      setOffline(true);
    });
  });

  const confirm = async () => {
    if (!simulation || !chapter || !selected) return;
    setSaving(true);
    try {
      await saveDecision(simulation.id, selected);
      await completeChapter(chapter.id);
      setConfirmed(true);
      // Aviso de capítulo desbloqueado (EF1)
      if (nextChapter && !alreadyCompleted) {
        presentToast({ message: `Desbloqueaste el capítulo ${nextChapter.number}: ${nextChapter.title}`, duration: 2500, color: 'success', position: 'top' });
      }
    } catch (err) {
      presentToast({ message: (err as Error).message, duration: 3000, color: 'danger', position: 'top' });
    } finally {
      setSaving(false);
    }
  };

  const outcome = simulation?.options.find((o) => o.id === selected)?.outcome;

  return (
    <IonPage>
      <PageHeader title="Simulación" backHref={`/app/simulation/${id}`} />
      <IonContent className="ion-padding">
        <div className="reading">
          {simulation === undefined && !offline && <IonSkeletonText animated className="skeleton-hero" />}
          {simulation === undefined && offline && (
            <OfflineState message="Esta simulación todavía no está guardada en tu dispositivo. Ábrela cuando tengas internet y quedará disponible sin conexión." />
          )}
          {simulation === null && (
            <EmptyState icon={alertCircleOutline} title="Decisión no disponible" message="Vuelve al capítulo e inténtalo de nuevo." />
          )}

          {simulation && (
            <>
              <p className="eyebrow">{character?.name ?? 'Personaje'}</p>
              <h1>{simulation.question}</h1>

              <IonGrid className="ion-no-padding">
                <IonRow>
                  {simulation.options.map((option, index) => (
                    <IonCol size="12" sizeMd="6" key={option.id}>
                      <DecisionOptionCard
                        option={option}
                        letter={LETTERS[index]}
                        selected={selected === option.id}
                        disabled={confirmed}
                        onSelect={() => setSelected(option.id)}
                      />
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>

              {confirmed && outcome && (
                <IonCard color="light" className="outcome-card" role="status">
                  <IonCardContent>
                    <strong>Lo que ocurrió</strong>
                    <p>{outcome}</p>
                  </IonCardContent>
                </IonCard>
              )}

              <p className="small-note ion-text-center">Decisión {counter.current} de {counter.total} en este libro</p>
            </>
          )}
        </div>
      </IonContent>

      {simulation && (
        <IonFooter>
          <IonToolbar className="footer-actions">
            {!confirmed ? (
              <IonButton expand="block" disabled={!selected || saving} onClick={confirm}>
                {saving ? 'Guardando…' : 'Confirmar decisión'}
              </IonButton>
            ) : nextChapter ? (
              <IonButton expand="block" onClick={() => router.push(`/app/chapters/${nextChapter.id}`)}>
                Continuar al capítulo {nextChapter.number}
              </IonButton>
            ) : (
              <IonButton expand="block" onClick={() => router.push(`/app/books/${chapter?.bookId}`, 'back')}>
                Volver al libro
              </IonButton>
            )}
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default DecisionPage;
