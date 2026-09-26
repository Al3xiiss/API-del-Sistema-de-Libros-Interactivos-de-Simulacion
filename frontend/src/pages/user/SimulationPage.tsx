/** Inicio de la simulación (RF-03). Figma: "Simulación - Móvil". */
import {
  IonAvatar, IonButton, IonCard, IonCardContent, IonContent, IonPage, IonSkeletonText,
} from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import PageHeader from '../../components/PageHeader';
import { getChapter, getSimulation } from '../../services/bookService';
import { getCharacter } from '../../services/characterService';
import { Chapter, Character, Simulation } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const SimulationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [simulation, setSimulation] = useState<Simulation | null | undefined>(undefined);
  const [chapter, setChapter] = useState<Chapter>();
  const [character, setCharacter] = useState<Character>();

  usePageEnter(() => {
    getSimulation(id!).then(async (sim) => {
      if (!sim) return setSimulation(null);
      const [ch, person] = await Promise.all([getChapter(sim.chapterId), getCharacter(sim.characterId)]);
      setChapter(ch);
      setCharacter(person);
      setSimulation(sim);
    });
  });

  return (
    <IonPage>
      <PageHeader
        title={chapter ? `Capítulo ${chapter.number}` : 'Simulación'}
        backHref={chapter ? `/app/chapters/${chapter.id}` : '/app/home'}
      />
      <IonContent className="ion-padding">
        <div className="reading ion-text-center">
          {simulation === undefined && <IonSkeletonText animated className="skeleton-hero" />}
          {simulation === null && (
            <EmptyState icon={alertCircleOutline} title="Simulación no disponible" message="Vuelve al capítulo e inténtalo de nuevo." />
          )}

          {simulation && (
            <>
              <p className="eyebrow">Simulación</p>
              <IonCard className="character-card">
                <IonCardContent>
                  <IonAvatar className="character-avatar" aria-hidden="true">
                    <span>{character?.name.charAt(0) ?? '?'}</span>
                  </IonAvatar>
                  <h2>{character?.name ?? 'Personaje'}</h2>
                  {character && <p>{character.description}</p>}
                </IonCardContent>
              </IonCard>
              <p className="lead">{simulation.context}</p>
              <IonButton expand="block" routerLink={`/app/decision/${simulation.id}`}>
                Iniciar simulación
              </IonButton>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SimulationPage;
