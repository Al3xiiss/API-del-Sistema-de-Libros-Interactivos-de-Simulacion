/**
 * Recursos multimedia (RF-07). Figma: "Multimedia - Móvil".
 * - /resources: todos los recursos (pestaña "Recursos").
 * - /chapters/:id/resources: solo los del capítulo, con botón para volver a la lectura.
 */
import {
  IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonNote, IonPage, IonSpinner,
  useIonRouter,
} from '@ionic/react';
import { headsetOutline, playCircleOutline, videocamOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import MediaPlayer from '../../components/MediaPlayer';
import OfflineState from '../../components/OfflineState';
import PageHeader from '../../components/PageHeader';
import { getResources } from '../../services/bookService';
import { isOfflineError } from '../../services/offlineCache';
import { Resource } from '../../types';
import { usePageEnter } from '../../hooks/usePageEnter';

const ResourcesPage: React.FC = () => {
  const { id: chapterId } = useParams<{ id?: string }>();
  const router = useIonRouter();
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [current, setCurrent] = useState<Resource>();
  const [offline, setOffline] = useState(false);

  usePageEnter(() => {
    setResources(null);
    setOffline(false);
    getResources(chapterId).then((list) => {
      setResources(list);
      setCurrent(list[0]);
    }).catch((err) => {
      if (!isOfflineError(err)) throw err;
      setOffline(true);
    });
  });

  const backToChapter = () => router.push(`/app/chapters/${chapterId}`, 'back');

  return (
    <IonPage>
      <PageHeader
        title={chapterId ? 'Recursos del capítulo' : 'Recursos'}
        backHref={chapterId ? `/app/chapters/${chapterId}` : undefined}
      />
      <IonContent className="ion-padding">
        <div className="page-container resources-layout">
          {resources === null && offline && (
            // Los videos y audios no se guardan en el dispositivo (EF1)
            <OfflineState message="Los videos y audios necesitan internet. Puedes seguir leyendo y verlos cuando vuelva la conexión.">
              {chapterId ? <IonButton onClick={backToChapter}>Volver al capítulo</IonButton> : undefined}
            </OfflineState>
          )}
          {resources === null && !offline && (
            <div className="loading-center"><IonSpinner aria-label="Cargando recursos" /></div>
          )}

          {resources?.length === 0 && (
            <EmptyState icon={playCircleOutline} title="Sin recursos" message="Este contenido aún no tiene recursos multimedia." />
          )}

          {current && (
            <section className="resources-player">
              <MediaPlayer resource={current} />
              <h1 className="page-title">{current.title}</h1>
              <p>{current.description}</p>
              {!current.url && (
                <IonNote className="small-note">Vista previa: este recurso todavía no tiene un archivo cargado.</IonNote>
              )}
              {chapterId && (
                <IonButton expand="block" onClick={backToChapter}>Continuar capítulo</IonButton>
              )}
            </section>
          )}

          {resources && resources.length > 1 && (
            <IonList inset className="resources-list" aria-label="Lista de recursos">
              {resources.map((resource) => (
                <IonItem
                  key={resource.id}
                  button
                  detail={false}
                  onClick={() => setCurrent(resource)}
                  className={resource.id === current?.id ? 'selected' : ''}
                >
                  <IonIcon aria-hidden="true" slot="start" icon={resource.type === 'video' ? videocamOutline : headsetOutline} />
                  <IonLabel>
                    <h2>{resource.title}</h2>
                    <p>{resource.type === 'video' ? 'Video' : 'Audio'} · {Math.ceil(resource.durationSeconds / 60)} min</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ResourcesPage;
